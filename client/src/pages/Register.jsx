import { useState } from "react";
import AuthCard from "../components/ui/AuthCard";
import FormField from "../components/ui/FormField";
import PasswordInput from "../components/ui/PasswordInput";
import StrengthBar from "../components/ui/StrengthBar";
import Button from "../components/ui/Button";
import CaptchaWidget from "../components/ui/CaptchaWidget";
import LinkButton from "../components/ui/LinkButton";
import { usePasswordStrength } from "../hooks/user_password_strength.js";
import tokens from "../styles/tokens";
import api from "../api/axios.js";
import {toast} from "../components/ui/Toast.jsx";

const { color, font } = tokens;

export default function Register({ navigate }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [captcha, setCaptcha] = useState({ token: "", answer: "" });
  const [captchaError, setCaptchaError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = usePasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setConfirmError("Passwords do not match.");
      return;
    }
    if (!captcha.token || !captcha.answer) {
      setCaptchaError("Please complete the CAPTCHA.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/app/auth/register", {
        username: name,
        email,
        password,
        captchaToken: captcha.token,
        captchaAnswer: captcha.answer,
      });

      // Go to email verification — pass email so the OTP screen knows who to verify
      toast.success("Account created! Check your email for a verification code.");
      navigate("verify-email", { email });

    } catch (err) {
      toast.error(err.response?.data?.error ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      Already have an account?{" "}
      <LinkButton onClick={() => navigate("login")}>Sign in</LinkButton>
    </>
  );

  return (
    <AuthCard
      heading="Create account"
      subheading="Fill in the details below to get started."
      footer={footer}
    >
      <form onSubmit={handleSubmit} noValidate>
        <FormField id="reg-name" label="Full name">
          <input
            id="reg-name"
            type="text"
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            required
            style={{
              width: "100%", height: "42px", padding: "0 13px",
              border: `1.5px solid ${color.border}`, borderRadius: "6px",
              fontSize: font.sizeLg, color: color.textPrimary,
              background: "#fff", outline: "none", fontFamily: font.family,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = color.borderFocus;
              e.target.style.boxShadow = "0 0 0 3px rgba(201,121,58,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = color.border;
              e.target.style.boxShadow = "none";
            }}
          />
        </FormField>

        <FormField id="reg-email" label="Email address">
          <input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              e.target.style.boxShadow = "0 0 0 3px rgba(201,121,58,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = color.border;
              e.target.style.boxShadow = "none";
            }}
          />
        </FormField>

        <FormField id="reg-password" label="Password">
          <PasswordInput
            id="reg-password"
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <StrengthBar password={password} strength={strength} />
        </FormField>

        <FormField
          id="reg-confirm"
          label="Confirm password"
          error={confirmError}
        >
          <PasswordInput
            id="reg-confirm"
            placeholder="Repeat your password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value);
              if (confirmError) setConfirmError("");
            }}
            error={!!confirmError}
            autoComplete="new-password"
            required
          />
        </FormField>

        <CaptchaWidget
          onVerify={setCaptcha}
          onExpire={() => setCaptchaError("CAPTCHA expired. A new one has been loaded.")}
          error={captchaError}
        />

        <Button type="submit">
          Create account
        </Button>

        <div style={{
          textAlign: "center",
          fontSize: tokens.font.sizeSm,
          color: color.textSecondary,
          marginBottom: "4px",
        }}
        >
          By clicking this, you have agreed to our{" "}
          <LinkButton onClick={() => navigate("privacy-policy")}>privacy policy</LinkButton>
        </div>
      </form>
    </AuthCard>
  );
}
