export interface SecurityCheckResult {
  passed: boolean;
  message?: string;
}

export function detectSecurityIssues(canvas: HTMLCanvasElement): SecurityCheckResult {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return { passed: false, message: "No se pudo verificar autenticidad" };
  }

  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  let moireScore = 0;
  let bandingScore = 0;
  const rowStride = width * 4;

  for (let y = 0; y < height; y += 6) {
    let rowVariance = 0;
    let prev = pixels[y * rowStride];
    let transitions = 0;

    for (let x = 4; x < rowStride; x += 16) {
      const value = pixels[y * rowStride + x];
      rowVariance += Math.abs(value - prev);
      if (Math.abs(value - prev) > 18) transitions += 1;
      prev = value;
    }

    if (transitions > width / 28) moireScore += 1;
    if (rowVariance / (rowStride / 16) < 4) bandingScore += 1;
  }

  const moireRatio = moireScore / Math.ceil(height / 6);
  const bandingRatio = bandingScore / Math.ceil(height / 6);

  if (moireRatio > 0.45) {
    return {
      passed: false,
      message: "Parece una foto de pantalla. Usa la cámara en vivo",
    };
  }

  if (bandingRatio > 0.65) {
    return {
      passed: false,
      message: "La imagen parece impresa o digital manipulada",
    };
  }

  return { passed: true };
}
