import { CalendarX2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AdvanceWindowBlockedNoticeProps = {
  onOpenCalendar?: () => void;
  className?: string;
};

export function AdvanceWindowBlockedNotice({
  onOpenCalendar,
  className,
}: AdvanceWindowBlockedNoticeProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-destructive/25 bg-red-50/80 px-4 py-4 shadow-sm",
        className,
      )}
      role="alert"
      aria-live="polite"
    >
      <CalendarX2
        className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
        strokeWidth={2.25}
        aria-hidden
      />
      <div className="min-w-0 space-y-2">
        <p className="text-sm font-semibold leading-snug text-destructive">
          No puedes adelantar el día de hoy
        </p>
        <p className="text-sm leading-relaxed text-foreground/80">
          Consulta el calendario para estar más informado sobre las fechas en
          las que puedes solicitar tu adelanto.
        </p>
        {onOpenCalendar ? (
          <button
            type="button"
            onClick={onOpenCalendar}
            className="text-sm font-semibold text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
          >
            Ver calendario de nómina
          </button>
        ) : null}
      </div>
    </div>
  );
}
