import {
  LABOR_CERT_CRITICAL_MIN_HEIGHT,
  LABOR_CERT_CRITICAL_MIN_WIDTH,
} from "../constants";
import type { ImageQualityResult } from "@/features/auth/document-validation/types";
import { validateImageQuality } from "@/features/auth/document-validation/validators/imageQuality.validator";

export function meetsLaborCertCriticalResolution(
  width: number,
  height: number,
): boolean {
  const landscapeOk =
    width >= LABOR_CERT_CRITICAL_MIN_WIDTH &&
    height >= LABOR_CERT_CRITICAL_MIN_HEIGHT;
  const portraitOk =
    width >= LABOR_CERT_CRITICAL_MIN_HEIGHT &&
    height >= LABOR_CERT_CRITICAL_MIN_WIDTH;
  return landscapeOk || portraitOk;
}

export interface LaborCertQualityGateResult {
  quality: ImageQualityResult;
  criticalResolutionPassed: boolean;
  blockingPassed: boolean;
}

export function validateLaborCertImageQuality(
  analysisCanvas: HTMLCanvasElement,
  originalWidth: number,
  originalHeight: number,
): LaborCertQualityGateResult {
  const quality = validateImageQuality(
    analysisCanvas,
    originalWidth,
    originalHeight,
  );
  const criticalResolutionPassed = meetsLaborCertCriticalResolution(
    originalWidth,
    originalHeight,
  );

  const blockingPassed =
    criticalResolutionPassed &&
    quality.sharpness.passed &&
    quality.coverage.passed;

  return {
    quality,
    criticalResolutionPassed,
    blockingPassed,
  };
}
