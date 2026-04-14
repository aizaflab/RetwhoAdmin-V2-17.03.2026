"use client";

import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { StoreListTable, MOCK_STORES } from "@/components/modules/store";

export default function WholesalerManagePage() {
  const user = useCurrentAccess();
  // Filter mock stores to only show active wholesalers
  const wholesalers = MOCK_STORES.filter(
    (s) => s.type === "wholesaler" && s.isActive,
  );

  return (
    <PermissionGuard user={user} permissions={[PERMISSIONS.WHOLESALER_LIST]}>
      <StoreListTable stores={wholesalers} title="Wholesalers" />
    </PermissionGuard>
  );
}
