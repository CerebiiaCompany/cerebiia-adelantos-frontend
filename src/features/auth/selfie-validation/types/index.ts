export type SelfieValidationCheckId =
  | "quality"
  | "faceCount"
  | "facePosition"
  | "documentInHand"
  | "security"
  | "biometrics"
  | "liveness";

export interface SelfieValidationCheckItem {
  id: SelfieValidationCheckId;
  label: string;
  passed: boolean;
  message?: string;
  tone?: "default" | "warning";
}

export type SelfieValidationPhase =
  | "idle"
  | "initializing"
  | "camera"
  | "validating"
  | "complete";

export interface SelfieValidationState {
  phase: SelfieValidationPhase;
  progress: number;
  progressMessage: string;
  checks: SelfieValidationCheckItem[];
  isValid: boolean;
}

export interface SelfieValidationResult {
  checks: SelfieValidationCheckItem[];
  isValid: boolean;
  livenessPassed: boolean;
}

export const INITIAL_SELFIE_VALIDATION: SelfieValidationState = {
  phase: "idle",
  progress: 0,
  progressMessage: "",
  checks: [],
  isValid: false,
};

export const CHECK_LABELS: Record<SelfieValidationCheckId, string> = {
  quality: "Calidad de imagen",
  faceCount: "Rostro detectado",
  facePosition: "Rostro centrado",
  documentInHand: "Documento visible en la foto",
  security: "Autenticidad básica",
  biometrics: "Validación biométrica",
  liveness: "Prueba de vida",
};
