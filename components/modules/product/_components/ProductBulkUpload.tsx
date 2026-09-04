"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CloudUploadIcon,
  Download,
  FileSpreadsheet,
  Inbox,
  Loader2,
  RefreshCw,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import { downloadAuthedFile } from "@/lib/download";
import { apiSlice } from "@/featured/api/apiSlice";
import { useAppDispatch } from "@/featured/hook";
import {
  useGetBulkUploadJobsQuery,
  useUploadBulkProductsMutation,
} from "@/featured/product/productApiSlice";

import {
  CSV_ACCEPT,
  JOB_LIST_POLL_MS,
  MAX_CSV_BYTES,
  STALE_JOB_MS,
} from "../_data/bulk-upload-options";
import type {
  BulkUploadJob,
  BulkUploadStatus,
} from "../_types/bulk-upload.types";
import { isBulkUploadActive } from "../_types/bulk-upload.types";
import {
  formatBytes,
  formatCount,
  isBulkUploadLive,
} from "../_utils/bulk-upload";
import BulkUploadJobCard from "./BulkUploadJobCard";

/** A file on its way to the server, before it becomes a job. */
interface PendingUpload {
  id: string;
  file: File;
  state: "queued" | "uploading" | "error";
  error?: string;
}

/** A CSV by extension or by what the browser guessed the type to be. */
function isCsv(file: File): boolean {
  return (
    /\.csv$/i.test(file.name) ||
    ["text/csv", "application/vnd.ms-excel"].includes(file.type)
  );
}

/**
 * Whether anything in the list is worth polling for. A job the worker never
 * picked up keeps its `queued` status forever, and polling on that alone kept
 * the list refetching every few seconds with nothing actually running — so a
 * job also has to have been touched inside the stale window.
 */
function hasLiveJobs(jobs?: BulkUploadJob[]): boolean {
  return (jobs ?? []).some((job) => isBulkUploadLive(job, STALE_JOB_MS));
}

export default function ProductBulkUpload() {
  const dispatch = useAppDispatch();

  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [dragging, setDragging] = useState(false);
  const [downloadingSample, setDownloadingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadBulkProducts] = useUploadBulkProductsMutation();

  const {
    data: jobData,
    isLoading: loadingJobs,
    isFetching: refreshingJobs,
    refetch: refetchJobs,
  } = useGetBulkUploadJobsQuery(undefined);

  const jobs: BulkUploadJob[] = jobData?.jobs ?? [];
  const hasLiveJob = hasLiveJobs(jobs);

  // A second subscription to the same endpoint, purely to poll while a job is
  // actually moving. `skip` turns it off again as soon as nothing is — and a
  // job that has gone quiet stops counting as live, so an abandoned `queued`
  // row cannot keep the page refetching for the rest of the session.
  useGetBulkUploadJobsQuery(undefined, {
    skip: !hasLiveJob,
    pollingInterval: JOB_LIST_POLL_MS,
  });

  // ── Upload queue ──────────────────────────────────────────────────────────

  const drainingRef = useRef(false);
  const queueRef = useRef<PendingUpload[]>([]);

  const updateQueue = useCallback(
    (update: (prev: PendingUpload[]) => PendingUpload[]) => {
      queueRef.current = update(queueRef.current);
      setPending(queueRef.current);
    },
    [],
  );

  const drain = useCallback(async () => {
    if (drainingRef.current) return;
    drainingRef.current = true;

    try {
      for (;;) {
        const next = queueRef.current.find((item) => item.state === "queued");
        if (!next) return;

        updateQueue((prev) =>
          prev.map((item) =>
            item.id === next.id ? { ...item, state: "uploading" } : item,
          ),
        );

        try {
          const accepted = await uploadBulkProducts(next.file).unwrap();

          // Accepted files leave the queue: from here on the job card is the
          // better view of the same file.
          updateQueue((prev) => prev.filter((item) => item.id !== next.id));

          const invalid = accepted?.invalidRecords ?? 0;
          toast.success(
            `"${next.file.name}" accepted — ${formatCount(
              accepted?.validRecords ?? 0,
            )} rows queued${invalid ? `, ${formatCount(invalid)} skipped` : ""}.`,
          );

          refetchJobs();
        } catch (error) {
          const message = getApiErrorMessage(
            error,
            "Could not upload this file. Please try again.",
          );

          // The failed file stays in the list so it can be retried;
          // the loop moves on to the next one.
          updateQueue((prev) =>
            prev.map((item) =>
              item.id === next.id
                ? { ...item, state: "error", error: message }
                : item,
            ),
          );
          toast.error(message);
        }
      }
    } finally {
      drainingRef.current = false;
    }
  }, [refetchJobs, updateQueue, uploadBulkProducts]);

  const addFiles = (files: File[]) => {
    const accepted: PendingUpload[] = [];

    files.forEach((file) => {
      if (!isCsv(file)) {
        toast.error(`"${file.name}" is not a CSV file.`);
        return;
      }
      if (file.size === 0) {
        toast.error(`"${file.name}" is empty.`);
        return;
      }
      if (file.size > MAX_CSV_BYTES) {
        toast.error(
          `"${file.name}" is ${formatBytes(file.size)} — the limit is ${formatBytes(MAX_CSV_BYTES)}.`,
        );
        return;
      }

      accepted.push({
        id: `${Date.now()}-${accepted.length}-${file.name}`,
        file,
        state: "queued",
      });
    });

    if (!accepted.length) return;

    updateQueue((prev) => [...prev, ...accepted]);
    void drain();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(Array.from(e.dataTransfer.files ?? []));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    // Reset so picking the same file again still fires a change event.
    e.target.value = "";
    addFiles(files);
  };

  /** Puts a failed upload back in the queue. */
  const retry = (id: string) => {
    updateQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, state: "queued", error: undefined } : item,
      ),
    );
    void drain();
  };

  const dismiss = (id: string) =>
    updateQueue((prev) => prev.filter((item) => item.id !== id));

  /**
   * A finished job means rows may have landed in the catalog, so the product
   * list is invalidated — otherwise the manage table would keep serving the
   * pre-import cache.
   */
  const handleJobSettled = useCallback(
    (job: BulkUploadJob, status: BulkUploadStatus) => {
      if (status === "failed") {
        toast.error(`"${job.fileName}" failed to import.`);
      } else {
        toast.success(`"${job.fileName}" finished importing.`);
        dispatch(apiSlice.util.invalidateTags(["products"]));
      }
      refetchJobs();
    },
    [dispatch, refetchJobs],
  );

  const downloadSample = async () => {
    setDownloadingSample(true);
    try {
      await downloadAuthedFile(
        "/admin/products/bulk-upload/demo-csv",
        "product-bulk-upload-sample.csv",
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not download the sample file."),
      );
    } finally {
      setDownloadingSample(false);
    }
  };

  const uploadingCount = pending.filter(
    (item) => item.state !== "error",
  ).length;
  const inProgress =
    jobs.filter((job) => isBulkUploadActive(job.status)).length +
    uploadingCount;

  return (
    <div className="min-h-[calc(100dvh-93px)] rounded-xl border border-border/50 bg-card p-3 text-card-foreground sm:min-h-[calc(100dvh-109px)] sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-4 pb-5">
        <Link
          href="/product/manage"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-white text-text6 transition-all duration-200 hover:border-primary/50 hover:text-primary dark:border-darkBorder/50 dark:bg-darkBg dark:text-text5"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-black dark:text-white">
            Bulk Upload Products
          </h1>
          <p className="text-[12px] text-text5 dark:text-text6">
            Import products from a CSV file. Uploads run in the background — you
            can queue another file while one is still processing.
          </p>
        </div>
      </div>

      {/* Two columns: the thing you do on the left, what it produced on the
          right. The upload panel sticks, so a long job history scrolls past a
          dropzone that stays reachable. */}
      <div className="grid grid-cols-1 gap-5 border-t border-t-border/50 pt-5 lg:grid-cols-[minmax(0,450px)_minmax(0,1fr)]">
        {/* ── Upload ─────────────────────────────────────────────────────── */}
        <section className="lg:sticky lg:top-5 lg:self-start">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              fileInputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={cn(
              "flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
              dragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30",
            )}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept={CSV_ACCEPT}
              multiple
              onChange={handleFileChange}
            />
            <CloudUploadIcon className="mb-3 h-7 w-7 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              <span className="text-primary">Click to upload</span> or drag and
              drop
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              CSV only — up to {formatBytes(MAX_CSV_BYTES)} per file
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={downloadSample}
            loading={downloadingSample}
            loadingText="Preparing..."
            startIcon={<Download className="h-4 w-4" />}
            className="mt-3 w-full"
          >
            Download sample CSV
          </Button>

          {/* Files still on their way up. They disappear the moment the server
              accepts them, because from then on the job card is the better
              view of the same file. */}
          {pending.length > 0 && (
            <ul className="mt-3 space-y-2">
              {pending.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border px-3 py-2.5",
                    item.state === "error"
                      ? "border-rose-200 bg-rose-50/50 dark:border-rose-400/20 dark:bg-rose-400/5"
                      : "border-border/60 bg-white dark:border-darkBorder/50 dark:bg-darkBg",
                  )}
                >
                  <div className="shrink-0 text-muted-foreground">
                    {item.state === "uploading" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-[13px] font-medium text-foreground"
                      title={item.file.name}
                    >
                      {item.file.name}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {item.state === "error"
                        ? item.error
                        : `${formatBytes(item.file.size)} · ${
                            item.state === "uploading"
                              ? "Uploading..."
                              : "Waiting for the current upload"
                          }`}
                    </p>
                  </div>

                  {item.state === "error" && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => retry(item.id)}
                        className="center h-7 cursor-pointer gap-1 rounded-md border border-border/60 px-2 text-[11px] font-medium text-text6 transition-colors hover:border-primary/50 hover:text-primary dark:border-darkBorder/50 dark:text-text5"
                      >
                        <RotateCcw className="h-3 w-3" />
                        Retry
                      </button>
                      <button
                        type="button"
                        onClick={() => dismiss(item.id)}
                        aria-label={`Dismiss ${item.file.name}`}
                        className="center h-7 w-7 cursor-pointer rounded-md border border-border/60 text-text5 transition-colors hover:border-rose-400/50 hover:text-rose-500 dark:border-darkBorder/50"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ── Jobs ───────────────────────────────────────────────────────── */}
        <section className="flex min-w-0 flex-col">
          <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                Upload Jobs
              </h2>
              {inProgress > 0 && (
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {inProgress} in progress
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => refetchJobs()}
              className="center h-8 cursor-pointer gap-1.5 rounded-lg border border-border/60 px-2.5 text-[11px] font-medium text-text6 transition-colors hover:border-primary/50 hover:text-primary dark:border-darkBorder/50 dark:text-text5"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", refreshingJobs && "animate-spin")}
              />
              Refresh
            </button>
          </div>

          {loadingJobs ? (
            <div className="space-y-2.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-26 animate-pulse rounded-xl border border-border/50 bg-muted/40"
                />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/70 px-6 py-16 text-center">
              <Inbox className="mb-3 size-6 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                No uploads yet
              </p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                Upload a CSV and its progress appears here, with the inserted,
                duplicate and failed counts once it finishes.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {jobs.map((job) => (
                <BulkUploadJobCard
                  key={job._id}
                  job={job}
                  onSettled={handleJobSettled}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
