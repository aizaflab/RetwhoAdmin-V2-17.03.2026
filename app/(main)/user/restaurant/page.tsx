"use client";

import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { StoreListTable, MOCK_STORES } from "@/components/modules/store";

export default function RestaurantManagePage() {
  const user = useCurrentAccess();
  // Filter mock stores to only show active restaurants
  const restaurants = MOCK_STORES.filter(
    (s) => s.type === "restaurant" && s.isActive,
  );

  return (
    <PermissionGuard user={user} permissions={[PERMISSIONS.RESTAURANT_LIST]}>
      <StoreListTable stores={restaurants} title="Restaurants" />
    </PermissionGuard>
  );
}
