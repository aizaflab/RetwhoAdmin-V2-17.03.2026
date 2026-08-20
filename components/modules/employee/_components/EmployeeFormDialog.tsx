"use client";

import { useState } from "react";
import { toast } from "sonner";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Dialog, Field, FieldError, FieldLabel, Input } from "@/components/ui";
import { Button } from "@/components/ui/button/Button";
import {
  Select,
  SelectContent,
  SelectItems,
  SelectTrigger,
  SelectValue,
  type SelectOption,
} from "@/components/ui/select/Select";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/apiError";

import { STATUS_OPTIONS } from "../_data/employee-options";
import type {
  Employee,
  EmployeePayload,
  EmployeeStatus,
  EmployeeUpdatePayload,
} from "../_types/employee.types";

interface EmployeeFormDialogProps {
  open: boolean;
  onClose: () => void;
  /** Present in edit mode; omit to add a new employee. */
  employee?: Employee | null;
  /** Assignable roles from `GET /admin/roles/options`. */
  roleOptions: SelectOption[];
  rolesLoading?: boolean;
  /** Must reject on failure — the rejection is what puts a 409 on the field. */
  onCreate: (payload: EmployeePayload) => Promise<unknown>;
  onUpdate: (id: string, payload: EmployeeUpdatePayload) => Promise<unknown>;
  /** The mutation's own pending flag, so the button reflects the real request. */
  saving?: boolean;
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

/** Add / edit employee in a dialog. */
export default function EmployeeFormDialog({
  open,
  onClose,
  employee,
  roleOptions,
  rolesLoading,
  onCreate,
  onUpdate,
  saving = false,
}: EmployeeFormDialogProps) {
  const isEdit = !!employee;

  const [formData, setFormData] = useState<EmployeePayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  // Reset on every open so a previous edit never leaks into the next one.
  // Adjusted during render rather than in an effect: an effect would paint the
  // stale form for a frame first, and React re-runs this before committing.
  // Null while closed, so the fields keep their content through the fade-out
  // instead of visibly emptying as the dialog slides away.
  const openKey = open ? (employee?._id ?? "new") : null;
  const [lastOpenKey, setLastOpenKey] = useState<string | null>(openKey);

  if (openKey !== lastOpenKey) {
    setLastOpenKey(openKey);
    if (openKey) {
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
    }
  }

  const handleFieldChange = (field: keyof EmployeePayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (!formData.name.trim()) next.name = "Name is required";
    else if (formData.name.trim().length < 2)
      next.name = "Name must be at least 2 characters";

    // Email is the login identity and the API will not change it on an edit,
    // so it is only validated when creating.
    if (!isEdit) {
      if (!formData.email.trim()) next.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
        next.email = "Enter a valid email address";
      if (!formData.password) next.password = "Password is required";
      else if (formData.password.length < 8)
        next.password = "Use at least 8 characters";
    }

    if (!formData.phone.trim()) next.phone = "Phone is required";
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

    const name = formData.name.trim();

    try {
      if (isEdit && employee) {
        // Only the four fields this endpoint accepts — sending email or
        // password here would be rejected by the API's strict body schema.
        await onUpdate(employee._id, {
          name,
          phone: formData.phone.trim(),
          roleId: formData.roleId,
          status: formData.status,
        });
        toast.success(`Employee "${name}" updated successfully`);
      } else {
        await onCreate({
          ...formData,
          name,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
        });
        toast.success(
          `Employee "${name}" created — an invite email is on its way`,
        );
      }
      onClose();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        isEdit
          ? "Could not update the employee. Please try again."
          : "Could not create the employee. Please try again.",
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
            // The address is the login identity; changing it is not something
            // this endpoint supports.
            disabled={isEdit}
            className="bg-transparent disabled:cursor-not-allowed disabled:opacity-60"
          />
          {errors.email ? (
            <FieldError>{errors.email}</FieldError>
          ) : (
            isEdit && (
              <p className="text-xs text-muted-foreground">
                Email cannot be changed after the account is created.
              </p>
            )
          )}
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

          {/* Passwords are set once at creation; afterwards the employee uses
              the forgot-password flow, so the field is not offered on edit. */}
          {!isEdit && (
            <Field>
              <FieldLabel htmlFor="employee-password">Password</FieldLabel>
              <Input
                id="employee-password"
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="cursor-pointer text-foreground transition-colors hover:text-primary"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
                className="bg-transparent"
              />
              {errors.password && <FieldError>{errors.password}</FieldError>}
            </Field>
          )}

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
                  placeholder={
                    rolesLoading ? "Loading roles..." : "Select a role"
                  }
                  options={roleOptions}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItems options={roleOptions} />
              </SelectContent>
            </Select>
            {errors.roleId ? (
              <FieldError>{errors.roleId}</FieldError>
            ) : (
              !rolesLoading &&
              roleOptions.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No active roles to assign. Create or activate a role first.
                </p>
              )
            )}
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
