/** Configuración global de adelantos (super admin / empresa). */
export interface AdelantoConfiguracionDTO {
  porcentaje_maximo_adelanto: string | number;
  numero_maximo_cuotas: number | string;
  plazo_maximo_dias: number | string;
  tarifa_fija_por_cuota: string | number;
  /** Monto mínimo permitido (opcional según backend). */
  monto_minimo?: string | number | null;
  monto_minimo_adelanto?: string | number | null;
  updated_at?: string;
}

