import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { buildDemoEmpleadoSession } from "@/shared/api/authMappers";
import {
  NotificationsProvider,
  useNotifications,
} from "./NotificationsProvider";

const useAuthMock = vi.fn();
const listMeMock = vi.fn();
const marcarLeidasMock = vi.fn();
const marcarTodasMock = vi.fn();

vi.mock("@/features/auth/model/AuthProvider", () => ({
  useAuth: () => useAuthMock(),
}));

vi.mock("@/shared/config/env", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/shared/config/env")>();
  return {
    ...actual,
    env: { ...actual.env, apiUrl: "http://localhost:8000/api/v1" },
  };
});

vi.mock("@/shared/api/endpoints", () => ({
  notificacionesEndpoints: {
    listMe: (...args: unknown[]) => listMeMock(...args),
    marcarLeidas: (...args: unknown[]) => marcarLeidasMock(...args),
    marcarTodasLeidas: (...args: unknown[]) => marcarTodasMock(...args),
  },
}));

vi.mock("./useNotificationWebSocket", () => ({
  useNotificationWebSocket: () => ({ isConnected: false }),
}));

vi.mock("./useNotificationSound", () => ({
  useNotificationSound: () => undefined,
}));

function renderNotificationsHook() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const hook = renderHook(() => useNotifications(), {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <NotificationsProvider>{children}</NotificationsProvider>
      </QueryClientProvider>
    ),
  });

  return { ...hook, queryClient };
}

describe("NotificationsProvider (API)", () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({
      session: null,
      isLoading: false,
    });
    listMeMock.mockReset();
    marcarLeidasMock.mockReset();
    marcarTodasMock.mockReset();
  });

  it("sin sesión no consulta y lista vacía", async () => {
    const { result } = renderNotificationsHook();
    expect(result.current.notifications).toEqual([]);
    expect(listMeMock).not.toHaveBeenCalled();
  });

  it("carga notificaciones del empleado desde la API", async () => {
    const session = buildDemoEmpleadoSession();
    useAuthMock.mockReturnValue({ session, isLoading: false });
    listMeMock.mockResolvedValue({
      unread_count: 1,
      items: [
        {
          id: "n1",
          recipient_tipo: "empleado",
          recipient_id: session.empleado.id,
          kind: "advance_paid",
          title: "Adelanto pagado",
          description: "Tu adelanto fue transferido.",
          href: "/mis-adelantos",
          dedupe_key: "advance-paid:1",
          leida: false,
          created_at: "2026-01-10T12:00:00.000Z",
        },
      ],
    });

    const { result } = renderNotificationsHook();

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });
    expect(result.current.notifications[0].title).toBe("Adelanto pagado");
    expect(result.current.unreadCount).toBe(1);
  });

  it("marca como leída de forma optimista y llama a la API", async () => {
    const session = buildDemoEmpleadoSession();
    useAuthMock.mockReturnValue({ session, isLoading: false });
    const unreadPayload = {
      unread_count: 1,
      items: [
        {
          id: "n1",
          recipient_tipo: "empleado",
          recipient_id: session.empleado.id,
          kind: "advance_paid",
          title: "Adelanto pagado",
          description: "Tu adelanto fue transferido.",
          href: "/mis-adelantos",
          dedupe_key: "advance-paid:1",
          leida: false,
          created_at: "2026-01-10T12:00:00.000Z",
        },
      ],
    };

    listMeMock.mockResolvedValue(unreadPayload);
    marcarLeidasMock.mockReturnValue(new Promise(() => {}));

    const { result } = renderNotificationsHook();

    await waitFor(() => {
      expect(result.current.notifications).toHaveLength(1);
    });

    act(() => {
      result.current.markAsRead("n1");
    });

    await waitFor(() => {
      expect(result.current.notifications[0].read).toBe(true);
      expect(result.current.unreadCount).toBe(0);
      expect(marcarLeidasMock).toHaveBeenCalledWith({ ids: ["n1"] });
    });
  });
});
