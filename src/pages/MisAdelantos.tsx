import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { History, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdvanceHistoryTable } from "@/features/advance/ui/AdvanceHistoryTable";
import { AdvanceHistoryFiltersBar } from "@/features/advance/ui/AdvanceHistoryFilters";
import { AdvanceReceipt } from "@/features/advance/ui/AdvanceReceipt";
import { AdvancePaymentEvidenceDialog } from "@/features/advance/ui/AdvancePaymentEvidenceDialog";
import { SolicitudCuotasPlan } from "@/features/advance/ui/SolicitudCuotasPlan";
import { EMPLEADO_ME_QUERY_KEY } from "@/features/advance/model/useEmpleadoMe";
import { SOLICITUDES_ADELANTO_QUERY_KEY } from "@/features/advance/model/useSolicitudesAdelanto";
import { useSolicitudDetalle } from "@/features/advance/model/useSolicitudDetalle";
import { useFilteredEmployeeAdvanceHistory } from "@/features/advance/model/useFilteredEmployeeAdvanceHistory";
import { resolveSolicitudComprobanteUrl } from "@/shared/lib/comprobantePago";
import { env } from "@/shared/config/env";
import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

export default function MisAdelantos() {
  const [selectedRecord, setSelectedRecord] = useState<AdvanceHistoryRecord | null>(
    null,
  );
  const [evidenceRecord, setEvidenceRecord] =
    useState<AdvanceHistoryRecord | null>(null);
  const {
    advanceHistory,
    filteredRecords,
    filters,
    setFilters,
    filtersActive,
  } = useFilteredEmployeeAdvanceHistory();
  const queryClient = useQueryClient();

  const detalleId = selectedRecord?.id ?? evidenceRecord?.id ?? null;
  const {
    data: detalle,
    isLoading: isDetalleLoading,
    isError: isDetalleError,
  } = useSolicitudDetalle(detalleId);

  useEffect(() => {
    if (!env.apiUrl) return;

    void queryClient.invalidateQueries({
      queryKey: SOLICITUDES_ADELANTO_QUERY_KEY,
    });
    void queryClient.invalidateQueries({ queryKey: EMPLEADO_ME_QUERY_KEY });
  }, [queryClient]);

  const receiptAmounts = useMemo(() => {
    if (!selectedRecord) return null;

    const solicitud = detalle?.solicitud;
    if (solicitud && selectedRecord.id === solicitud.id) {
      const monto = Number.parseFloat(solicitud.monto);
      const netoRaw = solicitud.monto_a_recibir ?? solicitud.monto_neto;
      const neto = netoRaw ? Number.parseFloat(netoRaw) : Number.NaN;
      const tarifaTotal = solicitud.tarifa_total
        ? Number.parseFloat(solicitud.tarifa_total)
        : Number.NaN;
      const tarifaPorCuotaSnapshot = solicitud.tarifa_fija_por_cuota_snapshot
        ? Number.parseFloat(solicitud.tarifa_fija_por_cuota_snapshot)
        : Number.NaN;
      const installments =
        solicitud.numero_cuotas_snapshot > 0
          ? solicitud.numero_cuotas_snapshot
          : selectedRecord.installments;
      const transactionFeeAmount = Number.isNaN(tarifaTotal)
        ? selectedRecord.transactionFeeAmount
        : Math.round(tarifaTotal);
      const tarifaFijaPorCuota = !Number.isNaN(tarifaPorCuotaSnapshot)
        ? Math.round(tarifaPorCuotaSnapshot)
        : installments > 0
          ? Math.round(transactionFeeAmount / installments)
          : undefined;

      return {
        amount: Number.isNaN(monto) ? selectedRecord.amount : monto,
        transactionFeeAmount,
        netAmount: Number.isNaN(neto)
          ? selectedRecord.netAmount
          : Math.round(neto),
        installments,
        tarifaFijaPorCuota,
      };
    }

    const installments = selectedRecord.installments || 1;

    return {
      amount: selectedRecord.amount,
      transactionFeeAmount: selectedRecord.transactionFeeAmount,
      netAmount: selectedRecord.netAmount,
      installments,
      tarifaFijaPorCuota:
        installments > 0
          ? Math.round(selectedRecord.transactionFeeAmount / installments)
          : undefined,
    };
  }, [detalle, selectedRecord]);

  const evidenceUrl = useMemo(() => {
    if (!evidenceRecord) return null;

    if (
      detalle?.solicitud &&
      detalle.solicitud.id === evidenceRecord.id
    ) {
      return (
        resolveSolicitudComprobanteUrl(detalle.solicitud) ??
        evidenceRecord.paymentEvidenceUrl ??
        null
      );
    }

    return evidenceRecord.paymentEvidenceUrl ?? null;
  }, [detalle, evidenceRecord]);

  return (
    <div className="mx-auto max-w-7xl animate-fade-in space-y-6">
      <PageHeader
        icon={History}
        title="Mis adelantos"
        description="Historial de solicitudes, periodo de nómina y comprobantes"
      />

      <AdvanceHistoryFiltersBar
        filters={filters}
        onChange={setFilters}
        resultCount={filteredRecords.length}
        totalCount={advanceHistory.length}
      />

      <AdvanceHistoryTable
        records={filteredRecords}
        onViewReceipt={setSelectedRecord}
        onViewEvidence={setEvidenceRecord}
        hasActiveFilters={filtersActive}
      />

      <Dialog
        open={selectedRecord !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRecord(null);
          }
        }}
      >
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto border-primary/15 bg-shell p-0 shadow-lg sm:rounded-2xl">
          <DialogTitle className="sr-only">Recibo de adelanto</DialogTitle>
          <DialogDescription className="sr-only">
            Comprobante del adelanto seleccionado
          </DialogDescription>
          {selectedRecord?.receiptStatus && receiptAmounts ? (
            <div className="space-y-4 p-4 sm:p-6">
              {isDetalleLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando detalle de la solicitud...
                </div>
              ) : null}
              <AdvanceReceipt
                amount={receiptAmounts.amount}
                transactionFeeAmount={receiptAmounts.transactionFeeAmount}
                tarifaFijaPorCuota={receiptAmounts.tarifaFijaPorCuota}
                installments={receiptAmounts.installments}
                status={selectedRecord.receiptStatus}
                paymentMethod={selectedRecord.paymentMethod}
                issuedAt={selectedRecord.requestedAt}
                folio={selectedRecord.folio}
                backLabel="Volver al historial"
                onBack={() => setSelectedRecord(null)}
              />
              {detalle?.cuotas &&
              detalle.solicitud.id === selectedRecord.id &&
              detalle.cuotas.length > 0 ? (
                <SolicitudCuotasPlan
                  cuotas={detalle.cuotas}
                  requestedAt={detalle.solicitud.created_at}
                />
              ) : null}
              {isDetalleError ? (
                <p className="text-center text-xs text-muted-foreground">
                  No pudimos cargar el plan de cuotas. El recibo se muestra con
                  los datos del historial.
                </p>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AdvancePaymentEvidenceDialog
        open={evidenceRecord !== null}
        onOpenChange={(open) => {
          if (!open) setEvidenceRecord(null);
        }}
        evidenceUrl={evidenceUrl}
        amount={evidenceRecord?.amount}
        requestedAt={evidenceRecord?.requestedAt}
      />
    </div>
  );
}
