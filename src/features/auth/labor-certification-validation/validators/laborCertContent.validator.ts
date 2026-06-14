import {
  LABOR_CERT_KEYWORDS,
  MIN_LABOR_CERT_KEYWORD_MATCHES,
} from "../constants";
import {
  countKeywordMatches,
  normalizeOcrText,
} from "@/features/auth/document-validation/utils/ocrNormalizer";

export interface LaborCertTypeValidationResult {
  isValid: boolean;
  confidence: number;
  matches: string[];
  errors: string[];
}

export function validateLaborCertDocumentType(
  ocrText: string,
): LaborCertTypeValidationResult {
  const normalizedText = normalizeOcrText(ocrText);
  const matches = countKeywordMatches(normalizedText, [...LABOR_CERT_KEYWORDS]);
  const errors: string[] = [];

  if (matches.length < MIN_LABOR_CERT_KEYWORD_MATCHES) {
    errors.push(
      "El documento no parece ser una certificación laboral. Verifica el archivo cargado.",
    );
  }

  const confidence = Math.min(
    matches.length / MIN_LABOR_CERT_KEYWORD_MATCHES,
    1,
  );

  return {
    isValid: matches.length >= MIN_LABOR_CERT_KEYWORD_MATCHES,
    confidence,
    matches,
    errors,
  };
}
