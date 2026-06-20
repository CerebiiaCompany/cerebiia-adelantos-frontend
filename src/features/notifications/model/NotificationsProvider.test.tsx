import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { appendAdvanceRequestedNotification } from "@/entities/notification";
import { buildDemoEmpleadoSession } from "@/shared/api/authMappers";
import {
  NotificationsProvider,
  useNotifications,
} from "./NotificationsProvider";

const useAuthMock = vi.fn();

vi.mock("@/features/auth/model/AuthProvider", () => ({
  useAuth: () => useAuthMock(),
}));

function renderNotificationsHook() {
  return renderHook(() => useNotifications(), {
    wrapper: ({ children }) => (
      <NotificationsProvider>{children}</NotificationsProvider>
    ),
  });
}

describe("NotificationsProvider", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return this.store[key] ?? null;
      },
      setItem(key: string, value: string) {
        this.store[key] = value;
      },
      removeItem(key: string) {
        delete this.store[key];
      },
      clear() {
        this.store = {};
      },
    });

    useAuthMock.mockReturnValue({
      session: null,
      isLoading: false,
    });
  });

  it("inicia sin notificaciones para cuentas nuevas", () => {
    const { result } = renderNotificationsHook();

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.unreadNotifications).toEqual([]);
  });

  it("carga notificaciones del empleado logueado", () => {
    const session = buildDemoEmpleadoSession();
    useAuthMock.mockReturnValue({ session, isLoading: false });

    appendAdvanceRequestedNotification(session.empleado.id, 400000);

    const { result } = renderNotificationsHook();

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].title).toBe("Adelanto solicitado");
    expect(result.current.notifications[0].description).toContain("$400.000");
    expect(result.current.unreadCount).toBe(1);
  });

  it("markAllAsRead marca todas las notificaciones como leídas", () => {
    const session = buildDemoEmpleadoSession();
    useAuthMock.mockReturnValue({ session, isLoading: false });
    appendAdvanceRequestedNotification(session.empleado.id, 200000);

    const { result } = renderNotificationsHook();

    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications[0].read).toBe(true);
  });

  it("persiste ids leídos aunque aún no haya notificaciones", () => {
    const { result } = renderNotificationsHook();

    act(() => {
      result.current.markAsRead("future-notification");
    });

    expect(result.current.unreadCount).toBe(0);
    expect(localStorage.getItem("cerebiia:read-notification-ids")).toContain(
      "future-notification",
    );
  });
});
