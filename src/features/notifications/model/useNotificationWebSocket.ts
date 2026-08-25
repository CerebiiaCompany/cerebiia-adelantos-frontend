import { useEffect, useRef, useState } from "react";
import { env } from "@/shared/config/env";
import { unlockNotificationSound } from "@/shared/lib/notificationSound";

const RECONNECT_BASE_MS = 2_000;
const RECONNECT_MAX_MS = 30_000;
const MAX_CONSECUTIVE_FAILURES = 5;

function buildNotificationsWebSocketUrl(accessToken: string): string {
  const token = encodeURIComponent(accessToken);

  if (import.meta.env.DEV || env.apiUrl.startsWith("/")) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${window.location.host}/ws/notificaciones/?token=${token}`;
  }

  const parsed = new URL(env.apiUrl);
  const wsProtocol = parsed.protocol === "https:" ? "wss:" : "ws:";
  return `${wsProtocol}//${parsed.host}/ws/notificaciones/?token=${token}`;
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
    if (!enabled || !accessToken || typeof WebSocket === "undefined") {
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

      // Si falla repetidamente (ej: backend 500), pausar reintentos a intervalos de 30s
      const delay =
        reconnectAttempt >= MAX_CONSECUTIVE_FAILURES
          ? RECONNECT_MAX_MS
          : Math.min(
              RECONNECT_BASE_MS * 2 ** reconnectAttempt,
              RECONNECT_MAX_MS,
            );

      reconnectAttempt += 1;
      reconnectTimer = setTimeout(connect, delay);
    };

    const connect = () => {
      if (disposed) return;
      clearReconnectTimer();

      const url = buildNotificationsWebSocketUrl(accessToken);
      socket = new WebSocket(url);

      socket.onopen = () => {
        reconnectAttempt = 0;
        setIsConnected(true);
        unlockNotificationSound();
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(String(event.data)) as { type?: string };
          // Solo refrescar notificaciones si el evento es notifications.updated o similar
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
        socket = null;

        // Si el token es inválido o no autorizado, no reintentar
        if (event.code === 4401 || event.code === 4003) {
          console.warn("WebSocket no autorizado. No se reintentará.");
          return;
        }

        scheduleReconnect();
      };

      socket.onerror = () => {
        socket?.close();
      };
    };

    connect();

    return () => {
      disposed = true;
      clearReconnectTimer();
      setIsConnected(false);
      socket?.close();
    };
  }, [enabled, accessToken]);

  return { isConnected };
}
