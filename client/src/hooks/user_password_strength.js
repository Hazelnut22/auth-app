import { useMemo } from "react";
import tokens from "../styles/tokens";

/**
 * Strength levels returned by the hook.
 * score runs 0–5 so the bar can be rendered as (score / 5) * 100%.
 */
const LEVELS = [
  { score: 0, label: "",            color: "transparent" },
  { score: 1, label: "Very weak",   color: tokens.color.strengthWeak },
  { score: 2, label: "Weak",        color: tokens.color.strengthFair },
  { score: 3, label: "Fair",        color: tokens.color.strengthModerate },
  { score: 4, label: "Strong",      color: tokens.color.strengthStrong },
  { score: 5, label: "Very strong", color: tokens.color.strengthVeryStrong },
];

/**
 * Derives a password strength score from basic heuristics.
 * Replace the body of this function with a zxcvbn call when
 * you wire up the real backend — the hook's return shape stays the same.
 *
 * @param {string} password
 * @returns {{ score: number, label: string, color: string }}
 */
function deriveStrength(password) {
  if (!password) return LEVELS[0];

  let score = 0;
  if (password.length >= 8)           score++;
  if (password.length >= 12)          score++;
  if (/[A-Z]/.test(password))         score++;
  if (/[0-9]/.test(password))         score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return LEVELS[Math.min(score, 5)];
}

/**
 * Hook: returns live strength metadata for a given password string.
 * Memoised so it only recalculates when the password changes.
 *
 * @param {string} password
 * @returns {{ score: number, label: string, color: string }}
 */
export function usePasswordStrength(password) {
  return useMemo(() => deriveStrength(password), [password]);
}