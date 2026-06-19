// ⚠️ AGNOSTIC — JWT auth contract (Cerebiia Adelantos backend)

export type BackendUserRole = "super_admin" | "empresa" | "empleado";

/** Roles permitidos en esta aplicación (sin super_admin). */
export type AppUserRole = "employer" | "employee";

export type AuthActorType = "system_user" | "empleado";

export type EmpleadoEstado = "pre_registrado" | "activo";

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  role: BackendUserRole;
  created_at: string;
  updated_at: string;
}

export interface EmpleadoProfile {
  id: string;
  documento: string;
  nombre: string;
  salario: string;
  banco: string;
  numero_cuenta: string;
  estado: EmpleadoEstado;
  empresa_id: string;
  created_at: string;
  updated_at: string;
}

export interface SystemUserLoginRequest {
  email: string;
  password: string;
}

export interface EmpleadoLoginRequest {
  documento: string;
  password: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface SystemUserLoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface EmpleadoLoginResponse {
  empleado: EmpleadoProfile;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
  refresh: string;
}

export interface SystemUserSession {
  actorType: "system_user";
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface EmpleadoSession {
  actorType: "empleado";
  accessToken: string;
  refreshToken: string;
  empleado: EmpleadoProfile;
}

export type AuthSession = SystemUserSession | EmpleadoSession;

/** @deprecated Use SystemUserLoginRequest */
export type LoginRequest = SystemUserLoginRequest;

/** @deprecated Use SystemUserLoginResponse */
export type LoginResponse = SystemUserLoginResponse;
