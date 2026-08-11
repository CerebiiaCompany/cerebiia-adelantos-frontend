import { useQuery } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints/empleados";

export function useReportesDatoIncorrectoMe(
  params?: {
    page?: number;
    page_size?: number;
  },
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["empleados", "reportes-datos", "me", params ?? {}],
    queryFn: () => empleadosEndpoints.listReportesDatoIncorrectoMe(params),
    enabled: options?.enabled ?? true,
  });
}
