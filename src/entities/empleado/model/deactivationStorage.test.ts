import { describe, expect, it, beforeEach, vi } from "vitest";
import type { EmpleadoDTO } from "@/shared/api/types";
import {
  applyLocalEmpleadoDeactivations,
  deactivateEmpleadoLocally,
  isEmpleadoLocallyDeactivated,
} from "./deactivationStorage";

const empleadoBase: EmpleadoDTO = {
  id: "emp-1",
  documento: "123456",
  nombre: "Ana Pérez",
  salario: "2000000.00",
  banco: "Bancolombia",
  numero_cuenta: "123",
  estado: "activo",
  empresa_id: "empresa-1",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("empleadoDeactivationStorage", () => {
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

  it("marca empleados como inactivos en el listado", () => {
    deactivateEmpleadoLocally("empresa-1", "emp-1");

    const result = applyLocalEmpleadoDeactivations([empleadoBase]);

    expect(result[0].estado).toBe("inactivo");
    expect(isEmpleadoLocallyDeactivated("empresa-1", "emp-1")).toBe(true);
  });
});
