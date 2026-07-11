import { useState } from "react";
import AuthCard   from "../components/ui/AuthCard";
import OtpInput   from "../components/ui/OtpInput";
import FormField  from "../components/ui/FormField";
import Button     from "../components/ui/Button";
import LinkButton from "../components/ui/LinkButton";
import tokens     from "../styles/tokens";

const { color, font } = tokens;

/* ── Lock icon ─────────────────────────────────────────────────── */
function LockIcon() {
  return (
    <svg
      width="26" height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color.accent}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
      <circle cx="12" cy="16" r="1" fill={color.accent} />
    </svg>
  );
}

/**
 * MFA
 * Two modes:
 *   - TOTP: 6-digit OTP from authenticator app
 *   - Backup: single 8-digit backup code
 *
 * Props:
 *   navigate  {(screen: string) => void}
 */
export default function MFA({ navigate }) {
  const [otp,       setOtp]       = useState("");
  const [backup,    setBackup]    = useState("");
  const [useBackup, setUseBackup] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call POST /auth/mfa/verify with { otp } or POST /auth/mfa/backup with { code: backup }
    navigate("login");
  };

  const subheading = useBackup
    ? "Enter one of your single-use backup codes."
    : "Enter the 6-digit code from your authenticator app. Codes rotate every 30 seconds.";

  return (
    <AuthCard heading="Two-factor verification" subheading={subheading}>
      {/* Icon */}
      <div style={{
        width:          "52px",
        height:         "52px",
        background:     color.bgAccentLight,
        borderRadius:   "12px",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        marginBottom:   "18px",
      }}>
        <LockIcon />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {!useBackup ? (
          <OtpInput value={otp} onChange={setOtp} />
        ) : (
          <FormField
            id="mfa-backup"
            label="Backup code"
            hint="Each backup code can only be used once."
          >
            <input
              id="mfa-backup"
              type="text"
              placeholder="XXXX-XXXX"
              value={backup}
              onChange={(e) => setBackup(e.target.value)}
              autoComplete="one-time-code"
              style={{
                width:       "100%",
                height:      "42px",
                padding:     "0 13px",
                border:      `1.5px solid ${color.border}`,
                borderRadius:"6px",
                fontSize:    "18px",
                fontWeight:  font.weightSemibold,
                letterSpacing:"2px",
                textAlign:   "center",
                color:       color.textPrimary,
                background:  "#fff",
                outline:     "none",
                fontFamily:  font.family,
              }}
              onFocus={(e) => {
                e.target.style.borderColor = color.borderFocus;
                e.target.style.boxShadow   = "0 0 0 3px rgba(201,121,58,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = color.border;
                e.target.style.boxShadow   = "none";
              }}
            />
          </FormField>
        )}

        <Button type="submit" style={{ marginBottom: "8px" }}>
          Verify and sign in
        </Button>

        <Button
          variant="ghost"
          type="button"
          onClick={() => setUseBackup((v) => !v)}
        >
          {useBackup ? "Use authenticator app instead" : "Use a backup code instead"}
        </Button>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <LinkButton
            style={{ fontSize: font.sizeMd, color: color.textMuted, fontWeight: 500 }}
            onClick={() => navigate("login")}
          >
            ← Back to sign in
          </LinkButton>
        </div>
      </form>
    </AuthCard>
  );
}