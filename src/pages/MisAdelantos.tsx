import { useState } from "react";
import { History } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdvanceHistoryTable } from "@/features/advance/ui/AdvanceHistoryTable";
import { AdvanceHistoryFiltersBar } from "@/features/advance/ui/AdvanceHistoryFilters";
import { AdvanceReceipt } from "@/features/advance/ui/AdvanceReceipt";
import { useCancelSolicitudAdelanto } from "@/features/advance/model/useCancelSolicitudAdelanto";
import { useFilteredEmployeeAdvanceHistory } from "@/features/advance/model/useFilteredEmployeeAdvanceHistory";
import { ApiError } from "@/shared/api";
import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [recordToCancel, setRecordToCancel] =
    useState<AdvanceHistoryRecord | null>(null);
  const {
    advanceHistory,
    filteredRecords,
    filters,
    setFilters,
    filtersActive,
  } = useFilteredEmployeeAdvanceHistory();
  const { mutate: cancelSolicitud, isPending: isCancelling } =
    useCancelSolicitudAdelanto();

  const handleConfirmCancel = () => {
    if (!recordToCancel) return;

    cancelSolicitud(recordToCancel.id, {
      onSuccess: () => {
        toast.success("Solicitud cancelada. Tu saldo disponible fue actualizado.");
        setRecordToCancel(null);
      },
      onError: (error) => {
        toast.error(
          error instanceof ApiError
            ? error.message
            : "No pudimos cancelar la solicitud. Inténtalo de nuevo.",
        );
      },
    });
  };

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
        onCancel={setRecordToCancel}
        cancellingId={isCancelling ? recordToCancel?.id ?? null : null}
        hasActiveFilters={filtersActive}
      />

      <AlertDialog
        open={recordToCancel !== null}
        onOpenChange={(open) => {
          if (!open) setRecordToCancel(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cancelar esta solicitud?</AlertDialogTitle>
            <AlertDialogDescription>
              El monto solicitado volverá a tu saldo disponible. Solo puedes
              cancelar solicitudes en estado pendiente o en revisión.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>
              Volver
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isCancelling ? "Cancelando..." : "Sí, cancelar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
          {selectedRecord?.receiptStatus ? (
            <div className="p-4 sm:p-6">
              <AdvanceReceipt
                amount={selectedRecord.amount}
                status={selectedRecord.receiptStatus}
                paymentMethod={selectedRecord.paymentMethod}
                issuedAt={selectedRecord.requestedAt}
                folio={selectedRecord.folio}
                backLabel="Volver al historial"
                onBack={() => setSelectedRecord(null)}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
