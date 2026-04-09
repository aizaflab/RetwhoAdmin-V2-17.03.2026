"use client";

import {
  MOCK_SUPPORT_ARTICLES,
  MOCK_SUPPORT_RESOURCES,
} from "@/components/modules/support/_data/mock-support";
import ArticleListTable from "@/components/modules/support/_components/article/ArticleListTable";

export default function SupportArticlePage() {
  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <ArticleListTable
        articles={MOCK_SUPPORT_ARTICLES}
        resources={MOCK_SUPPORT_RESOURCES}
      />
    </div>
  );
}
