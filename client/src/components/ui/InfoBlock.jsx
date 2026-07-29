import tokens from "../../styles/tokens";

const { color, font, radius } = tokens;

export default function InfoBlock({ title, text }) {
  return (
    <div style={{
      padding: "12px",
      borderRadius: radius.md,
      background: color.bgPage,
      border: `1px solid ${color.divider}`,
    }}>
      <span style={{ fontSize: font.sizeSm, fontWeight: font.weightSemibold, color: color.textPrimary }}>
        {title}
      </span>
      <p style={{ fontSize: font.sizeXs, color: color.textMuted, margin: "4px 0 0" }}>
        {text}
      </p>
    </div>
  );
}