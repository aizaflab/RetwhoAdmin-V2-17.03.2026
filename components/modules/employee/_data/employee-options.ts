import { MOCK_ROLES } from "@/components/modules/role";
import type { SelectOption } from "@/components/ui/select/Select";

/**
 * Role choices for the employee form. Sourced from the role module for now —
 * swap `MOCK_ROLES` for the roles API response once it's wired.
 */
export const ROLE_OPTIONS: SelectOption[] = MOCK_ROLES.map((role) => ({
  label: role.name,
  value: role._id,
}));

export const STATUS_OPTIONS: SelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

/** Resolves a `roleId` to its display name, falling back to the raw id. */
export function getRoleName(roleId: string): string {
  return ROLE_OPTIONS.find((role) => role.value === roleId)?.label ?? roleId;
}
