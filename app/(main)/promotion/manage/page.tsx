"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PromotionListTable,
  PromotionStats,
} from "@/components/modules/promotion";
import type {
  Promotion,
  PromotionListQuery,
  PromotionStatus,
  PromotionType,
} from "@/components/modules/promotion";
import {
  useDeletePromotionMutation,
  useGetPromotionOverviewQuery,
  useGetPromotionsQuery,
  useUpdatePromotionMutation,
} from "@/featured/promotion/promotionApiSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/apiError";
import { Button } from "@/components/ui/button/Button";
import { PlusIcon } from "@/components/icons/Icons";

export default function ManagePromotionPage() {
  const router = useRouter();

  // Query state — everything here goes to the API, nothing is filtered locally.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debouncedSearch = useDebouncedValue(search);

  // Any change to what is being listed sends the table back to page 1 — a
  // narrowed result set can have fewer pages than the one currently in view.
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleTypeFilterChange = (value: string) => {
    setTypeFilter(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const listQuery: PromotionListQuery = {
    page,
    limit,
    ...(debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
    ...(statusFilter !== "all"
      ? { status: statusFilter as PromotionStatus }
      : {}),
    ...(typeFilter !== "all"
      ? { promotionType: typeFilter as PromotionType }
      : {}),
  };

  const {
    data: list,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useGetPromotionsQuery(listQuery);

  const { data: overview, isLoading: isOverviewLoading } =
    useGetPromotionOverviewQuery(undefined);

  const [updatePromotion] = useUpdatePromotionMutation();
  const [deletePromotion, { isLoading: isDeleting }] =
    useDeletePromotionMutation();

  const promotions = list?.promotions ?? [];
  const total = list?.meta?.total ?? 0;

  // A status flip reuses the update endpoint. It goes out as multipart with no
  // file attached, which the API reads as "keep the stored banner".
  const handleUpdateStatus = async (
    promotion: Promotion,
    status: PromotionStatus,
  ) => {
    try {
      await updatePromotion({
        id: promotion._id,
        payload: { status },
      }).unwrap();
      toast.success(`"${promotion.title}" is now ${status}`);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not change the promotion status."),
      );
    }
  };

  const handleDelete = async (promotion: Promotion) => {
    try {
      await deletePromotion(promotion._id).unwrap();
      toast.success(`Promotion "${promotion.title}" deleted successfully`);

      // Deleting the only row on the last page would otherwise leave the table
      // showing an empty page that no longer exists.
      if (promotions.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not delete the promotion. Please try again.",
        ),
      );
    }
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="sm:text-2xl text-xl font-medium">Manage Promotions</h1>
        <Button
          onClick={() => router.push("/promotion/add")}
          className="px-3.5"
        >
          <PlusIcon className="size-4.5" />
          Add Campaign
        </Button>
      </div>

      {/* Stats */}
      <PromotionStats overview={overview} loading={isOverviewLoading} />

      {/* Table */}
      <div className="rounded-xl border border-border bg-card p-3 sm:p-5">
        <PromotionListTable
          promotions={promotions}
          total={total}
          loading={isListLoading || isListFetching}
          search={search}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          typeFilter={typeFilter}
          onTypeFilterChange={handleTypeFilterChange}
          page={page}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={handleLimitChange}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDelete}
          deleting={isDeleting}
        />
      </div>
    </div>
  );
}
