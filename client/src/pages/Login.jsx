import { useState } from "react";
import AuthCard      from "../components/ui/AuthCard";
import FormField     from "../components/ui/FormField";
import PasswordInput from "../components/ui/PasswordInput";
import Button        from "../components/ui/Button";
import CaptchaWidget from "../components/ui/CaptchaWidget";
import LinkButton    from "../components/ui/LinkButton";
import tokens        from "../styles/tokens";

const { color, font } = tokens;

/**
 * Login
 * Collects email + password, verifies CAPTCHA, then hands off to MFA.
 *
 * Props:
 *   navigate  {(screen: string) => void}  — provided by App router
 */
export default function Login({ navigate }) {
  const [email,          setEmail]          = useState("");
  const [password,       setPassword]       = useState("");
  const [captchaToken,   setCaptchaToken]   = useState(null);
  const [rememberMe,     setRememberMe]     = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: call POST /auth/login with { email, password, captchaToken }
    navigate("mfa");
  };

  const footer = (
    <>
      Don&apos;t have an account?{" "}
      <LinkButton onClick={() => navigate("register")}>Create one</LinkButton>
    </>
  );

  return (
    <AuthCard
      heading="Sign in"
      subheading="Enter your credentials to access your account."
      footer={footer}
    >
      <form onSubmit={handleSubmit} noValidate>
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
              width:        "100%",
              height:       "42px",
              padding:      "0 13px",
              border:       `1.5px solid ${color.border}`,
              borderRadius: "6px",
              fontSize:     font.sizeLg,
              color:        color.textPrimary,
              background:   "#fff",
              outline:      "none",
              fontFamily:   font.family,
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

        {/* Remember me + forgot password row */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          marginBottom:   "20px",
        }}>
          <label style={{
            display:    "flex",
            alignItems: "center",
            gap:        "7px",
            fontSize:   font.sizeMd,
            color:      color.textSecondary,
            cursor:     "pointer",
            userSelect: "none",
          }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: "15px", height: "15px", accentColor: color.cta }}
            />
            Keep me signed in
          </label>

          <LinkButton
            style={{ fontSize: font.sizeMd, color: color.textSecondary, fontWeight: 500 }}
            onClick={() => navigate("change-password")}
          >
            Forgot password?
          </LinkButton>
        </div>

        <CaptchaWidget onVerify={setCaptchaToken} />

        <Button type="submit">
          Sign in
        </Button>
      </form>
    </AuthCard>
  );
}