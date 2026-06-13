// ⚠️ AGNOSTIC — catálogos estáticos de Colombia

export const GENDER_OPTIONS = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMENINO", label: "Femenino" },
  { value: "TRANSGENERO", label: "Transgénero" },
  { value: "NO_BINARIO", label: "No binario" },
  { value: "OTRO", label: "Otro" },
  { value: "PREFIERO_NO_RESPONDER", label: "Prefiero no responder" },
] as const;

export type Gender = (typeof GENDER_OPTIONS)[number]["value"];

export const COLOMBIAN_DEPARTMENTS = [
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bogotá D.C.",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada",
] as const;

export type ColombianDepartment = (typeof COLOMBIAN_DEPARTMENTS)[number];

export interface ColombianCity {
  id: string;
  name: string;
  department: ColombianDepartment;
}

export const PAYMENT_DAY_MIN = 1;
export const PAYMENT_DAY_MAX = 30;
export const PAYMENT_DAY_DEFAULT = 15;
