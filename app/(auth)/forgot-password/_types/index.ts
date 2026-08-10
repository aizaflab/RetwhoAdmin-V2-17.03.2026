import type { ComponentType } from "react";

// ─── Form ────────────────────────────────────────────────────────────────────

export type ForgotPasswordFormValues = {
  email: string;
};

export type ForgotPasswordFormErrors = Partial<
  Record<keyof ForgotPasswordFormValues, string>
>;

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export type ForgotPasswordStepItem = {
  step: number;
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
};
