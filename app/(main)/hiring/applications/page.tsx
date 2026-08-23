"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ApplicationListTable } from "@/components/modules/hiring";
import type {
  ApplicationListQuery,
  ApplicationStatus,
  JobApplication,
} from "@/components/modules/hiring";
import {
  useDeleteHiringApplicationMutation,
  useGetHiringApplicationsQuery,
  useGetHiringPostsQuery,
  useUpdateApplicationStatusMutation,
} from "@/featured/hiring/hiringApiSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/apiError";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";

function ApplicationsView() {
  // Arriving from a posting's "View Applications" pre-selects that posting.
  const searchParams = useSearchParams();
  const initialPost = searchParams.get("hiringId") ?? "all";

  // Query state — everything here goes to the API, nothing is filtered locally.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [postFilter, setPostFilter] = useState(initialPost);
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

  const handlePostFilterChange = (value: string) => {
    setPostFilter(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const listQuery: ApplicationListQuery = {
    page,
    limit,
    ...(debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
    ...(statusFilter !== "all"
      ? { status: statusFilter as ApplicationStatus }
      : {}),
    ...(postFilter !== "all" ? { hiringId: postFilter } : {}),
  };

  const {
    data: list,
    isLoading,
    isFetching,
  } = useGetHiringApplicationsQuery(listQuery);

  // Just enough postings to populate the filter; the list itself is paginated
  // server-side and does not depend on this.
  const { data: postList } = useGetHiringPostsQuery({ limit: 100 });

  const [updateStatus] = useUpdateApplicationStatusMutation();
  const [deleteApplication, { isLoading: isDeleting }] =
    useDeleteHiringApplicationMutation();

  const applications = list?.applications ?? [];
  const total = list?.meta?.total ?? 0;

  const postOptions = (postList?.posts ?? []).map((post) => ({
    value: post._id,
    label: post.title,
  }));

  const handleUpdateStatus = async (
    application: JobApplication,
    status: ApplicationStatus,
  ) => {
    try {
      await updateStatus({ id: application._id, data: { status } }).unwrap();
      toast.success(`${application.fullName} moved to ${status}`);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not change the application status."),
      );
    }
  };

  const handleDelete = async (application: JobApplication) => {
    try {
      await deleteApplication(application._id).unwrap();
      toast.success(`Application from "${application.fullName}" deleted`);

      // Deleting the only row on the last page would otherwise leave the table
      // showing an empty page that no longer exists.
      if (applications.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not delete the application. Please try again.",
        ),
      );
    }
  };

  return (
    <ApplicationListTable
      applications={applications}
      total={total}
      loading={isLoading || isFetching}
      search={search}
      onSearchChange={handleSearchChange}
      statusFilter={statusFilter}
      onStatusFilterChange={handleStatusFilterChange}
      postFilter={postFilter}
      onPostFilterChange={handlePostFilterChange}
      postOptions={postOptions}
      page={page}
      onPageChange={setPage}
      limit={limit}
      onLimitChange={handleLimitChange}
      onUpdateStatus={handleUpdateStatus}
      onDelete={handleDelete}
      deleting={isDeleting}
    />
  );
}

export default function HiringApplicationsPage() {
  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      {/* useSearchParams needs a Suspense boundary to keep the route static. */}
      <Suspense fallback={<Skeleton className="h-96" />}>
        <ApplicationsView />
      </Suspense>
    </div>
  );
}
