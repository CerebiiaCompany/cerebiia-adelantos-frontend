import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchEmpleadoDocumentoExists } from "@/shared/api/empleadoList";
import { empleadosEndpoints } from "@/shared/api/endpoints";
import { env } from "@/shared/config/env";
import { isValidEmpleadoDocumentNumber } from "@/shared/validations/empleadoDocumentValidation";
import type { DocumentType } from "@/shared/validations/register.schema";

const DOCUMENTO_CHECK_DEBOUNCE_MS = 450;

export const EMPLEADO_DOCUMENTO_EXISTS_QUERY_KEY = [
  "empleado-documento-exists",
] as const;

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function useEmpleadoDocumentoExists(
  tipoDocumento: DocumentType | "",
  documento: string,
  enabled = true,
) {
  const debouncedDocumento = useDebouncedValue(documento.trim(), DOCUMENTO_CHECK_DEBOUNCE_MS);

  const canCheck = Boolean(
    enabled &&
      env.apiUrl &&
      tipoDocumento &&
      debouncedDocumento &&
      isValidEmpleadoDocumentNumber(tipoDocumento, debouncedDocumento),
  );

  const query = useQuery({
    queryKey: [
      ...EMPLEADO_DOCUMENTO_EXISTS_QUERY_KEY,
      debouncedDocumento,
    ] as const,
    queryFn: () =>
      fetchEmpleadoDocumentoExists(
        (params) => empleadosEndpoints.list(params),
        debouncedDocumento,
      ),
    enabled: canCheck,
    staleTime: 30_000,
    retry: false,
  });

  return {
    exists: canCheck ? Boolean(query.data) : false,
    isChecking: canCheck && query.isFetching,
    canCheck,
  };
}
