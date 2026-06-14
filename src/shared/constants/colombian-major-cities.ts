import type { ColombianCity } from "./colombia";

/** Capitales departamentales y Bogotá D.C. */
export const COLOMBIAN_DEPARTMENT_CAPITAL_IDS = new Set<string>([
  "11001", // Bogotá D.C.
  "05001", // Medellín
  "76001", // Cali
  "08001", // Barranquilla
  "13001", // Cartagena
  "54001", // Cúcuta
  "68001", // Bucaramanga
  "66001", // Pereira
  "47001", // Santa Marta
  "73001", // Ibagué
  "52001", // Pasto
  "17001", // Manizales
  "41001", // Neiva
  "50001", // Villavicencio
  "63001", // Armenia
  "20001", // Valledupar
  "23001", // Montería
  "70001", // Sincelejo
  "19001", // Popayán
  "15001", // Tunja
  "18001", // Florencia
  "44001", // Riohacha
  "27001", // Quibdó
  "81001", // Arauca
  "85001", // Yopal
  "86001", // Mocoa
  "91001", // Leticia
  "88001", // San Andrés
  "94001", // Inírida
  "97001", // Mitú
  "99001", // Puerto Carreño
  "95001", // San José del Guaviare
]);

/**
 * Ciudades principales adicionales (áreas metropolitanas y centros urbanos).
 * Excluye municipios y pueblos del catálogo DANE completo.
 */
export const COLOMBIAN_MAJOR_CITY_IDS = new Set<string>([
  "05088", // Bello
  "05266", // Envigado
  "05360", // Itagüí
  "05615", // Rionegro
  "05631", // Sabaneta
  "08758", // Soledad
  "25175", // Chía
  "25269", // Facatativá
  "25286", // Funza
  "25473", // Mosquera
  "25754", // Soacha
  "25899", // Zipaquirá
  "15238", // Duitama
  "15759", // Sogamoso
  "44430", // Maicao
  "52356", // Ipiales
  "68081", // Barrancabermeja
  "68276", // Floridablanca
  "68307", // Girón
  "68547", // Piedecuesta
  "66170", // Dosquebradas
  "76109", // Buenaventura
  "76147", // Cartago
  "76364", // Jamundí
  "76520", // Palmira
  "76834", // Tuluá
  "76892", // Yumbo
]);

export function isColombianDepartmentCapital(city: ColombianCity): boolean {
  return COLOMBIAN_DEPARTMENT_CAPITAL_IDS.has(city.id);
}

export function isColombianMajorCity(city: ColombianCity): boolean {
  return (
    COLOMBIAN_DEPARTMENT_CAPITAL_IDS.has(city.id) ||
    COLOMBIAN_MAJOR_CITY_IDS.has(city.id)
  );
}

export function filterColombianMajorCities(
  cities: ColombianCity[],
): ColombianCity[] {
  return cities
    .filter(isColombianMajorCity)
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}
