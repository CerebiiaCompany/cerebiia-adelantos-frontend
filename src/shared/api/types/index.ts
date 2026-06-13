// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  role: "employee" | "employer" | "admin";
}

export interface AdvanceDTO {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "disbursed";
  requestedAt: string;
  employeeId: string;
}

export interface ApiError {
  message: string;
  code: string;
}

export type {
  VerifyDocumentRequest,
  VerifyDocumentResponse,
  UserProfileData,
  CompanyOption,
  RegisterUserRequest,
  RegisterUserResponse,
} from "./register";
