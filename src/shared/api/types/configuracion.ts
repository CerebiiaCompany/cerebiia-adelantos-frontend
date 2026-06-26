/** Configuración global de adelantos (super admin). */
export interface AdelantoConfiguracionDTO {
  porcentaje_maximo_adelanto: string;
  numero_maximo_cuotas: number;
  plazo_maximo_dias: number;
  tarifa_fija_por_cuota: string;
  updated_at: string;
}
