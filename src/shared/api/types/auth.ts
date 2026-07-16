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
  /**
   * true = el usuario empresa debe cambiar la contraseña por defecto
   * en el primer inicio de sesión (solo aplica a role === "empresa").
   */
  must_change_password?: boolean;
  /** Nombre comercial de la empresa (registro). Solo role empresa. */
  empresa_nombre?: string;
  created_at: string;
  updated_at: string;
}

export interface EmpleadoProfile {
  id: string;
  documento: string;
  nombre: string;
  salario: string;
  /** Nombre del banco normalizado para la UI. */
  banco?: string;
  /** Campo devuelto por el backend en login/activación. */
  banco_nombre?: string;
  numero_cuenta: string;
  tipo_cuenta?: string;
  fecha_ingreso?: string;
  email_empleado?: string;
  celular?: string;
  estado: EmpleadoEstado;
  empresa_id: string;
  /** Nombre comercial de la empresa vinculada. */
  empresa_nombre?: string;
  created_at: string;
  updated_at: string;
}

/** Respuesta cruda del backend al iniciar sesión como empleado. */
export type EmpleadoApiProfile = Omit<EmpleadoProfile, "banco"> & {
  banco_id?: string;
  banco?: string;
  banco_nombre?: string;
  tipo_cuenta?: string;
  fecha_ingreso?: string;
  email_empleado?: string;
  celular?: string;
};

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
  empleado: EmpleadoApiProfile;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface LogoutRequest {
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
