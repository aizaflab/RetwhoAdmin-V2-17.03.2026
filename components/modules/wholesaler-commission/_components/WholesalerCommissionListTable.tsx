"use client";

import { useState } from "react";
import Image from "next/image";
import { Edit2, RotateCcw, Store, Users, X } from "lucide-react";
import { Input } from "@/components/ui";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import { SearchIcon } from "@/components/icons/Icons";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";

import {
  COMMISSION_TYPE_FILTER_OPTIONS,
  formatDate,
  ruleText,
  SHOP_STATUS_FILTER_OPTIONS,
  SHOP_STATUS_STYLES,
} from "../_data/wholesaler-commission-options";
import type {
  CommissionRule,
  WholesalerCommissionRow,
} from "../_types/wholesaler-commission.types";

interface WholesalerCommissionListTableProps {
  rows: WholesalerCommissionRow[];
  /** Row count across every page — drives the pagination footer. */
  total: number;
  loading?: boolean;
  /** The rate everyone without their own is on. */
  globalCommission?: CommissionRule;
  /** Search / filters / paging are all server-side; this component only reports
   *  the changes and renders whatever the API sent back. */
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  /** The owner whose shops alone are listed, if one is picked. */
  owner: { _id: string; label: string } | null;
  onOwnerChange: (owner: { _id: string; label: string } | null) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  onEdit: (row: WholesalerCommissionRow) => void;
  onReset: (row: WholesalerCommissionRow) => Promise<void> | void;
  resetting?: boolean;
}

const ACTION_BUTTON =
  "cursor-pointer center size-8 rounded-lg border border-border bg-card text-muted-foreground transition-all duration-150";

export default function WholesalerCommissionListTable({
  rows,
  total,
  loading,
  globalCommission,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  owner,
  onOwnerChange,
  page,
  onPageChange,
  limit,
  onLimitChange,
  onEdit,
  onReset,
  resetting,
}: WholesalerCommissionListTableProps) {
  const [rowToReset, setRowToReset] = useState<WholesalerCommissionRow | null>(
    null,
  );

  const columns: Column<WholesalerCommissionRow>[] = [
    {
      id: "companyName",
      header: "Wholesaler Shop",
      cell: (value, row) => (
        <div className="flex items-center gap-3">
          {row.image?.url ? (
            <Image
              src={row.image.url}
              alt={row.companyName}
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg object-cover shrink-0"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
              <Store className="w-4 h-4 text-primary" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {row.companyName}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {row.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "owner",
      header: "Owner",
      className: "hidden md:table-cell",
      cell: (value, row) => (
        <div className="min-w-0">
          <p className="text-sm text-foreground truncate">
            {row.owner?.name ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {row.owner?.email ?? ""}
          </p>
        </div>
      ),
    },
    {
      id: "commissionType",
      header: "Commission",
      cell: (value, row) =>
        row.customRate ? (
          <div>
            <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded bg-warning/10 text-warning">
              {ruleText(row.customRate.commission)}
            </span>
            {row.customRate.note && (
              <p className="mt-0.5 max-w-52 truncate text-xs text-muted-foreground">
                {row.customRate.note}
              </p>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground">
            Global · {ruleText(globalCommission)}
          </span>
        ),
    },
    {
      id: "customRate",
      header: "Set",
      className: "hidden lg:table-cell",
      cell: (value, row) =>
        row.customRate ? (
          <div>
            <p className="text-sm text-muted-foreground">
              {formatDate(row.customRate.updatedAt)}
            </p>
            {row.customRate.updatedBy?.name && (
              <p className="text-xs text-muted-foreground">
                by {row.customRate.updatedBy.name}
              </p>
            )}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center hidden sm:table-cell",
      cell: (value, row) => (
        <span
          className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${
            SHOP_STATUS_STYLES[row.status] ?? "bg-muted text-muted-foreground"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      id: "actions" as keyof WholesalerCommissionRow,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, row) => (
        <div className="flex items-center justify-end gap-1">
          <SimpleTooltip content="Set commission" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row);
              }}
              className={`${ACTION_BUTTON} hover:border-primary/50 hover:text-primary`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          {/* Every shop this owner has — the user's whole set at once. */}
          <SimpleTooltip content="All shops of this owner" position="top">
            <button
              disabled={!row.owner}
              onClick={(e) => {
                e.stopPropagation();
                if (row.owner)
                  onOwnerChange({
                    _id: row.owner._id,
                    label: row.owner.email ?? row.owner.name ?? "Owner",
                  });
              }}
              className={`${ACTION_BUTTON} disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:border-primary/50 enabled:hover:text-primary`}
            >
              <Users className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip
            content={row.customRate ? "Back to global rate" : "On global rate"}
            position="top"
          >
            <button
              disabled={!row.customRate}
              onClick={(e) => {
                e.stopPropagation();
                setRowToReset(row);
              }}
              className={`${ACTION_BUTTON} disabled:cursor-not-allowed disabled:opacity-40 enabled:hover:border-destructive/50 enabled:hover:text-destructive`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <h3 className="text-xl font-medium text-foreground">
          Wholesaler Shops
        </h3>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search — shop name, DBA, shop email, owner name or email. */}
          <div className="relative flex-1 sm:w-72">
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search shop, email or owner email..."
              startIcon={
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
              }
              className="h-10 w-full bg-card border-border"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <div className="relative w-36">
              <Select value={typeFilter} onValueChange={onTypeFilterChange}>
                <SelectTrigger className="h-10 rounded-md bg-card text-foreground">
                  <SelectValue
                    options={COMMISSION_TYPE_FILTER_OPTIONS}
                    placeholder="All Rates"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItems options={COMMISSION_TYPE_FILTER_OPTIONS} />
                </SelectContent>
              </Select>
            </div>

            <div className="relative w-32">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="h-10 rounded-md bg-card text-foreground">
                  <SelectValue
                    options={SHOP_STATUS_FILTER_OPTIONS}
                    placeholder="All Status"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItems options={SHOP_STATUS_FILTER_OPTIONS} />
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* The owner whose shops alone are listed */}
      {owner && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Showing every shop of</span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 font-medium text-primary">
            {owner.label}
            <button
              onClick={() => onOwnerChange(null)}
              aria-label="Show every owner"
              className="cursor-pointer rounded hover:bg-primary/20"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        </div>
      )}

      {/* Table */}
      <Table<WholesalerCommissionRow>
        data={rows}
        columns={columns}
        loading={loading}
        pagination
        page={page}
        setPage={onPageChange}
        limit={limit}
        setLimit={onLimitChange}
        totalData={total}
        bordered
        emptyMessage="No wholesaler shops found"
        emptyDescription="Try another name or email, or clear the filters."
        headerColor="bg-muted/60"
        tableClassName="min-w-full"
      />

      {/* Back to the global rate */}
      <DeleteModal
        title="Back to the global rate?"
        text={`"${rowToReset?.companyName}" will be charged the global commission (${ruleText(globalCommission)}) on new orders. Orders already placed keep their rate.`}
        deleteModal={!!rowToReset}
        setDeleteModal={(open) => {
          if (!open) setRowToReset(null);
        }}
        selectedRow={rowToReset}
        isLoading={resetting}
        handleDelete={async (row) => {
          if (!row) return;
          await onReset(row);
          setRowToReset(null);
        }}
      />
    </div>
  );
}
