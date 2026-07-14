import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  mapAdelantoConfiguracion,
  resolveAdelantoConfigFromEmpleadoMe,
  type ParsedAdelantoConfiguracion,
} from "@/shared/api";
import { configuracionEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";
import { useEmpleadoMe } from "./useEmpleadoMe";
import { useMiSituacionFinanciera } from "./useMiSituacionFinanciera";

function mapSituacionToConfig(
  situacion: NonNullable<
    ReturnType<typeof useMiSituacionFinanciera>["data"]
  >,
): ParsedAdelantoConfiguracion {
  const tarifa = Number.parseFloat(situacion.tarifa_por_cuota);
  const porcentaje = Number.parseFloat(situacion.porcentaje_maximo);

  return {
    porcentajeMaximoAdelanto: Number.isNaN(porcentaje) ? 30 : porcentaje,
    numeroMaximoCuotas:
      situacion.cuotas_maximas > 0 ? situacion.cuotas_maximas : 3,
    plazoMaximoDias:
      situacion.plazo_maximo_dias > 0 ? situacion.plazo_maximo_dias : 90,
    tarifaFijaPorCuota: Number.isNaN(tarifa) ? 8_000 : Math.round(tarifa),
    updatedAt: "",
  };
}

/**
 * Config de adelantos para el empleado.
 * Prioridad: GET /configuracion/ (super admin) → mi-situacion-financiera → /empleados/me/
 */
export function useAdelantoConfig() {
  const empleadoQuery = useEmpleadoMe();
  const situacionQuery = useMiSituacionFinanciera();
  const configuracionQuery = useQuery({
    queryKey: ["adelantos", "configuracion"],
    queryFn: async () => {
      const dto = await configuracionEndpoints.getAdelantos();
      return mapAdelantoConfiguracion(dto);
    },
    enabled: Boolean(env.apiUrl),
    staleTime: 60_000,
  });

  const data = useMemo(() => {
    // Fuente de verdad del super admin
    if (configuracionQuery.data) {
      return configuracionQuery.data;
    }

    if (situacionQuery.data) {
      return mapSituacionToConfig(situacionQuery.data);
    }

    if (empleadoQuery.data) {
      return resolveAdelantoConfigFromEmpleadoMe(empleadoQuery.data) ?? undefined;
    }

    return undefined;
  }, [situacionQuery.data, configuracionQuery.data, empleadoQuery.data]);

  return {
    ...empleadoQuery,
    isLoading:
      empleadoQuery.isLoading ||
      situacionQuery.isLoading ||
      configuracionQuery.isLoading,
    isError:
      empleadoQuery.isError ||
      situacionQuery.isError ||
      configuracionQuery.isError,
    data,
    hasConfig: data != null,
    solicitudActiva: situacionQuery.data?.resumen.solicitud_activa ?? false,
    saldoDisponible: situacionQuery.data?.saldo_disponible,
    montoMaximoSolicitable: situacionQuery.data?.monto_maximo_solicitable,
  };
}
