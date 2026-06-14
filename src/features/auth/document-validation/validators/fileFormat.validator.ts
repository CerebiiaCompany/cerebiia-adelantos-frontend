import {
  IDENTITY_UPLOAD_MAX_BYTES,
  isAllowedIdentityFile,
  type IdentityFileLike,
} from "@/shared/validations/register.schema";

export function validateFileFormat(file: IdentityFileLike): {
  passed: boolean;
  message?: string;
} {
  if (!isAllowedIdentityFile(file)) {
    return {
      passed: false,
      message: "Formato no permitido. Usa JPG, JPEG, PNG o PDF",
    };
  }

  return { passed: true };
}

export function validateFileSize(file: IdentityFileLike): {
  passed: boolean;
  message?: string;
} {
  if (file.size > IDENTITY_UPLOAD_MAX_BYTES) {
    return {
      passed: false,
      message: "El archivo supera el tamaño máximo de 5 MB",
    };
  }

  return { passed: true };
}
