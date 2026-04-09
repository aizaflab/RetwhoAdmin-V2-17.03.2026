"use client";

import {
  MOCK_LEARNING_VIDEOS,
  MOCK_SUPPORT_RESOURCES,
} from "@/components/modules/support/_data/mock-support";
import VideoListTable from "@/components/modules/support/_components/learning-video/VideoListTable";

export default function SupportLearningVideoPage() {
  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <VideoListTable
        videos={MOCK_LEARNING_VIDEOS}
        resources={MOCK_SUPPORT_RESOURCES}
      />
    </div>
  );
}
