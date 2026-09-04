"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Loader2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import { cn } from "@/lib/utils";
import { useGetBulkUploadStatusQuery } from "@/featured/product/productApiSlice";

import {
  bulkStatusMeta,
  DONE_GRACE_MS,
  JOB_STATUS_POLL_MS,
  STALE_JOB_MS,
} from "../_data/bulk-upload-options";
import type {
  BulkUploadJob,
  BulkUploadStatus,
} from "../_types/bulk-upload.types";
import { isBulkUploadActive } from "../_types/bulk-upload.types";
import {
  formatCount,
  formatDuration,
  formatEta,
  formatRelative,
  isBulkUploadLive,
  progressPercent,
} from "../_utils/bulk-upload";

interface BulkUploadJobCardProps {
  job: BulkUploadJob;
  /**
   * Fires once, the first time a job this card was watching leaves the active
   * states — the page uses it to toast and refresh the product list.
   */
  onSettled?: (job: BulkUploadJob, status: BulkUploadStatus) => void;
}

const COUNT_TONES = {
  success: {
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  warning: { dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  danger: { dot: "bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
};

/**
 * One counter, written out rather than boxed. Three of these on a line read as
 * a sentence about the run; three tiles read as a dashboard the row does not
 * need. The dot is what makes them scannable at a glance.
 */
function Count({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: keyof typeof COUNT_TONES;
}) {
  // A zero count is not news, so it never gets a colour of its own.
  const zero = value === 0;
  const tones = COUNT_TONES[tone];

  return (
    <span className="flex items-center gap-1.5">
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          zero ? "bg-border dark:bg-darkBorder" : tones.dot,
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "font-semibold tabular-nums",
          zero ? "text-muted-foreground" : tones.text,
        )}
      >
        {formatCount(value)}
      </span>
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}

export default function BulkUploadJobCard({
  job,
  onSettled,
}: BulkUploadJobCardProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const listActive = isBulkUploadActive(job.status);

  /**
   * Whether this row was still moving when the card mounted. A job that was
   * already finished — or one the worker abandoned long ago — never subscribes
   * at all, so an old history list costs zero requests.
   */
  const [watching] = useState(() => isBulkUploadLive(job, STALE_JOB_MS));

  /** Latched the moment the run finishes; nothing restarts the polling. */
  const [stopped, setStopped] = useState(false);
  /** The timer's hard stop, for a run that never reports a terminal status. */
  const [expired, setExpired] = useState(false);

  const { data: live } = useGetBulkUploadStatusQuery(job.idempotencyKey, {
    skip: !watching,
    // Dropping the interval stops the requests without unsubscribing — `skip`
    // would throw away the progress and leave the card on the stale list row.
    pollingInterval: watching && !stopped && !expired ? JOB_STATUS_POLL_MS : 0,
  });

  // The status endpoint is polled twice as often as the list, so while both
  // exist it is the fresher of the two.
  const status = (live?.status ?? job.status) as BulkUploadStatus;
  const total = live?.total ?? job.total;
  const processed = live?.processed ?? job.processed;
  const inserted = live?.insertedCount ?? job.insertedCount;
  const duplicates = live?.duplicateCount ?? job.duplicateCount;
  const failed = live?.failedCount ?? job.failedCount;

  const percent =
    typeof live?.percentage === "number"
      ? Math.min(100, Math.max(0, Math.round(live.percentage)))
      : progressPercent(processed, total);

  const active = isBulkUploadActive(status);
  const meta = bulkStatusMeta(status);
  const eta = active ? formatEta(live?.estimatedRemainingSeconds) : null;
  const duration = formatDuration(
    live?.startedAt ?? job.startedAt,
    live?.completedAt ?? job.completedAt,
  );

  // Polling ends the moment the worker reports a terminal status. Latched
  // during render rather than from an effect, so the request that answered
  // "completed" is the last one this card makes.
  if (watching && !stopped && !isBulkUploadActive(status)) setStopped(true);

  /**
   * The hard stop. A run that reaches 100% is given only a short grace window
   * for its status to flip; one that never gets there is dropped after the
   * stale window, so an abandoned job cannot poll for the rest of the session.
   */
  useEffect(() => {
    if (!watching || stopped) return;

    const timer = setTimeout(
      () => setExpired(true),
      percent >= 100 ? DONE_GRACE_MS : STALE_JOB_MS,
    );
    return () => clearTimeout(timer);
  }, [watching, stopped, percent]);

  const wasActive = useRef(listActive);
  useEffect(() => {
    if (active) {
      wasActive.current = true;
      return;
    }
    if (wasActive.current) {
      wasActive.current = false;
      onSettled?.(job, status);
    }
  }, [active, status, job, onSettled]);

  const detailsHref = `/product/bulk-upload/${job.idempotencyKey}`;
  /** Only a finished run has an error log to open. */
  const openable = !active;

  const copyKey = async (e: React.MouseEvent) => {
    // The card itself opens the details page; the copy button must not.
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(job.idempotencyKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy the key.");
    }
  };

  return (
    <div
      // A running job has nothing to show yet — the error log is only written
      // once the worker finishes — so the row is inert until then.
      role={openable ? "button" : undefined}
      tabIndex={openable ? 0 : undefined}
      onClick={openable ? () => router.push(detailsHref) : undefined}
      onKeyDown={(e) => {
        if (!openable) return;
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        router.push(detailsHref);
      }}
      aria-label={openable ? `View details for ${job.fileName}` : undefined}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-white px-4 py-4 transition-all duration-200 dark:bg-darkBg",
        openable
          ? "cursor-pointer border-border/60 hover:border-primary/40 hover:bg-muted/20 hover:shadow-sm focus-visible:border-primary/60 focus-visible:outline-none dark:border-darkBorder/50"
          : "border-primary/25 dark:border-primary/25",
      )}
    >
      {/* A hairline down the left edge while the worker is on it — the one cue
          that separates a running row from the rest without tinting the card. */}
      {active && (
        <span
          className="absolute inset-y-0 left-0 w-0.5 bg-primary"
          aria-hidden="true"
        />
      )}

      {/* What was uploaded, and where it got to. */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "center h-9 w-9 shrink-0 rounded-lg border",
              active
                ? "border-primary/20 bg-primary/5 text-primary"
                : status === "failed"
                  ? "border-rose-200 bg-rose-50/60 text-rose-500 dark:border-rose-400/20 dark:bg-rose-400/5"
                  : "border-emerald-200 bg-emerald-50/60 text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/5 dark:text-emerald-400",
            )}
            aria-hidden="true"
          >
            {active ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : status === "failed" ? (
              <XCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
          </span>

          <div className="min-w-0">
            <p
              className="truncate text-sm font-medium text-foreground"
              title={job.fileName}
            >
              {job.fileName}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-muted-foreground">
              <span>{formatRelative(job.createdAt)}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {formatCount(total)} {total === 1 ? "row" : "rows"}
              </span>
              {duration && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>took {duration}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {/* Kept out of the way until the row is hovered — a power-user
              affordance, not part of reading the run. */}
          <SimpleTooltip
            content={copied ? "Copied" : "Copy idempotency key"}
            position="top"
          >
            <button
              type="button"
              onClick={copyKey}
              aria-label="Copy idempotency key"
              className="center h-6 w-6 cursor-pointer rounded-md text-muted-foreground opacity-0 transition-opacity hover:text-primary focus-visible:opacity-100 group-hover:opacity-100"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </SimpleTooltip>

          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap",
              meta.badge,
            )}
          >
            {meta.label}
          </span>
        </div>
      </div>

      {/* The bar only exists while there is something left to wait for — once a
          run is done, the counters below are the whole story. */}
      {active && (
        <div className="mt-3.5">
          <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="tabular-nums">
              {formatCount(processed)} / {formatCount(total)} processed
            </span>
            <span className="flex items-center gap-2">
              {eta && <span>{eta}</span>}
              <span className="font-semibold tabular-nums text-foreground">
                {percent}%
              </span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted dark:bg-darkPrimary">
            <div
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${job.fileName} upload progress`}
              className={cn(
                "h-full rounded-full transition-[width] duration-500 ease-out",
                meta.bar,
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Outcome, as one line. */}
      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border/50 pt-3 text-[11px] dark:border-darkBorder/40">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <Count value={inserted} label="inserted" tone="success" />
          <Count value={duplicates} label="duplicates" tone="warning" />
          <Count value={failed} label="failed" tone="danger" />
        </div>

        {openable ? (
          // A real link, so the row can also be opened in a new tab.
          <Link
            href={detailsHref}
            onClick={(e) => e.stopPropagation()}
            className="center shrink-0 gap-0.5 font-medium text-muted-foreground transition-colors hover:text-primary group-hover:text-primary"
          >
            View details
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <span className="shrink-0 text-muted-foreground">
            Details available once this finishes
          </span>
        )}
      </div>
    </div>
  );
}
