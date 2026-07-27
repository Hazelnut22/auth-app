import tokens from "../../styles/tokens";
const { color, font } = tokens;

export default function StepIndicator({ current, steps }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
      {steps.map((label, i) => {
        const num  = i + 1;
        const done = current > num;
        const active = current === num;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
            <div style={{
              width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
              background: done ? color.success : active ? color.cta : color.divider,
              color: done || active ? "#fff" : color.textMuted,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: font.sizeSm, fontWeight: font.weightSemibold,
            }}>
              {done ? "✓" : num}
            </div>
            <span style={{
              fontSize: font.sizeSm, marginLeft: "5px", whiteSpace: "nowrap",
              color: active ? color.textPrimary : color.textMuted,
              fontWeight: active ? font.weightMedium : font.weightRegular,
            }}>
              {label}
            </span>
            {i < 2 && (
              <div style={{
                flex: 1, height: "1px", margin: "0 8px",
                background: done ? color.success : color.divider,
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}