"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import {
  UserCreateDialog,
  UserEditDialog,
  UserListTable,
  UserStats,
} from "@/components/modules/users";
import type {
  User,
  UserListQuery,
  UserPayload,
  UserUpdatePayload,
} from "@/components/modules/users";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUserStatsQuery,
  useGetUsersQuery,
  useUpdateUserMutation,
} from "@/featured/user/userApiSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/apiError";
import { Button } from "@/components/ui/button/Button";
import { PlusIcon, UsersIcon } from "@/components/icons/Icons";

export default function ManageUsersPage() {
  const currentUser = useCurrentAccess();

  // Query state — everything here goes to the API, nothing is filtered locally.
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [createOpen, setCreateOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

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

  const handleVerifiedFilterChange = (value: string) => {
    setVerifiedFilter(value);
    setPage(1);
  };

  const handleLimitChange = (value: number) => {
    setLimit(value);
    setPage(1);
  };

  const listQuery: UserListQuery = {
    page,
    limit,
    ...(debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
    ...(statusFilter !== "all"
      ? { status: statusFilter as User["status"] }
      : {}),
    ...(verifiedFilter !== "all"
      ? { isVerified: verifiedFilter === "true" }
      : {}),
  };

  const {
    data: list,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useGetUsersQuery(listQuery);

  const { data: stats, isLoading: isStatsLoading } =
    useGetUserStatsQuery(undefined);

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const users = list?.users ?? [];
  const total = list?.meta?.total ?? 0;

  // `.unwrap()` rethrows the API error, which is what lets the dialogs put a
  // duplicate-email conflict on the email field.
  const handleCreate = (payload: UserPayload) => createUser(payload).unwrap();

  const handleUpdate = (id: string, data: UserUpdatePayload) =>
    updateUser({ id, data }).unwrap();

  // Row-level toggles (verify / revoke) go through the same PATCH, so they get
  // their own toast rather than the dialog's.
  const handleQuickUpdate = async (user: User, changes: UserUpdatePayload) => {
    try {
      await updateUser({ id: user._id, data: changes }).unwrap();
      toast.success(
        changes.isVerified
          ? `${user.name} is now verified`
          : `Verification revoked for ${user.name}`,
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not update the user. Please try again.",
        ),
      );
    }
  };

  const handleDelete = async (user: User) => {
    try {
      await deleteUser(user._id).unwrap();
      toast.success(`User "${user.name}" deleted successfully`);

      // Deleting the only row on the last page would otherwise leave the table
      // showing an empty page that no longer exists.
      if (users.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      // The API refuses to remove a user who still owns shops — its message
      // names the reason, so show that rather than a generic one.
      toast.error(
        getApiErrorMessage(
          error,
          "Could not delete the user. Please try again.",
        ),
      );
    }
  };

  const canCreate =
    currentUser.permissions.some((p) => p.key === PERMISSIONS.USER_CREATE) &&
    !currentUser.deniedPermissions?.includes(PERMISSIONS.USER_CREATE);

  return (
    <PermissionGuard
      user={currentUser}
      permissions={[PERMISSIONS.USER_LIST]}
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10">
            <UsersIcon className="w-8 h-8 text-destructive" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Access Denied
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              You do not have permission to view users.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border border-border bg-card text-card-foreground">
        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="sm:text-2xl text-xl font-medium">Manage Users</h1>
          {canCreate && (
            <Button onClick={() => setCreateOpen(true)} className="px-3.5">
              <PlusIcon className="size-4.5" />
              Add User
            </Button>
          )}
        </div>

        {/* Stats */}
        <UserStats stats={stats} loading={isStatsLoading} />

        {/* Table */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-5">
          <UserListTable
            users={users}
            total={total}
            loading={isListLoading || isListFetching}
            search={search}
            onSearchChange={handleSearchChange}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            verifiedFilter={verifiedFilter}
            onVerifiedFilterChange={handleVerifiedFilterChange}
            page={page}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={handleLimitChange}
            onEdit={setUserToEdit}
            onQuickUpdate={handleQuickUpdate}
            onDelete={handleDelete}
            deleting={isDeleting}
          />
        </div>

        {/* Create */}
        <UserCreateDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
          saving={isCreating}
        />

        {/* Edit */}
        <UserEditDialog
          open={!!userToEdit}
          user={userToEdit}
          onClose={() => setUserToEdit(null)}
          onSubmit={handleUpdate}
          saving={isUpdating}
        />
      </div>
    </PermissionGuard>
  );
}
