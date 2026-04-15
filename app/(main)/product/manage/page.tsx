"use client";

import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { ProductListTable, MOCK_PRODUCTS } from "@/components/modules/product";

export default function ProductManagePage() {
  const user = useCurrentAccess();

  return (
    <PermissionGuard user={user} permissions={[PERMISSIONS.PRODUCT_LIST]}>
      <ProductListTable products={MOCK_PRODUCTS} title="Manage Products" />
    </PermissionGuard>
  );
}
