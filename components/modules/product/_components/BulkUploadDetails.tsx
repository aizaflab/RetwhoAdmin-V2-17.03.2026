"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CopyCheck,
  FileSpreadsheet,
  ListChecks,
  ListX,
  PackagePlus,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { SearchIcon } from "@/components/icons/Icons";
import { Button } from "@/components/ui/button/Button";
import { Input } from "@/components/ui/input/Input";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { Column, Table } from "@/components/ui/table/Table";
import { cn } from "@/lib/utils";
import {
  useGetBulkUploadErrorsQuery,
  useGetBulkUploadJobsQuery,
  useGetBulkUploadStatusQuery,
} from "@/featured/product/productApiSlice";

import { bulkStatusMeta, errorRowMeta } from "../_data/bulk-upload-options";
import type { BulkUploadErrorLog } from "../_types/bulk-upload.types";
import {
  formatCount,
  formatDuration,
  formatRelative,
} from "../_utils/bulk-upload";

interface BulkUploadDetailsProps {
  /** The key the job was queued with — the id in the page's URL. */
  idempotencyKey: string;
}

/** The colour each counter's number carries. The icons stay neutral. */
const SUMMARY_TONES = {
  neutral: "text-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-rose-600 dark:text-rose-400",
};

/**
 * One counter in the summary strip above the table. The icon sits opposite the
 * number so the four tiles read as a row of gauges rather than four boxes of
 * text with the right-hand two thirds empty.
 */
function SummaryStat({
  label,
  value,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: keyof typeof SUMMARY_TONES;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/30 px-3.5 py-3 dark:border-darkBorder/40 dark:bg-white/2">
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 truncate text-lg font-semibold tabular-nums",
            // A zero count is not news, so it never gets a colour of its own.
            value === "0" ? "text-muted-foreground" : SUMMARY_TONES[tone],
          )}
        >
          {value}
        </p>
      </div>

      {/* Bare glyph, no chip — it marks the counter without competing with it. */}
      <span
        className="shrink-0 text-black/40 dark:text-white/40"
        aria-hidden="true"
      >
        {icon}
      </span>
    </div>
  );
}

/** Monospaced code, for the barcodes that only read right digit by digit. */
function Code({ value }: { value?: string }) {
  if (!value) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="font-mono text-[11px] tracking-tight text-foreground">
      {value}
    </span>
  );
}

/**
 * The rows a bulk upload refused, behind the job card's duplicate/failed
 * counters. Paging and search are the server's — the endpoint answers one page
 * at a time, and these jobs run to thousands of rows.
 */
export default function BulkUploadDetails({
  idempotencyKey,
}: BulkUploadDetailsProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Typing is debounced so a search does not fire a request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // The list is what carries the file name, and it is already in the cache
  // when someone arrives from the upload page — so the header paints at once.
  const { data: jobData, isLoading: loadingJob } =
    useGetBulkUploadJobsQuery(undefined);
  const job = jobData?.jobs?.find(
    (candidate) => candidate.idempotencyKey === idempotencyKey,
  );

  // On a cold load (a bookmarked link, a refresh) the job may have aged out of
  // the list. The status endpoint still answers with the counters, so the page
  // is useful even without the row.
  const { data: progress } = useGetBulkUploadStatusQuery(idempotencyKey, {
    skip: !idempotencyKey,
  });

  const status = job?.status ?? progress?.status;
  const total = job?.total ?? progress?.total ?? 0;
  const processed = job?.processed ?? progress?.processed ?? 0;
  const inserted = job?.insertedCount ?? progress?.insertedCount ?? 0;
  const duplicates = job?.duplicateCount ?? progress?.duplicateCount ?? 0;
  const failed = job?.failedCount ?? progress?.failedCount ?? 0;
  const rejected = duplicates + failed;

  const duration = formatDuration(
    job?.startedAt ?? progress?.startedAt,
    job?.completedAt ?? progress?.completedAt,
  );

  const {
    data,
    isFetching,
    isError,
    isLoading: loadingRows,
    refetch,
  } = useGetBulkUploadErrorsQuery(
    {
      idempotencyKey,
      page,
      limit,
      sortBy: "createdAt",
      searchTerm: searchTerm || undefined,
    },
    { skip: !idempotencyKey },
  );

  const rows = data?.rows ?? [];
  const rowTotal = data?.meta?.total ?? 0;

  const columns = useMemo<Column<BulkUploadErrorLog>[]>(
    () => [
      {
        id: "row",
        header: "Row",
        width: 70,
        cell: (_value, entry) => (
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            #{entry.row}
          </span>
        ),
      },
      {
        id: "product",
        header: "Product",
        minWidth: 240,
        cell: (_value, entry) => (
          <div className="min-w-0 max-w-xs">
            <p
              className="truncate text-sm font-medium text-foreground"
              title={entry.product?.name}
            >
              {entry.product?.name || "Unnamed row"}
            </p>
            {entry.product?.description && (
              <p
                className="mt-0.5 truncate text-[11px] text-muted-foreground"
                title={entry.product.description}
              >
                {entry.product.description}
              </p>
            )}
          </div>
        ),
      },
      {
        id: "uploadId",
        header: "UPC / Box UPC",
        minWidth: 160,
        cell: (_value, entry) => (
          <div className="space-y-0.5">
            <div>
              <Code value={entry.product?.upc} />
            </div>
            <div className="opacity-70">
              <Code value={entry.product?.boxUpc} />
            </div>
          </div>
        ),
      },
      {
        id: "expiresAt",
        header: "Tags",
        minWidth: 140,
        cell: (_value, entry) => {
          const tags = entry.product?.tags ?? [];
          if (!tags.length)
            return <span className="text-muted-foreground">—</span>;

          return (
            <div className="flex max-w-40 flex-wrap gap-1">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        width: 120,
        cell: (_value, entry) => {
          const meta = errorRowMeta(entry.status);
          return (
            <span
              className={cn(
                "inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap",
                meta.badge,
              )}
            >
              {meta.label}
            </span>
          );
        },
      },
      {
        id: "reason",
        header: "Reason",
        minWidth: 200,
        cell: (_value, entry) => (
          <span className="text-xs text-muted-foreground">
            {entry.reason || "No reason given"}
          </span>
        ),
      },
    ],
    [],
  );

  const statusMeta = bulkStatusMeta(status);

  return (
    <div className="min-h-[calc(100dvh-93px)] rounded-xl border border-border/50 bg-card p-3 text-card-foreground sm:min-h-[calc(100dvh-109px)] sm:p-5">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/product/bulk-upload"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/70 bg-white text-text6 transition-all duration-200 hover:border-primary/50 hover:text-primary dark:border-darkBorder/50 dark:bg-darkBg dark:text-text5"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold text-black dark:text-white">
              Upload Details
            </h1>
            <p className="text-[12px] text-text5 dark:text-text6">
              Every row this file could not add to the catalog, and why it was
              dropped.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => refetch()}
          startIcon={
            <RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
          }
          className="shrink-0"
        >
          Refresh
        </Button>
      </div>

      <div className="space-y-5 border-t border-t-border/50 pt-5">
        {/* What was uploaded. */}
        {loadingJob && !job ? (
          <Skeleton shape="rect" className="h-20 w-full rounded-lg" />
        ) : (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-linear-to-r from-primary/5 to-transparent p-4">
            <div className="center h-11 w-11 shrink-0 rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="truncate text-sm font-semibold text-foreground"
                title={job?.fileName}
              >
                {job?.fileName ?? "This upload"}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground">
                {job?.createdAt && <span>{formatRelative(job.createdAt)}</span>}
                {job?.createdAt && <span aria-hidden="true">·</span>}
                <span className="tabular-nums">{formatCount(total)} rows</span>
                {duration && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>took {duration}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="font-mono break-all">{idempotencyKey}</span>
              </div>
            </div>

            {status && (
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                  statusMeta.badge,
                )}
              >
                {statusMeta.label}
              </span>
            )}
          </div>
        )}

        {/* The counters, so the table below has something to be read against. */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryStat
            label="Processed"
            value={formatCount(processed)}
            icon={<ListChecks className="h-4.5 w-4.5" />}
          />
          <SummaryStat
            label="Inserted"
            value={formatCount(inserted)}
            tone="success"
            icon={<PackagePlus className="h-4.5 w-4.5" />}
          />
          <SummaryStat
            label="Duplicates"
            value={formatCount(duplicates)}
            tone="warning"
            icon={<CopyCheck className="h-4.5 w-4.5" />}
          />
          <SummaryStat
            label="Failed"
            value={formatCount(failed)}
            tone="danger"
            icon={<XCircle className="h-4.5 w-4.5" />}
          />
        </div>

        {/* Rejected rows. */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Rejected Rows
            </h2>
            <p className="text-[11px] text-muted-foreground">
              {isError
                ? "Could not load these rows."
                : `${formatCount(rowTotal)} of ${formatCount(rejected)} dropped rows are kept for review.`}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, UPC, reason..."
              startIcon={<SearchIcon className="h-4 w-4 text-text5" />}
              className="h-10 w-full bg-white dark:border-darkBorder/80 dark:bg-darkBg"
            />
          </div>
        </div>

        <Table<BulkUploadErrorLog>
          data={rows}
          columns={columns}
          loading={loadingRows}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={(next) => {
            setLimit(next);
            setPage(1);
          }}
          totalData={rowTotal}
          pagination={rowTotal > 0}
          emptyIcon={<ListX className="size-6" />}
          emptyMessage={
            searchTerm ? "No rows match that search" : "Nothing was rejected"
          }
          bordered
          emptyDescription={
            searchTerm
              ? "Try a different product name, UPC or reason."
              : rejected > 0
                ? "The rejected rows for this upload have expired and are no longer kept."
                : "Every row in this file was accepted into the catalog."
          }
        />
      </div>
    </div>
  );
}
