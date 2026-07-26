import { useState, useEffect } from "react";
import AuthCard  from "../components/ui/AuthCard";
import OtpInput  from "../components/ui/OtpInput";
import Alert     from "../components/ui/Alert";
import Button    from "../components/ui/Button";
import LinkButton from "../components/ui/LinkButton";
import api       from "../api/axios.js";
import tokens    from "../styles/tokens";

const { color, font, radius } = tokens;

/* ── Step indicator ─────────────────────────────────────────────── */
function StepIndicator({ current }) {
  const steps = ["Get QR code", "Scan & save", "Confirm code"];
  return (
    <div style={{
      display:       "flex",
      alignItems:    "center",
      marginBottom:  "28px",
      gap:           "0",
    }}>
      {steps.map((label, i) => {
        const num    = i + 1;
        const active = current === num;
        const done   = current > num;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
            {/* Circle */}
            <div style={{
              width:          "28px",
              height:         "28px",
              borderRadius:   "50%",
              background:     done ? color.success : active ? color.cta : color.divider,
              color:          done || active ? "#fff" : color.textMuted,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       font.sizeSm,
              fontWeight:     font.weightSemibold,
              flexShrink:     0,
              transition:     "background 0.2s",
            }}>
              {done ? "✓" : num}
            </div>
            {/* Label */}
            <span style={{
              fontSize:    font.sizeSm,
              color:       active ? color.textPrimary : color.textMuted,
              fontWeight:  active ? font.weightMedium : font.weightRegular,
              marginLeft:  "6px",
              whiteSpace:  "nowrap",
            }}>
              {label}
            </span>
            {/* Connector line */}
            {i < 2 && (
              <div style={{
                flex:       1,
                height:     "1px",
                background: done ? color.success : color.divider,
                margin:     "0 8px",
                transition: "background 0.2s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * MFASetup
 * Three-step flow:
 *   Step 1 — call /2fa/setup to get QR code
 *   Step 2 — user scans QR with authenticator app
 *   Step 3 — user enters a code to confirm it worked → /2fa/setup
 *
 * Props:
 *   navigate  {(screen: string) => void}
 */
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
        <StepIndicator current={2} />

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
          I've scanned it — Continue
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
      <StepIndicator current={3} />

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