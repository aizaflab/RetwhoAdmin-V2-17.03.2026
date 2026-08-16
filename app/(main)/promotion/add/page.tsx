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
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="sm:text-2xl text-xl font-medium text-foreground">
          Create New Promotion
        </h1>

        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
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
