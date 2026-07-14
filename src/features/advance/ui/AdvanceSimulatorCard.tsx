import { Calculator, Coins, Layers3 } from "lucide-react";
import {
  AnimatedCurrency,
  AnimatedNumber,
} from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";
import { formatAdvanceTransactionFeeLabel } from "@/shared/config/advanceFees";
import {
  buildInstallmentCutoffDates,
  formatDate,
  formatIsoDateLocal,
} from "@/shared/lib";
import { AdvanceAmountSelector } from "./AdvanceAmountSelector";
import {
  AdvanceTimelineCenterLine,
  AdvanceTimelineShell,
} from "./AdvanceTimelineParts";

const COUNT_DURATION = 450;

type AdvanceSimulatorCardProps = {
  amount: number;
  onAmountChange: (amount: number) => void;
  installments: number;
  onInstallmentsChange: (installments: number) => void;
  maxAmount: number;
  minAmount: number;
  maxInstallments: number;
  tarifaFijaPorCuota: number;
  fee: number;
  total: number;
  installmentValue: number;
  disabled?: boolean;
  /** Fecha base para el plan de cortes (por defecto hoy). */
  requestedAt?: Date;
};

export function AdvanceSimulatorCard({
  amount,
  onAmountChange,
  installments,
  onInstallmentsChange,
  maxAmount,
  minAmount,
  maxInstallments,
  tarifaFijaPorCuota,
  fee,
  total,
  installmentValue,
  disabled = false,
  requestedAt = new Date(),
}: AdvanceSimulatorCardProps) {
  const hasAmount = !disabled && amount >= minAmount;
  const installmentOptions = Array.from(
    { length: Math.max(1, maxInstallments) },
    (_, index) => index + 1,
  );
  const cutoffDates = hasAmount
    ? buildInstallmentCutoffDates(requestedAt, installments)
    : [];

  return (
    <AdvanceTimelineShell
      groupClass="group/advance-flow"
      glow={!disabled}
    >
      <div
        className={cn(
          "space-y-8 transition-opacity duration-300",
          disabled && "pointer-events-none opacity-50",
        )}
        aria-disabled={disabled || undefined}
      >
        <AdvanceAmountSelector
          amount={amount}
          onAmountChange={onAmountChange}
          maxAmount={maxAmount}
          disabled={disabled}
        />

        <div className="border-t border-border/60" aria-hidden />

        <section className="space-y-4">
          <h3 className="text-center font-display text-base font-semibold text-foreground">
            Número de cuotas
          </h3>

          <div
            className={cn(
              "relative mx-auto max-w-sm px-2 transition-opacity duration-300",
              !hasAmount && "pointer-events-none opacity-45",
            )}
          >
            <AdvanceTimelineCenterLine filled={hasAmount} />

            <div className="relative flex justify-between">
              {installmentOptions.map((option) => {
                const selected = installments === option;

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={!hasAmount || disabled}
                    onClick={() => onInstallmentsChange(option)}
                    className="group/installment relative z-10 flex shrink-0 flex-col items-center gap-2"
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300",
                        "group-hover/installment:scale-105",
                        selected
                          ? "advance-step-node-active border-primary/30 bg-gradient-primary text-primary-foreground shadow-md shadow-primary/15 ring-4 ring-primary/15"
                          : "border-primary/20 bg-background text-primary ring-4 ring-primary/5 hover:border-primary/35",
                      )}
                    >
                      {option}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium transition-colors",
                        selected ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {option === 1 ? "cuota" : "cuotas"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <div className="border-t border-border/60" aria-hidden />

        <section className="space-y-4">
          <h3 className="text-center font-display text-base font-semibold text-foreground">
            Simulación del adelanto
          </h3>

          <div
            className={cn(
              "space-y-3 rounded-xl border border-primary/10 bg-background/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-500",
              hasAmount
                ? "advance-simulation-enter border-primary/20 shadow-primary/5"
                : "opacity-60",
            )}
          >
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              <Calculator className="h-4 w-4 text-primary" strokeWidth={2.25} />
              <span className="text-sm font-semibold text-foreground">
                Resumen
              </span>
            </div>

            <SummaryRow label="Monto solicitado" value={amount} />
            <SummaryRow
              label={formatAdvanceTransactionFeeLabel(tarifaFijaPorCuota)}
              value={fee}
              negative
            />
            <SummaryRow label="Cuotas" value={installments} isCount />

            <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-bold">
              <span className="flex items-center gap-2 text-foreground">
                <Coins className="h-4 w-4 text-primary" strokeWidth={2.25} />
                Recibirás
              </span>
              <AnimatedCurrency
                value={total}
                className={cn(
                  "text-primary transition-transform duration-300",
                  hasAmount && "advance-amount-pop",
                )}
                duration={COUNT_DURATION}
              />
            </div>

            {installments > 1 && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Layers3 className="h-3.5 w-3.5" strokeWidth={2.25} />
                  Valor por cuota
                </span>
                <AnimatedCurrency
                  value={installmentValue}
                  duration={COUNT_DURATION}
                />
              </div>
            )}

            {cutoffDates.length > 0 ? (
              <div className="space-y-1.5 border-t border-border/60 pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Fechas de corte
                </p>
                {cutoffDates.map((date, index) => (
                  <div
                    key={formatIsoDateLocal(date)}
                    className="flex justify-between text-sm text-muted-foreground"
                  >
                    <span>
                      Cuota {index + 1}
                      {index === 0 ? " (mes de solicitud)" : ""}
                    </span>
                    <span className="font-medium text-foreground">
                      {formatDate(formatIsoDateLocal(date))}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </AdvanceTimelineShell>
  );
}

function SummaryRow({
  label,
  value,
  negative = false,
  isCount = false,
}: {
  label: string;
  value: number;
  negative?: boolean;
  isCount?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      {isCount ? (
        <AnimatedNumber
          value={value}
          className="font-medium text-foreground"
          duration={COUNT_DURATION}
        />
      ) : (
        <AnimatedCurrency
          value={value}
          sign={negative ? "-" : ""}
          className="font-medium text-foreground"
          duration={COUNT_DURATION}
        />
      )}
    </div>
  );
}
