"use client";

import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { UserListTable, MOCK_USERS } from "@/components/modules/users";

export default function InactiveUsersPage() {
  const user = useCurrentAccess();

  // Filter mock users to only show inactive users
  const inactiveUsers = MOCK_USERS.filter(
    (u) => u.status === "inactive" && !u.isDeleted,
  );

  return (
    <PermissionGuard user={user} permissions={[PERMISSIONS.USER_INACTIVE_LIST]}>
      <UserListTable users={inactiveUsers} title="Inactive Users" />
    </PermissionGuard>
  );
}
