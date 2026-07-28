import tokens from "../../styles/tokens.js";
import { Home, KeyRound, ShieldCheck, LogOut } from "lucide-react";

const { color, font, space, radius, shadow } = tokens;

export default function Sidebar({ user, open, onClose, navigate, onLogout, navItems }) {
    const initial = (user?.username?.[0] ?? "?").toUpperCase();

    return (
        <>
            {open && (
                <div
                    onClick={onClose}
                    style={{
                        position: "fixed", inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        zIndex: 40,
                        display: "none",
                        "@media(maxWidth:768px)": { display: "block" },
                    }}
                />
            )}

            <aside style={{
                position: "fixed",
                top: 0,
                left: 0,
                height: "100vh",
                width: space.sideBar,
                background: color.dark,
                display: "flex",
                flexDirection: "column",
                zIndex: 50,
                transform: open ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.25s ease",
                boxShadow: "2px 0 16px rgba(0,0,0,0.2)",
            }}>
                {/* Top seal */}
                <div style={{
                    height: "3px",
                    background: `linear-gradient(90deg, ${color.cta}, ${color.accent})`,
                }} />

                {/* Profile section */}
                <div style={{
                    padding: "28px 20px 20px",
                    borderBottom: `1px solid ${color.dark3}`,
                }}>
                    <p style={{
                        fontSize: font.sizeLg,
                        fontWeight: font.weightSemibold,
                        color: color.sideText,
                        marginBottom: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}>
                        {user?.username ?? "User"}
                    </p>
                    <p style={{
                        fontSize: font.sizeSm,
                        color: color.sideMuted,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}>
                        {user?.email}
                    </p>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: "16px 12px" }}>
                    {navItems.map((item) => (
                        <button
                            key={item.screen}
                            onClick={() => { navigate(item.screen); onClose(); }}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                                padding: "10px 12px",
                                borderRadius: radius.md,
                                border: "none",
                                background: "none",
                                color: color.sideText,
                                fontSize: font.sizeMd,
                                cursor: "pointer",
                                textAlign: "left",
                                marginBottom: "4px",
                                transition: "background 0.15s",
                                fontFamily: font.family,
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = color.dark3}
                            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Footer */}
                <div style={{ padding: "16px 12px", borderTop: `1px solid ${color.dark3}` }}>
                    {/* Last login */}
                    <div style={{
                        padding: "10px 12px",
                        borderRadius: radius.md,
                        background: color.dark2,
                        marginBottom: "8px",
                    }}>
                        <p style={{ fontSize: font.sizeSm, color: color.sideMuted, marginBottom: "2px" }}>
                            Last sign in
                        </p>
                        <p style={{ fontSize: font.sizeSm, color: color.sideText, fontWeight: font.weightMedium }}>
                            {timeAgo(user?.lastLoginAt)}
                        </p>
                    </div>

                    <button
                        onClick={onLogout}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "10px 12px",
                            borderRadius: radius.md,
                            border: "none",
                            background: "none",
                            color: color.cta,
                            fontSize: font.sizeMd,
                            cursor: "pointer",
                            textAlign: "left",
                            fontFamily: font.family,
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(229,115,115,0.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                    >
                        <LogOut size={16} color="#E57373" />
                        Sign out
                    </button>
                </div>
            </aside>
        </>
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