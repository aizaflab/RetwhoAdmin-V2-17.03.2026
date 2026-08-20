"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BlogCategoryListTable } from "@/components/modules/blog";
import type {
  BlogCategory,
  BlogCategoryListQuery,
  BlogCategoryPayload,
  BlogCategoryStatus,
} from "@/components/modules/blog";
import {
  useCreateBlogCategoryMutation,
  useDeleteBlogCategoryMutation,
  useGetBlogCategoriesQuery,
  useUpdateBlogCategoryMutation,
} from "@/featured/blog/blogApiSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/apiError";

export default function BlogCategoryPage() {
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

  const listQuery: BlogCategoryListQuery = {
    page,
    limit,
    ...(debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
    ...(statusFilter !== "all"
      ? { status: statusFilter as BlogCategoryStatus }
      : {}),
  };

  const {
    data: list,
    isLoading,
    isFetching,
  } = useGetBlogCategoriesQuery(listQuery);

  const [createCategory, { isLoading: isCreating }] =
    useCreateBlogCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateBlogCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteBlogCategoryMutation();

  const categories = list?.categories ?? [];
  const total = list?.meta?.total ?? 0;

  // One handler for both modes — the modal passes an id only when editing.
  // `.unwrap()` rethrows the API error so the modal can show its reason.
  const handleSaveCategory = (payload: BlogCategoryPayload, id?: string) =>
    id
      ? updateCategory({ id, data: payload }).unwrap()
      : createCategory(payload).unwrap();

  const handleDelete = async (category: BlogCategory) => {
    try {
      await deleteCategory(category._id).unwrap();
      toast.success(`Category "${category.title}" deleted successfully`);

      // Deleting the only row on the last page would otherwise leave the table
      // showing an empty page that no longer exists.
      if (categories.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      // The API refuses to remove a category that still has blogs filed under
      // it — its message names the reason. The table already disables the
      // button for that case; this catches a row that went stale between the
      // fetch and the click.
      toast.error(
        getApiErrorMessage(
          error,
          "Could not delete the category. Please try again.",
        ),
      );
    }
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      <BlogCategoryListTable
        categories={categories}
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
        onSaveCategory={handleSaveCategory}
        savingCategory={isCreating || isUpdating}
        onDelete={handleDelete}
        deleting={isDeleting}
      />
    </div>
  );
}
