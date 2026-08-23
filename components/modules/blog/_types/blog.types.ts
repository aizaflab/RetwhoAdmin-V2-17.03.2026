// ─── Blog Module Types ────────────────────────────────────────────────────────
// Mirrors the blog API payloads, so form state can be sent as-is.

export type BlogStatus = "draft" | "published" | "archived";
export type BlogCategoryStatus = "active" | "inactive";

/**
 * `url`/`publicId` come back from the S3 upload; `title`/`alt` are typed by the
 * author and are what the rendered `<img>` carries for SEO and screen readers.
 */
export interface BlogImage {
  url: string;
  publicId?: string;
  title?: string;
  alt?: string;
}

/** The slice of the category the API embeds on every post row. */
export interface BlogPostCategory {
  _id: string;
  title: string;
  slug: string;
}

/** A row as returned by `GET /blogs`. */
export interface BlogPost {
  _id: string;
  title: string;
  /** Generated server-side from the title — never sent by the client. */
  slug: string;
  content: string;
  image?: BlogImage | null;
  categoryId: string;
  /** Joined by the API. Absent only if the category document went missing. */
  category?: BlogPostCategory;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  status: BlogStatus;
  viewCount: number;
  /** Stamped the first time the post reaches `published`. */
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Create/update body for `/blogs`. Sent as the JSON `data` field of a
 * multipart request, with the file itself under `image`.
 *
 * `slug` is deliberately absent — the API generates it from the title and its
 * strict schema rejects the field.
 */
export interface BlogPostPayload {
  title: string;
  content: string;
  categoryId: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  status: BlogStatus;
  /** Only the author-typed halves; url/publicId come from the upload. */
  image?: { title?: string; alt?: string };
}

/** A row as returned by `GET /blogs/categories`. */
export interface BlogCategory {
  _id: string;
  title: string;
  slug: string;
  status: BlogCategoryStatus;
  /** Posts filed under this category, joined by the API per query. */
  blogCount: number;
  blogs?: { _id: string; title: string; slug: string; status: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface BlogCategoryPayload {
  title: string;
  status: BlogCategoryStatus;
}

export interface BlogListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

/** Query string the list endpoints accept — every field is optional. */
export interface BlogListQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: BlogStatus;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BlogCategoryListQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: BlogCategoryStatus;
}

export interface BlogListResult {
  posts: BlogPost[];
  meta: BlogListMeta;
}

export interface BlogCategoryListResult {
  categories: BlogCategory[];
  meta: BlogListMeta;
}

/** `GET /blogs/stats` — counts over every post, not just the current page. */
export interface BlogStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  /** Published within the current calendar month. */
  publishedThisMonth: number;
  totalViews: number;
  /** Published posts nobody has opened yet. */
  postsWithNoViews: number;
}
