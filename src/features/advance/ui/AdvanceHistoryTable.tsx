import { FileText } from "lucide-react";
import type { ReactNode } from "react";
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
import { cn } from "@/lib/utils";
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
  onViewEvidence?: (record: AdvanceHistoryRecord) => void;
  onCancel?: (record: AdvanceHistoryRecord) => void;
  cancellingId?: string | null;
  hasActiveFilters?: boolean;
};

const TABLE_HEAD_CLASS =
  "h-11 whitespace-nowrap bg-primary/[0.04] px-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:rounded-tl-xl last:rounded-tr-xl";

const TABLE_CELL_CLASS = "px-4 py-3.5 align-middle";

function TableLink({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <span className="text-sm text-muted-foreground/60">{children}</span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
    >
      {children}
    </button>
  );
}

function DateCell({ record }: { record: AdvanceHistoryRecord }) {
  return (
    <div className="min-w-[7.5rem]">
      <p className="whitespace-nowrap font-medium text-foreground">
        {formatAdvanceRequestDate(record.requestedAt)}
      </p>
      <p className="mt-0.5 text-xs capitalize text-muted-foreground">
        {record.periodLabel}
      </p>
    </div>
  );
}

function BankingCell({ record }: { record: AdvanceHistoryRecord }) {
  return (
    <div className="min-w-[9rem] max-w-[11rem]">
      <p className="truncate font-medium text-foreground">{record.bankName}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {record.accountTypeLabel}
      </p>
      <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
        {record.accountNumber}
      </p>
    </div>
  );
}

function TransactionCostCell({ record }: { record: AdvanceHistoryRecord }) {
  return (
    <div className="text-right">
      <AnimatedCurrency
        value={record.transactionFeeAmount}
        className="font-semibold tabular-nums text-foreground"
        duration={450}
      />
      <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
        {formatAdvanceTransactionFeeLabel()}
      </p>
    </div>
  );
}

function RejectionReasonCell({ record }: { record: AdvanceHistoryRecord }) {
  if (record.status !== "no_aprobado" || !record.rejectionReason) {
    return <span className="text-sm text-muted-foreground/60">—</span>;
  }

  return (
    <p
      className="max-w-[12rem] text-sm leading-snug text-foreground"
      title={record.rejectionReason}
    >
      {record.rejectionReason}
    </p>
  );
}

function EvidenceAction({
  record,
  onViewEvidence,
}: {
  record: AdvanceHistoryRecord;
  onViewEvidence?: (record: AdvanceHistoryRecord) => void;
}) {
  return (
    <TableLink
      disabled={!record.paymentEvidenceUrl || !onViewEvidence}
      onClick={() => onViewEvidence?.(record)}
    >
      {record.paymentEvidenceUrl ? "Ver evidencia" : "No disponible"}
    </TableLink>
  );
}

function ReceiptAction({
  record,
  onViewReceipt,
}: {
  record: AdvanceHistoryRecord;
  onViewReceipt: (record: AdvanceHistoryRecord) => void;
}) {
  const available = record.status !== "no_aprobado" && record.receiptStatus;

  return (
    <TableLink
      disabled={!available}
      onClick={() => onViewReceipt(record)}
    >
      {available ? "Ver recibo" : "No disponible"}
    </TableLink>
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
    <div className="flex flex-col items-end gap-1.5">
      <ReceiptAction record={record} onViewReceipt={onViewReceipt} />
      {record.canCancel && onCancel ? (
        <button
          type="button"
          onClick={() => onCancel(record)}
          disabled={isCancelling}
          className="text-xs font-medium text-destructive transition-colors hover:text-destructive/80 disabled:opacity-50"
        >
          {isCancelling ? "Cancelando..." : "Cancelar"}
        </button>
      ) : null}
    </div>
  );
}

export function AdvanceHistoryTable({
  records,
  onViewReceipt,
  onViewEvidence,
  onCancel,
  cancellingId = null,
  hasActiveFilters = false,
}: AdvanceHistoryTableProps) {
  if (records.length === 0) {
    return (
      <div className="glass-card glow-border rounded-2xl p-10 text-center">
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
      <div className="glass-card glow-border hidden overflow-hidden rounded-2xl lg:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className={TABLE_HEAD_CLASS}>Fecha</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "text-right")}>
                  Monto
                </TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "text-right")}>
                  Valor a recibir
                </TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Cuotas</TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Cuenta destino</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "text-right")}>
                  Comisión
                </TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Estado</TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Motivo</TableHead>
                <TableHead className={TABLE_HEAD_CLASS}>Evidencia</TableHead>
                <TableHead className={cn(TABLE_HEAD_CLASS, "text-right")}>
                  Acciones
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record, index) => (
                <TableRow
                  key={record.id}
                  className={cn(
                    "border-primary/5 transition-colors hover:bg-primary/[0.03]",
                    index % 2 === 1 && "bg-primary/[0.015]",
                  )}
                >
                  <TableCell className={TABLE_CELL_CLASS}>
                    <DateCell record={record} />
                  </TableCell>
                  <TableCell
                    className={cn(
                      TABLE_CELL_CLASS,
                      "whitespace-nowrap text-right font-semibold tabular-nums text-foreground",
                    )}
                  >
                    <AnimatedCurrency value={record.amount} duration={500} />
                  </TableCell>
                  <TableCell className={cn(TABLE_CELL_CLASS, "text-right")}>
                    <AnimatedCurrency
                      value={record.netAmount}
                      className="font-display text-base font-bold tabular-nums text-primary"
                      duration={500}
                    />
                  </TableCell>
                  <TableCell
                    className={cn(
                      TABLE_CELL_CLASS,
                      "whitespace-nowrap text-sm text-foreground",
                    )}
                  >
                    {formatAdvanceInstallmentsLabel(record.installments)}
                  </TableCell>
                  <TableCell className={TABLE_CELL_CLASS}>
                    <BankingCell record={record} />
                  </TableCell>
                  <TableCell className={TABLE_CELL_CLASS}>
                    <TransactionCostCell record={record} />
                  </TableCell>
                  <TableCell className={TABLE_CELL_CLASS}>
                    <Badge
                      variant="outline"
                      className={cn(
                        "whitespace-nowrap font-medium",
                        ADVANCE_HISTORY_STATUS_BADGE_CLASS[record.status],
                      )}
                    >
                      {ADVANCE_HISTORY_STATUS_LABEL[record.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className={TABLE_CELL_CLASS}>
                    <RejectionReasonCell record={record} />
                  </TableCell>
                  <TableCell className={TABLE_CELL_CLASS}>
                    <EvidenceAction
                      record={record}
                      onViewEvidence={onViewEvidence}
                    />
                  </TableCell>
                  <TableCell className={cn(TABLE_CELL_CLASS, "text-right")}>
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
      </div>

      <div className="space-y-3 lg:hidden">
        {records.map((record) => (
          <div
            key={record.id}
            className="glass-card glow-border space-y-4 rounded-2xl p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <DateCell record={record} />
              <Badge
                variant="outline"
                className={ADVANCE_HISTORY_STATUS_BADGE_CLASS[record.status]}
              >
                {ADVANCE_HISTORY_STATUS_LABEL[record.status]}
              </Badge>
            </div>

            {record.status === "no_aprobado" && record.rejectionReason ? (
              <div className="rounded-xl border border-destructive/15 bg-destructive/5 px-3 py-2.5 text-sm text-foreground">
                <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
                  Motivo de rechazo
                </p>
                <p className="mt-1 leading-snug">{record.rejectionReason}</p>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-primary/10 bg-primary/[0.02] p-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Monto solicitado
                </p>
                <AnimatedCurrency
                  value={record.amount}
                  className="mt-1 font-display text-lg font-bold text-foreground"
                  duration={500}
                />
              </div>
              <div className="text-right">
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Valor a recibir
                </p>
                <AnimatedCurrency
                  value={record.netAmount}
                  className="mt-1 font-display text-lg font-bold text-primary"
                  duration={500}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Cuotas</p>
                <p className="font-medium text-foreground">
                  {formatAdvanceInstallmentsLabel(record.installments)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Comisión</p>
                <AnimatedCurrency
                  value={record.transactionFeeAmount}
                  className="font-semibold text-foreground"
                  duration={450}
                />
              </div>
              <div className="col-span-2 rounded-lg border border-primary/10 bg-background/60 px-3 py-2">
                <p className="text-xs text-muted-foreground">Cuenta destino</p>
                <p className="font-medium text-foreground">{record.bankName}</p>
                <p className="text-xs text-muted-foreground">
                  {record.accountTypeLabel} · {record.accountNumber}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary/10 pt-3">
              <EvidenceAction
                record={record}
                onViewEvidence={onViewEvidence}
              />
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
