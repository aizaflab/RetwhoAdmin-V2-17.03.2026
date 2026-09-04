/** Formatting and polling helpers shared by the bulk-upload views. */

import type { BulkUploadJob } from "../_types/bulk-upload.types";
import { isBulkUploadActive } from "../_types/bulk-upload.types";

/** `1.4 MB` — bytes are never what someone wants to read off a file row. */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const exp = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exp;
  return `${value >= 10 || exp === 0 ? Math.round(value) : value.toFixed(1)} ${units[exp]}`;
}

/** Thousands separators, so 5000 reads as 5,000 in the counters. */
export function formatCount(value?: number | null): string {
  return typeof value === "number" ? value.toLocaleString() : "—";
}

/**
 * The ETA the status endpoint returns, as something readable. Null while the
 * server has no estimate yet — the caller shows nothing rather than "0s".
 */
export function formatEta(seconds?: number | null): string | null {
  if (typeof seconds !== "number" || !Number.isFinite(seconds) || seconds <= 0)
    return null;

  if (seconds < 60) return `${Math.ceil(seconds)}s left`;

  const minutes = Math.floor(seconds / 60);
  const rest = Math.round(seconds % 60);
  if (minutes < 60)
    return rest ? `${minutes}m ${rest}s left` : `${minutes}m left`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m left`;
}

/** Relative time for the job list — "2 min ago" beats a full timestamp here. */
export function formatRelative(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

/**
 * How long the job took, from the two timestamps the API sets. Only defined
 * once both are present, so a running job gets nothing.
 */
export function formatDuration(
  startedAt?: string | null,
  completedAt?: string | null,
): string | null {
  if (!startedAt || !completedAt) return null;

  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;

  const seconds = ms / 1000;
  if (seconds < 60)
    return `${seconds < 10 ? seconds.toFixed(1) : Math.round(seconds)}s`;

  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${Math.round(seconds % 60)}s`;
}

/**
 * A percentage that is safe to feed a width. The list endpoint has no
 * `percentage` field, so it is derived from the counters there; a job with no
 * total yet reads as 0 rather than NaN.
 */
export function progressPercent(processed?: number, total?: number): number {
  if (!total || total <= 0) return 0;
  return Math.min(
    100,
    Math.max(0, Math.round(((processed ?? 0) / total) * 100)),
  );
}

/**
 * Whether a job is worth polling for.
 *
 * `queued` and `processing` are the states a worker moves out of on its own,
 * but a job the worker never picked up keeps that status forever — and the
 * page would then poll the list every few seconds for the rest of the
 * session. So a job also has to have been touched recently: once its last
 * update goes past `staleMs` it is treated as dormant and left alone. A live
 * job refreshes `updatedAt` as it goes, so it never trips this.
 */
export function isBulkUploadLive(
  job: Pick<BulkUploadJob, "status" | "updatedAt" | "createdAt">,
  staleMs: number,
): boolean {
  if (!isBulkUploadActive(job.status)) return false;

  const stamp = job.updatedAt ?? job.createdAt;
  if (!stamp) return true;

  const touched = new Date(stamp).getTime();
  if (!Number.isFinite(touched)) return true;

  return Date.now() - touched < staleMs;
}
