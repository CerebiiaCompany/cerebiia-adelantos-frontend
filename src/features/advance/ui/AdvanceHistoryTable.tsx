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
import { formatAdvanceTransactionFeeRate } from "@/shared/config/advanceFees";
import { formatAdvanceRequestDate } from "@/shared/utils/payrollPeriod";

type AdvanceHistoryTableProps = {
  records: AdvanceHistoryRecord[];
  onViewReceipt: (record: AdvanceHistoryRecord) => void;
  hasActiveFilters?: boolean;
};

function TransactionCostCell({ record }: { record: AdvanceHistoryRecord }) {
  return (
    <div className="text-right">
      <p className="font-semibold tabular-nums text-foreground">
        {formatAdvanceTransactionFeeRate(record.transactionFeeRate)}
      </p>
      <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
        <AnimatedCurrency value={record.transactionFeeAmount} duration={450} />
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

export function AdvanceHistoryTable({
  records,
  onViewReceipt,
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
      <div className="glass-card glow-border hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10 hover:bg-transparent">
              <TableHead>Fecha</TableHead>
              <TableHead>Periodo de nómina</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-right">Costo de transacción</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Recibo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => (
              <TableRow
                key={record.id}
                className="border-primary/5 hover:bg-primary/[0.03]"
              >
                <TableCell className="font-medium text-foreground">
                  {formatAdvanceRequestDate(record.requestedAt)}
                </TableCell>
                <TableCell className="capitalize text-muted-foreground">
                  {record.periodLabel}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-foreground">
                  <AnimatedCurrency value={record.amount} duration={500} />
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
                  <ReceiptAction
                    record={record}
                    onViewReceipt={onViewReceipt}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
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
                <p className="text-xs text-muted-foreground">
                  Costo de transacción
                </p>
                <p className="font-semibold tabular-nums text-foreground">
                  {formatAdvanceTransactionFeeRate(record.transactionFeeRate)}
                </p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  <AnimatedCurrency
                    value={record.transactionFeeAmount}
                    duration={450}
                  />
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-primary/10 pt-3">
              <ReceiptAction
                record={record}
                onViewReceipt={onViewReceipt}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
