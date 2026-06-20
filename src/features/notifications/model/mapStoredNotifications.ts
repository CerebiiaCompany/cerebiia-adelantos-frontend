import type { LucideIcon } from "lucide-react";
import { Zap } from "lucide-react";
import type { StoredNotification } from "@/entities/notification";
import type { DemoNotification } from "@/shared/config/demoNotifications";
import { formatRelative } from "@/shared/lib/dates";

const NOTIFICATION_ICONS: Record<StoredNotification["kind"], LucideIcon> = {
  advance_requested: Zap,
};

export function mapStoredNotificationToDemo(
  notification: StoredNotification,
  readIds: Set<string>,
): DemoNotification {
  return {
    id: notification.id,
    icon: NOTIFICATION_ICONS[notification.kind] ?? Zap,
    title: notification.title,
    description: notification.description,
    time: formatRelative(notification.createdAt),
    read: readIds.has(notification.id),
  };
}

export function mapStoredNotificationsToDemo(
  notifications: StoredNotification[],
  readIds: Set<string>,
): DemoNotification[] {
  return notifications.map((notification) =>
    mapStoredNotificationToDemo(notification, readIds),
  );
}
