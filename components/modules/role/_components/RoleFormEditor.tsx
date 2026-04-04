"use client";

import { PERMISSIONS } from "@/components/modules/access-control/_config/permission";
import { Role, RoleStatus } from "../_types/role.types";
import PermissionMatrix from "./PermissionMatrix";
import { useState } from "react";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeCalender, DateRange } from "@/components/ui/calender/HugeCalender";
import { Select } from "@/components/ui/select/Select";
import { Input } from "@/components/ui";
import { Textarea } from "@/components/ui/textarea/Textarea";

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
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [commission, setCommission] = useState("");
  const [rewardRole, setRewardRole] = useState("");

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
            {/* Name */}
            <div>
              <Input
                label="Role Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({});
                }}
                placeholder="e.g. Marketing Lead"
                className="h-10 dark:border-darkBorder focus:dark:border-primary"
                error={errors.name}
              />
            </div>

            {/* Description */}
            <div>
              <Textarea
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role's purpose..."
                rows={5}
              />
            </div>

            {/* Status */}
            <div>
              <Select
                label="Status"
                value={status}
                onValueChange={(value) => setStatus(value as RoleStatus)}
                placeholder="Select Status"
                fullWidth
                fieldClass="h-10"
                className="w-full"
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                  { value: "draft", label: "Draft" },
                ]}
              />
            </div>

            {/* Date */}
            <div>
              <HugeCalender
                label="Select Date"
                value={dateRange}
                onChange={setDateRange}
                fullWidth
              />
            </div>

            {/* Commission (%) */}
            <div>
              <Input
                label="Refer Commission (%)"
                type="number"
                value={commission}
                onChange={(e) => setCommission(e.target.value)}
                placeholder="e.g. 5"
                className="h-10 dark:border-darkBorder focus:dark:border-primary"
              />
            </div>

            {/* Commission Reward Role */}
            <div>
              <Select
                label="Commission Reward Role"
                value={rewardRole}
                onValueChange={setRewardRole}
                placeholder="Select a role"
                fullWidth
                fieldClass="h-10"
                className="w-full"
                options={[
                  { value: "wholeseller", label: "Wholeseller" },
                  { value: "retailer", label: "Retailer" },
                  { value: "consumer", label: "Consumer" },
                ]}
              />
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
