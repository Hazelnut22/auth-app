import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MFA from "./pages/MultiFactorAuth";
import Dashboard from "./pages/Dashboard";
import EmailVerification from "./pages/EmailVerification";
import tokens from "./styles/tokens";
import "./styles/global.css";
import MFASetup from "./pages/MfaSetup";
import ForgetPassword from "./pages/ForgetPassword";
import api from "./api/axios";
import ChangePassword from "./pages/ChangePassword";
import { ToastProvider } from "./components/ui/Toast";

const { color, font } = tokens;

// Screens that are only for unauthenticated users
const AUTH_SCREENS = ["login", "register", "mfa", "forgot-password", "verify-email"];

export default function App() {
  const [screen, setScreen] = useState("login");
  const [screenState, setScreenState] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await api.get("/app/auth/status");
        setIsLoggedIn(true);
        setScreen("dashboard");
      } catch {
        setIsLoggedIn(false);
        setScreen("login");
      } finally {
        setChecking(false);
      }
    };
    checkSession();
  }, []);

  if (checking) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: color.bgPage,
        fontFamily: "-apple-system, sans-serif",
        fontSize: "14px",
        color: color.textMuted,
      }}>
        Loading…
      </div>
    );
  }

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

  // redirect if trying to access wrong screen for auth state
  const resolvedScreen = (() => {
    if (isLoggedIn && AUTH_SCREENS.includes(screen)) return "dashboard";
    if (!isLoggedIn && screen === "dashboard") return "login";
    return screen;
  })();

  // Dashboard layout
  if (resolvedScreen === "dashboard") {
    return <Dashboard navigate={navigate} onLogout={onLogout} />;
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

      case "forgot-password":
        return <ForgetPassword navigate={navigate} />;

      case "change-password":
        return <ChangePassword navigate={navigate} />;

      case "mfa-setup":
        return <MFASetup navigate={navigate} />;

      default:
        return <Login {...commonProps} />;
    }
  };

  return (
    <ToastProvider>
      <div className="auth-page">
        {renderScreen()}
        <p className="page-footer">
          copyright @ maria
        </p>
      </div>
    </ToastProvider>
  );
}