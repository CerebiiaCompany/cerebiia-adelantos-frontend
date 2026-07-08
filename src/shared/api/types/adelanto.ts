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
  monto_a_recibir?: string;
  tarifa_fija_por_cuota_snapshot?: string;
  tarifa_total?: string;
  numero_cuotas_snapshot: number;
  plazo_dias_snapshot: number;
  estado: EstadoSolicitud;
  created_at: string;
  updated_at?: string;
  /** Motivo ingresado por el super admin al rechazar la solicitud. */
  motivo_rechazo?: string | null;
  /** Ruta relativa del comprobante de transferencia (solo cuando estado = pagado). */
  comprobante_pago?: string | null;
  comprobante_pago_url?: string | null;
}

export interface CuotaAdelantoDTO {
  id: string;
  solicitud_id: string;
  numero: number;
  monto: string;
  tarifa_cuota: string;
  fecha_corte: string;
  estado: "pendiente" | "pagado";
  fecha_pago: string | null;
}

export interface SolicitudDetalleDTO {
  solicitud: SolicitudAdelantoDTO;
  cuotas: CuotaAdelantoDTO[];
}

export interface TendenciaMensualDTO {
  anio: number;
  mes: number;
  monto_total: string;
  total: number;
}

export interface MiSituacionFinancieraResumenDTO {
  total_solicitudes: number;
  conteo_por_estado: Partial<Record<EstadoSolicitud, number>>;
  monto_total_solicitado: string;
  monto_total_aprobado: string;
  ultima_solicitud: SolicitudAdelantoDTO | null;
  solicitud_activa: boolean;
}

export interface MiSituacionFinancieraDTO {
  salario: string;
  saldo_disponible: string;
  monto_maximo_solicitable: string;
  porcentaje_maximo: string;
  cuotas_maximas: number;
  tarifa_por_cuota: string;
  plazo_maximo_dias: number;
  resumen: MiSituacionFinancieraResumenDTO;
  tendencia_mensual: TendenciaMensualDTO[];
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
  /** Tarifa fija por cuota (misma fuente que GET /configuracion/ del super admin). */
  tarifa_fija_por_cuota?: string;
  numero_maximo_cuotas?: number;
  plazo_maximo_dias?: number;
  documento: string;
  banco_nombre: string;
  numero_cuenta: string;
  tipo_cuenta: string;
  fecha_ingreso: string;
}
