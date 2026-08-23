"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Edit2, Trash2, Eye, Users } from "lucide-react";
import { Input } from "@/components/ui";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";
import { SearchIcon } from "@/components/icons/Icons";
import DeleteModal from "@/components/ui/modal/DeleteModal";

import RoleViewDrawer from "./RoleViewDrawer";
import { countGrants } from "../_data/role-pages";
import type { Role } from "../_types/role.types";

interface RoleListTableProps {
  roles: Role[];
  /** Row count across every page — drives the pagination footer. */
  total: number;
  loading?: boolean;
  /** Search / filter / paging are all server-side; this component only reports
   *  the changes and renders whatever the API sent back. */
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onLimitChange: (limit: number) => void;
  onDelete?: (role: Role) => Promise<void> | void;
  deleting?: boolean;
}

/* Tinted from the semantic tokens so both themes resolve from the same source. */
const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-warning/10 text-warning",
};

const ACTION_BUTTON =
  "cursor-pointer center size-8 rounded-lg border border-border bg-card text-muted-foreground transition-all duration-150";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

/** Why the row's delete button is off — empty string means it is available. */
function deleteBlockedReason(role: Role): string {
  if (role.isSystem) return "System role";
  const count = role.employeeCount ?? 0;
  if (count > 0) {
    return `Assigned to ${count} employee${count === 1 ? "" : "s"}`;
  }
  return "";
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

export default function RoleListTable({
  roles,
  total,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  page,
  onPageChange,
  limit,
  onLimitChange,
  onDelete,
  deleting,
}: RoleListTableProps) {
  const router = useRouter();

  const [roleToView, setRoleToView] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const openEdit = (role: Role) => router.push(`/role/edit/${role._id}`);

  const columns: Column<Role>[] = [
    {
      id: "name",
      header: "Role",
      cell: (value, role) => (
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="size-4 text-primary" />
          </div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            {role.name}
            {role.isSystem && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                system
              </span>
            )}
          </p>
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      className: "hidden sm:table-cell max-w-xs",
      cell: (value, role) => (
        <p className="line-clamp-1 text-sm text-muted-foreground">
          {role.description || "—"}
        </p>
      ),
    },
    {
      id: "permissions",
      header: "Permissions",
      className: "text-center",
      cell: (value, role) => (
        <span className="text-sm font-medium text-muted-foreground">
          {countGrants(role.permissions)}
        </span>
      ),
    },
    {
      id: "employeeCount",
      header: "Employees",
      className: "text-center",
      cell: (value, role) => {
        const count = role.employeeCount ?? 0;
        return (
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-medium ${
              count > 0 ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <Users className="size-3.5" />
            {count}
          </span>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (value, role) => (
        <span
          className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold capitalize ${
            STATUS_STYLES[role.status] || STATUS_STYLES.inactive
          }`}
        >
          {role.status}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      className: "hidden lg:table-cell",
      cell: (value, role) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(role.createdAt)}
        </span>
      ),
    },
    {
      id: "actions" as keyof Role,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, role) => (
        <div className="flex items-center justify-end gap-1">
          <SimpleTooltip content="View" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRoleToView(role);
              }}
              className={`${ACTION_BUTTON} hover:border-primary/50 hover:text-primary`}
            >
              <Eye className="size-3.5" />
            </button>
          </SimpleTooltip>

          {/* The API rejects edits to system roles, so the button is not offered. */}
          <SimpleTooltip
            content={role.isSystem ? "System role" : "Edit"}
            position="top"
          >
            <button
              disabled={role.isSystem}
              onClick={(e) => {
                e.stopPropagation();
                openEdit(role);
              }}
              className={`${ACTION_BUTTON} enabled:hover:border-primary/50 enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <Edit2 className="size-3.5" />
            </button>
          </SimpleTooltip>

          {/* Mirrors what the API itself refuses: system roles are seeded and
              permanent, and a role still held by employees would leave them
              with a dangling roleId. */}
          <SimpleTooltip
            content={deleteBlockedReason(role) || "Delete"}
            position="top"
          >
            <button
              disabled={!!deleteBlockedReason(role)}
              onClick={(e) => {
                e.stopPropagation();
                setRoleToDelete(role);
              }}
              className={`${ACTION_BUTTON} enabled:hover:border-destructive/50 enabled:hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40`}
            >
              <Trash2 className="size-3.5" />
            </button>
          </SimpleTooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <h3 className="text-xl font-medium text-foreground">Available Roles</h3>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-60">
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search roles..."
              startIcon={
                <SearchIcon className="size-4 text-muted-foreground" />
              }
              className="h-10 w-full border-border bg-card"
            />
          </div>

          {/* Status filter */}
          <div className="relative w-32">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="h-10 rounded-md bg-card text-foreground">
                <SelectValue
                  options={STATUS_OPTIONS}
                  placeholder="All Status"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={STATUS_OPTIONS} />
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table<Role>
        data={roles}
        columns={columns}
        loading={loading}
        pagination
        page={page}
        setPage={onPageChange}
        limit={limit}
        setLimit={onLimitChange}
        totalData={total}
        bordered
        emptyMessage="No roles found"
        headerColor="bg-muted/60"
        tableClassName="min-w-full"
      />

      {/* View */}
      <RoleViewDrawer
        open={!!roleToView}
        role={roleToView}
        onClose={() => setRoleToView(null)}
        onEdit={(role) => {
          setRoleToView(null);
          openEdit(role);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        title="Are You Sure?"
        text={`Are you sure you want to delete the role "${roleToDelete?.name}"? You cannot undo this action.`}
        deleteModal={!!roleToDelete}
        setDeleteModal={(open) => {
          if (!open) setRoleToDelete(null);
        }}
        selectedRow={roleToDelete}
        isLoading={deleting}
        handleDelete={async (role) => {
          if (!role) return;
          await onDelete?.(role);
          // Closed unconditionally: on failure the page has already toasted the
          // reason (system role, still assigned to employees), and leaving the
          // modal open would only invite the same rejected click again.
          setRoleToDelete(null);
        }}
      />
    </div>
  );
}
