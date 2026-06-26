import { useMemo, useState } from "react";
import { ExternalLink, FileImage, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getComprobanteFileKind } from "@/shared/lib/comprobantePago";

type AdvancePaymentEvidenceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evidenceUrl: string | null;
  amount?: number;
  requestedAt?: Date;
};

export function AdvancePaymentEvidenceDialog({
  open,
  onOpenChange,
  evidenceUrl,
  amount,
  requestedAt,
}: AdvancePaymentEvidenceDialogProps) {
  const [loadError, setLoadError] = useState(false);
  const fileKind = useMemo(
    () => (evidenceUrl ? getComprobanteFileKind(evidenceUrl) : "other"),
    [evidenceUrl],
  );

  const subtitle = useMemo(() => {
    const parts: string[] = [];
    if (requestedAt) {
      parts.push(
        requestedAt.toLocaleDateString("es-CO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      );
    }
    if (amount && amount > 0) {
      parts.push(
        amount.toLocaleString("es-CO", {
          style: "currency",
          currency: "COP",
          maximumFractionDigits: 0,
        }),
      );
    }
    return parts.join(" · ");
  }, [amount, requestedAt]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setLoadError(false);
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-hidden border-primary/15 bg-shell p-0 shadow-lg sm:rounded-2xl">
        <DialogHeader className="border-b border-primary/10 px-6 py-4 text-left">
          <DialogTitle className="font-display text-lg">
            Evidencia de transferencia
          </DialogTitle>
          {subtitle ? (
            <DialogDescription>{subtitle}</DialogDescription>
          ) : (
            <DialogDescription>
              Comprobante adjuntado por el equipo de Cerebiia al desembolsar tu
              adelanto.
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto p-4 sm:p-6">
          {!evidenceUrl ? (
            <p className="text-center text-sm text-muted-foreground">
              No hay evidencia disponible para esta solicitud.
            </p>
          ) : loadError ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                No pudimos previsualizar el archivo. Puedes abrirlo o descargarlo
                directamente.
              </p>
              <Button asChild variant="outline">
                <a href={evidenceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir archivo
                </a>
              </Button>
            </div>
          ) : fileKind === "image" ? (
            <div className="flex justify-center">
              <img
                src={evidenceUrl}
                alt="Evidencia de transferencia del adelanto"
                className="max-h-[60vh] w-auto max-w-full rounded-xl border border-primary/10 object-contain shadow-sm"
                onError={() => setLoadError(true)}
              />
            </div>
          ) : fileKind === "pdf" ? (
            <iframe
              src={evidenceUrl}
              title="Evidencia de transferencia PDF"
              className="h-[60vh] w-full rounded-xl border border-primary/10 bg-background"
              onError={() => setLoadError(true)}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <FileImage className="h-10 w-10 text-muted-foreground/60" />
              <p className="text-sm text-muted-foreground">
                Archivo adjunto listo para consulta.
              </p>
              <Button asChild variant="outline">
                <a href={evidenceUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Ver evidencia
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
