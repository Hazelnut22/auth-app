const PASSWORD_REQUIREMENTS = [
  { id: "length",    test: (pw) => pw.length >= 8 },
  { id: "uppercase", test: (pw) => /[A-Z]/.test(pw) },
  { id: "number",    test: (pw) => /[0-9]/.test(pw) },
  { id: "special",   test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

export function isPasswordValid(password) {
  if (typeof password !== "string") return false;
  return PASSWORD_REQUIREMENTS.every((r) => r.test(password));
}