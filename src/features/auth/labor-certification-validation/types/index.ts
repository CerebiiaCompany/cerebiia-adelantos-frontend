export type LaborCertValidationStatus = "approved" | "review" | "rejected";

export type LaborCertCheckId =
  | "format"
  | "size"
  | "resolution"
  | "sharpness"
  | "brightness"
  | "coverage"
  | "ocr"
  | "documentType"
  | "requiredFields"
  | "validity"
  | "authenticity";

export interface LaborCertCheckItem {
  id: LaborCertCheckId;
  label: string;
  passed: boolean;
  message?: string;
  tone?: "default" | "warning";
}

export type LaborCertValidationPhase = "idle" | "analyzing" | "complete";

export interface ExtractedLaborCertData {
  employeeName?: string;
  companyName?: string;
  jobTitle?: string;
  startDate?: string;
  issueDate?: string;
}

export interface LaborCertValidationState {
  phase: LaborCertValidationPhase;
  progress: number;
  progressMessage: string;
  checks: LaborCertCheckItem[];
  status: LaborCertValidationStatus | null;
  reason: string;
  confidence: number;
  extractedData: ExtractedLaborCertData;
  requiresManualReview: boolean;
  canContinue: boolean;
  ocrText: string;
}

export interface LaborCertValidationResult {
  status: LaborCertValidationStatus;
  reason: string;
  confidence: number;
  extractedData: ExtractedLaborCertData;
  requiresManualReview: boolean;
  checks: LaborCertCheckItem[];
  canContinue: boolean;
  ocrText: string;
}

export const INITIAL_LABOR_CERT_VALIDATION: LaborCertValidationState = {
  phase: "idle",
  progress: 0,
  progressMessage: "",
  checks: [],
  status: null,
  reason: "",
  confidence: 0,
  extractedData: {},
  requiresManualReview: false,
  canContinue: false,
  ocrText: "",
};

export const CHECK_LABELS: Record<LaborCertCheckId, string> = {
  format: "Formato válido",
  size: "Tamaño válido",
  resolution: "Resolución válida",
  sharpness: "Imagen nítida",
  brightness: "Brillo correcto",
  coverage: "Documento completo",
  ocr: "Texto legible",
  documentType: "Certificación laboral",
  requiredFields: "Información laboral",
  validity: "Vigencia del documento",
  authenticity: "Señales de autenticidad",
};
