// ─── Role Module Types ────────────────────────────────────────────────────────
// Mirrors the admin-role API payloads, so form state can be sent as-is.

export type RoleStatus = "active" | "inactive";

/** One row of the permission matrix — a page and the four actions on it. */
export interface RolePermission {
  page: string;
  add: boolean;
  edit: boolean;
  view: boolean;
  delete: boolean;
}

/** A row as returned by `GET /admin/roles`. */
export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
  status: RoleStatus;
  /** System roles are seeded by the backend and cannot be deleted. */
  isSystem: boolean;
  /**
   * Live admin employees holding this role. Joined by the API per query, not
   * stored on the document — a role with `employeeCount > 0` cannot be deleted
   * until those employees are reassigned.
   */
  employeeCount: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create/update body for `/admin/roles`. Field names match the API exactly —
 * the form collects into this shape so no mapping is needed on submit.
 */
export interface RolePayload {
  name: string;
  description: string;
  permissions: RolePermission[];
  status: RoleStatus;
}

export interface RoleListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface RoleListResponse {
  status: boolean;
  statusCode: number;
  message: string;
  meta: RoleListMeta;
  data: Role[];
}

/** Query string the list endpoint accepts — every field is optional. */
export interface RoleListQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  /** Omit (or send "all" from the UI) to include every status. */
  status?: RoleStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** The unwrapped list — what `useGetRolesQuery` hands back. */
export interface RoleListResult {
  roles: Role[];
  meta: RoleListMeta;
}

/**
 * `GET /admin/roles/stats` — counts over every role, so the cards stay put
 * while the table below them is searched or filtered. `grantableActions` is not
 * in the response: the backend has no page registry, so the UI derives it from
 * ROLE_PAGES.
 */
export interface RoleStats {
  totalRoles: number;
  activeRoles: number;
  inactiveRoles: number;
  systemRoles: number;
  /** Active roles at least one employee holds — the ones actually in use. */
  activeRolesInUse: number;
  /** Active roles nobody holds: assignable, but currently doing nothing. */
  activeRolesUnused: number;
  /**
   * Roles of any status that no employee holds — exactly the set the delete
   * endpoint would accept, since it only refuses roles with employees on them.
   */
  unusedRoles: number;
  /** Employees holding any role — the reach of the whole role system. */
  assignedEmployees: number;
}
