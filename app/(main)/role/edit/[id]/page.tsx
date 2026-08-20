"use client";

import { use } from "react";
import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { RoleFormEditor } from "@/components/modules/role";
import type { RolePayload } from "@/components/modules/role";
import {
  useGetRoleQuery,
  useUpdateRoleMutation,
} from "@/featured/role/roleApiSlice";
import { getApiErrorMessage } from "@/lib/apiError";
import { Skeleton } from "@/components/ui/skeleton/Skeleton";
import { ShieldCheck } from "lucide-react";

export default function EditRolePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const user = useCurrentAccess();

  const { data: role, isLoading, isError, error } = useGetRoleQuery(id);
  const [updateRole, { isLoading: isSaving }] = useUpdateRoleMutation();

  // `.unwrap()` rethrows the API error, which is what lets the form put a
  // duplicate-name conflict on the name field.
  const handleSave = (payload: RolePayload) =>
    updateRole({ id, data: payload }).unwrap();

  return (
    <PermissionGuard
      user={user}
      permissions={[PERMISSIONS.ROLE_CREATE]}
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
              You do not have permission to edit roles.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border border-border bg-card text-card-foreground">
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-72" />
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Skeleton className="h-80 lg:col-span-1" />
              <Skeleton className="h-80 lg:col-span-2" />
            </div>
          </div>
        ) : role ? (
          // Remounted per role id so the form state is seeded from the fetched
          // role rather than kept from whatever was rendered first.
          <RoleFormEditor
            key={role._id}
            initialRole={role}
            onSave={handleSave}
            saving={isSaving}
          />
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
            <p className="text-sm text-muted-foreground">
              {isError
                ? getApiErrorMessage(error, "Role not found.")
                : "Role not found."}
            </p>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
