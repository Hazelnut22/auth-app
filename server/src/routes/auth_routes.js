import { Router } from "express";
import { body } from "express-validator";
import { validate } from "../middleware/validator.js";
import { authGuard } from "../middleware/auth_guard.js";
import { registerLimiter, loginLimiter, globalLimiter } from "../middleware/rate_limiter.js";
import { register, getCaptcha, login, status, logout, setup2fa, verify2fa, reset2fa, refresh } from "../controllers/auth_controllers.js";

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

// refresh
router.get("/refresh", refresh);

// auth status
router.get("/status", authGuard, status);

// logout
router.post("/logout", authGuard, logout);

// 2fa setup
router.post("/2fa/setup", setup2fa);

// 2fa verify
router.post("/2fa/verify", verify2fa);

// 2fa reset
router.post("/2fa/reset", reset2fa);

export default router;