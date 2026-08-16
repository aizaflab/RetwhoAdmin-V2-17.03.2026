"use client";

import { cn } from "@/lib/utils";

import {
  getPageItems,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  type PaginationVariant,
} from "../pagination/Pagination";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from "../select/Select";

const DEFAULT_PER_PAGE: SelectOption[] = [
  { value: "5", label: "5" },
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
];

interface TablePaginationProps {
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  totalData: number;
  perPageOptions?: SelectOption[];
  variant?: PaginationVariant;
  className?: string;
}

export function TablePagination({
  page,
  setPage,
  limit,
  setLimit,
  totalData,
  perPageOptions = DEFAULT_PER_PAGE,
  variant = "outline",
  className,
}: TablePaginationProps) {
  const lastPage = Math.max(1, Math.ceil(totalData / limit));
  const safePage = Math.min(page, lastPage);
  const from = totalData === 0 ? 0 : (safePage - 1) * limit + 1;
  const to = Math.min(safePage * limit, totalData);

  const changePerPage = (v: string) => {
    setLimit(Number(v));
    // A smaller list can strand the old page past the end — snap back to 1.
    setPage(1);
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-8 gap-y-4",
        className,
      )}
    >
      <div className="flex flex-col">
        <span className="text-[13px] font-medium whitespace-nowrap text-foreground tabular-nums">
          Showing {from.toLocaleString()} – {to.toLocaleString()} of{" "}
          {totalData.toLocaleString()}
        </span>
        <span className="text-[11px] whitespace-nowrap text-muted-foreground tabular-nums">
          Page {safePage.toLocaleString()} of {lastPage.toLocaleString()}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <Pagination variant={variant} className="w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationFirst
                onClick={() => setPage(1)}
                disabled={safePage === 1}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationPrevious
                label=""
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
              />
            </PaginationItem>

            {getPageItems(safePage, lastPage).map((item, i) =>
              typeof item === "number" ? (
                <PaginationItem key={item}>
                  <PaginationLink
                    isActive={item === safePage}
                    onClick={() => setPage(item)}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ) : (
                <PaginationItem key={`${item}-${i}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                label=""
                onClick={() => setPage(Math.min(lastPage, safePage + 1))}
                disabled={safePage === lastPage}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLast
                onClick={() => setPage(lastPage)}
                disabled={safePage === lastPage}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <Select value={String(limit)} onValueChange={changePerPage}>
          <SelectTrigger className="h-8.25 w-20">
            <SelectValue options={perPageOptions} />
          </SelectTrigger>
          <SelectContent>
            <SelectItems options={perPageOptions} />
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
