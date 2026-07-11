import tokens from "../../styles/tokens";
import { PASSWORD_REQUIREMENTS } from "../../utils/password_requirements.js";

const { color, font, transition } = tokens;

/* ── Tick icon ─────────────────────────────────────────────────── */
function TickIcon() {
  return (
    <svg
      width="9" height="9"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ── Styles ────────────────────────────────────────────────────── */
const styles = {
  track: {
    height:       "4px",
    background:   color.divider,
    borderRadius: "2px",
    marginTop:    "8px",
    overflow:     "hidden",
  },
  fill: {
    height:       "100%",
    borderRadius: "2px",
    transition:   `width ${transition.slow}, background ${transition.slow}`,
  },
  strengthLabel: {
    fontSize:   font.sizeSm,
    marginTop:  "5px",
    fontWeight: font.weightMedium,
    transition: `color ${transition.normal}`,
  },
  reqList: {
    listStyle:           "none",
    marginTop:           "10px",
    display:             "grid",
    gridTemplateColumns: "1fr 1fr",
    gap:                 "5px 8px",
  },
  reqItem: (met) => ({
    fontSize:   font.sizeSm,
    color:      met ? color.success : color.textMuted,
    display:    "flex",
    alignItems: "center",
    gap:        "5px",
    transition: `color ${transition.normal}`,
  }),
  dot: (met) => ({
    width:        "6px",
    height:       "6px",
    borderRadius: "50%",
    background:   met ? color.success : color.border,
    flexShrink:   0,
    display:      "flex",
    alignItems:   "center",
    justifyContent:"center",
    transition:   `background ${transition.normal}`,
  }),
};

/**
 * StrengthBar
 * Renders a strength progress bar + requirement checklist.
 *
 * Props:
 *   password  {string}   — the current password value
 *   strength  {object}   — { score, label, color } from usePasswordStrength
 */
export default function StrengthBar({ password, strength }) {
  if (!password) return null;

  return (
    <div aria-live="polite" aria-label={`Password strength: ${strength.label}`}>
      {/* Bar */}
      <div style={styles.track}>
        <div
          style={{
            ...styles.fill,
            width:      `${(strength.score / 5) * 100}%`,
            background: strength.color,
          }}
        />
      </div>

      {/* Label */}
      <p style={{ ...styles.strengthLabel, color: strength.color }}>
        {strength.label}
      </p>

      {/* Requirements checklist */}
      <ul style={styles.reqList}>
        {PASSWORD_REQUIREMENTS.map((req) => {
          const met = req.test(password);
          return (
            <li key={req.id} style={styles.reqItem(met)}>
              <span style={styles.dot(met)}>
                {met && <TickIcon />}
              </span>
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}