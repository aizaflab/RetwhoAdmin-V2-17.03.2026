"use client";

import { useState } from "react";
import { BlogPost } from "@/components/modules/blog/_types/blog.types";
import {
  MOCK_BLOG_POSTS,
  MOCK_BLOG_CATEGORIES,
} from "@/components/modules/blog/_data/mock-blog";
import BlogPostListTable from "@/components/modules/blog/_components/BlogPostListTable";

export default function ManageBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(MOCK_BLOG_POSTS);

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateStatus = (
    id: string,
    status: "published" | "draft" | "archived",
  ) => {
    setPosts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <BlogPostListTable
        posts={posts}
        categories={MOCK_BLOG_CATEGORIES}
        onDelete={handleDelete}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
