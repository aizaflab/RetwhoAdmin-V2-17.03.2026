import type {
  BulkUploadRowStatus,
  BulkUploadStatus,
} from "../_types/bulk-upload.types";

/** How each job state is labelled and tinted wherever it is shown. */
export const BULK_STATUS_META: Record<
  BulkUploadStatus,
  { label: string; badge: string; bar: string }
> = {
  queued: {
    label: "Queued",
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/20",
    bar: "bg-amber-400",
  },
  processing: {
    label: "Processing",
    badge:
      "bg-primary/10 text-primary border-primary/20 dark:bg-primary/15 dark:border-primary/25",
    bar: "bg-primary",
  },
  completed: {
    label: "Completed",
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/20",
    bar: "bg-emerald-500",
  },
  failed: {
    label: "Failed",
    badge:
      "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-400/20",
    bar: "bg-rose-500",
  },
  cancelled: {
    label: "Cancelled",
    badge:
      "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    bar: "bg-slate-400",
  },
};

/** Falls back to the neutral treatment for a state the API adds later. */
export function bulkStatusMeta(status?: string) {
  return (
    BULK_STATUS_META[status as BulkUploadStatus] ?? {
      label: status ?? "Unknown",
      badge: BULK_STATUS_META.cancelled.badge,
      bar: BULK_STATUS_META.cancelled.bar,
    }
  );
}

/** What the file picker accepts, and the ceiling checked before uploading. */
export const CSV_ACCEPT = ".csv,text/csv,application/vnd.ms-excel";
export const MAX_CSV_BYTES = 50 * 1024 * 1024;

/** Polling cadence, in ms, while at least one job is still running. */
export const JOB_LIST_POLL_MS = 4000;
export const JOB_STATUS_POLL_MS = 2000;

/**
 * How a rejected row is labelled in the details dialog. A duplicate is not an
 * error — the row already exists — so it stays amber, away from the red the
 * genuinely failed rows get.
 */
export const ERROR_ROW_META: Record<
  BulkUploadRowStatus,
  { label: string; badge: string }
> = {
  duplicate: {
    label: "Duplicate",
    badge:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/20",
  },
  failed: {
    label: "Failed",
    badge:
      "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:border-rose-400/20",
  },
};

/** Neutral treatment for a row status the API adds later. */
export function errorRowMeta(status?: string) {
  return (
    ERROR_ROW_META[status as BulkUploadRowStatus] ?? {
      label: status ?? "Unknown",
      badge:
        "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    }
  );
}

/**
 * How long a queued/processing job may go untouched before the page stops
 * polling it. Anything past this was abandoned by the worker, and polling it
 * only burns requests.
 */
export const STALE_JOB_MS = 10 * 60 * 1000;

/**
 * How long a card keeps polling after its bar reaches 100%. The worker writes
 * the terminal status a moment after the last row lands, so the card waits out
 * that gap and then stops for good — a job at 100% is never polled beyond it.
 */
export const DONE_GRACE_MS = 15 * 1000;
