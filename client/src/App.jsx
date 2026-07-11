import { useState } from "react";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import MFA from "./pages/MultiFactorAuth";
import ChangePassword from "./pages/ForgotPassword";
import tokens         from "./styles/tokens";
import "./styles/global.css";

const { color, font } = tokens;

/**
 * SCREENS — preview nav pill config.
 * Remove this and the <nav> block below before production.
 */
const SCREENS = [
  { id: "login",           label: "Login" },
  { id: "register",        label: "Register" },
  { id: "mfa",             label: "MFA" },
  { id: "change-password", label: "Change password" },
];

const PAGE_MAP = {
  login:            Login,
  register:         Register,
  mfa:              MFA,
  "change-password":ChangePassword,
};

/**
 * App
 * Single routing layer — knows which screen to show, nothing else.
 * Replace the useState router with react-router-dom when wiring the real backend.
 */
export default function App() {
  const [screen, setScreen] = useState("login");

  const ActivePage = PAGE_MAP[screen] ?? Login;

  return (
    <div className="auth-page">

      {/* ── Dev-only preview nav — remove in production ──────────── */}
      <nav
        aria-label="Preview navigation"
        style={{
          display:      "flex",
          gap:          "6px",
          marginBottom: "20px",
          flexWrap:     "wrap",
          justifyContent:"center",
        }}
      >
        {SCREENS.map((s) => (
          <button
            key={s.id}
            onClick={() => setScreen(s.id)}
            style={{
              padding:      "5px 12px",
              borderRadius: "20px",
              fontSize:     font.sizeSm,
              fontWeight:   font.weightMedium,
              cursor:       "pointer",
              border:       `1.5px solid ${screen === s.id ? color.cta : color.border}`,
              background:   screen === s.id ? color.cta : "#fff",
              color:        screen === s.id ? "#fff" : color.textSecondary,
              transition:   "all 0.15s",
              fontFamily:   font.family,
            }}
          >
            {s.label}
          </button>
        ))}
      </nav>
      {/* ── End dev nav ───────────────────────────────────────────── */}

      <ActivePage navigate={setScreen} />

      <p className="page-footer">
        Protected by end-to-end encryption · Argon2id · TOTP MFA
      </p>
    </div>
  );
}