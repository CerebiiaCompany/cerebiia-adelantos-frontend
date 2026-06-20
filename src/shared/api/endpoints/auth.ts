// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports
import { http } from "../client";
import type {
  AuthUser,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  LogoutRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterUserRequest,
  RegisterUserResponse,
  ResetPasswordRequest,
  SystemUserLoginRequest,
  SystemUserLoginResponse,
  VerifyDocumentRequest,
  VerifyDocumentResponse,
} from "../types";

export const authEndpoints = {
  login: (data: SystemUserLoginRequest) =>
    http.post<SystemUserLoginResponse>("/auth/login/", data),
  refresh: (data: RefreshTokenRequest) =>
    http.post<RefreshTokenResponse>("/auth/refresh/", data),
  logout: (data: LogoutRequest) => http.post<void>("/auth/logout/", data),
  me: () => http.get<AuthUser>("/auth/me/"),
  forgotPassword: (data: ForgotPasswordRequest) =>
    http.post<ForgotPasswordResponse>("/auth/password/forgot/", data),
  changePassword: (data: ChangePasswordRequest) =>
    http.post<ChangePasswordResponse>("/auth/password/change/", data),
  resetPassword: (data: ResetPasswordRequest) =>
    http.post<void>("/auth/password/reset/", data),
  verifyDocument: (data: VerifyDocumentRequest) =>
    http.post<VerifyDocumentResponse>("/auth/register/verify/", data),
  register: (data: RegisterUserRequest) =>
    http.post<RegisterUserResponse>("/auth/register/", data),
};
