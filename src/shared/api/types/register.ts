// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
import type { DocumentType } from "@/shared/validations/register.schema";
import type { Gender, ColombianDepartment } from "@/shared/constants/colombia";

export interface VerifyDocumentRequest {
  documentType: DocumentType;
  documentNumber: string;
}

export interface UserProfileData {
  firstNames: string;
  lastNames: string;
  gender: Gender;
  cityId: string;
  cityName: string;
  department: ColombianDepartment;
  address: string;
  companyId: string;
  companyName: string;
  paymentDay: number;
  email: string;
  phone: string;
}

export interface VerifyDocumentResponse {
  exists: boolean;
  profile?: UserProfileData;
}

export interface CompanyOption {
  id: string;
  name: string;
}

export interface RegisterUserRequest {
  documentType: DocumentType;
  documentNumber: string;
  password: string;
  profile: UserProfileData;
  identityFiles?: {
    front: File;
    back?: File;
    selfie?: File;
    laborCert?: File;
  };
}

export interface RegisterUserResponse {
  message: string;
}
