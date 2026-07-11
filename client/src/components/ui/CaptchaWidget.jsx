import tokens from "../../styles/tokens";

const { color, font, radius } = tokens;

const styles = {
  wrapper: {
    border:       `1.5px solid ${color.border}`,
    borderRadius: radius.md,
    padding:      "12px 14px",
    marginBottom: "18px",
    display:      "flex",
    alignItems:   "center",
    gap:          "10px",
    background:   "#FDFAF7",
  },
  checkbox: {
    width:       "18px",
    height:      "18px",
    accentColor: color.cta,
    cursor:      "pointer",
    flexShrink:  0,
  },
  label: {
    fontSize: font.sizeMd,
    color:    color.textSecondary,
  },
  badge: {
    marginLeft: "auto",
    fontSize:   font.sizeXs,
    color:      color.textMuted,
    whiteSpace: "nowrap",
  },
};

/**
 * CaptchaWidget
 *
 * UI placeholder for Cloudflare Turnstile.
 *
 * --- HOW TO REPLACE WITH THE REAL WIDGET ---
 * 1. Add the Turnstile script to index.html:
 *      <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
 * 2. Replace the JSX below with:
 *      <div
 *        className="cf-turnstile"
 *        data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
 *        data-callback="onTurnstileSuccess"
 *      />
 * 3. Pass the token from the callback up to the form via the onVerify prop.
 *
 * Props:
 *   onVerify  {(token: string) => void}  — called when CAPTCHA is solved
 */
export default function CaptchaWidget({ onVerify }) {
  const handleChange = (e) => {
    if (e.target.checked && onVerify) {
      // Placeholder: in production the real token comes from Turnstile's callback
      onVerify("__captcha_placeholder_token__");
    }
  };

  return (
    <div style={styles.wrapper} role="group" aria-label="CAPTCHA verification">
      <input
        type="checkbox"
        id="captcha-check"
        style={styles.checkbox}
        onChange={handleChange}
        aria-label="Confirm you are human"
      />
      <label htmlFor="captcha-check" style={styles.label}>
        I am human
      </label>
      <span style={styles.badge}>Cloudflare Turnstile</span>
    </div>
  );
}