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
  const animatedValue = useAnimatedNumber(value, {
    duration,
    enabled,
    decimals,
    delay,
  });

  const formatted = formatter
    ? formatter(animatedValue)
    : animatedValue.toLocaleString("es-CO");

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
  return (
    <AnimatedNumber
      value={Math.abs(value)}
      className={className}
      formatter={(amount) => `$${amount.toLocaleString("es-CO")}`}
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
  return (
    <AnimatedNumber
      value={value}
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
  const percent = useAnimatedNumber(
    Math.min(Math.max((value / max) * 100, 0), 100),
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
