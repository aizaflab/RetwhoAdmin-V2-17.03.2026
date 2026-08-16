"use client";

import { cn } from "@/lib/utils";

import { TablePagination } from "./TablePagination";

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
  emptyMessage?: string;
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
            className="px-4 py-8 text-center whitespace-nowrap text-muted-foreground"
          >
            {loading ? "Loading data..." : emptyMessage}
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
            {renderTableRows()}
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

export { Table };
