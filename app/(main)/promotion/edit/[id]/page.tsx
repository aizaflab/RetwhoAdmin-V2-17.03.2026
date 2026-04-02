"use client";

import { useRouter, useParams } from "next/navigation";
import PromotionForm from "@/components/modules/promotion/_components/PromotionForm";
import {
  MOCK_WHOLESALERS,
  MOCK_PROMOTIONS,
} from "@/components/modules/promotion/_data/mock-promotion";
import { Promotion } from "@/components/modules/promotion/_types/promotion.types";
import { toast } from "sonner";

export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // In real app, this would be an API call fetching promotion by id
  const promotion = MOCK_PROMOTIONS.find((p) => p.id === id) || null;

  const handleSave = (data: Partial<Promotion>) => {
    // In real app, this would be an API call updating promotion by id
    console.log("Updating promotion:", id, data);
    toast.success("Promotion updated successfully");
    router.push("/promotion/manage");
  };

  if (!promotion) {
    return (
      <div className="center h-[80vh] flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Promotion not found</h2>
        <button
          onClick={() => router.push("/promotion/manage")}
          className="text-[#0284c7] hover:underline"
        >
          Return to Promotions
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="sm:text-2xl text-xl font-medium text-black dark:text-white">
          Edit Promotion
        </h1>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full dark:bg-darkLight bg-primary animate-pulse" />
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Edit Promotion Entry
          </span>
        </div>
      </div>
      <div className="bg-transparent">
        <PromotionForm
          initialData={promotion}
          wholesalers={MOCK_WHOLESALERS}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
