// ─── Hiring Module Types ────────────────────────────────────────────────────
// Mirrors the hiring API payloads, so form state can be sent as-is.

/**
 * The three states a human decides. There is no "expired": a deadline passing
 * is not a decision, so expiry is derived from `applicationDeadline` and
 * arrives on each row as `isExpired`.
 */
export type HiringStatus = "draft" | "published" | "closed";
/** What is being advertised — a role, a service, or an internship. */
export type HiringType = "job" | "service" | "internship";
export type EmploymentType = "full-time" | "part-time" | "contract" | "remote";
export type SalaryType = "monthly" | "yearly" | "hourly";
export type HiringCategoryStatus = "active" | "inactive";
/**
 * No `reviewed` state: it said nothing `pending` did not already say, while
 * `reviewedAt` records that somebody looked. The pipeline is the decision
 * itself — pending until shortlisted, rejected or hired.
 */
export type ApplicationStatus =
  | "pending"
  | "shortlisted"
  | "rejected"
  | "hired";

/** `url`/`publicId` come back from the S3 upload; `title`/`alt` are authored. */
export interface HiringImage {
  url: string;
  publicId?: string;
  title?: string;
  alt?: string;
}

/** The slice of the category the API embeds on every post row. */
export interface HiringPostCategory {
  _id: string;
  title: string;
  slug: string;
}

// ─── Hiring Post ─────────────────────────────────────────────────────────────

/** A row as returned by `GET /hiring`. */
export interface HiringPost {
  _id: string;
  title: string;
  /** Generated server-side from the title — never sent by the client. */
  slug: string;
  companyName: string;
  companyLogo?: HiringImage | null;
  bannerImage?: HiringImage | null;
  categoryId: string;
  category?: HiringPostCategory;
  hiringType: HiringType;
  employmentType: EmploymentType;
  address: string;
  city: string;
  country: string;
  currency: string;
  salaryMin: number;
  salaryMax: number;
  salaryType: SalaryType;
  status: HiringStatus;
  /** Optional — a posting need not state how many openings it has. */
  numberOfOpenings?: number;
  /** ISO date; the API insists it is in the future when creating. */
  applicationDeadline: string;
  experience: string;
  education: string;
  skills: string[];
  requirements: string[];
  benefits: string[];
  description: string;
  viewCount: number;
  /**
   * Derived server-side: published, and past its `applicationDeadline`. A
   * draft with an old deadline is NOT expired — it was never open.
   */
  isExpired?: boolean;
  /**
   * Applications against this posting, joined and broken down by status so the
   * table answers "how many applied, how many still pending" without a query
   * per row. The breakdown is derived from the same array as `total`, so it can
   * never add up to something else.
   */
  applicationStats?: {
    total: number;
    pending: number;
    shortlisted: number;
    rejected: number;
    hired: number;
  };
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create/update body for `/hiring`. Sent as the JSON `data` field of a
 * multipart request, with files under `companyLogo` and `bannerImage`.
 *
 * `slug` is deliberately absent — the API generates it and its strict schema
 * rejects the field.
 */
export interface HiringPostPayload {
  title: string;
  companyName: string;
  categoryId: string;
  hiringType: HiringType;
  employmentType: EmploymentType;
  address: string;
  city: string;
  country: string;
  currency: string;
  salaryMin: number;
  salaryMax: number;
  salaryType: SalaryType;
  status: HiringStatus;
  /** Optional — a posting need not state how many openings it has. */
  numberOfOpenings?: number;
  applicationDeadline: string;
  experience: string;
  education: string;
  skills: string[];
  requirements: string[];
  benefits: string[];
  description: string;
  /** Only the author-typed halves; url/publicId come from the upload. */
  companyLogo?: { title?: string; alt?: string };
  bannerImage?: { title?: string; alt?: string };
}

// ─── Hiring Category ─────────────────────────────────────────────────────────

export interface HiringCategory {
  _id: string;
  title: string;
  slug: string;
  status: HiringCategoryStatus;
  /** Postings filed under this category, joined by the API per query. */
  postCount?: number;
  /** The published subset — how much of the category is actually live. */
  publishedPostCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface HiringCategoryPayload {
  title: string;
  status: HiringCategoryStatus;
}

// ─── Application ─────────────────────────────────────────────────────────────

export interface ApplicationFile {
  url: string;
  publicId?: string;
  name?: string;
}

/** A row as returned by `GET /hiring/applications`. */
export interface JobApplication {
  _id: string;
  hiringId: string;
  /** Joined by the API so the table can name the posting applied to. */
  hiring?: { _id: string; title: string; companyName?: string; slug?: string };
  applicantId?: string;
  applicant?: { _id: string; name?: string; email?: string };
  fullName: string;
  email: string;
  phone: string;
  resume?: ApplicationFile;
  portfolioUrl?: string;
  coverLetter?: string;
  status: ApplicationStatus;
  reviewedAt?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** `PATCH /hiring/applications/:id/status` body. */
export interface ApplicationStatusPayload {
  status: ApplicationStatus;
  notes?: string;
}

// ─── Shared list plumbing ────────────────────────────────────────────────────

export interface HiringListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface HiringListQuery {
  /** Derived server-side from `applicationDeadline` — not a status. */
  isExpired?: boolean;
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: HiringStatus;
  categoryId?: string;
  hiringType?: HiringType;
  employmentType?: EmploymentType;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface HiringCategoryListQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: HiringCategoryStatus;
}

export interface ApplicationListQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: ApplicationStatus;
  hiringId?: string;
}

export interface HiringListResult {
  posts: HiringPost[];
  meta: HiringListMeta;
}

export interface HiringCategoryListResult {
  categories: HiringCategory[];
  meta: HiringListMeta;
}

export interface ApplicationListResult {
  applications: JobApplication[];
  meta: HiringListMeta;
}

/**
 * `GET /hiring/overview` — status tallies for both postings and applications,
 * computed over everything rather than the current page.
 */
export interface HiringOverview {
  posts: {
    total: number;
    draft: number;
    published: number;
    closed: number;
    /**
     * Derived, and a SLICE of `published` rather than a fourth status — the
     * numbers overlap on purpose.
     */
    expired: number;
  };
  applications: {
    total: number;
    pending: number;
    shortlisted: number;
    rejected: number;
    hired: number;
  };
}
