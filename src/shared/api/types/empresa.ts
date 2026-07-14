// ⚠️ AGNOSTIC — tipos de empresas (super_admin)

export interface EmpresaListItemDTO {
  id: string;
  nombre: string;
  nit: string;
  user_id: string;
  dia_pago_nomina: number;
  activa: boolean;
  total_empleados: number;
  total_solicitudes: number;
  monto_total_adelantado: string;
  created_at: string;
  updated_at: string;
}

export interface EmpresaEstadoDTO {
  id: string;
  nombre: string;
  nit: string;
  activa: boolean;
}

export interface EmpresasListParams {
  mes?: number;
  anio?: number;
}
