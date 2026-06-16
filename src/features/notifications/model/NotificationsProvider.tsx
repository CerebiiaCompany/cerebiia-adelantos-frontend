import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEMO_NOTIFICATIONS,
  getUnreadNotifications,
  type DemoNotification,
} from "@/shared/config/demoNotifications";
import {
  getInitialReadNotificationIds,
  saveReadNotificationIds,
} from "./notificationsStorage";

function applyReadState(
  notifications: DemoNotification[],
  readIds: Set<string>,
): DemoNotification[] {
  return notifications.map((notification) => ({
    ...notification,
    read: readIds.has(notification.id),
  }));
}

interface NotificationsContextValue {
  notifications: DemoNotification[];
  unreadNotifications: DemoNotification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [readIds, setReadIds] = useState<Set<string>>(() =>
    getInitialReadNotificationIds(),
  );

  const notifications = useMemo(
    () => applyReadState(DEMO_NOTIFICATIONS, readIds),
    [readIds],
  );

  const unreadNotifications = useMemo(
    () => getUnreadNotifications(notifications),
    [notifications],
  );

  const markAsRead = useCallback((id: string) => {
    setReadIds((current) => {
      if (current.has(id)) {
        return current;
      }

      const next = new Set(current);
      next.add(id);
      saveReadNotificationIds(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((current) => {
      const allIds = DEMO_NOTIFICATIONS.map((notification) => notification.id);
      const hasUnread = allIds.some((id) => !current.has(id));

      if (!hasUnread) {
        return current;
      }

      const next = new Set(allIds);
      saveReadNotificationIds(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      notifications,
      unreadNotifications,
      unreadCount: unreadNotifications.length,
      markAsRead,
      markAllAsRead,
    }),
    [notifications, unreadNotifications, markAsRead, markAllAsRead],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error("useNotifications debe usarse dentro de NotificationsProvider");
  }

  return context;
}
