import type { ComponentType } from "react";

// ─── Form ────────────────────────────────────────────────────────────────────

export type ForgotPasswordStep = "email" | "otp";

export type ForgotPasswordFormValues = {
  email: string;
  otp: string[];
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export type ForgotPasswordStepItem = {
  step: number;
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
};
