// ⚠️ AGNOSTIC — employee onboarding API types

export type EmpleadoEstado = "pre_registrado" | "activo" | "inactivo";

export type TipoContratoEmpleado = "indefinido" | "fijo" | "obra_labor";
export type TipoCuentaEmpleado = "ahorros" | "corriente";
export type TipoDocumentoEmpleado = "CC" | "PASSPORT" | "CE" | "PPT";

export interface EmpleadoDTO {
  id: string;
  documento: string;
  nombre: string;
  salario: string;
  banco: string;
  numero_cuenta: string;
  estado: EmpleadoEstado;
  empresa_id: string;
  tipo_documento?: TipoDocumentoEmpleado;
  correo?: string;
  celular?: string;
  tipo_contrato?: TipoContratoEmpleado;
  fecha_ingreso?: string;
  tipo_cuenta?: TipoCuentaEmpleado;
  created_at: string;
  updated_at: string;
}

export interface CreateEmpleadoRequest {
  tipo_documento: TipoDocumentoEmpleado;
  documento: string;
  nombre: string;
  correo: string;
  celular: string;
  salario: string;
  tipo_contrato: TipoContratoEmpleado;
  fecha_ingreso: string;
  banco: string;
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
  banco: string;
  numero_cuenta: string;
  estado: "activo";
  empresa_id: string;
  created_at: string;
  updated_at: string;
};
