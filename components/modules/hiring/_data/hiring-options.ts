import type { SelectOption } from "@/components/ui/select/Select";

import type {
  ApplicationStatus,
  EmploymentType,
  HiringCategoryStatus,
  HiringStatus,
  HiringType,
  SalaryType,
} from "../_types/hiring.types";

/* ─── Posting ─────────────────────────────────────────────────────────── */

export const HIRING_STATUS_OPTIONS: SelectOption[] = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Closed", value: "closed" },
];

/**
 * Expiry is not a status, so it cannot live in the status list — a posting past
 * its deadline is still `published` until somebody closes it. It gets its own
 * filter, which the API turns into a date query.
 */
export const HIRING_EXPIRY_FILTER_OPTIONS: SelectOption[] = [
  { label: "Any Deadline", value: "all" },
  { label: "Past Deadline", value: "true" },
  { label: "Still Open", value: "false" },
];

export const HIRING_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: "All Status", value: "all" },
  ...HIRING_STATUS_OPTIONS,
];

export const HIRING_TYPE_OPTIONS: SelectOption[] = [
  { label: "Job", value: "job" },
  { label: "Service", value: "service" },
  { label: "Internship", value: "internship" },
];

export const EMPLOYMENT_TYPE_OPTIONS: SelectOption[] = [
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contract", value: "contract" },
  { label: "Remote", value: "remote" },
];

export const SALARY_TYPE_OPTIONS: SelectOption[] = [
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
  { label: "Hourly", value: "hourly" },
];

/* ─── Category ────────────────────────────────────────────────────────── */

export const CATEGORY_STATUS_OPTIONS: SelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export const CATEGORY_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: "All Status", value: "all" },
  ...CATEGORY_STATUS_OPTIONS,
];

/* ─── Application ─────────────────────────────────────────────────────── */

export const APPLICATION_STATUS_OPTIONS: SelectOption[] = [
  { label: "Pending", value: "pending" },
  { label: "Shortlisted", value: "shortlisted" },
  { label: "Rejected", value: "rejected" },
  { label: "Hired", value: "hired" },
];

export const APPLICATION_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: "All Status", value: "all" },
  ...APPLICATION_STATUS_OPTIONS,
];

/* ─── Badge styling ───────────────────────────────────────────────────── */
/* Tinted from the semantic tokens so both themes resolve from one source. */

const HIRING_STATUS_STYLES: Record<HiringStatus, string> = {
  published: "bg-success/10 text-success",
  draft: "bg-warning/10 text-warning",
  closed: "bg-muted text-muted-foreground",
  // Nothing was decided — the deadline simply passed.
};

const CATEGORY_STATUS_STYLES: Record<HiringCategoryStatus, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-warning/10 text-warning",
};

const APPLICATION_STATUS_STYLES: Record<ApplicationStatus, string> = {
  pending: "bg-warning/10 text-warning",
  shortlisted: "bg-primary/10 text-primary",
  rejected: "bg-destructive/10 text-destructive",
  hired: "bg-success/10 text-success",
};

const NEUTRAL = "bg-muted text-muted-foreground";

export function hiringStatusStyle(status?: string): string {
  return HIRING_STATUS_STYLES[status as HiringStatus] ?? NEUTRAL;
}

export function hiringCategoryStatusStyle(status?: string): string {
  return CATEGORY_STATUS_STYLES[status as HiringCategoryStatus] ?? NEUTRAL;
}

export function applicationStatusStyle(status?: string): string {
  return APPLICATION_STATUS_STYLES[status as ApplicationStatus] ?? NEUTRAL;
}

/* ─── Formatting ──────────────────────────────────────────────────────── */

/** "USD 2,000 – 3,000 / monthly" — the range as the table renders it. */
export function formatSalaryRange(
  min: number,
  max: number,
  currency: string,
  type: SalaryType | string,
): string {
  const format = (value: number) =>
    new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
      value ?? 0,
    );
  return `${currency || "USD"} ${format(min)} – ${format(max)} / ${type}`;
}

export function labelFor(options: SelectOption[], value?: string): string {
  return options.find((o) => String(o.value) === value)?.label ?? value ?? "—";
}

export function hiringTypeLabel(value?: HiringType | string): string {
  return labelFor(HIRING_TYPE_OPTIONS, value);
}

export function employmentTypeLabel(value?: EmploymentType | string): string {
  return labelFor(EMPLOYMENT_TYPE_OPTIONS, value);
}
