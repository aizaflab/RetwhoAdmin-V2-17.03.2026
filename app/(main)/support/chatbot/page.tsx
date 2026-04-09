"use client";

import {
  MOCK_CHATBOT_QNA,
  MOCK_SUPPORT_RESOURCES,
} from "@/components/modules/support/_data/mock-support";
import ChatbotListTable from "@/components/modules/support/_components/chatbot/ChatbotListTable";

export default function SupportChatbotPage() {
  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <ChatbotListTable
        qnaList={MOCK_CHATBOT_QNA}
        resources={MOCK_SUPPORT_RESOURCES}
      />
    </div>
  );
}
