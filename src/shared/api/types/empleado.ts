// ⚠️ AGNOSTIC — employee onboarding API types

export type EmpleadoEstado = "pre_registrado" | "activo";

export interface EmpleadoDTO {
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

export interface CreateEmpleadoRequest {
  documento: string;
  nombre: string;
  salario: string;
  banco: string;
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
