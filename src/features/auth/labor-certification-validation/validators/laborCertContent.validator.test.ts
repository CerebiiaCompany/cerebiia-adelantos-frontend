import { describe, expect, it } from "vitest";
import { validateLaborCertDocumentType } from "./laborCertContent.validator";
import {
  extractLaborCertFields,
  parseLaborCertDate,
  validateLaborCertFields,
} from "./laborCertFields.validator";
import { validateLaborCertValidity } from "./laborCertValidity.validator";
import { validateLaborCertAuthenticity } from "./laborCertAuthenticity.validator";

describe("validateLaborCertDocumentType", () => {
  it("aprueba certificaciones con palabras clave suficientes", () => {
    const result = validateLaborCertDocumentType(`
      CERTIFICACION LABORAL
      RECURSOS HUMANOS
      CERTIFICA QUE el empleado trabaja en la empresa
    `);

    expect(result.isValid).toBe(true);
    expect(result.matches.length).toBeGreaterThanOrEqual(2);
  });

  it("rechaza documentos sin palabras clave laborales", () => {
    const result = validateLaborCertDocumentType("FACTURA DE COMPRA NUMERO 123");

    expect(result.isValid).toBe(false);
    expect(result.errors[0]).toContain("certificación laboral");
  });
});

describe("validateLaborCertFields", () => {
  const context = {
    employeeFullName: "MARIA LOPEZ GOMEZ",
    companyName: "ACME COLOMBIA SAS",
  };

  it("extrae campos obligatorios desde OCR", () => {
    const ocrText = `
      CERTIFICACION LABORAL
      ACME COLOMBIA SAS certifica que MARIA LOPEZ GOMEZ
      desempeña el cargo de ANALISTA DE CALIDAD
      FECHA DE INGRESO: 01/03/2022
      FECHA DE EXPEDICION: 10/05/2026
    `;

    const result = validateLaborCertFields(ocrText, context);

    expect(result.isValid).toBe(true);
    expect(result.extractedData.employeeName).toBe(context.employeeFullName);
    expect(result.extractedData.companyName).toBe(context.companyName);
    expect(result.extractedData.jobTitle).toContain("ANALISTA");
    expect(result.extractedData.issueDate).toBe("10/05/2026");
  });

  it("falla cuando faltan campos obligatorios", () => {
    const result = validateLaborCertFields(
      "CERTIFICACION LABORAL RECURSOS HUMANOS",
      context,
    );

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("parseLaborCertDate", () => {
  it("parsea fechas numéricas", () => {
    const date = parseLaborCertDate("10/05/2026");
    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(4);
    expect(date?.getDate()).toBe(10);
  });
});

describe("validateLaborCertValidity", () => {
  it("rechaza fechas futuras", () => {
    const result = validateLaborCertValidity("01/01/2099", new Date("2026-06-13"));
    expect(result.isValid).toBe(false);
    expect(result.message).toContain("futura");
  });

  it("rechaza certificaciones vencidas", () => {
    const result = validateLaborCertValidity("01/01/2020", new Date("2026-06-13"));
    expect(result.isValid).toBe(false);
    expect(result.message).toContain("vigencia");
  });

  it("aprueba certificaciones recientes", () => {
    const result = validateLaborCertValidity("01/05/2026", new Date("2026-06-13"));
    expect(result.isValid).toBe(true);
  });
});

describe("validateLaborCertAuthenticity", () => {
  it("requiere revisión manual cuando faltan señales", () => {
    const result = validateLaborCertAuthenticity("CERTIFICACION LABORAL BASICA");
    expect(result.passed).toBe(false);
    expect(result.requiresManualReview).toBe(true);
  });

  it("aprueba autenticidad con señales suficientes", () => {
    const result = validateLaborCertAuthenticity(`
      CERTIFICACION LABORAL
      FIRMA DEL GERENTE
      SELLO DE LA EMPRESA
      NIT 900123456
    `);

    expect(result.passed).toBe(true);
    expect(result.requiresManualReview).toBe(false);
  });
});

describe("extractLaborCertFields", () => {
  it("identifica nombre parcial del empleado", () => {
    const extracted = extractLaborCertFields(
      "CERTIFICA QUE JUAN PEREZ RODRIGUEZ labora en EMPRESA XYZ",
      {
        employeeFullName: "JUAN CARLOS PEREZ RODRIGUEZ",
        companyName: "EMPRESA XYZ SAS",
      },
    );

    expect(extracted.employeeName).toBe("JUAN CARLOS PEREZ RODRIGUEZ");
    expect(extracted.companyName).toBe("EMPRESA XYZ SAS");
  });
});
