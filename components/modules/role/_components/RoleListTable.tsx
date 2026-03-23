"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "../_types/role.types";
import { Modal } from "@/components/ui/modal/Modal";
import RoleViewDrawer from "./RoleViewDrawer";
import { Input, SimpleSelect } from "@/components/ui";
import { Table, Column } from "@/components/ui/table/Table";
import { SimpleTooltip } from "@/components/ui/tooltip/Tooltip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@/components/ui/dropdown/Dropdown";
import {
  Shield,
  Edit2,
  Trash2,
  Users,
  Key,
  MoreVertical,
  UserPlus,
  Eye,
} from "lucide-react";
import { SearchIcon } from "@/components/icons/Icons";

interface RoleListTableProps {
  roles: Role[];
  onDelete?: (id: string) => void;
  onAssignUsers?: (role: Role) => void;
}

const STATUS_STYLES = {
  active:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  inactive: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
  draft: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
};

export default function RoleListTable({
  roles,
  onDelete,
  onAssignUsers,
}: RoleListTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "draft", label: "Draft" },
  ];

  const columns: Column<Role>[] = [
    {
      id: "name",
      header: "Role",
      cell: (value, role) => (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/5 dark:bg-primary/20 shrink-0">
            <Shield className="w-4 h-4 text-primary dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-black dark:text-white flex items-center gap-1.5">
              {role.name}
              {role.isSystem && (
                <span className="text-[10px] font-medium bg-slate-100 dark:bg-darkBorder text-text5 px-1.5 py-0.5 rounded">
                  system
                </span>
              )}
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "description",
      header: "Description",
      className: "hidden sm:table-cell max-w-xs",
      cell: (value, role) => (
        <p className="text-sm text-text6 dark:text-text5 line-clamp-1">
          {role.description || "—"}
        </p>
      ),
    },
    {
      id: "userCount",
      header: "Users",
      className: "text-center",
      cell: (value, role) => (
        <div className="flex items-center justify-center gap-1 text-sm text-text6 dark:text-text5">
          <Users className="w-3.5 h-3.5" />
          {role.userCount}
        </div>
      ),
    },
    {
      id: "permissions",
      header: "Perms",
      className: "text-center",
      cell: (value, role) => (
        <div className="flex items-center justify-center gap-1 text-sm font-semibold text-primary dark:text-blue-400">
          <Key className="w-3.5 h-3.5" />
          {role.permissions.length}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      className: "text-center",
      cell: (value, role) => (
        <span
          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[role.status]}`}
        >
          {role.status}
        </span>
      ),
    },
    {
      id: "actions" as keyof Role,
      header: "Actions",
      className: "justify-end text-right",
      cell: (value, role) => (
        <div className="flex items-center justify-end gap-1 relative">
          <SimpleTooltip content="Assign Users" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAssignUsers?.(role);
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-150"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <SimpleTooltip content="Edit" position="top">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/role/${role.id}/edit`);
              }}
              className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-150"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </SimpleTooltip>

          <Dropdown
            onOpenChange={(isOpen) =>
              setOpenDropdownId(isOpen ? role.id : null)
            }
          >
            <SimpleTooltip
              content="More"
              position="top"
              disabled={openDropdownId === role.id}
            >
              <DropdownTrigger asChild showChevron={false}>
                <button
                  className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-rose-400/50 hover:text-rose-500 transition-all duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>
              </DropdownTrigger>
            </SimpleTooltip>

            <DropdownMenu align="end" className="min-w-[150px] p-1 font-medium">
              <DropdownItem
                icon={<Eye className="w-4 h-4" />}
                onClick={(e) => {
                  e.stopPropagation();
                  setViewingRole(role);
                }}
                className="text-text6 dark:text-text5 text-xs rounded-sm py-2 cursor-pointer"
              >
                View Role
              </DropdownItem>
              {!role.isSystem && (
                <DropdownItem
                  icon={<Trash2 className="size-3.5" />}
                  destructive
                  onClick={(e) => {
                    e.stopPropagation();
                    setRoleToDelete(role);
                  }}
                  className="text-xs rounded-sm py-2 cursor-pointer"
                >
                  Delete Role
                </DropdownItem>
              )}
            </DropdownMenu>
          </Dropdown>
        </div>
      ),
    },
  ];

  const filtered = roles.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-5">
        <h3 className="text-xl font-medium">Available Role</h3>
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-60">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles..."
              startIcon={<SearchIcon className="w-4 h-4 text-text5" />}
              className="h-10 w-full bg-white dark:bg-darkBg"
            />
          </div>

          {/* Status filter */}
          <div className="relative w-32">
            <SimpleSelect
              options={statusOptions}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
              className="h-10 rounded-md bg-white dark:bg-darkBg"
              arrowClass="size-6"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="">
        <Table<Role>
          data={filtered}
          columns={columns}
          pagination={false}
          bordered
          emptyMessage="No roles found"
          headerColor="bg-gray-50/80 dark:bg-darkPrimary/50"
          tableClassName="min-w-full"
        />
      </div>

      {/* Role View Drawer */}
      {viewingRole && (
        <RoleViewDrawer
          role={viewingRole}
          onClose={() => setViewingRole(null)}
          onAssignUsers={onAssignUsers}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!roleToDelete}
        onClose={() => setRoleToDelete(null)}
        title="Delete Role"
        size="small"
        variant="destructive"
        footer={
          <>
            <button
              onClick={() => setRoleToDelete(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-transparent dark:border-zinc-700"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (roleToDelete) {
                  onDelete?.(roleToDelete.id);
                  setRoleToDelete(null);
                }
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Role
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete the role{" "}
          <span className="font-semibold text-black dark:text-white">
            {roleToDelete?.name}
          </span>
          ? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
