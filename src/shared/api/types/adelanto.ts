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
  decidido_por_id?: string | null;
  decidido_en?: string | null;
  pagado_en?: string | null;
  /** Motivo ingresado por el super admin al rechazar (null si no está rechazada). */
  motivo_rechazo?: string | null;
  /** Path del FileField (legacy / admin). Preferir comprobante_pago_url. */
  comprobante_pago?: string | null;
  /** URL usable de evidencia (absoluta o /media/...). Fuente de verdad para el front. */
  comprobante_pago_url?: string | null;
}

/** Item de GET /adelantos/empresa/historial-solicitudes/ */
export interface HistorialSolicitudEmpresaDTO {
  id: string;
  empleado_id: string;
  empleado_nombre: string;
  empleado_documento: string;
  monto: string;
  monto_neto: string;
  tarifa_total: string;
  numero_cuotas_snapshot: number;
  estado: EstadoSolicitud;
  created_at: string;
  decidido_por_id: string | null;
  decidido_por_nombre: string | null;
  decidido_en: string | null;
  /** Opcional: el historial empresa no lo requiere en UI. */
  motivo_rechazo?: string | null;
  comprobante_pago?: string | null;
  /** URL usable; nunca null si hay evidencia (FileField o URL externa). */
  comprobante_pago_url: string | null;
  pagado_en: string | null;
}

export interface HistorialSolicitudesEmpresaParams {
  estado?: EstadoSolicitud;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  page_size?: number;
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

/**
 * Contrato real de GET /empleados/me/ (7 campos core).
 * Campos opcionales pueden venir de futuros enriquecimientos;
 * banco/documento/fecha: preferir sesión de login o mi-situacion-financiera.
 */
export interface EmpleadoMeDTO {
  empleado_id: string;
  nombre: string;
  salario: string;
  empresa_id: string;
  porcentaje_maximo_adelanto: string;
  monto_maximo_adelanto: string;
  /** Monto que aún puede solicitar (fuente de verdad del backend). */
  saldo_disponible?: string;
  empresa_nombre?: string;
  empresa?: EmpleadoEmpresaSummaryDTO;
  tarifa_fija_por_cuota?: string;
  numero_maximo_cuotas?: number;
  plazo_maximo_dias?: number;
  documento?: string;
  banco_nombre?: string;
  numero_cuenta?: string;
  tipo_cuenta?: string;
  fecha_ingreso?: string;
}
