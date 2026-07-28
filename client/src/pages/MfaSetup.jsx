import { useState, useEffect } from "react";
import AuthCard  from "../components/ui/AuthCard";
import OtpInput  from "../components/ui/OtpInput";
import Button    from "../components/ui/Button";
import LinkButton from "../components/ui/LinkButton";
import api       from "../api/axios.js";
import tokens    from "../styles/tokens";
import StepIndicator from "../components/ui/StepIndicator.jsx";
import {toast} from "../components/ui/Toast.jsx";

const { color, font, radius } = tokens;

const steps = ["Get QR code", "Scan & save", "Confirm code"];

export default function MFASetup({ navigate }) {
  const [step,        setStep]        = useState("checking");
  const [qrCode,      setQrCode]      = useState("");
  const [secret,      setSecret]      = useState("");
  const [otp,         setOtp]         = useState("");
  const [loading,     setLoading]     = useState(false);

  // On mount — check current MFA status before deciding what to show
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.get("/app/auth/status");
        if (res.data.data.user.isMfaActive) {
          setStep("enabled");
        } else {
          startSetup();
        }
      } catch (err) {
        toast.error(
          err.response?.data?.error ?? "Failed to load MFA status. Please try again."
        );
        setStep(1);
      }
    };
    checkStatus();
  }, []);

  // only called when MFA is NOT already active)
  const startSetup = async () => {
    setStep(1);
    setLoading(true);
    try {
      const res = await api.post("/app/auth/2fa/setup");
      setQrCode(res.data.data.qrCode);
      setSecret(res.data.data.secret);
      setStep(2);
    } catch (err) {
      toast.error(
        err.response?.data?.error ?? "Failed to generate QR code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // verify the code user entered after scanning
  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/app/auth/2fa/verify", { token: otp });
      toast.success("Two-factor authentication enabled.");
      navigate("dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.error ?? "Invalid code. Please try again."
      );
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  //  user enters current OTP to prove they still control the device
  const handleDisable = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/app/auth/2fa/reset");
      toast.success("Two-factor authentication disabled.");
      navigate("dashboard");
    } catch (err) {
      toast.error(
        err.response?.data?.error ?? "Invalid code. Please try again."
      );
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // ── Checking status ─────────────────────────────────────────────
  if (step === "checking") {
    return (
      <AuthCard heading="Two-factor auth" subheading="Checking your account…">
        <div style={{
          display: "flex", justifyContent: "center", alignItems: "center",
          height: "120px", color: color.textMuted, fontSize: font.sizeMd,
        }}>
          Loading…
        </div>
      </AuthCard>
    );
  }

  // ── MFA already enabled — manage / disable ──────────────────────
  if (step === "enabled") {
    return (
      <AuthCard
        heading="Two-factor auth"
        subheading="Two-factor authentication is currently enabled on your account."
      >

        <div style={{
          background:   color.bgAccentLight,
          border:       `1.5px solid ${color.border}`,
          borderRadius: radius.md,
          padding:      "14px 16px",
          marginBottom: "20px",
          display:      "flex",
          alignItems:   "center",
          gap:          "10px",
        }}>
          <span style={{ fontSize: font.sizeMd, color: color.textPrimary, fontWeight: font.weightMedium }}>
            Multi-factor auth is active
          </span>
        </div>

        <p style={{ fontSize: font.sizeSm, color: color.textSecondary, marginBottom: "20px" }}>
          If you disable this, your account will only be protected by your password.
        </p>

        <Button
          variant="primary"
          onClick={() => { setStep("disable-confirm"); setOtp(""); }}
        >
          Disable MFA
        </Button>

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

  // ── Confirm disable — require current OTP ───────────────────────
  if (step === "disable-confirm") {
    return (
      <AuthCard
        heading="Disable two-factor auth"
        subheading="Enter the 6-digit code from your authenticator app to confirm."
      >
        <form onSubmit={handleDisable} noValidate>

          <OtpInput value={otp} onChange={setOtp} />

          <Button
            type="submit"
            variant="danger"
            disabled={loading}
            style={{ marginBottom: "8px" }}
          >
            {loading ? "Disabling…" : "Confirm disable"}
          </Button>

          <Button
            variant="ghost"
            type="button"
            onClick={() => { setStep("enabled"); setOtp(""); }}
          >
            ← Cancel
          </Button>
        </form>
      </AuthCard>
    );
  }

  // ── Step 1 — Loading QR ────────────────────────────────────────
  if (step === 1) {
    return (
      <AuthCard
        heading="Set up two-factor auth"
        subheading="Generating your QR code…"
      >

        {(
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

        {(
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

        <p style={{ fontSize: font.sizeSm, color: color.textMuted, marginBottom: "20px" }}>
          Works with <strong>Google Authenticator</strong>, <strong>Authy</strong>,
          or <strong>Microsoft Authenticator</strong>.
        </p>

        <Button onClick={() => { setStep(3); }}>
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

        <OtpInput value={otp} onChange={setOtp} />

        <Button type="submit" disabled={loading} style={{ marginBottom: "8px" }}>
          {loading ? "Verifying…" : "Enable two-factor auth"}
        </Button>

        <Button
          variant="ghost"
          type="button"
          onClick={() => { setStep(2); setOtp(""); }}
        >
          ← Back to QR code
        </Button>
      </form>
    </AuthCard>
  );
}