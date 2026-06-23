import { describe, expect, it } from "vitest";
import { resolveEmpleadoCompanyName } from "./empleadoBankingDisplay";

describe("resolveEmpleadoCompanyName", () => {
  it("prioriza empresa_nombre del endpoint /empleados/me/", () => {
    expect(
      resolveEmpleadoCompanyName(
        {
          empleado_id: "1",
          nombre: "Ana",
          salario: "1500000.00",
          empresa_id: "66934514-a477-4090-893c-cc328a91afe3",
          empresa_nombre: "Cerebiia SAS",
          porcentaje_maximo_adelanto: "30.00",
          monto_maximo_adelanto: "450000.00",
          documento: "123",
          banco_nombre: "Nequi",
          numero_cuenta: "1",
          tipo_cuenta: "ahorros",
          fecha_ingreso: "2024-06-01",
        },
        { company: "66934514-a477-4090-893c-cc328a91afe3" },
      ),
    ).toBe("Cerebiia SAS");
  });

  it("usa empresa anidada si no hay empresa_nombre plano", () => {
    expect(
      resolveEmpleadoCompanyName({
        empleado_id: "1",
        nombre: "Ana",
        salario: "1500000.00",
        empresa_id: "emp-1",
        empresa: {
          id: "emp-1",
          razon_social: "Distribuidora Andina S.A.S.",
        },
        porcentaje_maximo_adelanto: "30.00",
        monto_maximo_adelanto: "450000.00",
        documento: "123",
        banco_nombre: "Nequi",
        numero_cuenta: "1",
        tipo_cuenta: "ahorros",
        fecha_ingreso: "2024-06-01",
      }),
    ).toBe("Distribuidora Andina S.A.S.");
  });

  it("evita mostrar el UUID de empresa como nombre", () => {
    expect(
      resolveEmpleadoCompanyName(undefined, {
        company: "66934514-a477-4090-893c-cc328a91afe3",
      }),
    ).toBe("—");
  });
});
