import { FileText } from "lucide-react";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory";
import {
  ADVANCE_HISTORY_STATUS_BADGE_CLASS,
  ADVANCE_HISTORY_STATUS_LABEL,
} from "@/shared/config/advanceHistory";
import { formatAdvanceTransactionFeeLabel } from "@/shared/config/advanceFees";
import { formatAdvanceRequestDate } from "@/shared/utils/payrollPeriod";
import { formatAdvanceInstallmentsLabel } from "@/features/advance/utils/enrichAdvanceHistoryRecords";

type AdvanceHistoryTableProps = {
  records: AdvanceHistoryRecord[];
  onViewReceipt: (record: AdvanceHistoryRecord) => void;
  onCancel?: (record: AdvanceHistoryRecord) => void;
  cancellingId?: string | null;
  hasActiveFilters?: boolean;
};

function TransactionCostCell({ record }: { record: AdvanceHistoryRecord }) {
  return (
    <div className="text-right">
      <AnimatedCurrency
        value={record.transactionFeeAmount}
        className="font-semibold tabular-nums text-foreground"
        duration={450}
      />
      <p className="mt-0.5 text-xs text-muted-foreground">
        {formatAdvanceTransactionFeeLabel()}
      </p>
    </div>
  );
}

function ReceiptAction({
  record,
  onViewReceipt,
}: {
  record: AdvanceHistoryRecord;
  onViewReceipt: (record: AdvanceHistoryRecord) => void;
}) {
  if (record.status === "no_aprobado" || !record.receiptStatus) {
    return (
      <span className="text-sm text-muted-foreground/70">No disponible</span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onViewReceipt(record)}
      className="text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
    >
      Ver recibo
    </button>
  );
}

function RowActions({
  record,
  onViewReceipt,
  onCancel,
  cancellingId,
}: {
  record: AdvanceHistoryRecord;
  onViewReceipt: (record: AdvanceHistoryRecord) => void;
  onCancel?: (record: AdvanceHistoryRecord) => void;
  cancellingId?: string | null;
}) {
  const isCancelling = cancellingId === record.id;

  return (
    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center sm:justify-end">
      {record.canCancel && onCancel ? (
        <button
          type="button"
          onClick={() => onCancel(record)}
          disabled={isCancelling}
          className="text-sm font-medium text-destructive transition-colors hover:text-destructive/80 disabled:opacity-50"
        >
          {isCancelling ? "Cancelando..." : "Cancelar"}
        </button>
      ) : null}
      <ReceiptAction record={record} onViewReceipt={onViewReceipt} />
    </div>
  );
}

export function AdvanceHistoryTable({
  records,
  onViewReceipt,
  onCancel,
  cancellingId = null,
  hasActiveFilters = false,
}: AdvanceHistoryTableProps) {
  if (records.length === 0) {
    return (
      <div className="glass-card glow-border p-10 text-center">
        <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
        <p className="font-medium text-foreground">
          {hasActiveFilters
            ? "No hay adelantos con estos filtros"
            : "Sin adelantos registrados"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasActiveFilters
            ? "Prueba otro estado o ajusta el rango de fechas."
            : "Cuando solicites un adelanto, aparecerá aquí con su recibo."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="glass-card glow-border hidden overflow-x-auto lg:block">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10 hover:bg-transparent">
              <TableHead>Fecha</TableHead>
              <TableHead>Periodo de nómina</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead>Cuotas</TableHead>
              <TableHead>Banco</TableHead>
              <TableHead>Tipo de cuenta</TableHead>
              <TableHead>No. cuenta</TableHead>
              <TableHead className="text-right">Costo de transacción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow
                key={record.id}
                className="border-primary/5 hover:bg-primary/[0.03]"
              >
                <TableCell className="whitespace-nowrap font-medium text-foreground">
                  {formatAdvanceRequestDate(record.requestedAt)}
                </TableCell>
                <TableCell className="min-w-[8rem] capitalize text-muted-foreground">
                  {record.periodLabel}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right font-semibold tabular-nums text-foreground">
                  <AnimatedCurrency value={record.amount} duration={500} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-foreground">
                  {formatAdvanceInstallmentsLabel(record.installments)}
                </TableCell>
                <TableCell className="max-w-[9rem] truncate text-foreground">
                  {record.bankName}
                </TableCell>
                <TableCell className="whitespace-nowrap text-foreground">
                  {record.accountTypeLabel}
                </TableCell>
                <TableCell className="whitespace-nowrap font-mono text-xs text-foreground">
                  {record.accountNumber}
                </TableCell>
                <TableCell>
                  <TransactionCostCell record={record} />
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={ADVANCE_HISTORY_STATUS_BADGE_CLASS[record.status]}
                  >
                    {ADVANCE_HISTORY_STATUS_LABEL[record.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <RowActions
                    record={record}
                    onViewReceipt={onViewReceipt}
                    onCancel={onCancel}
                    cancellingId={cancellingId}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 lg:hidden">
        {records.map((record) => (
          <div
            key={record.id}
            className="glass-card glow-border space-y-3 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {formatAdvanceRequestDate(record.requestedAt)}
                </p>
                <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                  {record.periodLabel}
                </p>
              </div>
              <Badge
                variant="outline"
                className={ADVANCE_HISTORY_STATUS_BADGE_CLASS[record.status]}
              >
                {ADVANCE_HISTORY_STATUS_LABEL[record.status]}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-primary/10 pt-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Monto</p>
                <AnimatedCurrency
                  value={record.amount}
                  className="font-display text-base font-bold text-foreground"
                  duration={500}
                />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Cuotas</p>
                <p className="font-medium text-foreground">
                  {formatAdvanceInstallmentsLabel(record.installments)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Banco</p>
                <p className="font-medium text-foreground">{record.bankName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Tipo de cuenta</p>
                <p className="font-medium text-foreground">
                  {record.accountTypeLabel}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground">No. cuenta</p>
                <p className="font-mono text-xs font-medium text-foreground">
                  {record.accountNumber}
                </p>
              </div>
              <div className="col-span-2 border-t border-primary/10 pt-3">
                <p className="text-xs text-muted-foreground">
                  {formatAdvanceTransactionFeeLabel()}
                </p>
                <p className="font-semibold tabular-nums text-foreground">
                  <AnimatedCurrency
                    value={record.transactionFeeAmount}
                    duration={450}
                  />
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-primary/10 pt-3">
              <RowActions
                record={record}
                onViewReceipt={onViewReceipt}
                onCancel={onCancel}
                cancellingId={cancellingId}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
