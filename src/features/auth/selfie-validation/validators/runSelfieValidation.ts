import { SELFIE_VALIDATION_TIMEOUT_MS } from "../constants";
import type {
  SelfieValidationCheckItem,
  SelfieValidationResult,
} from "../types";
import { CHECK_LABELS } from "../types";
import { withTimeout } from "@/features/auth/document-validation/utils/asyncUtils";
import {
  validateBiometrics,
  validateFacePosition,
} from "../utils/biometricChecks";
import type { BiometricCheckResult } from "../utils/biometricChecks";
import { detectFaces } from "../utils/faceEngine";
import { evaluateLiveness } from "../utils/livenessHeuristics";
import type { SelfieCaptureMode } from "../utils/captureDevice";
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

  onProgress?.(0.08, "Verificando imagen...");
  const quality = analyzeSelfieQuality(selfieCanvas);

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

  onProgress?.(0.22, "Detectando rostro...");
  const selfieFaces = await detectFaces(selfieCanvas);

  if (selfieFaces.length === 0) {
    checks.push(
      buildCheck(
        "faceCount",
        false,
        "No detectamos rostro. Asegúrate de que tu cara sea visible y clara",
      ),
    );
    return { checks, isValid: false, livenessPassed: false };
  }

  if (selfieFaces.length > 1) {
    checks.push(
      buildCheck(
        "faceCount",
        false,
        "Detectamos más de un rostro. Debe aparecer solo tu cara",
      ),
    );
    return { checks, isValid: false, livenessPassed: false };
  }

  checks.push(buildCheck("faceCount", true, "Rostro detectado correctamente"));
  const selfieFace = selfieFaces[0];

  onProgress?.(0.38, "Verificando postura...");
  const position = validateFacePosition(
    selfieFace,
    selfieCanvas.width,
    selfieCanvas.height,
  );
  checks.push(buildPostureCheck("facePosition", position));

  if (!position.passed) {
    return { checks, isValid: false, livenessPassed: false };
  }

  onProgress?.(0.52, "Revisando autenticidad...");
  const security = detectSecurityIssues(selfieCanvas);
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

  onProgress?.(0.66, "Analizando rostro...");
  const biometrics = validateBiometrics(selfieFace);
  checks.push(buildPostureCheck("biometrics", biometrics));

  if (!biometrics.passed) {
    return { checks, isValid: false, livenessPassed: false };
  }

  onProgress?.(0.82, "Verificando captura...");
  const currentFrame = selfieCanvas
    .getContext("2d")
    ?.getImageData(0, 0, selfieCanvas.width, selfieCanvas.height);

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
    SELFIE_VALIDATION_TIMEOUT_MS,
    "La validación tardó demasiado. Intenta nuevamente",
  );
}
