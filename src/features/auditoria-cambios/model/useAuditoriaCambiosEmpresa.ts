import { useQuery } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints/empleados";

export function useAuditoriaCambiosEmpresa(params?: {
  page?: number;
  page_size?: number;
  empleado_id?: string;
}) {
  return useQuery({
    queryKey: ["empleados", "empresa", "auditoria-cambios", params ?? {}],
    queryFn: () => empleadosEndpoints.listAuditoriaCambiosEmpresa(params),
  });
}
