import tokens from "../../styles/tokens";

const { color, shadow, radius, layout } = tokens;

const styles = {
  card: {
    background: color.bgCard,
    borderRadius: radius.xl,
    boxShadow:shadow.card,
    width: "100%",
    maxWidth: layout.cardMaxWidth,
    overflow:"hidden",
  },
  seal: {
    height:"3px",
    background: `linear-gradient(90deg, ${color.cta}, ${color.accent})`,
    width: "100%",
  },
  body: {
    padding: layout.cardPadding,
  },
  footer: {
    borderTop:`1px solid ${color.divider}`,
    padding:`18px ${layout.cardPadding}`,
    textAlign: "center",
    fontSize: tokens.font.sizeMd,
    color: color.textSecondary,
    background: color.bgCardFooter,
  },
  heading: {
    fontSize: tokens.font.sizeXl,
    fontWeight: tokens.font.weightSemibold,
    color: color.textPrimary,
    letterSpacing: "-0.3px",
    marginBottom: "6px",
  },
  subheading: {
    fontSize:  tokens.font.sizeLg,
    color: color.textSecondary,
    lineHeight:1.5,
    marginBottom: "28px",
  },
};

export default function AuthCard({ heading, subheading, footer, children }) {
  return (
    <div style={styles.card}>
      <div style={styles.seal} aria-hidden="true" />

      <div style={styles.body}>
        <h1 style={styles.heading}>{heading}</h1>
        {subheading && <p style={styles.subheading}>{subheading}</p>}
        {children}
      </div>

      {footer && <div style={styles.footer}>{footer}</div>}
    </div>
  );
}