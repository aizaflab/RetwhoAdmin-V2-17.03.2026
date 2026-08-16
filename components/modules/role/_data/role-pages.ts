import type { RolePermission } from "../_types/role.types";

/**
 * The pages the API grants permissions on — `permissions[].page` values.
 * Keep in sync with the backend; the matrix renders one row per entry.
 */
export const ROLE_PAGES: { page: string; label: string }[] = [
  { page: "dashboard", label: "Dashboard" },
  { page: "admin-role", label: "Admin Role" },
  { page: "admin-employee", label: "Admin Employee" },
  { page: "user", label: "User" },
  { page: "shop", label: "Shop" },
  { page: "blog", label: "Blog" },
  { page: "logs", label: "Logs" },
  { page: "settings", label: "Settings" },
];

export const PERMISSION_ACTIONS = ["add", "edit", "view", "delete"] as const;

export type PermissionAction = (typeof PERMISSION_ACTIONS)[number];

/** Every page with all actions off — the starting point for a new role. */
export function emptyPermissions(): RolePermission[] {
  return ROLE_PAGES.map(({ page }) => ({
    page,
    add: false,
    edit: false,
    view: false,
    delete: false,
  }));
}

/**
 * Fills in pages the stored role never mentioned, so the matrix always shows a
 * complete grid even when the API returns a partial (or empty) list.
 */
export function normalizePermissions(
  permissions: RolePermission[] = [],
): RolePermission[] {
  return ROLE_PAGES.map(({ page }) => {
    const found = permissions.find((p) => p.page === page);
    return {
      page,
      add: found?.add ?? false,
      edit: found?.edit ?? false,
      view: found?.view ?? false,
      delete: found?.delete ?? false,
    };
  });
}

/** Counts the granted actions across every page — used for list/summary chips. */
export function countGrants(permissions: RolePermission[] = []): number {
  return permissions.reduce(
    (total, p) =>
      total +
      PERMISSION_ACTIONS.reduce((n, action) => n + (p[action] ? 1 : 0), 0),
    0,
  );
}

export function getPageLabel(page: string): string {
  return (
    ROLE_PAGES.find((p) => p.page === page)?.label ??
    page.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
