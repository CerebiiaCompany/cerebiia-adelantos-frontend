import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/features/auth/model/AuthProvider";
import {
  loadEmployeeNotifications,
  subscribeEmployeeNotifications,
} from "@/entities/notification";
import { isEmpleadoSession } from "@/shared/api";
import type { DemoNotification } from "@/shared/config/demoNotifications";
import { mapStoredNotificationsToDemo } from "./mapStoredNotifications";
import {
  getInitialReadNotificationIds,
  saveReadNotificationIds,
} from "./notificationsStorage";

function getUnreadNotifications(
  notifications: DemoNotification[],
): DemoNotification[] {
  return notifications.filter((notification) => !notification.read);
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
  const { session } = useAuth();
  const employeeId =
    session && isEmpleadoSession(session) ? session.empleado.id : null;

  const [readIds, setReadIds] = useState<Set<string>>(() =>
    getInitialReadNotificationIds(),
  );
  const [version, setVersion] = useState(0);

  useEffect(
    () => subscribeEmployeeNotifications(() => setVersion((v) => v + 1)),
    [],
  );

  const notifications = useMemo(() => {
    if (!employeeId) return [];

    const stored = loadEmployeeNotifications(employeeId);
    return mapStoredNotificationsToDemo(stored, readIds);
  }, [employeeId, readIds, version]);

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
      const allIds = notifications.map((notification) => notification.id);
      const hasUnread = allIds.some((id) => !current.has(id));

      if (!hasUnread) {
        return current;
      }

      const next = new Set([...current, ...allIds]);
      saveReadNotificationIds(next);
      return next;
    });
  }, [notifications]);

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
