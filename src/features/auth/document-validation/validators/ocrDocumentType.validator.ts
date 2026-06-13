import type { DocumentType } from "@/shared/validations/register.schema";
import type { DocumentTypeValidationResult } from "../types";
import { countKeywordMatches, normalizeOcrText } from "../utils/ocrNormalizer";

const MIN_KEYWORD_MATCHES = 2;

const DOCUMENT_KEYWORDS: Record<DocumentType, string[]> = {
  CC: ["CEDULA DE CIUDADANIA", "IDENTIFICACION PERSONAL", "REPUBLICA DE COLOMBIA"],
  CE: ["CEDULA DE EXTRANJERIA", "MIGRACION COLOMBIA", "EXTRANJERIA"],
  PASSPORT: ["PASSPORT", "PASAPORTE", "P<"],
  PPT: ["PERMISO POR PROTECCION TEMPORAL", "PPT", "MIGRACION COLOMBIA"],
};

const DOCUMENT_TYPE_ERRORS: Record<DocumentType, string> = {
  CC: "El documento cargado no parece ser una Cédula de Ciudadanía.",
  CE: "El documento cargado no parece ser una Cédula de Extranjería.",
  PASSPORT: "El documento cargado no parece corresponder a un Pasaporte.",
  PPT: "El documento cargado no parece corresponder a un PPT.",
};

const DOCUMENT_NUMBER_PATTERNS: Record<DocumentType, RegExp> = {
  CC: /\b\d{6,10}\b/,
  CE: /\b\d{6,11}\b/,
  PASSPORT: /\b[A-Z0-9]{6,10}\b/,
  PPT: /\b\d{15}\b/,
};

function scoreDocumentTypes(
  normalizedText: string,
): Record<DocumentType, { matches: string[]; score: number }> {
  return {
    CC: scoreType("CC", normalizedText),
    CE: scoreType("CE", normalizedText),
    PASSPORT: scoreType("PASSPORT", normalizedText),
    PPT: scoreType("PPT", normalizedText),
  };
}

function scoreType(documentType: DocumentType, normalizedText: string) {
  const matches = countKeywordMatches(
    normalizedText,
    DOCUMENT_KEYWORDS[documentType],
  );
  return { matches, score: matches.length };
}

function findBestDetectedType(
  scores: Record<DocumentType, { matches: string[]; score: number }>,
): DocumentType | undefined {
  const ranked = (Object.entries(scores) as Array<
    [DocumentType, { matches: string[]; score: number }]
  >)
    .filter(([, value]) => value.score >= MIN_KEYWORD_MATCHES)
    .sort((a, b) => b[1].score - a[1].score);

  return ranked[0]?.[0];
}

function documentNumberMatchesType(
  documentType: DocumentType,
  normalizedText: string,
  expectedDocumentNumber?: string,
): boolean {
  if (expectedDocumentNumber) {
    const normalizedExpected = normalizeOcrText(expectedDocumentNumber).replace(
      /\s+/g,
      "",
    );
    const compactText = normalizedText.replace(/\s+/g, "");
    if (compactText.includes(normalizedExpected)) {
      return true;
    }
  }

  return DOCUMENT_NUMBER_PATTERNS[documentType].test(normalizedText);
}

export function validateDocumentByType(
  documentType: DocumentType,
  ocrText: string,
  expectedDocumentNumber?: string,
): DocumentTypeValidationResult {
  const normalizedText = normalizeOcrText(ocrText);
  const scores = scoreDocumentTypes(normalizedText);
  const selected = scores[documentType];
  const detectedType = findBestDetectedType(scores);
  const errors: string[] = [];

  if (selected.score < MIN_KEYWORD_MATCHES) {
    errors.push(DOCUMENT_TYPE_ERRORS[documentType]);
  }

  if (
    detectedType &&
    detectedType !== documentType &&
    scores[detectedType].score >= MIN_KEYWORD_MATCHES
  ) {
    errors.push(
      "El documento cargado no coincide con el tipo de documento seleccionado.",
    );
  }

  if (
    selected.score >= MIN_KEYWORD_MATCHES &&
    !documentNumberMatchesType(documentType, normalizedText, expectedDocumentNumber)
  ) {
    errors.push(
      "No se pudo validar el número de documento dentro del archivo cargado.",
    );
  }

  const confidence = Math.min(selected.score / DOCUMENT_KEYWORDS[documentType].length, 1);

  return {
    isValid: errors.length === 0 && selected.score >= MIN_KEYWORD_MATCHES,
    confidence,
    detectedType,
    matches: selected.matches,
    errors,
  };
}

export { DOCUMENT_KEYWORDS, DOCUMENT_TYPE_ERRORS, MIN_KEYWORD_MATCHES };
