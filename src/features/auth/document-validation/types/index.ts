import type { DocumentType } from "@/shared/validations/register.schema";

export type ValidationCheckId =
  | "format"
  | "size"
  | "resolution"
  | "sharpness"
  | "brightness"
  | "coverage"
  | "ocr"
  | "documentType";

export interface ValidationCheckItem {
  id: ValidationCheckId;
  label: string;
  passed: boolean;
  message?: string;
}

export type SideValidationStatus = "idle" | "analyzing" | "complete";

export interface SideValidationState {
  status: SideValidationStatus;
  progress: number;
  progressMessage: string;
  checks: ValidationCheckItem[];
  isValid: boolean;
  ocrText: string;
}

export interface DocumentTypeValidationResult {
  isValid: boolean;
  confidence: number;
  detectedType?: DocumentType;
  matches: string[];
  errors: string[];
}

export interface ImageQualityResult {
  resolution: { passed: boolean; message?: string; width: number; height: number };
  sharpness: { passed: boolean; message?: string; score: number };
  brightness: { passed: boolean; message?: string; mean: number };
  coverage: { passed: boolean; message?: string; ratio: number };
}

export interface OCRResult {
  text: string;
  confidence: number;
  sufficientText: boolean;
}

export const INITIAL_SIDE_VALIDATION: SideValidationState = {
  status: "idle",
  progress: 0,
  progressMessage: "",
  checks: [],
  isValid: false,
  ocrText: "",
};

export const CHECK_LABELS: Record<ValidationCheckId, string> = {
  format: "Formato válido",
  size: "Tamaño válido",
  resolution: "Resolución válida",
  sharpness: "Imagen nítida",
  brightness: "Brillo correcto",
  coverage: "Documento completo en imagen",
  ocr: "OCR detectado",
  documentType: "Documento identificado correctamente",
};
