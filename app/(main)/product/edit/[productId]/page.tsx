"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { ProductForm } from "@/components/modules/product";
import type { ProductPayload } from "@/components/modules/product";
import { Button } from "@/components/ui/button/Button";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import {
  useGetProductQuery,
  useUpdateProductMutation,
} from "@/featured/product/productApiSlice";

export default function ProductEditPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const user = useCurrentAccess();

  const { data: product, isLoading, isError } = useGetProductQuery(productId);
  const [updateProduct, { isLoading: saving }] = useUpdateProductMutation();

  // `.unwrap()` rethrows the API error, which is what lets the form surface
  // the reason instead of failing silently.
  const handleSave = (payload: ProductPayload, imageFile?: File | null) =>
    updateProduct({ id: productId, payload, imageFile }).unwrap();

  return (
    <PermissionGuard user={user} permissions={[PERMISSIONS.PRODUCT_UPDATE]}>
      {isLoading ? (
        // The form seeds its state from the record once, so it only mounts
        // after the fetch lands — a skeleton stands in until then.
        <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] space-y-5 rounded-xl border border-border/50 bg-card p-3 sm:p-5">
          <Skeleton shape="text" className="h-8 w-48" />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} shape="text" className="h-16 w-full" />
            ))}
          </div>
        </div>
      ) : isError || !product ? (
        <div className="flex min-h-[calc(100dvh-93px)] flex-col items-center justify-center gap-3 rounded-xl border border-border/50 bg-card p-5 text-center sm:min-h-[calc(100dvh-109px)]">
          <p className="text-base font-medium">Product not found</p>
          <p className="max-w-md text-sm text-muted-foreground">
            This product could not be loaded. It may have been deleted, or the
            link may be wrong.
          </p>
          <Link href="/product/manage">
            <Button
              variant="outline"
              startIcon={<ArrowLeftIcon className="size-4" />}
            >
              Back to products
            </Button>
          </Link>
        </div>
      ) : (
        <ProductForm product={product} onSave={handleSave} saving={saving} />
      )}
    </PermissionGuard>
  );
}
