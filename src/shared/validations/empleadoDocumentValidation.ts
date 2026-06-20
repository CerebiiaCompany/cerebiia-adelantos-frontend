// ⚠️ AGNOSTIC — validación de documentos para alta de empleados (PILA / Migración Colombia)

import type { DocumentType } from "./register.schema";

/**
 * Reglas alineadas con nómina y backend:
 * - CC / CE: solo dígitos
 * - PASSPORT: solo dígitos (reporte PILA y sistemas de nómina)
 * - PPT: 1 a 8 dígitos, sin ceros a la izquierda artificiales
 */
export const EMPLEADO_DOCUMENT_PATTERNS: Record<DocumentType, RegExp> = {
  CC: /^\d{6,10}$/,
  PASSPORT: /^\d{6,10}$/,
  CE: /^\d{6,11}$/,
  PPT: /^\d{1,8}$/,
};

export function getEmpleadoDocumentMaxLength(type: DocumentType): number {
  switch (type) {
    case "CC":
    case "PASSPORT":
      return 10;
    case "CE":
      return 11;
    case "PPT":
      return 8;
  }
}

export function normalizeEmpleadoDocumentNumber(
  type: DocumentType,
  value: string,
): string {
  const digits = value.replace(/\D/g, "");

  if (type === "PPT") {
    const withoutLeadingZeros = digits.replace(/^0+/, "") || "";
    return withoutLeadingZeros;
  }

  return digits.slice(0, getEmpleadoDocumentMaxLength(type));
}

export function isValidEmpleadoDocumentNumber(
  type: DocumentType,
  number: string,
): boolean {
  const trimmed = number.trim();
  if (!trimmed) return false;

  const pattern = EMPLEADO_DOCUMENT_PATTERNS[type];
  if (!pattern) return false;

  return pattern.test(trimmed);
}
