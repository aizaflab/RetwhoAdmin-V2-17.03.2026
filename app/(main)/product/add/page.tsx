"use client";

import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { ProductForm } from "@/components/modules/product";
import type { ProductPayload } from "@/components/modules/product";
import { useCreateProductMutation } from "@/featured/product/productApiSlice";

export default function ProductAddPage() {
  const user = useCurrentAccess();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  // `.unwrap()` rethrows the API error, which is what lets the form surface
  // the reason instead of failing silently.
  const handleSave = (payload: ProductPayload) =>
    createProduct(payload).unwrap();

  return (
    <PermissionGuard user={user} permissions={[PERMISSIONS.PRODUCT_CREATE]}>
      <ProductForm onSave={handleSave} saving={isLoading} />
    </PermissionGuard>
  );
}
