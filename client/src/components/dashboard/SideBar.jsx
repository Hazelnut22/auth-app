import tokens from "../../styles/tokens.js";

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
                    <div style={{
                        width: "52px",
                        height: "52px",
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${color.cta}, ${color.accent})`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        fontWeight: font.weightSemibold,
                        color: "#fff",
                        marginBottom: "12px",
                        boxShadow: "0 2px 12px rgba(201,121,58,0.3)",
                    }}>
                        {initial}
                    </div>
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
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                stroke={color.sideMuted} strokeWidth="2"
                                strokeLinecap="round" strokeLinejoin="round">
                                <path d={item.icon} />
                            </svg>
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
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="color.cta" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                        </svg>
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