"use client";

import { useState, useEffect } from "react";
import { Search, Users, UserX } from "lucide-react";
import { Role, AdminUser } from "../_types/role.types";
import { Input } from "@/components/ui";
import { XIcon } from "@/components/icons/Icons";
import { Button } from "@/components/ui/button/Button";

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
    .slice(0, 1);
}

const AVATAR_COLORS = [
  "bg-blue-200",
  "bg-violet-200",
  "bg-emerald-200",
  "bg-amber-200",
  "bg-rose-200",
  "bg-cyan-200",
  "bg-indigo-200",
  "bg-teal-200",
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
        className="fixed top-0 right-0 z-500 h-full w-full max-w-105
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
            className="cursor-pointer center w-8 h-8 rounded-lg border border-border/60 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text5 hover:text-primary/70 dark:hover:text-white hover:border-primary/40 transition-all"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* ── Tabs + Stats ── */}
        <div className="px-5 pt-3 pb-3 shrink-0 space-y-2">
          {/* Quick stats */}

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-darkBorder/30">
            {(["all", "assigned"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 cursor-pointer text-xs font-semibold rounded-md transition-all duration-150 capitalize ${
                  tab === t
                    ? "bg-white dark:bg-darkBorder text-black dark:text-white shadow-sm"
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
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              startIcon={<Search className="size-4 text-text5" />}
              placeholder="Search by name, email or department..."
              className="h-10 dark:border-darkBorder dark:focus:border-primary"
            />
          </div>
        </div>

        {/* ── User List (scrollable) ── */}
        <div className="flex-1 overflow-y-auto noBar px-5 pb-3 space-y-1.5 min-h-0">
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-150 text-left group cursor-pointer ${
                    isAssigned
                      ? "border-primary/30 bg-primary/5 dark:bg-primary/10 dark:border-primary/40"
                      : "border-border/50 dark:border-darkBorder/40 bg-white dark:bg-darkBg hover:border-primary/25 hover:bg-gray-50/70 dark:hover:bg-darkBorder/10"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex items-center justify-center w-9 h-9 rounded-xl text-text6 text-sm font-semibold shrink-0 ${avatarColor(user.id)}`}
                  >
                    {getInitials(user.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] poppins text-black dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-text5 truncate">{user.email}</p>
                  </div>

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
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg px-6"
              loading={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
