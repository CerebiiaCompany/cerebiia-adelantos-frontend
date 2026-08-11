import { useQuery } from "@tanstack/react-query";
import { empleadosEndpoints } from "@/shared/api/endpoints/empleados";

export function useAuditoriaCambiosMe(params?: {
  page?: number;
  page_size?: number;
}) {
  return useQuery({
    queryKey: ["empleados", "me", "auditoria-cambios", params ?? {}],
    queryFn: () => empleadosEndpoints.listAuditoriaCambiosMe(params),
  });
}
