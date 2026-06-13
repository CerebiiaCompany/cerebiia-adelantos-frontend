import type {
  LaborCertCheckItem,
  LaborCertValidationResult,
} from "../types";
import { CHECK_LABELS } from "../types";
import { LABOR_CERT_VALIDATION_TIMEOUT_MS } from "../constants";
import { validateFileFormat, validateFileSize } from "@/features/auth/document-validation/validators/fileFormat.validator";
import { validateImageQuality } from "@/features/auth/document-validation/validators/imageQuality.validator";
import { fileToImageSource } from "@/features/auth/document-validation/utils/fileToImageSource";
import { runOCR } from "@/features/auth/document-validation/utils/ocrEngine";
import { prepareAnalysisCanvas } from "@/features/auth/document-validation/utils/prepareAnalysisCanvas";
import {
  withTimeout,
  yieldToMainThread,
} from "@/features/auth/document-validation/utils/asyncUtils";
import {
  OCR_CANVAS_PREP_TIMEOUT_MS,
  OCR_RECOGNIZE_TIMEOUT_MS,
} from "@/features/auth/document-validation/constants";
import { validateLaborCertDocumentType } from "./laborCertContent.validator";
import { validateLaborCertFields } from "./laborCertFields.validator";
import { validateLaborCertValidity } from "./laborCertValidity.validator";
import { validateLaborCertAuthenticity } from "./laborCertAuthenticity.validator";

const FILE_PREP_TIMEOUT_MS = 45_000;

interface RunLaborCertValidationParams {
  file: File;
  employeeFullName: string;
  companyName: string;
  onProgress?: (progress: number, message: string) => void;
}

function buildCheck(
  id: LaborCertCheckItem["id"],
  passed: boolean,
  message?: string,
  tone?: LaborCertCheckItem["tone"],
): LaborCertCheckItem {
  return {
    id,
    label: CHECK_LABELS[id],
    passed,
    message,
    tone,
  };
}

function resolveFinalResult(
  checks: LaborCertCheckItem[],
  params: {
    typeValid: boolean;
    fieldsValid: boolean;
    validityValid: boolean;
    authenticity: ReturnType<typeof validateLaborCertAuthenticity>;
    typeConfidence: number;
    fieldsConfidence: number;
    extractedData: LaborCertValidationResult["extractedData"];
    ocrText: string;
  },
): LaborCertValidationResult {
  const blockingFailed = checks.some(
    (check) =>
      !check.passed &&
      check.tone !== "warning" &&
      check.id !== "authenticity",
  );

  const confidence = Number(
    (
      (params.typeConfidence + params.fieldsConfidence + (params.authenticity.passed ? 1 : 0.5)) /
      3
    ).toFixed(2),
  );

  if (blockingFailed || !params.typeValid || !params.fieldsValid || !params.validityValid) {
    const firstError = checks.find(
      (check) => !check.passed && check.id !== "brightness",
    );

    return {
      status: "rejected",
      reason:
        firstError?.message ??
        "El documento no cumple los requisitos de certificación laboral.",
      confidence,
      extractedData: params.extractedData,
      requiresManualReview: false,
      checks,
      canContinue: false,
      ocrText: params.ocrText,
    };
  }

  if (params.authenticity.requiresManualReview) {
    return {
      status: "review",
      reason:
        "Documento válido, pero requiere revisión manual por señales de autenticidad limitadas.",
      confidence,
      extractedData: params.extractedData,
      requiresManualReview: true,
      checks,
      canContinue: true,
      ocrText: params.ocrText,
    };
  }

  return {
    status: "approved",
    reason: "Certificación laboral validada correctamente.",
    confidence,
    extractedData: params.extractedData,
    requiresManualReview: false,
    checks,
    canContinue: true,
    ocrText: params.ocrText,
  };
}

export async function runLaborCertValidation({
  file,
  employeeFullName,
  companyName,
  onProgress,
}: RunLaborCertValidationParams): Promise<LaborCertValidationResult> {
  const checks: LaborCertCheckItem[] = [];

  onProgress?.(0.05, "Validando formato del archivo...");

  const formatResult = validateFileFormat(file);
  checks.push(buildCheck("format", formatResult.passed, formatResult.message));

  const sizeResult = validateFileSize(file);
  checks.push(buildCheck("size", sizeResult.passed, sizeResult.message));

  if (!formatResult.passed || !sizeResult.passed) {
    return resolveFinalResult(checks, {
      typeValid: false,
      fieldsValid: false,
      validityValid: false,
      authenticity: validateLaborCertAuthenticity(""),
      typeConfidence: 0,
      fieldsConfidence: 0,
      extractedData: {},
      ocrText: "",
    });
  }

  onProgress?.(0.12, "Preparando documento...");

  const imageSource = await withTimeout(
    fileToImageSource(file, (message) => {
      onProgress?.(0.18, message);
    }),
    FILE_PREP_TIMEOUT_MS,
    "La preparación del archivo tardó demasiado. Intente con JPG o PNG, o un PDF más liviano.",
  );

  await yieldToMainThread();
  onProgress?.(0.32, "Optimizando imagen para análisis...");

  const { analysisCanvas, originalWidth, originalHeight } =
    prepareAnalysisCanvas(imageSource.source);

  await yieldToMainThread();
  onProgress?.(0.4, "Analizando calidad de imagen...");

  const quality = validateImageQuality(
    analysisCanvas,
    originalWidth,
    originalHeight,
  );

  checks.push(
    buildCheck("resolution", quality.resolution.passed, quality.resolution.message),
    buildCheck("sharpness", quality.sharpness.passed, quality.sharpness.message),
    buildCheck(
      "brightness",
      quality.brightness.passed,
      quality.brightness.message,
      quality.brightness.passed ? "default" : "warning",
    ),
    buildCheck("coverage", quality.coverage.passed, quality.coverage.message),
  );

  const qualityPassed =
    quality.resolution.passed &&
    quality.sharpness.passed &&
    quality.coverage.passed;

  if (!qualityPassed) {
    return resolveFinalResult(checks, {
      typeValid: false,
      fieldsValid: false,
      validityValid: false,
      authenticity: validateLaborCertAuthenticity(""),
      typeConfidence: 0,
      fieldsConfidence: 0,
      extractedData: {},
      ocrText: "",
    });
  }

  onProgress?.(0.52, "Leyendo contenido del documento...");

  const ocrResult = await withTimeout(
    runOCR(imageSource, (progress, message) => {
      onProgress?.(0.52 + progress * 0.28, message);
    }),
    OCR_RECOGNIZE_TIMEOUT_MS + OCR_CANVAS_PREP_TIMEOUT_MS + 5_000,
    "El reconocimiento de texto tardó demasiado. Intente con JPG o PNG.",
  );

  checks.push(
    buildCheck(
      "ocr",
      ocrResult.sufficientText,
      ocrResult.sufficientText
        ? undefined
        : "No se detectó suficiente texto legible en el documento",
    ),
  );

  if (!ocrResult.sufficientText) {
    return resolveFinalResult(checks, {
      typeValid: false,
      fieldsValid: false,
      validityValid: false,
      authenticity: validateLaborCertAuthenticity(""),
      typeConfidence: 0,
      fieldsConfidence: 0,
      extractedData: {},
      ocrText: ocrResult.text,
    });
  }

  onProgress?.(0.84, "Identificando certificación laboral...");

  const typeValidation = validateLaborCertDocumentType(ocrResult.text);
  checks.push(
    buildCheck(
      "documentType",
      typeValidation.isValid,
      typeValidation.errors[0],
    ),
  );

  onProgress?.(0.9, "Extrayendo información laboral...");

  const fieldsValidation = validateLaborCertFields(ocrResult.text, {
    employeeFullName,
    companyName,
  });

  checks.push(
    buildCheck(
      "requiredFields",
      fieldsValidation.isValid,
      fieldsValidation.errors[0],
    ),
  );

  onProgress?.(0.94, "Verificando vigencia...");

  const validity = validateLaborCertValidity(fieldsValidation.extractedData.issueDate);
  checks.push(buildCheck("validity", validity.isValid, validity.message));

  onProgress?.(0.97, "Revisando autenticidad...");

  const authenticity = validateLaborCertAuthenticity(ocrResult.text);
  checks.push(
    buildCheck(
      "authenticity",
      true,
      authenticity.message,
      authenticity.passed ? "default" : "warning",
    ),
  );

  onProgress?.(1, "Validación completada");

  return resolveFinalResult(checks, {
    typeValid: typeValidation.isValid,
    fieldsValid: fieldsValidation.isValid,
    validityValid: validity.isValid,
    authenticity,
    typeConfidence: typeValidation.confidence,
    fieldsConfidence: fieldsValidation.confidence,
    extractedData: fieldsValidation.extractedData,
    ocrText: ocrResult.text,
  });
}

export function runLaborCertValidationWithTimeout(
  params: RunLaborCertValidationParams,
): Promise<LaborCertValidationResult> {
  return withTimeout(
    runLaborCertValidation(params),
    LABOR_CERT_VALIDATION_TIMEOUT_MS,
    "La validación tardó demasiado. Intenta nuevamente con un archivo más liviano.",
  );
}
