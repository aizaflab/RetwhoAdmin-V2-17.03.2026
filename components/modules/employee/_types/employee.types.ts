// ─── Employee Module Types ────────────────────────────────────────────────────
// Mirrors the admin-employee API payloads, so form state can be sent as-is.

/**
 * Two states. `banned` was removed: `authAdmin` and login both reduce to "is
 * this account active", and it behaved exactly like `inactive` — only the
 * wording of the refusal differed.
 */
export type EmployeeStatus = "active" | "inactive";

export interface EmployeeProfileImage {
  url: string;
  publicId: string;
}

/**
 * The slice of the role the API embeds on every employee row — enough to
 * render and reason about it, without the permission matrix.
 */
export interface EmployeeRoleSummary {
  _id: string;
  name: string;
  status: "active" | "inactive";
  isSystem: boolean;
}

/** A row as returned by `GET /admin/employees`. */
export interface Employee {
  _id: string;
  name: string;
  email: string;
  /** Older records may predate the phone field. */
  phone?: string;
  /** The raw id — what the edit form's role select binds to. */
  roleId: string;
  /** Joined by the API. Absent only if the role document went missing. */
  role?: EmployeeRoleSummary;
  status: EmployeeStatus;
  /**
   * A seeded, permanent account. The API refuses to update or delete it, so
   * the table offers neither action — the same contract `isSystem` carries on
   * a role. Optional because records created before the field existed have no
   * value for it, and those are ordinary accounts.
   */
  isSystem?: boolean;
  createdBy?: string | null;
  /** Null until the account is first used — the invite was never acted on. */
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  profileImage?: EmployeeProfileImage;
}

/**
 * Create body for `POST /admin/employees`. Field names match the API exactly —
 * the form collects into this shape so no mapping is needed on submit.
 */
export interface EmployeePayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  roleId: string;
  status: EmployeeStatus;
}

/**
 * Update body. The API rejects `email` and `password` on this endpoint — email
 * is the login identity and passwords go through the reset flow — so the form
 * strips both before sending an edit.
 */
export type EmployeeUpdatePayload = Partial<
  Omit<EmployeePayload, "email" | "password">
>;

export interface EmployeeListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

/** Query string the list endpoint accepts — every field is optional. */
export interface EmployeeListQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  /** Omit (or send "all" from the UI) to include every status. */
  status?: EmployeeStatus;
  roleId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** The unwrapped list — what `useGetEmployeesQuery` hands back. */
export interface EmployeeListResult {
  employees: Employee[];
  meta: EmployeeListMeta;
}

/**
 * `GET /admin/employees/stats` — counts over every employee, so the cards stay
 * put while the table below them is searched or filtered.
 */
export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  /** Joined within the current calendar month. */
  newThisMonth: number;
  /** Employees holding a system role: unrestricted access to the panel. */
  fullAccessEmployees: number;
  /**
   * Active employees who have not logged in for 30 days, never-logged-in
   * accounts included — access that carries risk but is not being used.
   */
  dormantEmployees: number;
  /** The actionable subset of the above: never signed in even once. */
  neverLoggedIn: number;
}
