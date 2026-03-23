"use client";

import { use } from "react";
import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { MOCK_ROLES, RoleFormEditor } from "@/components/modules/role";
import { ShieldCheck } from "lucide-react";

export default function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const user = useCurrentAccess();
  const role = MOCK_ROLES.find((r) => r.id === id);

  return (
    <PermissionGuard
      user={user}
      permissions={[PERMISSIONS.ROLE_CREATE]}
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/30">
            <ShieldCheck className="w-8 h-8 text-rose-500" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-black dark:text-white">
              Access Denied
            </h2>
            <p className="text-sm text-text5 mt-1">
              You do not have permission to edit roles.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border bg-white dark:bg-darkBg border-text4/30 dark:border-darkBorder/50">
        {role ? (
          <RoleFormEditor initialRole={role} />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <p className="text-sm text-text5">Role not found.</p>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
