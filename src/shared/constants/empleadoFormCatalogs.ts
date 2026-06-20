// ⚠️ AGNOSTIC — catálogos provisionales del formulario empleado.
// Reemplazar por GET /catalogos/empleado/ cuando el backend esté listo.

import { COLOMBIAN_FINANCIAL_INSTITUTION_GROUPS } from "./colombianFinancialInstitutions";

export interface EmpleadoCatalogOption {
  value: string;
  label: string;
}

export interface EmpleadoCatalogGroup {
  label: string;
  options: EmpleadoCatalogOption[];
}

/** Tipos de documento — provisional (futuro: API catálogo). */
export const EMPLEADO_DOCUMENT_TYPE_OPTIONS: EmpleadoCatalogOption[] = [
  { value: "CC", label: "Cédula de Ciudadanía Colombiana" },
  { value: "PASSPORT", label: "Pasaporte" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "PPT", label: "Permiso por protección temporal - PPT" },
];

/** Tipos de contrato — provisional. */
export const EMPLEADO_CONTRACT_TYPE_OPTIONS: EmpleadoCatalogOption[] = [
  { value: "indefinido", label: "Término Indefinido" },
  { value: "fijo", label: "Término Fijo" },
  { value: "obra_labor", label: "Obra o Labor" },
];

/** Tipos de cuenta — provisional. */
export const EMPLEADO_ACCOUNT_TYPE_OPTIONS: EmpleadoCatalogOption[] = [
  { value: "ahorros", label: "Ahorros" },
  { value: "corriente", label: "Corriente" },
];

/** Bancos y plataformas — provisional (futuro: API catálogo financiero). */
export const EMPLEADO_FINANCIAL_INSTITUTION_GROUPS: EmpleadoCatalogGroup[] =
  COLOMBIAN_FINANCIAL_INSTITUTION_GROUPS.map((group) => ({
    label: group.label,
    options: group.options.map((option) => ({
      value: option.value,
      label: option.label,
    })),
  }));

export const EMPLEADO_FINANCIAL_INSTITUTION_VALUES =
  EMPLEADO_FINANCIAL_INSTITUTION_GROUPS.flatMap((group) =>
    group.options.map((option) => option.value),
  );

export const EMPLEADO_FORM_CATALOGS = {
  documentTypes: EMPLEADO_DOCUMENT_TYPE_OPTIONS,
  contractTypes: EMPLEADO_CONTRACT_TYPE_OPTIONS,
  accountTypes: EMPLEADO_ACCOUNT_TYPE_OPTIONS,
  financialInstitutions: EMPLEADO_FINANCIAL_INSTITUTION_GROUPS,
} as const;

export function getEmpleadoCatalogLabel(
  options: EmpleadoCatalogOption[],
  value: string,
): string | undefined {
  return options.find((option) => option.value === value)?.label;
}
