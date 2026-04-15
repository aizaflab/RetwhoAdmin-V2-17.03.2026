"use client";

import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { ProductAddForm } from "@/components/modules/product";

export default function ProductAddPage() {
  const user = useCurrentAccess();

  return (
    <PermissionGuard user={user} permissions={[PERMISSIONS.PRODUCT_CREATE]}>
      <ProductAddForm />
    </PermissionGuard>
  );
}
