import { useState, useEffect, useCallback } from "react";
import tokens from "../../styles/tokens";

const { color, font, radius } = tokens;

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const styles = {
  wrapper: {
    marginBottom: "18px",
  },
  label: {
    display:      "block",
    fontSize:     font.sizeMd,
    fontWeight:   font.weightMedium,
    color:        color.textSecondary,
    marginBottom: "6px",
    letterSpacing:"0.1px",
  },
  imageRow: {
    display:       "flex",
    alignItems:    "center",
    gap:           "10px",
    marginBottom:  "8px",
  },
  image: {
    border:       `1.5px solid ${color.border}`,
    borderRadius: radius.md,
    display:      "block",
    height:       "70px",
    userSelect:   "none",
    pointerEvents:"none",      // prevent right-click save
    background:   color.bgAccentLight,
  },
  refreshBtn: {
    background:   "none",
    border:       `1.5px solid ${color.border}`,
    borderRadius: radius.md,
    cursor:       "pointer",
    color:        color.textMuted,
    padding:      "6px 8px",
    display:      "flex",
    alignItems:   "center",
    justifyContent:"center",
    transition:   "border-color 0.15s, color 0.15s",
    flexShrink:   0,
    height:       "36px",
    width:        "36px",
  },
  input: {
    width:        "100%",
    height:       "42px",
    padding:      "0 13px",
    border:       `1.5px solid ${color.border}`,
    borderRadius: radius.md,
    fontSize:     font.sizeLg,
    color:        color.textPrimary,
    background:   "#fff",
    outline:      "none",
    letterSpacing:"3px",
    fontWeight:   font.weightSemibold,
    textTransform:"uppercase",
    transition:   "border-color 0.15s, box-shadow 0.15s",
    fontFamily:   font.family,
  },
  inputError: {
    borderColor: color.error,
    boxShadow:   "0 0 0 3px rgba(192,68,10,0.10)",
  },
  hint: {
    fontSize:  font.sizeSm,
    color:     color.textMuted,
    marginTop: "5px",
  },
  error: {
    fontSize:  font.sizeSm,
    color:     color.error,
    marginTop: "5px",
  },
  loadingBox: {
    border:        `1.5px solid ${color.border}`,
    borderRadius:  radius.md,
    height:        "70px",
    width:         "220px",
    display:       "flex",
    alignItems:    "center",
    justifyContent:"center",
    background:    color.bgAccentLight,
    fontSize:      font.sizeSm,
    color:         color.textMuted,
  },
};

// ── Refresh icon SVG ─────────────────────────────────────────────
function RefreshIcon({ spinning }) {
  return (
    <svg
      width="16" height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: "transform 0.4s", transform: spinning ? "rotate(360deg)" : "none" }}
      aria-hidden="true"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

/**
 * CaptchaWidget
 * Self-hosted canvas CAPTCHA — no third-party services.
 *
 * Behaviour:
 *   - Fetches a fresh challenge from GET /auth/captcha on mount
 *   - Renders the returned base64 image
 *   - User types the answer; answer is uppercased automatically
 *   - Refresh button fetches a new challenge
 *   - Calls onVerify({ token, answer }) when the user types — parent
 *     includes both fields in the form submission body
 *   - Calls onExpire() after 2 minutes so the parent can warn the user
 *
 * Props:
 *   onVerify   {({ token: string, answer: string }) => void}
 *   onExpire   {() => void}   — optional, called when the 2-min window closes
 *   error      {string}       — optional, shown below input (e.g. "Wrong answer")
 */
export default function CaptchaWidget({ onVerify, onExpire, error }) {
  const [imageDataUri, setImageDataUri] = useState(null);
  const [token,        setToken]        = useState("");
  const [answer,       setAnswer]       = useState("");
  const [loading,      setLoading]      = useState(false);
  const [fetchError,   setFetchError]   = useState("");
  const [spinning,     setSpinning]     = useState(false);

  // Fetch a fresh CAPTCHA challenge from the backend
  const fetchCaptcha = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    setAnswer("");
    setSpinning(true);
    onVerify?.({ token: "", answer: "" }); // clear parent state while refreshing

    try {
      const res  = await fetch(`${API_URL}/auth/captcha`);
      if (!res.ok) throw new Error("Failed to load CAPTCHA.");
      const data = await res.json();
      setImageDataUri(data.imageDataUri);
      setToken(data.token);
    } catch {
      setFetchError("Could not load CAPTCHA. Click refresh to try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setSpinning(false), 400);
    }
  }, [onVerify]);

  // Load on mount
  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  // Auto-expire after 2 minutes — matches backend JWT expiry
  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(() => {
      onExpire?.();
      fetchCaptcha(); // auto-refresh on expiry
    }, 2 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [token, fetchCaptcha, onExpire]);

  // Notify parent whenever token or answer changes
  const handleAnswerChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    setAnswer(value);
    onVerify?.({ token, answer: value });
  };

  return (
    <div style={styles.wrapper}>
      <label style={styles.label}>
        Enter the characters shown below
      </label>

      {/* Image + refresh row */}
      <div style={styles.imageRow}>
        {loading ? (
          <div style={styles.loadingBox}>Loading…</div>
        ) : (
          <img
            src={imageDataUri}
            alt="CAPTCHA — type the characters shown"
            style={styles.image}
            draggable="false"
          />
        )}

        <button
          type="button"
          style={styles.refreshBtn}
          onClick={fetchCaptcha}
          disabled={loading}
          aria-label="Refresh CAPTCHA"
          title="Get a new CAPTCHA"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = color.accent;
            e.currentTarget.style.color       = color.accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = color.border;
            e.currentTarget.style.color       = color.textMuted;
          }}
        >
          <RefreshIcon spinning={spinning} />
        </button>
      </div>

      {/* Text input */}
      <input
        type="text"
        value={answer}
        onChange={handleAnswerChange}
        placeholder="Type characters here"
        maxLength={6}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="characters"
        spellCheck="false"
        aria-label="CAPTCHA answer"
        style={{
          ...styles.input,
          ...(error || fetchError ? styles.inputError : {}),
        }}
        onFocus={(e) => {
          if (!error && !fetchError) {
            e.target.style.borderColor = color.borderFocus;
            e.target.style.boxShadow   = "0 0 0 3px rgba(201,121,58,0.12)";
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = (error || fetchError) ? color.error : color.border;
          e.target.style.boxShadow   = "none";
        }}
      />

      {/* Error or hint */}
      {(error || fetchError) ? (
        <span role="alert" style={styles.error}>
          {error || fetchError}
        </span>
      ) : (
        <span style={styles.hint}>
          Not case-sensitive · Click <span style={{ fontWeight: 600 }}>↻</span> for a new one
        </span>
      )}
    </div>
  );
}