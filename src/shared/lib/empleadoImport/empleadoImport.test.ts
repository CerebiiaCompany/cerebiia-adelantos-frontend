import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { createEmpleadoSchema } from "@/shared/validations/empleado.schema";
import { buildEmpleadoImportTemplateMatrix } from "./empleadoImportTemplate";
import { mapEmpleadoImportMatrix } from "./mapEmpleadoImportRows";
import { parseCsvText } from "./parseCsvText";

describe("empleadoImport", () => {
  it("genera plantilla Excel con encabezados y 4 filas de ejemplo", () => {
    const matrix = buildEmpleadoImportTemplateMatrix();
    const sheet = XLSX.utils.aoa_to_sheet(matrix);
    const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1");

    expect(range.e.r + 1).toBe(5);
    expect(range.e.c + 1).toBe(11);
  });

  it("valida las 4 filas de la plantilla de ejemplo sin errores", () => {
    const matrix = buildEmpleadoImportTemplateMatrix();
    const { valid, errors } = mapEmpleadoImportMatrix(matrix);

    expect(errors).toHaveLength(0);
    expect(valid).toHaveLength(4);
    expect(valid.map((row) => row.data.tipo_documento)).toEqual([
      "CC",
      "PASSPORT",
      "CE",
      "PPT",
    ]);
    expect(valid[3].data.documento).toBe("4561230");
  });

  it("mapea filas CSV válidas al esquema de creación", () => {
    const matrix = parseCsvText(`tipo_documento,documento,nombre,correo,celular,salario,tipo_contrato,fecha_ingreso,banco,tipo_cuenta,numero_cuenta
CC,1005026054,Melanny Yilyan Guate Restrepo,empleado@empresa.com,3001234567,1700000,indefinido,2026-01-15,nequi,ahorros,3001234567`);

    const { valid, errors } = mapEmpleadoImportMatrix(matrix);

    expect(errors).toHaveLength(0);
    expect(valid).toHaveLength(1);
    expect(valid[0].data.documento).toBe("1005026054");
    expect(valid[0].data.salario).toBe("1700000.00");
    expect(valid[0].data.banco).toBe("Nequi");
  });

  it("mapea PAS a PASSPORT con documento numérico", () => {
    const matrix = parseCsvText(`tipo_documento,documento,nombre,correo,celular,salario,tipo_contrato,fecha_ingreso,banco,tipo_cuenta,numero_cuenta
PAS,98765432,Maria Silva,maria.silva@empresa.com,3209876543,3800000,fijo,2024-08-15,davivienda,corriente,9876543210`);

    expect(() => mapEmpleadoImportMatrix(matrix)).not.toThrow();

    const { valid, errors } = mapEmpleadoImportMatrix(matrix);

    expect(errors).toHaveLength(0);
    expect(valid).toHaveLength(1);
    expect(valid[0].data.tipo_documento).toBe("PASSPORT");
    expect(valid[0].data.banco).toBe("Davivienda");
  });

  it("resuelve alias de banco en minúsculas", () => {
    const matrix = parseCsvText(`tipo_documento,documento,nombre,correo,celular,salario,tipo_contrato,fecha_ingreso,banco,tipo_cuenta,numero_cuenta
CC,10142345,Ana Gomez,ana.gomez@empresa.com,3005554433,4200000,indefinido,2023-11-01,bogota,ahorros,456789123`);

    const { valid, errors } = mapEmpleadoImportMatrix(matrix);

    expect(errors).toHaveLength(0);
    expect(valid[0].data.banco).toBe("Banco de Bogotá");
  });

  it("normaliza PPT con ceros de relleno provenientes de PILA", () => {
    const matrix = parseCsvText(`tipo_documento,documento,nombre,correo,celular,salario,tipo_contrato,fecha_ingreso,banco,tipo_cuenta,numero_cuenta
PPT,0000004561230,Carlos Mendoza,carlos.mendoza@empresa.com,3154561230,1500000,obra_labor,2025-02-10,nequi,ahorros,3154561230`);

    const { valid, errors } = mapEmpleadoImportMatrix(matrix);

    expect(errors).toHaveLength(0);
    expect(valid).toHaveLength(1);
    expect(valid[0].data.documento).toBe("4561230");
  });

  it("reporta error por fila cuando el PPT supera 8 dígitos", () => {
    const matrix = parseCsvText(`tipo_documento,documento,nombre,correo,celular,salario,tipo_contrato,fecha_ingreso,banco,tipo_cuenta,numero_cuenta
PPT,123456789,Carlos Mendoza,carlos.mendoza@empresa.com,3154561230,1500000,obra_labor,2025-02-10,nequi,ahorros,3154561230`);

    expect(() => mapEmpleadoImportMatrix(matrix)).not.toThrow();

    const { valid, errors } = mapEmpleadoImportMatrix(matrix);

    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].kind).toBe("validation");
    expect(errors[0].message).toContain("documento");
  });

  it("no lanza error con tipo de documento inválido en el esquema", () => {
    const parsed = createEmpleadoSchema.safeParse({
      tipo_documento: "PAS",
      documento: "987654",
      nombre: "Test",
      correo: "test@empresa.com",
      celular: "3101234567",
      salario: "2500000",
      tipo_contrato: "indefinido",
      fecha_ingreso: "2025-03-01",
      banco: "Bancolombia",
      tipo_cuenta: "ahorros",
      numero_cuenta: "12345678901",
    });

    expect(parsed.success).toBe(false);
  });
});
