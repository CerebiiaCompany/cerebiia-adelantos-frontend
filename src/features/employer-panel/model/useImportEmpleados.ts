import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, empleadosEndpoints } from "@/shared/api";
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

export function useImportEmpleados() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<ImportEmpleadosResult> => {
      const matrix = await parseEmpleadoImportFile(file);
      const { valid, errors: parseErrors } = mapEmpleadoImportMatrix(matrix);

      if (valid.length === 0) {
        return {
          createdCount: 0,
          failedCount: 0,
          parseErrors,
          importErrors: [],
        };
      }

      const importErrors: EmpleadoImportRowError[] = [];
      let createdCount = 0;

      for (const row of valid) {
        try {
          await empleadosEndpoints.create(row.data);
          createdCount += 1;
        } catch (error) {
          const apiMessage =
            error instanceof ApiError
              ? error.message
              : "No se pudo crear el empleado.";
          importErrors.push(
            buildApiImportRowError(row.rowNumber, row.data, apiMessage),
          );
        }
      }

      return {
        createdCount,
        failedCount: importErrors.length,
        parseErrors,
        importErrors,
      };
    },
    onSuccess: (result) => {
      if (result.createdCount > 0) {
        queryClient.invalidateQueries({ queryKey: EMPLEADOS_QUERY_KEY });
      }
    },
  });
}
