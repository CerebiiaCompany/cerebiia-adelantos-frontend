import { describe, expect, it } from "vitest";
import { mapEmpleadoImportMatrix } from "./mapEmpleadoImportRows";
import { parseCsvText } from "./parseCsvText";

describe("empleadoImport", () => {
  it("mapea filas CSV válidas al esquema de creación", () => {
    const matrix = parseCsvText(`tipo_documento,documento,nombre,correo,celular,salario,tipo_contrato,fecha_ingreso,banco,tipo_cuenta,numero_cuenta
CC,1005026054,Melanny Yilyan Guate Restrepo,empleado@empresa.com,3001234567,1700000,indefinido,2026-01-15,nequi,ahorros,3001234567`);

    const { valid, errors } = mapEmpleadoImportMatrix(matrix);

    expect(errors).toHaveLength(0);
    expect(valid).toHaveLength(1);
    expect(valid[0].documento).toBe("1005026054");
    expect(valid[0].salario).toBe("1700000.00");
    expect(valid[0].banco).toBe("Nequi");
  });
});
