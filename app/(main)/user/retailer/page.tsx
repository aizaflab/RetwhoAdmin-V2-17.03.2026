"use client";

import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { StoreListTable, MOCK_STORES } from "@/components/modules/store";

export default function RetailerManagePage() {
  const user = useCurrentAccess();
  // Filter mock stores to only show active retailers
  const retailers = MOCK_STORES.filter(
    (s) => s.type === "retailer" && s.isActive,
  );

  return (
    <PermissionGuard user={user} permissions={[PERMISSIONS.RETAILER_LIST]}>
      <StoreListTable stores={retailers} title="Retailers" />
    </PermissionGuard>
  );
}
