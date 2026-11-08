// A wholesaler's own commission rate — `/admin/wholesaler-commissions`.
// A wholesaler with one is charged it on every new order; the rest are charged
// the global rate (Setting → Commission & Fees). Orders keep the rate they
// were placed under.

export interface CommissionRule {
  percentage: number;
  /** Dollars. */
  flat: number;
  /** Dollars; null for no cap. */
  cap: number | null;
}

export type CommissionType = "custom" | "global";

export interface WholesalerCommissionRow {
  _id: string;
  companyName: string;
  dbaName?: string;
  email: string;
  phoneNumber?: string;
  image?: { url?: string };
  status: "active" | "inactive" | "blocked";
  ownerId: string;
  owner?: { _id: string; name?: string; email?: string };
  /** Its own rate; absent on the global rate. */
  customRate?: {
    commission: CommissionRule;
    note?: string;
    updatedAt?: string;
    updatedBy?: { _id: string; name?: string; email?: string };
  };
  commissionType: CommissionType;
  createdAt: string;
}

export interface WholesalerCommissionListQuery {
  page?: number;
  limit?: number;
  /** Shop name, DBA, shop email, or the owner's name or email. */
  searchTerm?: string;
  /** One user's shops. */
  ownerId?: string;
  commissionType?: CommissionType;
  status?: string;
}

export interface WholesalerCommissionListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface WholesalerCommissionListResult {
  rows: WholesalerCommissionRow[];
  meta: WholesalerCommissionListMeta;
}

export interface WholesalerCommissionStatsData {
  totalWholesalers: number;
  customRates: number;
  globalRates: number;
  globalCommission: CommissionRule;
}

export interface SetWholesalerCommissionPayload {
  percentage: number;
  flat: number;
  cap?: number | null;
  note?: string;
}
