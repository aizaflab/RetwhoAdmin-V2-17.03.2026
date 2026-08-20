"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Dialog, Field, FieldLabel, Input } from "@/components/ui";
import { getApiErrorMessage } from "@/lib/apiError";
import { Button } from "@/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";

import { STATUS_OPTIONS, VERIFICATION_OPTIONS } from "../_data/user-options";
import type { User, UserUpdatePayload } from "../_types/users.types";

interface UserEditDialogProps {
  open: boolean;
  onClose: () => void;
  user?: User | null;
  /** Must reject on failure so the error can be surfaced rather than swallowed. */
  onSubmit: (id: string, changes: UserUpdatePayload) => Promise<unknown>;
  /** The mutation's own pending flag, so the button reflects the real request. */
  saving?: boolean;
}

/** Edit an existing user's details. */
/** Only the fields the API's strict update schema accepts. */
const EMPTY_FORM: UserUpdatePayload = {};

export default function UserEditDialog({
  open,
  onClose,
  user,
  onSubmit,
  saving = false,
}: UserEditDialogProps) {
  const [formData, setFormData] = useState<UserUpdatePayload>(EMPTY_FORM);

  // Reload on every open so a previous edit never leaks into the next one.
  // Adjusted during render rather than in an effect, which would paint the
  // stale values for a frame first. Null while closed, so the fields keep
  // their content through the fade-out.
  const openKey = open && user ? user._id : null;
  const [lastOpenKey, setLastOpenKey] = useState<string | null>(openKey);

  if (openKey !== lastOpenKey) {
    setLastOpenKey(openKey);
    if (openKey && user) {
      setFormData({
        name: user.name,
        userName: user.userName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        status: user.status,
        isVerified: user.isVerified,
      });
    }
  }

  const handleFieldChange = <K extends keyof UserUpdatePayload>(
    field: K,
    value: UserUpdatePayload[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await onSubmit(user._id, formData);
      toast.success(`User "${formData.name ?? user.name}" updated`);
      onClose();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not update the user. Please try again.",
        ),
      );
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
            value={formData.phoneNumber || ""}
            onValueChange={(val) => handleFieldChange("phoneNumber", val)}
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
