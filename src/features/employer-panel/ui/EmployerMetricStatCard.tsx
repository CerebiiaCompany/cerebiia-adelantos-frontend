import type { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type MetricChip = {
  label: string;
  value: number;
  tone?: "primary" | "warning" | "muted";
};

type Segment = {
  value: number;
  tone: "primary" | "warning" | "muted" | "accent";
};

type EmployerMetricStatCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  isLoading?: boolean;
  hasError?: boolean;
  /** Texto corto bajo el número. */
  hint?: string;
  /** Barra segmentada (composición). */
  segments?: Segment[];
  /** Chips de desglose con datos reales. */
  chips?: MetricChip[];
  className?: string;
};

const TONE_BG: Record<Segment["tone"], string> = {
  primary: "bg-gradient-primary",
  accent: "bg-[hsl(260_70%_55%)]",
  warning: "bg-warning",
  muted: "bg-muted-foreground/25",
};

const CHIP_DOT: Record<NonNullable<MetricChip["tone"]>, string> = {
  primary: "bg-primary",
  warning: "bg-warning",
  muted: "bg-muted-foreground/40",
};

export function EmployerMetricStatCard({
  label,
  value,
  icon: Icon,
  isLoading = false,
  hasError = false,
  hint,
  segments = [],
  chips = [],
  className,
}: EmployerMetricStatCardProps) {
  const segmentTotal = segments.reduce((sum, item) => sum + item.value, 0);

  return (
    <div
      className={cn(
        "glass-card glow-border relative flex h-full flex-col overflow-hidden rounded-xl p-5",
        className,
      )}
    >
      <Icon
        className="pointer-events-none absolute -bottom-3 -right-3 h-24 w-24 text-primary/[0.06]"
        strokeWidth={1.25}
        aria-hidden
      />

      <div className="relative mb-3 flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/5">
          <Icon className="h-4 w-4 text-primary" strokeWidth={2.25} />
        </span>
      </div>

      <div className="relative">
        {isLoading ? (
          <Skeleton className="h-9 w-16 rounded-lg" />
        ) : hasError ? (
          <p className="font-display text-3xl font-bold text-muted-foreground">
            —
          </p>
        ) : (
          <AnimatedNumber
            value={value}
            className="font-display text-3xl font-bold text-foreground"
          />
        )}
        {hint && !isLoading && !hasError ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>

      <div className="relative mt-auto space-y-3 pt-5">
        {isLoading ? (
          <>
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-4 w-3/4 rounded-md" />
          </>
        ) : hasError ? null : (
          <>
            {segments.length > 0 && segmentTotal > 0 ? (
              <div
                className="flex h-2 w-full overflow-hidden rounded-full bg-secondary"
                role="img"
                aria-label={`Composición de ${label}`}
              >
                {segments.map((segment, index) => {
                  if (segment.value <= 0) return null;
                  const width = `${(segment.value / segmentTotal) * 100}%`;
                  return (
                    <span
                      key={`${segment.tone}-${index}`}
                      className={cn("h-full", TONE_BG[segment.tone])}
                      style={{ width }}
                    />
                  );
                })}
              </div>
            ) : segments.length > 0 ? (
              <div className="h-2 w-full rounded-full bg-secondary" />
            ) : null}

            {chips.length > 0 ? (
              <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
                {chips.map((chip) => (
                  <li
                    key={chip.label}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 shrink-0 rounded-full",
                        CHIP_DOT[chip.tone ?? "muted"],
                      )}
                      aria-hidden
                    />
                    <span className="font-semibold tabular-nums text-foreground">
                      <AnimatedNumber value={chip.value} className="inline" />
                    </span>
                    {chip.label}
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
