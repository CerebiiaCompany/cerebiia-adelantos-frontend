import { useCallback } from "react";
import { validateImageQuality } from "../validators/imageQuality.validator";
import { fileToImageSource } from "../utils/fileToImageSource";
import { prepareAnalysisCanvas } from "../utils/prepareAnalysisCanvas";

export function useImageQualityValidation() {
  const validateFromFile = useCallback(async (file: File) => {
    const source = await fileToImageSource(file);
    const { analysisCanvas, originalWidth, originalHeight } =
      prepareAnalysisCanvas(source.source);
    return validateImageQuality(analysisCanvas, originalWidth, originalHeight);
  }, []);

  return { validateFromFile, validateFromCanvas: validateImageQuality };
}
