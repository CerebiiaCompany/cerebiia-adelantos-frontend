import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError, empleadosEndpoints } from "@/shared/api";
import type { CreateEmpleadoRequest } from "@/shared/api/types";
import {
  mapEmpleadoImportMatrix,
  parseEmpleadoImportFile,
  type EmpleadoImportRowError,
} from "@/shared/lib/empleadoImport";
import { EMPLEADOS_QUERY_KEY } from "./useEmpleadosList";

export interface ImportEmpleadosResult {
  createdCount: number;
  failedCount: number;
  parseErrors: EmpleadoImportRowError[];
  importErrors: Array<{ rowNumber: number; message: string }>;
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

      const importErrors: Array<{ rowNumber: number; message: string }> = [];
      let createdCount = 0;

      for (let index = 0; index < valid.length; index += 1) {
        const payload: CreateEmpleadoRequest = valid[index];

        try {
          await empleadosEndpoints.create(payload);
          createdCount += 1;
        } catch (error) {
          const message =
            error instanceof ApiError
              ? error.message
              : "No se pudo crear el empleado.";
          importErrors.push({
            rowNumber: index + 2,
            message: `${payload.nombre}: ${message}`,
          });
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
