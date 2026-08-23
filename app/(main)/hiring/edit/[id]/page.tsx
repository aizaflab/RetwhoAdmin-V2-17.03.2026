"use client";

import { use } from "react";
import { HiringPostForm } from "@/components/modules/hiring";
import type { HiringPostPayload } from "@/components/modules/hiring";
import {
  useGetHiringCategoryOptionsQuery,
  useGetHiringPostQuery,
  useUpdateHiringPostMutation,
} from "@/featured/hiring/hiringApiSlice";
import { getApiErrorMessage } from "@/lib/apiError";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";

export default function EditHiringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const { data: post, isLoading, isError, error } = useGetHiringPostQuery(id);
  const { data: categoryOptions, isLoading: categoriesLoading } =
    useGetHiringCategoryOptionsQuery(undefined);
  const [updateHiringPost, { isLoading: isSaving }] =
    useUpdateHiringPostMutation();

  const handleSave = (
    payload: HiringPostPayload,
    files: { companyLogoFile: File | null; bannerImageFile: File | null },
  ) => updateHiringPost({ id, payload, ...files }).unwrap();

  return (
    <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-card border-border/70">
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-72" />
          <Skeleton className="h-64" />
          <Skeleton className="h-40" />
        </div>
      ) : post ? (
        // Remounted per posting id so the form state is seeded from the
        // fetched record rather than kept from whatever rendered first.
        <HiringPostForm
          key={post._id}
          initialData={post}
          categoryOptions={categoryOptions ?? []}
          categoriesLoading={categoriesLoading}
          onSave={handleSave}
          saving={isSaving}
        />
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <p className="text-sm text-muted-foreground">
            {isError
              ? getApiErrorMessage(error, "Hiring post not found.")
              : "Hiring post not found."}
          </p>
        </div>
      )}
    </div>
  );
}
