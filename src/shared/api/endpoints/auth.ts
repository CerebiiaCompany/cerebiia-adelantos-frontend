// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
import { http } from "../client";
import type {
  LoginRequest,
  AuthResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  VerifyDocumentRequest,
  VerifyDocumentResponse,
  RegisterUserRequest,
  RegisterUserResponse,
} from "../types";

export const authEndpoints = {
  login: (data: LoginRequest) => http.post<AuthResponse>("/auth/login", data),
  logout: () => http.post<void>("/auth/logout", {}),
  me: () => http.get<AuthResponse>("/auth/me"),
  forgotPassword: (data: ForgotPasswordRequest) =>
    http.post<ForgotPasswordResponse>("/auth/password/forgot", data),
  verifyDocument: (data: VerifyDocumentRequest) =>
    http.post<VerifyDocumentResponse>("/auth/register/verify", data),
  register: (data: RegisterUserRequest) =>
    http.post<RegisterUserResponse>("/auth/register", data),
};
