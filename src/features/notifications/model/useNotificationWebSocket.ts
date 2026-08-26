import { useEffect, useRef, useState } from "react";
import { env } from "@/shared/config/env";
import { unlockNotificationSound } from "@/shared/lib/notificationSound";

const RECONNECT_DELAYS_MS = [5_000, 10_000, 20_000, 40_000, 60_000] as const;
const MAX_CONSECUTIVE_FAILURES = 5;
const PAUSE_AFTER_MAX_FAILURES_MS = 60_000;

let activeSingletonSocket: WebSocket | null = null;

function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const parsed = JSON.parse(jsonPayload) as { exp?: number };
    if (typeof parsed.exp === "number") {
      return parsed.exp * 1000 <= Date.now();
    }
    return false;
  } catch {
    return false;
  }
}

export function buildNotificationsWebSocketUrl(accessToken: string): string {
  const token = encodeURIComponent(accessToken);

  if (import.meta.env.DEV || !env.apiUrl || env.apiUrl.startsWith("/")) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    return `${protocol}//${host}/ws/notificaciones/?token=${token}`;
  }

  const parsed = new URL(env.apiUrl);
  const wsProtocol = parsed.protocol === "https:" ? "wss:" : "ws:";
  const host = parsed.host;
  return `${wsProtocol}//${host}/ws/notificaciones/?token=${token}`;
}

interface UseNotificationWebSocketOptions {
  enabled: boolean;
  accessToken: string | null | undefined;
  onUpdated: () => void;
}

export function useNotificationWebSocket({
  enabled,
  accessToken,
  onUpdated,
}: UseNotificationWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const onUpdatedRef = useRef(onUpdated);
  onUpdatedRef.current = onUpdated;

  useEffect(() => {
    if (
      !enabled ||
      !accessToken ||
      isJwtExpired(accessToken) ||
      typeof WebSocket === "undefined"
    ) {
      setIsConnected(false);
      return;
    }

    let socket: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let reconnectAttempt = 0;
    let disposed = false;

    const clearReconnectTimer = () => {
      if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    const scheduleReconnect = () => {
      if (disposed) return;
      clearReconnectTimer();

      // Si el token expiró mientras estaba desconectado, no seguir intentando
      if (isJwtExpired(accessToken)) {
        setIsConnected(false);
        return;
      }

      // Backoff Exponencial espaciado: 5s, 10s, 20s, 40s, 60s
      const delay =
        reconnectAttempt >= MAX_CONSECUTIVE_FAILURES
          ? PAUSE_AFTER_MAX_FAILURES_MS
          : (RECONNECT_DELAYS_MS[reconnectAttempt] ?? 60_000);

      reconnectAttempt =
        reconnectAttempt >= MAX_CONSECUTIVE_FAILURES
          ? 0
          : reconnectAttempt + 1;

      reconnectTimer = setTimeout(connect, delay);
    };

    const connect = () => {
      if (disposed) return;
      clearReconnectTimer();

      if (isJwtExpired(accessToken)) {
        setIsConnected(false);
        return;
      }

      // Garantizar instancia única de WebSocket activa
      if (activeSingletonSocket) {
        activeSingletonSocket.onclose = null;
        activeSingletonSocket.onerror = null;
        activeSingletonSocket.close();
        activeSingletonSocket = null;
      }

      try {
        const url = buildNotificationsWebSocketUrl(accessToken);
        socket = new WebSocket(url);
        activeSingletonSocket = socket;

        socket.onopen = () => {
          if (disposed) {
            socket?.close();
            return;
          }
          reconnectAttempt = 0;
          setIsConnected(true);
          unlockNotificationSound();
        };

        socket.onmessage = (event) => {
          if (disposed) return;
          try {
            const data = JSON.parse(String(event.data)) as { type?: string };
            // Actualizar ÚNICAMENTE si el evento es notifications.updated
            if (
              data?.type === "notifications.updated" ||
              data?.type === "notification" ||
              data?.type === "notificacion"
            ) {
              onUpdatedRef.current();
            }
          } catch {
            // Ignorar frames no estructurados
          }
        };

        socket.onclose = (event) => {
          setIsConnected(false);
          if (activeSingletonSocket === socket) {
            activeSingletonSocket = null;
          }
          socket = null;

          if (disposed) return;

          // Si el token es inválido o no autorizado, detener reintentos
          if (event.code === 4401 || event.code === 4003) {
            return;
          }

          // Reintento silencioso espaciado sin recargar vistas
          scheduleReconnect();
        };

        socket.onerror = () => {
          // Manejo silencioso: cerrar socket sin registrar console.error
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close();
          }
        };
      } catch {
        scheduleReconnect();
      }
    };

    connect();

    return () => {
      disposed = true;
      clearReconnectTimer();
      setIsConnected(false);
      if (socket) {
        socket.onclose = null;
        socket.onerror = null;
        socket.close();
        if (activeSingletonSocket === socket) {
          activeSingletonSocket = null;
        }
        socket = null;
      }
    };
  }, [enabled, accessToken]);

  return { isConnected };
}


