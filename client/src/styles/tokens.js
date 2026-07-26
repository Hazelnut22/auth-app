const tokens = {
  // ── Palette ──────────────────────────────────────────────────────
  color: {
    bgPage: "#F2EBE0",
    bgCard: "#FFFFFF",
    bgCardFooter: "#FDFAF7",
    bgInput: "#FFFFFF",
    bgAccentLight: "#F5EDE0",

    accent: "#8B6F47",
    cta: "#C9793A",
    ctaHover: "#A85F28",

    textPrimary: "#2C2416",
    textSecondary: "#7A6852",
    textMuted: "#A89880",

    border: "#DDD4C4",
    borderFocus: "#C9793A",
    divider: "#E8DFD2",

    error: "#C0440A",
    errorBg: "#FDF0EA",
    errorBorder: "rgba(192,68,10,0.18)",

    success: "#3A7A4A",
    successBg: "#EAF5EC",
    successBorder: "rgba(58,122,74,0.18)",

    infoBorder: "rgba(139,111,71,0.2)",

    strengthWeak: "#C0440A",
    strengthFair: "#D97020",
    strengthModerate: "#C9793A",
    strengthStrong: "#5A8A3C",
    strengthVeryStrong: "#3A7A4A",

    dark: "#1E1810",
    dark2: "#2C2416",
    dark3: "#3D3020",
    sideText: "#E8DFD2",
    sideMuted: "#9A8878",
  },

  // ── Typography ───────────────────────────────────────────────────
  font: {
    family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
    sizeXs: "11px",
    sizeSm: "12px",
    sizeMd: "13px",
    sizeLg: "15px",
    sizeXl: "22px",
    weightRegular: 400,
    weightMedium: 500,
    weightSemibold: 600,
  },

  // ── Spacing ──────────────────────────────────────────────────────
  space: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "40px",
    sideBar: "240px",
  },

  // ── Shape ────────────────────────────────────────────────────────
  radius: {
    sm: "4px",
    md: "6px",
    lg: "8px",
    xl: "10px",
    pill: "20px",
  },

  // ── Shadow ───────────────────────────────────────────────────────
  shadow: {
    card: "0 2px 6px rgba(44,36,22,0.07), 0 8px 28px rgba(44,36,22,0.08)",
  },

  // ── Transitions ──────────────────────────────────────────────────
  transition: {
    fast: "0.15s ease",
    normal: "0.2s ease",
    slow: "0.3s ease",
  },

  // ── Layout ───────────────────────────────────────────────────────
  layout: {
    cardMaxWidth: "420px",
    cardPadding: "40px",
  },
};

export default tokens;