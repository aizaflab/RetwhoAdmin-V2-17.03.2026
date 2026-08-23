import type { SelectOption } from "@/components/ui/select/Select";

import type { PromotionStatus, PromotionType } from "../_types/promotion.types";

export const PROMOTION_STATUS_OPTIONS: SelectOption[] = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export const PROMOTION_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: "All Status", value: "all" },
  ...PROMOTION_STATUS_OPTIONS,
];

export const PROMOTION_TYPE_OPTIONS: SelectOption[] = [
  { label: "Banner", value: "banner" },
  { label: "Video", value: "video" },
  { label: "Popup", value: "popup" },
];

export const PROMOTION_TYPE_FILTER_OPTIONS: SelectOption[] = [
  { label: "All Types", value: "all" },
  ...PROMOTION_TYPE_OPTIONS,
];

/** The API's audience values are shop types, not "everyone / customers". */
export const TARGET_AUDIENCE_OPTIONS: SelectOption[] = [
  { label: "Retailers", value: "retailer" },
  { label: "Wholesalers", value: "wholesaler" },
  { label: "Restaurants", value: "restaurant" },
];

/* Tinted from the semantic tokens so both themes resolve from one source. */
const STATUS_STYLES: Record<PromotionStatus, string> = {
  published: "bg-success/10 text-success",
  draft: "bg-warning/10 text-warning",
  archived: "bg-muted text-muted-foreground",
};

const NEUTRAL = "bg-muted text-muted-foreground";

export function promotionStatusStyle(status?: string): string {
  return STATUS_STYLES[status as PromotionStatus] ?? NEUTRAL;
}

export function promotionTypeLabel(type?: PromotionType | string): string {
  return (
    PROMOTION_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type ?? "—"
  );
}

export function audienceLabel(value: string): string {
  return TARGET_AUDIENCE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

/* ─── Derived lifecycle ───────────────────────────────────────────────── */

export type PromotionPhase = "live" | "scheduled" | "ended" | "not-published";

/**
 * Whether the campaign is actually on screen. The API stores only the approval
 * status; running-or-not falls out of the dates, so it is computed the same way
 * on both sides rather than stored twice.
 */
export function promotionPhase(promotion: {
  status: string;
  startDate?: string;
  endDate?: string;
}): PromotionPhase {
  if (promotion.status !== "published") return "not-published";

  const now = Date.now();
  const start = promotion.startDate
    ? new Date(promotion.startDate).getTime()
    : 0;
  const end = promotion.endDate ? new Date(promotion.endDate).getTime() : 0;

  if (start && now < start) return "scheduled";
  if (end && now > end) return "ended";
  return "live";
}

export const PHASE_LABELS: Record<PromotionPhase, string> = {
  live: "Live now",
  scheduled: "Scheduled",
  ended: "Ended",
  "not-published": "Not published",
};

export const PHASE_STYLES: Record<PromotionPhase, string> = {
  live: "bg-success/10 text-success",
  scheduled: "bg-primary/10 text-primary",
  ended: "bg-destructive/10 text-destructive",
  "not-published": "bg-muted text-muted-foreground",
};
