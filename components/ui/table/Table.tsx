"use client";

import { cn } from "@/lib/utils";

import { Skeleton } from "../skeleton/Skeleton";
import { TableEmptyState, type TableEmptyAction } from "./TableEmptyState";
import { TablePagination } from "./TablePagination";

/** A limit of 50 or 100 would fill the screen with grey, so the count stops here. */
const SKELETON_MAX_ROWS = 10;

/** Varied bar widths, so the placeholder reads as content rather than a grid. */
const SKELETON_WIDTHS = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-3/5"];

// Column Type Definition
export interface Column<T> {
  id: keyof T;
  header: React.ReactNode;
  accessor?: (row: T) => unknown;
  cell?: (value: unknown, row: T, rowIndex: number) => React.ReactNode;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  className?: string;
}

// Data Row Type (Generic)
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: boolean;
  page?: number;
  setPage?: (page: number) => void;
  limit?: number;
  setLimit?: (limit: number) => void;
  totalData?: number;
  totalPages?: number;
  loading?: boolean;
  /** Empty-state headline. */
  emptyMessage?: string;
  /** Supporting line under the headline — say what to try next. */
  emptyDescription?: string;
  /** Icon for the empty state; falls back to a neutral inbox. */
  emptyIcon?: React.ReactNode;
  /** Buttons under the copy — a reload, a filter reset, a create. */
  emptyActions?: TableEmptyAction[];
  /** Replaces the whole empty panel when a table needs something bespoke. */
  emptyState?: React.ReactNode;
  onRowClick?: (row: T) => void;
  actions?: boolean;
  className?: string;
  rowClass?: string;
  tableClassName?: string;
  paginationClass?: string;
  headerColor?: string;
  bordered?: boolean;
}

// Table Component Definition
const Table = <T,>({
  data = [],
  columns = [],
  pagination = true,
  page,
  setPage,
  limit,
  setLimit,
  totalData = 0,
  loading = false,
  emptyMessage = "No data available",
  emptyDescription,
  emptyIcon,
  emptyActions,
  emptyState,
  onRowClick,
  actions,
  className,
  rowClass,
  tableClassName,
  paginationClass = "",
  headerColor = "",
  bordered = false,
}: TableProps<T>) => {
  const renderCellContent = (row: T, rowIndex: number, column: Column<T>) => {
    const value = column.accessor ? column.accessor(row) : row[column.id];
    return column.cell ? column.cell(value, row, rowIndex) : value;
  };

  // Render table header
  const renderTableHeader = () => (
    <thead
      className={`${headerColor} border-b border-border/50 bg-muted text-muted-foreground`}
    >
      <tr>
        {columns.map((column) => (
          <th
            key={String(column.id)}
            className={cn(
              "px-4 py-3 text-left text-sm font-medium whitespace-nowrap",
              bordered && "border-r border-border/50 last:border-r-0",
              column.className,
            )}
            style={{
              ...(column.width != null ? { width: column.width } : {}),
              ...(column.minWidth != null ? { minWidth: column.minWidth } : {}),
              ...(column.maxWidth != null ? { maxWidth: column.maxWidth } : {}),
            }}
          >
            <div
              className={`flex items-center gap-1 ${String(column.id) === "actions" ? "justify-end" : ""}`}
            >
              <span>{column.header}</span>
            </div>
          </th>
        ))}
      </tr>
    </thead>
  );

  const renderSkeletonRows = () => (
    <tbody className="divide-y divide-border/50">
      {Array.from({ length: Math.min(limit ?? 10, SKELETON_MAX_ROWS) }).map(
        (_, rowIndex) => (
          <tr key={`skeleton-${rowIndex}`}>
            {columns.map((column) => (
              <td
                key={`skeleton-${rowIndex}-${String(column.id)}`}
                className={cn(
                  "px-4 py-3 text-sm whitespace-nowrap",
                  rowClass,
                  bordered && "border-r border-border/50 last:border-r-0",
                  column.className,
                )}
              >
                <Skeleton
                  shape="text"
                  className={cn(
                    "h-7",
                    String(column.id) === "actions"
                      ? "ml-auto w-16"
                      : SKELETON_WIDTHS[rowIndex % SKELETON_WIDTHS.length],
                  )}
                />
              </td>
            ))}
          </tr>
        ),
      )}
    </tbody>
  );

  // Render table rows
  const renderTableRows = () => (
    <tbody className="divide-y divide-border/50">
      {data.length > 0 ? (
        data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={cn("hover:bg-muted", onRowClick && "cursor-pointer")}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((column) => (
              <td
                key={`${rowIndex}-${String(column.id)}`}
                className={cn(
                  "px-4 py-3 text-sm whitespace-nowrap",
                  rowClass,
                  bordered && "border-r border-border/50 last:border-r-0",
                )}
                style={{
                  ...(column.width != null ? { width: column.width } : {}),
                  ...(column.minWidth != null
                    ? { minWidth: column.minWidth }
                    : {}),
                  ...(column.maxWidth != null
                    ? { maxWidth: column.maxWidth }
                    : {}),
                }}
              >
                {renderCellContent(row, rowIndex, column) as React.ReactNode}
              </td>
            ))}
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan={columns.length + (actions ? 1 : 0)}
            className="p-0 py-12 text-center"
          >
            {/* An empty body only renders when not loading — the skeleton
                covers that case — so this is always the real empty state. */}
            {emptyState ?? (
              <TableEmptyState
                icon={emptyIcon}
                title={emptyMessage}
                description={emptyDescription}
                actions={emptyActions}
              />
            )}
          </td>
        </tr>
      )}
    </tbody>
  );

  const currentPage = page ?? 1;

  const showPagination = pagination && !!setPage && !!setLimit && totalData > 0;

  return (
    <div className={cn("w-full", className)}>
      {/* One bordered card holding the scrollable table and its footer. */}
      <div className="w-full rounded-md border border-border/50">
        <div className="w-full overflow-x-auto">
          <table
            className={cn(
              "w-full",
              bordered && "border-collapse",
              tableClassName,
            )}
          >
            {renderTableHeader()}
            {/* Skeletons stand in only while there is nothing to show; a
                refetch over existing rows keeps them on screen instead of
                blanking the table the user is reading. */}
            {loading && data.length === 0
              ? renderSkeletonRows()
              : renderTableRows()}
          </table>
        </div>
      </div>
      {/* Pagination footer — below the table card. */}
      {showPagination && (
        <div className={cn("pt-5", paginationClass)}>
          <TablePagination
            page={currentPage}
            setPage={setPage}
            limit={limit ?? 10}
            setLimit={setLimit}
            totalData={totalData}
          />
        </div>
      )}
    </div>
  );
};

export { Table, TableEmptyState };
export type { TableEmptyAction };
