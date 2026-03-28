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
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto min-h-screen">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white">
            Edit Promotion Details
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Update configuration for:{" "}
            <span className="font-bold text-[#0284c7]">{promotion.title}</span>
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Editing ID: {id}
          </span>
          <div
            className={`h-1.5 w-12 rounded-full ${promotion.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`}
          />
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
