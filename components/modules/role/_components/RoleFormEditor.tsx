"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import {
  Field,
  FieldError,
  FieldLabel,
  Input,
  Textarea,
} from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from "@/components/ui/select/Select";

import PermissionMatrix from "./PermissionMatrix";
import { emptyPermissions, normalizePermissions } from "../_data/role-pages";
import type {
  Role,
  RolePayload,
  RolePermission,
  RoleStatus,
} from "../_types/role.types";

interface RoleFormEditorProps {
  /** Present in edit mode; omit to create a new role. */
  initialRole?: Role;
  onSave?: (payload: RolePayload) => void | Promise<void>;
}

const STATUS_OPTIONS: SelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

type FormErrors = Partial<Record<"name" | "description", string>>;

/** Create / edit a role — a full page, with the permission matrix alongside. */
export default function RoleFormEditor({
  initialRole,
  onSave,
}: RoleFormEditorProps) {
  const router = useRouter();
  const isEdit = !!initialRole;

  // Field names match the API body, so this state object is the payload.
  const [name, setName] = useState(initialRole?.name ?? "");
  const [description, setDescription] = useState(
    initialRole?.description ?? "",
  );
  const [status, setStatus] = useState<RoleStatus>(
    initialRole?.status ?? "active",
  );
  const [permissions, setPermissions] = useState<RolePermission[]>(
    initialRole
      ? normalizePermissions(initialRole.permissions)
      : emptyPermissions(),
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!name.trim()) next.name = "Role name is required";
    if (!description.trim()) next.description = "Description is required";
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setSaving(true);
    try {
      await onSave?.({
        name: name.trim(),
        description: description.trim(),
        permissions,
        status,
      });
      router.push("/role/manage");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/role/manage"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all duration-200 hover:border-primary/50 hover:text-primary"
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {isEdit ? `Edit Role: ${initialRole.name}` : "Create New Role"}
          </h1>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {isEdit
              ? "Update the role details and its page permissions"
              : "Define a new role and pick what it can do on each page"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left — Role details */}
        <div className="space-y-5 lg:col-span-1">
          <div className="space-y-5 rounded-xl border border-border bg-card p-5">
            <Field>
              <FieldLabel htmlFor="role-name">Role Name</FieldLabel>
              <Input
                id="role-name"
                name="name"
                placeholder="e.g. Operations Supervisor"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name)
                    setErrors((p) => ({ ...p, name: undefined }));
                }}
                aria-invalid={errors.name ? true : undefined}
                className="bg-transparent"
              />
              {errors.name && <FieldError>{errors.name}</FieldError>}
            </Field>

            <Field>
              <FieldLabel htmlFor="role-description">Description</FieldLabel>
              <Textarea
                id="role-description"
                name="description"
                placeholder="Describe what this role is responsible for..."
                rows={5}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description)
                    setErrors((p) => ({ ...p, description: undefined }));
                }}
                invalid={!!errors.description}
                className="bg-transparent"
              />
              {errors.description && (
                <FieldError>{errors.description}</FieldError>
              )}
            </Field>

            <Field>
              <FieldLabel id="role-status-label" htmlFor="role-status">
                Status
              </FieldLabel>
              <Select
                id="role-status"
                value={status}
                onValueChange={(val) => setStatus(val as RoleStatus)}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder="Select status"
                    options={STATUS_OPTIONS}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItems options={STATUS_OPTIONS} />
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => router.push("/role/manage")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              loading={saving}
              loadingText="Saving..."
            >
              {isEdit ? "Update Role" : "Create Role"}
            </Button>
          </div>
        </div>

        {/* Right — Permission matrix */}
        <div className="rounded-xl border border-border bg-card p-3 sm:p-5 lg:col-span-2">
          <PermissionMatrix value={permissions} onChange={setPermissions} />
        </div>
      </div>
    </form>
  );
}
