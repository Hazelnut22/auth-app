import { useState } from "react";
import AuthCard   from "../components/ui/AuthCard";
import OtpInput   from "../components/ui/OtpInput";
import FormField  from "../components/ui/FormField";
import Alert      from "../components/ui/Alert";
import Button     from "../components/ui/Button";
import LinkButton from "../components/ui/LinkButton";
import api        from "../api/axios.js";
import tokens     from "../styles/tokens";

const { color, font } = tokens;

/* ── Icons ──────────────────────────────────────────────────────── */
function LockIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke={color.accent} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
      <circle cx="12" cy="16" r="1" fill={color.accent} />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
      stroke={color.accent} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
}

/**
 * MFA
 * Three modes:
 *   "totp"   — 6-digit code from authenticator app  (primary)
 *   "email"  — 6-digit code sent to registered email (fallback)
 *   "backup" — single-use backup code               (last resort)
 *
 * Props:
 *   navigate        {(screen: string) => void}
 *   onLoginSuccess  {() => void}
 */
export default function MFA({ navigate, onLoginSuccess }) {
  // mode controls which UI + which API endpoint is used
  const [mode,        setMode]        = useState("totp");
  const [otp,         setOtp]         = useState("");
  const [emailOtp,    setEmailOtp]    = useState("");
  const [backup,      setBackup]      = useState("");
  const [serverError, setServerError] = useState("");
  const [successMsg,  setSuccessMsg]  = useState("");
  const [loading,     setLoading]     = useState(false);
  const [emailSent,   setEmailSent]   = useState(false);

  // Switch mode and clear all state
  const switchMode = (next) => {
    setMode(next);
    setServerError("");
    setSuccessMsg("");
    setOtp("");
    setEmailOtp("");
    setBackup("");
  };

  // Send email OTP — calls backend which emails the code
  const handleSendEmailOtp = async () => {
    setLoading(true);
    setServerError("");
    setSuccessMsg("");
    try {
      await api.post("/app/auth/2fa/email/send");
      setEmailSent(true);
      setSuccessMsg("A verification code has been sent to your registered email.");
    } catch (err) {
      setServerError(
        err.response?.data?.error ?? "Failed to send code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Submit handler — calls the right endpoint per mode
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError("");

    try {
      if (mode === "totp") {
        // Primary: TOTP from authenticator app
        await api.post("/app/auth/2fa/verify", { token: otp });

      } else if (mode === "email") {
        // Fallback: OTP sent to registered email
        await api.post("/app/auth/2fa/email/verify", { otp: emailOtp });

      } else {
        // Last resort: backup code
        await api.post("/app/auth/2fa/reset", { backupCode: backup });
      }

      // Any path reaching here = fully authenticated
      onLoginSuccess();

    } catch (err) {
      setServerError(
        err.response?.data?.error ?? "Verification failed. Please try again."
      );
      // Clear OTP on failure — user must re-enter
      setOtp("");
      setEmailOtp("");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic heading + subheading per mode
  const headingMap = {
    totp:   "Two-factor verification",
    email:  "Email verification",
    backup: "Backup code",
  };

  const subheadingMap = {
    totp:   "Enter the 6-digit code from your authenticator app. Codes rotate every 30 seconds.",
    email:  emailSent
      ? "Enter the 6-digit code sent to your registered email address."
      : "We'll send a one-time code to your registered email address.",
    backup: "Enter one of your single-use backup codes.",
  };

  const iconMap = {
    totp:   <LockIcon />,
    email:  <EmailIcon />,
    backup: <LockIcon />,
  };

  return (
    <AuthCard
      heading={headingMap[mode]}
      subheading={subheadingMap[mode]}
    >
      {/* Icon */}
      <div style={{
        width: "52px", height: "52px",
        background: color.bgAccentLight, borderRadius: "12px",
        display: "flex", alignItems: "center",
        justifyContent: "center", marginBottom: "18px",
      }}>
        {iconMap[mode]}
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {serverError && <Alert variant="error">{serverError}</Alert>}
        {successMsg  && <Alert variant="success">{successMsg}</Alert>}

        {/* ── TOTP mode ───────────────────────────────────────── */}
        {mode === "totp" && (
          <OtpInput value={otp} onChange={setOtp} />
        )}

        {/* ── Email OTP mode ──────────────────────────────────── */}
        {mode === "email" && (
          <>
            {!emailSent ? (
              // Step 1 — send the code first
              <Button
                type="button"
                onClick={handleSendEmailOtp}
                disabled={loading}
                style={{ marginBottom: "8px" }}
              >
                {loading ? "Sending…" : "Send code to my email"}
              </Button>
            ) : (
              // Step 2 — enter the received code
              <OtpInput value={emailOtp} onChange={setEmailOtp} />
            )}
          </>
        )}

        {/* ── Backup code mode ────────────────────────────────── */}
        {mode === "backup" && (
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
                width: "100%", height: "42px", padding: "0 13px",
                border: `1.5px solid ${color.border}`, borderRadius: "6px",
                fontSize: "18px", fontWeight: font.weightSemibold,
                letterSpacing: "2px", textAlign: "center",
                color: color.textPrimary, background: "#fff",
                outline: "none", fontFamily: font.family,
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

        {/* Submit — hidden in email mode before code is sent */}
        {(mode !== "email" || emailSent) && (
          <Button
            type="submit"
            disabled={loading}
            style={{ marginBottom: "8px" }}
          >
            {loading ? "Verifying…" : "Verify and sign in"}
          </Button>
        )}

        {/* ── Mode switcher ────────────────────────────────────── */}
        <div style={{
          display:       "flex",
          flexDirection: "column",
          gap:           "8px",
          marginTop:     mode === "email" && !emailSent ? "0" : "4px",
        }}>
          {mode !== "totp" && (
            <Button variant="ghost" type="button" onClick={() => switchMode("totp")}>
              Use authenticator app instead
            </Button>
          )}
          {mode !== "email" && (
            <Button variant="ghost" type="button" onClick={() => switchMode("email")}>
              Use email verification instead
            </Button>
          )}
          {mode !== "backup" && (
            <Button variant="ghost" type="button" onClick={() => switchMode("backup")}>
              Use a backup code instead
            </Button>
          )}
        </div>

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