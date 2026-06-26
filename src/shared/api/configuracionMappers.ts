import type { AdelantoConfiguracionDTO } from "./types/configuracion";
import type { EmpleadoMeDTO } from "./types/adelanto";

export interface ParsedAdelantoConfiguracion {
  porcentajeMaximoAdelanto: number;
  numeroMaximoCuotas: number;
  plazoMaximoDias: number;
  tarifaFijaPorCuota: number;
  updatedAt: string;
}

const DEFAULT_TARIFA_FIJA_POR_CUOTA = 8_000;
const DEFAULT_PORCENTAJE_MAXIMO = 30;
const DEFAULT_NUMERO_MAXIMO_CUOTAS = 3;
const DEFAULT_PLAZO_MAXIMO_DIAS = 90;

export function mapAdelantoConfiguracion(
  dto: AdelantoConfiguracionDTO,
): ParsedAdelantoConfiguracion {
  const tarifa = Number.parseFloat(dto.tarifa_fija_por_cuota);
  const porcentaje = Number.parseFloat(dto.porcentaje_maximo_adelanto);

  return {
    porcentajeMaximoAdelanto: Number.isNaN(porcentaje)
      ? DEFAULT_PORCENTAJE_MAXIMO
      : porcentaje,
    numeroMaximoCuotas:
      dto.numero_maximo_cuotas > 0
        ? dto.numero_maximo_cuotas
        : DEFAULT_NUMERO_MAXIMO_CUOTAS,
    plazoMaximoDias:
      dto.plazo_maximo_dias > 0
        ? dto.plazo_maximo_dias
        : DEFAULT_PLAZO_MAXIMO_DIAS,
    tarifaFijaPorCuota: Number.isNaN(tarifa)
      ? DEFAULT_TARIFA_FIJA_POR_CUOTA
      : Math.round(tarifa),
    updatedAt: dto.updated_at,
  };
}

/**
 * Configuración de adelantos expuesta en GET /empleados/me/ para el empleado.
 * El endpoint /configuracion/ requiere super admin; el empleado no puede consumirlo.
 */
export function resolveAdelantoConfigFromEmpleadoMe(
  nomina: EmpleadoMeDTO,
): ParsedAdelantoConfiguracion | null {
  const tarifaRaw = nomina.tarifa_fija_por_cuota?.trim();
  if (!tarifaRaw) return null;

  const tarifa = Number.parseFloat(tarifaRaw);
  if (Number.isNaN(tarifa)) return null;

  const porcentaje = Number.parseFloat(nomina.porcentaje_maximo_adelanto);

  return {
    porcentajeMaximoAdelanto: Number.isNaN(porcentaje)
      ? DEFAULT_PORCENTAJE_MAXIMO
      : porcentaje,
    numeroMaximoCuotas:
      nomina.numero_maximo_cuotas && nomina.numero_maximo_cuotas > 0
        ? nomina.numero_maximo_cuotas
        : DEFAULT_NUMERO_MAXIMO_CUOTAS,
    plazoMaximoDias:
      nomina.plazo_maximo_dias && nomina.plazo_maximo_dias > 0
        ? nomina.plazo_maximo_dias
        : DEFAULT_PLAZO_MAXIMO_DIAS,
    tarifaFijaPorCuota: Math.round(tarifa),
    updatedAt: "",
  };
}
