import type { FaceAnalysis } from "./faceEngine";

export interface BiometricCheckResult {
  passed: boolean;
  message?: string;
  tone?: "default" | "warning";
}

function eyeAspectRatio(
  left: { x: number; y: number },
  right: { x: number; y: number },
  top: { x: number; y: number },
  bottom: { x: number; y: number },
): number {
  const horizontal = Math.hypot(right.x - left.x, right.y - left.y);
  const vertical = Math.hypot(bottom.x - top.x, bottom.y - top.y);
  if (horizontal === 0) return 0;
  return vertical / horizontal;
}

export function validateBiometrics(face: FaceAnalysis): BiometricCheckResult {
  const points = face.landmarks.positions;
  const leftEye = points.slice(36, 42);
  const rightEye = points.slice(42, 48);
  const nose = points[30];

  const leftEar = eyeAspectRatio(leftEye[0], leftEye[3], leftEye[1], leftEye[5]);
  const rightEar = eyeAspectRatio(
    rightEye[0],
    rightEye[3],
    rightEye[1],
    rightEye[5],
  );

  if (leftEar < 0.06 && rightEar < 0.06) {
    return {
      passed: false,
      message: "No logramos ver tus ojos con claridad. Intenta mirar de frente",
    };
  }

  const faceCenterX = face.box.x + face.box.width / 2;
  const eyeSlope = Math.abs(rightEye[0].y - leftEye[0].y);
  const eyeDistance = Math.abs(rightEye[0].x - leftEye[0].x) || 1;
  const tiltRatio = eyeSlope / eyeDistance;

  if (tiltRatio > 0.42) {
    return {
      passed: true,
      tone: "warning",
      message: "Postura inclinada. Preferible mirar de frente a la cámara",
    };
  }

  const noseOffset = Math.abs(nose.x - faceCenterX) / (face.box.width || 1);
  if (noseOffset > 0.32) {
    return {
      passed: true,
      tone: "warning",
      message: "Rostro algo descentrado, pero continuamos la verificación",
    };
  }

  return { passed: true };
}

export function validateFacePosition(
  face: FaceAnalysis,
  frameWidth: number,
  frameHeight: number,
): BiometricCheckResult {
  const centerX = face.box.x + face.box.width / 2;
  const centerY = face.box.y + face.box.height / 2;
  const frameArea = frameWidth * frameHeight;
  const faceArea = face.box.width * face.box.height;
  const areaRatio = faceArea / frameArea;

  const centeredX = centerX / frameWidth;
  const centeredY = centerY / frameHeight;

  if (
    centeredX < 0.12 ||
    centeredX > 0.88 ||
    centeredY < 0.08 ||
    centeredY > 0.92
  ) {
    return {
      passed: false,
      message: "Tu rostro debe verse completo dentro de la foto",
    };
  }

  if (areaRatio < 0.04) {
    return {
      passed: true,
      tone: "warning",
      message: "Estás un poco lejos, pero podemos validar tu identidad",
    };
  }

  if (areaRatio > 0.82) {
    return {
      passed: true,
      tone: "warning",
      message: "Estás muy cerca, pero podemos validar tu identidad",
    };
  }

  return { passed: true };
}
