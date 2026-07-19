import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validator.js";
import { authGuard, mfaPendingGuard } from "../middleware/auth_guard.js";
import { registerLimiter, loginLimiter, globalLimiter } from "../middleware/rate_limiter.js";
import { register, getCaptcha, login, status, verifyActivationOtp, sendActivationOtp, logout, setup2fa, verify2fa, reset2fa, refresh } from "../controllers/auth_controllers.js";

const router = Router();

// registration
router.post(
    "/register",
    registerLimiter,
    [
        body("username")
            .trim()
            .notEmpty().withMessage("Username is required.")
            .isLength({ max: 50 }).withMessage("Username too long."),

        body("email")
            .trim()
            .isEmail().withMessage("Valid email required.")
            .normalizeEmail(),

        body("password")
            .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
            .isLength({ max: 128 }).withMessage("Password too long."),

        body("captchaToken")
            .notEmpty().withMessage("CAPTCHA token is required."),

        body("captchaAnswer")
            .notEmpty().withMessage("CAPTCHA answer is required."),
    ],
    validate,
    register
);

// login
router.post(
    "/login",
    loginLimiter,
    [
        body("email")
            .trim()
            .isEmail().withMessage("Valid email required.")
            .normalizeEmail(),

        body("password")
            .notEmpty().withMessage("Password is required.")
            .isLength({ max: 128 }).withMessage("Password too long."),

        body("captchaToken")
            .notEmpty().withMessage("CAPTCHA token is required."),

        body("captchaAnswer")
            .notEmpty().withMessage("CAPTCHA answer is required."),
    ],
    validate,
    login
);

// captcha
router.get("/captcha", globalLimiter, getCaptcha);

// activate user
router.post("/activate",
    [
        body("email").trim().isEmail().normalizeEmail(),
        body("otp").notEmpty().isLength({ min: 6, max: 6 }).withMessage("Enter the 6-digit code."),
    ],
    validate,
    verifyActivationOtp
);

// activate email
router.post("/activate/resend",
    [body("email").trim().isEmail().normalizeEmail()],
    validate,
    sendActivationOtp
);

// refresh
router.post("/refresh", refresh);

// auth status
router.get("/status", authGuard, status);

// logout
router.post("/logout", authGuard, logout);

// 2fa setup
router.post("/2fa/setup", authGuard, setup2fa);

// 2fa verify
router.post("/2fa/verify", mfaPendingGuard, verify2fa);

// 2fa reset
router.post("/2fa/reset", authGuard, reset2fa);

export default router;