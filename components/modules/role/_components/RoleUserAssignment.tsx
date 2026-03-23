"use client";

import { useState, useEffect, useRef } from "react";
import { X, Search, Users, UserCheck, UserX, ChevronRight } from "lucide-react";
import { Role, AdminUser } from "../_types/role.types";

interface RoleUserAssignmentProps {
  role: Role;
  allUsers: AdminUser[];
  onClose: () => void;
  onSave: (roleId: string, assignedUserIds: string[]) => void;
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

export default function RoleUserAssignment({
  role,
  allUsers,
  onClose,
  onSave,
}: RoleUserAssignmentProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(role.assignedUserIds),
  );
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"all" | "assigned">("all");

  // Drive the CSS transition: false = off-screen, true = on-screen
  const [visible, setVisible] = useState(false);

  // Trigger slide-in on mount
  useEffect(() => {
    // One rAF ensures the initial off-screen state is painted before we animate in
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Slide-out then call onClose
  const handleClose = () => {
    setVisible(false);
    // Wait for the CSS transition to finish (300ms) then unmount
    setTimeout(onClose, 300);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleUser = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const displayUsers = allUsers.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.department ?? "").toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === "all" ? true : selected.has(u.id);
    return matchSearch && matchTab;
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    onSave(role.id, Array.from(selected));
    setSaving(false);
    handleClose();
  };

  const assignedCount = selected.size;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-500 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        aria-hidden="true"
      />

      {/* ── Drawer panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Assign Users"
        className="fixed top-0 right-0 z-500 h-full w-full max-w-[420px]
                   flex flex-col
                   bg-white dark:bg-darkBg
                   border-l border-border/60 dark:border-darkBorder/60
                   shadow-2xl
                   transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: visible ? "translateX(0)" : "translateX(100%)" }}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-border/50 dark:border-darkBorder/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 shrink-0">
              <Users className="w-5 h-5 text-primary dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-black dark:text-white">
                Assign Users
              </h2>
              <p className="text-xs text-text5 mt-0.5">
                Role:{" "}
                <span className="font-semibold text-text6 dark:text-text4">
                  {role.name}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text5 hover:text-black dark:hover:text-white hover:border-primary/40 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Tabs + Stats ── */}
        <div className="px-5 pt-4 pb-3 shrink-0 space-y-3">
          {/* Quick stats */}

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-darkBorder/30">
            {(["all", "assigned"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 capitalize ${
                  tab === t
                    ? "bg-white dark:bg-darkBg text-black dark:text-white shadow-sm"
                    : "text-text5 hover:text-text6 dark:hover:text-text4"
                }`}
              >
                {t === "all"
                  ? `All Users (${allUsers.length})`
                  : `Assigned (${assignedCount})`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or department..."
              className="w-full pl-8 pr-4 py-2 text-sm rounded-lg border border-border dark:border-darkBorder bg-white dark:bg-darkPrimary text-black dark:text-white placeholder:text-text5 outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* ── User List (scrollable) ── */}
        <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-1.5 min-h-0">
          {displayUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <UserX className="w-8 h-8 text-text5/50" />
              <p className="text-sm text-text5">No users found</p>
            </div>
          ) : (
            displayUsers.map((user) => {
              const isAssigned = selected.has(user.id);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleUser(user.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 text-left group ${
                    isAssigned
                      ? "border-primary/30 bg-primary/5 dark:bg-primary/10 dark:border-primary/40"
                      : "border-border/50 dark:border-darkBorder/40 bg-white dark:bg-darkBg hover:border-primary/25 hover:bg-gray-50/70 dark:hover:bg-darkBorder/10"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-full text-white text-xs font-bold shrink-0 ${avatarColor(user.id)}`}
                  >
                    {getInitials(user.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-text5 truncate">{user.email}</p>
                  </div>

                  {/* Department */}
                  {user.department && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-gray-100 dark:bg-darkBorder text-text5 shrink-0">
                      {user.department}
                    </span>
                  )}

                  {/* Checkbox */}
                  <div
                    className={`flex items-center justify-center w-5 h-5 rounded-md border-2 transition-all duration-150 shrink-0 ${
                      isAssigned
                        ? "border-primary bg-primary"
                        : "border-border dark:border-darkBorder group-hover:border-primary/50"
                    }`}
                  >
                    {isAssigned && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t border-border/50 dark:border-darkBorder/30 shrink-0 flex items-center justify-between gap-3 bg-gray-50/50 dark:bg-darkPrimary/30">
          <div className="text-xs text-text5">
            {(() => {
              const added = Array.from(selected).filter(
                (id) => !role.assignedUserIds.includes(id),
              ).length;
              const removed = role.assignedUserIds.filter(
                (id) => !selected.has(id),
              ).length;
              if (added === 0 && removed === 0) return "No changes";
              const parts: string[] = [];
              if (added > 0) parts.push(`+${added} added`);
              if (removed > 0) parts.push(`−${removed} removed`);
              return parts.join(", ");
            })()}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-semibold rounded-lg border border-border dark:border-darkBorder bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/40 hover:text-black dark:hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="opacity-25"
                  />
                  <path
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                    className="opacity-75"
                  />
                </svg>
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save Assignment"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
