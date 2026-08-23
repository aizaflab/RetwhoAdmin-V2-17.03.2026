"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";
import { Dialog, Field, FieldError, FieldLabel } from "@/components/ui";
import { Input } from "@/components/ui/input/Input";
import { Button } from "@/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";

import { STATUS_OPTIONS } from "../_data/user-options";
import type { UserPayload } from "../_types/users.types";

interface UserCreateDialogProps {
  open: boolean;
  onClose: () => void;
  /** Must reject on failure — the rejection is what puts a 409 on the field. */
  onSubmit: (payload: UserPayload) => Promise<unknown>;
  /** The mutation's own pending flag, so the button reflects the real request. */
  saving?: boolean;
}

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
  saving = false,
}: UserCreateDialogProps) {
  const [formData, setFormData] = useState<UserPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  // Reset on every open so a half-filled attempt never carries over. Adjusted
  // during render rather than in an effect: an effect would paint the stale
  // form for a frame first.
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setFormData(EMPTY_FORM);
      setErrors({});
      setShowPassword(false);
    }
  }

  const handleFieldChange = (field: keyof UserPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!formData.name.trim()) next.name = "Name is required";
    else if (formData.name.trim().length < 2)
      next.name = "Name must be at least 2 characters";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      next.email = "Enter a valid email address";
    if (!formData.password) next.password = "Password is required";
    // Mirrors the API's password policy, so a weak one is caught here rather
    // than coming back as a 400.
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(formData.password))
      next.password =
        "Use at least 8 characters with an uppercase letter, a lowercase letter and a number";
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    if (Object.keys(found).length > 0) {
      setErrors(found);
      toast.error("Please fill in the highlighted fields.");
      return;
    }

    const name = formData.name.trim();

    try {
      await onSubmit({
        ...formData,
        name,
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber?.trim() || undefined,
      });
      toast.success(`User "${name}" created — credentials have been emailed`);
      onClose();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Could not create the user. Please try again.",
      );

      // 409 on this endpoint is only ever the duplicate email, so it belongs on
      // the field the user has to change rather than in a dismissible toast.
      if (getApiErrorStatus(error) === 409) {
        setErrors((prev) => ({ ...prev, email: message }));
      }

      toast.error(message);
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
          <FieldLabel htmlFor="create-user-name">
            Name
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
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
          <FieldLabel htmlFor="create-user-email">
            Email
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
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
          <FieldLabel htmlFor="create-user-password">
            Password
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
          </FieldLabel>
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
            <span className="text-destructive" aria-hidden="true">
              *
            </span>
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
