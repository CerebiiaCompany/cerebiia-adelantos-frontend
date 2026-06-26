// ⚠️ AGNOSTIC — employee onboarding API types

export type EmpleadoEstado = "pre_registrado" | "activo";

export type TipoDocumento = "cc" | "ce" | "ti" | "pas";

export type TipoContratoEmpleado =
  | "indefinido"
  | "fijo"
  | "obra_labor"
  | "prestacion_servicios"
  | "aprendizaje";

export type TipoCuentaEmpleado = "ahorros" | "corriente";

export interface BancoDTO {
  id: string;
  nombre: string;
  codigo: string;
}

export interface EmpleadoDTO {
  id: string;
  documento: string;
  nombre: string;
  salario: string;
  banco_id: string;
  banco_nombre: string;
  numero_cuenta: string;
  tipo_documento: TipoDocumento;
  email_empleado: string;
  celular: string;
  tipo_contrato: TipoContratoEmpleado;
  fecha_ingreso: string;
  tipo_cuenta: TipoCuentaEmpleado;
  estado: EmpleadoEstado;
  empresa_id: string;
  saldo_disponible?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateEmpleadoMeRequest {
  email?: string;
  celular?: string;
  password?: string;
}

export interface CreateEmpleadoRequest {
  tipo_documento: TipoDocumento;
  documento: string;
  nombre: string;
  email: string;
  celular: string;
  salario: string;
  tipo_contrato: TipoContratoEmpleado;
  fecha_ingreso: string;
  banco_id: string;
  tipo_cuenta: TipoCuentaEmpleado;
  numero_cuenta: string;
}

export type CreateEmpleadoResponse = EmpleadoDTO;

export interface VerificarPreRegistroRequest {
  documento: string;
}

export interface VerificarPreRegistroResponse {
  existe: boolean;
  nombre: string;
  ya_activo: boolean;
}

export interface ActivarEmpleadoRequest {
  documento: string;
  password: string;
}

export type ActivarEmpleadoResponse = {
  id: string;
  documento: string;
  nombre: string;
  salario: string;
  banco?: string;
  banco_nombre?: string;
  numero_cuenta: string;
  estado: "activo";
  empresa_id: string;
  created_at: string;
  updated_at: string;
};

export interface ResultadoCargaNominaDTO {
  total: number;
  exitosos: number;
  fallidos: number;
  errores: Array<{
    fila: number;
    documento: string;
    errores: string[];
  }>;
}
