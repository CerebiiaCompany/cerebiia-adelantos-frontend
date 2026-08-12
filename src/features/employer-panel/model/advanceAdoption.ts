/**
 * Adopción de adelantos: empleados en nómina (activos) que han solicitado
 * al menos un adelanto vs el total de activos.
 */

export type AdvanceAdoptionStats = {
  totalNomina: number;
  conAdelanto: number;
  sinAdelanto: number;
  /** 0–100, redondeado. */
  porcentaje: number;
};

export function computeAdvanceAdoptionStats(
  totalNomina: number,
  employeeIdsWithAdvance: Iterable<string>,
): AdvanceAdoptionStats {
  const safeTotal = Number.isFinite(totalNomina) && totalNomina > 0 ? totalNomina : 0;
  const unique = new Set(
    [...employeeIdsWithAdvance].filter((id) => typeof id === "string" && id.length > 0),
  );
  const conAdelanto = safeTotal > 0 ? Math.min(unique.size, safeTotal) : unique.size;
  const sinAdelanto = Math.max(0, safeTotal - conAdelanto);
  const porcentaje =
    safeTotal > 0 ? Math.round((conAdelanto / safeTotal) * 100) : 0;

  return {
    totalNomina: safeTotal,
    conAdelanto,
    sinAdelanto,
    porcentaje,
  };
}
