import { useEffect, useMemo, useState } from "react";
import { useAuditoriaCambiosEmpresa } from "@/features/auditoria-cambios/model/useAuditoriaCambiosEmpresa";
import {
  AUDITORIA_SEEN_CHANGED_EVENT,
  countUnreadAuditoriaCambios,
} from "@/shared/lib/auditoriaSeenStorage";

const DEFAULT_AUDITORIA_PARAMS = { page: 1, page_size: 100 } as const;

/** Count of employee/system data changes the company has not opened yet. */
export function useUnreadAuditoriaCambiosCount(enabled = true): number {
  const [seenVersion, setSeenVersion] = useState(0);

  const query = useAuditoriaCambiosEmpresa(
    DEFAULT_AUDITORIA_PARAMS,
    { enabled },
  );

  useEffect(() => {
    if (!enabled) return;

    const bump = () => setSeenVersion((version) => version + 1);
    window.addEventListener(AUDITORIA_SEEN_CHANGED_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(AUDITORIA_SEEN_CHANGED_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, [enabled]);

  return useMemo(() => {
    if (!enabled) return 0;
    void seenVersion;
    return countUnreadAuditoriaCambios(query.data?.results ?? []);
  }, [enabled, query.data?.results, seenVersion]);
}
