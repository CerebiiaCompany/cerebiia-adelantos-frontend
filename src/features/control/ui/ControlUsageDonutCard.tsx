import { useState } from "react";
import { AnimatedCurrency } from "@/components/ui/animated-number";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

const CHART_COLORS = {
  primary: "hsl(220, 90%, 55%)",
  accent: "hsl(260, 70%, 55%)",
} as const;

type ControlUsageDonutCardProps = {
  percent: number;
  usedAmount: number;
  limitAmount: number;
};

export function ControlUsageDonutCard({
  percent,
  usedAmount,
  limitAmount,
}: ControlUsageDonutCardProps) {
  const [hoverRestartKey, setHoverRestartKey] = useState(0);

  const animatedPercent = useAnimatedNumber(percent, {
    duration: 700,
    restartKey: hoverRestartKey,
  });

  const strokeDash = animatedPercent * 2.64;

  return (
    <div
      className="group/control-stat glass-card flex min-h-[240px] flex-col items-center justify-center p-5 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      onMouseEnter={() => setHoverRestartKey((key) => key + 1)}
    >
      <div className="relative mb-4 h-32 w-32 sm:h-36 sm:w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="hsl(220, 14%, 90%)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="url(#controlDonutGradient)"
            strokeWidth="8"
            strokeDasharray={`${strokeDash} 264`}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out group-hover/control-stat:drop-shadow-[0_0_8px_hsl(260_70%_55%_/_0.35)]"
          />
          <defs>
            <linearGradient
              id="controlDonutGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={CHART_COLORS.primary} />
              <stop offset="100%" stopColor={CHART_COLORS.accent} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-3xl font-bold tabular-nums text-foreground sm:text-[2rem]">
            {animatedPercent}%
          </span>
        </div>
      </div>

      <div className="flex w-full max-w-[220px] flex-col items-center gap-1">
        <p className="text-sm font-medium text-foreground">Utilizado este mes</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          <AnimatedCurrency
            value={usedAmount}
            className="inline font-medium text-foreground"
            duration={800}
          />{" "}
          de{" "}
          <AnimatedCurrency
            value={limitAmount}
            className="inline font-medium text-foreground"
            duration={900}
          />
        </p>
      </div>
    </div>
  );
}
