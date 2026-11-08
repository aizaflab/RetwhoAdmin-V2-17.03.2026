// The platform's rates — `GET/PATCH /admin/settings`. Every order keeps the
// rates it was placed under, so a change here only reaches new orders.

/** A charge on an amount: a percentage, plus a flat sum, held to a cap. */
export interface FeeRule {
  percentage: number;
  /** Dollars. */
  flat: number;
  /** Dollars; null for no cap. */
  cap: number | null;
}

export type FeeRuleKey = "commission" | "cardFee" | "achFee";

export interface PlatformSettings {
  commission: FeeRule;
  cardFee: FeeRule;
  achFee: FeeRule;
  updatedAt?: string;
}

export type PlatformSettingsPayload = Partial<Record<FeeRuleKey, FeeRule>>;
