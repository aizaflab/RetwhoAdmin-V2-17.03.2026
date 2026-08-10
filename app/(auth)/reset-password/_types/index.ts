import type { ComponentType } from "react";

// ─── Form ────────────────────────────────────────────────────────────────────

export type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export type ResetPasswordFormErrors = Partial<
  Record<keyof ResetPasswordFormValues, string>
> & {
  /** Errors that belong to the request rather than a single field. */
  form?: string;
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export type ResetPasswordTipItem = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
};
