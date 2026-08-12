// ⚠️ AGNOSTIC — tipos de empresas (super_admin + self-service empresa)

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

export interface ExcelBrandColorsDTO {
  primaryDark: string;
  accent: string;
  headerBg: string;
  headerFg: string;
  altRowBg: string;
  border: string;
  footerBg: string;
  text: string;
}

export interface ExcelBrandingDTO {
  preset_id: string;
  colors: ExcelBrandColorsDTO;
  apply_to: "nomina" | "liquidacion" | "todos";
  logo_file_name: string;
  logo_url: string | null;
}

export interface UpdateExcelBrandingRequest {
  preset_id: string;
  colors: ExcelBrandColorsDTO;
  apply_to: "nomina" | "liquidacion" | "todos";
}
