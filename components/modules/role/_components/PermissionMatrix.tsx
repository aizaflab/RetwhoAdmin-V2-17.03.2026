"use client";

import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { Checkbox } from "@/components/ui/checkbox/Checkbox";

type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

interface PermissionMatrixProps {
  selected: Set<PermissionKey>;
  onChange?: (selected: Set<PermissionKey>) => void;
  readOnly?: boolean;
  isDrawer?: boolean;
}

interface ResourceRow {
  name: string;
  label: string;
  permissions: {
    add: PermissionKey | null;
    edit: PermissionKey | null;
    view: PermissionKey | null;
    delete: PermissionKey | null;
  };
}

// Group permissions by module (first segment of the key)
interface PermissionGroup {
  module: string;
  label: string;
  color: string;
  bgColor: string;
  resources: ResourceRow[];
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

function getColumnKey(action: string): keyof ResourceRow["permissions"] | null {
  if (["create"].includes(action)) return "add";
  if (["update", "manage"].includes(action)) return "edit";
  if (["list", "view"].includes(action)) return "view";
  if (["delete"].includes(action)) return "delete";
  return null;
}

function buildGroups(): PermissionGroup[] {
  const map = new Map<string, PermissionGroup>();

  for (const [, value] of Object.entries(PERMISSIONS)) {
    const parts = value.split(".");
    const moduleKey = parts[0];
    const resourceKey = parts[1] ?? "";
    const action = parts[2] ?? "view";

    if (!map.has(moduleKey)) {
      const meta = MODULE_META[moduleKey] ?? {
        label: formatLabel(moduleKey),
        color: "text-gray-600",
        bgColor: "bg-gray-50",
      };
      map.set(moduleKey, { module: moduleKey, ...meta, resources: [] });
    }

    const group = map.get(moduleKey)!;
    let resource = group.resources.find((r) => r.name === resourceKey);
    if (!resource) {
      resource = {
        name: resourceKey,
        label: formatLabel(resourceKey),
        permissions: { add: null, edit: null, view: null, delete: null },
      };
      group.resources.push(resource);
    }

    const colKey = getColumnKey(action);
    if (colKey) {
      resource.permissions[colKey] = value as PermissionKey;
    }
  }

  return Array.from(map.values());
}

const PERMISSION_GROUPS = buildGroups();
const ALL_KEYS = Object.values(PERMISSIONS) as PermissionKey[];

export default function PermissionMatrix({
  selected,
  onChange,
  readOnly = false,
  isDrawer = false,
}: PermissionMatrixProps) {
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
    const groupKeys = group.resources.flatMap(
      (r) => Object.values(r.permissions).filter(Boolean) as PermissionKey[],
    );
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

  return (
    <div className="space-y-4">
      {/* Master toggle */}
      <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 dark:bg-darkPrimary border border-border/50 dark:border-darkBorder/50">
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

      <div
        className={`border border-border/50 dark:border-darkBorder/50 rounded-lg bg-white dark:bg-darkBg ${isDrawer ? "overflow-x-auto" : ""}`}
      >
        <div className={isDrawer ? "min-w-[450px]" : "min-w-[600px]"}>
          {/* Table Header */}
          <div
            className={` items-center px-4 py-3 bg-gray-50 dark:bg-darkPrimary border-b border-border/50 dark:border-darkBorder/50 rounded-t-xl ${
              isDrawer
                ? "grid grid-cols-[1fr_60px_60px_60px_60px] "
                : "sticky top-17 z-10 grid grid-cols-[1fr_80px_80px_80px_80px] md:grid-cols-[1fr_100px_100px_100px_100px]"
            }`}
          >
            <div className="text-sm font-semibold text-text6 dark:text-text4">
              Pages
            </div>
            <div className="text-sm font-semibold text-text6 dark:text-text4 text-center">
              Add
            </div>
            <div className="text-sm font-semibold text-text6 dark:text-text4 text-center">
              Edit
            </div>
            <div className="text-sm font-semibold text-text6 dark:text-text4 text-center">
              View
            </div>
            <div className="text-sm font-semibold text-text6 dark:text-text4 text-center">
              Delete
            </div>
          </div>

          {/* Modules List */}
          <div className="divide-y divide-border/50 dark:divide-darkBorder/50">
            {PERMISSION_GROUPS.map((group) => {
              const groupKeys = group.resources.flatMap(
                (r) =>
                  Object.values(r.permissions).filter(
                    Boolean,
                  ) as PermissionKey[],
              );
              const selectedCount = groupKeys.filter((k) =>
                selected.has(k),
              ).length;
              const allGroupSelected = selectedCount === groupKeys.length;
              const someGroupSelected = selectedCount > 0 && !allGroupSelected;

              return (
                <div key={group.module}>
                  {/* Group Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-white/5 border-b border-border/50 dark:border-darkBorder/20">
                    <div className="flex items-center gap-3 ">
                      <span className=" font-semibold text-gray-900 dark:text-white tracking-wide ">
                        {group.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-5">
                      <span className="text-xs text-text5 font-medium">
                        {selectedCount}/{groupKeys.length}
                      </span>
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center"
                      >
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
                    </div>
                  </div>

                  {/* Resource Rows */}
                  <div className="divide-y divide-border/20 dark:divide-darkBorder/20">
                    {group.resources.map((resource) => (
                      <div
                        key={resource.name}
                        className={`grid items-center px-4 py-3 hover:bg-gray-50/40 dark:hover:bg-white/2 transition-colors ${isDrawer ? " grid-cols-[1fr_60px_60px_60px_60px]" : " grid-cols-[1fr_80px_80px_80px_80px] md:grid-cols-[1fr_100px_100px_100px_100px]"}`}
                      >
                        <div className="text-sm text-text6/80 dark:text-text4 font-medium pl-2">
                          {resource.label}
                        </div>
                        {["add", "edit", "view", "delete"].map((colKey) => {
                          const pKey =
                            resource.permissions[
                              colKey as keyof typeof resource.permissions
                            ];
                          return (
                            <div
                              key={colKey}
                              className="flex justify-center items-center"
                            >
                              {pKey ? (
                                <Checkbox
                                  checked={selected.has(pKey)}
                                  onValueChange={() => toggleKey(pKey)}
                                  disabled={readOnly}
                                  size="md"
                                />
                              ) : (
                                <Checkbox
                                  disabled
                                  checked={false}
                                  size="md"
                                  className="opacity-30 mix-blend-luminosity"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
