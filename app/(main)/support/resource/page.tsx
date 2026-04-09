"use client";

import { MOCK_SUPPORT_RESOURCES } from "@/components/modules/support/_data/mock-support";
import ResourceListTable from "@/components/modules/support/_components/resource/ResourceListTable";

export default function SupportResourcePage() {
  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <ResourceListTable resources={MOCK_SUPPORT_RESOURCES} />
    </div>
  );
}
