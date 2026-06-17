import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type PayrollCalendarFabProps = {
  onClick: () => void;
  daysUntilPayment?: number;
  className?: string;
};

export function PayrollCalendarFab({
  onClick,
  daysUntilPayment,
  className,
}: PayrollCalendarFabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Consultar calendario de nómina"
      className={cn(
        "group/payroll-fab fixed right-4 top-[calc(3.5rem+0.75rem)] z-40 flex items-center gap-0 overflow-hidden rounded-full border border-primary/20 bg-background/90 p-1 shadow-[0_8px_32px_hsl(var(--primary)/0.22)] backdrop-blur-md transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_12px_40px_hsl(var(--primary)/0.28)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "animate-fade-in sm:right-6 sm:top-[calc(3.5rem+1rem)]",
        className,
      )}
    >
      <span
        className={cn(
          "max-w-0 overflow-hidden whitespace-nowrap pl-0 text-sm font-semibold text-foreground opacity-0 transition-all duration-300",
          "group-hover/payroll-fab:max-w-[11rem] group-hover/payroll-fab:pl-3 group-hover/payroll-fab:opacity-100",
          "group-focus-visible/payroll-fab:max-w-[11rem] group-focus-visible/payroll-fab:pl-3 group-focus-visible/payroll-fab:opacity-100",
        )}
      >
        Consultar calendario
      </span>

      <span className="relative flex h-14 w-14 shrink-0 items-center justify-center sm:h-12 sm:w-12">
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-glow"
        />
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-gradient-primary opacity-90"
        />
        <span className="relative inline-flex items-center justify-center stat-card-icon-motion-calendar text-primary-foreground">
          <Calendar className="h-5 w-5" strokeWidth={2.25} />
        </span>
        {typeof daysUntilPayment === "number" && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-accent px-1 text-[10px] font-bold leading-none text-accent-foreground shadow-sm">
            {daysUntilPayment}
          </span>
        )}
      </span>
    </button>
  );
}
