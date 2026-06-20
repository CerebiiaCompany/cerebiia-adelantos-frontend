// ⚠️ AGNOSTIC — map payroll rows to create-empleado payloads

import {
  EMPLEADO_ACCOUNT_TYPE_OPTIONS,
  EMPLEADO_CONTRACT_TYPE_OPTIONS,
  EMPLEADO_DOCUMENT_TYPE_OPTIONS,
  EMPLEADO_FINANCIAL_INSTITUTION_GROUPS,
} from "@/shared/constants/empleadoFormCatalogs";
import type { CreateEmpleadoRequest } from "@/shared/api/types";
import {
  createEmpleadoSchema,
  type CreateEmpleadoFormValues,
} from "@/shared/validations/empleado.schema";
import { normalizeSalaryInput } from "@/shared/lib/currency";
import {
  resolveEmpleadoImportField,
  type EmpleadoImportField,
} from "./empleadoImportHeaders";

export interface EmpleadoImportRowError {
  rowNumber: number;
  message: string;
}

export interface EmpleadoImportParseResult {
  valid: CreateEmpleadoRequest[];
  errors: EmpleadoImportRowError[];
}

const FINANCIAL_INSTITUTION_LABELS = EMPLEADO_FINANCIAL_INSTITUTION_GROUPS.flatMap(
  (group) => group.options,
);

function normalizeLookupValue(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mapDocumentType(value: string): string {
  const normalized = normalizeLookupValue(value);
  const aliases: Record<string, string> = {
    cc: "CC",
    cedula: "CC",
    ceduladeciudadania: "CC",
    pasaporte: "PASSPORT",
    passport: "PASSPORT",
    ce: "CE",
    ceduladeextranjeria: "CE",
    ppt: "PPT",
    permisoporprotecciontemporal: "PPT",
  };

  if (aliases[normalized]) return aliases[normalized];

  const match = EMPLEADO_DOCUMENT_TYPE_OPTIONS.find(
    (option) =>
      option.value === value.trim().toUpperCase() ||
      normalizeLookupValue(option.label) === normalized,
  );

  return match?.value ?? value.trim().toUpperCase();
}

function mapContractType(value: string): string {
  const normalized = normalizeLookupValue(value);
  const aliases: Record<string, string> = {
    indefinido: "indefinido",
    terminoindefinido: "indefinido",
    fijo: "fijo",
    terminofijo: "fijo",
    obraelabor: "obra_labor",
    obraolabor: "obra_labor",
  };

  if (aliases[normalized]) return aliases[normalized];

  const match = EMPLEADO_CONTRACT_TYPE_OPTIONS.find(
    (option) =>
      option.value === normalized ||
      normalizeLookupValue(option.label) === normalized,
  );

  return match?.value ?? value.trim().toLowerCase();
}

function mapAccountType(value: string): string {
  const normalized = normalizeLookupValue(value);
  const aliases: Record<string, string> = {
    ahorros: "ahorros",
    ahorro: "ahorros",
    corriente: "corriente",
  };

  if (aliases[normalized]) return aliases[normalized];

  const match = EMPLEADO_ACCOUNT_TYPE_OPTIONS.find(
    (option) =>
      option.value === normalized ||
      normalizeLookupValue(option.label) === normalized,
  );

  return match?.value ?? value.trim().toLowerCase();
}

function mapBank(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const normalized = normalizeLookupValue(trimmed);
  const match = FINANCIAL_INSTITUTION_LABELS.find(
    (option) =>
      option.value === trimmed ||
      normalizeLookupValue(option.label) === normalized ||
      normalizeLookupValue(option.value) === normalized,
  );

  return match?.value ?? trimmed;
}

function parseImportDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const slashMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, "0");
    const month = slashMatch[2].padStart(2, "0");
    const year = slashMatch[3];
    return `${year}-${month}-${day}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return trimmed;
}

function matrixToRecords(matrix: string[][]): Record<EmpleadoImportField, string>[] {
  if (matrix.length < 2) return [];

  const [headerRow, ...dataRows] = matrix;
  const fieldIndexes = new Map<EmpleadoImportField, number>();

  headerRow.forEach((header, index) => {
    const field = resolveEmpleadoImportField(header);
    if (field) {
      fieldIndexes.set(field, index);
    }
  });

  return dataRows
    .filter((row) => row.some((cell) => cell.trim().length > 0))
    .map((row) => {
      const record = {} as Record<EmpleadoImportField, string>;

      fieldIndexes.forEach((columnIndex, field) => {
        record[field] = row[columnIndex] ?? "";
      });

      return record;
    });
}

function normalizeImportRecord(
  record: Record<EmpleadoImportField, string>,
): CreateEmpleadoFormValues {
  return {
    tipo_documento: mapDocumentType(record.tipo_documento ?? ""),
    documento: (record.documento ?? "").trim(),
    nombre: (record.nombre ?? "").trim(),
    correo: (record.correo ?? "").trim(),
    celular: (record.celular ?? "").trim(),
    salario: normalizeSalaryInput(record.salario ?? ""),
    tipo_contrato: mapContractType(record.tipo_contrato ?? ""),
    fecha_ingreso: parseImportDate(record.fecha_ingreso ?? ""),
    banco: mapBank(record.banco ?? ""),
    tipo_cuenta: mapAccountType(record.tipo_cuenta ?? ""),
    numero_cuenta: (record.numero_cuenta ?? "").trim(),
  };
}

export function mapEmpleadoImportMatrix(
  matrix: string[][],
): EmpleadoImportParseResult {
  const records = matrixToRecords(matrix);
  const valid: CreateEmpleadoRequest[] = [];
  const errors: EmpleadoImportRowError[] = [];

  if (records.length === 0) {
    return {
      valid,
      errors: [
        {
          rowNumber: 0,
          message:
            "No se encontraron filas válidas. Verifica los encabezados del archivo.",
        },
      ],
    };
  }

  records.forEach((record, index) => {
    const rowNumber = index + 2;
    const normalized = normalizeImportRecord(record);
    const parsed = createEmpleadoSchema.safeParse(normalized);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const fieldName = String(firstIssue.path[0] ?? "campo");
      errors.push({
        rowNumber,
        message: `Fila ${rowNumber}: ${firstIssue.message} (${fieldName})`,
      });
      return;
    }

    valid.push({
      ...parsed.data,
      salario: Number(parsed.data.salario).toFixed(2),
    });
  });

  return { valid, errors };
}
