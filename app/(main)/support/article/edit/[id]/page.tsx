"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SupportArticle } from "@/components/modules/support/_types/support.types";
import {
  MOCK_SUPPORT_ARTICLES,
  MOCK_SUPPORT_RESOURCES,
} from "@/components/modules/support/_data/mock-support";
import ArticleForm from "@/components/modules/support/_components/article/ArticleForm";
import { MoveLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);
  const article = MOCK_SUPPORT_ARTICLES.find((a) => a.id === id);

  useEffect(() => {
    if (!article && id) {
      toast.error("Article not found.");
      router.push("/support/article");
    }
  }, [article, id, router]);

  const handleSave = (data: Partial<SupportArticle>) => {
    console.log("Updating article:", data);
    toast.success("Article updated successfully!");
    router.push("/support/article");
  };

  if (!article) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="size-8 center rounded-lg bg-white dark:bg-darkPrimary border border-border/50 dark:border-darkBorder/50 hover:bg-gray-50 dark:hover:bg-darkBorder/40 cursor-pointer"
        >
          <MoveLeft className="w-5 h-5 text-black dark:text-white" />
        </button>
        <div>
          <h1 className="sm:text-2xl text-xl font-medium text-black dark:text-white">
            Edit Article
          </h1>
          <p className="text-sm text-text5 mt-0.5">Editing: {article.title}</p>
        </div>
      </div>

      <ArticleForm
        initialData={article}
        resources={MOCK_SUPPORT_RESOURCES}
        onSave={handleSave}
      />
    </div>
  );
}
