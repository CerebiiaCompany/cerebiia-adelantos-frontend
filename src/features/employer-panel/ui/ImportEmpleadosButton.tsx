import { useRef, useState } from "react";
import { FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadCsvFile } from "@/shared/lib/csv";
import { EMPLEADO_IMPORT_TEMPLATE_HEADERS } from "@/shared/lib/empleadoImport";
import { cn } from "@/lib/utils";
import {
  useImportEmpleados,
  type ImportEmpleadosResult,
} from "../model/useImportEmpleados";

const ACCEPTED_EXTENSIONS = ".csv,.xlsx,.xls";

export function ImportEmpleadosButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [lastResult, setLastResult] = useState<ImportEmpleadosResult | null>(
    null,
  );
  const { mutate, isPending } = useImportEmpleados();

  function handlePickFile() {
    inputRef.current?.click();
  }

  function handleDownloadTemplate() {
    downloadCsvFile("plantilla-importacion-nomina", [
      [...EMPLEADO_IMPORT_TEMPLATE_HEADERS],
      [
        "CC",
        "1005026054",
        "Melanny Yilyan Guate Restrepo",
        "empleado@empresa.com",
        "3001234567",
        "1700000",
        "indefinido",
        "2026-01-15",
        "nequi",
        "ahorros",
        "3001234567",
      ],
    ]);
    toast.success("Plantilla descargada. Complétala e impórtala.");
  }

  function showResultSummary(result: ImportEmpleadosResult) {
    if (result.createdCount > 0 && result.failedCount === 0 && result.parseErrors.length === 0) {
      toast.success(
        `${result.createdCount} empleado${result.createdCount === 1 ? "" : "s"} importado${result.createdCount === 1 ? "" : "s"} correctamente.`,
      );
      return;
    }

    setLastResult(result);
    setResultOpen(true);
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    mutate(file, {
      onSuccess: showResultSummary,
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "No pudimos procesar el archivo.",
        );
      },
    });
  }

  const allErrors = [
    ...(lastResult?.parseErrors.map((error) => ({
      rowNumber: error.rowNumber,
      message: error.message,
    })) ?? []),
    ...(lastResult?.importErrors ?? []),
  ];

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handlePickFile}
          disabled={isPending}
          className={cn(
            "h-11 rounded-xl border-primary/20 bg-background/80 font-medium",
            "hover:border-primary/30 hover:bg-primary/5",
          )}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FileSpreadsheet className="mr-2 h-4 w-4" />
          )}
          {isPending ? "Importando..." : "Importar nómina"}
        </Button>

        <button
          type="button"
          onClick={handleDownloadTemplate}
          className="hidden text-xs text-muted-foreground underline-offset-2 hover:text-primary hover:underline sm:inline"
        >
          Plantilla
        </button>
      </div>

      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent className="max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              Resultado de importación
            </DialogTitle>
            <DialogDescription>
              {lastResult?.createdCount
                ? `Se crearon ${lastResult.createdCount} empleado${lastResult.createdCount === 1 ? "" : "s"}.`
                : "No se crearon empleados."}
              {lastResult?.failedCount || lastResult?.parseErrors.length
                ? " Revisa los errores a continuación."
                : ""}
            </DialogDescription>
          </DialogHeader>

          {allErrors.length > 0 ? (
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-border/80 bg-secondary/20 p-3 text-sm">
              {allErrors.map((error, index) => (
                <p key={`${error.rowNumber}-${index}`} className="text-destructive">
                  {error.rowNumber > 0 ? `Fila ${error.rowNumber}: ` : ""}
                  {error.message}
                </p>
              ))}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
