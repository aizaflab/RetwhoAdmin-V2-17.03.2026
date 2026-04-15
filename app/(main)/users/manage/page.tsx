"use client";

import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { UserListTable, MOCK_USERS } from "@/components/modules/users";

export default function ManageUsersPage() {
  const user = useCurrentAccess();

  // Filter mock users to only show active users for the Manage Users page
  // Inactive users have their own dedicated page
  const activeUsers = MOCK_USERS.filter(
    (u) => u.status === "active" && !u.isDeleted,
  );

  return (
    <PermissionGuard user={user} permissions={[PERMISSIONS.USER_LIST]}>
      <UserListTable users={activeUsers} title="Manage Active Users" />
    </PermissionGuard>
  );
}
