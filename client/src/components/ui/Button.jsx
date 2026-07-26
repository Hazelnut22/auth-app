import tokens from "../../styles/tokens";

const { color, font, radius, transition } = tokens;

const base = {
  width:        "100%",
  height:       "44px",
  borderRadius: radius.md,
  fontSize:     font.sizeLg,
  fontWeight:   font.weightSemibold,
  cursor:       "pointer",
  border:       "none",
  letterSpacing:"0.1px",
  transition:   `background ${transition.fast}, border-color ${transition.fast}, color ${transition.fast}, transform 0.1s`,
  fontFamily:   font.family,
  display:      "flex",
  alignItems:   "center",
  justifyContent:"center",
  gap:          "8px",
};

const variants = {
  primary: {
    background: color.cta,
    color:      "#ffffff",
    border:     "none",
  },
  ghost: {
    background: "transparent",
    color:      color.textSecondary,
    border:     `1.5px solid ${color.border}`,
    fontWeight: font.weightMedium,
    fontSize:   font.sizeMd,
  },
};

const hoverStyles = {
  primary: { background: color.ctaHover },
  ghost:   { borderColor: color.accent, color: color.accent },
};

const disabledStyle = {
  background: color.textMuted,
  cursor:     "not-allowed",
  border:     "none",
  color:      "#ffffff",
};

export default function Button({
  variant  = "primary",
  disabled = false,
  style    = {},
  children,
  ...rest
}) {
  const composed = {
    ...base,
    ...variants[variant],
    ...(disabled ? disabledStyle : {}),
    ...style,
  };

  return (
    <button
      style={composed}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (!disabled) Object.assign(e.currentTarget.style, hoverStyles[variant]);
      }}
      onMouseLeave={(e) => {
        if (!disabled) Object.assign(e.currentTarget.style, variants[variant]);
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(0.99)";
      }}
      onMouseUp={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(1)";
      }}
      {...rest}
    >
      {children}
    </button>
  );
}