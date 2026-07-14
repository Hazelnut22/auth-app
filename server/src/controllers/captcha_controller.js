import { createCanvas } from "canvas";
import jwt              from "jsonwebtoken";
import crypto           from "crypto";
import { JWT_SECRET } from "../config/env.js";

const CAPTCHA_CONFIG = {
  length:        6,          // number of characters
  expirySeconds: 120,        // 2 minutes — must complete within this window
  width:         220,
  height:        70,
  fontSize:      36,
  chars: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",
};

const usedTokens = new Map(); // jti → expiresAt


function purgeExpiredTokens() {
  const now = Date.now();
  for (const [jti, expiresAt] of usedTokens.entries()) {
    if (now > expiresAt) usedTokens.delete(jti);
  }
}

function generateCaptchaText() {
  const chars  = CAPTCHA_CONFIG.chars;
  const bytes  = crypto.randomBytes(CAPTCHA_CONFIG.length);
  console.log("Captcha text has been generated successfully!");
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join("");
}

// ─── Canvas renderer ─────────────────────────────────────────────
/**
 * Renders the CAPTCHA text onto a canvas with:
 *   - Random background noise (dots)
 *   - Sine-wave horizontal distortion lines
 *   - Per-character rotation and vertical jitter
 *   - Random character colours (all dark enough to read)
 *
 * @param {string} text
 * @returns {string} base64-encoded PNG data URI
 */
function renderCaptchaImage(text) {
  const { width, height, fontSize } = CAPTCHA_CONFIG;
  const canvas = createCanvas(width, height);
  const ctx    = canvas.getContext("2d");

  // ── Background ──────────────────────────────────────────────────
  ctx.fillStyle = "#F5F0E8";
  ctx.fillRect(0, 0, width, height);

  // ── Background noise dots ───────────────────────────────────────
  for (let i = 0; i < 80; i++) {
    ctx.beginPath();
    ctx.arc(
      Math.random() * width,
      Math.random() * height,
      Math.random() * 2,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = randomDarkColor(0.25); // low opacity dots
    ctx.fill();
  }

  // ── Distortion lines (sine wave) ────────────────────────────────
  for (let l = 0; l < 4; l++) {
    ctx.beginPath();
    ctx.strokeStyle = randomDarkColor(0.3);
    ctx.lineWidth   = 1.5;
    const amplitude = 4 + Math.random() * 6;
    const frequency = 0.02 + Math.random() * 0.03;
    const yBase     = 10 + Math.random() * (height - 20);
    ctx.moveTo(0, yBase);
    for (let x = 1; x < width; x++) {
      ctx.lineTo(x, yBase + Math.sin(x * frequency + l) * amplitude);
    }
    ctx.stroke();
  }

  // ── Characters ──────────────────────────────────────────────────
  const charWidth  = width / (text.length + 1);
  ctx.font         = `bold ${fontSize}px 'Arial'`;
  ctx.textBaseline = "middle";

  text.split("").forEach((char, i) => {
    const x      = charWidth * (i + 0.8) + Math.random() * 6 - 3;
    const y      = height / 2 + Math.random() * 10 - 5;
    const angle  = (Math.random() - 0.5) * 0.4; // ±~23 degrees

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = randomDarkColor(1);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });

  // ── Foreground noise lines (over the text) ───────────────────────
  for (let l = 0; l < 2; l++) {
    ctx.beginPath();
    ctx.strokeStyle = randomDarkColor(0.15);
    ctx.lineWidth   = 1;
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  return canvas.toDataURL("image/png"); // base64 PNG data URI
}

/** Returns a random dark hex colour at the given opacity */
function randomDarkColor(alpha) {
  const r = Math.floor(Math.random() * 120);       // keep dark
  const g = Math.floor(Math.random() * 120);
  const b = Math.floor(Math.random() * 160);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * generateCaptcha
 * Creates a new CAPTCHA challenge.
 *
 * @returns {{ token: string, imageDataUri: string }}
 *   token        — signed JWT containing the answer (send to frontend, opaque)
 *   imageDataUri — base64 PNG to render as <img src={imageDataUri} />
 */
export function generateCaptcha() {
  purgeExpiredTokens();

  const text = generateCaptchaText();
  const jti  = crypto.randomUUID(); // unique ID for this token — used for blacklisting
  console.log("Created jti for jwt id!");

  const token = jwt.sign(
    {
      answer:  text.toUpperCase(), // store normalised — comparison is case-insensitive
      purpose: "captcha",
      jti,                         // JWT ID — lets us blacklist after single use
    },
    JWT_SECRET,
    { expiresIn: `${CAPTCHA_CONFIG.expirySeconds}s` }
  );
  console.log("Signed token!");

  const imageDataUri = renderCaptchaImage(text);

  return { token, imageDataUri };
}

/**
 * verifyCaptchaToken
 * Verifies a submitted CAPTCHA answer against the signed token.
 *
 * Security properties:
 *   - Rejects expired tokens (JWT expiry)
 *   - Rejects replayed tokens (one-time-use blacklist)
 *   - Rejects tampered tokens (JWT signature)
 *   - Case-insensitive comparison (UX)
 *
 * Always blacklists the token after calling this — whether it passes or fails.
 * This prevents an attacker from repeatedly submitting until they guess right.
 *
 * @param {string} token   — the JWT from the frontend
 * @param {string} answer  — the user's typed answer
 * @returns {{ valid: boolean, reason?: string }}
 */
export function verifyCaptchaToken(token, answer) {
  let payload;

  // 1. Verify signature and expiry
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return {
      valid:  false,
      reason: err.name === "TokenExpiredError" ? "CAPTCHA expired." : "Invalid CAPTCHA token.",
    };
  }

  // 2. Confirm this token was issued for CAPTCHA, not another purpose
  if (payload.purpose !== "captcha") {
    return { valid: false, reason: "Invalid CAPTCHA token." };
  }

  // 3. One-time-use check — reject if already submitted
  if (usedTokens.has(payload.jti)) {
    return { valid: false, reason: "CAPTCHA already used. Please refresh." };
  }

  // 4. Blacklist immediately — before checking the answer.
  //    This means even a wrong guess consumes the token.
  //    Forces the user to fetch a new CAPTCHA on failure.
  usedTokens.set(
    payload.jti,
    (payload.exp ?? 0) * 1000 // store until the JWT's own expiry for GC purposes
  );

  // 5. Compare answer (case-insensitive)
  const expected = (payload.answer ?? "").toUpperCase().trim();
  const provided = (answer ?? "").toUpperCase().trim();

  if (expected !== provided) {
    return { valid: false, reason: "Incorrect CAPTCHA answer." };
  }

  return { valid: true };
}