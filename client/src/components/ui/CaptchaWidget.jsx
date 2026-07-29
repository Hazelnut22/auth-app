import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import tokens from "../../styles/tokens";
import api from "../../api/axios.js";

const { color, font, radius } = tokens;

const styles = {
  wrapper: {
    marginBottom: "2px",
  },
  label: {
    display: "block",
    fontSize: font.sizeMd,
    fontWeight: font.weightMedium,
    color: color.textSecondary,
    marginBottom: "6px",
    letterSpacing: "0.1px",
  },
  imageRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "8px",
  },
  image: {
    border: `1.5px solid ${color.border}`,
    borderRadius: radius.md,
    display: "block",
    height: "70px",
    userSelect: "none",
    pointerEvents: "none",
    background: color.bgAccentLight,
  },
  refreshBtn: {
    background: "none",
    border: `1.5px solid ${color.border}`,
    borderRadius: radius.md,
    cursor: "pointer",
    color: color.textMuted,
    padding: "6px 8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "border-color 0.15s, color 0.15s",
    flexShrink: 0,
    height: "36px",
    width: "36px",
  },
  input: {
    width: "100%",
    height: "42px",
    padding: "0 13px",
    border: `1.5px solid ${color.border}`,
    borderRadius: radius.md,
    fontSize: font.sizeLg,
    color: color.textPrimary,
    background: "#fff",
    outline: "none",
    letterSpacing: "3px",
    fontWeight: font.weightSemibold,
    transition: "border-color 0.15s, box-shadow 0.15s",
    fontFamily: font.family,
  },
  inputError: {
    borderColor: color.error,
    boxShadow: "0 0 0 3px rgba(192,68,10,0.10)",
  },
  hint: {
    fontSize: font.sizeSm,
    color: color.textMuted,
    marginTop: "5px",
  },
  error: {
    fontSize: font.sizeSm,
    color: color.error,
    marginTop: "5px",
  },
  loadingBox: {
    border: `1.5px solid ${color.border}`,
    borderRadius: radius.md,
    height: "70px",
    width: "220px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: color.bgAccentLight,
    fontSize: font.sizeSm,
    color: color.textMuted,
  },
};

export default function CaptchaWidget({ onVerify, onExpire, error }) {
  const [imageDataUri, setImageDataUri] = useState(null);
  const [token, setToken] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [spinning, setSpinning] = useState(false);

  // Get CAPTCHA from backend
  const fetchCaptcha = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    setAnswer("");
    setSpinning(true);
    onVerify?.({ token: "", answer: "" });

    try {
      const res = await api.get("/app/auth/captcha");
      const data = await res.data.data;
      setImageDataUri(data.imageDataUri);
      setToken(data.token);
    } catch {
      setFetchError("Could not load CAPTCHA. Click refresh to try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setSpinning(false), 400);
    }
  }, [onVerify]);

  // Load
  useEffect(() => {
    fetchCaptcha();
  }, [fetchCaptcha]);

  // Auto-expire after 2 minutes
  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(() => {
      onExpire?.();
      fetchCaptcha();
    }, 2 * 60 * 1000);
    return () => clearTimeout(timer);
  }, [token, fetchCaptcha, onExpire]);

  const handleAnswerChange = (e) => {
    const value = e.target.value.replace(/[^A-Za-z0-9]/g, "");
    setAnswer(value);
    onVerify?.({ token, answer: value });
  };

  return (
    <div style={styles.wrapper}>
      <label style={styles.label}>
        Enter the characters shown below
      </label>

      <div style={styles.imageRow}>
        {loading ? (
          <div style={styles.loadingBox}>Loading…</div>
        ) : (
          <img
            src={imageDataUri}
            alt="CAPTCHA image"
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
            e.currentTarget.style.color = color.accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = color.border;
            e.currentTarget.style.color = color.textMuted;
          }}
        >
          <RefreshCw
            size={16}
            style={{
              transition: "transform 0.4s",
              transform: spinning ? "rotate(360deg)" : "none"
            }}
          />
        </button>
      </div>

      <input
        type="text"
        value={answer}
        onChange={handleAnswerChange}
        placeholder="Type characters here"
        maxLength={6}
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        aria-label="CAPTCHA answer"
        style={{
          ...styles.input,
          ...(error || fetchError ? styles.inputError : {}),
        }}
        onFocus={(e) => {
          if (!error && !fetchError) {
            e.target.style.borderColor = color.borderFocus;
            e.target.style.boxShadow = "0 0 0 3px rgba(201,121,58,0.12)";
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = (error || fetchError) ? color.error : color.border;
          e.target.style.boxShadow = "none";
        }}
      />

      {(error || fetchError) ? (
        <span role="alert" style={styles.error}>
          {error || fetchError}
        </span>
      ) : (
        <span style={styles.hint}>
          Case-sensitive · Click <span style={{ fontWeight: 600 }}>↻</span> for a new one
        </span>
      )}
    </div>
  );
}