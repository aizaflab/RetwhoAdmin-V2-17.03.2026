// ─── Resource ───────────────────────────────────────────────────────────────
export interface SupportResource {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // emoji or icon key
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
