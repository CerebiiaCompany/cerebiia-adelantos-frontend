// ⚠️ AGNOSTIC — no react-router-dom, no react-dom, no UI imports

export type {
  AppUserRole,
  AuthActorType,
  AuthSession,
  AuthTokens,
  AuthUser,
  BackendUserRole,
  EmpleadoLoginRequest,
  EmpleadoLoginResponse,
  EmpleadoProfile,
  EmpleadoSession,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  SystemUserLoginRequest,
  SystemUserLoginResponse,
  SystemUserSession,
} from "./auth";

export type {
  ActivarEmpleadoRequest,
  ActivarEmpleadoResponse,
  BancoDTO,
  CreateEmpleadoRequest,
  CreateEmpleadoResponse,
  EmpleadoDTO,
  EmpleadoEstado,
  ResultadoCargaNominaDTO,
  TipoContratoEmpleado,
  TipoCuentaEmpleado,
  TipoDocumento,
  UpdateEmpleadoMeRequest,
  VerificarPreRegistroRequest,
  VerificarPreRegistroResponse,
} from "./empleado";

export type {
  CrearSolicitudAdelantoRequest,
  EmpleadoMeDTO,
  EstadoSolicitud,
  SolicitudAdelantoDTO,
} from "./adelanto";

export type { AdelantoConfiguracionDTO } from "./configuracion";

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface AdvanceDTO {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected" | "disbursed";
  requestedAt: string;
  employeeId: string;
}

/** @deprecated Use SolicitudAdelantoDTO from ./adelanto */
export type { SolicitudAdelantoDTO as AdvanceApiDTO } from "./adelanto";

export type {
  VerifyDocumentRequest,
  VerifyDocumentResponse,
  UserProfileData,
  CompanyOption,
  RegisterUserRequest,
  RegisterUserResponse,
} from "./register";
