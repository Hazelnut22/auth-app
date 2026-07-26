import tokens from "../../styles/tokens";

const { color, font, radius } = tokens;

const variantStyles = {
  error: {
    background:   color.errorBg,
    color:        color.error,
    border:       `1px solid ${color.errorBorder}`,
  },
  success: {
    background:   color.successBg,
    color:        color.success,
    border:       `1px solid ${color.successBorder}`,
  },
  info: {
    background:   color.bgAccentLight,
    color:        color.accent,
    border:       `1px solid ${color.infoBorder}`,
  },
};

const baseStyle = {
  borderRadius: radius.md,
  padding:      "11px 14px",
  fontSize:     font.sizeMd,
  lineHeight:   1.5,
  marginBottom: "18px",
};

export default function Alert({ variant = "info", children }) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      style={{ ...baseStyle, ...variantStyles[variant] }}
    >
      {children}
    </div>
  );
}