"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  useCurrentAccess,
  PermissionGuard,
} from "@/components/modules/access-control";
import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import {
  EmployeeFormDialog,
  EmployeeListTable,
  EmployeeStats,
} from "@/components/modules/employee";
import type {
  Employee,
  EmployeeListQuery,
  EmployeePayload,
  EmployeeUpdatePayload,
} from "@/components/modules/employee";
import {
  useCreateEmployeeMutation,
  useDeleteEmployeeMutation,
  useGetEmployeeStatsQuery,
  useGetEmployeesQuery,
  useUpdateEmployeeMutation,
} from "@/featured/employee/employeeApiSlice";
import { useGetRoleOptionsQuery } from "@/featured/role/roleApiSlice";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { getApiErrorMessage } from "@/lib/apiError";
import type { SelectOption } from "@/components/ui/select/Select";
import { Button } from "@/components/ui/button/Button";
import { PlusIcon } from "@/components/icons/Icons";
import { Link2 } from "lucide-react";

export default function ManageEmployeePage() {
  const user = useCurrentAccess();

  // Query state — everything here goes to the API, nothing is filtered locally.
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  // Set alongside `formOpen` for edit; left null when adding.
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  const debouncedSearch = useDebouncedValue(search);

  // Any change to what is being listed sends the table back to page 1 — a
  // narrowed result set can have fewer pages than the one currently in view,
  // which would otherwise leave the table on an empty slice.
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
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

  const listQuery: EmployeeListQuery = {
    page,
    limit,
    ...(debouncedSearch.trim() ? { searchTerm: debouncedSearch.trim() } : {}),
    ...(roleFilter !== "all" ? { roleId: roleFilter } : {}),
    ...(statusFilter !== "all"
      ? { status: statusFilter as Employee["status"] }
      : {}),
  };

  const {
    data: list,
    isLoading: isListLoading,
    isFetching: isListFetching,
  } = useGetEmployeesQuery(listQuery);

  const { data: stats, isLoading: isStatsLoading } =
    useGetEmployeeStatsQuery(undefined);

  // Shared by the form's role select and the table's role filter — the endpoint
  // returns only the roles that are currently assignable.
  const { data: roles, isLoading: isRolesLoading } =
    useGetRoleOptionsQuery(undefined);

  const [createEmployee, { isLoading: isCreating }] =
    useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] =
    useUpdateEmployeeMutation();
  const [deleteEmployee, { isLoading: isDeleting }] =
    useDeleteEmployeeMutation();

  const employees = list?.employees ?? [];
  const total = list?.meta?.total ?? 0;

  const roleOptions: SelectOption[] = (roles ?? []).map((role) => ({
    label: role.label,
    value: String(role.value),
  }));

  const openAdd = () => {
    setEmployeeToEdit(null);
    setFormOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setEmployeeToEdit(employee);
    setFormOpen(true);
  };

  // `.unwrap()` rethrows the API error, which is what lets the dialog put a
  // duplicate-email conflict on the email field.
  const handleCreate = (payload: EmployeePayload) =>
    createEmployee(payload).unwrap();

  const handleUpdate = (id: string, data: EmployeeUpdatePayload) =>
    updateEmployee({ id, data }).unwrap();

  const handleDelete = async (employee: Employee) => {
    try {
      await deleteEmployee(employee._id).unwrap();
      toast.success(`Employee "${employee.name}" deleted successfully`);

      // Deleting the only row on the last page would otherwise leave the table
      // showing an empty page that no longer exists.
      if (employees.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      // The API refuses system accounts, self-deletion, and removing the last
      // active Super Admin — its message names the reason, so show that. The
      // table already hides the button for the first case; this catches a row
      // that went stale between the fetch and the click.
      toast.error(
        getApiErrorMessage(
          error,
          "Could not delete the employee. Please try again.",
        ),
      );
    }
  };

  const canCreate =
    user.permissions.some((p) => p.key === PERMISSIONS.EMPLOYEE_CREATE) &&
    !user.deniedPermissions?.includes(PERMISSIONS.EMPLOYEE_CREATE);

  return (
    <PermissionGuard
      user={user}
      permissions={[PERMISSIONS.EMPLOYEE_LIST]}
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10">
            <Link2 className="w-8 h-8 text-destructive" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-foreground">
              Access Denied
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              You do not have permission to view employees.
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-[calc(100dvh-93px)] sm:min-h-[calc(100dvh-109px)] p-3 sm:p-5 rounded-lg border border-border bg-card text-card-foreground">
        {/* Page header */}
        <div className="flex items-center justify-between mb-5">
          <h1 className="sm:text-2xl text-xl font-medium">Manage Employees</h1>
          {canCreate && (
            <Button onClick={openAdd} className="px-3.5">
              <PlusIcon className="size-4.5" />
              Add Employee
            </Button>
          )}
        </div>

        {/* Stats */}
        <EmployeeStats stats={stats} loading={isStatsLoading} />

        {/* Table */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-5">
          <EmployeeListTable
            employees={employees}
            total={total}
            loading={isListLoading || isListFetching}
            search={search}
            onSearchChange={handleSearchChange}
            roleFilter={roleFilter}
            onRoleFilterChange={handleRoleFilterChange}
            roleOptions={roleOptions}
            statusFilter={statusFilter}
            onStatusFilterChange={handleStatusFilterChange}
            page={page}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={handleLimitChange}
            onEdit={openEdit}
            onDelete={handleDelete}
            deleting={isDeleting}
          />
        </div>

        {/* Add / Edit */}
        <EmployeeFormDialog
          open={formOpen}
          employee={employeeToEdit}
          roleOptions={roleOptions}
          rolesLoading={isRolesLoading}
          onClose={() => setFormOpen(false)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          saving={isCreating || isUpdating}
        />
      </div>
    </PermissionGuard>
  );
}
