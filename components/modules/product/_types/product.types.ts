// ─── Product Module Types ────────────────────────────────────────────────────

/**
 * The table row shape. Still fed by the mock data — the list endpoint is not
 * wired yet, so this stays as-is while create goes through the API.
 */
export interface Product {
  id?: string;
  name: string;
  slug: string;
  shortDescription: string;
  upc: string;
  sku: string;
  boxUpc: string;
  modifier: string;
  unit: "pcs" | "kg" | "box" | "pack" | string;
  tag: string[];
  image: string;
}

/**
 * Per-product margin. `percentage` only matters while `enabled` is true, but
 * the API wants the pair together, so the form always sends both.
 */
export interface ProductProfit {
  enabled: boolean;
  percentage: number;
}

/**
 * Body for `POST /admin/products/create`.
 *
 * Required: `name`, `upc`, `boxUpc`. Both barcodes must be exactly 12 or 14
 * digits — the API rejects any other length.
 */
export interface ProductPayload {
  name: string;
  description?: string;
  tags?: string[];
  profit?: ProductProfit;
  upc: string;
  boxUpc: string;
  isGlobal?: boolean;
}

/** Uploaded product image, as the API stores it. */
export interface ProductImage {
  url?: string;
  key?: string;
  title?: string;
  alt?: string;
}

/** A row as returned by `GET /admin/products` and the create endpoint. */
export interface GlobalProduct extends ProductPayload {
  _id: string;
  /** Set by the update endpoint's `image` upload; create takes no file. */
  image?: ProductImage | null;
  /** Wholesaler-side pricing rules; only `noProfit` is set today. */
  wholesaleConfig?: { noProfit?: boolean };
  isDeleted?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Pagination block the list endpoint returns alongside the rows. */
export interface ProductListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

/** Query params `GET /admin/products` accepts. */
export interface ProductListQuery {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  searchTerm?: string;
  /** Raw filter expression, e.g. `isGlobal=true`. */
  filters?: string;
}

/** What `getProducts` hands the page: the rows plus their pagination block. */
export interface ProductListResult {
  products: GlobalProduct[];
  meta: ProductListMeta;
}
