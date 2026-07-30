import { useState, useEffect } from "react";
import { MailCheck } from "lucide-react";
import AuthCard from "../components/ui/AuthCard";
import OtpInput from "../components/ui/OtpInput";
import Button from "../components/ui/Button";
import LinkButton from "../components/ui/LinkButton";
import api from "../api/axios.js";
import tokens from "../styles/tokens";
import { toast } from "../components/ui/Toast.jsx";

const { color, font } = tokens;

export default function EmailVerification({ navigate, email }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2-min
  const [canResend, setCanResend] = useState(false);

  // Countdown timer (2mins)
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
      toast.error("Please enter the full 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/app/auth/activate", { email, otp });
      // Account verified
      toast.success("Email verified! You can now sign in.");
      navigate("login");

    } catch (err) {
      toast.error(err.response?.data?.error ?? "Verification failed. Please try again.");
      // Reset input on failure
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  // Resend a fresh OTP
  const handleResend = async () => {
    setResending(true);

    try {
      await api.post("/app/auth/activate/resend", { email });
      toast.success("A new code has been sent to your email.");
      setCountdown(120);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      toast.error(err.response?.data?.error ?? "Could not resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

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
      <div style={{
        width: "52px", height: "52px",
        background: color.bgAccentLight, borderRadius: "12px",
        display: "flex", alignItems: "center",
        justifyContent: "center", marginBottom: "18px",
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        <MailCheck size={26} color={color.accent} />
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* 6-digit OTP input */}
        <OtpInput value={otp} onChange={setOtp} />

        <p style={{
          textAlign: "center",
          fontSize: font.sizeSm,
          color: countdown > 0 ? color.textMuted : color.error,
          marginBottom: "18px",
          marginTop: "-8px",
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