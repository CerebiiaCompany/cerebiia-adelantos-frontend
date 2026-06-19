import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  NotificationsProvider,
  useNotifications,
} from "./NotificationsProvider";

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
  });

  it("inicia sin notificaciones para cuentas nuevas", () => {
    const { result } = renderNotificationsHook();

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.unreadNotifications).toEqual([]);
  });

  it("markAllAsRead no falla cuando no hay notificaciones", () => {
    const { result } = renderNotificationsHook();

    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications).toEqual([]);
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
