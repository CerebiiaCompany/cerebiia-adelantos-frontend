import { describe, expect, it } from "vitest";
import { resolveEmpleadoFechaIngreso } from "./resolveEmpleadoFechaIngreso";

describe("resolveEmpleadoFechaIngreso", () => {
  it("prioriza la fecha de ingreso del endpoint /empleados/me/", () => {
    expect(
      resolveEmpleadoFechaIngreso(
        {
          empleado_id: "1",
          nombre: "Ana",
          salario: "1500000.00",
          empresa_id: "emp",
          porcentaje_maximo_adelanto: "30.00",
          monto_maximo_adelanto: "450000.00",
          documento: "123",
          banco_nombre: "Nequi",
          numero_cuenta: "1",
          tipo_cuenta: "ahorros",
          fecha_ingreso: "2024-06-01",
        },
        { fecha_ingreso: "2023-01-01" },
      ),
    ).toBe("2024-06-01");
  });

  it("usa la fecha de ingreso de la sesión si la API no la tiene", () => {
    expect(
      resolveEmpleadoFechaIngreso(undefined, { fecha_ingreso: "2023-01-01" }),
    ).toBe("2023-01-01");
  });

  it("retorna undefined si no hay fecha de ingreso", () => {
    expect(resolveEmpleadoFechaIngreso(undefined, {})).toBeUndefined();
  });
});
