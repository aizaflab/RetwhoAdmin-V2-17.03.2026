// ─── Bulk Upload Types ───────────────────────────────────────────────────────
//
// The CSV upload is asynchronous: `POST /admin/products/bulk-upload` only
// validates the file and answers 202 with a job handle, and the rows land in
// the catalog later. Everything below describes that handle and the two
// endpoints that report on it.

/**
 * A job's lifecycle. `queued` and `processing` are the live states — anything
 * else is terminal and stops the page from polling.
 */
export type BulkUploadStatus =
  | "queued"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

/** States that still change on their own, so a job in one of them is polled. */
export const ACTIVE_BULK_STATUSES: BulkUploadStatus[] = [
  "queued",
  "processing",
];

export function isBulkUploadActive(status?: string): boolean {
  return ACTIVE_BULK_STATUSES.includes(status as BulkUploadStatus);
}

/** The 202 body from `POST /admin/products/bulk-upload`. */
export interface BulkUploadAccepted {
  uploadId: string;
  idempotencyKey: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  status: BulkUploadStatus;
}

/** A row of `GET /admin/products/bulk-upload/job`. */
export interface BulkUploadJob {
  _id: string;
  userId?: string;
  idempotencyKey: string;
  fileName: string;
  status: BulkUploadStatus;
  total: number;
  processed: number;
  insertedCount: number;
  duplicateCount: number;
  failedCount: number;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
  startedAt?: string | null;
  completedAt?: string | null;
}

/**
 * `GET /admin/products/bulk-upload/status/{idempotency}`.
 *
 * Same counters as the job row plus the two things only this endpoint gives:
 * a server-computed `percentage` and an ETA while the job is still running.
 */
export interface BulkUploadProgress {
  uploadId: string;
  idempotencyKey: string;
  status: BulkUploadStatus;
  total: number;
  processed: number;
  percentage: number;
  insertedCount: number;
  duplicateCount: number;
  failedCount: number;
  estimatedRemainingSeconds?: number | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

/** Pagination block returned alongside the job list. */
export interface BulkUploadJobMeta {
  total: number;
  page: number;
  limit: number;
  totalPage: number;
}

export interface BulkUploadJobResult {
  jobs: BulkUploadJob[];
  meta: BulkUploadJobMeta;
}

// ─── Error logs ──────────────────────────────────────────────────────────────
//
// `GET /admin/products/bulk-upload/error/{idempotency}` explains the rows the
// counters only summarise: every row the worker refused, with the parsed
// product it was going to write and why it was dropped. Rows expire server
// side (`expiresAt`), so an old job can legitimately answer with nothing.

/** Why a row never made it into the catalog. */
export type BulkUploadRowStatus = "duplicate" | "failed";

/** The parsed CSV row, as far as the worker got with it. */
export interface BulkUploadErrorProduct {
  name?: string;
  description?: string;
  tags?: string[];
  upc?: string;
  boxUpc?: string;
  isGlobal?: boolean;
  profit?: { enabled?: boolean; percentage?: number };
}

/** One rejected row. */
export interface BulkUploadErrorLog {
  _id: string;
  uploadId: string;
  /** 1-based line in the uploaded file — what someone fixes the CSV by. */
  row: number;
  product?: BulkUploadErrorProduct;
  status: BulkUploadRowStatus | string;
  reason?: string;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Server-side paging/search for the error log. */
export interface BulkUploadErrorQuery {
  idempotencyKey: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  searchTerm?: string;
}

export interface BulkUploadErrorResult {
  rows: BulkUploadErrorLog[];
  meta: BulkUploadJobMeta;
}
