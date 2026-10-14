import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import {
  buildAdvanceQuickAmounts,
  resolveAdvanceAmountStep,
  snapAdvanceAmount,
} from "@/entities/advance";
import { cn } from "@/lib/utils";

export { snapAdvanceAmount };

const COUNT_DURATION = 450;

export function formatAdvanceAmount(value: number): string {
  return `$${value.toLocaleString("es-CO")}`;
}

function parseAmountDigits(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return 0;
  return Number.parseInt(digits, 10);
}

type AdvanceAmountSelectorProps = {
  amount: number;
  onAmountChange: (amount: number) => void;
  minAmount: number;
  maxAmount: number;
  disabled?: boolean;
  className?: string;
};

export function AdvanceAmountSelector({
  amount,
  onAmountChange,
  minAmount,
  maxAmount,
  disabled = false,
  className,
}: AdvanceAmountSelectorProps) {
  const amountInputId = useId();
  const sliderInputId = useId();
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [draftAmount, setDraftAmount] = useState("");

  const effectiveMin = minAmount > 0 && maxAmount >= minAmount ? minAmount : 0;

  const amountStep = useMemo(
    () => resolveAdvanceAmountStep(maxAmount, minAmount),
    [maxAmount, minAmount],
  );

  const quickAmounts = useMemo(
    () => buildAdvanceQuickAmounts(maxAmount, minAmount),
    [maxAmount, minAmount],
  );

  const requestedAmount = isEditingAmount
    ? parseAmountDigits(draftAmount)
    : amount;

  const amountValidationMessage =
    maxAmount > 0 && effectiveMin > 0 && maxAmount < effectiveMin
      ? `Tu saldo disponible (${formatAdvanceAmount(maxAmount)}) no alcanza el monto mínimo (${formatAdvanceAmount(effectiveMin)}).`
      : requestedAmount > 0 && maxAmount <= 0
        ? "No tienes saldo disponible para adelantar."
        : requestedAmount > 0 && requestedAmount < minAmount
          ? "No puedes adelantar valores menores al mínimo configurado."
        : requestedAmount > maxAmount
          ? "No tienes saldo suficiente para adelantar este monto."
          : null;

  const sliderSpan = maxAmount - effectiveMin;
  const progressPercent =
    amount >= effectiveMin && sliderSpan > 0
      ? Math.max(0, Math.min(100, ((amount - effectiveMin) / sliderSpan) * 100))
      : 0;

  useEffect(() => {
    if (!isEditingAmount) {
      setDraftAmount(amount === 0 ? "" : String(amount));
    }
  }, [amount, isEditingAmount]);

  const commitAmount = useCallback(
    (nextValue: number) => {
      onAmountChange(snapAdvanceAmount(nextValue, maxAmount, effectiveMin));
    },
    [effectiveMin, maxAmount, onAmountChange],
  );

  const handleSliderChange = useCallback(
    (value: number[]) => {
      commitAmount(value[0] ?? effectiveMin);
    },
    [commitAmount, effectiveMin],
  );

  const handleQuickSelect = useCallback(
    (preset: number) => {
      onAmountChange(snapAdvanceAmount(preset, maxAmount, effectiveMin));
    },
    [effectiveMin, maxAmount, onAmountChange],
  );

  const handleAmountFocus = useCallback(() => {
    setIsEditingAmount(true);
    setDraftAmount(amount === 0 ? "" : String(amount));
  }, [amount]);

  const handleAmountChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const raw = event.target.value;
      const parsed = parseAmountDigits(raw);
      setDraftAmount(raw.replace(/\D/g, ""));
      if (parsed === 0 || (effectiveMin > 0 && parsed >= effectiveMin && parsed <= maxAmount)) {
        commitAmount(parsed);
      } else {
        onAmountChange(parsed);
      }
    },
    [commitAmount, effectiveMin, maxAmount, onAmountChange],
  );

  const handleAmountBlur = useCallback(() => {
    setIsEditingAmount(false);
    const parsed = parseAmountDigits(draftAmount);
    if (parsed <= 0) {
      commitAmount(0);
    } else if (effectiveMin > 0 && parsed < effectiveMin) {
      commitAmount(effectiveMin);
    } else if (parsed > maxAmount) {
      commitAmount(maxAmount);
    } else {
      commitAmount(parsed);
    }
  }, [commitAmount, draftAmount, effectiveMin, maxAmount]);

  const isSliderDisabled = disabled || (effectiveMin > 0 && maxAmount < effectiveMin);
  const sliderValue = amount > 0
    ? Math.max(effectiveMin, Math.min(amount, maxAmount))
    : effectiveMin;

  return (
    <section
      className={cn(
        "space-y-4",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      aria-disabled={disabled || undefined}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        <div />
        <label
          htmlFor={amountInputId}
          className="block text-center font-display text-base font-semibold text-foreground"
        >
          Monto del adelanto
        </label>
        <div className="justify-self-end text-right">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Mínimo
          </p>
          <AnimatedCurrency
            value={minAmount}
            className="text-sm font-semibold text-foreground"
            duration={COUNT_DURATION}
          />
        </div>
      </div>

      <div className="w-full overflow-visible px-1 sm:px-2">
        <input
          id={amountInputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          aria-label="Monto del adelanto en pesos colombianos"
          value={
            isEditingAmount
              ? draftAmount
              : formatAdvanceAmount(amount)
          }
          onFocus={handleAmountFocus}
          onChange={handleAmountChange}
          onBlur={handleAmountBlur}
          disabled={disabled}
          readOnly={disabled}
          className={cn(
            "advance-amount-display mx-auto block w-full min-w-0 max-w-full bg-transparent text-center font-display text-[clamp(1.75rem,4.5vw+0.5rem,3rem)] font-bold leading-none tabular-nums text-gradient",
            "border-0 outline-none ring-0 focus:outline-none focus:ring-0",
            "placeholder:text-muted-foreground/50",
          )}
          placeholder="$0"
        />
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Disponible:{" "}
          <AnimatedCurrency
            value={maxAmount}
            className="inline font-medium text-foreground"
            duration={800}
          />
        </p>
      </div>

      <div className="overflow-visible px-1">
        <div className="relative overflow-visible py-2">
          <div
            className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-primary/10"
            aria-hidden
          />
          <div
            className="advance-flow-slider-progress pointer-events-none absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-primary via-accent to-primary transition-[width] duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
            aria-hidden
          />
          <Slider
            id={sliderInputId}
            value={[sliderValue]}
            onValueChange={handleSliderChange}
            min={effectiveMin}
            max={Math.max(effectiveMin, maxAmount)}
            step={amountStep}
            disabled={isSliderDisabled}
            aria-label="Seleccionar monto del adelanto"
            className="advance-flow-slider relative z-10 cursor-pointer"
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <AnimatedCurrency
            value={effectiveMin}
            className="inline"
            duration={COUNT_DURATION}
          />
          <AnimatedCurrency
            value={maxAmount}
            className="inline"
            duration={COUNT_DURATION}
          />
        </div>
        {amountValidationMessage ? (
          <p
            className="mt-2 text-center text-sm font-medium text-destructive"
            role="alert"
            aria-live="polite"
          >
            {amountValidationMessage}
          </p>
        ) : null}
      </div>

      {quickAmounts.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {quickAmounts.map((preset) => {
            const isActive = amount === preset;

            return (
              <button
                key={preset}
                type="button"
                disabled={disabled}
                onClick={() => handleQuickSelect(preset)}
                aria-pressed={isActive}
                className={cn(
                  "rounded-xl border px-2 py-2.5 text-xs font-medium transition-all duration-200 sm:px-3 sm:text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
                  isActive
                    ? "border-primary bg-gradient-primary text-primary-foreground shadow-sm shadow-primary/20 hover:brightness-105 active:scale-[0.98]"
                    : "border-border/80 bg-white text-foreground hover:border-primary/35 hover:bg-primary/5 hover:shadow-sm active:scale-[0.98] active:bg-primary/10",
                )}
              >
                {formatAdvanceAmount(preset)}
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
