"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "../_types/role.types";
import { Modal } from "@/components/ui/modal/Modal";
import RoleViewDrawer from "./RoleViewDrawer";
import {
  Shield,
  Edit2,
  Trash2,
  Users,
  Key,
  MoreVertical,
  ChevronDown,
  UserPlus,
  Eye,
} from "lucide-react";

interface RoleListTableProps {
  roles: Role[];
  onDelete?: (id: string) => void;
  onAssignUsers?: (role: Role) => void;
  canCreate?: boolean;
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
  canCreate = false,
}: RoleListTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [viewingRole, setViewingRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

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
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search roles..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border dark:border-darkBorder bg-white dark:bg-darkBg text-black dark:text-white placeholder:text-text5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 py-2 text-sm rounded-lg border border-border dark:border-darkBorder bg-white dark:bg-darkBg text-black dark:text-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none cursor-pointer transition-all"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text5 pointer-events-none" />
        </div>

        {/* Add role */}
        {canCreate && (
          <button
            onClick={() => router.push("/admin/role/add")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all duration-200 whitespace-nowrap"
          >
            <Shield className="w-4 h-4" />
            Add Role
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto noBar rounded-xl border border-border/70 dark:border-darkBorder/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/50 dark:border-darkBorder/30 bg-gray-50/80 dark:bg-darkPrimary/50">
              <th className="py-3 px-4 text-xs font-semibold text-text5 uppercase tracking-wider">
                Role
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-text5 uppercase tracking-wider hidden sm:table-cell">
                Description
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-text5 uppercase tracking-wider text-center">
                Users
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-text5 uppercase tracking-wider text-center">
                Perms
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-text5 uppercase tracking-wider text-center">
                Status
              </th>
              <th className="py-3 px-4 text-xs font-semibold text-text5 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-sm text-text5"
                >
                  No roles found
                </td>
              </tr>
            ) : (
              filtered.map((role) => (
                <tr
                  key={role.id}
                  className="border-b border-border/30 dark:border-darkBorder/20 hover:bg-gray-50/70 dark:hover:bg-darkBorder/10 transition-colors duration-150 bg-white dark:bg-darkBg"
                >
                  {/* Role name */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 shrink-0">
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
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4 hidden sm:table-cell max-w-xs">
                    <p className="text-sm text-text6 dark:text-text5 line-clamp-1">
                      {role.description || "—"}
                    </p>
                  </td>

                  {/* Users */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm text-text6 dark:text-text5">
                      <Users className="w-3.5 h-3.5" />
                      {role.userCount}
                    </div>
                  </td>

                  {/* Permission count */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1 text-sm font-semibold text-primary dark:text-blue-400">
                      <Key className="w-3.5 h-3.5" />
                      {role.permissions.length}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[role.status]}`}
                    >
                      {role.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 relative">
                      {/* Assign users */}
                      <button
                        onClick={() => onAssignUsers?.(role)}
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-150"
                        title="Assign Users"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() =>
                          router.push(`/admin/role/${role.id}/edit`)
                        }
                        className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-150"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {!role.isSystem && (
                        <>
                          <button
                            onClick={() => {
                              setOpenMenu(
                                openMenu === role.id ? null : role.id,
                              );
                            }}
                            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-rose-400/50 hover:text-rose-500 transition-all duration-150"
                            title="More"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {openMenu === role.id && (
                            <div className="absolute top-9 right-0 z-50 bg-white dark:bg-darkPrimary border border-border dark:border-darkBorder rounded-xl shadow-xl py-1 min-w-[130px] overflow-hidden">
                              <button
                                onClick={() => {
                                  setViewingRole(role);
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-text6 dark:text-text5 hover:bg-gray-100 dark:hover:bg-darkBorder/30 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View Role
                              </button>
                              <button
                                onClick={() => {
                                  setRoleToDelete(role);
                                  setOpenMenu(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete Role
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Click-away for menu */}
      {openMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setOpenMenu(null);
          }}
        />
      )}

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
