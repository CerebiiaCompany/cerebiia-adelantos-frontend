import { useCallback, useEffect, useRef, useState } from "react";
import type { DocumentType } from "@/shared/validations/register.schema";
import {
  INITIAL_SIDE_VALIDATION,
  type SideValidationState,
} from "../types";
import { runDocumentFileValidation } from "../validators/runDocumentValidation";
import { terminateOcrWorker } from "../utils/ocrEngine";
import { warmupValidationEngines } from "../utils/validationWarmup";

type UploadSideKey = "front" | "back";

interface UseDocumentValidationOptions {
  documentType: DocumentType;
  documentNumber: string;
}

export function useDocumentValidation(_options: UseDocumentValidationOptions) {
  const [frontState, setFrontState] =
    useState<SideValidationState>(INITIAL_SIDE_VALIDATION);
  const [backState, setBackState] =
    useState<SideValidationState>(INITIAL_SIDE_VALIDATION);
  const requestIdRef = useRef({ front: 0, back: 0 });

  const validateSide = useCallback(async (side: UploadSideKey, file: File | null) => {
    const setState = side === "front" ? setFrontState : setBackState;
    requestIdRef.current[side] += 1;
    const requestId = requestIdRef.current[side];

    if (!file) {
      setState(INITIAL_SIDE_VALIDATION);
      return;
    }

    await terminateOcrWorker();

    setState({
      status: "analyzing",
      progress: 0,
      progressMessage: "Preparando verificación de tu documento...",
      checks: [],
      isValid: false,
      ocrText: "",
    });

    try {
      const result = await runDocumentFileValidation({
        file,
        onProgress: (progress, message) => {
          if (requestIdRef.current[side] !== requestId) return;
          setState((current) => ({
            ...current,
            status: "analyzing",
            progress,
            progressMessage: message,
          }));
        },
      });

      if (requestIdRef.current[side] !== requestId) return;

      setState({
        status: "complete",
        progress: 1,
        progressMessage: result.isValid
          ? "Documento validado correctamente"
          : "Se encontraron problemas en el documento",
        checks: result.checks,
        isValid: result.isValid,
        ocrText: result.ocrText,
      });
    } catch (error) {
      if (requestIdRef.current[side] !== requestId) return;

      const timeoutMessage =
        error instanceof Error && error.message.includes("tardó demasiado")
          ? error.message
          : "Ocurrió un error al analizar el archivo. Intente nuevamente o use JPG/PNG.";

      setState({
        status: "complete",
        progress: 1,
        progressMessage: "No se pudo completar el análisis del documento",
        checks: [
          {
            id: "ocr",
            label: "OCR detectado",
            passed: false,
            message: timeoutMessage,
          },
        ],
        isValid: false,
        ocrText: "",
      });
    }
  }, []);

  useEffect(() => {
    void warmupValidationEngines();
  }, []);

  useEffect(() => {
    return () => {
      void terminateOcrWorker();
    };
  }, []);

  const validateFront = useCallback(
    (file: File | null) => validateSide("front", file),
    [validateSide],
  );

  const validateBack = useCallback(
    (file: File | null) => validateSide("back", file),
    [validateSide],
  );

  const isAnalyzing =
    frontState.status === "analyzing" || backState.status === "analyzing";

  return {
    frontState,
    backState,
    validateFront,
    validateBack,
    isAnalyzing,
  };
}
