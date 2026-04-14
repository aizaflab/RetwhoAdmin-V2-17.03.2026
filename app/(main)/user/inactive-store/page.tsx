"use client";

import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { StoreListTable, MOCK_STORES } from "@/components/modules/store";

export default function InactiveStoreManagePage() {
  const user = useCurrentAccess();
  // Filter mock stores to show any store that is inactive
  const inactiveStores = MOCK_STORES.filter((s) => !s.isActive);

  return (
    <PermissionGuard
      user={user}
      permissions={[PERMISSIONS.INACTIVE_STORE_LIST]}
    >
      <StoreListTable stores={inactiveStores} title="Inactive Stores" />
    </PermissionGuard>
  );
}
