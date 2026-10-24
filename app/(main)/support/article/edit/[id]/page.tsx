"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { MoveLeft } from "lucide-react";
import ArticleForm from "@/components/modules/support/_components/article/ArticleForm";
import { resourceRefId } from "@/components/modules/support/_data/support-options";
import type { SupportArticlePayload } from "@/components/modules/support/_types/support.types";
import {
  useGetSupportArticleQuery,
  useGetSupportResourceOptionsQuery,
  useUpdateSupportArticleMutation,
} from "@/featured/support/supportApiSlice";
import { getApiErrorMessage } from "@/lib/apiError";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const {
    data: article,
    isLoading,
    isError,
    error,
  } = useGetSupportArticleQuery(id);
  const { data: resourceOptions, isLoading: resourcesLoading } =
    useGetSupportResourceOptionsQuery(undefined);
  const [updateArticle, { isLoading: isSaving }] =
    useUpdateSupportArticleMutation();

  const handleSave = (payload: SupportArticlePayload) => {
    // The API re-checks that a sent resource is published. Leaving an
    // unchanged one out lets an article under a since-unpublished resource
    // still be edited.
    const { supportResourcesId, ...rest } = payload;
    const unchanged = article && supportResourcesId === resourceRefId(article);

    return updateArticle({
      id,
      data: unchanged ? rest : payload,
    }).unwrap();
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="size-8 center rounded-lg bg-popover border border-border/50 hover:bg-muted/50 cursor-pointer"
        >
          <MoveLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="min-w-0">
          <h1 className="sm:text-2xl text-xl font-medium text-foreground">
            Edit Article
          </h1>
          {article && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              Editing: {article.title}
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          <div className="xl:col-span-2 space-y-5">
            <Skeleton className="h-56" />
            <Skeleton className="h-80" />
          </div>
          <Skeleton className="h-72" />
        </div>
      ) : article ? (
        // Remounted per article id so the form state is seeded from the
        // fetched article rather than kept from whatever rendered first.
        <ArticleForm
          key={article._id}
          initialData={article}
          resourceOptions={resourceOptions ?? []}
          resourcesLoading={resourcesLoading}
          onSave={handleSave}
          saving={isSaving}
        />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <p className="text-sm text-muted-foreground">
            {isError
              ? getApiErrorMessage(error, "Article not found.")
              : "Article not found."}
          </p>
        </div>
      )}
    </div>
  );
}
