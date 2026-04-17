"use client";

import {
  NotificationPage,
  MOCK_NOTIFICATIONS,
} from "@/components/modules/notification";

export default function NotificationsRoute() {
  return <NotificationPage notifications={MOCK_NOTIFICATIONS} />;
}
