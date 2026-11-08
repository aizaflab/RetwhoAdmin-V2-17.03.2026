"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import {
  WholesalerCommissionFormDialog,
  WholesalerCommissionListTable,
  WholesalerCommissionStats,
} from "@/components/modules/wholesaler-commission";
import type {
  CommissionType,
  SetWholesalerCommissionPayload,
  WholesalerCommissionListQuery,
  WholesalerCommissionRow,
} from "@/components/modules/wholesaler-commission";
import {
  useGetWholesalerCommissionStatsQuery,
  useGetWholesalerCommissionsQuery,
  useRemoveWholesalerCommissionMutation,
  useSetWholesalerCommissionMutation,
} from "@/featured/wholesaler-commission/wholesalerCommissionApiSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/apiError";

export default function WholesalerCommissionPage() {
  const user = useCurrentAccess();

  // Query state — everything here goes to the API, nothing is filtered locally.
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  // One user's shops, picked from a row's "all shops of this owner".
  const [owner, setOwner] = useState<{ _id: string; label: string } | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [shopToSet, setShopToSet] = useState<WholesalerCommissionRow | null>(
    null,
  );

  const debouncedSearch = useDebouncedValue(search);

  // Any change to what is being listed sends the table back to page 1 — a
  // narrowed result set can have fewer pages than the one currently in view.
  const resetPage =
    <T,>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      setPage(1);
    };

  const listQuery: WholesalerCommissionListQuery = {
    page,
    limit,
    ...(debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
    ...(owner ? { ownerId: owner._id } : {}),
    ...(typeFilter !== "all"
      ? { commissionType: typeFilter as CommissionType }
      : {}),
    ...(statusFilter !== "all" ? { status: statusFilter } : {}),
  };

  const {
    data: list,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useGetWholesalerCommissionsQuery(listQuery);
  const { data: stats, isLoading: isStatsLoading } =
    useGetWholesalerCommissionStatsQuery(undefined);

  const [setCommission, { isLoading: isSetting }] =
    useSetWholesalerCommissionMutation();
  const [removeCommission, { isLoading: isRemoving }] =
    useRemoveWholesalerCommissionMutation();

  // `.unwrap()` rethrows the API error, which is what lets the dialog toast
  // the reason instead of failing silently.
  const handleSet = (shopId: string, data: SetWholesalerCommissionPayload) =>
    setCommission({ shopId, data }).unwrap();

  const handleRemove = (shopId: string) => removeCommission(shopId).unwrap();

  const handleReset = async (row: WholesalerCommissionRow) => {
    try {
      await handleRemove(row._id);
      toast.success(`"${row.companyName}" is back on the global rate.`);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not move it back to the global rate."),
      );
    }
  };

  return (
    <PermissionGuard
      user={user}
      permissions={[PERMISSIONS.ADMIN_SETTINGS_VIEW]}
    >
      <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border border-border bg-card text-card-foreground">
        {/* Page header */}
        <div className="mb-5">
          <h1 className="sm:text-2xl text-xl font-medium">
            Wholesaler Commission
          </h1>
          <p className="text-sm text-muted-foreground">
            Give a wholesaler shop its own commission. Shops without one are
            charged the global rate. New orders use the rate; orders already
            placed keep theirs.
          </p>
        </div>

        {/* Stats */}
        <WholesalerCommissionStats stats={stats} loading={isStatsLoading} />

        {/* Table */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-5">
          <WholesalerCommissionListTable
            rows={list?.rows ?? []}
            total={list?.meta?.total ?? 0}
            loading={isListLoading || isListFetching}
            globalCommission={stats?.globalCommission}
            search={search}
            onSearchChange={resetPage(setSearch)}
            typeFilter={typeFilter}
            onTypeFilterChange={resetPage(setTypeFilter)}
            statusFilter={statusFilter}
            onStatusFilterChange={resetPage(setStatusFilter)}
            owner={owner}
            onOwnerChange={resetPage(setOwner)}
            page={page}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={resetPage(setLimit)}
            onEdit={setShopToSet}
            onReset={handleReset}
            resetting={isRemoving}
          />
        </div>

        {/* Set / change / back to global */}
        <WholesalerCommissionFormDialog
          open={!!shopToSet}
          shop={shopToSet}
          globalCommission={stats?.globalCommission}
          onClose={() => setShopToSet(null)}
          onSet={handleSet}
          onReset={handleRemove}
          saving={isSetting || isRemoving}
        />
      </div>
    </PermissionGuard>
  );
}
