// ─── Resource (API) ─────────────────────────────────────────────────────────
// Mirrors `/support/resources`, so form state can be sent as-is.

/** Shared by every support content type on the API. */
export type SupportStatus = "draft" | "published" | "archived";

/** A row as returned by `GET /support/resources`. */
export interface SupportResourceItem {
  _id: string;
  title: string;
  /** Generated server-side from the title — never sent by the client. */
  slug: string;
  description: string;
  status: SupportStatus;
  /** Stamped by the API the first time the resource is published. */
  publishedAt?: string | null;
  createdBy?: { _id: string; name?: string } | null;
  createdAt: string;
  updatedAt: string;
}

/** Create/update body. `slug` is absent — the strict schema rejects it. */
export interface SupportResourcePayload {
  title: string;
  description: string;
  status: SupportStatus;
}

export interface SupportListMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

/** Query string the list endpoint accepts — every field is optional. */
export interface SupportResourceListQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: SupportStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SupportResourceListResult {
  resources: SupportResourceItem[];
  meta: SupportListMeta;
}

// ─── Article (API) ──────────────────────────────────────────────────────────

/** The slice of the parent resource the API populates onto an article. */
export interface SupportArticleResourceRef {
  _id: string;
  title: string;
  slug?: string;
}

/** A row as returned by `GET /support/articles`. */
export interface SupportArticleItem {
  _id: string;
  title: string;
  /** Generated server-side from the title — never sent by the client. */
  slug: string;
  /**
   * Populated on reads; create/update responses send back the bare id, so
   * both shapes are handled by `resourceRefId()`.
   */
  supportResourcesId: SupportArticleResourceRef | string | null;
  status: SupportStatus;
  publishedAt?: string | null;
  excerpt: string;
  tags: string[];
  /** Rich-text HTML from the editor. */
  content: string;
  createdBy?: { _id: string; name?: string } | null;
  createdAt: string;
  updatedAt: string;
}

/** Create/update body. `slug` is absent — the strict schema rejects it. */
export interface SupportArticlePayload {
  title: string;
  supportResourcesId: string;
  status: SupportStatus;
  excerpt: string;
  tags: string[];
  content: string;
}

export interface SupportArticleListQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: SupportStatus;
  supportResourcesId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SupportArticleListResult {
  articles: SupportArticleItem[];
  meta: SupportListMeta;
}

// ─── Chatbot (API) ──────────────────────────────────────────────────────────

/** A row as returned by `GET /support/chatbots`. */
export interface SupportChatbotItem {
  _id: string;
  /** Free text on the API; the panel writes `high` / `medium` / `low`. */
  priority: string;
  question: string;
  answer: string;
  /** Generated server-side from the question. */
  slug: string;
  /** Populated on reads; a bare id on create/update responses. */
  supportResourcesId: SupportArticleResourceRef | string | null;
  status: SupportStatus;
  publishedAt?: string | null;
  excerpt?: string;
  tags: string[];
  createdBy?: { _id: string; name?: string } | null;
  createdAt: string;
  updatedAt: string;
}

/** Create/update body. `slug` is absent — the strict schema rejects it. */
export interface SupportChatbotPayload {
  priority: string;
  question: string;
  answer: string;
  supportResourcesId: string;
  status: SupportStatus;
  excerpt?: string;
  tags: string[];
}

export interface SupportChatbotListQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: SupportStatus;
  priority?: string;
  supportResourcesId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SupportChatbotListResult {
  chatbots: SupportChatbotItem[];
  meta: SupportListMeta;
}

// ─── Learning Video (API) ───────────────────────────────────────────────────

/** A row as returned by `GET /support/videos`. */
export interface SupportVideoItem {
  _id: string;
  title: string;
  /** Generated server-side from the title. */
  slug: string;
  /** Populated on reads; a bare id on create/update responses. */
  supportResourcesId: SupportArticleResourceRef | string | null;
  status: SupportStatus;
  publishedAt?: string | null;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  /** Free text, e.g. `5m 30s`. */
  duration?: string;
  tags: string[];
  createdBy?: { _id: string; name?: string } | null;
  createdAt: string;
  updatedAt: string;
}

/** Create/update body. `slug` is absent — the strict schema rejects it. */
export interface SupportVideoPayload {
  title: string;
  supportResourcesId: string;
  status: SupportStatus;
  videoUrl: string;
  thumbnailUrl: string;
  description: string;
  duration?: string;
  tags: string[];
}

export interface SupportVideoListQuery {
  page?: number;
  limit?: number;
  searchTerm?: string;
  status?: SupportStatus;
  supportResourcesId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SupportVideoListResult {
  videos: SupportVideoItem[];
  meta: SupportListMeta;
}

/** `{ label, value }` from `GET /support/resources/options`. */
export interface SupportResourceOption {
  label: string;
  value: string;
}

// ─── Resource (mock) ────────────────────────────────────────────────────────
// Still feeds the article, chatbot and learning-video pages until those are
// connected; they switch to `GET /support/resources/options` then.
export interface SupportResource {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "active" | "inactive";
  articleCount: number;
  createdAt: string;
}

// ─── Article ─────────────────────────────────────────────────────────────────
export interface SupportArticle {
  id: string;
  title: string;
  slug: string;
  resourceId: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: "published" | "draft" | "archived";
  views: number;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Chatbot QnA ─────────────────────────────────────────────────────────────
export interface SupportChatbotQnA {
  id: string;
  question: string;
  answer: string;
  resourceId: string;
  keywords: string[];
  priority: number; // 1 = highest
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Learning Video ───────────────────────────────────────────────────────────
export interface SupportLearningVideo {
  id: string;
  title: string;
  description: string;
  resourceId: string;
  videoUrl: string; // embed / watch link
  thumbnailUrl: string;
  duration: string; // e.g. "12:34"
  tags: string[];
  status: "published" | "draft";
  views: number;
  createdAt: string;
}
