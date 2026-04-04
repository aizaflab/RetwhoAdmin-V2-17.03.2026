"use client";

import { useState } from "react";
import { HiringCategory } from "@/components/modules/hiring/_types/hiring.types";
import { MOCK_HIRING_CATEGORIES } from "@/components/modules/hiring/_data/mock-hiring";
import HiringCategoryListTable from "@/components/modules/hiring/_components/HiringCategoryListTable";

export default function HiringCategoryPage() {
  const [categories] = useState<HiringCategory[]>(MOCK_HIRING_CATEGORIES);

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <HiringCategoryListTable categories={categories} />
    </div>
  );
}
