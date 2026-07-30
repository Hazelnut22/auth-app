import { useState, useEffect } from "react";
import api from "../api/axios.js";
import tokens from "../styles/tokens";
import { Home, KeyRound, ShieldCheck, LogOut, } from "lucide-react";
import ScoreRing from "../components/dashboard/ScoreRing.jsx";
import Sidebar from "../components/dashboard/SideBar.jsx";
import Button from "../components/ui/Button.jsx";

const { color, font, space, radius, shadow } = tokens;

const navItems = [
  {
    label: "Dashboard",
    icon: <Home size={16} />,
    screen: "dashboard",
  },
  {
    label: "Change password",
    icon: <KeyRound size={16} />,
    screen: "change-password",
  },
  {
    label: "MFA settings",
    icon: <ShieldCheck size={16} />,
    screen: "mfa-setup",
  },
];

const CARD_HEIGHT = "560px";

// Security score calculation
function calcScore(user) {
  if (!user) return { score: 0, max: 4, items: [] };
  const items = [
    { label: "Email verified", met: true, points: 1 },
    { label: "Two-factor auth enabled", met: user.isMfaActive, points: 1 },
    { label: "Password up to date", met: !user.passwordExpired, points: 1 },
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

// Main dashboard 
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

  const { score, max } = calcScore(user);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        color: color.textMuted,
        fontSize: font.sizeMd,
      }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh" }}>

      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        navigate={navigate}
        onLogout={handleLogout}
        navItems={navItems}
      />

      <main style={{
        display: "flex",
        justifyContent: "center",
        padding: "32px 36px",
      }}>
        <div style={{ width: "100%", maxWidth: "900px" }}>

          {/* Top bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}>
            <div>
              <h1 style={{
                fontSize: "24px",
                fontWeight: font.weightSemibold,
                color: color.textPrimary,
                letterSpacing: "-0.3px",
              }}>
                Dashboard
              </h1>
            </div>

            {/* Profile button — toggles sidebar open/closed */}
            <button
              onClick={() => setSidebarOpen((open) => !open)}
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
              aria-label={sidebarOpen ? "Close profile menu" : "Open profile menu"}
              title={sidebarOpen ? "Close profile menu" : "Open profile menu"}
            >
              {(user?.username?.[0] ?? "?").toUpperCase()}
            </button>
          </div>

          {/* ── Row: security score + account info | recent activity ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}>

            {/* Security score + account details card */}
            <div style={{
              background: color.bgCard,
              borderRadius: radius.xl,
              boxShadow: shadow.card,
              padding: "28px 24px",
              height: CARD_HEIGHT,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              overflow: "hidden",
            }}>
              <ScoreRing score={score} max={max} />

              <div style={{ width: "100%", flex: 1, overflowY: "auto", minHeight: 0, scrollbarColor: "#888888 #f1f1f1" }}>
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
              </div>

              {/* Quick actions */}
              <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}>
                <Button
                  variant="primary"
                  onClick={() => navigate("change-password")}
                >
                  Change password
                </Button>

                {!user?.isMfaActive && (<Button
                  variant="primary"
                  onClick={() => navigate("mfa-setup")}
                >
                  Enable MFA
                </Button>)}

              </div>
            </div>

            {/* Recent activity card — fixed height, scrolls internally */}
            <div style={{
              background: color.bgCard,
              borderRadius: radius.xl,
              boxShadow: shadow.card,
              padding: "28px 28px",
              height: CARD_HEIGHT,
              display: "flex",
              flexDirection: "column",
            }}>
              <h2 style={{
                fontSize: font.sizeLg,
                fontWeight: font.weightSemibold,
                color: color.textPrimary,
                marginBottom: "6px",
              }}>
                Recent account activity
              </h2>
              <p style={{ fontSize: font.sizeSm, color: color.textSecondary, marginBottom: "16px" }}>
                Past security events on this account. Please review for any strange activity.
              </p>

              <div style={{ flex: 1, overflowY: "auto", minHeight: 0, scrollbarColor: "#888888 #f1f1f1" }}>
                {recentActivity.length === 0 ? (
                  <p style={{ fontSize: font.sizeSm, color: color.textMuted }}>
                    No recent activity recorded.
                  </p>
                ) : (
                  recentActivity.map((event, i) => {
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
                  })
                )}
              </div>
            </div>

          </div>
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