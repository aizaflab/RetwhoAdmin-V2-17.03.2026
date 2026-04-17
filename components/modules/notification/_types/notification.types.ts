export type NotificationType =
  | "orders"
  | "connect"
  | "messages"
  | "promotions"
  | "alerts"
  | "updates"
  | "system"
  | "payment"
  | "review"
  | "security";

export type NotificationPriority = "low" | "medium" | "high" | "critical";

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  time: string;
  timestamp: Date;
  read: boolean;
  pinned?: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    orderId?: string;
    userId?: string;
    amount?: number;
    userName?: string;
    avatar?: string;
  };
  iconColor: string;
  bgColor: string;
  borderColor: string;
}
