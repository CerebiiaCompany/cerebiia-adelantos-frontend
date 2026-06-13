// Datos de demostración — reemplazar por respuestas reales del backend.
import type {
  CompanyOption,
  UserProfileData,
  VerifyDocumentRequest,
  VerifyDocumentResponse,
} from "@/shared/api/types";

export const DEMO_EXISTING_DOCUMENT = {
  documentType: "CC" as const,
  documentNumber: "1234567890",
};

export const DEMO_COMPANIES: CompanyOption[] = [
  { id: "1", name: "Cerebiia S.A.S." },
  { id: "2", name: "AdeCerebiia Demo Corp" },
  { id: "3", name: "Empresa Aliada LTDA" },
  { id: "4", name: "Grupo Industrial Andino" },
];

export const DEMO_EXISTING_PROFILE: UserProfileData = {
  firstNames: "Juan Carlos",
  lastNames: "Pérez Gómez",
  gender: "MASCULINO",
  cityId: "11001",
  cityName: "Bogotá D.C.",
  department: "Bogotá D.C.",
  address: "Calle 72 #10-34, Bogotá",
  companyId: "1",
  companyName: "Cerebiia S.A.S.",
  paymentDay: 15,
  email: "juan.perez@empresa.com",
  phone: "3001234567",
};

export async function demoVerifyDocument(
  data: VerifyDocumentRequest,
): Promise<VerifyDocumentResponse> {
  await new Promise((resolve) => setTimeout(resolve, 900));

  const isExisting =
    data.documentType === DEMO_EXISTING_DOCUMENT.documentType &&
    data.documentNumber === DEMO_EXISTING_DOCUMENT.documentNumber;

  if (isExisting) {
    return { exists: true, profile: DEMO_EXISTING_PROFILE };
  }

  return { exists: false };
}

export async function demoListCompanies(): Promise<CompanyOption[]> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  return DEMO_COMPANIES;
}

export async function demoRegisterUser(): Promise<{ message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { message: "Registro completado" };
}
