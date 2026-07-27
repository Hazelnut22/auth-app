import { useMemo } from "react";
import tokens from "../styles/tokens";

const LEVELS = [
  { score: 0, label: "",            color: "transparent" },
  { score: 1, label: "Very weak",   color: tokens.color.strengthWeak },
  { score: 2, label: "Weak",        color: tokens.color.strengthFair },
  { score: 3, label: "Fair",        color: tokens.color.strengthModerate },
  { score: 4, label: "Strong",      color: tokens.color.strengthStrong },
  { score: 5, label: "Very strong", color: tokens.color.strengthVeryStrong },
];

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

export function usePasswordStrength(password) {
  return useMemo(() => deriveStrength(password), [password]);
}