import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SolicitudCuotasPlan } from "@/features/advance/ui/SolicitudCuotasPlan";
import { useSolicitudDetalle } from "@/features/advance/model/useSolicitudDetalle";
import { AdvancePaymentEvidenceDialog } from "@/features/advance/ui/AdvancePaymentEvidenceDialog";
import { resolveSolicitudComprobanteUrl } from "@/shared/lib/comprobantePago";
import { formatCOP, formatDate } from "@/shared/lib";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

type EmployerSolicitudDetalleDialogProps = {
  solicitudId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeName?: string;
};

export function EmployerSolicitudDetalleDialog({
  solicitudId,
  open,
  onOpenChange,
  employeeName,
}: EmployerSolicitudDetalleDialogProps) {
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const { data, isLoading, isError } = useSolicitudDetalle(
    open ? solicitudId : null,
  );

  const evidenceUrl = useMemo(
    () =>
      data?.solicitud
        ? resolveSolicitudComprobanteUrl(data.solicitud)
        : null,
    [data],
  );

  const monto = data ? Number.parseFloat(data.solicitud.monto) : Number.NaN;
  const netoRaw = data
    ? data.solicitud.monto_a_recibir ?? data.solicitud.monto_neto
    : undefined;
  const neto = netoRaw ? Number.parseFloat(netoRaw) : Number.NaN;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              Detalle de solicitud
            </DialogTitle>
            <DialogDescription>
              {employeeName
                ? `Solicitud de ${employeeName}`
                : "Detalle completo y plan de cuotas"}
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando detalle...
            </div>
          ) : null}

          {isError ? (
            <p className="py-6 text-sm text-destructive">
              No pudimos cargar el detalle de esta solicitud.
            </p>
          ) : null}

          {data ? (
            <div className="space-y-4">
              <div className="grid gap-3 rounded-xl border border-border bg-secondary/20 p-4 text-sm sm:grid-cols-2">
                <DetailItem
                  label="Estado"
                  value={data.solicitud.estado.replace("_", " ")}
                />
                <DetailItem
                  label="Fecha"
                  value={formatDate(data.solicitud.created_at)}
                />
                <DetailItem
                  label="Monto solicitado"
                  value={Number.isNaN(monto) ? data.solicitud.monto : formatCOP(monto)}
                />
                <DetailItem
                  label="Monto neto"
                  value={
                    Number.isNaN(neto)
                      ? data.solicitud.monto_neto ?? "—"
                      : formatCOP(neto)
                  }
                />
                <DetailItem
                  label="Cuotas"
                  value={String(data.solicitud.numero_cuotas_snapshot)}
                />
                <DetailItem
                  label="Pagado en"
                  value={
                    data.solicitud.pagado_en
                      ? formatDate(data.solicitud.pagado_en)
                      : "—"
                  }
                />
              </div>

              {evidenceUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => setEvidenceOpen(true)}
                >
                  Ver evidencia de pago
                </Button>
              ) : null}

              <SolicitudCuotasPlan
                cuotas={data.cuotas}
                requestedAt={data.solicitud.created_at}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AdvancePaymentEvidenceDialog
        open={evidenceOpen}
        onOpenChange={setEvidenceOpen}
        evidenceUrl={evidenceUrl}
        amount={Number.isNaN(monto) ? undefined : monto}
        requestedAt={
          data?.solicitud.created_at
            ? new Date(data.solicitud.created_at)
            : undefined
        }
      />
    </>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-medium capitalize text-foreground">{value}</p>
    </div>
  );
}
