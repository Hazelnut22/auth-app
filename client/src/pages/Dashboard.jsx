import { useState, useEffect, useRef } from "react";
import api from "../api/axios.js";
import tokens from "../styles/tokens";
import ScoreRing from "../components/dashboard/ScoreRing.jsx";
import Sidebar from "../components/dashboard/SideBar.jsx";

const { color, font, space, radius, shadow } = tokens;

const navItems = [
  {
    label: "Dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    screen: "dashboard",
  },
  {
    label: "Change password",
    icon: "M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z",
    screen: "change-password",
  },
  {
    label: "MFA settings",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
    screen: "mfa-setup",
  },
];

// ── Security score calculation ────────────────────────────────────
function calcScore(user) {
  if (!user) return { score: 0, max: 4, items: [] };
  const items = [
    {
      label: "Email verified",
      met: true,
      points: 1,
    },
    {
      label: "Two-factor auth enabled",
      met: user.isMfaActive,
      points: 1,
    },
    {
      label: "Password up to date",
      met: !user.passwordExpired,
      points: 1,
    },
    {
      label: "Password expires in " + (
        user.daysUntilExpiry > 0
          ? `${user.daysUntilExpiry} days`
          : "Expired"
      ),
      met: user.daysUntilExpiry > 0 && !user.passwordExpired,
      points: 1,
    },
  ];
  const score = items.filter(i => i.met).reduce((s, i) => s + i.points, 0);
  return { score, max: 4, items };
}

// ── Icons ─────────────────────────────────────────────────────────
function Icon({ d, size = 18, stroke = "currentColor", fill = "none", strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke={stroke} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function CheckCircle({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color.success} strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function XCircle({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color.textMuted} strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  );
}

// ── Main dashboard ────────────────────────────────────────────────
export default function Dashboard({ navigate, onLogout }) {
  const [user, setUser] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/app/auth/status");
        setUser(res.data.data.user);
        setRecentActivity(res.data.data.recentActivity ?? []);
      } catch {
        navigate("login");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [navigate]);

  const handleLogout = async () => {
    try { await api.post("/app/auth/logout"); } catch { }
    onLogout();
    navigate("login");
  };

  const { score, max, items: scoreItems } = calcScore(user);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: color.bgPage, color: color.textMuted,
        fontSize: font.sizeMd,
      }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: color.bgPage, display: "flex" }}>

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigate={navigate}
        onLogout={handleLogout}
        navItems={navItems}
      />

      {/* ── Main content ────────────────────────────────────────── */}
      <main style={{
        marginLeft: sidebarOpen ? space.sideBar : 0,
        flex: 1,
        padding: "32px 36px",
        maxWidth: "900px",
      }}>

        {/* Top bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
        }}>
          <div>
            <p style={{ fontSize: font.sizeSm, color: color.textMuted, marginBottom: "2px" }}>
              Welcome back
            </p>
            <h1 style={{
              fontSize: "24px",
              fontWeight: font.weightSemibold,
              color: color.textPrimary,
              letterSpacing: "-0.3px",
            }}>
              {user?.username ?? "User"}
            </h1>
          </div>

          {/* Profile button — opens sidebar */}
          <button
            onClick={() => setSidebarOpen(true)}
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${color.cta}, ${color.accent})`,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              fontWeight: font.weightSemibold,
              color: "#fff",
              boxShadow: "0 2px 8px rgba(201,121,58,0.3)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(201,121,58,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(201,121,58,0.3)";
            }}
            aria-label="Open profile menu"
            title="Open profile menu"
          >
            {(user?.username?.[0] ?? "?").toUpperCase()}
          </button>
        </div>

        {/* ── Row 1: Security score + account info ─────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}>

          {/* Security score card */}
          <div style={{
            background: color.bgCard,
            borderRadius: radius.xl,
            boxShadow: shadow.card,
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}>
            <ScoreRing score={score} max={max} />

            {/* Score items */}
            <div style={{ width: "100%" }}>
              {scoreItems.map((item) => (
                <div key={item.label} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 0",
                  borderBottom: `1px solid ${color.divider}`,
                }}>
                  {item.met ? <CheckCircle /> : <XCircle />}
                  <span style={{
                    fontSize: font.sizeSm,
                    color: item.met ? color.textPrimary : color.textMuted,
                  }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Account info card */}
          <div style={{
            background: color.bgCard,
            borderRadius: radius.xl,
            boxShadow: shadow.card,
            padding: "28px 24px",
          }}>
            <h2 style={{
              fontSize: font.sizeLg,
              fontWeight: font.weightSemibold,
              color: color.textPrimary,
              marginBottom: "20px",
            }}>
              Account details
            </h2>

            {[
              { label: "Username", value: user?.username },
              { label: "Email", value: user?.email },
              { label: "Member since", value: formatDate(user?.memberSince).split(",")[0] },
              { label: "Last signed in", value: timeAgo(user?.lastLoginAt) },
              { label: "MFA", value: user?.isMfaActive ? "Enabled ✓" : "Disabled" },
              {
                label: "Password expires",
                value: user?.passwordExpired
                  ? "Expired — update now"
                  : `In ${user?.daysUntilExpiry} days`,
              },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 0",
                borderBottom: `1px solid ${color.divider}`,
                gap: "12px",
              }}>
                <span style={{ fontSize: font.sizeSm, color: color.textSecondary, flexShrink: 0 }}>
                  {label}
                </span>
                <span style={{
                  fontSize: font.sizeSm,
                  fontWeight: font.weightMedium,
                  color: color.textPrimary,
                  textAlign: "right",
                  wordBreak: "break-all",
                }}>
                  {value ?? "—"}
                </span>
              </div>
            ))}

            {/* Quick actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
              <button
                onClick={() => navigate("change-password")}
                style={{
                  width: "100%",
                  height: "38px",
                  background: color.cta,
                  border: "none",
                  borderRadius: radius.md,
                  color: "#fff",
                  fontSize: font.sizeMd,
                  fontWeight: font.weightSemibold,
                  cursor: "pointer",
                  fontFamily: font.family,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = color.ctaHover}
                onMouseLeave={(e) => e.currentTarget.style.background = color.cta}
              >
                Change password
              </button>

              {!user?.isMfaActive && (
                <button
                  onClick={() => navigate("mfa-setup")}
                  style={{
                    width: "100%",
                    height: "38px",
                    background: color.bgAccentLight,
                    border: `1.5px solid ${color.cta}`,
                    borderRadius: radius.md,
                    color: color.cta,
                    fontSize: font.sizeMd,
                    fontWeight: font.weightSemibold,
                    cursor: "pointer",
                    fontFamily: font.family,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#EDDDCC"}
                  onMouseLeave={(e) => e.currentTarget.style.background = color.bgAccentLight}
                >
                  Enable two-factor auth
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{
          background: color.bgCard,
          borderRadius: radius.xl,
          boxShadow: shadow.card,
          padding: "28px 28px",
          marginBottom: "32px",
        }}>
          <h2 style={{
            fontSize: font.sizeLg,
            fontWeight: font.weightSemibold,
            color: color.textPrimary,
            marginBottom: "6px",
          }}>
            Recent account activity
          </h2>
          <p style={{ fontSize: font.sizeSm, color: color.textSecondary, marginBottom: "20px" }}>
            Last 5 security events on your account. Review for any unrecognised activity.
          </p>

          {recentActivity.length === 0 ? (
            <p style={{ fontSize: font.sizeSm, color: color.textMuted }}>
              No recent activity recorded.
            </p>
          ) : (
            <div>
              {recentActivity.map((event, i) => {
                const { label, color: evColor } = eventLabel(event.event);
                return (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 0",
                    borderBottom: i < recentActivity.length - 1
                      ? `1px solid ${color.divider}` : "none",
                    gap: "12px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {/* Dot */}
                      <div style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: evColor,
                        flexShrink: 0,
                      }} />
                      <span style={{
                        fontSize: font.sizeMd,
                        color: color.textPrimary,
                        fontWeight: font.weightMedium,
                      }}>
                        {label}
                      </span>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: font.sizeSm, color: color.textSecondary }}>
                        {timeAgo(event.timestamp)}
                      </p>
                      <p style={{ fontSize: font.sizeXs, color: color.textMuted }}>
                        {formatDate(event.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}

function timeAgo(date) {
  if (!date) return "Never";
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (m < 1) return "Just now";
  if (m < 60) return `${m} minute${m !== 1 ? "s" : ""} ago`;
  if (h < 24) return `${h} hour${h !== 1 ? "s" : ""} ago`;
  return `${d} day${d !== 1 ? "s" : ""} ago`;
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function eventLabel(event) {
  const map = {
    LOGIN_SUCCESS: { label: "Signed in", color: color.success },
    LOGIN_FAILED: { label: "Failed sign-in attempt", color: color.error },
    LOGIN_PHASE1_SUCCESS: { label: "Password verified", color: color.success },
    ACCOUNT_LOCKED: { label: "Account locked", color: color.error },
    LOGIN_BLOCKED_LOCKOUT: { label: "Sign-in blocked", color: color.error },
    LOGOUT: { label: "Signed out", color: color.textMuted },
    REGISTER_SUCCESS: { label: "Account created", color: color.success },
    MFA_ENABLED: { label: "MFA enabled", color: color.success },
    MFA_DISABLED: { label: "MFA disabled", color: color.cta },
    PASSWORD_CHANGED: { label: "Password changed", color: color.success },
  };
  return map[event] ?? { label: event, color: color.textMuted };
}