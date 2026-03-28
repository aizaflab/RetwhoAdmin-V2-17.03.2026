"use client";

import { useState } from "react";
import PromotionListTable from "@/components/modules/promotion/_components/PromotionListTable";
import {
  MOCK_PROMOTIONS,
  MOCK_WHOLESALERS,
} from "@/components/modules/promotion/_data/mock-promotion";
import {
  Promotion,
  PromotionStatus,
} from "@/components/modules/promotion/_types/promotion.types";
import { toast } from "sonner";

export default function ManagePromotionPage() {
  const [promotions, setPromotions] = useState<Promotion[]>(MOCK_PROMOTIONS);

  const handleDelete = (id: string) => {
    // In real app, this would be an API call
    setPromotions((prev) => prev.filter((p) => p.id !== id));
    toast.success("Promotion deleted successfully");
  };

  const handleUpdateStatus = (id: string, status: PromotionStatus) => {
    // In real app, this would be an API call
    setPromotions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status } : p)),
    );
    toast.success(`Status updated to ${status}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="mb-0">
        <PromotionListTable
          promotions={promotions}
          wholesalers={MOCK_WHOLESALERS}
          onDelete={handleDelete}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>
    </div>
  );
}
