import type { BadgeVariant } from "@/components/ui/badge/Badge";

import type {
  CommissionCollection,
  FeeStatus,
  ManualMethod,
} from "../_types/commission.types";

export const fmtMoney = (value?: number | null) =>
  (value ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD" });

export const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

/** "2026-10" → "October 2026"; none → "All time". */
export const monthLabel = (month?: string | null) => {
  if (!month) return "All time";
  const [year, m] = month.split("-").map(Number);
  return new Date(Date.UTC(year, m - 1, 1)).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

/** This month and the eleven before it, newest first, with "All time". */
export const monthOptions = (now = new Date()) => [
  ...Array.from({ length: 12 }, (_, i) => {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
    );
    const value = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    return { value, label: monthLabel(value) };
  }),
  { value: "all", label: "All time" },
];

export const currentMonth = () => new Date().toISOString().slice(0, 7);

export const FEE_STATUS: Record<
  FeeStatus,
  { label: string; variant: BadgeVariant }
> = {
  pending: { label: "Owed", variant: "warning" },
  invoiced: { label: "Being collected", variant: "info" },
  collected: { label: "Collected", variant: "success" },
  waived: { label: "Waived", variant: "secondary" },
  failed: { label: "Failed", variant: "destructive" },
  refunded: { label: "Refunded", variant: "secondary" },
};

export const COLLECTED_VIA: Record<string, string> = {
  order_payment: "From the online payment",
  wholesaler_charge: "Charged to the wholesaler",
  manual: "Recorded payment",
};

export const MANUAL_METHODS: { value: ManualMethod; label: string }[] = [
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "check", label: "Check" },
  { value: "cash", label: "Cash" },
  { value: "other", label: "Other" },
];

export const collectionHow = (collection: CommissionCollection) =>
  collection.kind === "waive"
    ? "Waived"
    : collection.kind === "charge"
      ? `Charged · ${collection.paymentMethodLabel ?? "saved method"}`
      : `${MANUAL_METHODS.find((m) => m.value === collection.manualMethod)?.label ?? "Payment"}${collection.reference ? ` · ${collection.reference}` : ""}`;

export const COLLECTION_STATUS: Record<
  CommissionCollection["status"],
  { label: string; variant: BadgeVariant }
> = {
  processing: { label: "Bank debit in progress", variant: "info" },
  completed: { label: "Done", variant: "success" },
  failed: { label: "Failed", variant: "destructive" },
};

export const rateText = (rate?: { percentage: number; flat: number }) =>
  !rate
    ? "—"
    : [
        rate.percentage ? `${rate.percentage}%` : null,
        rate.flat ? `$${rate.flat.toFixed(2)}` : null,
      ]
        .filter(Boolean)
        .join(" + ") || "—";
