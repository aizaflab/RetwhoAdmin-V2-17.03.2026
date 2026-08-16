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

/** A row as returned by `GET /admin-role`. */
export interface Role {
  _id: string;
  name: string;
  description: string;
  permissions: RolePermission[];
  status: RoleStatus;
  /** System roles are seeded by the backend and cannot be deleted. */
  isSystem: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create/update body for `/admin-role`. Field names match the API exactly —
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
