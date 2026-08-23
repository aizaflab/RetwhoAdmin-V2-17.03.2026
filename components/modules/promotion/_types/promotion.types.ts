// ─── Promotion Module Types ──────────────────────────────────────────────────
// Mirrors the promotion API payloads, so form state can be sent as-is.

/**
 * Approval state only. Whether a campaign is *running* is derived from
 * startDate/endDate — `published` just means it has been cleared to run.
 */
export type PromotionStatus = "draft" | "published" | "archived";
export type PromotionType = "banner" | "video" | "popup";
/** The shop types a campaign can be aimed at. */
export type TargetAudience = "retailer" | "wholesaler" | "restaurant";

/** `url`/`publicId` come back from the S3 upload; `title`/`alt` are authored. */
export interface PromotionImage {
  url: string;
  publicId?: string;
  title?: string;
  alt?: string;
}

/** The slice of the sponsoring shop the API embeds, when there is one. */
export interface PromotionWholesaler {
  _id: string;
  companyName?: string;
  businessType?: string;
}

/** A row as returned by `GET /promotions`. */
export interface Promotion {
  _id: string;
  title: string;
  /** Generated server-side from the title — never sent by the client. */
  slug: string;
  description?: string;
  promotionType: PromotionType;
  bannerImage?: PromotionImage | null;
  videoUrl?: string;
  /** Null for a platform-wide campaign; set when a wholesaler sponsors it. */
  wholesalerId?: string | null;
  wholesaler?: PromotionWholesaler | null;
  targetAudience: TargetAudience[];
  startDate: string;
  endDate: string;
  /** Higher wins when several campaigns compete for the same slot. */
  priority: number;
  status: PromotionStatus;
  tags: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create/update body for `/promotions`. Sent as the JSON `data` field of a
 * multipart request, with the file under `bannerImage`.
 *
 * `slug` is deliberately absent — the API generates it and its strict schema
 * rejects the field.
 */
export interface PromotionPayload {
  title: string;
  description?: string;
  promotionType: PromotionType;
  /** Required by the API when `promotionType` is `video`. */
  videoUrl?: string;
  wholesalerId?: string;
  targetAudience: TargetAudience[];
  startDate: string;
  endDate: string;
  priority: number;
  status: PromotionStatus;
  tags: string[];
  /** Only the author-typed halves; url/publicId come from the upload. */
  bannerImage?: { title?: string; alt?: string };
}

export interface PromotionListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

/** Query string the list endpoint accepts — every field is optional. */
export interface PromotionListQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: PromotionStatus;
  promotionType?: PromotionType;
  wholesalerId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PromotionListResult {
  promotions: Promotion[];
  meta: PromotionListMeta;
}

/**
 * `GET /promotions/overview` — approval states plus the three *derived*
 * lifecycle buckets the dates produce.
 */
export interface PromotionOverview {
  total: number;
  draft: number;
  published: number;
  archived: number;
  /** Published and inside its date window — on screen right now. */
  live: number;
  /** Published but its window has not opened yet. */
  scheduled: number;
  /** Published but its window has closed. */
  expired: number;
}
