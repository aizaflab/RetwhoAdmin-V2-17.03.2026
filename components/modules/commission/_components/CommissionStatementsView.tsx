"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { useGetCommissionStatementsQuery } from "@/featured/commission/commissionApiSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Input, SimpleSelect, Table, type Column } from "@/components/ui";
import { Badge } from "@/components/ui/badge/Badge";

import {
  currentMonth,
  fmtDate,
  fmtMoney,
  monthLabel,
  monthOptions,
} from "../_data/commission";
import type { StatementRow } from "../_types/commission.types";

/**
 * Every wholesaler's commission for a month: what it came to, what online
 * payments took, what retwho collected or waived, and what is still owed —
 * that month and overall. Wholesalers still owing from earlier months show
 * too. A row opens the wholesaler to ask for it or collect it.
 */
export default function CommissionStatementsView({
  detailHref,
}: {
  detailHref: (shopId: string, month: string) => string;
}) {
  const router = useRouter();
  const [month, setMonth] = useState(currentMonth());
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const debounced = useDebouncedValue(search);

  const { data, isLoading, isFetching } = useGetCommissionStatementsQuery(
    {
      page,
      limit,
      ...(month !== "all" ? { month } : {}),
      ...(debounced.trim() ? { searchTerm: debounced.trim() } : {}),
    },
    { refetchOnMountOrArgChange: true },
  );
  const totals = data?.totals;

  const cards = [
    {
      label: `Commission · ${monthLabel(month === "all" ? null : month)}`,
      value: totals?.commission,
      hint: `${totals?.orders ?? 0} orders`,
    },
    {
      label: "Taken from online payments",
      value: totals?.collectedOnline,
      hint: `+ ${fmtMoney(totals?.processingFees)} card / ACH fees`,
    },
    {
      label: "Collected by Retwho",
      value: totals?.collectedByRetwho,
      hint: `${fmtMoney(totals?.waived)} waived`,
    },
    {
      label: "Still owed",
      value: totals?.outstanding,
      hint: `${fmtMoney(totals?.due)} of it from this period`,
      tone: "text-warning",
    },
  ];

  const columns: Column<StatementRow>[] = [
    {
      id: "wholesaler",
      header: "Wholesaler",
      cell: (_v, row) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">
            {row.wholesaler.companyName}
          </p>
          <p className="text-xs text-muted-foreground">
            {row.orders} order{row.orders === 1 ? "" : "s"}
          </p>
        </div>
      ),
    },
    {
      id: "commission",
      header: "Commission",
      cell: (_v, row) => (
        <span className="text-sm tabular-nums">{fmtMoney(row.commission)}</span>
      ),
    },
    {
      id: "collectedOnline",
      header: "Online",
      cell: (_v, row) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {fmtMoney(row.collectedOnline)}
        </span>
      ),
    },
    {
      id: "collectedByRetwho",
      header: "Collected",
      cell: (_v, row) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {fmtMoney(row.collectedByRetwho)}
          {row.waived > 0 ? ` · ${fmtMoney(row.waived)} waived` : ""}
        </span>
      ),
    },
    {
      id: "due",
      header: "Owed this period",
      cell: (_v, row) => (
        <span className="text-sm font-medium tabular-nums">
          {fmtMoney(row.due)}
        </span>
      ),
    },
    {
      id: "outstanding",
      header: "Owed overall",
      cell: (_v, row) => (
        <div>
          <span
            className={`text-sm font-semibold tabular-nums ${row.outstanding > 0 ? "text-warning" : "text-success"}`}
          >
            {fmtMoney(row.outstanding)}
          </span>
          {row.inProgress > 0 && (
            <p className="text-xs text-muted-foreground">
              {fmtMoney(row.inProgress)} being collected
            </p>
          )}
        </div>
      ),
    },
    {
      id: "openRequest",
      header: "Asked",
      cell: (_v, row) =>
        row.openRequest ? (
          <Badge variant="info" appearance="soft" size="sm">
            {fmtMoney(row.openRequest.amount)} ·{" "}
            {fmtDate(row.openRequest.createdAt)}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
  ];

  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p
              className={`text-lg font-semibold tabular-nums ${card.tone ?? ""}`}
            >
              {fmtMoney(card.value)}
            </p>
            <p className="text-xs text-muted-foreground">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-3 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={search}
            onValueChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            placeholder="Search wholesalers..."
            startIcon={<SearchIcon className="h-4 w-4 text-muted-foreground" />}
            className="h-10 w-full bg-card sm:w-72"
          />
          <div className="sm:ml-auto sm:w-52">
            <SimpleSelect
              options={monthOptions()}
              value={month}
              onChange={(value) => {
                setMonth(value);
                setPage(1);
              }}
              className="h-10 rounded-md bg-card"
            />
          </div>
        </div>
        <Table<StatementRow>
          data={data?.rows ?? []}
          columns={columns}
          loading={isLoading || isFetching}
          pagination
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalData={data?.meta.total ?? 0}
          bordered
          emptyMessage="No commission for this period"
          emptyDescription="Commission shows here once orders are delivered or paid online."
          headerColor="bg-muted/50"
          tableClassName="min-w-full"
          onRowClick={(row) =>
            router.push(detailHref(row.wholesalerShopId, month))
          }
        />
      </div>
    </div>
  );
}
