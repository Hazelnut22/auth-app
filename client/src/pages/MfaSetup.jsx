import { useState, useEffect } from "react";
import AuthCard  from "../components/ui/AuthCard";
import OtpInput  from "../components/ui/OtpInput";
import Alert     from "../components/ui/Alert";
import Button    from "../components/ui/Button";
import LinkButton from "../components/ui/LinkButton";
import api       from "../api/axios.js";
import tokens    from "../styles/tokens";
import StepIndicator from "../components/ui/StepIndicator.jsx";

const { color, font, radius } = tokens;

const steps = ["Get QR code", "Scan & save", "Confirm code"];

export default function MFASetup({ navigate }) {
  const [step,        setStep]        = useState(1);
  const [qrCode,      setQrCode]      = useState("");
  const [secret,      setSecret]      = useState("");
  const [otp,         setOtp]         = useState("");
  const [serverError, setServerError] = useState("");
  const [loading,     setLoading]     = useState(false);

  // Step 1 — fetch QR code from backend on mount
  useEffect(() => {
    const setup = async () => {
      setLoading(true);
      try {
        const res = await api.post("/app/auth/2fa/setup");
        setQrCode(res.data.data.qrCode);
        setSecret(res.data.data.secret);
        setStep(2);
      } catch (err) {
        setServerError(
          err.response?.data?.error ?? "Failed to generate QR code. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    setup();
  }, []);

  // Step 3 — verify the code user entered after scanning
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setServerError("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      await api.post("/app/auth/2fa/verify", { token: otp });
      // MFA is now active — go back to dashboard
      navigate("dashboard");
    } catch (err) {
      setServerError(
        err.response?.data?.error ?? "Invalid code. Please try again."
      );
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 1 — Loading QR ────────────────────────────────────────
  if (step === 1) {
    return (
      <AuthCard
        heading="Set up two-factor auth"
        subheading="Generating your QR code…"
      >
        {serverError && <Alert variant="error">{serverError}</Alert>}

        {!serverError && (
          <div style={{
            display:        "flex",
            justifyContent: "center",
            alignItems:     "center",
            height:         "120px",
            color:          color.textMuted,
            fontSize:       font.sizeMd,
          }}>
            Loading…
          </div>
        )}

        {serverError && (
          <Button onClick={() => window.location.reload()}>
            Try again
          </Button>
        )}

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <LinkButton
            style={{ fontSize: font.sizeMd, color: color.textMuted, fontWeight: 500 }}
            onClick={() => navigate("dashboard")}
          >
            ← Back to dashboard
          </LinkButton>
        </div>
      </AuthCard>
    );
  }

  // ── Step 2 — Show QR code ──────────────────────────────────────
  if (step === 2) {
    return (
      <AuthCard
        heading="Set up two-factor auth"
        subheading="Scan the QR code below with your authenticator app, then click Continue."
      >
        <StepIndicator current={2} steps={steps} />

        {serverError && <Alert variant="error">{serverError}</Alert>}

        {/* QR code image */}
        <div style={{
          display:        "flex",
          justifyContent: "center",
          marginBottom:   "20px",
        }}>
          <img
            src={qrCode}
            alt="MFA QR code — scan with your authenticator app"
            style={{
              width:        "180px",
              height:       "180px",
              border:       `1.5px solid ${color.border}`,
              borderRadius: radius.md,
              padding:      "8px",
              background:   "#fff",
            }}
          />
        </div>

        {/* Manual entry fallback */}
        <div style={{
          background:   color.bgAccentLight,
          border:       `1.5px solid ${color.border}`,
          borderRadius: radius.md,
          padding:      "12px 14px",
          marginBottom: "20px",
        }}>
          <p style={{ fontSize: font.sizeSm, color: color.textSecondary, marginBottom: "6px" }}>
            Can't scan? Enter this key manually:
          </p>
          <p style={{
            fontSize:      font.sizeMd,
            fontWeight:    font.weightSemibold,
            color:         color.textPrimary,
            letterSpacing: "2px",
            wordBreak:     "break-all",
            fontFamily:    "monospace",
          }}>
            {secret}
          </p>
        </div>

        {/* Recommended apps */}
        <p style={{ fontSize: font.sizeSm, color: color.textMuted, marginBottom: "20px" }}>
          Works with <strong>Google Authenticator</strong>, <strong>Authy</strong>,
          or <strong>Microsoft Authenticator</strong>.
        </p>

        <Button onClick={() => { setStep(3); setServerError(""); }}>
          Continue
        </Button>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <LinkButton
            style={{ fontSize: font.sizeMd, color: color.textMuted, fontWeight: 500 }}
            onClick={() => navigate("dashboard")}
          >
            ← Cancel
          </LinkButton>
        </div>
      </AuthCard>
    );
  }

  // ── Step 3 — Confirm code ──────────────────────────────────────
  return (
    <AuthCard
      heading="Confirm your code"
      subheading="Enter the 6-digit code from your authenticator app to confirm it's working."
    >
      <StepIndicator current={3} steps={steps} />

      <form onSubmit={handleVerify} noValidate>
        {serverError && <Alert variant="error">{serverError}</Alert>}

        <OtpInput value={otp} onChange={setOtp} />

        <Button type="submit" disabled={loading} style={{ marginBottom: "8px" }}>
          {loading ? "Verifying…" : "Enable two-factor auth"}
        </Button>

        <Button
          variant="ghost"
          type="button"
          onClick={() => { setStep(2); setServerError(""); setOtp(""); }}
        >
          ← Back to QR code
        </Button>
      </form>
    </AuthCard>
  );
}