"use client";

import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { ChevronDown, ChevronRight, Check } from "lucide-react";
import { useState } from "react";

type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

interface PermissionMatrixProps {
  selected: Set<PermissionKey>;
  onChange?: (selected: Set<PermissionKey>) => void;
  readOnly?: boolean;
}

// Group permissions by module (first segment of the key)
interface PermissionGroup {
  module: string;
  label: string;
  color: string;
  bgColor: string;
  permissions: { key: PermissionKey; label: string; action: string }[];
}

const MODULE_META: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  dashboard: {
    label: "Dashboard",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  catalog: {
    label: "Catalog",
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
  },
  users: {
    label: "Users",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  connect: {
    label: "Connect",
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
  },
  orders: {
    label: "Orders",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
  reports: {
    label: "Reports",
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
  },
  stock: {
    label: "Stock",
    color: "text-lime-600 dark:text-lime-400",
    bgColor: "bg-lime-50 dark:bg-lime-950/30",
  },
  accounts: {
    label: "Accounts",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/30",
  },
  settings: {
    label: "Settings",
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-50 dark:bg-slate-800/30",
  },
  promotion: {
    label: "Promotion",
    color: "text-pink-600 dark:text-pink-400",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
  },
  access: {
    label: "Access / Roles",
    color: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  store_hub: {
    label: "Store Hub",
    color: "text-teal-600 dark:text-teal-400",
    bgColor: "bg-teal-50 dark:bg-teal-950/30",
  },
  support: {
    label: "Support Hub",
    color: "text-sky-600 dark:text-sky-400",
    bgColor: "bg-sky-50 dark:bg-sky-950/30",
  },
  blog: {
    label: "Blog",
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-50 dark:bg-rose-950/30",
  },
  hiring: {
    label: "Hiring Deck",
    color: "text-fuchsia-600 dark:text-fuchsia-400",
    bgColor: "bg-fuchsia-50 dark:bg-fuchsia-950/30",
  },
  help_center: {
    label: "Help Center",
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-800/30",
  },
};

function formatLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildGroups(): PermissionGroup[] {
  const map = new Map<string, PermissionGroup>();

  for (const [, value] of Object.entries(PERMISSIONS)) {
    const parts = value.split(".");
    const moduleKey = parts[0];
    const resource = parts[1] ?? "";
    const action = parts[2] ?? "view";

    if (!map.has(moduleKey)) {
      const meta = MODULE_META[moduleKey] ?? {
        label: formatLabel(moduleKey),
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      };
      map.set(moduleKey, { module: moduleKey, ...meta, permissions: [] });
    }

    map.get(moduleKey)!.permissions.push({
      key: value as PermissionKey,
      label: formatLabel(resource),
      action,
    });
  }

  return Array.from(map.values());
}

const PERMISSION_GROUPS = buildGroups();
const ALL_KEYS = Object.values(PERMISSIONS) as PermissionKey[];

export default function PermissionMatrix({
  selected,
  onChange,
  readOnly = false,
}: PermissionMatrixProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const isAllSelected = ALL_KEYS.every((k) => selected.has(k));

  const toggleAll = () => {
    if (readOnly || !onChange) return;
    if (isAllSelected) {
      onChange(new Set());
    } else {
      onChange(new Set(ALL_KEYS));
    }
  };

  const toggleGroup = (group: PermissionGroup) => {
    if (readOnly || !onChange) return;
    const groupKeys = group.permissions.map((p) => p.key);
    const allSelected = groupKeys.every((k) => selected.has(k));
    const next = new Set(selected);
    if (allSelected) {
      groupKeys.forEach((k) => next.delete(k));
    } else {
      groupKeys.forEach((k) => next.add(k));
    }
    onChange(next);
  };

  const toggleKey = (key: PermissionKey) => {
    if (readOnly || !onChange) return;
    const next = new Set(selected);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange(next);
  };

  const toggleCollapse = (module: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(module)) {
        next.delete(module);
      } else {
        next.add(module);
      }
      return next;
    });
  };

  return (
    <div className="space-y-1">
      {/* Master toggle */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 dark:bg-darkPrimary border border-border/50 dark:border-darkBorder/50 mb-4">
        <div>
          <p className="text-sm font-semibold text-black dark:text-white">
            All Permissions
          </p>
          <p className="text-xs text-text5 mt-0.5">
            {selected.size} of {ALL_KEYS.length} selected
          </p>
        </div>
        {!readOnly && (
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isAllSelected}
              onChange={toggleAll}
              disabled={readOnly}
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-darkBorder peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        )}
      </div>

      {/* Groups */}
      {PERMISSION_GROUPS.map((group) => {
        const groupKeys = group.permissions.map((p) => p.key);
        const selectedCount = groupKeys.filter((k) => selected.has(k)).length;
        const allGroupSelected = selectedCount === groupKeys.length;
        const someGroupSelected = selectedCount > 0 && !allGroupSelected;
        const isOpen = !collapsed.has(group.module);

        return (
          <div
            key={group.module}
            className="rounded-xl border border-border/50 dark:border-darkBorder/50 overflow-hidden"
          >
            {/* Group header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-darkBg cursor-pointer select-none gap-3">
              <button
                type="button"
                className="flex items-center gap-2.5 flex-1 min-w-0"
                onClick={() => toggleCollapse(group.module)}
              >
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold shrink-0 ${group.color} ${group.bgColor}`}
                >
                  {group.label[0]}
                </span>
                <span className="text-sm font-semibold text-black dark:text-white truncate">
                  {group.label}
                </span>
                <span className="text-xs text-text5 shrink-0">
                  {selectedCount}/{groupKeys.length}
                </span>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-text5 ml-auto shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-text5 ml-auto shrink-0" />
                )}
              </button>

              {/* Group select-all toggle */}
              {!readOnly && (
                <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={allGroupSelected}
                    disabled={readOnly}
                    ref={(el) => {
                      if (el) el.indeterminate = someGroupSelected;
                    }}
                    onChange={() => toggleGroup(group)}
                  />
                  <div className="w-9 h-5 bg-gray-200 dark:bg-darkBorder peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              )}
            </div>

            {/* Permission chips */}
            {isOpen && (
              <div className="px-4 pb-4 pt-2 bg-gray-50/50 dark:bg-darkPrimary/30 border-t border-border/30 dark:border-darkBorder/30">
                <div className="flex flex-wrap gap-2">
                  {group.permissions.map(({ key, label, action }) => {
                    const isChecked = selected.has(key);
                    const actionColor =
                      action === "create"
                        ? "border-emerald-300 dark:border-emerald-700"
                        : action === "update"
                          ? "border-amber-300 dark:border-amber-700"
                          : action === "delete"
                            ? "border-rose-300 dark:border-rose-700"
                            : action === "manage"
                              ? "border-violet-300 dark:border-violet-700"
                              : "border-border dark:border-darkBorder";

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleKey(key)}
                        disabled={readOnly}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 select-none ${
                          readOnly && !isChecked ? "hidden" : ""
                        } ${readOnly ? "cursor-default" : "cursor-pointer"} ${
                          isChecked
                            ? "bg-primary text-white border-primary shadow-sm shadow-primary/30 dark:bg-blue-600 dark:border-blue-500"
                            : `bg-white dark:bg-darkBg text-text6 dark:text-text5 ${actionColor} hover:border-primary/50 hover:text-primary dark:hover:text-blue-400`
                        }`}
                      >
                        {isChecked ? (
                          <Check className="w-3 h-3 shrink-0" />
                        ) : (
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              action === "create"
                                ? "bg-emerald-500"
                                : action === "update"
                                  ? "bg-amber-500"
                                  : action === "delete"
                                    ? "bg-rose-500"
                                    : action === "manage"
                                      ? "bg-violet-500"
                                      : "bg-blue-400"
                            }`}
                          />
                        )}
                        <span>{label}</span>
                        <span
                          className={`text-[10px] font-normal ${isChecked ? "opacity-75" : "opacity-50"}`}
                        >
                          {action}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
