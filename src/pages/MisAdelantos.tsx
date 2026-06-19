import { useState } from "react";
import { History } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AdvanceHistoryTable } from "@/features/advance/ui/AdvanceHistoryTable";
import { AdvanceHistoryFiltersBar } from "@/features/advance/ui/AdvanceHistoryFilters";
import { AdvanceReceipt } from "@/features/advance/ui/AdvanceReceipt";
import { useFilteredEmployeeAdvanceHistory } from "@/features/advance/model/useFilteredEmployeeAdvanceHistory";
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
  const {
    advanceHistory,
    filteredRecords,
    filters,
    setFilters,
    filtersActive,
  } = useFilteredEmployeeAdvanceHistory();

  return (
    <div className="mx-auto max-w-5xl animate-fade-in space-y-6">
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
