"use client";

import { useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";
import { BlogPostForm } from "@/components/modules/blog";
import type { BlogPostPayload } from "@/components/modules/blog";
import {
  useCreateBlogPostMutation,
  useGetBlogCategoryOptionsQuery,
} from "@/featured/blog/blogApiSlice";

export default function AddBlogPage() {
  const router = useRouter();

  const { data: categoryOptions, isLoading: categoriesLoading } =
    useGetBlogCategoryOptionsQuery(undefined);
  const [createBlogPost, { isLoading }] = useCreateBlogPostMutation();

  // `.unwrap()` rethrows the API error, which is what lets the form surface
  // the reason instead of failing silently.
  const handleSave = (payload: BlogPostPayload, imageFile: File | null) =>
    createBlogPost({ payload, imageFile }).unwrap();

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
          <h1 className="sm:text-2xl text-xl font-medium text-foreground">
            Add New Post
          </h1>
        </div>
      </div>

      <BlogPostForm
        categoryOptions={categoryOptions ?? []}
        categoriesLoading={categoriesLoading}
        onSave={handleSave}
        saving={isLoading}
      />
    </div>
  );
}
