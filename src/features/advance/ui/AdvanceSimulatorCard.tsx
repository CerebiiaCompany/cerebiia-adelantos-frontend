import { Calculator, Coins, Layers3 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  AnimatedCurrency,
  AnimatedNumber,
} from "@/components/ui/animated-number";
import { cn } from "@/lib/utils";
import {
  AdvanceTimelineCenterLine,
  AdvanceTimelineShell,
} from "./AdvanceTimelineParts";

const COUNT_DURATION = 450;
const PRESET_AMOUNTS = [500_000, 1_000_000, 1_500_000, 2_000_000] as const;
const INSTALLMENT_OPTIONS = [1, 2, 3] as const;

type AdvanceSimulatorCardProps = {
  amount: number;
  onAmountChange: (amount: number) => void;
  installments: number;
  onInstallmentsChange: (installments: number) => void;
  maxAmount: number;
  minAmount: number;
  fee: number;
  total: number;
  installmentValue: number;
};

export function AdvanceSimulatorCard({
  amount,
  onAmountChange,
  installments,
  onInstallmentsChange,
  maxAmount,
  minAmount,
  fee,
  total,
  installmentValue,
}: AdvanceSimulatorCardProps) {
  const hasAmount = amount >= minAmount;
  const amountProgress = maxAmount > 0 ? amount / maxAmount : 0;

  return (
    <AdvanceTimelineShell groupClass="group/advance-flow" glow>
      <div className="space-y-8">
        <section className="space-y-4">
          <h3 className="text-center font-display text-base font-semibold text-foreground">
            Monto del adelanto
          </h3>

          <div className="flex flex-col items-center text-center">
            <AnimatedCurrency
              value={amount}
              className="advance-amount-display font-display text-4xl font-bold text-gradient sm:text-5xl"
              duration={COUNT_DURATION}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Disponible:{" "}
              <AnimatedCurrency
                value={maxAmount}
                className="inline font-medium text-foreground"
                duration={800}
              />
            </p>
          </div>

          <div className="px-1">
            <div className="relative">
              <div
                className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-primary/10"
                aria-hidden
              />
              <div
                className="advance-flow-slider-progress pointer-events-none absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-500 ease-out"
                style={{ width: `${amountProgress * 100}%` }}
                aria-hidden
              />
              <Slider
                value={[amount]}
                onValueChange={(value) => onAmountChange(value[0])}
                min={0}
                max={maxAmount}
                step={50_000}
                className="advance-flow-slider relative z-10 cursor-pointer"
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <AnimatedCurrency
                value={maxAmount}
                className="inline"
                duration={COUNT_DURATION}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESET_AMOUNTS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onAmountChange(preset)}
                className={cn(
                  "rounded-xl px-2 py-2.5 text-xs font-medium transition-all duration-300 sm:px-3 sm:text-sm",
                  "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
                  amount === preset
                    ? "bg-gradient-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "border border-primary/10 bg-background/80 text-foreground hover:border-primary/25 hover:bg-primary/5",
                )}
              >
                <AnimatedCurrency value={preset} duration={COUNT_DURATION} />
              </button>
            ))}
          </div>
        </section>

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
              {INSTALLMENT_OPTIONS.map((option) => {
                const selected = installments === option;

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={!hasAmount}
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
            <SummaryRow label="Comisión (2.5%)" value={fee} negative />
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
