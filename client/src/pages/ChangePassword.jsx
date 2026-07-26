import { useState } from "react";
import AuthCard      from "../components/ui/AuthCard";
import FormField     from "../components/ui/FormField";
import PasswordInput from "../components/ui/PasswordInput";
import StrengthBar   from "../components/ui/StrengthBar";
import Alert         from "../components/ui/Alert";
import Button        from "../components/ui/Button";
import LinkButton    from "../components/ui/LinkButton";
import { usePasswordStrength } from "../hooks/user_password_strength.js";
import api    from "../api/axios.js";
import tokens from "../styles/tokens";

const { color } = tokens;

export default function ChangePassword({ navigate }) {
  const [currentPw,   setCurrentPw]   = useState("");
  const [newPw,       setNewPw]       = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [serverError, setServerError] = useState("");
  const [successMsg,  setSuccessMsg]  = useState("");
  const [loading,     setLoading]     = useState(false);

  const strength = usePasswordStrength(newPw);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPw !== confirmPw) {
      setServerError("New passwords do not match.");
      return;
    }

    setLoading(true);
    setServerError("");
    setSuccessMsg("");

    try {
      await api.post("/app/auth/password/change", {
        currentPassword: currentPw,
        newPassword:     newPw,
      });

      setSuccessMsg("Password changed successfully.");
      // Clear form
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");

    } catch (err) {
      setServerError(
        err.response?.data?.error ?? "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <LinkButton onClick={() => navigate("dashboard")}>← Back to dashboard</LinkButton>
  );

  return (
    <AuthCard
      heading="Change password"
      subheading="You must not use your last passwords."
      footer={footer}
    >
      <form onSubmit={handleSubmit} noValidate>
        {serverError && <Alert variant="error">{serverError}</Alert>}
        {successMsg  && <Alert variant="success">{successMsg}</Alert>}

        <FormField id="cp-current" label="Current password">
          <PasswordInput
            id="cp-current"
            placeholder="Your current password"
            value={currentPw}
            onChange={(e) => { setCurrentPw(e.target.value); setServerError(""); }}
            autoComplete="current-password"
            required
          />
        </FormField>

        <FormField id="cp-new" label="New password">
          <PasswordInput
            id="cp-new"
            placeholder="Create a new strong password"
            value={newPw}
            onChange={(e) => { setNewPw(e.target.value); setServerError(""); }}
            autoComplete="new-password"
            required
          />
          <StrengthBar password={newPw} strength={strength} />
        </FormField>

        <FormField id="cp-confirm" label="Confirm new password">
          <PasswordInput
            id="cp-confirm"
            placeholder="Repeat new password"
            value={confirmPw}
            onChange={(e) => { setConfirmPw(e.target.value); setServerError(""); }}
            autoComplete="new-password"
            required
          />
        </FormField>

        <Button type="submit" disabled={loading} style={{ marginBottom: "8px" }}>
          {loading ? "Updating…" : "Update password"}
        </Button>

        <Button variant="ghost" type="button" onClick={() => navigate("dashboard")}>
          Cancel
        </Button>
      </form>
    </AuthCard>
  );
}