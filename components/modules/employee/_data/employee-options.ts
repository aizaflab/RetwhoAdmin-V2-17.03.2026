import type { SelectOption } from "@/components/ui/select/Select";

import type { EmployeeStatus } from "../_types/employee.types";

/**
 * Role choices are no longer defined here — they come from
 * `GET /admin/roles/options`, which returns only the roles that are currently
 * assignable. The form and the list filter both read that hook directly, and
 * the employee rows carry their role embedded, so nothing needs an id → name
 * lookup table any more.
 */

/** Statuses an admin may set from the form. */
export const STATUS_OPTIONS: SelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

/** The same list plus the "no filter" entry, for the table toolbar. */
export const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: "All Status", value: "all" },
  ...STATUS_OPTIONS,
];

/** Tinted from the semantic tokens so both themes resolve from one source. */
export const EMPLOYEE_STATUS_STYLES: Record<EmployeeStatus, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-warning/10 text-warning",
};

export function employeeStatusStyle(status: string): string {
  return (
    EMPLOYEE_STATUS_STYLES[status as EmployeeStatus] ??
    EMPLOYEE_STATUS_STYLES.inactive
  );
}
