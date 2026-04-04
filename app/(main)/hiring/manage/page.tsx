"use client";

import { useState } from "react";
import { HiringPost } from "@/components/modules/hiring/_types/hiring.types";
import {
  MOCK_HIRING_POSTS,
  MOCK_HIRING_CATEGORIES,
} from "@/components/modules/hiring/_data/mock-hiring";
import HiringPostListTable from "@/components/modules/hiring/_components/HiringPostListTable";

export default function ManageHiringPage() {
  const [posts, setPosts] = useState<HiringPost[]>(MOCK_HIRING_POSTS);

  const handleDelete = (id: string) => {
    setPosts((prev) => prev.filter((r) => r.id !== id));
  };

  const handleUpdateStatus = (
    id: string,
    status: "active" | "draft" | "closed" | "inactive",
  ) => {
    setPosts((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <HiringPostListTable
        posts={posts}
        categories={MOCK_HIRING_CATEGORIES}
        onDelete={handleDelete}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
