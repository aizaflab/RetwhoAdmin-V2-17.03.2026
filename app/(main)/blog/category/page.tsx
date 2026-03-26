"use client";

import { MOCK_BLOG_CATEGORIES } from "@/components/modules/blog/_data/mock-blog";
import BlogCategoryListTable from "@/components/modules/blog/_components/BlogCategoryListTable";

export default function BlogCategoryPage() {
  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <BlogCategoryListTable categories={MOCK_BLOG_CATEGORIES} />
    </div>
  );
}
