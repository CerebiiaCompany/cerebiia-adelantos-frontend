// ⚠️ AGNOSTIC — carga diferida del catálogo de municipios
import type { ColombianCity } from "./colombia";

let citiesCache: ColombianCity[] | null = null;

export async function loadColombianCities(): Promise<ColombianCity[]> {
  if (citiesCache) return citiesCache;

  const module = await import("./colombian-cities.json");
  citiesCache = module.default as ColombianCity[];
  return citiesCache;
}
