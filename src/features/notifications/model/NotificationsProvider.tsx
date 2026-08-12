import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/model/AuthProvider";
import { resolveAppRole } from "@/shared/api";
import { notificacionesEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";
import { ROUTES } from "@/shared/config/routes";
import type { AppNotification } from "./types";
import { mapNotificacionDtosToApp } from "./mapStoredNotifications";

export const NOTIFICACIONES_ME_QUERY_KEY = ["notificaciones", "me"] as const;

function getUnreadNotifications(
  notifications: AppNotification[],
): AppNotification[] {
  return notifications.filter((notification) => !notification.read);
}

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadNotifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  notificationsListPath: string | null;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  const appRole = session ? resolveAppRole(session) : null;
  const queryClient = useQueryClient();
  const enabled =
    Boolean(env.apiUrl) && (appRole === "employee" || appRole === "employer");

  const listQuery = useQuery({
    queryKey: NOTIFICACIONES_ME_QUERY_KEY,
    queryFn: () => notificacionesEndpoints.listMe(),
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });

  const notifications = useMemo(
    () => mapNotificacionDtosToApp(listQuery.data?.items ?? []),
    [listQuery.data?.items],
  );

  const unreadNotifications = useMemo(
    () => getUnreadNotifications(notifications),
    [notifications],
  );

  const unreadCount =
    listQuery.data?.unread_count ?? unreadNotifications.length;

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: NOTIFICACIONES_ME_QUERY_KEY });
  }, [queryClient]);

  const markReadMutation = useMutation({
    mutationFn: (ids: string[]) =>
      notificacionesEndpoints.marcarLeidas({ ids }),
    onSuccess: invalidate,
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificacionesEndpoints.marcarTodasLeidas(),
    onSuccess: invalidate,
  });

  const markAsRead = useCallback(
    (id: string) => {
      const target = notifications.find((item) => item.id === id);
      if (!target || target.read) return;
      markReadMutation.mutate([id]);
    },
    [notifications, markReadMutation],
  );

  const markAllAsRead = useCallback(() => {
    if (unreadCount === 0) return;
    markAllMutation.mutate();
  }, [unreadCount, markAllMutation]);

  const notificationsListPath =
    appRole === "employee"
      ? ROUTES.employee.notificaciones
      : appRole === "employer"
        ? ROUTES.employer.notificaciones
        : null;

  const value = useMemo(
    () => ({
      notifications,
      unreadNotifications,
      unreadCount,
      isLoading: listQuery.isLoading,
      markAsRead,
      markAllAsRead,
      notificationsListPath,
    }),
    [
      notifications,
      unreadNotifications,
      unreadCount,
      listQuery.isLoading,
      markAsRead,
      markAllAsRead,
      notificationsListPath,
    ],
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
    throw new Error(
      "useNotifications debe usarse dentro de NotificationsProvider",
    );
  }

  return context;
}
