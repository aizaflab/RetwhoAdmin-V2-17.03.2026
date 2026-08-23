"use client";

import { HiringPostForm } from "@/components/modules/hiring";
import type { HiringPostPayload } from "@/components/modules/hiring";
import {
  useCreateHiringPostMutation,
  useGetHiringCategoryOptionsQuery,
} from "@/featured/hiring/hiringApiSlice";

export default function AddHiringPage() {
  const { data: categoryOptions, isLoading: categoriesLoading } =
    useGetHiringCategoryOptionsQuery(undefined);
  const [createHiringPost, { isLoading }] = useCreateHiringPostMutation();

  // `.unwrap()` rethrows the API error, which is what lets the form surface
  // the reason instead of failing silently.
  const handleSave = (
    payload: HiringPostPayload,
    files: { companyLogoFile: File | null; bannerImageFile: File | null },
  ) => createHiringPost({ payload, ...files }).unwrap();

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      {/* The form renders its own back button and heading. */}
      <HiringPostForm
        categoryOptions={categoryOptions ?? []}
        categoriesLoading={categoriesLoading}
        onSave={handleSave}
        saving={isLoading}
      />
    </div>
  );
}
