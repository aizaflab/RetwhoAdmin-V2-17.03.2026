"use client";

import { useRouter } from "next/navigation";
import PromotionForm from "@/components/modules/promotion/_components/PromotionForm";
import { MOCK_WHOLESALERS } from "@/components/modules/promotion/_data/mock-promotion";
import { Promotion } from "@/components/modules/promotion/_types/promotion.types";
import { toast } from "sonner";

export default function AddPromotionPage() {
  const router = useRouter();

  const handleSave = (data: Partial<Promotion>) => {
    // In real app, this would be an API call
    console.log("Saving promotion:", data);
    toast.success("Promotion created successfully");
    router.push("/promotion/manage");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Create New Promotion
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure your promotion campaign details below
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            New Promotion Entry
          </span>
        </div>
      </div>

      <div className="bg-transparent">
        <PromotionForm wholesalers={MOCK_WHOLESALERS} onSave={handleSave} />
      </div>
    </div>
  );
}
