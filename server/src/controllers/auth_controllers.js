import User from "../models/user.js";
import PasswordHistory from "../models/password_history.js";
import { isPasswordValid } from "../utils/password_requirements.js";
import { generateCaptcha, verifyCaptchaToken } from "./captcha_controller.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import crypto from "crypto";
import { sendVerificationCode } from "./email_controller.js";

const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const LOCKOUT_MINUTES = Number(process.env.LOCKOUT_MINUTES) || 15;

// Shared Argon2id config — OWASP recommended
const ARGON2 = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

// Shared cookie base — same flags every time prevents mismatch bugs
const cookieBase = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
});

// ── Captcha ───────────────────────────────────────────────────────
export const getCaptcha = async (req, res) => {
  try {
    const { token, imageDataUri } = generateCaptcha();
    res.json({ token, imageDataUri });
  } catch (err) {
    console.error("[Captcha] Generation failed:", err.message);
    res.status(500).json({ error: "Could not generate CAPTCHA. Please try again." });
  }
};

// ── Register ──────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { username, email, password, captchaToken, captchaAnswer } = req.body;

    // 1. CAPTCHA — before any DB work
    const captchaResult = verifyCaptchaToken(captchaToken, captchaAnswer);
    if (!captchaResult.valid) {
      return res.status(403).json({ error: captchaResult.reason });
    }

    // 2. Password policy
    if (!isPasswordValid(password)) {
      return res.status(400).json({ error: "Password does not meet security requirements." });
    }

    // 3. Duplicate check — generic message prevents user enumeration
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ error: "Registration failed. Please try again." });
    }

    // 4. Hash with Argon2id
    const hashedPassword = await argon2.hash(password, ARGON2);

    // 5. Create user
    const newUser = new User({
      username,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isMfaActive: false,
      failedAttempts: 0,
      lockedUntil: null,
      passwordChangedAt: new Date(),
    });
    await newUser.save();

    // 6. Store first password history entry
    await PasswordHistory.create({
      userId: newUser._id,
      passwordHash: hashedPassword,
      createdAt: new Date(),
    });

    // Send activation OTP immediately — account not usable until verified
    const otp = String(crypto.randomInt(100000, 999999));
    const expiry = new Date(Date.now() + 2 * 60 * 1000);
    const otpHash = await argon2.hash(otp, ARGON2);

    newUser.activationOtp = otpHash;
    newUser.activationOtpExpiry = expiry;
    await newUser.save();

    await sendVerificationCode(newUser.email, otp);

    return res.status(201).json({
      message: "Account created. Check your email for an activation code.",
    });

  } catch (e) {
    console.error("Registration error:", e);
    return res.status(500).json({ error: "Error creating new user." });
  }
};

// ── Login (Phase 1 — password only) ──────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password, captchaToken, captchaAnswer } = req.body;

    // 1. CAPTCHA first — drops bots before any DB query
    const captchaResult = verifyCaptchaToken(captchaToken, captchaAnswer);
    if (!captchaResult.valid) {
      return res.status(403).json({ error: captchaResult.reason });
    }

    // 2. Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user && !user.isVerified) {
      return res.status(403).json({
        error: "Please verify your email before logging in.",
        needsVerify: true,   // frontend uses this to show the OTP screen
      });
    }

    // 3. Lockout check
    if (user?.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 4. Timing-safe password check
    //    Verify against dummy hash if user not found — prevents timing attacks
    const dummyHash = await argon2.hash("dummy-timing-prevention", ARGON2);
    const hashToCheck = user?.password ?? dummyHash;
    const isMatch = await argon2.verify(hashToCheck, password);

    // 5. Handle failure
    if (!user || !isMatch) {
      if (user) {
        const attempts = (user.failedAttempts ?? 0) + 1;
        const shouldLock = attempts >= MAX_LOGIN_ATTEMPTS;
        await User.findByIdAndUpdate(user._id, {
          failedAttempts: attempts,
          lockedUntil: shouldLock
            ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
            : null,
        });
      }
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 6. Success — reset lockout counters
    await User.findByIdAndUpdate(user._id, {
      failedAttempts: 0,
      lockedUntil: null,
    });

    // 7a. MFA active — issue temp token only, NOT a full session
    if (user.isMfaActive) {
      const tempToken = jwt.sign(
        { sub: user._id.toString(), purpose: "mfa_pending" },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );
      res.cookie("mfa_pending", tempToken, {
        ...cookieBase(),
        maxAge: 5 * 60 * 1000,
      });
      return res.status(200).json({ mfaRequired: true });
    }

    // 7b. No MFA — issue full session cookies immediately
    issueSessionCookies(res, user._id.toString());

    return res.status(200).json({
      message: "Login successful.",
      mfaRequired: false,
    });

  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ error: "Login failed. Please try again." });
  }
};

// ── Send activation OTP (called right after register) ─────────────
export const sendActivationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Generic — don't confirm whether email exists
      return res.status(200).json({ message: "If that email exists, a code was sent." });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Account already verified." });
    }

    // ── Generate OTP ──────────────────────────────────────────────
    const otp = String(crypto.randomInt(100000, 999999));
    const expiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes per spec
    const otpHash = await argon2.hash(otp, ARGON2);

    user.activationOtp = otpHash;
    user.activationOtpExpiry = expiry;
    await user.save();

    await sendVerificationCode(user.email, otp);

    return res.status(200).json({
      message: "Activation code sent. It expires in 2 minutes.",
    });

  } catch (e) {
    console.error("Send activation OTP error:", e);
    return res.status(500).json({ error: "Failed to send activation code." });
  }
};

// ── Verify activation OTP ─────────────────────────────────────────
export const verifyActivationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || user.isVerified) {
      return res.status(400).json({ error: "Invalid request." });
    }

    // Check OTP exists
    if (!user.activationOtp || !user.activationOtpExpiry) {
      return res.status(400).json({
        error: "No activation code found. Please request a new one.",
      });
    }

    // Check expiry — 2 minute window
    if (new Date() > new Date(user.activationOtpExpiry)) {
      user.activationOtp = null;
      user.activationOtpExpiry = null;
      await user.save();
      return res.status(400).json({
        error: "Code expired. Please request a new one.",
      });
    }

    // Verify
    const isMatch = await argon2.verify(user.activationOtp, otp);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect activation code." });
    }

    // Activate account — clear OTP fields
    user.isVerified = true;
    user.activationOtp = null;
    user.activationOtpExpiry = null;
    await user.save();

    return res.status(200).json({ message: "Account activated. You can now log in." });

  } catch (e) {
    console.error("Verify activation OTP error:", e);
    return res.status(500).json({ error: "Failed to verify activation code." });
  }
};

// ── Refresh ───────────────────────────────────────────────────────
export const refresh = async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;

    if (!token) {
      return res.status(401).json({ error: "No refresh token." });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      res.clearCookie("refresh_token", cookieBase());
      return res.status(401).json({ error: "Session expired. Please log in again." });
    }

    if (payload.purpose !== "refresh") {
      return res.status(401).json({ error: "Invalid token." });
    }

    const newAccessToken = jwt.sign(
      { sub: payload.sub, purpose: "access" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("access_token", newAccessToken, {
      ...cookieBase(),
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ message: "Token refreshed." });

  } catch (e) {
    console.error("Refresh error:", e);
    return res.status(500).json({ error: "Could not refresh session." });
  }
};

// ── Status ────────────────────────────────────────────────────────
export const status = async (req, res) => {
  try {
    // req.user is full Mongoose doc from authGuard
    const user = await User.findById(req.user._id).select(
      "username email isMfaActive passwordChangedAt createdAt"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const EXPIRY_DAYS = Number(process.env.PASSWORD_EXPIRY_DAYS) || 90;
    const expiryDate = new Date(user.passwordChangedAt);
    expiryDate.setDate(expiryDate.getDate() + EXPIRY_DAYS);
    const passwordExpired = new Date() > expiryDate;

    return res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isMfaActive: user.isMfaActive,
        passwordExpired,
        memberSince: user.createdAt,
      },
    });

  } catch (e) {
    console.error("Status error:", e);
    return res.status(500).json({ error: "Could not retrieve status." });
  }
};

// ── Logout ────────────────────────────────────────────────────────
export const logout = async (req, res) => {
  try {
    res.clearCookie("access_token", cookieBase());
    res.clearCookie("refresh_token", cookieBase());
    res.clearCookie("mfa_pending", cookieBase());
    return res.status(200).json({ message: "Logged out successfully." });
  } catch (e) {
    console.error("Logout error:", e);
    return res.status(500).json({ error: "Logout failed." });
  }
};

// ── 2FA Setup — generates secret + QR, does NOT activate MFA yet ─
export const setup2fa = async (req, res) => {
  try {
    const user = req.user; // full Mongoose doc from authGuard
    const secret = speakeasy.generateSecret({ length: 20 });

    // Save secret but keep isMfaActive false until user verifies a code
    user.mfaSecret = secret.base32;
    user.isMfaActive = false;
    await user.save();

    const url = speakeasy.otpauthURL({
      secret: secret.base32,
      label: user.username,
      issuer: "SecureAuth",
      encoding: "base32",
    });

    const qrCode = await qrcode.toDataURL(url);

    return res.status(200).json({
      secret: secret.base32,   // show as text backup in case QR fails
      qrCode,                  // base64 PNG — render as <img src={qrCode} />
    });

  } catch (e) {
    console.error("MFA setup error:", e);
    return res.status(500).json({ error: "Error setting up 2FA." });
  }
};

// ── 2FA Verify — validates TOTP, activates MFA, issues session ───
export const verify2fa = async (req, res) => {
  try {
    const { token } = req.body;
    const user = req.user; // full Mongoose doc from mfaPendingGuard

    if (!user.mfaSecret) {
      return res.status(400).json({ error: "MFA not set up. Run setup first." });
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: "base32",
      token,
      window: 1,   // ±30s tolerance for clock drift
    });

    if (!verified) {
      return res.status(400).json({ error: "Invalid 2FA token. Please try again." });
    }

    // First time verifying after setup — activate MFA now that user proved it works
    if (!user.isMfaActive) {
      user.isMfaActive = true;
      await user.save();
    }

    // Clear the temp MFA cookie and issue real session cookies
    res.clearCookie("mfa_pending", cookieBase());
    issueSessionCookies(res, user._id.toString());

    return res.status(200).json({ message: "2FA verified. Login complete." });

  } catch (e) {
    console.error("MFA verify error:", e);
    return res.status(500).json({ error: "Error verifying 2FA." });
  }
};

// ── 2FA Reset — disables MFA, clears secret ──────────────────────
export const reset2fa = async (req, res) => {
  try {
    const user = req.user;
    user.mfaSecret = null;
    user.isMfaActive = false;
    await user.save();
    return res.status(200).json({ message: "2FA disabled successfully." });
  } catch (e) {
    console.error("MFA reset error:", e);
    return res.status(500).json({ error: "Error resetting 2FA." });
  }
};

function issueSessionCookies(res, userId) {
  const accessToken = jwt.sign(
    { sub: userId, purpose: "access" },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    { sub: userId, purpose: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  res.cookie("access_token", accessToken, { ...cookieBase(), maxAge: 15 * 60 * 1000 });
  res.cookie("refresh_token", refreshToken, { ...cookieBase(), maxAge: 7 * 24 * 60 * 60 * 1000 });
}