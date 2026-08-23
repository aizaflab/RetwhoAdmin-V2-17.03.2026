import type { SelectOption } from "@/components/ui/select/Select";

import type { UserStatus } from "../_types/users.types";

/** Statuses an admin may set from the edit dialog. */
export const STATUS_OPTIONS: SelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Blocked", value: "blocked" },
];

/** The same list plus the "no filter" entry, for the table toolbar. */
export const STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: "All Status", value: "all" },
  ...STATUS_OPTIONS,
];

export const VERIFIED_FILTER_OPTIONS: SelectOption[] = [
  { label: "All Users", value: "all" },
  { label: "Verified", value: "true" },
  { label: "Unverified", value: "false" },
];

export const VERIFICATION_OPTIONS: SelectOption[] = [
  { label: "Verified", value: "true" },
  { label: "Unverified", value: "false" },
];

/**
 * Tinted from the semantic tokens so both themes resolve from one source.
 * `blocked` is destructive-red because it means an admin shut the account out;
 * `inactive` is amber because it is merely switched off.
 */
export const USER_STATUS_STYLES: Record<UserStatus, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-warning/10 text-warning",
  blocked: "bg-destructive/10 text-destructive",
};

/** Un-migrated records carry no status at all, hence the neutral fallback. */
export function userStatusStyle(status?: string): string {
  return (
    USER_STATUS_STYLES[status as UserStatus] ?? "bg-muted text-muted-foreground"
  );
}
