// ⚠️ AGNOSTIC — feature toggles (Vite env, build-time)

function readBooleanEnv(
  value: string | undefined,
  defaultValue: boolean,
): boolean {
  if (value === undefined || value.trim() === "") return defaultValue;
  return value === "true" || value === "1";
}

/**
 * Omite la ventana de fechas del adelanto (días 1–20 del mes).
 * Útil mientras se prueban endpoints del backend fuera de esas fechas.
 * Activar: VITE_BYPASS_ADELANTO_DATE_WINDOW=true
 */
export function isAdelantoDateWindowBypassed(): boolean {
  return readBooleanEnv(
    import.meta.env.VITE_BYPASS_ADELANTO_DATE_WINDOW as string | undefined,
    false,
  );
}
