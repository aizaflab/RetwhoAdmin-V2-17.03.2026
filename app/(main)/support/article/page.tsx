"use client";

import { useState } from "react";
import { toast } from "sonner";
import ArticleListTable from "@/components/modules/support/_components/article/ArticleListTable";
import type {
  SupportArticleItem,
  SupportArticleListQuery,
  SupportStatus,
} from "@/components/modules/support/_types/support.types";
import {
  useDeleteSupportArticleMutation,
  useGetSupportArticlesQuery,
  useGetSupportResourceOptionsQuery,
  useUpdateSupportArticleMutation,
} from "@/featured/support/supportApiSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/apiError";

const STATUS_VERB: Record<SupportStatus, string> = {
  published: "published",
  draft: "moved to draft",
  archived: "archived",
};

export default function SupportArticlePage() {
  // Query state — everything here goes to the API, nothing is filtered locally.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
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

  const handleResourceFilterChange = (value: string) => {
    setResourceFilter(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const listQuery: SupportArticleListQuery = {
    page,
    limit,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...(debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
    ...(statusFilter !== "all"
      ? { status: statusFilter as SupportStatus }
      : {}),
    ...(resourceFilter !== "all" ? { supportResourcesId: resourceFilter } : {}),
  };

  const {
    data: list,
    isLoading,
    isFetching,
  } = useGetSupportArticlesQuery(listQuery);
  const { data: resourceOptions } =
    useGetSupportResourceOptionsQuery(undefined);

  const [updateArticle] = useUpdateSupportArticleMutation();
  const [deleteArticle, { isLoading: isDeleting }] =
    useDeleteSupportArticleMutation();

  const articles = list?.articles ?? [];
  const total = list?.meta?.total ?? 0;

  const handleUpdateStatus = async (
    article: SupportArticleItem,
    status: SupportStatus,
  ) => {
    try {
      await updateArticle({ id: article._id, data: { status } }).unwrap();
      toast.success(`"${article.title}" ${STATUS_VERB[status]}`);
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not change the status. Please try again.",
        ),
      );
    }
  };

  const handleDelete = async (article: SupportArticleItem) => {
    try {
      await deleteArticle(article._id).unwrap();
      toast.success(`Article "${article.title}" deleted successfully`);

      // Deleting the only row on the last page would otherwise leave the table
      // showing an empty page that no longer exists.
      if (articles.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not delete the article. Please try again.",
        ),
      );
    }
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      <ArticleListTable
        articles={articles}
        total={total}
        loading={isLoading || isFetching}
        search={search}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={handleStatusFilterChange}
        resourceFilter={resourceFilter}
        onResourceFilterChange={handleResourceFilterChange}
        resourceOptions={resourceOptions ?? []}
        page={page}
        onPageChange={setPage}
        limit={limit}
        onLimitChange={handleLimitChange}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDelete}
        deleting={isDeleting}
      />
    </div>
  );
}
