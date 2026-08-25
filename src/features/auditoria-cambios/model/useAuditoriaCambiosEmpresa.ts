import { useQuery } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints/empleados";

export function useAuditoriaCambiosEmpresa(
  params?: {
    page?: number;
    page_size?: number;
    empleado_id?: string;
  },
  options?: { enabled?: boolean },
) {
  const page = params?.page ?? 1;
  const pageSize = params?.page_size ?? 20;
  const empleadoId = params?.empleado_id ?? "";

  return useQuery({
    queryKey: ["empleados", "empresa", "auditoria-cambios", page, pageSize, empleadoId],
    queryFn: () => empleadosEndpoints.listAuditoriaCambiosEmpresa(params),
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

