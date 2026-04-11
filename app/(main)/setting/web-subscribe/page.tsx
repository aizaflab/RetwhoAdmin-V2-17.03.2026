"use client";

import { MOCK_WEB_SUBSCRIBERS } from "@/components/modules/setting/_data/mock-setting";
import WebSubscriberTable from "@/components/modules/setting/_components/subscriber/WebSubscriberTable";

export default function WebSubscribePage() {
  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <WebSubscriberTable subscribers={MOCK_WEB_SUBSCRIBERS} />
    </div>
  );
}
