import tokens from "../../styles/tokens";

const { color, font, radius, space } = tokens;

const styles = {
  wrapper: {
    marginBottom: "18px",
    display:      "flex",
    flexDirection:"column",
  },
  label: {
    fontSize:     font.sizeMd,
    fontWeight:   font.weightMedium,
    color:        color.textSecondary,
    marginBottom: space.xs,
    letterSpacing:"0.1px",
  },
  input: {
    width:        "100%",
    height:       "42px",
    padding:      `0 13px`,
    border:       `1.5px solid ${color.border}`,
    borderRadius: radius.md,
    fontSize:     font.sizeLg,
    color:        color.textPrimary,
    background:   color.bgInput,
    outline:      "none",
    transition:   `border-color ${tokens.transition.fast}, box-shadow ${tokens.transition.fast}`,
    fontFamily:   font.family,
  },
  inputFocus: {
    borderColor: color.borderFocus,
    boxShadow:   "0 0 0 3px rgba(201,121,58,0.12)",
  },
  inputError: {
    borderColor: color.error,
    boxShadow:   "0 0 0 3px rgba(192,68,10,0.10)",
  },
  hint: {
    fontSize:   font.sizeSm,
    color:      color.textMuted,
    marginTop:  "5px",
    lineHeight: 1.4,
  },
  error: {
    fontSize:   font.sizeSm,
    color:      color.error,
    marginTop:  "5px",
    lineHeight: 1.4,
  },
};

export default function FormField({ id, label, error, hint, children, ...inputProps }) {
  return (
    <div style={styles.wrapper}>
      <label htmlFor={id} style={styles.label}>
        {label}
      </label>

      {children ?? (
        <input
          id={id}
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
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          {...inputProps}
        />
      )}

      {error && (
        <span id={`${id}-error`} role="alert" style={styles.error}>
          {typeof error === "object" ? error.message || "CAPTCHA verification failed" : String(error)}
        </span>
      )}

      {!error && hint && (
        <span id={`${id}-hint`} style={styles.hint}>
          {hint}
        </span>
      )}
    </div>
  );
}