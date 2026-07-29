import User            from "../models/user.js";
import PasswordHistory  from "../models/password_history.js";
import ActivityLog from "../models/activity_log.js";
import { auditLog, EVENTS } from "../utils/audit_log.js";
import { sendSuccess, sendError } from "../utils/construct_response.js";
import { isPasswordValid }        from "../utils/password_requirements.js";
import { generateCaptcha, verifyCaptchaToken } from "./captcha_controller.js";
import { sendVerificationCode }   from "./email_controller.js";
import catch_async  from "../utils/catch_async.js";
import generatedOtp from "../utils/generate_otp.js";
import argon2    from "argon2";
import jwt       from "jsonwebtoken";
import speakeasy from "speakeasy";
import qrcode    from "qrcode";

// Config
const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const LOCKOUT_MINUTES = Number(process.env.LOCKOUT_MINUTES) || 15;
const PASSWORD_HISTORY_LIMIT = 5;

const ARGON2 = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
};

const cookieBase = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
});

// Shared helpers
function issueSessionCookies(res, userId) {
  const accessToken = jwt.sign(
    { sub: userId, purpose: "access" },
    process.env.JWT_SECRET,
    { expiresIn: "10m" }
  );
  res.cookie("access_token", accessToken, {
    ...cookieBase(),
    maxAge: 10 * 60 * 1000,
  });
}

async function saveNewPassword(user, newPassword) {
  const hashedPassword = await argon2.hash(newPassword, ARGON2);
  user.password = hashedPassword;
  user.passwordChangedAt = new Date();
  await user.save();
  await PasswordHistory.create({
    userId:       user._id,
    passwordHash: hashedPassword,
    createdAt:    new Date(),
  });
  return hashedPassword;
}

async function isPasswordReused(userId, newPassword) {
  const history = await PasswordHistory
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(PASSWORD_HISTORY_LIMIT);

  for (const entry of history) {
    const reused = await argon2.verify(entry.passwordHash, newPassword);
    if (reused) return true;
  }
  return false;
}

async function sendOtpToUser(user, otpField, expiryField, ttlMs = 2 * 60 * 1000) {
  const { otp, otpHash } = await generatedOtp();
  user[otpField] = otpHash;
  user[expiryField]= new Date(Date.now() + ttlMs);
  await user.save();
  await sendVerificationCode(user.email, otp);
}

async function verifyStoredOtp(user, otp, otpField, expiryField) {
  if (!user[otpField] || !user[expiryField]) {
    return { valid: false, error: "No code found. Please request a new one." };
  }
  if (new Date() > new Date(user[expiryField])) {
    user[otpField] = null;
    user[expiryField]= null;
    await user.save();
    return { valid: false, error: "Code expired. Please request a new one." };
  }
  const isMatch = await argon2.verify(user[otpField], otp);
  if (!isMatch) {
    return { valid: false, error: "Incorrect code." };
  }
  return { valid: true };
}

// Get Captcha
export const getCaptcha = catch_async(async (req, res) => {
  const { token, imageDataUri } = generateCaptcha();
  return sendSuccess(res, "CAPTCHA generated.", { token, imageDataUri });
});

// Register
export const register = catch_async(async (req, res) => {
  const { username, email, password, captchaToken, captchaAnswer } = req.body;

  // create captcha
  const captcha = verifyCaptchaToken(captchaToken, captchaAnswer);
  if (!captcha.valid) return sendError(res, captcha.reason, 403);

  // check password is valid
  if (!isPasswordValid(password)) {
    return sendError(res, "Password does not meet security requirements.", 400);
  }

  // Duplicate user check
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) return sendError(res, "User already exists with the email.", 400);

  // Hash and create user
  const hashedPassword = await argon2.hash(password, ARGON2);
  const newUser = await User.create({
    username,
    email:             email.toLowerCase().trim(),
    password:          hashedPassword,
    isMfaActive:       false,
    failedAttempts:    0,
    lockedUntil:       null,
    passwordChangedAt: new Date(),
  });

  // First password history entry
  await PasswordHistory.create({
    userId:       newUser._id,
    passwordHash: hashedPassword,
    createdAt:    new Date(),
  });

  // Send activation OTP
  await sendOtpToUser(newUser, "activationOtp", "activationOtpExpiry");

  await auditLog(newUser._id, EVENTS.REGISTER_SUCCESS);

  return sendSuccess(
    res,
    "Account created. Check your email for an activation code.",
    {},
    201
  );
});

// send activation otp code via email
export const sendActivationOtp = catch_async(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user || user.isVerified) {
    return sendSuccess(res, "If that email exists, a code was sent.");
  }

  await sendOtpToUser(user, "activationOtp", "activationOtpExpiry");

  return sendSuccess(res, "Activation code sent. It expires in 2 minutes.");
});

// Verify activation otp code
export const verifyActivationOtp = catch_async(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user || user.isVerified) {
    return sendError(res, "Invalid request.", 400);
  }

  const result = await verifyStoredOtp(user, otp, "activationOtp", "activationOtpExpiry");
  if (!result.valid) return sendError(res, result.error, 400);

  // Activate account
  user.isVerified      = true;
  user.activationOtp   = null;
  user.activationOtpExpiry = null;
  await user.save();

  return sendSuccess(res, "Account activated. You can now log in.");
});

// Login
export const login = catch_async(async (req, res) => {
  const { email, password, captchaToken, captchaAnswer } = req.body;

  // create captcha
  const captcha = verifyCaptchaToken(captchaToken, captchaAnswer);
  if (!captcha.valid) return sendError(res, captcha.reason, 403);

  // Find user
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  // Block unverified accounts
  if (user && !user.isVerified) {
    return sendError(res, "Please verify your email before logging in.", 403);
  }

  // Lockout check
  if (user?.lockedUntil && new Date() < new Date(user.lockedUntil)) {
    return sendError(res, "Invalid credentials.", 401);
  }

  // password check
  const dummyHash  = await argon2.hash("dummy-timing-prevention", ARGON2);
  const hashToCheck = user?.password ?? dummyHash;
  const isMatch    = await argon2.verify(hashToCheck, password);

  // failure
  if (!user || !isMatch) {
    if (user) {
      const attempts   = (user.failedAttempts ?? 0) + 1;
      const shouldLock = attempts >= MAX_LOGIN_ATTEMPTS;
      await User.findByIdAndUpdate(user._id, {
        failedAttempts: attempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
          : null,
      });
      await auditLog(
        user._id,
        shouldLock ? EVENTS.ACCOUNT_LOCKED : EVENTS.LOGIN_FAILED,
        { ip: req.ip, attempts }
      );
    }
    return sendError(res, "Invalid credentials.", 401);
  }

  // Success
  await User.findByIdAndUpdate(user._id, {
    failedAttempts: 0,
    lockedUntil:    null,
    lastLoginAt:    new Date(),
  });

  // if MFA required or not
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
    return sendSuccess(res, "MFA required.", { mfaRequired: true });
  }

  // create session
  issueSessionCookies(res, user._id.toString());
  await auditLog(user._id, EVENTS.LOGIN_SUCCESS, { ip: req.ip });

  return sendSuccess(res, "Login successful.", { mfaRequired: false });
});

// Check status
export const status = catch_async(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "username email isMfaActive passwordChangedAt createdAt lastLoginAt"
  );

  if (!user) return sendError(res, "User not found.", 404);

  const EXPIRY_DAYS     = Number(process.env.PASSWORD_EXPIRY_DAYS) || 90;
  const expiryDate      = new Date(user.passwordChangedAt);
  expiryDate.setDate(expiryDate.getDate() + EXPIRY_DAYS);
  const now             = new Date();
  const passwordExpired = now > expiryDate;
  const daysUntilExpiry = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));

  // past activites
  const recentActivity = await ActivityLog
    .find({ userId: user._id })
    .sort({ timestamp: -1 })
    .lean();

  return sendSuccess(res, "Status retrieved.", {
    user: {
      id:             user._id,
      username:       user.username,
      email:          user.email,
      isMfaActive:    user.isMfaActive,
      passwordExpired,
      daysUntilExpiry,
      memberSince:    user.createdAt,
      lastLoginAt:    user.lastLoginAt,
    },
    recentActivity,
  });
});

// Logout
export const logout = catch_async(async (req, res) => {
  await auditLog(req.user._id, EVENTS.LOGOUT, { ip: req.ip });
  res.clearCookie("access_token", cookieBase());
  res.clearCookie("mfa_pending",  cookieBase());
  return sendSuccess(res, "Logged out successfully.");
});

// Forget password
export const forgetPassword = catch_async(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user || !user.isVerified) {
    return sendError(res, "User is not registered with this email", 401);
  }

  await sendOtpToUser(user, "passwordResetOtp", "passwordResetExpiry");

  return sendSuccess(res, "A reset code has been sent to your email.");
});

// Verify email otp
export const verifyEmailForForgetPassword = catch_async(async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });

  if (!user) return sendError(res, "Invalid or expired reset code.", 400);

  const result = await verifyStoredOtp(user, otp, "passwordResetOtp", "passwordResetExpiry");
  if (!result.valid) return sendError(res, result.error, 400);

  // Clear OTP
  user.passwordResetOtp    = null;
  user.passwordResetExpiry = null;
  await user.save();

  // Issue short-lived reset cookie
  const resetToken = jwt.sign(
    { sub: user._id.toString(), purpose: "password_reset" },
    process.env.JWT_SECRET,
    { expiresIn: "2m" }
  );
  res.cookie("password_reset", resetToken, {
    ...cookieBase(),
    maxAge: 2 * 60 * 1000,
  });

  return sendSuccess(res, "Code verified. You may now reset your password.");
});

// Reset password
export const resetPassword = catch_async(async (req, res) => {
  const { newPassword } = req.body;

  // verify the reset cookie
  const token = req.cookies?.password_reset;
  if (!token) return sendError(res, "Reset session expired. Please start again.", 401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return sendError(res, "Reset session expired. Please start again.", 401);
  }

  if (payload.purpose !== "password_reset") {
    return sendError(res, "Invalid reset session.", 401);
  }

  if (!isPasswordValid(newPassword)) {
    return sendError(res, "Password does not meet security requirements.", 400);
  }

  const user = await User.findById(payload.sub);
  if (!user) return sendError(res, "User not found.", 400);

  // Check password history
  if (await isPasswordReused(user._id, newPassword)) {
    return sendError(res, "New password cannot match any of your past passwords.", 400);
  }

  await saveNewPassword(user, newPassword);
  res.clearCookie("password_reset", cookieBase());

  await auditLog(user._id, EVENTS.PASSWORD_RESET);

  return sendSuccess(res, "Password reset successfully. You can now log in.");
});

// Change password
export const changePassword = catch_async(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user; // full Mongoose doc from authGuard

  // Verify current password
  const isMatch = await argon2.verify(user.password, currentPassword);
  if (!isMatch) return sendError(res, "Current password is incorrect.", 401);

  if (!isPasswordValid(newPassword)) {
    return sendError(res, "Password does not meet security requirements.", 400);
  }

  // Check password history
  if (await isPasswordReused(user._id, newPassword)) {
    return sendError(res, "New password cannot match any of your last 5 passwords.", 400);
  }

  await saveNewPassword(user, newPassword);
  await auditLog(user._id, EVENTS.PASSWORD_CHANGED, { ip: req.ip });

  return sendSuccess(res, "Password changed successfully.");
});

// TOTP setup
export const setup2fa = catch_async(async (req, res) => {
  const user   = req.user;
  const secret = speakeasy.generateSecret({ length: 20 });

  // Store secret but keep isMfaActive false until user verifies a code
  user.mfaSecret   = secret.base32;
  user.isMfaActive = false;
  await user.save();

  const url = speakeasy.otpauthURL({
    secret:   secret.base32,
    label:    user.username,
    issuer:   "SecureAuth",
    encoding: "base32",
  });

  const qrCode = await qrcode.toDataURL(url);

  return sendSuccess(res, "MFA setup initiated. Scan the QR code.", {
    secret: secret.base32,
    qrCode,
  });
});

// TOTP verify
export const verify2fa = catch_async(async (req, res) => {
  const { token } = req.body;
  const user      = req.user;

  if (!user.mfaSecret) {
    return sendError(res, "MFA not set up. Run setup first.", 400);
  }

  const verified = speakeasy.totp.verify({
    secret:   user.mfaSecret,
    encoding: "base32",
    token,
    window:   1,
  });

  if (!verified) return sendError(res, "Invalid 2FA token. Please try again.", 400);

  // first verification activates MFA
  if (!user.isMfaActive) {
    user.isMfaActive = true;
    await user.save();
    await auditLog(user._id, EVENTS.MFA_ENABLED);
    return sendSuccess(res, "MFA enabled successfully.", { setupDone: true });
  }

  // issue session
  res.clearCookie("mfa_pending", cookieBase());
  issueSessionCookies(res, user._id.toString());
  await auditLog(user._id, EVENTS.LOGIN_SUCCESS, { via: "mfa", ip: req.ip });

  return sendSuccess(res, "2FA verified. Login complete.", { setupDone: false });
});

// TOTP reset scan
export const reset2fa = catch_async(async (req, res) => {
  const user       = req.user;
  user.mfaSecret   = null;
  user.isMfaActive = false;
  await user.save();
  await auditLog(user._id, EVENTS.MFA_DISABLED);
  return sendSuccess(res, "2FA disabled successfully.");
});

// Email OTP send
export const sendEmailOtp = catch_async(async (req, res) => {
  const user = req.user;

  if (!user?.email) {
    return sendError(res, "User email not found.", 400);
  }

  await sendOtpToUser(user, "emailOtp", "emailOtpExpiry", 5 * 60 * 1000);

  return sendSuccess(res, "A verification code has been sent to your email. It expires in 5 minutes.");
});

// Verify email OTP
export const verifyEmailOtp = catch_async(async (req, res) => {
  const { otp } = req.body;
  const user = req.user;

  if (!otp) {
    return sendError(res, "OTP is required.", 400);
  }

  const result = await verifyStoredOtp(user, otp, "emailOtp", "emailOtpExpiry");
  if (!result.valid) return sendError(res, result.error, 400);

  user.emailOtp = null;
  user.emailOtpExpiry = null;
  await user.save();

  // Login issue full session
  res.clearCookie("mfa_pending", cookieBase());
  issueSessionCookies(res, user._id.toString());
  await auditLog(user._id, EVENTS.LOGIN_SUCCESS, { via: "mfa", ip: req.ip });

  return sendSuccess(res, "Email verified successfully.");
});