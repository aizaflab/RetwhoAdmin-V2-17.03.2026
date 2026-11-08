import type { SelectOption } from "@/components/ui/select/Select";

import type { CommissionRule } from "../_types/wholesaler-commission.types";

/** Which rate a shop is on, for the table toolbar. */
export const COMMISSION_TYPE_FILTER_OPTIONS: SelectOption[] = [
  { label: "All Rates", value: "all" },
  { label: "Own Rate", value: "custom" },
  { label: "Global Rate", value: "global" },
];

export const SHOP_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Blocked", value: "blocked" },
];

/** Tinted from the semantic tokens so both themes resolve from one source. */
export const SHOP_STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-warning/10 text-warning",
  blocked: "bg-destructive/10 text-destructive",
};

/** "2% + $0.25, max $50.00". */
export function ruleText(rule?: CommissionRule | null): string {
  if (!rule) return "—";
  const parts = [
    rule.percentage ? `${rule.percentage}%` : null,
    rule.flat ? `$${rule.flat.toFixed(2)}` : null,
  ].filter(Boolean);
  return (
    (parts.join(" + ") || "0%") +
    (rule.cap != null ? `, max $${rule.cap.toFixed(2)}` : "")
  );
}

/** The commission on an amount — worked out the way the server does. */
export function commissionOn(rule: CommissionRule, amount: number): number {
  const raw = (amount * (rule.percentage || 0)) / 100 + (rule.flat || 0);
  const capped = rule.cap != null ? Math.min(raw, rule.cap) : raw;
  return Math.round(Math.max(0, capped) * 100) / 100;
}

export function formatDate(iso?: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

export const money = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });
