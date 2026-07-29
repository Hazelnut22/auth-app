import tokens from "../../styles/tokens";

const { color, font } = tokens;

export default function Section({ id, title, icon, divider, children }) {
  return (
    <section id={id} style={{
      scrollMarginTop: "32px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      borderTop: divider ? `1px solid ${color.divider}` : "none",
      paddingTop: divider ? "32px" : 0,
      marginBottom: "32px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {icon}
        <h2 style={{
          fontSize: font.sizeXl,
          fontWeight: font.weightSemibold,
          color: color.textPrimary,
          margin: 0,
        }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}