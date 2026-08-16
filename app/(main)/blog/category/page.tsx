"use client";

import { MOCK_BLOG_CATEGORIES } from "@/components/modules/blog/_data/mock-blog";
import BlogCategoryListTable from "@/components/modules/blog/_components/BlogCategoryListTable";

export default function BlogCategoryPage() {
  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      <BlogCategoryListTable categories={MOCK_BLOG_CATEGORIES} />
    </div>
  );
}
