"use client";

import { useState, useEffect } from "react";

import { cn } from "@/lib/utils";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisIcon,
} from "@/components/icons/Icons";
import { Select } from "../select/Select";

interface PaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  showPageSizeOptions: boolean;
  showPageNumbers?: boolean;
  showPrevNextButtons?: boolean;
  showingLabel?: string;
  ofLabel?: string;
  variant?: "default" | "floating" | "gradient" | "pill";
  size?: "small" | "default" | "large";
  color?: "primary" | "secondary" | "accent" | "custom";
  className?: string;
  align?: "start" | "center" | "end";
  siblingCount?: number;
  showPageInfo?: boolean;
}

const Pagination = ({
  totalItems = 0,
  pageSize = 10,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeOptions = false,
  showPageNumbers = true,
  showPrevNextButtons = true,
  showingLabel = "Showing",
  ofLabel = "of",
  variant = "default",
  size = "default",
  color = "primary",
  className,
  align = "center",
  siblingCount = 1,
  showPageInfo = true,
}: PaginationProps) => {
  const [page, setPage] = useState(currentPage);
  const [perPage, setPerPage] = useState(pageSize);

  // Calculate total pages
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  // Update internal state when props change
  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setPerPage(pageSize);
  }, [pageSize]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === page) return;
    setPage(newPage);
    onPageChange?.(newPage);
  };

  // Handle page size change (for Select component)
  const handlePageSizeChange = (newSizeStr: string) => {
    const newSize = Number(newSizeStr);
    setPerPage(newSize);
    setPage(1); // Reset to page 1 when page size changes
    onPageSizeChange?.(newSize);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    // If less than 6 pages, just show all page numbers without ellipsis
    if (totalPages < 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pageNumbers = [];
    pageNumbers.push(1);

    const leftSiblingIndex = Math.max(2, page - siblingCount);
    const rightSiblingIndex = Math.min(totalPages - 1, page + siblingCount);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from(
        { length: leftItemCount },
        (_, i) => totalPages - leftItemCount + i + 1,
      );
      return [1, "leftDots", ...leftRange];
    }

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => i + 1,
      );
      return [...rightRange, "rightDots", totalPages];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i,
      );
      return [1, "leftDots", ...middleRange, "rightDots", totalPages];
    }

    const range = Array.from({ length: totalPages }, (_, i) => i + 1);
    return range;
  };

  // Size styles - applied to buttons
  const getSizeClasses = () => {
    switch (size) {
      case "small":
        return {
          button: "size-8 text-xs",
          text: "text-xs",
          gap: "gap-0.5",
        };
      case "large":
        return {
          button: "size-11 text-base",
          text: "text-base",
          gap: "gap-1.5",
        };
      default:
        return {
          button: "size-9 text-sm",
          text: "text-sm",
          gap: "gap-1",
        };
    }
  };

  // Color styles for active button
  const getColorClasses = () => {
    switch (color) {
      case "secondary":
        return "!bg-zinc-700 !border-zinc-700 !text-white dark:!text-white hover:!bg-zinc-600";
      case "accent":
        return "!bg-violet-600 !border-violet-600 !text-white dark:!text-white hover:!bg-violet-500";
      case "custom":
        return "!bg-blue-600 !border-blue-600 !text-white dark:!text-white hover:!bg-blue-500";
      default:
        return "!bg-primary !border-primary !text-white dark:!text-black hover:!bg-primary/90";
    }
  };

  // Variant styles
  const getVariantClasses = () => {
    switch (variant) {
      case "floating":
        return {
          wrapper: "bg-white dark:bg-zinc-800 p-1 rounded-full shadow-lg",
          button:
            "border-0 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-full",
          activeButton: "shadow-inner rounded-full",
        };
      case "gradient":
        return {
          wrapper: "bg-white dark:bg-zinc-800 shadow-md rounded-lg p-1",
          button:
            "border-0 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-md",
          activeButton: "bg-gradient-to-r shadow-md rounded-md",
        };
      case "pill":
        return {
          wrapper: "",
          button:
            "rounded-full border-0 bg-gray-100 dark:bg-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-600",
          activeButton: "shadow-md rounded-full",
        };
      default:
        return {
          wrapper: "",
          button:
            "border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 rounded-lg",
          activeButton: "shadow-md rounded-lg",
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const colorClasses = getColorClasses();
  const variantClasses = getVariantClasses();

  // Calculate start and end item numbers
  const startItem = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const endItem = Math.min(page * perPage, totalItems);

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2.5",
        align === "start"
          ? "items-start"
          : align === "end"
            ? "items-end"
            : "items-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-3 sm:gap-4 w-full",
          showPageInfo && "lg:justify-between",
          !showPageInfo || align !== "center"
            ? align === "start"
              ? "justify-start"
              : align === "end"
                ? "justify-end"
                : "justify-center"
            : "justify-center",
        )}
      >
        {/* Page info */}
        {showPageInfo && (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "text-slate-500 dark:text-zinc-400 font-medium whitespace-nowrap hidden sm:block",
                sizeClasses.text,
              )}
            >
              {showingLabel}{" "}
              <span className="font-semibold text-slate-900 dark:text-zinc-200">
                {startItem} - {endItem}
              </span>{" "}
              {ofLabel}{" "}
              <span className="font-semibold text-slate-900 dark:text-zinc-200">
                {totalItems}
              </span>
            </div>
            |
            <div
              className={cn(
                "text-slate-400 font-medium whitespace-nowrap hidden sm:block",
                sizeClasses.text,
              )}
            >
              Page{" "}
              <span className="font-bold text-slate-600 dark:text-zinc-300">
                {page}
              </span>{" "}
              of {totalPages}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Pagination controls */}
          {totalPages > 1 && (
            <div
              className={cn(
                "flex items-center",
                sizeClasses.gap,
                variantClasses.wrapper,
              )}
            >
              {/* Previous Button */}
              {showPrevNextButtons && (
                <button
                  type="button"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={cn(
                    "flex items-center justify-center transition-all duration-200",
                    variantClasses.button,
                    sizeClasses.button,
                    page === 1 && "opacity-40 cursor-not-allowed",
                    "dark:text-zinc-300",
                  )}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon className="size-4" />
                </button>
              )}

              {/* Page Numbers */}
              {showPageNumbers && (
                <div className={cn("flex items-center", sizeClasses.gap)}>
                  {getPageNumbers().map((pageNumber, index) => {
                    if (
                      pageNumber === "leftDots" ||
                      pageNumber === "rightDots"
                    ) {
                      return (
                        <span
                          key={`dots-${index}`}
                          className={cn(
                            "hidden sm:flex items-center justify-center text-slate-400",
                            sizeClasses.button,
                          )}
                        >
                          <EllipsisIcon className="size-4" />
                        </span>
                      );
                    }

                    const isActive = page === pageNumber;
                    const isDistant =
                      index > 0 &&
                      index < getPageNumbers().length - 1 &&
                      Math.abs((pageNumber as number) - page) > 1;

                    return (
                      <button
                        type="button"
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber as number)}
                        className={cn(
                          "flex items-center justify-center transition-all duration-200 font-medium",
                          variantClasses.button,
                          sizeClasses.button,
                          "dark:text-zinc-300",
                          isActive && variantClasses.activeButton,
                          isActive && colorClasses,
                          isDistant && "hidden md:flex",
                          !isActive &&
                            index !== 0 &&
                            index !== getPageNumbers().length - 1 &&
                            "hidden sm:flex",
                        )}
                        aria-label={`Page ${pageNumber}`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Next Button */}
              {showPrevNextButtons && (
                <button
                  type="button"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={cn(
                    "flex items-center justify-center transition-all duration-200",
                    variantClasses.button,
                    sizeClasses.button,
                    page === totalPages && "opacity-40 cursor-not-allowed",
                    "dark:text-zinc-300",
                  )}
                  aria-label="Next page"
                >
                  <ChevronRightIcon className="size-4" />
                </button>
              )}
            </div>
          )}

          {/* Page size options & Total Pages */}
          {showPageSizeOptions && (
            <div className="flex items-center gap-2">
              <Select
                value={String(perPage)}
                onValueChange={handlePageSizeChange}
                options={pageSizeOptions.map((opt) => ({
                  value: String(opt),
                  label: `${opt}/pg`,
                }))}
                className="w-[90px]"
                fieldClass="!h-8 !py-1 text-xs bg-muted"
                placeholder="Select"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { Pagination };
