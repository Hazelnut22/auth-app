import { useState, useEffect } from "react";
import AuthCard   from "../components/ui/AuthCard";
import OtpInput   from "../components/ui/OtpInput";
import Alert      from "../components/ui/Alert";
import Button     from "../components/ui/Button";
import LinkButton from "../components/ui/LinkButton";
import api        from "../api/axios.js";
import tokens     from "../styles/tokens";

const { color, font } = tokens;

/* ── Email icon ─────────────────────────────────────────────────── */
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
 * EmailVerification
 * Shown after registration. User enters the 6-digit activation OTP
 * sent to their email. Account is blocked from login until verified.
 *
 * Props:
 *   navigate  {(screen: string, state?: object) => void}
 *   email     {string}  — passed from Register so we know who to verify
 */
export default function EmailVerification({ navigate, email }) {
  const [otp,          setOtp]          = useState("");
  const [serverError,  setServerError]  = useState("");
  const [successMsg,   setSuccessMsg]   = useState("");
  const [loading,      setLoading]      = useState(false);
  const [resending,    setResending]    = useState(false);
  const [countdown,    setCountdown]    = useState(120); // 2-min TTL shown to user
  const [canResend,    setCanResend]    = useState(false);

  // Countdown timer — matches the 2-minute server TTL
  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatCountdown = () => {
    const m = Math.floor(countdown / 60);
    const s = countdown % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Verify the OTP the user typed
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setServerError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      await api.post("/app/auth/activate", { email, otp });
      // Account activated — send to login with a success message
      navigate("login", { message: "Email verified! You can now sign in." });

    } catch (err) {
      setServerError(
        err.response?.data?.error ?? "Verification failed. Please try again."
      );
      // Reset OTP input on failure so user starts fresh
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // Resend a fresh OTP
  const handleResend = async () => {
    setResending(true);
    setServerError("");
    setSuccessMsg("");

    try {
      await api.post("/app/auth/activate/resend", { email });
      setSuccessMsg("A new code has been sent to your email.");
      setCountdown(120);   // reset timer
      setCanResend(false);
      setOtp("");
    } catch (err) {
      setServerError(
        err.response?.data?.error ?? "Could not resend code. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  // Mask email for display — show j***@example.com
  const maskedEmail = email
    ? email.replace(/^(.)(.*)(@.*)$/, (_, first, middle, domain) =>
        first + "*".repeat(Math.min(middle.length, 4)) + domain
      )
    : "your email";

  return (
    <AuthCard
      heading="Verify your email"
      subheading={`We sent a 6-digit code to ${maskedEmail}. Enter it below to activate your account.`}
    >
      {/* Icon */}
      <div style={{
        width: "52px", height: "52px",
        background: color.bgAccentLight, borderRadius: "12px",
        display: "flex", alignItems: "center",
        justifyContent: "center", marginBottom: "18px",
      }}>
        <EmailIcon />
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {serverError && (
          <Alert variant="error">{serverError}</Alert>
        )}
        {successMsg && (
          <Alert variant="success">{successMsg}</Alert>
        )}

        {/* 6-digit OTP input */}
        <OtpInput value={otp} onChange={setOtp} />

        {/* Countdown + expiry notice */}
        <p style={{
          textAlign:    "center",
          fontSize:     font.sizeSm,
          color:        countdown > 0 ? color.textMuted : color.error,
          marginBottom: "18px",
          marginTop:    "-8px",
        }}>
          {countdown > 0
            ? `Code expires in ${formatCountdown()}`
            : "Code has expired — please request a new one."
          }
        </p>

        <Button type="submit" disabled={loading || countdown <= 0}>
          {loading ? "Verifying…" : "Verify email"}
        </Button>

        {/* Resend */}
        <div style={{ textAlign: "center", marginTop: "16px" }}>
          {canResend ? (
            <LinkButton
              onClick={handleResend}
              disabled={resending}
              style={{ fontSize: font.sizeMd }}
            >
              {resending ? "Sending…" : "Resend verification code"}
            </LinkButton>
          ) : (
            <span style={{ fontSize: font.sizeSm, color: color.textMuted }}>
              Didn't get it?{" "}
              <span style={{ color: color.textMuted }}>
                Resend available in {formatCountdown()}
              </span>
            </span>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "12px" }}>
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