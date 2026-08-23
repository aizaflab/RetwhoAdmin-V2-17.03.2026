"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BlogPostListTable, BlogStats } from "@/components/modules/blog";
import type {
  BlogListQuery,
  BlogPost,
  BlogStatus,
} from "@/components/modules/blog";
import {
  useDeleteBlogPostMutation,
  useGetBlogCategoryOptionsQuery,
  useGetBlogPostsQuery,
  useGetBlogStatsQuery,
  useUpdateBlogPostMutation,
} from "@/featured/blog/blogApiSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/apiError";
import { Button } from "@/components/ui/button/Button";
import { PlusIcon } from "@/components/icons/Icons";

export default function ManageBlogPage() {
  const router = useRouter();

  // Query state — everything here goes to the API, nothing is filtered locally.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const listQuery: BlogListQuery = {
    page,
    limit,
    ...(debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
    ...(statusFilter !== "all" ? { status: statusFilter as BlogStatus } : {}),
    ...(categoryFilter !== "all" ? { categoryId: categoryFilter } : {}),
  };

  const {
    data: list,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useGetBlogPostsQuery(listQuery);

  const { data: stats, isLoading: isStatsLoading } =
    useGetBlogStatsQuery(undefined);

  const { data: categoryOptions } = useGetBlogCategoryOptionsQuery(undefined);

  const [updateBlogPost] = useUpdateBlogPostMutation();
  const [deleteBlogPost, { isLoading: isDeleting }] =
    useDeleteBlogPostMutation();

  const posts = list?.posts ?? [];
  const total = list?.meta?.total ?? 0;

  // A status flip reuses the update endpoint. It goes out as multipart with no
  // file attached, which the API reads as "keep the stored image".
  const handleUpdateStatus = async (post: BlogPost, status: BlogStatus) => {
    try {
      await updateBlogPost({
        id: post._id,
        payload: {
          title: post.title,
          content: post.content,
          categoryId: post.categoryId,
          tags: post.tags,
          status,
        },
      }).unwrap();
      toast.success(`"${post.title}" is now ${status}`);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Could not change the post status."),
      );
    }
  };

  const handleDelete = async (post: BlogPost) => {
    try {
      await deleteBlogPost(post._id).unwrap();
      toast.success(`Post "${post.title}" deleted successfully`);

      // Deleting the only row on the last page would otherwise leave the table
      // showing an empty page that no longer exists.
      if (posts.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not delete the post. Please try again.",
        ),
      );
    }
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="sm:text-2xl text-xl font-medium">Manage Posts</h1>
        <Button
          onClick={() => router.push("/blog/post/add")}
          className="px-3.5"
        >
          <PlusIcon className="size-4.5" />
          Add Post
        </Button>
      </div>

      {/* Stats */}
      <BlogStats stats={stats} loading={isStatsLoading} />

      {/* Table */}
      <div className="rounded-xl border border-border bg-card p-3 sm:p-5">
        <BlogPostListTable
          posts={posts}
          total={total}
          loading={isListLoading || isListFetching}
          search={search}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={handleCategoryFilterChange}
          categoryOptions={categoryOptions ?? []}
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
