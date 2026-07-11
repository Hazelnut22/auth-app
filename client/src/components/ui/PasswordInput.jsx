import { useState } from "react";
import tokens from "../../styles/tokens";

const { color, font, radius } = tokens;

/* ── SVG eye icons ─────────────────────────────────────────────── */
function EyeOpenIcon() {
  return (
    <svg
      width="18" height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg
      width="18" height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

/* ── Styles ────────────────────────────────────────────────────── */
const styles = {
  wrapper: {
    position: "relative",
    display:  "flex",
    alignItems:"center",
  },
  input: {
    width:        "100%",
    height:       "42px",
    padding:      "0 42px 0 13px",
    border:       `1.5px solid ${color.border}`,
    borderRadius: radius.md,
    fontSize:     font.sizeLg,
    color:        color.textPrimary,
    background:   color.bgInput,
    outline:      "none",
    transition:   "border-color 0.15s, box-shadow 0.15s",
    fontFamily:   font.family,
  },
  inputError: {
    borderColor: color.error,
    boxShadow:   "0 0 0 3px rgba(192,68,10,0.10)",
  },
  toggle: {
    position:   "absolute",
    right:      "12px",
    background: "none",
    border:     "none",
    cursor:     "pointer",
    color:      color.textMuted,
    display:    "flex",
    alignItems: "center",
    padding:    "2px",
    lineHeight: 1,
    transition: `color 0.15s`,
  },
};

/**
 * PasswordInput
 * A password field with a show/hide toggle.
 * Designed to be placed inside a <FormField> as its children slot.
 *
 * Props:
 *   id          {string}   — must match the parent FormField's id
 *   error       {boolean}  — applies error border styling
 *   All other props forwarded to the underlying <input>
 */
export default function PasswordInput({ id, error, ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={styles.wrapper}>
      <input
        id={id}
        type={visible ? "text" : "password"}
        style={{
          ...styles.input,
          ...(error ? styles.inputError : {}),
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? color.error    : color.borderFocus;
          e.target.style.boxShadow   = error
            ? "0 0 0 3px rgba(192,68,10,0.10)"
            : "0 0 0 3px rgba(201,121,58,0.12)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? color.error : color.border;
          e.target.style.boxShadow   = "none";
        }}
        aria-invalid={!!error}
        {...inputProps}
      />
      <button
        type="button"
        style={styles.toggle}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        onMouseEnter={(e) => (e.currentTarget.style.color = color.accent)}
        onMouseLeave={(e) => (e.currentTarget.style.color = color.textMuted)}
      >
        {visible ? <EyeOpenIcon /> : <EyeClosedIcon />}
      </button>
    </div>
  );
}