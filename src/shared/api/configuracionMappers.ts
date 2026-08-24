import type { AdelantoConfiguracionDTO } from "./types/configuracion";
import type { EmpleadoMeDTO } from "./types/adelanto";

export interface ParsedAdelantoConfiguracion {
  porcentajeMaximoAdelanto: number;
  numeroMaximoCuotas: number;
  plazoMaximoDias: number;
  tarifaFijaPorCuota: number;
  montoMinimoAdelanto: number | null;
  updatedAt: string;
}

const DEFAULT_TARIFA_FIJA_POR_CUOTA = 8_000;
const DEFAULT_PORCENTAJE_MAXIMO = 30;
const DEFAULT_NUMERO_MAXIMO_CUOTAS = 3;
const DEFAULT_PLAZO_MAXIMO_DIAS = 90;

function parseNumericValue(val: unknown): number {
  if (val === null || val === undefined) return Number.NaN;
  if (typeof val === "number") return Number.isFinite(val) ? val : Number.NaN;
  const str = String(val).replace(/[^0-9.-]/g, "").trim();
  if (!str) return Number.NaN;
  const parsed = Number.parseFloat(str);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

export function mapAdelantoConfiguracion(
  dto: AdelantoConfiguracionDTO,
): ParsedAdelantoConfiguracion {
  const tarifa = parseNumericValue(dto.tarifa_fija_por_cuota);
  const porcentaje = parseNumericValue(dto.porcentaje_maximo_adelanto);
  const cuotas = parseNumericValue(dto.numero_maximo_cuotas);
  const plazo = parseNumericValue(dto.plazo_maximo_dias);
  const minimo = parseNumericValue(dto.monto_minimo ?? dto.monto_minimo_adelanto);

  return {
    porcentajeMaximoAdelanto: Number.isNaN(porcentaje)
      ? DEFAULT_PORCENTAJE_MAXIMO
      : porcentaje,
    numeroMaximoCuotas:
      !Number.isNaN(cuotas) && cuotas > 0
        ? cuotas
        : DEFAULT_NUMERO_MAXIMO_CUOTAS,
    plazoMaximoDias:
      !Number.isNaN(plazo) && plazo > 0
        ? plazo
        : DEFAULT_PLAZO_MAXIMO_DIAS,
    tarifaFijaPorCuota: Number.isNaN(tarifa)
      ? DEFAULT_TARIFA_FIJA_POR_CUOTA
      : Math.round(tarifa),
    montoMinimoAdelanto: Number.isNaN(minimo) ? null : Math.round(minimo),
    updatedAt: dto.updated_at ?? "",
  };
}

/**
 * Fallback de config desde GET /empleados/me/ cuando no hay mi-situacion-financiera.
 * Preferir GET /adelantos/mi-situacion-financiera/ o GET /configuracion/ (lectura).
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
    montoMinimoAdelanto: null,
    updatedAt: "",
  };
}
