"use client";

import { useRouter } from "next/navigation";
import { SupportArticle } from "@/components/modules/support/_types/support.types";
import { MOCK_SUPPORT_RESOURCES } from "@/components/modules/support/_data/mock-support";
import ArticleForm from "@/components/modules/support/_components/article/ArticleForm";
import { MoveLeft } from "lucide-react";
import { toast } from "sonner";

export default function AddArticlePage() {
  const router = useRouter();

  const handleSave = (data: Partial<SupportArticle>) => {
    console.log("Creating new article:", data);
    toast.success("Article created successfully!");
    router.push("/support/article");
  };

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
            Add New Article
          </h1>
        </div>
      </div>

      <ArticleForm resources={MOCK_SUPPORT_RESOURCES} onSave={handleSave} />
    </div>
  );
}
