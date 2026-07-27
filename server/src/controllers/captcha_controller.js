import { createCanvas } from "canvas";
import jwt              from "jsonwebtoken";
import crypto           from "crypto";
import { JWT_SECRET } from "../config/env.js";

const CAPTCHA_CONFIG = {
  length:        6,
  expirySeconds: 120,
  width:         220,
  height:        70,
  fontSize:      24,
  chars: "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789",
};

const usedTokens = new Map();


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
function renderCaptchaImage(text) {
  const { width, height, fontSize } = CAPTCHA_CONFIG;
  const canvas = createCanvas(width, height);
  const ctx    = canvas.getContext("2d");

  // ── Background ──────────────────────────────────────────────────
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  // ── Background noise dots ───────────────────────────────────────
  for (let i = 0; i < 300; i++) {
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
  for (let l = 0; l < 30; l++) {
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
    const angle  = (Math.random() - 0.5) * 0.4;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = randomDarkColor(0.8);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });

  // ── Foreground noise lines (over the text) ───────────────────────
  for (let l = 0; l < 20; l++) {
    ctx.beginPath();
    ctx.strokeStyle = randomDarkColor(0.15);
    ctx.lineWidth   = 1;
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  return canvas.toDataURL("image/png"); // base64 PNG data URI
}

function randomDarkColor(alpha) {
  const r = Math.floor(Math.random() * 90);       // keep dark
  const g = Math.floor(Math.random() * 90);
  const b = Math.floor(Math.random() * 90);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Public API ───────────────────────────────────────────────────
export function generateCaptcha() {
  purgeExpiredTokens();

  const text = generateCaptchaText();
  const jti  = crypto.randomUUID(); // unique ID for this token — used for blacklisting
  console.log("Created jti for jwt id!");

  const token = jwt.sign(
    {
      answer:  text,
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

export function verifyCaptchaToken(token, answer) {
  let payload;

  // Verify signature and expiry
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return {
      valid:  false,
      reason: err.name === "TokenExpiredError" ? "CAPTCHA expired." : "Invalid CAPTCHA token.",
    };
  }

  // Confirm this token was issued for CAPTCHA, not another purpose
  if (payload.purpose !== "captcha") {
    return { valid: false, reason: "Invalid CAPTCHA token." };
  }

  // One-time-use check — reject if already submitted
  if (usedTokens.has(payload.jti)) {
    return { valid: false, reason: "CAPTCHA already used. Please refresh." };
  }


  // Forces the user to fetch a new CAPTCHA on failure.
  usedTokens.set(
    payload.jti,
    (payload.exp ?? 0) * 1000 // store until the JWT's own expiry for GC purposes
  );

  // Compare answer
  const expected = (payload.answer ?? "").trim();
  const provided = (answer ?? "").trim();

  if (expected !== provided) {
    return { valid: false, reason: "Incorrect CAPTCHA answer." };
  }

  return { valid: true };
}