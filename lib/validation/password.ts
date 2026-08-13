/**
 * The one place the password policy lives. Login, reset-password and anything
 * added later share it so the rules can never drift apart between screens.
 */
export type PasswordRule = {
  label: string;
  test: (value: string) => boolean;
};

// Labels are short on purpose: they render as live requirement chips under the
// password input, not as sentences.
export const PASSWORD_RULES: PasswordRule[] = [
  { label: "8+ characters", test: (v) => v.length >= 8 },
  { label: "1 uppercase", test: (v) => /[A-Z]/.test(v) },
  { label: "1 lowercase", test: (v) => /[a-z]/.test(v) },
  { label: "1 number", test: (v) => /[0-9]/.test(v) },
];

/** Returns an error message, or undefined when the password passes every rule. */
export function getPasswordError(password: string): string | undefined {
  if (!password) return "Password is required.";
  if (!PASSWORD_RULES.every((rule) => rule.test(password)))
    return "Password does not meet all requirements.";
  return undefined;
}

export function isPasswordValid(password: string): boolean {
  return getPasswordError(password) === undefined;
}
