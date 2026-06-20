import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  appendAdvanceRequestedNotification,
  loadEmployeeNotifications,
  subscribeEmployeeNotifications,
} from "./storage";
import { buildAdvanceRequestedNotification } from "./types";

describe("employeeNotificationsStorage", () => {
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

  it("buildAdvanceRequestedNotification incluye monto formateado", () => {
    const notification = buildAdvanceRequestedNotification(500000);

    expect(notification.kind).toBe("advance_requested");
    expect(notification.title).toBe("Adelanto solicitado");
    expect(notification.description).toContain("$500.000");
    expect(notification.id).toMatch(/^advance-\d+$/);
  });

  it("appendAdvanceRequestedNotification persiste y carga notificaciones", () => {
    appendAdvanceRequestedNotification("emp-1", 300000);

    const loaded = loadEmployeeNotifications("emp-1");

    expect(loaded).toHaveLength(1);
    expect(loaded[0].kind).toBe("advance_requested");
    expect(loaded[0].description).toContain("$300.000");
  });

  it("notifica a suscriptores cuando se agrega una notificación", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeEmployeeNotifications(listener);

    appendAdvanceRequestedNotification("emp-1", 100000);

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
