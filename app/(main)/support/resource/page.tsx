"use client";

import { useState } from "react";
import { toast } from "sonner";
import ResourceListTable from "@/components/modules/support/_components/resource/ResourceListTable";
import type {
  SupportResourceItem,
  SupportResourceListQuery,
  SupportResourcePayload,
  SupportStatus,
} from "@/components/modules/support/_types/support.types";
import {
  useCreateSupportResourceMutation,
  useDeleteSupportResourceMutation,
  useGetSupportResourcesQuery,
  useUpdateSupportResourceMutation,
} from "@/featured/support/supportApiSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/apiError";

export default function SupportResourcePage() {
  // Query state — everything here goes to the API, nothing is filtered locally.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const listQuery: SupportResourceListQuery = {
    page,
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...(debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
    ...(statusFilter !== "all"
      ? { status: statusFilter as SupportStatus }
      : {}),
  };

  const {
    data: list,
    isLoading,
    isFetching,
  } = useGetSupportResourcesQuery(listQuery);

  const [createResource, { isLoading: isCreating }] =
    useCreateSupportResourceMutation();
  const [updateResource, { isLoading: isUpdating }] =
    useUpdateSupportResourceMutation();
  const [deleteResource, { isLoading: isDeleting }] =
    useDeleteSupportResourceMutation();

  const resources = list?.resources ?? [];
  const total = list?.meta?.total ?? 0;

  // One handler for both modes — the modal passes an id only when editing.
  // `.unwrap()` rethrows the API error so the modal can show its reason.
  const handleSaveResource = (payload: SupportResourcePayload, id?: string) =>
    id
      ? updateResource({ id, data: payload }).unwrap()
      : createResource(payload).unwrap();

  const handleDelete = async (resource: SupportResourceItem) => {
    try {
      await deleteResource(resource._id).unwrap();
      toast.success(`Resource "${resource.title}" deleted successfully`);

      // Deleting the only row on the last page would otherwise leave the table
      // showing an empty page that no longer exists.
      if (resources.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      // A 409 names how many items are still filed under the resource.
      toast.error(
        getApiErrorMessage(
          error,
          "Could not delete the resource. Please try again.",
        ),
      );
    }
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      <ResourceListTable
        resources={resources}
        total={total}
        loading={isLoading || isFetching}
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={handleLimitChange}
        onSaveResource={handleSaveResource}
        savingResource={isCreating || isUpdating}
        onDelete={handleDelete}
        deleting={isDeleting}
      />
    </div>
  );
}
