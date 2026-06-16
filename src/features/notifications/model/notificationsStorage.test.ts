import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  loadReadNotificationIds,
  saveReadNotificationIds,
  getInitialReadNotificationIds,
} from "./notificationsStorage";

describe("notificationsStorage", () => {
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

  it("carga ids leídos desde localStorage", () => {
    saveReadNotificationIds(new Set(["advance-processed", "next-payroll"]));

    expect(loadReadNotificationIds()).toEqual(
      new Set(["advance-processed", "next-payroll"]),
    );
  });

  it("retorna set vacío cuando no hay datos válidos", () => {
    localStorage.setItem("cerebiia:read-notification-ids", "invalid");

    expect(loadReadNotificationIds()).toEqual(new Set());
  });

  it("combina ids guardados con las notificaciones demo ya leídas", () => {
    saveReadNotificationIds(new Set(["advance-processed"]));

    expect(getInitialReadNotificationIds()).toEqual(
      new Set([
        "advance-processed",
        "limit-updated",
        "achievement-unlocked",
        "budget-reminder",
      ]),
    );
  });
});
