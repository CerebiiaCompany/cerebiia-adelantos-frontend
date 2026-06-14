import { LABOR_CERT_VALIDITY_DAYS } from "../constants";
import { parseLaborCertDate } from "./laborCertFields.validator";

export interface LaborCertValidityResult {
  isValid: boolean;
  message?: string;
}

export function validateLaborCertValidity(
  issueDateValue?: string,
  referenceDate: Date = new Date(),
): LaborCertValidityResult {
  if (!issueDateValue) {
    return {
      isValid: false,
      message: "No se encontró la fecha de expedición.",
    };
  }

  const issueDate = parseLaborCertDate(issueDateValue);
  if (!issueDate) {
    return {
      isValid: false,
      message: "La fecha de expedición no tiene un formato válido.",
    };
  }

  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );

  if (issueDate.getTime() > today.getTime()) {
    return {
      isValid: false,
      message: "La fecha de expedición no puede ser futura.",
    };
  }

  const maxAgeMs = LABOR_CERT_VALIDITY_DAYS * 24 * 60 * 60 * 1000;
  if (today.getTime() - issueDate.getTime() > maxAgeMs) {
    return {
      isValid: false,
      message: `La certificación supera los ${LABOR_CERT_VALIDITY_DAYS} días de vigencia.`,
    };
  }

  return { isValid: true };
}
