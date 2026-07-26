import { useState, useEffect } from "react";
import AuthCard      from "../components/ui/AuthCard";
import FormField     from "../components/ui/FormField";
import PasswordInput from "../components/ui/PasswordInput";
import StrengthBar   from "../components/ui/StrengthBar";
import OtpInput      from "../components/ui/OtpInput";
import Alert         from "../components/ui/Alert";
import Button        from "../components/ui/Button";
import LinkButton    from "../components/ui/LinkButton";
import { usePasswordStrength } from "../hooks/user_password_strength.js";
import api    from "../api/axios.js";
import tokens from "../styles/tokens";

const { color, font } = tokens;

/* ── Step indicator ─────────────────────────────────────────────── */
function StepIndicator({ current }) {
  const steps = ["Enter email", "Verify code", "New password"];
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

/**
 * ForgotPassword
 * Step 1 — enter email → POST /password/forgot
 * Step 2 — enter OTP  → POST /password/verify  (reuses OtpInput)
 * Step 3 — new password → POST /password/reset
 *
 * Props:
 *   navigate {(screen: string, state?: object) => void}
 */
export default function ForgetPassword({ navigate }) {
  const [step,         setStep]         = useState(1);
  const [email,        setEmail]        = useState("");
  const [otp,          setOtp]          = useState("");
  const [newPassword,  setNewPassword]  = useState("");
  const [confirmPw,    setConfirmPw]    = useState("");
  const [serverError,  setServerError]  = useState("");
  const [loading,      setLoading]      = useState(false);
  const [countdown,    setCountdown]    = useState(0);
  const [canResend,    setCanResend]    = useState(false);

  const strength = usePasswordStrength(newPassword);

  // Countdown timer for step 2
  useEffect(() => {
    if (step !== 2 || countdown <= 0) {
      if (step === 2 && countdown <= 0) setCanResend(true);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, countdown]);

  const formatCountdown = () => {
    const m = Math.floor(countdown / 60);
    const s = countdown % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const clearError = () => setServerError("");

  // ── Step 1 — send OTP ──────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      await api.post("/app/auth/password/forgot", { email });
      setStep(2);
      setCountdown(120); // 2-min countdown
      setCanResend(false);
    } catch (err) {
      setServerError(err.response?.data?.error ?? "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 — verify OTP ────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setServerError("Please enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    clearError();
    try {
      await api.post("/app/auth/password/verify", { email, otp });
      setStep(3);
    } catch (err) {
      setServerError(err.response?.data?.error ?? "Verification failed. Please try again.");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setLoading(true);
    clearError();
    setOtp("");
    try {
      await api.post("/app/auth/password/forgot", { email });
      setCountdown(120);
      setCanResend(false);
    } catch (err) {
      setServerError(err.response?.data?.error ?? "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3 — reset password ────────────────────────────────────
  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPw) {
      setServerError("Passwords do not match.");
      return;
    }
    setLoading(true);
    clearError();
    try {
      await api.post("/app/auth/password/reset", { newPassword });
      // Success — back to login with message
      navigate("login", { message: "Password reset successfully. You can now sign in." });
    } catch (err) {
      setServerError(err.response?.data?.error ?? "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <LinkButton onClick={() => navigate("login")}>← Back to sign in</LinkButton>
  );

  // ── Step 1 UI ──────────────────────────────────────────────────
  if (step === 1) {
    return (
      <AuthCard
        heading="Reset your password"
        subheading="Enter your email address and we'll send you a 6-digit code."
        footer={footer}
      >
        <form onSubmit={handleSendOtp} noValidate>
          {serverError && <Alert variant="error">{serverError}</Alert>}

          <FormField id="forgot-email" label="Email address">
            <input
              id="forgot-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); }}
              autoComplete="email"
              required
              style={{
                width: "100%", height: "42px", padding: "0 13px",
                border: `1.5px solid ${color.border}`, borderRadius: "6px",
                fontSize: font.sizeLg, color: color.textPrimary,
                background: "#fff", outline: "none", fontFamily: font.family,
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

          <Button type="submit" disabled={loading || !email}>
            {loading ? "Sending…" : "Send reset code"}
          </Button>
        </form>
      </AuthCard>
    );
  }

  // ── Step 2 UI — reuses OtpInput (same as EmailVerification) ───
  if (step === 2) {
    const maskedEmail = email.replace(/^(.)(.*)(@.*)$/, (_, f, m, d) =>
      f + "*".repeat(Math.min(m.length, 4)) + d
    );

    return (
      <AuthCard
        heading="Enter reset code"
        subheading={`We sent a 6-digit code to ${maskedEmail}.`}
        footer={footer}
      >
        <StepIndicator current={2} />

        <form onSubmit={handleVerifyOtp} noValidate>
          {serverError && <Alert variant="error">{serverError}</Alert>}

          {/* Reusing OtpInput — same component as email activation */}
          <OtpInput value={otp} onChange={setOtp} />

          {/* Countdown */}
          <p style={{
            textAlign: "center", fontSize: font.sizeSm, marginBottom: "18px",
            marginTop: "-8px",
            color: countdown > 0 ? color.textMuted : color.error,
          }}>
            {countdown > 0
              ? `Code expires in ${formatCountdown()}`
              : "Code has expired — please request a new one."
            }
          </p>

          <Button type="submit" disabled={loading || countdown <= 0}>
            {loading ? "Verifying…" : "Verify code"}
          </Button>

          {/* Resend */}
          <div style={{ textAlign: "center", marginTop: "14px" }}>
            {canResend ? (
              <LinkButton onClick={handleResend} disabled={loading}>
                {loading ? "Sending…" : "Resend code"}
              </LinkButton>
            ) : (
              <span style={{ fontSize: font.sizeSm, color: color.textMuted }}>
                Resend available in {formatCountdown()}
              </span>
            )}
          </div>
        </form>
      </AuthCard>
    );
  }

  // ── Step 3 UI — new password ───────────────────────────────────
  return (
    <AuthCard
      heading="Set new password"
      subheading="Choose a strong password you haven't used before."
      footer={footer}
    >
      <StepIndicator current={3} />

      <form onSubmit={handleReset} noValidate>
        {serverError && <Alert variant="error">{serverError}</Alert>}

        <FormField id="reset-pw" label="New password">
          <PasswordInput
            id="reset-pw"
            placeholder="Create a strong password"
            value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); clearError(); }}
            autoComplete="new-password"
            required
          />
          <StrengthBar password={newPassword} strength={strength} />
        </FormField>

        <FormField id="reset-confirm" label="Confirm new password">
          <PasswordInput
            id="reset-confirm"
            placeholder="Repeat new password"
            value={confirmPw}
            onChange={(e) => { setConfirmPw(e.target.value); clearError(); }}
            autoComplete="new-password"
            required
          />
        </FormField>

        <Button type="submit" disabled={loading}>
          {loading ? "Resetting…" : "Reset password"}
        </Button>
      </form>
    </AuthCard>
  );
}