import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import * as XLSX from "xlsx";
import { createEmpleadoSchema } from "@/shared/validations/empleado.schema";
import {
  buildEmpleadoImportTemplateBuffer,
  buildEmpleadoImportTemplateMatrix,
  EMPLEADO_IMPORT_BLANK_ROW_COUNT,
  EMPLEADO_IMPORT_TEMPLATE_HEADERS,
  getEmpleadoImportListSheetName,
} from "./empleadoImportTemplate";
import { EMPLEADO_IMPORT_BACKEND_HEADERS } from "./empleadoImportHeaders";
import { buildBackendNominaUploadMatrix } from "./prepareEmpleadoImportFileForUpload";
import {
  EMPLEADO_IMPORT_FECHA_INGRESO_PLACEHOLDER,
} from "./empleadoImportCatalogs";
import { mapEmpleadoImportMatrix } from "./mapEmpleadoImportRows";
import { parseCsvText } from "./parseCsvText";

const FECHA_INGRESO_COLUMN_INDEX = EMPLEADO_IMPORT_TEMPLATE_HEADERS.indexOf(
  "Fecha de ingreso",
);

describe("empleadoImport", () => {
  it("genera plantilla solo con encabezados humanizados y filas en blanco", () => {
    const matrix = buildEmpleadoImportTemplateMatrix();

    expect(matrix[0]).toEqual([...EMPLEADO_IMPORT_TEMPLATE_HEADERS]);
    expect(matrix).toHaveLength(1 + EMPLEADO_IMPORT_BLANK_ROW_COUNT);
    expect(matrix[0]).toContain("Correo electrónico");
    expect(matrix[0][0]).toBe("Tipo de documento");
    expect(matrix[0]).not.toContain("tipo_documento");
    expect(matrix[0]).not.toContain("correo");
    expect(
      matrix[1].every(
        (cell, index) =>
          cell === "" ||
          (index === FECHA_INGRESO_COLUMN_INDEX &&
            cell === EMPLEADO_IMPORT_FECHA_INGRESO_PLACEHOLDER),
      ),
    ).toBe(true);
  });

  it("no importa filas vacías de la plantilla en blanco", () => {
    const { valid, errors } = mapEmpleadoImportMatrix(
      buildEmpleadoImportTemplateMatrix(),
    );

    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it("genera plantilla Excel corporativa descargable sin datos de ejemplo", async () => {
    const buffer = await buildEmpleadoImportTemplateBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const nominaSheet = workbook.Sheets.Nomina ?? workbook.Sheets[workbook.SheetNames[0]];

    expect(workbook.SheetNames).toContain("Nomina");
    expect(workbook.SheetNames).toContain("Instrucciones");

    const rows = XLSX.utils.sheet_to_json<string[]>(nominaSheet, {
      header: 1,
      defval: "",
    });

    expect(rows[0]?.slice(0, EMPLEADO_IMPORT_TEMPLATE_HEADERS.length)).toEqual([
      ...EMPLEADO_IMPORT_TEMPLATE_HEADERS,
    ]);
    expect(rows.length).toBe(1 + EMPLEADO_IMPORT_BLANK_ROW_COUNT);
    expect(
      rows[1]
        ?.slice(0, EMPLEADO_IMPORT_TEMPLATE_HEADERS.length)
        .every(
          (cell, index) =>
            cell === "" ||
            (index === FECHA_INGRESO_COLUMN_INDEX &&
              cell === EMPLEADO_IMPORT_FECHA_INGRESO_PLACEHOLDER),
        ),
    ).toBe(true);
  });

  it("incluye hoja Listas oculta y validaciones en columnas de catálogo", async () => {
    const buffer = await buildEmpleadoImportTemplateBuffer({
      bancos: ["Bancolombia", "Nequi"],
    });
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const listas = workbook.getWorksheet(getEmpleadoImportListSheetName());
    expect(listas).toBeDefined();
    expect(listas?.state).toBe("hidden");
    expect(listas?.getCell(1, 1).value).toBe("Bancolombia");
    expect(listas?.getCell(2, 1).value).toBe("Nequi");
    expect(listas?.getCell(1, 2).value).toBe("cc");

    const nomina = workbook.getWorksheet("Nomina");
    expect(nomina?.dataValidations?.model?.A2?.type).toBe("list");
    expect(nomina?.dataValidations?.model?.G2?.type).toBe("list");
    expect(nomina?.dataValidations?.model?.I2?.type).toBe("list");
    expect(nomina?.dataValidations?.model?.J2?.type).toBe("list");
    // Desplegables apuntan a columnas ocultas de la misma hoja (compat. Excel Online).
    expect(nomina?.dataValidations?.model?.A2?.formulae?.[0]).toBe("$AO$1:$AO$4");
    expect(nomina?.dataValidations?.model?.J2?.formulae?.[0]).toBe("$AQ$1:$AQ$2");
    expect(nomina?.dataValidations?.model?.I2?.formulae?.[0]).toBe("$AN$1:$AN$2");
    expect(nomina?.getColumn(40).hidden).toBe(true);
    expect(nomina?.getCell(1, 40).value).toBe("Bancolombia");
    expect(nomina?.getCell(1, 43).value).toBe("ahorros");
    expect(nomina?.getCell(2, 8).value).toBe(
      EMPLEADO_IMPORT_FECHA_INGRESO_PLACEHOLDER,
    );
  });

  it("mapea filas CSV válidas con encabezados humanizados al esquema de creación", () => {
    const matrix = parseCsvText(`${EMPLEADO_IMPORT_TEMPLATE_HEADERS.join(",")}
cc,1005026054,Melanny Yilyan Guate Restrepo,empleado@empresa.com,3001234567,1700000,indefinido,2026-01-15,Nequi,ahorros,3001234567`);

    const { valid, errors } = mapEmpleadoImportMatrix(matrix);

    expect(errors).toHaveLength(0);
    expect(valid).toHaveLength(1);
    expect(valid[0].data.documento).toBe("1005026054");
    expect(valid[0].data.salario).toBe("1700000.00");
    expect(valid[0].data.banco_id).toBe("Nequi");
    expect(valid[0].data.correo).toBe("empleado@empresa.com");
  });

  it("acepta alias correo en CSV legacy", () => {
    const matrix = parseCsvText(`tipo_documento,documento,nombre,correo,celular,salario,tipo_contrato,fecha_ingreso,banco,tipo_cuenta,numero_cuenta
cc,1005026054,Melanny Guate,empleado@empresa.com,3001234567,1700000,indefinido,2026-01-15,Nequi,ahorros,3001234567`);

    const { valid, errors } = mapEmpleadoImportMatrix(matrix);

    expect(errors).toHaveLength(0);
    expect(valid).toHaveLength(1);
  });

  it("mapea pas a PASSPORT con documento numérico", () => {
    const matrix = parseCsvText(`tipo_documento,documento,nombre,email,celular,salario,tipo_contrato,fecha_ingreso,banco,tipo_cuenta,numero_cuenta
pas,98765432,Maria Silva,maria.silva@empresa.com,3209876543,3800000,fijo,2024-08-15,Davivienda,corriente,9876543210`);

    const { valid, errors } = mapEmpleadoImportMatrix(matrix);

    expect(errors).toHaveLength(0);
    expect(valid).toHaveLength(1);
    expect(valid[0].data.tipo_documento).toBe("PASSPORT");
    expect(valid[0].data.banco_id).toBe("Davivienda");
  });

  it("resuelve alias de banco en minúsculas", () => {
    const matrix = parseCsvText(`tipo_documento,documento,nombre,email,celular,salario,tipo_contrato,fecha_ingreso,banco,tipo_cuenta,numero_cuenta
cc,10142345,Ana Gomez,ana.gomez@empresa.com,3005554433,4200000,indefinido,2023-11-01,bogota,ahorros,456789123`);

    const { valid, errors } = mapEmpleadoImportMatrix(matrix);

    expect(errors).toHaveLength(0);
    expect(valid[0].data.banco_id).toBe("Banco de Bogotá");
  });

  it("resuelve alias BBVA al nombre exacto del backend", () => {
    const matrix = parseCsvText(`tipo_documento,documento,nombre,email,celular,salario,tipo_contrato,fecha_ingreso,banco,tipo_cuenta,numero_cuenta
cc,10142345,Ana Gomez,ana.gomez@empresa.com,3005554433,4200000,indefinido,2023-11-01,BBVA,ahorros,456789123`);

    const { valid, errors } = mapEmpleadoImportMatrix(matrix);

    expect(errors).toHaveLength(0);
    expect(valid[0].data.banco_id).toBe("BBVA Colombia");
  });

  it("normaliza documento y celular con sufijo .0 de Excel", () => {
    const matrix = parseCsvText(`tipo_documento,documento,nombre,email,celular,salario,tipo_contrato,fecha_ingreso,banco,tipo_cuenta,numero_cuenta
cc,1014261059.0,Ana Gomez,ana.gomez@empresa.com,3112938473.0,4200000,indefinido,2023-11-01,Nequi,ahorros,456789123`);

    const { valid, errors } = mapEmpleadoImportMatrix(matrix);

    expect(errors).toHaveLength(0);
    expect(valid[0].data.documento).toBe("1014261059");
    expect(valid[0].data.celular).toBe("3112938473");
  });

  it("reporta error por fila cuando el documento es inválido", () => {
    const matrix = parseCsvText(`tipo_documento,documento,nombre,email,celular,salario,tipo_contrato,fecha_ingreso,banco,tipo_cuenta,numero_cuenta
ppt,123456789,Carlos Mendoza,carlos.mendoza@empresa.com,3154561230,1500000,obra_labor,2025-02-10,nequi,ahorros,3154561230`);

    const { valid, errors } = mapEmpleadoImportMatrix(matrix);

    expect(valid).toHaveLength(0);
    expect(errors).toHaveLength(1);
    expect(errors[0].kind).toBe("validation");
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
      banco_id: "Bancolombia",
      tipo_cuenta: "ahorros",
      numero_cuenta: "12345678901",
    });

    expect(parsed.success).toBe(false);
  });

  it("reordena columnas al formato backend para upload legacy", () => {
    const sourceMatrix = [
      [
        "banco",
        "tipo_documento",
        "nombre",
        "documento",
        "email",
        "celular",
        "salario",
        "tipo_contrato",
        "fecha_ingreso",
        "tipo_cuenta",
        "numero_cuenta",
      ],
      [
        "Bancolombia",
        "cc",
        "Ana María Restrepo",
        "1002345678",
        "ana@empresa.com",
        "3001234567",
        "2500000",
        "fijo",
        "2024-01-15",
        "ahorros",
        "12345678901",
      ],
    ];

    const uploadMatrix = buildBackendNominaUploadMatrix(sourceMatrix);

    expect(uploadMatrix[0]).toEqual([...EMPLEADO_IMPORT_BACKEND_HEADERS]);
    expect(uploadMatrix[1]?.[1]).toBe("1002345678");
    expect(uploadMatrix[1]?.[3]).toBe("ana@empresa.com");
    expect(uploadMatrix).toHaveLength(2);
  });

  it("aplica formato de miles a la columna Salario mensual", async () => {
    const buffer = await buildEmpleadoImportTemplateBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const nomina = workbook.getWorksheet("Nomina");
    const salarioColIndex =
      EMPLEADO_IMPORT_TEMPLATE_HEADERS.indexOf("Salario mensual") + 1;

    expect(nomina?.getColumn(salarioColIndex).numFmt).toBe("#,##0");
    expect(nomina?.getCell(2, salarioColIndex).numFmt).toBe("#,##0");
  });

  it("normaliza salario con separadores de miles al preparar upload", () => {
    const sourceMatrix = [
      [...EMPLEADO_IMPORT_TEMPLATE_HEADERS],
      [
        "cc",
        "1002345678",
        "Ana María Restrepo",
        "ana@empresa.com",
        "3001234567",
        "2.500.000",
        "fijo",
        "2024-01-15",
        "Bancolombia",
        "ahorros",
        "12345678901",
      ],
    ];

    const uploadMatrix = buildBackendNominaUploadMatrix(sourceMatrix);

    expect(uploadMatrix[1]?.[5]).toBe("2500000");
  });

  it("normaliza salario en-US (2,000,000) sin tratarlo como decimal", () => {
    const sourceMatrix = [
      [...EMPLEADO_IMPORT_TEMPLATE_HEADERS],
      [
        "cc",
        "1002345678",
        "Ana María Restrepo",
        "ana@empresa.com",
        "3001234567",
        "2,000,000",
        "fijo",
        "2024-01-15",
        "Bancolombia",
        "ahorros",
        "12345678901",
      ],
    ];

    const uploadMatrix = buildBackendNominaUploadMatrix(sourceMatrix);

    expect(uploadMatrix[1]?.[5]).toBe("2000000");
  });

  it("convierte encabezados humanizados a snake_case del backend al subir", () => {
    const sourceMatrix = [
      [...EMPLEADO_IMPORT_TEMPLATE_HEADERS],
      [
        "cc",
        "1002345678",
        "Ana María Restrepo",
        "ana@empresa.com",
        "3001234567",
        "2500000",
        "fijo",
        "2024-01-15",
        "Bancolombia",
        "ahorros",
        "12345678901",
      ],
    ];

    const uploadMatrix = buildBackendNominaUploadMatrix(sourceMatrix);

    expect(uploadMatrix[0]).toEqual([...EMPLEADO_IMPORT_BACKEND_HEADERS]);
    expect(uploadMatrix[0]).toContain("tipo_documento");
    expect(uploadMatrix[0]).not.toContain("Tipo de documento");
    expect(uploadMatrix[1]?.[0]).toBe("cc");
    expect(uploadMatrix[1]?.[3]).toBe("ana@empresa.com");
    expect(uploadMatrix[1]?.[8]).toBe("Bancolombia");
  });
});
