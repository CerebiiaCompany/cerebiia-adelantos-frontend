import { useEffect, useMemo, useState } from "react";
import { useAuthAccess } from "@/features/auth";
import { useReportesDatoIncorrectoMe } from "@/features/soporte/model/useReportesDatoIncorrectoMe";
import {
  countUnreadSoporteResponses,
  SOPORTE_SEEN_CHANGED_EVENT,
} from "@/shared/lib/soporteSeenStorage";

/** Count of company replies the employee has not opened yet. */
export function useUnreadSoporteCount(): number {
  const { appRole } = useAuthAccess();
  const enabled = appRole === "employee";
  const [seenVersion, setSeenVersion] = useState(0);

  const query = useReportesDatoIncorrectoMe(
    { page: 1, page_size: 100 },
    { enabled },
  );

  useEffect(() => {
    if (!enabled) return;

    const bump = () => setSeenVersion((version) => version + 1);
    window.addEventListener(SOPORTE_SEEN_CHANGED_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(SOPORTE_SEEN_CHANGED_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, [enabled]);

  return useMemo(() => {
    if (!enabled) return 0;
    void seenVersion;
    return countUnreadSoporteResponses(query.data?.results ?? []);
  }, [enabled, query.data?.results, seenVersion]);
}
