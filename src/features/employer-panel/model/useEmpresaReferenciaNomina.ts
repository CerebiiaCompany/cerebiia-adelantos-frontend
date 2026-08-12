import { useQuery } from "@tanstack/react-query";
import { adelantosEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";

export function currentNominaPeriodoKey(reference = new Date()): string {
  const month = String(reference.getMonth() + 1).padStart(2, "0");
  return `${reference.getFullYear()}-${month}`;
}

export function useEmpresaReferenciaNomina(periodo?: string) {
  const resolvedPeriodo = periodo ?? currentNominaPeriodoKey();

  return useQuery({
    queryKey: ["adelantos", "empresa", "referencia-nomina", resolvedPeriodo],
    queryFn: () => adelantosEndpoints.getReferenciaNominaEmpresa(resolvedPeriodo),
    enabled: Boolean(env.apiUrl),
    staleTime: 30_000,
  });
}
