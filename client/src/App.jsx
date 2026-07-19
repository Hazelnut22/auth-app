import { useState } from "react";
import Login             from "./pages/Login";
import Register          from "./pages/Register";
import MFA               from "./pages/MultiFactorAuth";
import ChangePassword    from "./pages/ForgotPassword";
import Dashboard         from "./pages/Dashboard";
import EmailVerification from "./pages/EmailVerification";
import tokens            from "./styles/tokens";
import "./styles/global.css";

const { color, font } = tokens;

// Screens that are only for unauthenticated users
const AUTH_SCREENS = ["login", "register", "mfa", "change-password", "verify-email"];

export default function App() {
  const [screen,     setScreen]     = useState("login");
  const [screenState, setScreenState] = useState({}); // carries data between screens
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /**
   * navigate(target, state?)
   * Controls all screen transitions.
   * Optional state object is passed as props to the next screen
   * e.g. navigate("verify-email", { email: "user@example.com" })
   */
  const navigate = (target, state = {}) => {
    if (target === "dashboard" && !isLoggedIn) {
      setScreen("login");
      return;
    }
    if (AUTH_SCREENS.includes(target) && isLoggedIn) {
      setScreen("dashboard");
      return;
    }
    setScreenState(state);
    setScreen(target);
  };

  const onLoginSuccess = () => {
    setIsLoggedIn(true);
    setScreen("dashboard");
    setScreenState({});
  };

  const onLogout = () => {
    setIsLoggedIn(false);
    setScreen("login");
    setScreenState({});
  };

  // Guard: redirect if trying to access wrong screen for auth state
  const resolvedScreen = (() => {
    if (isLoggedIn  && AUTH_SCREENS.includes(screen)) return "dashboard";
    if (!isLoggedIn && screen === "dashboard")         return "login";
    return screen;
  })();

  // Dashboard layout
  if (resolvedScreen === "dashboard") {
    return (
      <div className="auth-page">
        <Dashboard navigate={navigate} onLogout={onLogout} />
      </div>
    );
  }

  // Render the active auth screen, passing screenState as spread props
  const renderScreen = () => {
    const commonProps = { navigate, onLoginSuccess };

    switch (resolvedScreen) {
      case "login":
        // Pass success message if coming from email verification
        return <Login {...commonProps} successMessage={screenState.message} />;

      case "register":
        return <Register {...commonProps} />;

      case "mfa":
        return <MFA {...commonProps} />;

      case "verify-email":
        // email is passed from Register on success
        return (
          <EmailVerification
            {...commonProps}
            email={screenState.email ?? ""}
          />
        );

      case "change-password":
        return <ChangePassword {...commonProps} />;

      default:
        return <Login {...commonProps} />;
    }
  };

  return (
    <div className="auth-page">
      {renderScreen()}
      <p className="page-footer">
        Protected by end-to-end encryption · Argon2id · TOTP MFA
      </p>
    </div>
  );
}