"use client";

import { use } from "react";
import { PromotionForm } from "@/components/modules/promotion";
import type { PromotionPayload } from "@/components/modules/promotion";
import {
  useGetPromotionQuery,
  useUpdatePromotionMutation,
} from "@/featured/promotion/promotionApiSlice";
import { getApiErrorMessage } from "@/lib/apiError";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";

export default function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    data: promotion,
    isLoading,
    isError,
    error,
  } = useGetPromotionQuery(id);
  const [updatePromotion, { isLoading: isSaving }] =
    useUpdatePromotionMutation();

  const handleSave = (
    payload: PromotionPayload,
    bannerImageFile: File | null,
  ) => updatePromotion({ id, payload, bannerImageFile }).unwrap();

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-64" />
        </div>
      ) : promotion ? (
        // Remounted per promotion id so the form state is seeded from the
        // fetched record rather than kept from whatever rendered first.
        <PromotionForm
          key={promotion._id}
          initialData={promotion}
          onSave={handleSave}
          saving={isSaving}
        />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <p className="text-sm text-muted-foreground">
            {isError
              ? getApiErrorMessage(error, "Promotion not found.")
              : "Promotion not found."}
          </p>
        </div>
      )}
    </div>
  );
}
