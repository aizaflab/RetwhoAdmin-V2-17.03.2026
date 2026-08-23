"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HiringPostListTable, HiringStats } from "@/components/modules/hiring";
import type {
  HiringListQuery,
  HiringPost,
  HiringStatus,
} from "@/components/modules/hiring";
import {
  useDeleteHiringPostMutation,
  useGetHiringCategoryOptionsQuery,
  useGetHiringOverviewQuery,
  useGetHiringPostsQuery,
  useUpdateHiringPostMutation,
} from "@/featured/hiring/hiringApiSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/apiError";
import { Button } from "@/components/ui/button/Button";
import { PlusIcon } from "@/components/icons/Icons";

export default function ManageHiringPage() {
  const router = useRouter();

  // Query state — everything here goes to the API, nothing is filtered locally.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expiryFilter, setExpiryFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
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

  const handleExpiryFilterChange = (value: string) => {
    setExpiryFilter(value);
    setPage(1);
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const listQuery: HiringListQuery = {
    page,
    limit,
    ...(debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter as HiringStatus } : {}),
    ...(categoryFilter !== "all" ? { categoryId: categoryFilter } : {}),
    // Derived server-side from applicationDeadline, not a status.
    ...(expiryFilter !== "all" ? { isExpired: expiryFilter === "true" } : {}),
  };

  const {
    data: list,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useGetHiringPostsQuery(listQuery);

  const { data: overview, isLoading: isOverviewLoading } =
    useGetHiringOverviewQuery(undefined);

  const { data: categoryOptions } = useGetHiringCategoryOptionsQuery(undefined);

  const [updateHiringPost] = useUpdateHiringPostMutation();
  const [deleteHiringPost, { isLoading: isDeleting }] =
    useDeleteHiringPostMutation();

  const posts = list?.posts ?? [];
  const total = list?.meta?.total ?? 0;

  // A status flip reuses the update endpoint. It goes out as multipart with no
  // files attached, which the API reads as "keep the stored images".
  const handleUpdateStatus = async (post: HiringPost, status: HiringStatus) => {
    try {
      await updateHiringPost({
        id: post._id,
        payload: { status },
      }).unwrap();
      toast.success(`"${post.title}" is now ${status}`);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not change the posting status."),
      );
    }
  };

  const handleDelete = async (post: HiringPost) => {
    try {
      await deleteHiringPost(post._id).unwrap();
      toast.success(`Posting "${post.title}" deleted successfully`);

      // Deleting the only row on the last page would otherwise leave the table
      // showing an empty page that no longer exists.
      if (posts.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not delete the posting. Please try again.",
        ),
      );
    }
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="sm:text-2xl text-xl font-medium">Manage Hiring</h1>
        <Button onClick={() => router.push("/hiring/add")} className="px-3.5">
          <PlusIcon className="size-4.5" />
          Add Posting
        </Button>
      </div>

      {/* Stats */}
      <HiringStats overview={overview} loading={isOverviewLoading} />

      {/* Table */}
      <div className="rounded-xl border border-border bg-card p-3 sm:p-5">
        <HiringPostListTable
          posts={posts}
          total={total}
          loading={isListLoading || isListFetching}
          search={search}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          expiryFilter={expiryFilter}
          onExpiryFilterChange={handleExpiryFilterChange}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={handleCategoryFilterChange}
          categoryOptions={categoryOptions ?? []}
          page={page}
          onPageChange={setPage}
          limit={limit}
          onLimitChange={handleLimitChange}
          onUpdateStatus={handleUpdateStatus}
          onViewApplications={(post) =>
            router.push(`/hiring/applications?hiringId=${post._id}`)
          }
          onDelete={handleDelete}
          deleting={isDeleting}
        />
      </div>
    </div>
  );
}
