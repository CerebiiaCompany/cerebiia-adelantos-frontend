import { useQuery } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints/empleados";

export function useReportesDatoIncorrectoEmpresa(params?: {
  page?: number;
  page_size?: number;
  estado?: string;
}) {
  return useQuery({
    queryKey: ["empleados", "reportes-datos", "empresa", params ?? {}],
    queryFn: () => empleadosEndpoints.listReportesDatoIncorrectoEmpresa(params),
  });
}
