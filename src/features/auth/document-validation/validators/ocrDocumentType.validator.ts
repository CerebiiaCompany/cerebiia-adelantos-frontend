import type { DocumentType } from "@/shared/validations/register.schema";
import type { DocumentTypeValidationResult } from "../types";
import { isDocumentNumberInOcrText, normalizeOcrDigits } from "../utils/ocrDigitUtils";
import { countKeywordMatches, normalizeOcrText } from "../utils/ocrNormalizer";

const MIN_KEYWORD_MATCHES = 2;

const DOCUMENT_KEYWORDS_FRONT: Record<DocumentType, string[]> = {
  CC: ["CEDULA DE CIUDADANIA", "IDENTIFICACION PERSONAL", "REPUBLICA DE COLOMBIA"],
  CE: ["CEDULA DE EXTRANJERIA", "MIGRACION COLOMBIA", "EXTRANJERIA"],
  PASSPORT: ["PASSPORT", "PASAPORTE", "P<"],
  PPT: ["PERMISO POR PROTECCION TEMPORAL", "PPT", "MIGRACION COLOMBIA"],
};

const DOCUMENT_KEYWORDS_BACK: Partial<Record<DocumentType, string[]>> = {
  CC: [
    "REGISTRADURIA",
    "FECHA DE NACIMIENTO",
    "INDICE DERECHO",
    "LUGAR DE NACIMIENTO",
  ],
  CE: [
    "REGISTRADURIA",
    "FECHA DE NACIMIENTO",
    "MIGRACION COLOMBIA",
    "EXTRANJERIA",
  ],
};

const DOCUMENT_TYPE_ERRORS: Record<DocumentType, string> = {
  CC: "El documento cargado no parece ser una Cédula de Ciudadanía.",
  CE: "El documento cargado no parece ser una Cédula de Extranjería.",
  PASSPORT: "El documento cargado no parece corresponder a un Pasaporte.",
  PPT: "El documento cargado no parece corresponder a un PPT.",
};

const DOCUMENT_NUMBER_PATTERNS: Record<DocumentType, RegExp> = {
  CC: /\d{6,10}/,
  CE: /\d{6,11}/,
  PASSPORT: /[A-Z0-9]{6,10}/,
  PPT: /\d{15}/,
};

export type DocumentSide = "front" | "back" | "single";

interface ValidateDocumentOptions {
  expectedDocumentNumber?: string;
  supplementalOcrText?: string;
  side?: DocumentSide;
  deferDocumentNumberCheck?: boolean;
}

function getKeywordsForSide(
  documentType: DocumentType,
  side: DocumentSide,
): string[] {
  if (side === "back") {
    return DOCUMENT_KEYWORDS_BACK[documentType] ?? DOCUMENT_KEYWORDS_FRONT[documentType];
  }

  return DOCUMENT_KEYWORDS_FRONT[documentType];
}

function scoreDocumentTypes(
  normalizedText: string,
  side: DocumentSide,
): Record<DocumentType, { matches: string[]; score: number }> {
  return {
    CC: scoreType("CC", normalizedText, side),
    CE: scoreType("CE", normalizedText, side),
    PASSPORT: scoreType("PASSPORT", normalizedText, side),
    PPT: scoreType("PPT", normalizedText, side),
  };
}

function scoreType(
  documentType: DocumentType,
  normalizedText: string,
  side: DocumentSide,
) {
  const matches = countKeywordMatches(
    normalizedText,
    getKeywordsForSide(documentType, side),
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

export function validateDocumentNumberInOcr(
  documentType: DocumentType,
  ocrText: string,
  expectedDocumentNumber?: string,
  supplementalOcrText?: string,
): boolean {
  const combinedText = [ocrText, supplementalOcrText].filter(Boolean).join("\n");

  if (expectedDocumentNumber) {
    if (isDocumentNumberInOcrText(combinedText, expectedDocumentNumber)) {
      return true;
    }
  }

  const normalizedDigits = normalizeOcrDigits(combinedText);
  return DOCUMENT_NUMBER_PATTERNS[documentType].test(normalizedDigits);
}

function documentNumberMatchesType(
  documentType: DocumentType,
  ocrText: string,
  expectedDocumentNumber?: string,
  supplementalOcrText?: string,
): boolean {
  return validateDocumentNumberInOcr(
    documentType,
    ocrText,
    expectedDocumentNumber,
    supplementalOcrText,
  );
}

export function validateDocumentByType(
  documentType: DocumentType,
  ocrText: string,
  expectedDocumentNumber?: string,
  options: Omit<ValidateDocumentOptions, "expectedDocumentNumber"> = {},
): DocumentTypeValidationResult {
  const {
    supplementalOcrText = "",
    side = "single",
    deferDocumentNumberCheck = false,
  } = options;

  const normalizedText = normalizeOcrText(ocrText);
  const scores = scoreDocumentTypes(normalizedText, side);
  const selected = scores[documentType];
  const detectedType = findBestDetectedType(scores);
  const errors: string[] = [];
  const keywords = getKeywordsForSide(documentType, side);

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

  const numberMatches = documentNumberMatchesType(
    documentType,
    ocrText,
    expectedDocumentNumber,
    supplementalOcrText,
  );

  if (selected.score >= MIN_KEYWORD_MATCHES && !numberMatches) {
    if (!deferDocumentNumberCheck) {
      errors.push(
        "No se pudo validar el número de documento dentro del archivo cargado.",
      );
    }
  }

  const confidence = Math.min(selected.score / keywords.length, 1);

  return {
    isValid: errors.length === 0 && selected.score >= MIN_KEYWORD_MATCHES,
    confidence,
    detectedType,
    matches: selected.matches,
    errors,
  };
}

export {
  DOCUMENT_KEYWORDS_FRONT as DOCUMENT_KEYWORDS,
  DOCUMENT_TYPE_ERRORS,
  MIN_KEYWORD_MATCHES,
};
