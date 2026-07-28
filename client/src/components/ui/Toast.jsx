import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import tokens from "../../styles/tokens";

const { color, font, radius } = tokens;

let _addToast = null;

export const toast = {
  success: (message) => _addToast?.({ message, variant: "success" }),
  error: (message) => _addToast?.({ message, variant: "error" }),
  info: (message) => _addToast?.({ message, variant: "info" }),
};

const VARIANTS = {
  success: {
    background: color.dark,
    border: "1px solid ${color.success}",
    icon: CheckCircle2,
    iconColor: color.success,
  },
  error: {
    background: color.dark,
    border: "1px solid ${color.dark2}",
    icon: XCircle,
    iconColor: color.error,
  },
  info: {
    background: color.dark,
    border: "1px solid ${color.dark}",
    icon: Info,
    iconColor: color.cta,
  },
};

let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, variant = "info" }) => {
    const id = ++idCounter;
    setToasts((prev) => [...prev, { id, message, variant, exiting: false }]);

    // Auto-dismiss after 3.5 seconds
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 3500);
  }, []);

  // Register the global trigger
  useEffect(() => {
    _addToast = addToast;
    return () => { _addToast = null; };
  }, [addToast]);

  const dismiss = (id) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  return (
    <>
      {children}

      {/* Toast container */}
      <div style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "8px",
        pointerEvents: "none",
      }}>
        {toasts.map((t) => {
          const v = VARIANTS[t.variant] ?? VARIANTS.info;
          const Icon = v.icon;
          return (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 18px 12px 14px",
                borderRadius: radius.lg,
                background: v.background,
                border: v.border,
                boxShadow: "0 4px 24px rgba(0,0,0,0.35)",
                pointerEvents: "all",
                cursor: "pointer",
                minWidth: "240px",
                maxWidth: "360px",
                animation: t.exiting
                  ? "toastOut 0.3s ease forwards"
                  : "toastIn 0.3s ease forwards",
              }}
              onClick={() => dismiss(t.id)}
            >
              {/* Icon */}
              <div style={{
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: v.iconColor + "22",
                border: `1.5px solid ${v.iconColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: "700",
                color: v.iconColor,
                flexShrink: 0,
              }}>
                <Icon size={13} color={v.iconColor} />
              </div>

              {/* Message */}
              <span style={{
                fontSize: font.sizeMd,
                color: color.bgAccentLight,
                lineHeight: 1.4,
                flex: 1,
              }}>
                {t.message}
              </span>

              <span style={{
                fontSize: "14px",
                color: color.sideMuted,
                flexShrink: 0,
                marginLeft: "4px",
                display: "flex",
                alignItems: "center",
              }}>
                <X size={14} color={color.dark2} />
              </span>
            </div>
          );
        })}
      </div>

      {/* Keyframe animations  */}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0)    scale(1);    }
          to   { opacity: 0; transform: translateY(8px)  scale(0.96); }
        }
      `}</style>
    </>
  );
}