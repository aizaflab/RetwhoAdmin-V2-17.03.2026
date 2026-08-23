"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";
import { BlogPostForm } from "@/components/modules/blog";
import type { BlogPostPayload } from "@/components/modules/blog";
import {
  useGetBlogCategoryOptionsQuery,
  useGetBlogPostQuery,
  useUpdateBlogPostMutation,
} from "@/featured/blog/blogApiSlice";
import { getApiErrorMessage } from "@/lib/apiError";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const { data: post, isLoading, isError, error } = useGetBlogPostQuery(id);
  const { data: categoryOptions, isLoading: categoriesLoading } =
    useGetBlogCategoryOptionsQuery(undefined);
  const [updateBlogPost, { isLoading: isSaving }] = useUpdateBlogPostMutation();

  const handleSave = (payload: BlogPostPayload, imageFile: File | null) =>
    updateBlogPost({ id, payload, imageFile }).unwrap();

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="size-8 center rounded-lg bg-popover border border-border/50 hover:bg-muted/50 cursor-pointer"
        >
          <MoveLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="sm:text-2xl text-xl font-medium">Edit Post</h1>
          {post && (
            <p className="text-sm text-muted-foreground mt-0.5">
              Editing: {post.title}
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-40" />
        </div>
      ) : post ? (
        // Remounted per post id so the form state is seeded from the fetched
        // post rather than kept from whatever was rendered first.
        <BlogPostForm
          key={post._id}
          initialData={post}
          categoryOptions={categoryOptions ?? []}
          categoriesLoading={categoriesLoading}
          onSave={handleSave}
          saving={isSaving}
        />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <p className="text-sm text-muted-foreground">
            {isError
              ? getApiErrorMessage(error, "Blog post not found.")
              : "Blog post not found."}
          </p>
        </div>
      )}
    </div>
  );
}
