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

  it("registra un adelanto en las métricas del empleado", () => {
    const result = recordEmployeeAdvance("emp-42", 250000);

    const saved = JSON.parse(
      localStorage.getItem("cerebiia:employee-dashboard:emp-42") ?? "{}",
    );

    expect(result.totalAdvancedThisMonth).toBe(250000);
    expect(saved.totalAdvancedThisMonth).toBe(250000);
    expect(saved.activity).toHaveLength(1);
  });
});
