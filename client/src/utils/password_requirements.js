/**
 * Password requirement rules.
 *
 * Each rule has:
 *   - label  : human-readable description shown in the UI
 *   - test   : function(password: string) => boolean
 *
 * Kept here so Register and ChangePassword always enforce
 * the same rules without duplicating logic.
 */
export const PASSWORD_REQUIREMENTS = [
  {
    id:    "length",
    label: "8+ characters",
    test:  (pw) => pw.length >= 8,
  },
  {
    id:    "uppercase",
    label: "Uppercase letter",
    test:  (pw) => /[A-Z]/.test(pw),
  },
  {
    id:    "number",
    label: "Number",
    test:  (pw) => /[0-9]/.test(pw),
  },
  {
    id:    "special",
    label: "Special character",
    test:  (pw) => /[^A-Za-z0-9]/.test(pw),
  },
];

/**
 * Returns true when every requirement is satisfied.
 * @param {string} password
 * @returns {boolean}
 */
export function isPasswordValid(password) {
  return PASSWORD_REQUIREMENTS.every((r) => r.test(password));
}