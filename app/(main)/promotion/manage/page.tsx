"use client";

import { useState } from "react";
import PromotionListTable from "@/components/modules/promotion/_components/PromotionListTable";
import {
  MOCK_PROMOTIONS,
  MOCK_WHOLESALERS,
} from "@/components/modules/promotion/_data/mock-promotion";
import { Promotion } from "@/components/modules/promotion/_types/promotion.types";
import { toast } from "sonner";

export default function ManagePromotionPage() {
  const [promotions, setPromotions] = useState<Promotion[]>(MOCK_PROMOTIONS);

  const handleDelete = (id: string) => {
    // In real app, this would be an API call
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    toast.success("Promotion deleted successfully");
  };

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <PromotionListTable
        promotions={promotions}
        wholesalers={MOCK_WHOLESALERS}
        onDelete={handleDelete}
      />
    </div>
  );
}
