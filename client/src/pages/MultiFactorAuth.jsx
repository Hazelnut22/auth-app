import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import AuthCard from "../components/ui/AuthCard";
import OtpInput from "../components/ui/OtpInput";
import FormField from "../components/ui/FormField";
import Button from "../components/ui/Button";
import LinkButton from "../components/ui/LinkButton";
import api from "../api/axios.js";
import tokens from "../styles/tokens";
import { toast } from "../components/ui/Toast.jsx";

const { color, font } = tokens;

export default function MFA({ navigate, onLoginSuccess }) {
  const [mode, setMode] = useState("totp");
  const [otp, setOtp] = useState("");
  const [emailOtp, setEmailOtp] = useState("");
  const [backup, setBackup] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // clear all state when switch
  const switchMode = (next) => {
    setMode(next);
    setOtp("");
    setEmailOtp("");
    setBackup("");
  };

  // Send email OTP
  const handleSendEmailOtp = async () => {
    setLoading(true);
    try {
      await api.post("/app/auth/2fa/email/send");
      setEmailSent(true);
      toast.success("A verification code has been sent to your email.");
    } catch (err) {
      toast.error(err.response?.data?.error ?? "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "totp") {
        await api.post("/app/auth/2fa/verify", { token: otp });

      } else if (mode === "email") {
        await api.post("/app/auth/2fa/email/verify", { otp: emailOtp });

      }
      toast.success("Signed in successfully.");

      onLoginSuccess();

    } catch (err) {
      toast.error(err.response?.data?.error ?? "Verification failed. Please try again.");
      // Clear OTP on failure
      setOtp("");
      setEmailOtp("");
    } finally {
      setLoading(false);
    }
  };

  const headingMap = {
    totp: "Two-factor verification",
    email: "Email verification",
    backup: "Backup code",
  };

  const subheadingMap = {
    totp: "Enter the 6-digit code from your authenticator app. It rotate every 30 seconds.",
    email: emailSent
      ? "Enter the 6-digit code sent to your email"
      : "We'll send a one-time code to your email",
  };

  const iconMap = {
    totp: <Lock size={26} color={color.accent} />,
    email: <Mail size={26} color={color.accent} />,
  };

  return (
    <AuthCard
      heading={headingMap[mode]}
      subheading={subheadingMap[mode]}
    >
      <div style={{
        width: "52px",
        height: "52px",
        background: color.bgAccentLight,
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "18px",
        marginLeft: "auto",
        marginRight: "auto",
      }}>
        {iconMap[mode]}
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {mode === "totp" && (
          <OtpInput value={otp} onChange={setOtp} />
        )}

        {mode === "email" && (
          <>
            {!emailSent ? (
              // send the code first
              <Button
                type="button"
                onClick={handleSendEmailOtp}
                disabled={loading}
                style={{ marginBottom: "8px" }}
              >
                {loading ? "Sending…" : "Send code to my email"}
              </Button>
            ) : (
              // enter the code
              <OtpInput value={emailOtp} onChange={setEmailOtp} />
            )}
          </>
        )}

        {(mode !== "email" || emailSent) && (
          <Button
            type="submit"
            disabled={loading}
            style={{ marginBottom: "8px" }}
          >
            {loading ? "Verifying…" : "Verify and sign in"}
          </Button>
        )}

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginTop: mode === "email" && !emailSent ? "0" : "4px",
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