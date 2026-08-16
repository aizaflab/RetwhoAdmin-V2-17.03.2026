// ─── Employee Module Types ────────────────────────────────────────────────────
// Mirrors the admin-employee API payloads, so form state can be sent as-is.

export type EmployeeStatus = "active" | "inactive";

export interface EmployeeProfileImage {
  url: string;
  publicId: string;
}

/** A row as returned by `GET /admin-employee`. */
export interface Employee {
  _id: string;
  name: string;
  email: string;
  /** Older records may predate the phone field. */
  phone?: string;
  roleId: string;
  status: EmployeeStatus;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  profileImage?: EmployeeProfileImage;
}

/**
 * Create body for `POST /admin-employee`. Field names match the API exactly —
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

/** Update body — same fields, but `password` is only sent when being changed. */
export type EmployeeUpdatePayload = Omit<EmployeePayload, "password"> & {
  password?: string;
};

export interface EmployeeListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface EmployeeListResponse {
  status: boolean;
  statusCode: number;
  message: string;
  meta: EmployeeListMeta;
  data: Employee[];
}
