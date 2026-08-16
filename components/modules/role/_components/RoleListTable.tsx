"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Edit2, Trash2, Eye } from "lucide-react";
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
  onDelete?: (id: string) => void;
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

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    date,
  );
}

export default function RoleListTable({ roles, onDelete }: RoleListTableProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

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

          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEdit(role);
              }}
              className={`${ACTION_BUTTON} hover:border-primary/50 hover:text-primary`}
            >
              <Edit2 className="size-3.5" />
            </button>
          </SimpleTooltip>

          {/* System roles are seeded by the backend and can't be removed. */}
          <SimpleTooltip
            content={role.isSystem ? "System role" : "Delete"}
            position="top"
          >
            <button
              disabled={role.isSystem}
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

  // this is dummy filtering logic, remove it when the API is wired up with search and filter params
  const filtered = roles.filter((role) => {
    const query = search.toLowerCase();
    const matchSearch =
      role.name.toLowerCase().includes(query) ||
      role.description.toLowerCase().includes(query);
    const matchStatus = statusFilter === "all" || role.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Clamp instead of resetting `page` in an effect, so filtering down to fewer
  // pages can never leave the table showing an empty slice.
  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const currentPage = Math.min(page, totalPages);
  // Client-side slicing — drop this once the API takes page/limit params.
  const paginated = filtered.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles..."
              startIcon={
                <SearchIcon className="size-4 text-muted-foreground" />
              }
              className="h-10 w-full border-border bg-card"
            />
          </div>

          {/* Status filter */}
          <div className="relative w-32">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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
        data={paginated}
        columns={columns}
        pagination
        page={currentPage}
        setPage={setPage}
        limit={limit}
        setLimit={(next) => {
          setLimit(next);
          setPage(1);
        }}
        totalData={filtered.length}
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
        handleDelete={(role) => {
          if (role) {
            onDelete?.(role._id);
            setRoleToDelete(null);
          }
        }}
      />
    </div>
  );
}
