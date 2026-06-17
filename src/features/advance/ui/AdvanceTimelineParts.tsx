import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AdvanceTimelineShellProps = {
  children: ReactNode;
  className?: string;
  groupClass?: string;
  glow?: boolean;
};

export function AdvanceTimelineShell({
  children,
  className,
  groupClass = "group/advance-timeline",
  glow = false,
}: AdvanceTimelineShellProps) {
  return (
    <div
      className={cn(
        groupClass,
        "glass-card relative overflow-hidden p-5 sm:p-6",
        glow && "glow-border",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.05),transparent_60%)]"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </div>
  );
}

type AdvanceTimelineIconNodeProps = {
  icon: LucideIcon;
  className?: string;
};

export function AdvanceTimelineIconNode({
  icon: Icon,
  className,
}: AdvanceTimelineIconNodeProps) {
  return (
    <span
      className={cn(
        "relative z-10 flex h-10 w-10 items-center justify-center rounded-full",
        "border-2 border-primary/20 bg-background",
        "shadow-sm ring-4 ring-primary/5",
        "transition-all duration-300",
        "group-hover/advance-timeline:border-primary/35 group-hover/advance-timeline:shadow-md group-hover/advance-timeline:shadow-primary/10",
        className,
      )}
    >
      <Icon className="h-5 w-5 text-primary" strokeWidth={2.25} />
    </span>
  );
}

type AdvanceTimelineStepNodeProps = {
  step: number;
  state?: "idle" | "active" | "complete";
  className?: string;
};

export function AdvanceTimelineStepNode({
  step,
  state = "idle",
  className,
}: AdvanceTimelineStepNodeProps) {
  return (
    <span
      className={cn(
        "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
        "border-2 bg-background text-sm font-bold shadow-sm ring-4 transition-all duration-500",
        state === "idle" &&
          "border-primary/20 text-primary/70 ring-primary/5",
        state === "active" &&
          "advance-step-node-active border-primary/40 text-primary ring-primary/15 shadow-md shadow-primary/10",
        state === "complete" &&
          "border-primary/30 bg-gradient-primary text-primary-foreground ring-primary/20 shadow-primary/15",
        className,
      )}
    >
      {step}
    </span>
  );
}

type AdvanceTimelineTrackProps = {
  orientation?: "horizontal" | "vertical";
  filled?: boolean;
  className?: string;
};

export function AdvanceTimelineTrack({
  orientation = "horizontal",
  filled = false,
  className,
}: AdvanceTimelineTrackProps) {
  const isVertical = orientation === "vertical";

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        isVertical ? "w-0.5 flex-1 min-h-[2rem]" : "h-0.5 w-full self-center",
        className,
      )}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-0",
          isVertical ? "bg-primary/15" : "bg-primary/15",
        )}
      />
      <div
        className={cn(
          isVertical
            ? "advance-timeline-line-vertical advance-flow-line-fill origin-top"
            : "advance-timeline-line-horizontal advance-flow-line-fill origin-left",
          "absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary shadow-[0_0_10px_hsl(var(--primary)/0.2)]",
          isVertical && "bg-gradient-to-b",
          filled && (isVertical ? "advance-flow-line-filled-y" : "advance-flow-line-filled-x"),
        )}
      />
    </div>
  );
}

/** Línea continua que atraviesa el centro de nodos circulares h-10 w-10. */
type AdvanceTimelineCenterLineProps = {
  filled?: boolean;
  className?: string;
};

export function AdvanceTimelineCenterLine({
  filled = false,
  className,
}: AdvanceTimelineCenterLineProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute left-5 right-5 top-5 z-0 h-0.5 -translate-y-1/2",
        className,
      )}
      aria-hidden
    >
      <AdvanceTimelineTrack filled={filled} className="h-full w-full" />
    </div>
  );
}
