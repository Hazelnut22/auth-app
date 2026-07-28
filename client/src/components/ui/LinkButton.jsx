import tokens from "../../styles/tokens";

const { color, font } = tokens;

const styles = {
  base: {
    background:    "none",
    border:        "none",
    color:         color.cta,
    fontSize:      "inherit",
    fontWeight:    font.weightSemibold,
    cursor:        "pointer",
    padding:       0,
    textDecoration:"none",
    fontFamily:    font.family,
    transition:    `color 0.15s`,
  },
};

export default function LinkButton({ style = {}, children, ...rest }) {
  return (
    <button
      type="button"
      style={{ ...styles.base, ...style }}
      onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
      onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
      {...rest}
    >
      {children}
    </button>
  );
}