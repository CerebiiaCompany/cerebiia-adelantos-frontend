import { useCallback } from "react";
import { fileToImageSource } from "../utils/fileToImageSource";
import { runOCR } from "../utils/ocrEngine";

export function useOCRValidation() {
  const validateOCR = useCallback(
    async (
      file: File,
      onProgress?: (progress: number, message: string) => void,
    ) => {
      const source = await fileToImageSource(file);
      return runOCR(source, onProgress);
    },
    [],
  );

  return { validateOCR };
}
