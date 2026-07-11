import { useState } from "react";
import AuthCard             from "../components/ui/AuthCard";
import FormField            from "../components/ui/FormField";
import PasswordInput        from "../components/ui/PasswordInput";
import StrengthBar          from "../components/ui/StrengthBar";
import Alert                from "../components/ui/Alert";
import Button               from "../components/ui/Button";
import { usePasswordStrength } from "../hooks/user_password_strength.js";
import tokens               from "../styles/tokens";

const { font } = tokens;

/**
 * ChangePassword
 * Collects current password + new password (with strength check + confirm).
 * Displays the active password policy so users know the rules upfront.
 *
 * Props:
 *   navigate  {(screen: string) => void}
 */
export default function ChangePassword({ navigate }) {
  const [current,      setCurrent]      = useState("");
  const [newPassword,  setNewPassword]  = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [confirmError, setConfirmError] = useState("");

  const strength = usePasswordStrength(newPassword);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setConfirmError("Passwords do not match.");
      return;
    }
    setConfirmError("");
    // TODO: call POST /auth/password/change with { currentPassword: current, newPassword }
  };

  return (
    <AuthCard
      heading="Change password"
      subheading="Your new password cannot match any of your last 5 passwords."
    >
      {/* Policy notice */}
      <Alert variant="info">
        🔒 Passwords are hashed with Argon2id · Expires every 90 days · History of 5 enforced
      </Alert>

      <form onSubmit={handleSubmit} noValidate>
        <FormField id="cp-current" label="Current password">
          <PasswordInput
            id="cp-current"
            placeholder="Your current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
          />
        </FormField>

        <FormField id="cp-new" label="New password">
          <PasswordInput
            id="cp-new"
            placeholder="Create a new strong password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <StrengthBar password={newPassword} strength={strength} />
        </FormField>

        <FormField
          id="cp-confirm"
          label="Confirm new password"
          error={confirmError}
        >
          <PasswordInput
            id="cp-confirm"
            placeholder="Repeat new password"
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

        <Button type="submit" style={{ marginBottom: "8px" }}>
          Update password
        </Button>

        <Button
          variant="ghost"
          type="button"
          onClick={() => navigate("login")}
        >
          Cancel
        </Button>
      </form>
    </AuthCard>
  );
}