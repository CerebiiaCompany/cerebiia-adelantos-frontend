// ⚠️ AGNOSTIC — adelantos API types (backend /adelantos/solicitudes/)

export type EstadoSolicitud =
  | "solicitado"
  | "en_revision"
  | "aprobado"
  | "rechazado"
  | "pagado";

export interface SolicitudAdelantoDTO {
  id: string;
  empleado_id: string;
  empresa_id: string;
  monto: string;
  monto_neto?: string;
  numero_cuotas_snapshot: number;
  plazo_dias_snapshot: number;
  estado: EstadoSolicitud;
  created_at: string;
}

export interface CrearSolicitudAdelantoRequest {
  monto: string;
  numero_cuotas: number;
}

export interface EmpleadoEmpresaSummaryDTO {
  id: string;
  nombre?: string;
  razon_social?: string;
}

export interface EmpleadoMeDTO {
  empleado_id: string;
  nombre: string;
  salario: string;
  empresa_id: string;
  /** Monto que aún puede solicitar en adelantos (fuente de verdad del backend). */
  saldo_disponible?: string;
  /** Nombre comercial o razón social de la empresa del empleado. */
  empresa_nombre?: string;
  empresa?: EmpleadoEmpresaSummaryDTO;
  porcentaje_maximo_adelanto: string;
  monto_maximo_adelanto: string;
  documento: string;
  banco_nombre: string;
  numero_cuenta: string;
  tipo_cuenta: string;
  fecha_ingreso: string;
}
