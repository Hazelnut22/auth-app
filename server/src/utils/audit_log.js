import ActivityLog from "../models/activity_log.js";

export const EVENTS = {
  REGISTER_SUCCESS:      "REGISTER_SUCCESS",
  LOGIN_SUCCESS:         "LOGIN_SUCCESS",
  LOGIN_FAILED:          "LOGIN_FAILED",
  LOGIN_BLOCKED_LOCKOUT: "LOGIN_BLOCKED_LOCKOUT",
  ACCOUNT_LOCKED:        "ACCOUNT_LOCKED",
  LOGOUT:                "LOGOUT",
  MFA_ENABLED:           "MFA_ENABLED",
  MFA_DISABLED:          "MFA_DISABLED",
  PASSWORD_CHANGED:      "PASSWORD_CHANGED",
  PASSWORD_RESET:        "PASSWORD_RESET",
};

export async function auditLog(userId, event, meta = {}) {
  try {
    await ActivityLog.create({ userId, event, meta });
  } catch (err) {
    console.error("[AuditLog] Failed to write event:", event, err.message);
  }
}