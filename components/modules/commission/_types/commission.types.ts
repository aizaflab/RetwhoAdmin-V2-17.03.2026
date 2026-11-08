// Commission collection — `/admin/commissions`. Every delivered cash / check
// order leaves the wholesaler owing retwho its commission; an order paid online
// took its commission inside the payment. The admin reads what is owed by
// month, asks for it, and collects it: by charging the wholesaler's saved card
// or bank account, by recording a payment made some other way, or by waiving.

export interface CommissionSummary {
  orders: number;
  commission: number;
  collectedOnline: number;
  collectedByRetwho: number;
  waived: number;
  /** Owed in the month, or being collected. */
  due: number;
  inProgress: number;
  /** Owed overall, whatever the month. */
  outstanding: number;
  /** Card / ACH fees retailers paid on top — they went to retwho too. */
  processingFees: number;
}

export interface CommissionRequest {
  _id: string;
  amount: number;
  period?: string;
  note?: string;
  status: "open" | "settled" | "cancelled";
  requestedBy?: { name?: string; email?: string } | null;
  settledAt?: string;
  createdAt: string;
}

export interface StatementRow extends CommissionSummary {
  wholesalerShopId: string;
  wholesaler: { companyName: string; dbaName?: string };
  openRequest: Pick<
    CommissionRequest,
    "_id" | "amount" | "period" | "createdAt"
  > | null;
}

export interface StatementResult {
  rows: StatementRow[];
  totals: (CommissionSummary & { wholesalers: number }) | null;
  meta: { page: number; limit: number; total: number; totalPage: number };
}

export type FeeStatus =
  | "pending"
  | "invoiced"
  | "collected"
  | "waived"
  | "failed"
  | "refunded";

export interface CommissionFeeRow {
  _id: string;
  orderId: string;
  orderNumber: string;
  retailerShopId?: { _id: string; companyName?: string } | null;
  rate: { percentage: number; flat: number; cap: number | null };
  basisAmount: number;
  feeAmount: number;
  status: FeeStatus;
  collectedVia?: "order_payment" | "wholesaler_charge" | "manual";
  processingFeeAmount?: number;
  collectedAt?: string;
  createdAt: string;
}

export type CollectionKind = "charge" | "manual" | "waive";
export type ManualMethod = "bank_transfer" | "check" | "cash" | "other";

export interface CommissionCollection {
  _id: string;
  kind: CollectionKind;
  status: "processing" | "completed" | "failed";
  amount: number;
  period?: string;
  paymentMethodLabel?: string;
  paymentMethodType?: "card" | "ach";
  manualMethod?: ManualMethod;
  reference?: string;
  failureReason?: string;
  note?: string;
  createdBy?: { name?: string; email?: string } | null;
  completedAt?: string;
  createdAt: string;
}

export interface WholesalerCommission {
  wholesaler: {
    _id: string;
    companyName: string;
    dbaName?: string;
    email?: string;
    phoneNumber?: string;
  };
  month: string | null;
  summary: CommissionSummary;
  overall: CommissionSummary;
  fees: {
    data: CommissionFeeRow[];
    meta: { page: number; limit: number; total: number; totalPage: number };
  };
  collections: CommissionCollection[];
  requests: CommissionRequest[];
  /** Saved cards, and bank accounts once verified — what can be charged. */
  paymentMethods: {
    _id: string;
    type: "card" | "ach";
    label: string;
    isDefault: boolean;
  }[];
}

export interface CollectPayload {
  kind: CollectionKind;
  period?: string;
  paymentMethodId?: string;
  manualMethod?: ManualMethod;
  reference?: string;
  note?: string;
}
