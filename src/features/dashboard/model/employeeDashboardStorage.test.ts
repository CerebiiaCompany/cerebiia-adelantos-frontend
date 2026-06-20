import { describe, expect, it, beforeEach, vi } from "vitest";
import { recordEmployeeAdvance } from "./employeeDashboardStorage";
import { loadCompanyAdvances } from "@/entities/employer-audit";

describe("recordEmployeeAdvance", () => {
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

  it("crea una notificación al registrar un adelanto", () => {
    recordEmployeeAdvance("emp-42", 250000);

    const notifications = JSON.parse(
      localStorage.getItem("cerebiia:employee-notifications:emp-42") ?? "[]",
    );

    expect(notifications).toHaveLength(1);
    expect(notifications[0].title).toBe("Adelanto solicitado");
  });
});
