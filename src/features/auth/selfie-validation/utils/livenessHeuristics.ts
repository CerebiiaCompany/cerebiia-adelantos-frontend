export interface LivenessResult {
  passed: boolean;
  message?: string;
  score: number;
}

function frameDifference(
  previous: ImageData,
  current: ImageData,
): number {
  let diff = 0;
  const step = 16;

  for (let index = 0; index < previous.data.length; index += 4 * step) {
    diff +=
      Math.abs(previous.data[index] - current.data[index]) +
      Math.abs(previous.data[index + 1] - current.data[index + 1]) +
      Math.abs(previous.data[index + 2] - current.data[index + 2]);
  }

  const samples = previous.data.length / (4 * step);
  return diff / (samples * 3 * 255);
}

export function evaluateLiveness(
  previousFrame: ImageData | null,
  currentFrame: ImageData,
  captureMode: "live" | "upload",
): LivenessResult {
  if (captureMode === "upload") {
    return {
      passed: true,
      score: 1,
    };
  }

  if (!previousFrame) {
    return {
      passed: true,
      score: 0.55,
      message: "Movimiento facial no evaluado en este intento",
    };
  }

  const movement = frameDifference(previousFrame, currentFrame);
  const passed = movement > 0.012 && movement < 0.35;
  const score = Math.max(0, Math.min(1, movement * 8));

  return {
    passed,
    score,
    message: passed
      ? undefined
      : movement <= 0.012
        ? "Detectamos imagen muy estática. Intenta un leve movimiento"
        : "Hay demasiado movimiento. Mantén el rostro estable",
  };
}
