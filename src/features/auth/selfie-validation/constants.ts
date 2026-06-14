import { isMobileDevice } from "./utils/captureDevice";

export const FACE_MODEL_URL =
  "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model";

export const MIN_SELFIE_DIMENSION = 280;
export const MIN_SELFIE_LAPLACIAN = 18;
export const MIN_SELFIE_LUMINANCE = 30;
export const MAX_SELFIE_BRIGHT_RATIO = 0.32;

export const SELFIE_VALIDATION_TIMEOUT_MS = 25_000;
export const SELFIE_VALIDATION_TIMEOUT_MOBILE_MS = 50_000;

export function getSelfieValidationTimeoutMs(): number {
  return isMobileDevice()
    ? SELFIE_VALIDATION_TIMEOUT_MOBILE_MS
    : SELFIE_VALIDATION_TIMEOUT_MS;
}
