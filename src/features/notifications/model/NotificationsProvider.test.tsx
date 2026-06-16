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

  it("inicia con las notificaciones demo no leídas", () => {
    const { result } = renderNotificationsHook();

    expect(result.current.unreadCount).toBe(2);
    expect(result.current.unreadNotifications.map((item) => item.id)).toEqual([
      "advance-processed",
      "next-payroll",
    ]);
  });

  it("marca todas las notificaciones como leídas", () => {
    const { result } = renderNotificationsHook();

    act(() => {
      result.current.markAllAsRead();
    });

    expect(result.current.unreadCount).toBe(0);
    expect(result.current.notifications.every((item) => item.read)).toBe(true);
    expect(localStorage.getItem("cerebiia:read-notification-ids")).toContain(
      "advance-processed",
    );
  });

  it("marca una notificación individual como leída", () => {
    const { result } = renderNotificationsHook();

    act(() => {
      result.current.markAsRead("advance-processed");
    });

    expect(result.current.unreadCount).toBe(1);
    expect(
      result.current.notifications.find((item) => item.id === "advance-processed")
        ?.read,
    ).toBe(true);
  });
});
