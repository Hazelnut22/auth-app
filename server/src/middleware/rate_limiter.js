import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             500,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { message: "Too many requests. Please slow down." },
});

export const registerLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,    // 1 hour
  max:             5,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { message: "Too many registration attempts. Please try again later." },
});

export const loginLimiter = rateLimit({
  windowMs:         15 * 60 * 1000,   // 15 minutes
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  message: { message: "Too many login attempts. Please try again later." },
  skipSuccessfulRequests: true,        // only counts failed requests
});