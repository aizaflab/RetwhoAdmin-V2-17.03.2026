"use client";

import { useEffect, useState } from "react";
import { Dialog, Field, FieldLabel, Input } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from "@/components/ui/select/Select";

import type { User } from "../_types/users.types";

interface UserEditDialogProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  onSubmit?: (id: string, changes: Partial<User>) => void | Promise<void>;
}

const STATUS_OPTIONS: SelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const VERIFICATION_OPTIONS: SelectOption[] = [
  { label: "Verified", value: "true" },
  { label: "Unverified", value: "false" },
];

/** Edit an existing user's details. */
export default function UserEditDialog({
  open,
  onClose,
  user,
  onSubmit,
}: UserEditDialogProps) {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [saving, setSaving] = useState(false);

  // Reload on every open so a previous edit never leaks into the next one.
  useEffect(() => {
    if (!open || !user) return;
    setFormData(user);
  }, [open, user]);

  const handleFieldChange = <K extends keyof User>(
    field: K,
    value: User[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await onSubmit?.(user._id, formData);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Edit User Details"
      size="xlarge"
      footer={
        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="outline" disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} loading={saving} loadingText="Saving...">
            Save Changes
          </Button>
        </div>
      }
    >
      <div className="grid sm:grid-cols-2 grid-cols-1 gap-5 py-2">
        <Field>
          <FieldLabel htmlFor="edit-user-name">Full Name</FieldLabel>
          <Input
            id="edit-user-name"
            name="name"
            value={formData.name || ""}
            onValueChange={(val) => handleFieldChange("name", val)}
            className="capitalize bg-transparent"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="edit-user-username">Username</FieldLabel>
          <Input
            id="edit-user-username"
            name="userName"
            value={formData.userName || ""}
            onValueChange={(val) => handleFieldChange("userName", val)}
            className="bg-transparent"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="edit-user-email">Email Address</FieldLabel>
          <Input
            id="edit-user-email"
            name="email"
            type="email"
            value={formData.email || ""}
            onValueChange={(val) => handleFieldChange("email", val)}
            className="bg-transparent"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="edit-user-phone">Phone Number</FieldLabel>
          <Input
            id="edit-user-phone"
            name="phone"
            type="tel"
            value={formData.phone || ""}
            onValueChange={(val) => handleFieldChange("phone", val)}
            className="bg-transparent"
          />
        </Field>

        <Field>
          <FieldLabel id="edit-user-status-label" htmlFor="edit-user-status">
            Account Status
          </FieldLabel>
          <Select
            id="edit-user-status"
            value={formData.status || "active"}
            onValueChange={(val) =>
              handleFieldChange("status", val as User["status"])
            }
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

        <Field>
          <FieldLabel
            id="edit-user-verified-label"
            htmlFor="edit-user-verified"
          >
            Verification
          </FieldLabel>
          <Select
            id="edit-user-verified"
            value={formData.isVerified ? "true" : "false"}
            onValueChange={(val) =>
              handleFieldChange("isVerified", val === "true")
            }
          >
            <SelectTrigger>
              <SelectValue
                placeholder="Select verification"
                options={VERIFICATION_OPTIONS}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItems options={VERIFICATION_OPTIONS} />
            </SelectContent>
          </Select>
        </Field>
      </div>
    </Dialog>
  );
}
