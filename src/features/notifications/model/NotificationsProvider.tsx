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
import type { ListadoNotificacionesDTO } from "@/shared/api/types";
import { env } from "@/shared/config/env";
import { ROUTES } from "@/shared/config/routes";
import type { AppNotification } from "./types";
import { mapNotificacionDtosToApp } from "./mapStoredNotifications";
import { useNotificationWebSocket } from "./useNotificationWebSocket";
import { useNotificationSound } from "./useNotificationSound";

export const NOTIFICACIONES_ME_QUERY_KEY = ["notificaciones", "me"] as const;
export const REPORTES_DATOS_QUERY_KEY = ["empleados", "reportes-datos"] as const;

function getUnreadNotifications(
  notifications: AppNotification[],
): AppNotification[] {
  return notifications.filter((notification) => !notification.read);
}

function markIdsAsReadInCache(
  data: ListadoNotificacionesDTO | undefined,
  ids: string[],
): ListadoNotificacionesDTO | undefined {
  if (!data) return data;

  const idSet = new Set(ids);
  const items = data.items.map((item) =>
    idSet.has(item.id) ? { ...item, leida: true } : item,
  );

  return {
    items,
    unread_count: items.filter((item) => !item.leida).length,
  };
}

function markAllAsReadInCache(
  data: ListadoNotificacionesDTO | undefined,
): ListadoNotificacionesDTO | undefined {
  if (!data) return data;

  return {
    items: data.items.map((item) => ({ ...item, leida: true })),
    unread_count: 0,
  };
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

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: NOTIFICACIONES_ME_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: REPORTES_DATOS_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: ["adelantos"] });
    void queryClient.invalidateQueries({ queryKey: ["empleados"] });
    void queryClient.invalidateQueries({ queryKey: ["configuracion"] });
    void queryClient.invalidateQueries({ queryKey: ["logros"] });
  }, [queryClient]);

  const { isConnected: wsConnected } = useNotificationWebSocket({
    enabled,
    accessToken: session?.accessToken,
    onUpdated: invalidate,
  });

  const listQuery = useQuery({
    queryKey: NOTIFICACIONES_ME_QUERY_KEY,
    queryFn: () => notificacionesEndpoints.listMe(),
    enabled,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: wsConnected ? 10_000 : 4_000,
  });

  const notifications = useMemo(
    () => mapNotificacionDtosToApp(listQuery.data?.items ?? []),
    [listQuery.data?.items],
  );

  useNotificationSound(notifications, {
    enabled,
    isInitialLoadComplete: listQuery.isSuccess,
  });

  const unreadNotifications = useMemo(
    () => getUnreadNotifications(notifications),
    [notifications],
  );

  const unreadCount =
    listQuery.data?.unread_count ?? unreadNotifications.length;

  const markReadMutation = useMutation({
    mutationFn: (ids: string[]) =>
      notificacionesEndpoints.marcarLeidas({ ids }),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICACIONES_ME_QUERY_KEY });
      const previous = queryClient.getQueryData<ListadoNotificacionesDTO>(
        NOTIFICACIONES_ME_QUERY_KEY,
      );
      queryClient.setQueryData<ListadoNotificacionesDTO>(
        NOTIFICACIONES_ME_QUERY_KEY,
        (current) => markIdsAsReadInCache(current, ids),
      );
      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          NOTIFICACIONES_ME_QUERY_KEY,
          context.previous,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: NOTIFICACIONES_ME_QUERY_KEY,
      });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificacionesEndpoints.marcarTodasLeidas(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICACIONES_ME_QUERY_KEY });
      const previous = queryClient.getQueryData<ListadoNotificacionesDTO>(
        NOTIFICACIONES_ME_QUERY_KEY,
      );
      queryClient.setQueryData<ListadoNotificacionesDTO>(
        NOTIFICACIONES_ME_QUERY_KEY,
        (current) => markAllAsReadInCache(current),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          NOTIFICACIONES_ME_QUERY_KEY,
          context.previous,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: NOTIFICACIONES_ME_QUERY_KEY,
      });
    },
  });

  const markAsRead = useCallback(
    (id: string) => {
      const target = notifications.find((item) => item.id === id);
      if (target?.read) return;
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
