import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/model/AuthProvider";
import { isEmpleadoSession, resolveAppRole } from "@/shared/api";
import { adelantosEndpoints, notificacionesEndpoints } from "@/shared/api/endpoints";
import { empleadosEndpoints } from "@/shared/api/endpoints/empleados";
import type { ListadoNotificacionesDTO } from "@/shared/api/types";
import { env } from "@/shared/config/env";
import { ROUTES } from "@/shared/config/routes";
import {
  getSeenSoporteResponseIds,
  hasCompanySoporteReply,
  isSoporteResponseUnread,
  markSoporteResponseSeen,
  SOPORTE_SEEN_CHANGED_EVENT,
} from "@/shared/lib/soporteSeenStorage";
import { formatRelative } from "@/shared/lib/dates";
import { CheckCircle2, MessageSquare, Wallet, XCircle, Zap } from "lucide-react";
import type { AppNotification } from "./types";
import { mapNotificacionDtosToApp } from "./mapStoredNotifications";
import { useNotificationWebSocket } from "./useNotificationWebSocket";
import { useNotificationSound } from "./useNotificationSound";

export const NOTIFICACIONES_ME_QUERY_KEY = ["notificaciones", "me"] as const;
export const REPORTES_DATOS_QUERY_KEY = ["empleados", "reportes-datos", "me"] as const;
export const SOLICITUDES_ADELANTO_QUERY_KEY = ["adelantos", "solicitudes"] as const;

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
  const isEmpleado = session ? isEmpleadoSession(session) : false;
  const [seenSoporteIds, setSeenSoporteIds] = useState(() =>
    getSeenSoporteResponseIds(),
  );

  useEffect(() => {
    const sync = () => setSeenSoporteIds(getSeenSoporteResponseIds());
    window.addEventListener(SOPORTE_SEEN_CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(SOPORTE_SEEN_CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const enabled =
    Boolean(env.apiUrl) &&
    Boolean(session?.accessToken) &&
    (appRole === "employee" || appRole === "employer" || isEmpleado);

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: NOTIFICACIONES_ME_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: REPORTES_DATOS_QUERY_KEY });
    void queryClient.invalidateQueries({ queryKey: SOLICITUDES_ADELANTO_QUERY_KEY });
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
    refetchInterval: wsConnected ? 6_000 : 3_000,
  });

  const soporteQuery = useQuery({
    queryKey: ["empleados", "reportes-datos", "me", { page: 1, page_size: 50 }],
    queryFn: () =>
      empleadosEndpoints.listReportesDatoIncorrectoMe({ page: 1, page_size: 50 }),
    enabled: enabled && (appRole === "employee" || isEmpleado),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: wsConnected ? 6_000 : 3_000,
  });

  const adelantosQuery = useQuery({
    queryKey: SOLICITUDES_ADELANTO_QUERY_KEY,
    queryFn: () => adelantosEndpoints.listSolicitudes(),
    enabled: enabled && (appRole === "employee" || isEmpleado),
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchInterval: wsConnected ? 6_000 : 3_000,
  });

  const notifications = useMemo(() => {
    const backendItems = mapNotificacionDtosToApp(listQuery.data?.items ?? []);

    if (appRole !== "employee" && !isEmpleado) {
      return backendItems;
    }

    const merged = [...backendItems];

    // 1. Integrar respuestas de soporte no registradas en backend
    const reportes = soporteQuery.data?.results ?? [];
    for (const rep of reportes) {
      const hasReply = hasCompanySoporteReply(rep);
      if (!hasReply) continue;

      const alreadyInList = merged.some(
        (n) =>
          n.id === `soporte-${rep.id}` ||
          n.id === rep.id ||
          (n.kind === "support_replied" && n.href?.includes(rep.id)),
      );

      if (!alreadyInList) {
        const isUnread = isSoporteResponseUnread(rep.id, true, seenSoporteIds);
        merged.push({
          id: `soporte-${rep.id}`,
          kind: "support_replied",
          icon: MessageSquare,
          title: "Respuesta de soporte",
          description: rep.respuesta_empresa
            ? `${rep.empresa_nombre || "Tu empresa"}: ${rep.respuesta_empresa}`
            : "Tu empresa ha respondido a tu solicitud de soporte.",
          time: formatRelative(rep.respondido_en || rep.created_at),
          read: !isUnread,
          href: ROUTES.employee.soportes,
        });
      }
    }

    // 2. Integrar cambios de estado de adelantos
    const solicitudes = adelantosQuery.data ?? [];
    for (const sol of solicitudes) {
      const estado = sol.estado;
      if (
        estado !== "aprobado" &&
        estado !== "pagado" &&
        estado !== "rechazado"
      ) {
        continue;
      }

      const alreadyInList = merged.some(
        (n) =>
          n.id === `adelanto-${sol.id}-${estado}` ||
          n.id === sol.id ||
          n.href?.includes(sol.id),
      );

      if (!alreadyInList) {
        const title =
          estado === "aprobado"
            ? "Adelanto aprobado"
            : estado === "pagado"
              ? "Adelanto desembolsado"
              : "Adelanto rechazado";

        const icon =
          estado === "aprobado"
            ? CheckCircle2
            : estado === "pagado"
              ? Zap
              : XCircle;

        const description =
          estado === "aprobado"
            ? `Tu adelanto por $${Number(sol.monto_solicitado || 0).toLocaleString("es-CO")} ha sido aprobado.`
            : estado === "pagado"
              ? `Tu adelanto por $${Number(sol.monto_solicitado || 0).toLocaleString("es-CO")} ya fue transferido a tu cuenta.`
              : `Tu adelanto ha sido rechazado${sol.motivo_rechazo ? `: ${sol.motivo_rechazo}` : "."}`;

        merged.push({
          id: `adelanto-${sol.id}-${estado}`,
          kind:
            estado === "aprobado"
              ? "advance_approved"
              : estado === "pagado"
                ? "advance_paid"
                : "advance_rejected",
          icon,
          title,
          description,
          time: formatRelative(
            sol.pagado_en || sol.decidido_en || sol.updated_at || sol.created_at,
          ),
          read: true, // Las solicitudes ya aprobadas o históricas se marcan leídas salvo nueva transición
          href: ROUTES.employee.misAdelantos,
        });
      }
    }

    return merged;
  }, [
    listQuery.data?.items,
    soporteQuery.data?.results,
    adelantosQuery.data,
    appRole,
    isEmpleado,
    seenSoporteIds,
  ]);

  useNotificationSound(notifications, {
    enabled,
    isInitialLoadComplete: listQuery.isSuccess,
  });

  const unreadNotifications = useMemo(
    () => getUnreadNotifications(notifications),
    [notifications],
  );

  const unreadCount = unreadNotifications.length;

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
      if (id.startsWith("soporte-")) {
        const reporteId = id.replace("soporte-", "");
        setSeenSoporteIds(markSoporteResponseSeen(reporteId));
        return;
      }
      const target = notifications.find((item) => item.id === id);
      if (target?.read) return;
      markReadMutation.mutate([id]);
    },
    [notifications, markReadMutation],
  );

  const markAllAsRead = useCallback(() => {
    const unreadSoportes = notifications.filter(
      (n) => n.id.startsWith("soporte-") && !n.read,
    );
    for (const sup of unreadSoportes) {
      markSoporteResponseSeen(sup.id.replace("soporte-", ""));
    }
    setSeenSoporteIds(getSeenSoporteResponseIds());
    if (unreadCount > 0) {
      markAllMutation.mutate();
    }
  }, [notifications, unreadCount, markAllMutation]);

  const notificationsListPath =
    appRole === "employer"
      ? ROUTES.employer.notificaciones
      : ROUTES.employee.notificaciones;

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
