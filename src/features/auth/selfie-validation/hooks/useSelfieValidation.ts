import { useCallback, useEffect, useRef, useState } from "react";
import {
  INITIAL_SELFIE_VALIDATION,
  type SelfieValidationState,
} from "../types";
import { runSelfieValidationWithTimeout } from "../validators/runSelfieValidation";
import { warmupOcrEngine } from "@/features/auth/document-validation/utils/ocrEngine";
import { warmupFaceEngine } from "../utils/faceEngine";
import type { SelfieCaptureMode } from "../utils/captureDevice";

interface ValidateSelfieParams {
  selfieCanvas: HTMLCanvasElement;
  previousFrame: ImageData | null;
  captureMode: SelfieCaptureMode;
}

export function useSelfieValidation() {
  const [state, setState] = useState<SelfieValidationState>(
    INITIAL_SELFIE_VALIDATION,
  );
  const requestIdRef = useRef(0);

  useEffect(() => {
    void Promise.all([warmupFaceEngine(), warmupOcrEngine()]);
  }, []);

  const validateSelfie = useCallback(
    async ({
      selfieCanvas,
      previousFrame,
      captureMode,
    }: ValidateSelfieParams) => {
      requestIdRef.current += 1;
      const requestId = requestIdRef.current;

      setState({
        phase: "validating",
        progress: 0,
        progressMessage: "Iniciando validación facial...",
        checks: [],
        isValid: false,
      });

      try {
        const result = await runSelfieValidationWithTimeout({
          selfieCanvas,
          previousFrame,
          captureMode,
          onProgress: (progress, message) => {
            if (requestIdRef.current !== requestId) return;
            setState((current) => ({
              ...current,
              phase: "validating",
              progress,
              progressMessage: message,
            }));
          },
        });

        if (requestIdRef.current !== requestId) return;

        setState({
          phase: "complete",
          progress: 1,
          progressMessage: result.isValid
            ? "Selfie verificada. Puedes continuar"
            : "No pudimos validar tu selfie",
          checks: result.checks,
          isValid: result.isValid,
        });

        return result;
      } catch (error) {
        if (requestIdRef.current !== requestId) return;

        const message =
          error instanceof Error
            ? error.message
            : "Ocurrió un error al validar la selfie";

        setState({
          phase: "complete",
          progress: 1,
          progressMessage: "No se pudo completar la validación",
          checks: [
            {
              id: "quality",
              label: "Calidad de imagen",
              passed: false,
              message,
            },
          ],
          isValid: false,
        });
      }
    },
    [],
  );

  const resetValidation = useCallback(() => {
    requestIdRef.current += 1;
    setState(INITIAL_SELFIE_VALIDATION);
  }, []);

  return {
    state,
    validateSelfie,
    resetValidation,
    isValidating: state.phase === "validating",
  };
}
