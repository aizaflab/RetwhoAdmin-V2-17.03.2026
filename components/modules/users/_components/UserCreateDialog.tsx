"use client";

import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Dialog, Field, FieldError, FieldLabel } from "@/components/ui";
import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from "@/components/ui/select/Select";

import type { UserPayload } from "../_types/users.types";

interface UserCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: UserPayload) => void | Promise<void>;
}

const STATUS_OPTIONS: SelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

/** Field names match the API body, so this state object is the payload. */
const EMPTY_FORM: UserPayload = {
  name: "",
  email: "",
  password: "",
  phoneNumber: "",
  status: "active",
};

type FormErrors = Partial<Record<keyof UserPayload, string>>;

/** Create a user — `POST /users`. */
export default function UserCreateDialog({
  open,
  onClose,
  onSubmit,
}: UserCreateDialogProps) {
  const [formData, setFormData] = useState<UserPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset on every open so a half-filled attempt never carries over.
  useEffect(() => {
    if (!open) return;
    setFormData(EMPTY_FORM);
    setErrors({});
    setShowPassword(false);
  }, [open]);

  const handleFieldChange = (field: keyof UserPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!formData.name.trim()) next.name = "Name is required";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      next.email = "Enter a valid email address";
    if (!formData.password) next.password = "Password is required";
    else if (formData.password.length < 8)
      next.password = "Use at least 8 characters";
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
      await onSubmit?.({
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber?.trim(),
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xlarge"
      title="Add User"
      description="Create a new user account."
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="user-create-form"
            loading={saving}
            loadingText="Saving..."
          >
            Create User
          </Button>
        </div>
      }
    >
      <form
        id="user-create-form"
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="create-user-name">Name</FieldLabel>
          <Input
            id="create-user-name"
            name="name"
            placeholder="e.g. Valeh Doe"
            value={formData.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            className="capitalize bg-transparent"
          />
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </Field>

        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="create-user-email">Email</FieldLabel>
          <Input
            id="create-user-email"
            name="email"
            type="email"
            placeholder="e.g. name@example.com"
            value={formData.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            aria-invalid={errors.email ? true : undefined}
            className="bg-transparent"
          />
          {errors.email && <FieldError>{errors.email}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="create-user-password">Password</FieldLabel>
          <Input
            id="create-user-password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter a strong password"
            value={formData.password}
            onChange={(e) => handleFieldChange("password", e.target.value)}
            aria-invalid={errors.password ? true : undefined}
            endIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="cursor-pointer text-foreground transition-colors hover:text-primary"
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
            className="bg-transparent"
          />
          {errors.password && <FieldError>{errors.password}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="create-user-phone">
            Phone Number{" "}
            <span className="text-xs font-normal text-muted-foreground">
              (optional)
            </span>
          </FieldLabel>
          <Input
            id="create-user-phone"
            name="phoneNumber"
            type="tel"
            placeholder="e.g. (555) 123-4567"
            value={formData.phoneNumber ?? ""}
            onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
            className="bg-transparent"
          />
        </Field>

        <Field className="sm:col-span-2">
          <FieldLabel
            id="create-user-status-label"
            htmlFor="create-user-status"
          >
            Status
          </FieldLabel>
          <Select
            id="create-user-status"
            value={formData.status ?? "active"}
            onValueChange={(val) => handleFieldChange("status", val)}
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
      </form>
    </Dialog>
  );
}
