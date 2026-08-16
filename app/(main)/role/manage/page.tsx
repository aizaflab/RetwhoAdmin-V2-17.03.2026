"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import {
  MOCK_ROLES,
  RoleListTable,
  RoleStats,
} from "@/components/modules/role";
import type { Role } from "@/components/modules/role";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { PlusIcon } from "@/components/icons/Icons";

export default function ManageRolePage() {
  const router = useRouter();
  const user = useCurrentAccess();
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);

  const handleDelete = (id: string) => {
    setRoles((prev) => prev.filter((r) => r._id !== id));
  };

  const canCreate =
    user.permissions.some((p) => p.key === PERMISSIONS.ROLE_CREATE) &&
    !user.deniedPermissions?.includes(PERMISSIONS.ROLE_CREATE);

  return (
    <PermissionGuard
      user={user}
      permissions={[PERMISSIONS.ROLE_LIST]}
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10">
            <ShieldCheck className="w-8 h-8 text-destructive" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Access Denied
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              You do not have permission to view roles.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border border-border bg-card text-card-foreground">
        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="sm:text-2xl text-xl font-medium">Manage Roles</h1>
          {canCreate && (
            <Button onClick={() => router.push("/role/add")} className="px-3.5">
              <PlusIcon className="size-4.5" />
              Add Role
            </Button>
          )}
        </div>

        {/* Stats */}
        <RoleStats roles={roles} />

        {/* Table */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-5">
          <RoleListTable roles={roles} onDelete={handleDelete} />
        </div>
      </div>
    </PermissionGuard>
  );
}
