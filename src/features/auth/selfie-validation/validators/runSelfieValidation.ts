import { getSelfieValidationTimeoutMs } from "../constants";
import type {
  SelfieValidationCheckItem,
  SelfieValidationResult,
} from "../types";
import { CHECK_LABELS } from "../types";
import { withTimeout, yieldToMainThread } from "@/features/auth/document-validation/utils/asyncUtils";
import { warmupOcrEngine } from "@/features/auth/document-validation/utils/ocrEngine";
import {
  validateBiometrics,
  validateFacePosition,
} from "../utils/biometricChecks";
import type { BiometricCheckResult } from "../utils/biometricChecks";
import {
  classifySelfieFaces,
  validateDocumentInHand,
} from "../utils/documentInHandHeuristics";
import {
  detectFacesForSelfieValidation,
  warmupFaceEngine,
} from "../utils/faceEngine";
import { evaluateLiveness } from "../utils/livenessHeuristics";
import type { SelfieCaptureMode } from "../utils/captureDevice";
import { prepareSelfieAnalysisCanvas } from "../utils/prepareSelfieAnalysisCanvas";
import { analyzeSelfieQuality } from "../utils/selfieQuality";
import { detectSecurityIssues } from "../utils/securityHeuristics";

interface RunSelfieValidationParams {
  selfieCanvas: HTMLCanvasElement;
  previousFrame: ImageData | null;
  captureMode: SelfieCaptureMode;
  onProgress?: (progress: number, message: string) => void;
}

function buildCheck(
  id: SelfieValidationCheckItem["id"],
  passed: boolean,
  message?: string,
  tone?: SelfieValidationCheckItem["tone"],
): SelfieValidationCheckItem {
  return {
    id,
    label: CHECK_LABELS[id],
    passed,
    message,
    tone,
  };
}

function buildPostureCheck(
  id: SelfieValidationCheckItem["id"],
  result: BiometricCheckResult,
): SelfieValidationCheckItem {
  return buildCheck(
    id,
    result.passed,
    result.message,
    result.tone ?? (result.passed ? "default" : undefined),
  );
}

export async function runSelfieValidation({
  selfieCanvas,
  previousFrame,
  captureMode,
  onProgress,
}: RunSelfieValidationParams): Promise<SelfieValidationResult> {
  const checks: SelfieValidationCheckItem[] = [];

  onProgress?.(0.05, "Optimizando imagen...");
  await yieldToMainThread();
  const analysisCanvas = prepareSelfieAnalysisCanvas(selfieCanvas);

  onProgress?.(0.08, "Verificando imagen...");
  const quality = analyzeSelfieQuality(analysisCanvas);

  checks.push(
    buildCheck(
      "quality",
      quality.blockingPassed,
      quality.blockingPassed
        ? quality.advisoryMessage
        : quality.blockingMessage,
      quality.blockingPassed && quality.advisoryMessage ? "warning" : "default",
    ),
  );

  if (!quality.blockingPassed) {
    return { checks, isValid: false, livenessPassed: false };
  }

  onProgress?.(0.14, "Cargando modelos de validación...");
  await Promise.all([warmupFaceEngine(), warmupOcrEngine()]);
  await yieldToMainThread();

  onProgress?.(0.22, "Detectando rostro...");
  const selfieFaces = await detectFacesForSelfieValidation(analysisCanvas);
  const faceClassification = classifySelfieFaces(selfieFaces);

  if (faceClassification.error) {
    checks.push(buildCheck("faceCount", false, faceClassification.error));
    return { checks, isValid: false, livenessPassed: false };
  }

  checks.push(
    buildCheck(
      "faceCount",
      true,
      faceClassification.secondary
        ? "Rostro detectado con documento visible"
        : "Rostro detectado correctamente",
    ),
  );

  const selfieFace = faceClassification.primary;

  onProgress?.(0.38, "Verificando postura...");
  const position = validateFacePosition(
    selfieFace,
    analysisCanvas.width,
    analysisCanvas.height,
  );
  checks.push(buildPostureCheck("facePosition", position));

  if (!position.passed) {
    return { checks, isValid: false, livenessPassed: false };
  }

  onProgress?.(0.48, "Verificando documento en mano...");
  await yieldToMainThread();
  const documentInHand = await validateDocumentInHand(
    analysisCanvas,
    selfieFace,
    faceClassification.secondary,
  );
  checks.push(
    buildCheck("documentInHand", documentInHand.passed, documentInHand.message),
  );

  if (!documentInHand.passed) {
    return { checks, isValid: false, livenessPassed: false };
  }

  onProgress?.(0.58, "Revisando autenticidad...");
  const security = detectSecurityIssues(analysisCanvas);
  checks.push(
    buildCheck(
      "security",
      true,
      security.passed
        ? undefined
        : `${security.message} (continuamos con la verificación facial)`,
      security.passed ? "default" : "warning",
    ),
  );

  onProgress?.(0.72, "Analizando rostro...");
  const biometrics = validateBiometrics(selfieFace);
  checks.push(buildPostureCheck("biometrics", biometrics));

  if (!biometrics.passed) {
    return { checks, isValid: false, livenessPassed: false };
  }

  onProgress?.(0.86, "Verificando captura...");
  const currentFrame = analysisCanvas
    .getContext("2d")
    ?.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height);

  const liveness = evaluateLiveness(
    previousFrame,
    currentFrame ?? new ImageData(1, 1),
    captureMode,
  );

  checks.push(
    buildCheck(
      "liveness",
      true,
      liveness.passed ? undefined : liveness.message,
      liveness.passed ? "default" : "warning",
    ),
  );

  onProgress?.(1, "Validación completada");

  return {
    checks,
    isValid: true,
    livenessPassed: liveness.passed,
  };
}

export function runSelfieValidationWithTimeout(
  params: RunSelfieValidationParams,
): Promise<SelfieValidationResult> {
  return withTimeout(
    runSelfieValidation(params),
    getSelfieValidationTimeoutMs(),
    "La validación tardó demasiado. Intenta nuevamente o sube una foto desde galería",
  );
}
