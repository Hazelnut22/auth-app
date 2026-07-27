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
export function isPasswordValid(password) {
  return PASSWORD_REQUIREMENTS.every((r) => r.test(password));
}