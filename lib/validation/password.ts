/**
 * The one place the password policy lives. Login, reset-password and anything
 * added later share it so the rules can never drift apart between screens.
 */
export type PasswordRule = {
  label: string;
  message: string;
  test: (value: string) => boolean;
};

// Ordered: validation reports the first unmet rule, so the user is told about
// one problem at a time instead of a wall of errors.
export const PASSWORD_RULES: PasswordRule[] = [
  {
    label: "At least 8 characters",
    message: "Password must be at least 8 characters",
    test: (value) => value.length >= 8,
  },
  {
    label: "At least one uppercase letter (A-Z)",
    message: "Password must contain at least one uppercase letter (A-Z)",
    test: (value) => /[A-Z]/.test(value),
  },
  {
    label: "At least one lowercase letter (a-z)",
    message: "Password must contain at least one lowercase letter (a-z)",
    test: (value) => /[a-z]/.test(value),
  },
  {
    label: "At least one number (0-9)",
    message: "Password must contain at least one number (0-9)",
    test: (value) => /\d/.test(value),
  },
  {
    // The backend's passwordSchema accepts only this set, so a client rule
    // like /[^A-Za-z0-9]/ would let through passwords the server rejects.
    label: "At least one symbol (@ $ ! % * ? &)",
    message: "Password must contain at least one symbol (@ $ ! % * ? &)",
    test: (value) => /[@$!%*?&]/.test(value),
  },
];

/** Returns the first unmet rule's message, or undefined when the password passes. */
export function getPasswordError(password: string): string | undefined {
  if (!password) return "Password is required";
  return PASSWORD_RULES.find((rule) => !rule.test(password))?.message;
}

export function isPasswordValid(password: string): boolean {
  return getPasswordError(password) === undefined;
}
