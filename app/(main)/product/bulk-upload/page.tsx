"use client";

import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { ProductBulkUpload } from "@/components/modules/product";

export default function ProductBulkUploadPage() {
  const user = useCurrentAccess();

  // Importing a CSV creates products, so this sits behind the same permission
  // as the single-product form.
  return (
    <PermissionGuard user={user} permissions={[PERMISSIONS.PRODUCT_CREATE]}>
      <ProductBulkUpload />
    </PermissionGuard>
  );
}
