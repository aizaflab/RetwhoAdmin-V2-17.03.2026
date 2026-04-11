"use client";

import { MOCK_CONTACT_REQUESTS } from "@/components/modules/setting/_data/mock-setting";
import ContactedByWebTable from "@/components/modules/setting/_components/contact/ContactedByWebTable";

export default function ContactedByWebPage() {
  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <ContactedByWebTable contacts={MOCK_CONTACT_REQUESTS} />
    </div>
  );
}
