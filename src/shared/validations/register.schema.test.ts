import { describe, expect, it } from "vitest";
import {
  isValidDocumentNumber,
  isValidEmail,
  isValidColombianPhone,
  registerSchema,
  sanitizeDocumentNumber,
  sanitizeColombianPhone,
  verifyDocumentSchema,
  basicInfoSchema,
  contactEmailSchema,
  contactPhoneSchema,
  passwordSchema,
  reviewStepSchema,
  validateIdentityFile,
  validateIdentityUpload,
} from "./register.schema";

describe("isValidDocumentNumber", () => {
  it("valida cédula de ciudadanía (6-10 dígitos)", () => {
    expect(isValidDocumentNumber("CC", "123456")).toBe(true);
    expect(isValidDocumentNumber("CC", "1234567890")).toBe(true);
    expect(isValidDocumentNumber("CC", "12345")).toBe(false);
    expect(isValidDocumentNumber("CC", "12345678901")).toBe(false);
    expect(isValidDocumentNumber("CC", "12345a")).toBe(false);
  });

  it("valida pasaporte (6-10 alfanuméricos)", () => {
    expect(isValidDocumentNumber("PASSPORT", "AB1234")).toBe(true);
    expect(isValidDocumentNumber("PASSPORT", "1234567890")).toBe(true);
    expect(isValidDocumentNumber("PASSPORT", "AB12")).toBe(false);
    expect(isValidDocumentNumber("PASSPORT", "AB-1234")).toBe(false);
  });

  it("valida cédula de extranjería (6-11 dígitos)", () => {
    expect(isValidDocumentNumber("CE", "123456")).toBe(true);
    expect(isValidDocumentNumber("CE", "12345678901")).toBe(true);
    expect(isValidDocumentNumber("CE", "12345")).toBe(false);
    expect(isValidDocumentNumber("CE", "123456789012")).toBe(false);
  });

  it("valida PPT (exactamente 15 dígitos)", () => {
    expect(isValidDocumentNumber("PPT", "123456789012345")).toBe(true);
    expect(isValidDocumentNumber("PPT", "12345678901234")).toBe(false);
    expect(isValidDocumentNumber("PPT", "1234567890123456")).toBe(false);
  });
});

describe("sanitizeDocumentNumber", () => {
  it("filtra solo dígitos para CC", () => {
    expect(sanitizeDocumentNumber("CC", "12a34b56")).toBe("123456");
  });

  it("filtra alfanuméricos para pasaporte", () => {
    expect(sanitizeDocumentNumber("PASSPORT", "ab-12@34")).toBe("ab1234");
  });

  it("respeta longitud máxima del PPT", () => {
    expect(sanitizeDocumentNumber("PPT", "1".repeat(20))).toHaveLength(15);
  });
});

describe("registerSchema", () => {
  it("rechaza documento inválido con mensaje claro", () => {
    const result = registerSchema.safeParse({
      documentType: "CC",
      documentNumber: "123",
      acceptMandatorySensitiveTreatment: true,
      acceptAccessoryTreatment: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Debe ingresar un documento válido",
      );
    }
  });

  it("acepta documento válido", () => {
    const result = verifyDocumentSchema.safeParse({
      documentType: "CC",
      documentNumber: "1234567",
      acceptMandatorySensitiveTreatment: true,
      acceptAccessoryTreatment: false,
    });

    expect(result.success).toBe(true);
  });

  it("requiere autorización obligatoria y sensible", () => {
    const result = verifyDocumentSchema.safeParse({
      documentType: "CC",
      documentNumber: "1234567",
      acceptMandatorySensitiveTreatment: false,
      acceptAccessoryTreatment: false,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Debes autorizar el tratamiento obligatorio y sensible para continuar.",
      );
    }
  });
});

describe("basicInfoSchema", () => {
  it("requiere todos los campos básicos", () => {
    const result = basicInfoSchema.safeParse({
      firstNames: "",
      lastNames: "",
      gender: undefined,
      cityId: "",
      department: undefined,
      address: "",
      companyId: "",
      paymentDay: 15,
    });

    expect(result.success).toBe(false);
  });

  it("acepta datos básicos válidos", () => {
    const result = basicInfoSchema.safeParse({
      firstNames: "Juan",
      lastNames: "Pérez",
      gender: "MASCULINO",
      cityId: "11001",
      department: "Bogotá D.C.",
      address: "Calle 72 #10-34",
      companyId: "1",
      paymentDay: 20,
    });

    expect(result.success).toBe(true);
  });
});

describe("passwordSchema", () => {
  it("acepta contraseñas que cumplen todos los requisitos", () => {
    const result = passwordSchema.safeParse({
      password: "Abc12345",
      confirmPassword: "Abc12345",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza contraseñas sin mayúscula", () => {
    const result = passwordSchema.safeParse({
      password: "abc12345",
      confirmPassword: "abc12345",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza contraseñas sin minúscula", () => {
    const result = passwordSchema.safeParse({
      password: "ABC12345",
      confirmPassword: "ABC12345",
    });

    expect(result.success).toBe(false);
  });

  it("rechaza contraseñas sin número", () => {
    const result = passwordSchema.safeParse({
      password: "Abcdefgh",
      confirmPassword: "Abcdefgh",
    });

    expect(result.success).toBe(false);
  });

  it("acepta contraseñas largas sin límite máximo", () => {
    const result = passwordSchema.safeParse({
      password: "Abc12345678901234",
      confirmPassword: "Abc12345678901234",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza contraseñas que no coinciden", () => {
    const result = passwordSchema.safeParse({
      password: "Abc12345",
      confirmPassword: "Abc12346",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Las contraseñas no coinciden",
      );
    }
  });
});

describe("isValidEmail", () => {
  it("acepta correos válidos", () => {
    expect(isValidEmail("usuario@empresa.com")).toBe(true);
    expect(isValidEmail("  Juan.Perez@mail.co  ")).toBe(true);
  });

  it("rechaza correos inválidos", () => {
    expect(isValidEmail("correo-invalido")).toBe(false);
    expect(isValidEmail("user@domain")).toBe(false);
    expect(isValidEmail("user..name@mail.com")).toBe(false);
  });
});

describe("isValidColombianPhone", () => {
  it("acepta celulares colombianos válidos", () => {
    expect(isValidColombianPhone("3001234567")).toBe(true);
    expect(isValidColombianPhone("573001234567")).toBe(true);
  });

  it("rechaza números inválidos", () => {
    expect(isValidColombianPhone("2001234567")).toBe(false);
    expect(isValidColombianPhone("30012345")).toBe(false);
  });
});

describe("contactEmailSchema", () => {
  it("requiere autorizaciones obligatorias", () => {
    const result = contactEmailSchema.safeParse({
      email: "test@mail.com",
      acceptDataPolicy: false,
      acceptRecords: false,
    });

    expect(result.success).toBe(false);
  });
});

describe("contactPhoneSchema", () => {
  it("requiere autorizaciones obligatorias", () => {
    const result = contactPhoneSchema.safeParse({
      phone: sanitizeColombianPhone("3001234567"),
      acceptWalletContract: false,
      acceptTemporaryStorage: false,
    });

    expect(result.success).toBe(false);
  });
});

describe("validateIdentityFile", () => {
  it("acepta archivos permitidos", () => {
    const file = {
      name: "cedula.jpg",
      size: 1024 * 500,
      type: "image/jpeg",
    };

    expect(validateIdentityFile(file)).toBeNull();
  });

  it("rechaza formatos no permitidos", () => {
    const file = {
      name: "documento.docx",
      size: 1024,
      type: "application/msword",
    };

    expect(validateIdentityFile(file)).toContain("Formato no permitido");
  });

  it("rechaza archivos mayores al límite de carga", () => {
    const file = {
      name: "cedula.pdf",
      size: 16 * 1024 * 1024,
      type: "application/pdf",
    };

    expect(validateIdentityFile(file)).toContain("15 MB");
  });
});

describe("validateIdentityUpload", () => {
  it("requiere ambas caras para cédula", () => {
    const errors = validateIdentityUpload("CC", {
      frontFile: null,
      backFile: null,
    });

    expect(errors.frontFile).toBeDefined();
    expect(errors.backFile).toBeDefined();
  });

  it("solo requiere un archivo para pasaporte", () => {
    const errors = validateIdentityUpload("PASSPORT", {
      frontFile: {
        name: "pasaporte.png",
        size: 1000,
        type: "image/png",
      } as File,
      backFile: null,
    });

    expect(errors.frontFile).toBeUndefined();
    expect(errors.backFile).toBeUndefined();
  });
});

describe("reviewStepSchema", () => {
  it("valida los campos editables del paso de revisión", () => {
    const result = reviewStepSchema.safeParse({
      firstNames: "Juan Carlos",
      lastNames: "Pérez Gómez",
      gender: "MASCULINO",
      address: "Calle 72 #10-34",
      companyId: "company-1",
      email: "juan@empresa.com",
      phone: "3001234567",
    });

    expect(result.success).toBe(true);
  });

  it("rechaza correo o celular inválidos", () => {
    const result = reviewStepSchema.safeParse({
      firstNames: "Juan",
      lastNames: "Pérez",
      gender: "MASCULINO",
      address: "Calle 72 #10-34",
      companyId: "company-1",
      email: "correo-invalido",
      phone: "123",
    });

    expect(result.success).toBe(false);
  });
});
