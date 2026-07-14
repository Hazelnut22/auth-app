import User from "../models/user.js";
import PasswordHistory from "../models/password_history.js";
import { isPasswordValid } from "../utils/password_requirements.js";
import { generateCaptcha } from "./captcha_controller.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const LOCKOUT_MINUTES = Number(process.env.LOCKOUT_MINUTES) || 15;

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if the password meets the requirments
        if (!isPasswordValid(password)) {
            return res.status(400).json({
                error: "Password does not meet security requirements."
            });
        }

        // Find if the user already exists
        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({
                error: "User already exists in the database."
            });
        }

        // Hash passwords with argon2
        const hashedPassword = await argon2.hash(password, {
            type: argon2.argon2d,
            memoryCost: 19456, // 19 MB
            timeCost: 2,
            parallelism: 1,
        });

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            isMfaActive: false,
            failedAttempts: 0,
            lockedUntil: null,
            passwordChangedAt: new Date(),
        });
        console.log("new user created:", newUser);
        await newUser.save();

        await PasswordHistory.create({
            userId: newUser._id,
            passwordHash: hashedPassword,
            createdAt: new Date(),
        });

        res.status(201).json({
            message: "User registered successfully"
        });
    } catch (e) {
        console.error("Registration error:", e);
        res.status(500).json({ error: "Error creating new user", message: e });
    }
};

export const getCaptcha = async (req, res) => {
  try {
    const { token, imageDataUri } = generateCaptcha();
    res.json({ token, imageDataUri });
  } catch (err) {
    console.error("[Captcha] Generation failed:", err.message);
    res.status(500).json({ message: "Could not generate CAPTCHA. Please try again." });
  }
};

export const login = async (req, res) => {
    try {
        const { email, password, captchaToken, captchaAnswer } = req.body;

        const user = await User.findOne(
            { email: email.toLowerCase().trim() }
        );

        if (user?.lockedUntil && new Date() < new Date(user.lockedUntil)) {
            // Generic message — don't reveal the account is locked
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const dummyHash = await argon2.hash("dummy-timing-prevention", {
            type: argon2.argon2d,
            memoryCost: 19456,
            timeCost: 2,
            parallelism: 1,
        });
        const hashToCheck = user?.password ?? dummyHash;
        const isMatch = await argon2.verify(hashToCheck, password);

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

            // Single generic message — attacker learns nothing
            return res.status(401).json({ error: "Invalid credentials." });
        }

        await User.findByIdAndUpdate(user._id, {
            failedAttempts: 0,
            lockedUntil: null,
        });

        if (user.isMfaActive) {
            const tempToken = jwt.sign(
                { sub: user._id.toString(), purpose: "mfa_pending" },
                process.env.JWT_SECRET,
                { expiresIn: "5m" }
            );

            res.cookie("mfa_pending", tempToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
                maxAge: 5 * 60 * 1000, // 5 minutes
            });

            return res.status(200).json({ mfaRequired: true });
        }

        const accessToken = jwt.sign(
            { sub: user._id.toString(), purpose: "access" },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        return res.status(200).json({
            message: "Login successful.",
            mfaRequired: false,
        });

    } catch (e) {
        console.error("Login error:", e);
        return res.status(500).json({ error: "Login failed. Please try again." });
    }
};

export const status = async (req, res) => {
    try {
        // select only safe fields
        const user = await User.findById(req.user.id).select(
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

export const logout = async (req, res) => {
    try {
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        };

        res.clearCookie("access_token", cookieOptions);
        res.clearCookie("refresh_token", cookieOptions);
        res.clearCookie("mfa_pending", cookieOptions);

        return res.status(200).json({ message: "Logged out successfully." });
    } catch (error) {
        console.error("Logout error:", e);
        return res.status(500).json({ error: "Logout failed." });
    }
};

export const setup2fa = async (req, res) => { };

export const verify2fa = async (req, res) => { };

export const reset2fa = async (req, res) => { };
