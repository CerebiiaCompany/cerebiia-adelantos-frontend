import {
  AUTHENTICITY_KEYWORDS,
  MIN_AUTHENTICITY_SIGNALS,
} from "../constants";
import {
  countKeywordMatches,
  normalizeOcrText,
} from "@/features/auth/document-validation/utils/ocrNormalizer";

export interface LaborCertAuthenticityResult {
  passed: boolean;
  requiresManualReview: boolean;
  signalCount: number;
  signals: string[];
  message?: string;
}

export function validateLaborCertAuthenticity(
  ocrText: string,
): LaborCertAuthenticityResult {
  const normalizedText = normalizeOcrText(ocrText);
  const signals = countKeywordMatches(normalizedText, [...AUTHENTICITY_KEYWORDS]);
  const signalCount = signals.length;
  const passed = signalCount >= MIN_AUTHENTICITY_SIGNALS;

  return {
    passed,
    requiresManualReview: !passed,
    signalCount,
    signals,
    message: passed
      ? undefined
      : "No detectamos suficientes señales de autenticidad (firma, sello, membrete u otros).",
  };
}
