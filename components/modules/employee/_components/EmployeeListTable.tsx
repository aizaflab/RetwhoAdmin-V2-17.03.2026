"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import { UserCircle, Edit2, Trash2, Eye } from "lucide-react";
import { SearchIcon } from "@/components/icons/Icons";
import DeleteModal from "@/components/ui/modal/DeleteModal";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from "@/components/ui/select/Select";

import EmployeeViewDialog from "./EmployeeViewDialog";
import {
  STATUS_FILTER_OPTIONS,
  employeeStatusStyle,
} from "../_data/employee-options";
import type { Employee } from "../_types/employee.types";

interface EmployeeListTableProps {
  employees: Employee[];
  /** Row count across every page — drives the pagination footer. */
  total: number;
  loading?: boolean;
  /** Search / filters / paging are all server-side; this component only reports
   *  the changes and renders whatever the API sent back. */
  search: string;
  onSearchChange: (value: string) => void;
  roleFilter: string;
  onRoleFilterChange: (value: string) => void;
  /** Assignable roles from `GET /admin/roles/options`, for the role filter. */
  roleOptions: SelectOption[];
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employee: Employee) => Promise<void> | void;
  deleting?: boolean;
}

const ACTION_BUTTON =
  "cursor-pointer center size-8 rounded-lg border border-border bg-card text-muted-foreground transition-all duration-150";

const DISABLED_ACTION_BUTTON =
  "disabled:cursor-not-allowed disabled:opacity-40";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

export default function EmployeeListTable({
  employees,
  total,
  loading,
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  roleOptions,
  statusFilter,
  onStatusFilterChange,
  page,
  onPageChange,
  limit,
  onLimitChange,
  onEdit,
  onDelete,
  deleting,
}: EmployeeListTableProps) {
  const [employeeToView, setEmployeeToView] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(
    null,
  );

  const roleFilterOptions: SelectOption[] = [
    { value: "all", label: "All Roles" },
    ...roleOptions,
  ];

  const columns: Column<Employee>[] = [
    {
      id: "name",
      header: "Employee",
      cell: (value, emp) => (
        <div className="flex items-center gap-3">
          {emp.profileImage?.url ? (
            <Image
              src={emp.profileImage.url}
              alt={emp.name}
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg object-cover shrink-0"
              unoptimized
            />
          ) : (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 shrink-0">
              <UserCircle className="w-4 h-4 text-primary" />
            </div>
          )}
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              {emp.name}
              {/* Explains up front why this row's actions are greyed out. */}
              {emp.isSystem && (
                <SimpleTooltip
                  content="Seeded account — permanent"
                  position="top"
                >
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                    system
                  </span>
                </SimpleTooltip>
              )}
            </p>
            <p className="text-xs text-muted-foreground">{emp.email}</p>
          </div>
        </div>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      className: "hidden md:table-cell",
      cell: (value, emp) => (
        <p className="text-sm text-muted-foreground">{emp.phone || "—"}</p>
      ),
    },
    {
      id: "role",
      header: "Role",
      className: "hidden sm:table-cell",
      cell: (value, emp) => (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground">
            {emp.role?.name ?? "—"}
          </span>
          {emp.role?.isSystem && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              system
            </span>
          )}
          {/* A role deactivated under its holder — their access is now stale. */}
          {emp.role && emp.role.status !== "active" && (
            <SimpleTooltip content="This role is inactive" position="top">
              <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                inactive
              </span>
            </SimpleTooltip>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (value, emp) => (
        <span
          className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded capitalize ${employeeStatusStyle(
            emp.status,
          )}`}
        >
          {emp.status}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      className: "hidden lg:table-cell",
      cell: (value, emp) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(emp.createdAt)}
        </span>
      ),
    },
    {
      id: "actions" as keyof Employee,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, emp) => (
        <div className="flex items-center justify-end gap-1">
          <SimpleTooltip content="View" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEmployeeToView(emp);
              }}
              className={`${ACTION_BUTTON} hover:border-primary/50 hover:text-primary`}
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          {/* Both actions mirror what the API itself refuses: a system account
              is seeded and permanent, so PATCH and DELETE answer it with a 403.
              Offering the buttons would only produce a rejected round-trip. */}
          <SimpleTooltip
            content={emp.isSystem ? "System account" : "Edit"}
            position="top"
          >
            <button
              disabled={emp.isSystem}
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(emp);
              }}
              className={`${ACTION_BUTTON} ${DISABLED_ACTION_BUTTON} enabled:hover:border-primary/50 enabled:hover:text-primary`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip
            content={emp.isSystem ? "System account" : "Delete"}
            position="top"
          >
            <button
              disabled={emp.isSystem}
              onClick={(e) => {
                e.stopPropagation();
                setEmployeeToDelete(emp);
              }}
              className={`${ACTION_BUTTON} ${DISABLED_ACTION_BUTTON} enabled:hover:border-destructive/50 enabled:hover:text-destructive`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <h3 className="text-xl font-medium text-foreground">
          Available Employees
        </h3>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Search — matches name, email, phone and role name server-side. */}
          <div className="relative flex-1 sm:w-60">
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search employee..."
              startIcon={
                <SearchIcon className="w-4 h-4 text-muted-foreground" />
              }
              className="h-10 w-full bg-card border-border"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end">
            {/* Role filter */}
            <div className="relative w-32">
              <Select value={roleFilter} onValueChange={onRoleFilterChange}>
                <SelectTrigger className="h-10 rounded-md bg-card text-foreground">
                  <SelectValue
                    options={roleFilterOptions}
                    placeholder="All Roles"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItems options={roleFilterOptions} />
                </SelectContent>
              </Select>
            </div>

            {/* Status filter */}
            <div className="relative w-32">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="h-10 rounded-md bg-card text-foreground">
                  <SelectValue
                    options={STATUS_FILTER_OPTIONS}
                    placeholder="All Status"
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItems options={STATUS_FILTER_OPTIONS} />
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table<Employee>
        data={employees}
        columns={columns}
        loading={loading}
        pagination
        page={page}
        setPage={onPageChange}
        limit={limit}
        setLimit={onLimitChange}
        totalData={total}
        bordered
        emptyMessage="No employees found"
        headerColor="bg-muted/60"
        tableClassName="min-w-full"
      />

      {/* View */}
      <EmployeeViewDialog
        open={!!employeeToView}
        employee={employeeToView}
        onClose={() => setEmployeeToView(null)}
        onEdit={(emp) => {
          setEmployeeToView(null);
          onEdit?.(emp);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        title="Are You Sure?"
        text={`Are you sure you want to delete employee "${employeeToDelete?.name}"? You cannot undo this action.`}
        deleteModal={!!employeeToDelete}
        setDeleteModal={(open) => {
          if (!open) setEmployeeToDelete(null);
        }}
        selectedRow={employeeToDelete}
        isLoading={deleting}
        handleDelete={async (emp) => {
          if (!emp) return;
          await onDelete?.(emp);
          // Closed unconditionally: on failure the page has already toasted the
          // reason (own account, last Super Admin), and leaving the modal open
          // would only invite the same rejected click again.
          setEmployeeToDelete(null);
        }}
      />
    </div>
  );
}
