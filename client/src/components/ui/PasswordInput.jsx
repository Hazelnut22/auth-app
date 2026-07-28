import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import tokens from "../../styles/tokens";

const { color, font, radius } = tokens;

const styles = {
  wrapper: {
    position: "relative",
    display: "flex",
    alignItems:"center",
  },
  input: {
    width: "100%",
    height: "42px",
    padding: "0 42px 0 13px",
    border: `1.5px solid ${color.border}`,
    borderRadius: radius.md,
    fontSize: font.sizeLg,
    color: color.textPrimary,
    background: color.bgInput,
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: font.family,
  },
  inputError: {
    borderColor: color.error,
    boxShadow: "0 0 0 3px rgba(192,68,10,0.10)",
  },
  toggle: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: color.textMuted,
    display: "flex",
    alignItems: "center",
    padding: "2px",
    lineHeight: 1,
    transition: `color 0.15s`,
  },
};

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
          e.target.style.borderColor = error ? color.error : color.borderFocus;
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
        {visible ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  );
}