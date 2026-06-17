import { useMemo, useRef, type ReactNode } from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { DEMO_EMPLOYEE_PROFILE } from "@/shared/config/demoEmployeeProfile";
import {
  calculateAdvanceTransactionFee,
  formatAdvanceTransactionFeeRate,
} from "@/shared/config/advanceFees";
import { amountInWordsSpanish } from "@/shared/utils/amountInWords";
import {
  buildAdvanceReceiptFolio,
  getPayrollPeriodLabel,
} from "@/shared/utils/payrollPeriod";
import { cn } from "@/lib/utils";
import { ADVANCE_RECEIPT_STATUS_CONFIG } from "@/shared/config/advanceStatusStyles";
import type { AdvanceReceiptStatus } from "@/shared/config/advanceHistory.types";

export type { AdvanceReceiptStatus } from "@/shared/config/advanceHistory.types";

function formatReceiptDate(date: Date): string {
  return date.toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDisbursementDate(date: Date): string {
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

type AdvanceReceiptProps = {
  amount: number;
  status?: AdvanceReceiptStatus;
  transactionFeeAmount?: number;
  paymentMethod?: string;
  issuedAt?: Date;
  folio?: string;
  onBack?: () => void;
  backLabel?: string;
  className?: string;
};

export function AdvanceReceipt({
  amount,
  status = "en_curso",
  transactionFeeAmount,
  paymentMethod = "Transferencia bancaria",
  issuedAt: issuedAtProp,
  folio: folioProp,
  onBack,
  backLabel = "Volver a solicitar adelanto",
  className,
}: AdvanceReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const profile = DEMO_EMPLOYEE_PROFILE;

  const issuedAt = useMemo(
    () => issuedAtProp ?? new Date(),
    [issuedAtProp],
  );
  const disbursementAt = useMemo(() => {
    const date = new Date(issuedAt);
    date.setMinutes(date.getMinutes() + 15);
    return date;
  }, [issuedAt]);

  const folio = useMemo(
    () => folioProp ?? buildAdvanceReceiptFolio(issuedAt),
    [folioProp, issuedAt],
  );
  const transactionFee = useMemo(
    () => transactionFeeAmount ?? calculateAdvanceTransactionFee(amount),
    [transactionFeeAmount, amount],
  );
  const netAmount = useMemo(
    () => amount - transactionFee,
    [amount, transactionFee],
  );
  const amountWords = useMemo(
    () => amountInWordsSpanish(netAmount),
    [netAmount],
  );
  const periodLabel = useMemo(
    () => getPayrollPeriodLabel(issuedAt),
    [issuedAt],
  );
  const statusConfig = ADVANCE_RECEIPT_STATUS_CONFIG[status];
  const concept = `Adelanto de nómina correspondiente al periodo ${periodLabel}`;
  const transactionFeeConcept = `Costo de transacción (${formatAdvanceTransactionFeeRate()})`;
  const disbursementLabel =
    status === "en_curso"
      ? "Pendiente de aprobación"
      : formatDisbursementDate(disbursementAt);

  return (
    <div className={cn("mx-auto w-full max-w-xl animate-fade-in", className)}>
      <div
        ref={receiptRef}
        id="advance-receipt"
        className="advance-receipt-invoice relative overflow-hidden bg-white text-foreground shadow-lg"
      >
        {/* Banda superior */}
        <div className="border-b-2 border-primary bg-gradient-primary px-6 py-4 text-primary-foreground">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-white/30 bg-white/15 font-display text-lg font-bold">
                A
              </div>
              <div>
                <p className="font-display text-base font-bold leading-tight sm:text-lg">
                  {profile.company}
                </p>
                <p className="text-[11px] text-primary-foreground/80">
                  Plataforma de adelantos de nómina · AdeCerebiia
                </p>
              </div>
            </div>
            <div
              className={cn(
                "advance-receipt-stamp shrink-0 rounded-none border-2 border-dashed px-2.5 py-1 text-center text-[10px] font-bold uppercase tracking-widest",
                statusConfig.className,
              )}
            >
              {statusConfig.label}
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          {/* Título documento */}
          <div className="mb-5 border-b border-dashed border-border pb-4 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
              Comprobante oficial
            </p>
            <h2 className="mt-1 font-display text-xl font-bold uppercase tracking-wide text-foreground sm:text-2xl">
              Recibo de adelanto
            </h2>
          </div>

          {/* Meta: folio y fecha */}
          <div className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border text-sm">
            <MetaCell label="No. de recibo" value={folio} mono />
            <MetaCell
              label="Fecha de emisión"
              value={formatReceiptDate(issuedAt)}
            />
          </div>

          {/* Emisor / Beneficiario */}
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <PartyBlock title="Empresa emisora">
              <PartyLine label="Razón social" value={profile.company} />
              <PartyLine label="Producto" value="Adelanto de nómina" />
            </PartyBlock>
            <PartyBlock title="Beneficiario">
              <PartyLine label="Nombre" value={profile.fullName} />
              <PartyLine label="Identificación" value={profile.documentNumber} />
              <PartyLine label="Departamento" value={profile.department} />
              <PartyLine label="No. empleado" value={profile.employeeNumber} mono />
            </PartyBlock>
          </div>

          {/* Tabla de conceptos */}
          <div className="mb-5 overflow-hidden rounded-md border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/60">
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Concepto
                  </th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-dashed border-border/80">
                  <td className="px-4 py-3.5 align-top leading-snug text-foreground">
                    {concept}
                  </td>
                  <td className="px-4 py-3.5 text-right align-top font-semibold tabular-nums text-foreground">
                    <AnimatedCurrency value={amount} duration={600} />
                  </td>
                </tr>
                <tr className="border-b border-dashed border-border/80">
                  <td className="px-4 py-3 align-top leading-snug text-muted-foreground">
                    {transactionFeeConcept}
                  </td>
                  <td className="px-4 py-3 text-right align-top font-semibold tabular-nums text-[hsl(260_70%_50%)]">
                    −
                    <AnimatedCurrency
                      value={transactionFee}
                      className="inline"
                      duration={600}
                    />
                  </td>
                </tr>
                <tr className="bg-primary/[0.04]">
                  <td className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-muted-foreground">
                    Total a dispersar
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AnimatedCurrency
                      value={netAmount}
                      className="font-display text-xl font-bold text-primary tabular-nums"
                      duration={700}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Valor en letras */}
          <div className="mb-5 rounded-md border border-border bg-muted/30 px-4 py-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Valor en letras
            </p>
            <p className="text-sm leading-relaxed capitalize italic text-foreground">
              {amountWords}
            </p>
          </div>

          {/* Datos de pago */}
          <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border text-sm sm:grid-cols-2">
            <MetaCell label="Vía de pago" value={paymentMethod} />
            <MetaCell
              label="Fecha de dispersión"
              value={disbursementLabel}
            />
          </div>
        </div>

        {/* Pie tipo ticket */}
        <div className="advance-receipt-perforation border-t border-dashed border-border bg-muted/20 px-6 py-4 text-center">
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Documento generado electrónicamente · Válido sin firma autógrafa
          </p>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground/70">
            {folio} · {formatReceiptDate(issuedAt)}
          </p>
        </div>
      </div>

      <div className="advance-receipt-actions mt-6 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="h-11 flex-1 rounded-xl border-primary/20 font-medium hover:bg-primary/5"
          onClick={() => window.print()}
        >
          <Download className="h-4 w-4" />
          Descargar PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 flex-1 rounded-xl border-primary/20 font-medium hover:bg-primary/5"
          onClick={() => window.print()}
        >
          <Printer className="h-4 w-4" />
          Imprimir comprobante
        </Button>
      </div>

      {onBack ? (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            {backLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function MetaCell({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-sm font-medium text-foreground",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function PartyBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-border">
      <p className="border-b border-border bg-secondary/50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-primary">
        {title}
      </p>
      <div className="space-y-2 px-3 py-3">{children}</div>
    </div>
  );
}

function PartyLine({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-right font-medium text-foreground",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </span>
    </div>
  );
}
