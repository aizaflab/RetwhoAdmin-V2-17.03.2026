"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { RoleListTable, RoleStats } from "@/components/modules/role";
import type { Role, RoleListQuery } from "@/components/modules/role";
import {
  useDeleteRoleMutation,
  useGetRoleStatsQuery,
  useGetRolesQuery,
} from "@/featured/role/roleApiSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/apiError";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button/Button";
import { PlusIcon } from "@/components/icons/Icons";

export default function ManageRolePage() {
  const router = useRouter();
  const user = useCurrentAccess();

  // Query state — everything here goes to the API, nothing is filtered locally.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const debouncedSearch = useDebouncedValue(search);

  // Any change to what is being listed sends the table back to page 1 — a
  // narrowed result set can have fewer pages than the one currently in view,
  // which would otherwise leave the table on an empty slice.
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const listQuery: RoleListQuery = {
    page,
    limit,
    ...(debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
    ...(statusFilter !== "all"
      ? { status: statusFilter as Role["status"] }
      : {}),
  };

  const {
    data: list,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useGetRolesQuery(listQuery);

  const { data: stats, isLoading: isStatsLoading } =
    useGetRoleStatsQuery(undefined);

  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const roles = list?.roles ?? [];
  const total = list?.meta?.total ?? 0;

  const handleDelete = async (role: Role) => {
    try {
      await deleteRole(role._id).unwrap();
      toast.success(`Role "${role.name}" deleted successfully`);

      // Deleting the only row on the last page would otherwise leave the table
      // showing an empty page that no longer exists.
      if (roles.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      // The API refuses system roles and roles still assigned to employees —
      // its message names the reason, so show that rather than a generic one.
      toast.error(
        getApiErrorMessage(
          error,
          "Could not delete the role. Please try again.",
        ),
      );
    }
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
        <RoleStats stats={stats} loading={isStatsLoading} />

        {/* Table */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-5">
          <RoleListTable
            roles={roles}
            total={total}
            loading={isListLoading || isListFetching}
            search={search}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            page={page}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={handleLimitChange}
            onDelete={handleDelete}
            deleting={isDeleting}
          />
        </div>
      </div>
    </PermissionGuard>
  );
}
