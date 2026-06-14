// ⚠️ AGNOSTIC — carga diferida del catálogo de municipios
import type { ColombianCity } from "./colombia";
import { filterColombianMajorCities } from "./colombian-major-cities";

let citiesCache: ColombianCity[] | null = null;
let majorCitiesCache: ColombianCity[] | null = null;

export async function loadColombianCities(): Promise<ColombianCity[]> {
  if (citiesCache) return citiesCache;

  const module = await import("./colombian-cities.json");
  citiesCache = module.default as ColombianCity[];
  return citiesCache;
}

/** Ciudades principales de Colombia (capitales + centros urbanos). Sin pueblos ni municipios menores. */
export async function loadColombianMajorCities(): Promise<ColombianCity[]> {
  if (majorCitiesCache) return majorCitiesCache;

  const all = await loadColombianCities();
  majorCitiesCache = filterColombianMajorCities(all);
  return majorCitiesCache;
}
