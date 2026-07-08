import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadExcelBuffer } from "@/shared/lib/excel";
import {
  buildEmpleadoImportTemplateBuffer,
  groupImportErrorsByKind,
  type EmpleadoImportRowError,
} from "@/shared/lib/empleadoImport";
import { env } from "@/shared/config/env";
import { fetchBancosList } from "../model/useBancos";
import {
  useImportEmpleados,
  type ImportEmpleadosResult,
} from "../model/useImportEmpleados";

const ACCEPTED_EXTENSIONS = ".csv,.xlsx,.xls";

interface ImportErrorSectionProps {
  title: string;
  errors: EmpleadoImportRowError[];
}

function ImportErrorSection({ title, errors }: ImportErrorSectionProps) {
  if (errors.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h4>
      <div className="space-y-2">
        {errors.map((error, index) => (
          <div
            key={`${error.rowNumber}-${error.kind}-${index}`}
            className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5"
          >
            {error.rowNumber > 0 ? (
              <p className="text-xs font-medium text-foreground">
                Fila {error.rowNumber}
                {error.nombre ? ` · ${error.nombre}` : ""}
              </p>
            ) : null}
            <p className="mt-1 text-sm text-destructive">{error.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImportResultSummary({ result }: { result: ImportEmpleadosResult }) {
  const totalErrors = result.parseErrors.length + result.importErrors.length;
  const grouped = groupImportErrorsByKind([
    ...result.parseErrors,
    ...result.importErrors,
  ]);

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 rounded-xl border border-success/20 bg-success/5 px-3 py-2.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
          <p className="text-sm">
            <span className="font-semibold text-foreground">
              {result.createdCount}
            </span>{" "}
            empleado{result.createdCount === 1 ? "" : "s"} creado
            {result.createdCount === 1 ? "" : "s"}
          </p>
        </div>

        {totalErrors > 0 ? (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm">
              <span className="font-semibold text-foreground">{totalErrors}</span>{" "}
              fila{totalErrors === 1 ? "" : "s"} con error
              {totalErrors === 1 ? "" : "es"}
            </p>
          </div>
        ) : null}
      </div>

      {totalErrors > 0 ? (
        <div className="max-h-72 space-y-4 overflow-y-auto rounded-xl border border-border/80 bg-secondary/20 p-3">
          <ImportErrorSection
            title="Ya registrados en tu empresa"
            errors={grouped.duplicate}
          />
          <ImportErrorSection
            title="Datos inválidos en el archivo"
            errors={grouped.validation}
          />
          <ImportErrorSection
            title="Otros errores al crear"
            errors={grouped.api}
          />
        </div>
      ) : null}
    </div>
  );
}

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

  async function handleDownloadTemplate() {
    let bancos: string[] | undefined;

    if (env.apiUrl) {
      try {
        const catalog = await fetchBancosList();
        if (catalog.length > 0) {
          bancos = catalog.map((banco) => banco.nombre);
        }
      } catch {
        // Usa catálogo estático del seed si la API no responde.
      }
    }

    const buffer = await buildEmpleadoImportTemplateBuffer(
      bancos ? { bancos } : undefined,
    );
    downloadExcelBuffer("plantilla-importacion-nomina", buffer);
    toast.success(
      "Plantilla descargada. Usa los desplegables en banco, tipo de documento, contrato y cuenta.",
    );
  }

  function showResultSummary(result: ImportEmpleadosResult) {
    const totalErrors = result.parseErrors.length + result.importErrors.length;

    if (result.createdCount > 0 && totalErrors === 0) {
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

  const totalErrors =
    (lastResult?.parseErrors.length ?? 0) +
    (lastResult?.importErrors.length ?? 0);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => void handleDownloadTemplate()}
          className="btn-employer-template"
        >
          <Download className="btn-employer-template-icon mr-2 h-4 w-4" />
          Descargar plantilla
        </Button>

        <Button
          type="button"
          onClick={handlePickFile}
          disabled={isPending}
          className="btn-import-nomina border-0"
        >
          {isPending ? (
            <>
              <Loader2 className="btn-import-nomina-icon mr-2 h-4 w-4 animate-spin" />
              <span className="btn-import-nomina-label">Importando...</span>
            </>
          ) : (
            <>
              <span className="btn-import-nomina-label btn-import-nomina-label-default">
                <FileSpreadsheet className="btn-import-nomina-icon h-4 w-4" />
                Importar nómina
              </span>
              <span
                className="btn-import-nomina-label-hover"
                aria-hidden="true"
              >
                <Upload className="btn-import-nomina-icon h-4 w-4" />
                Seleccionar archivo
              </span>
            </>
          )}
        </Button>
      </div>

      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent className="max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              Resultado de importación
            </DialogTitle>
            <DialogDescription>
              {lastResult?.createdCount
                ? `Se importó ${lastResult.createdCount} empleado${lastResult.createdCount === 1 ? "" : "s"} correctamente.`
                : "No se importó ningún empleado."}
              {totalErrors > 0
                ? " Revisa el detalle de las filas con error."
                : ""}
            </DialogDescription>
          </DialogHeader>

          {lastResult ? <ImportResultSummary result={lastResult} /> : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
