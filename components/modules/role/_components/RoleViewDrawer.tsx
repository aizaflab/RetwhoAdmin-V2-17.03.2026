"use client";

import { useEffect, useState } from "react";
import { X, Shield, Users, Key } from "lucide-react";
import { Role } from "../_types/role.types";
import { MOCK_ADMIN_USERS } from "../_data/mock-admin-users";
import PermissionMatrix from "./PermissionMatrix";

interface RoleViewDrawerProps {
  role: Role;
  onClose: () => void;
  onAssignUsers?: (role: Role) => void;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-teal-500",
];

function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const STATUS_STYLES = {
  active:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  inactive: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
  draft: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
};

export default function RoleViewDrawer({
  role,
  onClose,
  onAssignUsers,
}: RoleViewDrawerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assignedUsers = MOCK_ADMIN_USERS.filter((u) =>
    role.assignedUserIds.includes(u.id),
  );

  const selectedPerms = new Set(role.permissions.map((p) => p.key));

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-500 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="View Role"
        className="fixed top-0 right-0 z-500 h-full w-full max-w-[420px]
                   flex flex-col
                   bg-white dark:bg-darkBg
                   border-l border-border/60 dark:border-darkBorder/60
                   shadow-2xl
                   transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border/50 dark:border-darkBorder/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 shrink-0">
              <Shield className="w-5 h-5 text-primary dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-black dark:text-white flex items-center gap-2">
                {role.name}
                <span
                  className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[role.status]}`}
                >
                  {role.status}
                </span>
                {role.isSystem && (
                  <span className="text-[10px] font-medium bg-slate-100 dark:bg-darkBorder text-text5 px-1.5 py-0.5 rounded">
                    System
                  </span>
                )}
              </h2>
              <p className="text-xs text-text5 mt-0.5">Role Details</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text5 hover:text-black dark:hover:text-white hover:border-primary/40 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-text5 uppercase tracking-wider mb-2">
              Description
            </h3>
            <p className="text-sm text-text6 dark:text-text4 leading-relaxed">
              {role.description || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-text5" />
                <span className="text-xs font-medium text-text5">Assigned</span>
              </div>
              <p className="text-2xl font-semibold text-black dark:text-white">
                {role.userCount}
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border/50 dark:border-darkBorder/50 bg-gray-50/50 dark:bg-darkPrimary/30">
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-4 h-4 text-text5" />
                <span className="text-xs font-medium text-text5">
                  Permissions
                </span>
              </div>
              <p className="text-2xl font-semibold text-black dark:text-white">
                {role.permissions.length}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-text5 uppercase tracking-wider">
                Assigned Persons
              </h3>
              {onAssignUsers && (
                <button
                  onClick={() => {
                    handleClose();
                    onAssignUsers(role);
                  }}
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Manage Users
                </button>
              )}
            </div>

            <div className="space-y-2">
              {assignedUsers.length === 0 ? (
                <p className="text-sm text-text5 py-3 text-center border rounded-lg border-dashed border-border dark:border-darkBorder">
                  No users assigned
                </p>
              ) : (
                assignedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border/50 dark:border-darkBorder/40 bg-white dark:bg-darkBg"
                  >
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-white text-[10px] font-bold shrink-0 ${avatarColor(
                        user.id,
                      )}`}
                    >
                      {getInitials(user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-black dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-text5 truncate">
                        {user.email}
                      </p>
                    </div>
                    {user.department && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-darkBorder text-text5 shrink-0">
                        {user.department}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-text5 uppercase tracking-wider">
                Permissions
              </h3>
            </div>

            <div className="space-y-2">
              {role.permissions.length === 0 ? (
                <p className="text-sm text-text5 py-3 text-center border rounded-lg border-dashed border-border dark:border-darkBorder">
                  No permissions assigned
                </p>
              ) : (
                <div className="mt-2 pl-[-1px]">
                  <PermissionMatrix selected={selectedPerms} readOnly />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
