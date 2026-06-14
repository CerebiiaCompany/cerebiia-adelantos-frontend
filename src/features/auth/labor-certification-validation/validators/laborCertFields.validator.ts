import { normalizeOcrText } from "@/features/auth/document-validation/utils/ocrNormalizer";
import type { ExtractedLaborCertData } from "../types";

const MONTHS: Record<string, number> = {
  ENERO: 1,
  FEBRERO: 2,
  MARZO: 3,
  ABRIL: 4,
  MAYO: 5,
  JUNIO: 6,
  JULIO: 7,
  AGOSTO: 8,
  SEPTIEMBRE: 9,
  OCTUBRE: 10,
  NOVIEMBRE: 11,
  DICIEMBRE: 12,
};

const ISSUE_DATE_PATTERNS = [
  /FECHA DE EXPEDICION[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
  /EXPEDID[OA][\s\S]{0,20}?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
  /EXPEDID[OA] EL[\s:]*(\d{1,2}\s+DE\s+[A-Z]+\s+DE\s+\d{4})/i,
];

const START_DATE_PATTERNS = [
  /FECHA DE INGRESO[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
  /VINCULAD[OA][\s\S]{0,20}?DESDE[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
  /INICIO DE CONTRATO[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
];

const JOB_TITLE_PATTERNS = [
  /CARGO[\s:]*([A-Z0-9\s,.-]{3,80})/i,
  /DESPENIA EL CARGO DE[\s:]*([A-Z0-9\s,.-]{3,80})/i,
  /COMO[\s:]*([A-Z0-9\s,.-]{3,80})/i,
  /OCUPACION[\s:]*([A-Z0-9\s,.-]{3,80})/i,
];

interface LaborCertContext {
  employeeFullName: string;
  companyName: string;
}

export interface LaborCertFieldsValidationResult {
  isValid: boolean;
  confidence: number;
  extractedData: ExtractedLaborCertData;
  errors: string[];
}

function normalizeName(value: string): string {
  return normalizeOcrText(value).replace(/\s+/g, " ").trim();
}

function nameAppearsInText(fullName: string, normalizedText: string): boolean {
  const normalizedName = normalizeName(fullName);
  if (!normalizedName) return false;

  if (normalizedText.includes(normalizedName)) return true;

  const parts = normalizedName.split(" ").filter((part) => part.length > 2);
  if (parts.length < 2) return false;

  const matchedParts = parts.filter((part) => normalizedText.includes(part));
  return matchedParts.length >= Math.min(2, parts.length);
}

function companyAppearsInText(
  companyName: string,
  normalizedText: string,
): boolean {
  const normalizedCompany = normalizeName(companyName);
  if (!normalizedCompany) return false;

  if (normalizedText.includes(normalizedCompany)) return true;

  const significantWords = normalizedCompany
    .split(" ")
    .filter((word) => word.length > 3);

  if (significantWords.length === 0) return false;

  const matchedWords = significantWords.filter((word) =>
    normalizedText.includes(word),
  );

  return matchedWords.length >= Math.ceil(significantWords.length * 0.6);
}

function extractFirstMatch(patterns: RegExp[], text: string): string | undefined {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

function extractFallbackDate(text: string): string | undefined {
  const numericMatch = text.match(/\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\b/);
  return numericMatch?.[1];
}

export function parseLaborCertDate(value: string): Date | null {
  const trimmed = value.trim();

  const rawNumericMatch = trimmed.match(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/,
  );
  if (rawNumericMatch) {
    return buildDate(
      Number(rawNumericMatch[3]),
      Number(rawNumericMatch[2]),
      Number(rawNumericMatch[1]),
    );
  }

  const normalized = normalizeOcrText(trimmed);

  const spacedNumericMatch = normalized.match(
    /^(\d{1,2})\s+(\d{1,2})\s+(\d{4})$/,
  );
  if (spacedNumericMatch) {
    return buildDate(
      Number(spacedNumericMatch[3]),
      Number(spacedNumericMatch[2]),
      Number(spacedNumericMatch[1]),
    );
  }

  const textMatch = normalized.match(
    /^(\d{1,2})\s+DE\s+([A-Z]+)\s+DE\s+(\d{4})$/,
  );
  if (textMatch) {
    const day = Number(textMatch[1]);
    const month = MONTHS[textMatch[2]];
    const year = Number(textMatch[3]);
    if (!month) return null;
    return buildDate(year, month, day);
  }

  return null;
}

function buildDate(year: number, month: number, day: number): Date | null {
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export function extractLaborCertFields(
  ocrText: string,
  context: LaborCertContext,
): ExtractedLaborCertData {
  const normalizedText = normalizeOcrText(ocrText);
  const rawText = ocrText.replace(/\s+/g, " ");

  const employeeName = nameAppearsInText(context.employeeFullName, normalizedText)
    ? context.employeeFullName
    : undefined;

  const companyName = companyAppearsInText(context.companyName, normalizedText)
    ? context.companyName
    : undefined;

  const jobTitle = extractFirstMatch(JOB_TITLE_PATTERNS, rawText)
    ?.replace(/\s+(EN|DE|LA|EL|Y)\s*$/i, "")
    .trim();

  const issueDate =
    extractFirstMatch(ISSUE_DATE_PATTERNS, rawText) ??
    extractFallbackDate(rawText);

  const startDate = extractFirstMatch(START_DATE_PATTERNS, rawText);

  return {
    employeeName,
    companyName,
    jobTitle,
    startDate,
    issueDate,
  };
}

export function validateLaborCertFields(
  ocrText: string,
  context: LaborCertContext,
): LaborCertFieldsValidationResult {
  const extractedData = extractLaborCertFields(ocrText, context);
  const errors: string[] = [];

  if (!extractedData.employeeName) {
    errors.push("No identificamos el nombre del empleado en el documento.");
  }

  if (!extractedData.companyName) {
    errors.push("No identificamos el nombre de la empresa en el documento.");
  }

  if (!extractedData.jobTitle) {
    errors.push("No identificamos el cargo desempeñado.");
  }

  if (!extractedData.issueDate) {
    errors.push("No identificamos la fecha de expedición.");
  }

  const foundFields = [
    extractedData.employeeName,
    extractedData.companyName,
    extractedData.jobTitle,
    extractedData.issueDate,
  ].filter(Boolean).length;

  return {
    isValid: errors.length === 0,
    confidence: foundFields / 4,
    extractedData,
    errors,
  };
}
