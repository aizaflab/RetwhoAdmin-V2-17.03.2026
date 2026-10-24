"use client";

import { useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";
import ArticleForm from "@/components/modules/support/_components/article/ArticleForm";
import type { SupportArticlePayload } from "@/components/modules/support/_types/support.types";
import {
  useCreateSupportArticleMutation,
  useGetSupportResourceOptionsQuery,
} from "@/featured/support/supportApiSlice";

export default function AddArticlePage() {
  const router = useRouter();

  const { data: resourceOptions, isLoading: resourcesLoading } =
    useGetSupportResourceOptionsQuery(undefined);
  const [createArticle, { isLoading }] = useCreateSupportArticleMutation();

  // `.unwrap()` rethrows the API error, which is what lets the form surface
  // the reason instead of failing silently.
  const handleSave = (payload: SupportArticlePayload) =>
    createArticle(payload).unwrap();

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="size-8 center rounded-lg bg-popover border border-border/50 hover:bg-muted/50 cursor-pointer"
        >
          <MoveLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="sm:text-2xl text-xl font-medium text-foreground">
          Add New Article
        </h1>
      </div>

      <ArticleForm
        resourceOptions={resourceOptions ?? []}
        resourcesLoading={resourcesLoading}
        onSave={handleSave}
        saving={isLoading}
      />
    </div>
  );
}
