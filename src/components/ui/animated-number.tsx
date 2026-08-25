import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  useAnimatedNumber,
  type UseAnimatedNumberOptions,
} from "@/hooks/useAnimatedNumber";

interface AnimatedNumberProps extends UseAnimatedNumberOptions {
  value: number;
  className?: string;
  formatter?: (value: number) => string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

function sanitizeNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

export function AnimatedNumber({
  value,
  className,
  formatter,
  prefix,
  suffix,
  duration,
  enabled,
  decimals,
  delay,
}: AnimatedNumberProps) {
  const safeTarget = sanitizeNumber(value);
  const animatedValue = useAnimatedNumber(safeTarget, {
    duration,
    enabled,
    decimals,
    delay,
  });

  const displayNum = sanitizeNumber(animatedValue);
  const formatted = formatter
    ? formatter(displayNum)
    : displayNum.toLocaleString("es-CO");

  return (
    <span className={cn("tabular-nums", className)}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

interface AnimatedCurrencyProps extends Omit<AnimatedNumberProps, "formatter" | "decimals"> {
  sign?: "+" | "-" | "";
}

export function AnimatedCurrency({
  value,
  sign = "",
  className,
  ...options
}: AnimatedCurrencyProps) {
  const safeValue = sanitizeNumber(value);
  return (
    <AnimatedNumber
      value={Math.abs(safeValue)}
      className={className}
      formatter={(amount) => `$${sanitizeNumber(amount).toLocaleString("es-CO")}`}
      prefix={sign}
      {...options}
    />
  );
}

interface AnimatedPercentProps extends Omit<AnimatedNumberProps, "formatter"> {
  showSymbol?: boolean;
}

export function AnimatedPercent({
  value,
  showSymbol = true,
  className,
  decimals = 0,
  ...options
}: AnimatedPercentProps) {
  const safeValue = sanitizeNumber(value);
  return (
    <AnimatedNumber
      value={safeValue}
      decimals={decimals}
      className={className}
      suffix={showSymbol ? "%" : undefined}
      {...options}
    />
  );
}

interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  duration?: number;
}

export function AnimatedProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  duration = 1000,
}: AnimatedProgressBarProps) {
  const safeVal = sanitizeNumber(value);
  const safeMax = Math.max(sanitizeNumber(max), 1);
  const percent = useAnimatedNumber(
    Math.min(Math.max((safeVal / safeMax) * 100, 0), 100),
    { duration },
  );

  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-secondary", className)}>
      <div
        className={cn("h-full rounded-full bg-gradient-primary", barClassName)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

