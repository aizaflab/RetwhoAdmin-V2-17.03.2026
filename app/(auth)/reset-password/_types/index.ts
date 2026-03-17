import type { ComponentType } from "react";

// ─── Form ────────────────────────────────────────────────────────────────────

export type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export type ResetPasswordTipItem = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
};
