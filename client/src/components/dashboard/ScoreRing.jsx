import tokens from "../../styles/tokens.js";

const { color, font, space, radius, shadow } = tokens;

export default function ScoreRing({ score, max }) {
  const pct = score / max;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;
  const ringColor =
    pct >= 1 ? color.success :
      pct >= 0.5 ? color.cta : color.error;

  const label =
    pct >= 1 ? "Excellent" :
      pct >= 0.75 ? "Good" :
        pct >= 0.5 ? "Fair" : "Needs attention";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
      <svg width="130" height="130" viewBox="0 0 130 130" aria-label={`Security score ${score} of ${max}`}>

        <circle cx="65" cy="65" r={r} fill="none"
          stroke={color.divider} strokeWidth="10" />

        <circle cx="65" cy="65" r={r} fill="none"
          stroke={ringColor} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{
            transition: "stroke-dasharray 0.6s ease, stroke 0.3s ease",
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%"
          }}
        />

        <text x="65" y="60" textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: "28px", fontWeight: 700, fill: color.textPrimary, fontFamily: font.family }}>
          {score}/{max}
        </text>
        <text x="65" y="80" textAnchor="middle"
          style={{ fontSize: "12px", fill: color.textSecondary, fontFamily: font.family }}>
          Security score
        </text>
      </svg>
      <span style={{
        fontSize: font.sizeSm, fontWeight: font.weightSemibold,
        color: ringColor,
      }}>
        {label}
      </span>
    </div>
  );
}