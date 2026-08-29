// Options for the product list toolbar. Each one maps onto a query param the
// `/admin/products` endpoint accepts, so nothing here is filtered client-side.

/** `filters` takes an expression, and `isGlobal` is the only one in use. */
export const SCOPE_FILTER_OPTIONS = [
  { label: "All scopes", value: "all" },
  { label: "Global", value: "true" },
  { label: "Private", value: "false" },
];

/**
 * `sortBy` and `sortOrder` are two params but one choice for the user, so the
 * pair travels as a single `field:order` value.
 *
 * Only `createdAt` is offered — the endpoint ignores `sortBy=name`, so the
 * A–Z / Z–A choices did nothing but change the label.
 */
export const SORT_OPTIONS = [
  { label: "Newest first", value: "createdAt:desc" },
  { label: "Oldest first", value: "createdAt:asc" },
];

export const DEFAULT_SORT = SORT_OPTIONS[0].value;

/** Splits a `field:order` value back into the two params the API wants. */
export function parseSort(value: string): {
  sortBy: string;
  sortOrder: "asc" | "desc";
} {
  const [sortBy = "createdAt", order] = value.split(":");
  return { sortBy, sortOrder: order === "asc" ? "asc" : "desc" };
}
