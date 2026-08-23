import type { SelectOption } from "@/components/ui/select/Select";

import type { BlogCategoryStatus, BlogStatus } from "../_types/blog.types";

/** Post statuses an author may set. */
export const POST_STATUS_OPTIONS: SelectOption[] = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export const POST_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: "All Status", value: "all" },
  ...POST_STATUS_OPTIONS,
];

export const CATEGORY_STATUS_OPTIONS: SelectOption[] = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export const CATEGORY_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: "All Status", value: "all" },
  ...CATEGORY_STATUS_OPTIONS,
];

/* Tinted from the semantic tokens so both themes resolve from one source. */
const POST_STATUS_STYLES: Record<BlogStatus, string> = {
  published: "bg-success/10 text-success",
  draft: "bg-warning/10 text-warning",
  archived: "bg-muted text-muted-foreground",
};

const CATEGORY_STATUS_STYLES: Record<BlogCategoryStatus, string> = {
  active: "bg-success/10 text-success",
  inactive: "bg-warning/10 text-warning",
};

export function blogStatusStyle(status?: string): string {
  return (
    POST_STATUS_STYLES[status as BlogStatus] ?? "bg-muted text-muted-foreground"
  );
}

export function categoryStatusStyle(status?: string): string {
  return (
    CATEGORY_STATUS_STYLES[status as BlogCategoryStatus] ??
    "bg-muted text-muted-foreground"
  );
}
