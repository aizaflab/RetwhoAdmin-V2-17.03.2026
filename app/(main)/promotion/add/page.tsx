"use client";

import { PromotionForm } from "@/components/modules/promotion";
import type { PromotionPayload } from "@/components/modules/promotion";
import { useCreatePromotionMutation } from "@/featured/promotion/promotionApiSlice";

export default function AddPromotionPage() {
  const [createPromotion, { isLoading }] = useCreatePromotionMutation();

  // `.unwrap()` rethrows the API error, which is what lets the form surface
  // the reason instead of failing silently.
  const handleSave = (
    payload: PromotionPayload,
    bannerImageFile: File | null,
  ) => createPromotion({ payload, bannerImageFile }).unwrap();

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      {/* The form renders its own back button and heading. */}
      <PromotionForm onSave={handleSave} saving={isLoading} />
    </div>
  );
}
