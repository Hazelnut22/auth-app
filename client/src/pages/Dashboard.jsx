import { useState, useEffect } from "react";
import tokens   from "../styles/tokens";
import api      from "../api/axios.js";

const { color, font, radius, shadow } = tokens;

/* ── Avatar icon ────────────────────────────────────────────────── */
function AvatarIcon({ initial }) {
  return (
    <div style={{
      width:           "72px",
      height:          "72px",
      borderRadius:    "50%",
      background:      `linear-gradient(135deg, ${color.cta}, ${color.accent})`,
      display:         "flex",
      alignItems:      "center",
      justifyContent:  "center",
      fontSize:        "28px",
      fontWeight:      font.weightSemibold,
      color:           "#fff",
      flexShrink:      0,
      boxShadow:       "0 2px 12px rgba(201,121,58,0.25)",
      userSelect:      "none",
    }}>
      {initial?.toUpperCase() ?? "?"}
    </div>
  );
}

/* ── Shield icon ────────────────────────────────────────────────── */
function ShieldIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke={active ? color.success : color.textMuted}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      {active && <polyline points="9 12 11 14 15 10" stroke={color.success} strokeWidth="2.5"/>}
    </svg>
  );
}

/* ── Info row ───────────────────────────────────────────────────── */
function InfoRow({ label, value, tag, tagColor }) {
  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: "space-between",
      padding:        "13px 0",
      borderBottom:   `1px solid ${color.divider}`,
    }}>
      <span style={{ fontSize: font.sizeMd, color: color.textSecondary }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{
          fontSize:   font.sizeMd,
          color:      color.textPrimary,
          fontWeight: font.weightMedium,
        }}>
          {value}
        </span>
        {tag && (
          <span style={{
            fontSize:     font.sizeSm,
            fontWeight:   font.weightMedium,
            color:        tagColor ?? color.success,
            background:   tagColor
              ? "rgba(192,68,10,0.08)"
              : "rgba(58,122,74,0.08)",
            padding:      "2px 8px",
            borderRadius: radius.pill,
          }}>
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * Dashboard
 * Protected page — only reachable after full login (+ MFA if enabled).
 *
 * Props:
 *   navigate  {(screen: string) => void}
 *   onLogout  {() => void}  — clears auth state in App
 */
export default function Dashboard({ navigate, onLogout }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  // Fetch current user info from GET /app/auth/status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/app/auth/status");
        setUser(res.data.user);
      } catch {
        // Token invalid or expired — send back to login
        navigate("login");
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await api.post("/app/auth/logout");
    } catch {
      // Even if request fails, clear local state
    }
    onLogout();
    navigate("login");
  };

  if (loading) {
    return (
      <div style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        minHeight:      "200px",
        color:          color.textMuted,
        fontSize:       font.sizeMd,
      }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{
      width:     "100%",
      maxWidth:  "460px",
    }}>
      {/* ── Card ───────────────────────────────────────────────── */}
      <div style={{
        background:   color.bgCard,
        borderRadius: radius.xl,
        boxShadow:    shadow.card,
        overflow:     "hidden",
      }}>
        {/* Seal stripe */}
        <div style={{
          height:     "3px",
          background: `linear-gradient(90deg, ${color.cta}, ${color.accent})`,
        }} aria-hidden="true" />

        {/* Header */}
        <div style={{
          padding:        "32px 40px 24px",
          display:        "flex",
          alignItems:     "center",
          gap:            "20px",
          borderBottom:   `1px solid ${color.divider}`,
        }}>
          <AvatarIcon initial={user?.username?.[0] ?? user?.email?.[0]} />

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{
              fontSize:      "20px",
              fontWeight:    font.weightSemibold,
              color:         color.textPrimary,
              letterSpacing: "-0.2px",
              marginBottom:  "3px",
              overflow:      "hidden",
              textOverflow:  "ellipsis",
              whiteSpace:    "nowrap",
            }}>
              {user?.username ?? "User"}
            </h1>
            <p style={{
              fontSize:     font.sizeMd,
              color:        color.textSecondary,
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}>
              {user?.email}
            </p>
          </div>

          {/* Profile settings button */}
          <button
            onClick={() => navigate("change-password")}
            title="Account settings"
            style={{
              background:   "none",
              border:       `1.5px solid ${color.border}`,
              borderRadius: radius.md,
              cursor:       "pointer",
              padding:      "7px",
              color:        color.textMuted,
              display:      "flex",
              alignItems:   "center",
              transition:   "border-color 0.15s, color 0.15s",
              flexShrink:   0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = color.accent;
              e.currentTarget.style.color       = color.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = color.border;
              e.currentTarget.style.color       = color.textMuted;
            }}
            aria-label="Account settings"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </button>
        </div>

        {/* Info rows */}
        <div style={{ padding: "4px 40px 8px" }}>
          <InfoRow
            label="Account status"
            value="Active"
            tag="Verified"
          />
          <InfoRow
            label="Two-factor auth"
            value={
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <ShieldIcon active={user?.isMfaActive} />
                {user?.isMfaActive ? "Enabled" : "Disabled"}
              </span>
            }
            tag={user?.isMfaActive ? null : "Recommended"}
            tagColor={user?.isMfaActive ? null : color.cta}
          />
          <InfoRow
            label="Password status"
            value={user?.passwordExpired ? "Expired" : "Up to date"}
            tag={user?.passwordExpired ? "Action required" : null}
            tagColor={user?.passwordExpired ? color.error : null}
          />
          <InfoRow
            label="Member since"
            value={user?.memberSince
              ? new Date(user.memberSince).toLocaleDateString("en-GB", {
                  day: "numeric", month: "long", year: "numeric"
                })
              : "—"
            }
          />
        </div>

        {/* Actions */}
        <div style={{ padding: "16px 40px 32px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Enable MFA prompt if not active */}
          {!user?.isMfaActive && (
            <button
              onClick={() => navigate("mfa")}
              style={{
                width:        "100%",
                height:       "44px",
                background:   color.bgAccentLight,
                border:       `1.5px solid ${color.cta}`,
                borderRadius: radius.md,
                color:        color.cta,
                fontSize:     font.sizeLg,
                fontWeight:   font.weightSemibold,
                cursor:       "pointer",
                display:      "flex",
                alignItems:   "center",
                justifyContent:"center",
                gap:          "8px",
                transition:   "background 0.15s",
                fontFamily:   font.family,
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#EDDDCC"}
              onMouseLeave={(e) => e.currentTarget.style.background = color.bgAccentLight}
            >
              <ShieldIcon active={false} />
              Enable two-factor authentication
            </button>
          )}

          {/* Password expired warning */}
          {user?.passwordExpired && (
            <button
              onClick={() => navigate("change-password")}
              style={{
                width:        "100%",
                height:       "44px",
                background:   color.errorBg,
                border:       `1.5px solid ${color.error}`,
                borderRadius: radius.md,
                color:        color.error,
                fontSize:     font.sizeLg,
                fontWeight:   font.weightSemibold,
                cursor:       "pointer",
                fontFamily:   font.family,
                transition:   "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#FBDDD4"}
              onMouseLeave={(e) => e.currentTarget.style.background = color.errorBg}
            >
              Update expired password
            </button>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              width:        "100%",
              height:       "44px",
              background:   "transparent",
              border:       `1.5px solid ${color.border}`,
              borderRadius: radius.md,
              color:        color.textSecondary,
              fontSize:     font.sizeMd,
              fontWeight:   font.weightMedium,
              cursor:       "pointer",
              fontFamily:   font.family,
              transition:   "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = color.error;
              e.currentTarget.style.color       = color.error;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = color.border;
              e.currentTarget.style.color       = color.textSecondary;
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      <p style={{
        marginTop:  "20px",
        fontSize:   font.sizeXs,
        color:      color.textMuted,
        textAlign:  "center",
      }}>
        Protected by end-to-end encryption · Argon2id · TOTP MFA
      </p>
    </div>
  );
}