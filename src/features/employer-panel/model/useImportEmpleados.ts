import { useMutation, useQueryClient } from "@tanstack/react-query";
import { empleadosEndpoints, ApiError } from "@/shared/api";
import { env } from "@/shared/config/env";
import {
  buildApiImportRowError,
  mapEmpleadoImportMatrix,
  parseEmpleadoImportFile,
  type EmpleadoImportRowError,
} from "@/shared/lib/empleadoImport";
import { EMPLEADOS_QUERY_KEY } from "./useEmpleadosList";

export interface ImportEmpleadosResult {
  createdCount: number;
  failedCount: number;
  parseErrors: EmpleadoImportRowError[];
  importErrors: EmpleadoImportRowError[];
}

function mapCargaNominaErrors(
  errores: Array<{ fila: number; documento: string; errores: string[] }>,
): EmpleadoImportRowError[] {
  return errores.map((error) => ({
    rowNumber: error.fila,
    kind: "api" as const,
    message: error.errores.join(". "),
    documento: error.documento,
  }));
}

export function useImportEmpleados() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<ImportEmpleadosResult> => {
      if (env.apiUrl) {
        try {
          const result = await empleadosEndpoints.cargarNomina(file);
          return {
            createdCount: result.exitosos,
            failedCount: result.fallidos,
            parseErrors: [],
            importErrors: mapCargaNominaErrors(result.errores),
          };
        } catch (error) {
          if (
            error instanceof ApiError &&
            error.message.includes("El archivo debe tener las columnas")
          ) {
            throw new Error(
              "La plantilla no tiene las columnas requeridas. Descarga la plantilla actualizada y usa la hoja «Nomina» sin modificar los encabezados.",
            );
          }
          throw error;
        }
      }

      const matrix = await parseEmpleadoImportFile(file);
      const { valid, errors: parseErrors } = mapEmpleadoImportMatrix(matrix);

      return {
        createdCount: 0,
        failedCount: valid.length,
        parseErrors,
        importErrors: valid.map((row) =>
          buildApiImportRowError(
            row.rowNumber,
            row.data,
            "La importación masiva requiere conexión con el servidor.",
          ),
        ),
      };
    },
    onSuccess: (result) => {
      if (result.createdCount > 0) {
        queryClient.invalidateQueries({ queryKey: EMPLEADOS_QUERY_KEY });
      }
    },
  });
}
