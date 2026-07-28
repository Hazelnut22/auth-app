import { useState } from "react";
import AuthCard from "../components/ui/AuthCard";
import FormField from "../components/ui/FormField";
import PasswordInput from "../components/ui/PasswordInput";
import Button from "../components/ui/Button";
import CaptchaWidget from "../components/ui/CaptchaWidget";
import LinkButton from "../components/ui/LinkButton";
import Alert from "../components/ui/Alert";
import api from "../api/axios.js";
import tokens from "../styles/tokens";
import {toast} from "../components/ui/Toast.jsx"

const { color, font } = tokens;

export default function Login({ navigate, onLoginSuccess, successMessage }) {
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [captcha,      setCaptcha]      = useState({ token: "", answer: "" });
  const [captchaError, setCaptchaError] = useState("");
  const [loading,      setLoading]      = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captcha.token || !captcha.answer) {
      setCaptchaError("Please complete the CAPTCHA.");
      return;
    }

    setLoading(true);
    setCaptchaError("");

    try {
      const res = await api.post("/app/auth/login", {
        email,
        password,
        captchaToken:  captcha.token,
        captchaAnswer: captcha.answer,
      });

      if (res.data.data.mfaRequired) {
        navigate("mfa");
      } else {
        onLoginSuccess();
      }

    } catch (err) {
      toast.error(err.response?.data?.error ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <>
      Don&apos;t have an account yet?{" "}
      <LinkButton onClick={() => navigate("register")}>Create one</LinkButton>
    </>
  );

  return (
    <AuthCard
      heading="Login"
      subheading="Please enter your credentials."
      footer={footer}
    >
      <form onSubmit={handleSubmit} noValidate>

        {successMessage && <Alert variant="success">{successMessage}</Alert>}

        <FormField id="login-email" label="Email address">
          <input
            id="login-email"
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
              e.target.style.boxShadow   = "0 0 0 3px rgba(201,121,58,0.12)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = color.border;
              e.target.style.boxShadow   = "none";
            }}
          />
        </FormField>

        <FormField id="login-password" label="Password">
          <PasswordInput
            id="login-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </FormField>

        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "20px",
        }}>
          <LinkButton
            style={{ fontSize: font.sizeMd, color: color.textSecondary, fontWeight: 500 }}
            onClick={() => navigate("forgot-password")}
          >
            Forgot password?
          </LinkButton>
        </div>

        <CaptchaWidget
          onVerify={setCaptcha}
          onExpire={() => setCaptchaError("CAPTCHA expired. A new one has been loaded.")}
          error={captchaError}
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>

      </form>
    </AuthCard>
  );
}