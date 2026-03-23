"use client";

import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { Role, RoleStatus } from "../_types/role.types";
import PermissionMatrix from "./PermissionMatrix";
import { useState } from "react";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

interface RoleFormEditorProps {
  initialRole?: Role;
  onSave?: (
    role: Omit<Role, "id" | "createdAt" | "updatedAt" | "userCount">,
  ) => void;
}

export default function RoleFormEditor({
  initialRole,
  onSave,
}: RoleFormEditorProps) {
  const router = useRouter();
  const isEdit = !!initialRole;

  const [name, setName] = useState(initialRole?.name ?? "");
  const [description, setDescription] = useState(
    initialRole?.description ?? "",
  );
  const [status, setStatus] = useState<RoleStatus>(
    initialRole?.status ?? "active",
  );
  const [selected, setSelected] = useState<Set<PermissionKey>>(
    new Set(
      (initialRole?.permissions ?? []).map((p) => p.key as PermissionKey),
    ),
  );
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const errs: { name?: string } = {};
    if (!name.trim()) errs.name = "Role name is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    // Simulate async
    await new Promise((r) => setTimeout(r, 600));
    onSave?.({
      name: name.trim(),
      description: description.trim(),
      status,
      assignedUserIds: initialRole?.assignedUserIds ?? [],
      permissions: Array.from(selected).map((key) => ({
        key,
        scope: "global" as const,
      })),
    });
    setSaving(false);
    router.push("/admin/role/manage");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/role/manage"
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-border/70 dark:border-darkBorder/50 bg-white dark:bg-darkBg text-text6 dark:text-text5 hover:border-primary/50 hover:text-primary transition-all duration-200"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-black dark:text-white">
            {isEdit ? `Edit Role: ${initialRole.name}` : "Create New Role"}
          </h1>
          <p className="text-sm text-text5 mt-0.5">
            {isEdit
              ? "Update role details and permission assignments"
              : "Define a new role with specific permissions"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Role Details */}
        <div className="lg:col-span-1 space-y-5">
          <div className="rounded-xl border border-border/70 dark:border-darkBorder/50 bg-white dark:bg-darkBg p-5 space-y-5">
            <h3 className="text-sm font-semibold text-black dark:text-white border-b border-border/50 dark:border-darkBorder/30 pb-3">
              Role Details
            </h3>

            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-text6 dark:text-text5 mb-1.5">
                Role Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({});
                }}
                placeholder="e.g. Marketing Lead"
                className={`w-full px-3 py-2.5 text-sm rounded-lg border bg-white dark:bg-darkPrimary text-black dark:text-white placeholder:text-text5 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 ${
                  errors.name
                    ? "border-rose-400 dark:border-rose-500"
                    : "border-border dark:border-darkBorder focus:border-primary"
                }`}
              />
              {errors.name && (
                <p className="text-xs text-rose-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-text6 dark:text-text5 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role's purpose..."
                rows={4}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border dark:border-darkBorder bg-white dark:bg-darkPrimary text-black dark:text-white placeholder:text-text5 outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-text6 dark:text-text5 mb-1.5">
                Status
              </label>
              <div className="flex gap-2">
                {(["active", "inactive", "draft"] as RoleStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-150 capitalize ${
                      status === s
                        ? s === "active"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-700"
                          : s === "draft"
                            ? "bg-amber-50 text-amber-600 border-amber-400 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-700"
                            : "bg-rose-50 text-rose-600 border-rose-400 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-700"
                        : "border-border dark:border-darkBorder text-text6 dark:text-text5 bg-white dark:bg-darkBg hover:border-primary/40"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-lg bg-gray-50 dark:bg-darkPrimary p-3 border border-border/40 dark:border-darkBorder/30">
              <p className="text-xs font-semibold text-text5 uppercase tracking-wider mb-2">
                Summary
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-text6 dark:text-text5">
                  Selected Permissions
                </span>
                <span className="text-sm font-bold text-primary dark:text-blue-400">
                  {selected.size}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-text6 dark:text-text5">
                  Total Available
                </span>
                <span className="text-xs text-text5">
                  {Object.values(PERMISSIONS).length}
                </span>
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 rounded-md text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
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
                Saving...
              </>
            ) : isEdit ? (
              "Update Role"
            ) : (
              "Create Role"
            )}
          </button>
        </div>

        {/* Right — Permission Matrix */}
        <div className="lg:col-span-2 rounded-xl p-3 sm:p-5 border border-border/70 dark:border-darkBorder/50 bg-white dark:bg-darkBg ">
          <PermissionMatrix selected={selected} onChange={setSelected} />
        </div>
      </div>
    </div>
  );
}
