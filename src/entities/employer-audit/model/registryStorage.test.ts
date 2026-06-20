import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  loadCompanyAdvances,
  registerCompanyAdvance,
  subscribeCompanyAdvances,
} from "./registryStorage";

describe("companyAdvanceRegistry", () => {
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

  it("registra adelantos con máximo 3 cuotas", () => {
    const record = registerCompanyAdvance({
      empresaId: "empresa-1",
      employeeId: "emp-1",
      employeeName: "Ana Pérez",
      employeeDocument: "123",
      baseSalary: 2_000_000,
      advancedAmount: 300_000,
      installments: 5,
    });

    expect(record.installments).toBe(3);
    expect(loadCompanyAdvances("empresa-1")).toHaveLength(1);
  });

  it("calcula comisión y neto desembolsado", () => {
    const record = registerCompanyAdvance({
      empresaId: "empresa-1",
      employeeId: "emp-1",
      employeeName: "Ana Pérez",
      employeeDocument: "123",
      baseSalary: 2_000_000,
      advancedAmount: 400_000,
      installments: 2,
    });

    expect(record.feeAmount).toBe(10_000);
    expect(record.netDisbursedAmount).toBe(390_000);
  });

  it("notifica suscriptores al registrar", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeCompanyAdvances(listener);

    registerCompanyAdvance({
      empresaId: "empresa-1",
      employeeId: "emp-1",
      employeeName: "Ana Pérez",
      employeeDocument: "123",
      baseSalary: 2_000_000,
      advancedAmount: 200_000,
      installments: 1,
    });

    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
