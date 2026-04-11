// ─── Contact Request ─────────────────────────────────────────────────────────
export interface ContactRequest {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  createdAt: string;
}

// ─── Web Subscriber ───────────────────────────────────────────────────────────
export interface WebSubscriber {
  id: string;
  email: string;
  name?: string;
  source: "website" | "blog" | "popup" | "footer" | "social";
  status: "active" | "unsubscribed" | "bounced";
  tags: string[];
  subscribedAt: string;
}
