import {
  EMPLEADO_ACCOUNT_TYPE_OPTIONS,
  EMPLEADO_CONTRACT_TYPE_OPTIONS,
  EMPLEADO_DOCUMENT_TYPE_OPTIONS,
} from "@/shared/constants/empleadoFormCatalogs";
import { useBancos } from "./useBancos";

/**
 * Catálogos del formulario Nuevo empleado.
 * Bancos: GET /empleados/bancos/ cuando hay API configurada.
 */
export function useEmpleadoFormCatalogs(enabled = true) {
  const bancosQuery = useBancos(enabled);

  const banks =
    bancosQuery.data
      ?.map((banco) => ({
        value: banco.id,
        label: banco.nombre,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, "es")) ?? [];

  return {
    documentTypes: EMPLEADO_DOCUMENT_TYPE_OPTIONS,
    contractTypes: EMPLEADO_CONTRACT_TYPE_OPTIONS,
    accountTypes: EMPLEADO_ACCOUNT_TYPE_OPTIONS,
    banks,
    isLoading: bancosQuery.isLoading,
    isError: bancosQuery.isError,
    isEmpty: !bancosQuery.isLoading && !bancosQuery.isError && banks.length === 0,
    refetchBancos: bancosQuery.refetch,
  };
}
