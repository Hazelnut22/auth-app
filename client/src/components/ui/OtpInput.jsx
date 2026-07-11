import { useState, useRef } from "react";
import tokens from "../../styles/tokens";

const { color, font, radius } = tokens;

const styles = {
  row: {
    display:        "flex",
    gap:            "10px",
    justifyContent: "center",
    margin:         "24px 0",
  },
  cell: {
    width:        "48px",
    height:       "54px",
    textAlign:    "center",
    fontSize:     "22px",
    fontWeight:   font.weightSemibold,
    border:       `1.5px solid ${color.border}`,
    borderRadius: radius.lg,
    color:        color.textPrimary,
    background:   "#fff",
    outline:      "none",
    transition:   "border-color 0.15s, box-shadow 0.15s",
    fontFamily:   font.family,
  },
};

const CELL_COUNT = 6;

/**
 * OtpInput
 * Six individual digit cells with:
 *   - auto-advance on digit entry
 *   - backspace moves focus to previous cell
 *   - paste handling (pastes across all cells at once)
 *
 * Props:
 *   value     {string}               — current 6-char OTP string
 *   onChange  {(value: string)=>void}— called with the full OTP string on each change
 */
export default function OtpInput({ value = "", onChange }) {
  const inputRefs = useRef([]);
  const cells     = Array.from({ length: CELL_COUNT }, (_, i) => value[i] ?? "");

  const updateCell = (index, digit) => {
    const next = cells.map((c, i) => (i === index ? digit : c)).join("");
    onChange?.(next);
  };

  const handleChange = (index, e) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    updateCell(index, digit);
    if (digit && index < CELL_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (cells[index]) {
        updateCell(index, "");
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        updateCell(index - 1, "");
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < CELL_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CELL_COUNT);
    onChange?.(pasted.padEnd(CELL_COUNT, "").slice(0, CELL_COUNT));
    // Focus the cell after the last pasted digit
    const focusIndex = Math.min(pasted.length, CELL_COUNT - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div style={styles.row} role="group" aria-label="One-time password input">
      {cells.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          id={`otp-cell-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          autoFocus={i === 0}
          aria-label={`Digit ${i + 1} of ${CELL_COUNT}`}
          style={styles.cell}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => {
            e.target.style.borderColor = color.borderFocus;
            e.target.style.boxShadow   = "0 0 0 3px rgba(201,121,58,0.12)";
            e.target.select();
          }}
          onBlur={(e) => {
            e.target.style.borderColor = color.border;
            e.target.style.boxShadow   = "none";
          }}
        />
      ))}
    </div>
  );
}