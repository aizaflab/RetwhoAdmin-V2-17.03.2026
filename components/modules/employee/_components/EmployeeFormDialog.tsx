"use client";

import { useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Dialog, Field, FieldError, FieldLabel, Input } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/Select";

import { ROLE_OPTIONS, STATUS_OPTIONS } from "../_data/employee-options";
import type {
  Employee,
  EmployeePayload,
  EmployeeStatus,
} from "../_types/employee.types";

interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Present in edit mode; omit to add a new employee. */
  employee?: Employee | null;
  onSubmit?: (payload: EmployeePayload) => void | Promise<void>;
}

/** Field names match the API body, so this state object is the payload. */
const EMPTY_FORM: EmployeePayload = {
  name: "",
  email: "",
  phone: "",
  password: "",
  roleId: "",
  status: "active",
};

type FormErrors = Partial<Record<keyof EmployeePayload, string>>;

/** Add / edit employee in a dialog — the API only needs six fields. */
export default function EmployeeFormDialog({
  open,
  onClose,
  employee,
  onSubmit,
}: EmployeeFormDialogProps) {
  const isEdit = !!employee;

  const [formData, setFormData] = useState<EmployeePayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset on every open so a previous edit never leaks into the next one.
  useEffect(() => {
    if (!open) return;
    setFormData(
      employee
        ? {
            name: employee.name,
            email: employee.email,
            phone: employee.phone ?? "",
            password: "",
            roleId: employee.roleId,
            status: employee.status,
          }
        : EMPTY_FORM,
    );
    setErrors({});
    setShowPassword(false);
  }, [open, employee]);

  const handleFieldChange = (field: keyof EmployeePayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!formData.name.trim()) next.name = "Name is required";
    if (!formData.email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      next.email = "Enter a valid email address";
    if (!formData.phone.trim()) next.phone = "Phone is required";
    // On edit an empty password means "keep the current one".
    if (!isEdit && !formData.password) next.password = "Password is required";
    else if (formData.password && formData.password.length < 8)
      next.password = "Use at least 8 characters";
    if (!formData.roleId) next.roleId = "Role is required";
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
        phone: formData.phone.trim(),
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
      title={isEdit ? "Edit Employee" : "Add Employee"}
      description={
        isEdit
          ? "Update this employee's details and access."
          : "Create a new employee and assign a role."
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="employee-form"
            loading={saving}
            loadingText="Saving..."
          >
            {isEdit ? "Save Changes" : "Create Employee"}
          </Button>
        </div>
      }
    >
      <form
        id="employee-form"
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 gap-4 "
      >
        <Field>
          <FieldLabel htmlFor="employee-name">Name</FieldLabel>
          <Input
            id="employee-name"
            name="name"
            placeholder="e.g. Pekaw Uddin"
            value={formData.name}
            onChange={(e) => handleFieldChange("name", e.target.value)}
            aria-invalid={errors.name ? true : undefined}
            className="capitalize bg-transparent"
          />
          {errors.name && <FieldError>{errors.name}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="employee-email">Email</FieldLabel>
          <Input
            id="employee-email"
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

        <div className="grid sm:grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="employee-phone">Phone</FieldLabel>
            <Input
              id="employee-phone"
              name="phone"
              type="tel"
              placeholder="e.g. 01712345678"
              value={formData.phone}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
              aria-invalid={errors.phone ? true : undefined}
              className="bg-transparent"
            />
            {errors.phone && <FieldError>{errors.phone}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="employee-password">Password</FieldLabel>
            <Input
              id="employee-password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={
                isEdit
                  ? "Leave blank to keep current"
                  : "Enter a strong password"
              }
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
            <FieldLabel id="employee-roleId-label" htmlFor="employee-roleId">
              Role
            </FieldLabel>
            <Select
              id="employee-roleId"
              value={formData.roleId}
              onValueChange={(val) => handleFieldChange("roleId", val)}
            >
              <SelectTrigger error={!!errors.roleId}>
                <SelectValue
                  placeholder="Select a role"
                  options={ROLE_OPTIONS}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={ROLE_OPTIONS} />
              </SelectContent>
            </Select>
            {errors.roleId && <FieldError>{errors.roleId}</FieldError>}
          </Field>

          <Field>
            <FieldLabel id="employee-status-label" htmlFor="employee-status">
              Status
            </FieldLabel>
            <Select
              id="employee-status"
              value={formData.status}
              onValueChange={(val) =>
                handleFieldChange("status", val as EmployeeStatus)
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
        </div>
      </form>
    </Dialog>
  );
}
