// ─── User Module Types ────────────────────────────────────────────────────────
// Mirrors the platform-user API payloads, so form state can be sent as-is.

/**
 * The full API status enum. Three states, because auth only ever asks whether
 * an account is active. `suspended` was indistinguishable from `blocked`, and
 * `pending` duplicated `isVerified` — both were removed.
 */
export type UserStatus = "active" | "inactive" | "blocked" | "blocked";

export interface UserProfileImage {
  url: string;
  publicId: string;
}

/** A row as returned by `GET /users`. */
export interface User {
  _id: string;
  name: string;
  /** Generated server-side at signup; absent on un-migrated v1 records. */
  userName?: string;
  email: string;
  /** The API field is `phoneNumber`, not `phone`. */
  phoneNumber?: string;
  profileImage?: UserProfileImage;
  status?: UserStatus;
  isVerified?: boolean;
  agreedToTerms?: boolean;
  /**
   * Live shops this user currently owns, joined by the API per query. A user
   * who still owns shops cannot be deleted until they are transferred.
   */
  shopCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create body for `POST /users`. Field names match the API exactly — the form
 * collects into this shape so no mapping is needed on submit.
 */
export interface UserPayload {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  status?: UserStatus;
}

/** Update body for `PATCH /users/:id` — the API rejects anything else. */
export interface UserUpdatePayload {
  name?: string;
  email?: string;
  userName?: string;
  phoneNumber?: string;
  status?: UserStatus;
  isVerified?: boolean;
}

export interface UserListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

/** Query string the list endpoint accepts — every field is optional. */
export interface UserListQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  /** Omit (or send "all" from the UI) to include every status. */
  status?: UserStatus;
  isVerified?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/** The unwrapped list — what `useGetUsersQuery` hands back. */
export interface UserListResult {
  users: User[];
  meta: UserListMeta;
}

/**
 * `GET /users/stats` — counts over every user, so the cards stay put while the
 * table below them is searched or filtered.
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  /** Blocked: shut out by an admin decision, not by inactivity. */
  restrictedUsers: number;
  /** Registered within the current calendar month. */
  newThisMonth: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  /** Users owning at least one live shop — the platform's activation number. */
  usersWithShop: number;
  /** Signed up but never opened a shop: an account, not yet a customer. */
  usersWithoutShop: number;
}
