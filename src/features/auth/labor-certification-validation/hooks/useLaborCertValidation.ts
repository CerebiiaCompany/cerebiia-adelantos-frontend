import { useCallback, useEffect, useRef, useState } from "react";
import {
  INITIAL_LABOR_CERT_VALIDATION,
  type LaborCertValidationState,
} from "../types";
import { runLaborCertValidationWithTimeout } from "../validators/runLaborCertValidation";
import { terminateOcrWorker } from "@/features/auth/document-validation/utils/ocrEngine";
import { warmupValidationEngines } from "@/features/auth/document-validation/utils/validationWarmup";

interface UseLaborCertValidationOptions {
  employeeFullName: string;
  companyName: string;
}

export function useLaborCertValidation({
  employeeFullName,
  companyName,
}: UseLaborCertValidationOptions) {
  const [state, setState] = useState<LaborCertValidationState>(
    INITIAL_LABOR_CERT_VALIDATION,
  );
  const requestIdRef = useRef(0);

  const validateFile = useCallback(
    async (file: File | null) => {
      requestIdRef.current += 1;
      const requestId = requestIdRef.current;

      if (!file) {
        setState(INITIAL_LABOR_CERT_VALIDATION);
        return;
      }

      await terminateOcrWorker();

      setState({
        ...INITIAL_LABOR_CERT_VALIDATION,
        phase: "analyzing",
        progressMessage: "Preparando escaneo de tu certificación...",
      });

      try {
        const result = await runLaborCertValidationWithTimeout({
          file,
          employeeFullName,
          companyName,
          onProgress: (progress, message) => {
            if (requestIdRef.current !== requestId) return;
            setState((current) => ({
              ...current,
              phase: "analyzing",
              progress,
              progressMessage: message,
            }));
          },
        });

        if (requestIdRef.current !== requestId) return;

        setState({
          phase: "complete",
          progress: 1,
          progressMessage:
            result.status === "approved"
              ? "Certificación validada correctamente"
              : result.status === "review"
                ? "Certificación aceptada con revisión manual"
                : "No pudimos validar la certificación laboral",
          checks: result.checks,
          status: result.status,
          reason: result.reason,
          confidence: result.confidence,
          extractedData: result.extractedData,
          requiresManualReview: result.requiresManualReview,
          canContinue: result.canContinue,
          ocrText: result.ocrText,
        });

        return result;
      } catch (error) {
        if (requestIdRef.current !== requestId) return;

        const message =
          error instanceof Error
            ? error.message
            : "Ocurrió un error al validar la certificación laboral";

        setState({
          phase: "complete",
          progress: 1,
          progressMessage: "No se pudo completar la validación",
          checks: [
            {
              id: "ocr",
              label: "Texto legible",
              passed: false,
              message,
            },
          ],
          status: "rejected",
          reason: message,
          confidence: 0,
          extractedData: {},
          requiresManualReview: false,
          canContinue: false,
          ocrText: "",
        });
      }
    },
    [companyName, employeeFullName],
  );

  useEffect(() => {
    void warmupValidationEngines();
  }, []);

  useEffect(() => {
    return () => {
      void terminateOcrWorker();
    };
  }, []);

  return {
    state,
    validateFile,
    isAnalyzing: state.phase === "analyzing",
  };
}
