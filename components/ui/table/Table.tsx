"use client";

import { cn } from "@/lib/utils";
import { Pagination } from "../pagination/Pagination";

// Column Type Definition
export interface Column<T> {
  id: keyof T; // Column id should be a key of the data row
  header: string;
  accessor?: (row: T) => unknown; // Accessor function to fetch the value (allow any type)
  cell?: (value: unknown, row: T, rowIndex?: number) => React.ReactNode;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  className?: string;
}

// Data Row Type (Generic)
interface TableProps<T> {
  data: T[]; // Data can be any type
  columns: Column<T>[]; // Columns can be dynamic, typed with T
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
  tableClassName,
  paginationClass = "",
  headerColor = "bg-[#FFE8E4]",
  bordered = false,
}: TableProps<T>) => {
  const renderCellContent = (row: T, rowIndex: number, column: Column<T>) => {
    const value = column.accessor ? column.accessor(row) : row[column.id];
    return column.cell ? column.cell(value, row, rowIndex) : value;
  };

  // Render table header
  const renderTableHeader = () => (
    <thead
      className={`${headerColor} dark:bg-[#3A3A3A] text-muted-foreground border-b border-border/50 dark:border-darkBorder/50`}
    >
      <tr>
        {columns.map((column) => (
          <th
            key={String(column.id)}
            className={cn(
              "px-4 py-4 text-left text-sm font-medium whitespace-nowrap",
              bordered &&
                "border-r last:border-r-0 border-border/50 dark:border-darkBorder/50",
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
    <tbody className="divide-y divide-gray-100 dark:divide-[#3A3A3A]">
      {data.length > 0 ? (
        data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={cn(
              "hover:bg-secondary dark:hover:bg-[#262626] transition-colors",
              onRowClick && "cursor-pointer",
            )}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((column) => (
              <td
                key={`${rowIndex}-${String(column.id)}`}
                className={cn(
                  "px-4 py-3 text-sm whitespace-nowrap",
                  bordered &&
                    "border-r last:border-r-0 border-border/50 dark:border-darkBorder/50",
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
            className="px-4 py-8 text-center text-muted-foreground whitespace-nowrap"
          >
            {loading ? "Loading data..." : emptyMessage}
          </td>
        </tr>
      )}
    </tbody>
  );

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setLimit?.(size);
    setPage?.(1);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Table */}
      <div className="w-full border border-border/50 dark:border-darkBorder/50 rounded-md overflow-x-auto">
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

      {/* Pagination */}
      {pagination && setPage && setLimit && (
        <div className={`mt-4 ${paginationClass}`}>
          <Pagination
            totalItems={totalData ?? 0}
            pageSize={limit ?? 10}
            currentPage={page ?? 1}
            onPageChange={(p: number) => setPage(p)}
            onPageSizeChange={handlePageSizeChange}
            showPageSizeOptions={true}
            align="end"
            size="small"
          />
        </div>
      )}
    </div>
  );
};

export { Table };
