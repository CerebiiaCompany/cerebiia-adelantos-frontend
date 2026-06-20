import { EMPLEADO_FORM_CATALOGS } from "@/shared/constants/empleadoFormCatalogs";

/**
 * Catálogos del formulario Nuevo empleado.
 * Hoy: datos estáticos en front.
 * Futuro: reemplazar queryFn por endpoint de catálogos del backend.
 */
export function useEmpleadoFormCatalogs() {
  return {
    documentTypes: EMPLEADO_FORM_CATALOGS.documentTypes,
    contractTypes: EMPLEADO_FORM_CATALOGS.contractTypes,
    accountTypes: EMPLEADO_FORM_CATALOGS.accountTypes,
    financialInstitutions: EMPLEADO_FORM_CATALOGS.financialInstitutions,
    isLoading: false,
    isError: false,
  };
}
