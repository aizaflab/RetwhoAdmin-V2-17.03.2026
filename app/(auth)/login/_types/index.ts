import type { ComponentType } from "react";

// ─── Form ────────────────────────────────────────────────────────────────────

export type LoginFormValues = {
  email: string;
  password: string;
};

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export type LoginFeatureItem = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
};
