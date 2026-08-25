// ⚠️ AGNOSTIC — employee onboarding API types

export type EmpleadoEstado = "pre_registrado" | "activo" | "inactivo";

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
  empresa_nombre?: string;
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

/** Mismos campos que crear empleado (todos requeridos en PUT). */
export type UpdateEmpleadoRequest = CreateEmpleadoRequest;

export interface VerificarPreRegistroRequest {
  documento: string;
  tipo_documento: string;
}

export interface VerificarPreRegistroResponse {
  existe: boolean;
  nombre: string;
  ya_activo: boolean;
  documento: string;
  tipo_documento: string;
  celular: string;
  banco_id: string;
  banco_nombre: string;
  tipo_cuenta: string;
  numero_cuenta: string;
}

export interface ActivarEmpleadoRequest {
  documento: string;
  tipo_documento: string;
  password: string;
  /** Aceptación de tratamiento de datos (obligatorias/sensibles) + T&C. */
  acepto_tratamiento_datos_y_terminos: boolean;
  nombre?: string;
  celular?: string;
  banco_id?: string;
  tipo_cuenta?: string;
  numero_cuenta?: string;
  documento_actualizado?: string;
  tipo_documento_actualizado?: string;
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

export type AuditoriaCambioActorTipo = "empleado" | "empresa" | "sistema";

export type AuditoriaCambioAccion =
  | "confirmacion_activacion"
  | "actualizacion_propia"
  | "actualizacion_empresa";

export interface AuditoriaCambioCampoDTO {
  campo: string;
  etiqueta: string;
  valor_anterior: string;
  valor_nuevo: string;
}

export interface AuditoriaCambioEmpleadoDTO {
  id: string;
  empleado_id: string;
  empresa_id: string;
  empleado_nombre: string;
  empleado_documento: string;
  actor_tipo: AuditoriaCambioActorTipo | string;
  actor_nombre: string;
  accion: AuditoriaCambioAccion | string;
  cambios: AuditoriaCambioCampoDTO[];
  created_at: string;
}

export interface ListadoAuditoriaCambioDTO {
  count: number;
  page: number;
  page_size: number;
  results: AuditoriaCambioEmpleadoDTO[];
}

export type CampoReporteDatoIncorrecto =
  | "documento"
  | "nombre"
  | "banco"
  | "tipo_cuenta"
  | "numero_cuenta";

export type EstadoReporteDatoIncorrecto =
  | "pendiente"
  | "en_revision"
  | "respondido"
  | "resuelto"
  | "finalizado";

export interface EvidenciaAdjuntoDTO {
  nombre: string;
  path: string;
  url: string;
}

export interface SoporteMensajeDTO {
  id: string;
  remitente: "empleado" | "empresa" | string;
  remitente_nombre?: string;
  mensaje: string;
  created_at: string;
  evidencias?: EvidenciaAdjuntoDTO[];
}

export interface ReporteDatoIncorrectoDTO {
  id: string;
  empleado_id: string;
  empresa_id: string;
  empleado_nombre: string;
  empleado_documento: string;
  campos_reportados: CampoReporteDatoIncorrecto[] | string[];
  mensaje: string;
  evidencias: EvidenciaAdjuntoDTO[];
  estado: EstadoReporteDatoIncorrecto | string;
  respuesta_empresa?: string;
  respondido_por_nombre?: string;
  empresa_nombre?: string;
  respondido_en?: string | null;
  mensajes?: SoporteMensajeDTO[];
  finalizado?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ListadoReporteDatoIncorrectoDTO {
  count: number;
  page: number;
  page_size: number;
  results: ReporteDatoIncorrectoDTO[];
}

/** KPIs de nómina de la empresa autenticada (`GET /empleados/metricas/`). */
export interface MetricasEmpresaEmpleadosDTO {
  total: number;
  activos: number;
  pre_registrados: number;
  inactivos: number;
}

/** Resumen del empleado en cartera pendiente. */
export interface CarteraEmpleadoResumenDTO {
  id: string;
  nombre: string;
  documento: string;
  salario: string;
  estado: EmpleadoEstado | string;
}

/** Cuota pendiente de un adelanto ya desembolsado. */
export interface CarteraCuotaPendienteDTO {
  cuota_id: string;
  solicitud_id: string;
  cuota_numero: number;
  cuota_monto: string;
  tarifa_cuota: string;
  fecha_corte: string;
  monto_solicitud: string;
  monto_neto: string;
  tarifa_total: string;
  numero_cuotas_total: number;
  pagado_en: string | null;
}

export interface CarteraTotalesDTO {
  cantidad_cuotas: number;
  total_capital: string;
  total_tarifas: string;
  total_a_descontar: string;
}

/** `GET /empleados/{id}/cartera-pendiente/` */
export interface CarteraPendienteEmpleadoDTO {
  empleado: CarteraEmpleadoResumenDTO;
  generado_en: string;
  cuotas_pendientes: CarteraCuotaPendienteDTO[];
  totales: CarteraTotalesDTO;
}
