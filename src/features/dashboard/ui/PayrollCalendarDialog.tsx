import { useEffect, useMemo, useState, type ReactNode } from "react";
import { addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { Ban, ChevronLeft, ChevronRight, CircleDollarSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  getCalendarDayStart,
  getNextPaymentDate,
  isAdvanceAvailableDay,
  isAdvanceBlockedDay,
  isPaymentDay,
  isTodayCalendarDay,
} from "@/shared/config/payrollCalendar";
import { cn } from "@/lib/utils";

type PayrollCalendarDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PayrollCalendarDialog({
  open,
  onOpenChange,
}: PayrollCalendarDialogProps) {
  const nextPayment = useMemo(() => getNextPaymentDate(), []);
  const [today, setToday] = useState(() => getCalendarDayStart());
  const [month, setMonth] = useState<Date>(() => getCalendarDayStart());

  useEffect(() => {
    if (open) {
      const currentDay = getCalendarDayStart();
      setToday(currentDay);
      setMonth(currentDay);
    }
  }, [open]);

  const monthLabel = month.toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
  });

  const todayLabel = today.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(calc(100vw-1.5rem),22rem)] gap-0 overflow-hidden border-border bg-background p-0 shadow-xl sm:max-w-sm sm:rounded-2xl [&>button]:right-3 [&>button]:top-3 [&>button]:text-muted-foreground [&>button]:hover:text-foreground">
        <DialogTitle className="sr-only">Calendario de nómina</DialogTitle>
        <DialogDescription className="sr-only">
          Fechas de pago y ventanas para solicitar adelanto en cada mes.
        </DialogDescription>

        <div className="physical-calendar-shell mx-2 mb-2 mt-3 overflow-hidden rounded-xl sm:mx-3 sm:mb-3">
          {/* Anillas tipo calendario de pared */}
          <div className="physical-calendar-binding">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="physical-calendar-ring" aria-hidden />
            ))}
          </div>

          {/* Banda del mes — estilo hoja de calendario */}
          <div className="physical-calendar-month-band">
            <button
              type="button"
              onClick={() => setMonth((current) => subMonths(current, 1))}
              className="physical-calendar-nav-btn"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary-foreground/75">
                Nómina
              </p>
              <p className="truncate font-display text-lg font-bold capitalize leading-tight text-primary-foreground sm:text-xl">
                {monthLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMonth((current) => addMonths(current, 1))}
              className="physical-calendar-nav-btn"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Cuadrícula del mes */}
          <div className="physical-calendar-grid bg-[#faf9f7] p-2 sm:p-2.5">
            <Calendar
              mode="single"
              locale={es}
              month={month}
              onMonthChange={setMonth}
              showOutsideDays
              fixedWeeks
              className="w-full p-0"
              classNames={{
                months: "w-full",
                month: "w-full space-y-0",
                caption: "hidden",
                nav: "hidden",
                table: "w-full border-collapse",
                head_row: "flex w-full",
                head_cell:
                  "flex flex-1 items-center justify-center border border-border/80 bg-muted/60 py-1.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground",
                row: "mt-0 flex w-full",
                cell: "relative flex flex-1 aspect-square min-h-0 p-0 text-center",
                day: cn(
                  "physical-calendar-day h-full w-full rounded-none border border-border/70 bg-[#faf9f7] p-0 text-sm font-semibold text-foreground",
                  "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                ),
                day_outside: "opacity-40",
                day_today: "physical-calendar-day-today",
                day_selected:
                  "physical-calendar-day-today ring-2 ring-inset ring-amber-500/80 bg-amber-50/90 font-extrabold text-amber-950",
              }}
              modifiers={{
                today: (date) => isTodayCalendarDay(date, today),
                payment: isPaymentDay,
                available: (date) =>
                  !isPaymentDay(date) && isAdvanceAvailableDay(date),
                blocked: (date) =>
                  !isPaymentDay(date) && isAdvanceBlockedDay(date),
              }}
              modifiersClassNames={{
                today: "physical-calendar-day-today z-[1] font-extrabold",
                payment:
                  "!bg-primary !text-primary-foreground hover:!bg-primary font-bold shadow-inner",
                available:
                  "!bg-primary/10 !text-primary hover:!bg-primary/15 font-semibold",
                blocked:
                  "!bg-red-50/80 !text-destructive/80 line-through decoration-destructive/60 hover:!bg-red-50",
              }}
              selected={today}
            />
          </div>

          {/* Pie tipo bloc de notas */}
          <div className="space-y-1 border-t border-dashed border-border bg-muted px-3 py-2 text-center">
            <p className="text-[10px] text-muted-foreground">
              Hoy ·{" "}
              <span className="font-semibold capitalize text-amber-800">
                {todayLabel}
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground">
              Próximo pago ·{" "}
              <span className="font-semibold text-foreground">
                {nextPayment.toLocaleDateString("es-CO", {
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </p>
          </div>
        </div>

        <div className="space-y-2 border-t border-border bg-muted px-3 pb-4 pt-3 sm:px-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
            Leyenda
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <LegendItem
              icon={
                <span className="relative flex h-7 w-7 items-center justify-center border-2 border-amber-500 bg-amber-50 text-[10px] font-extrabold text-amber-900">
                  {today.getDate()}
                  <span
                    className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500 ring-1 ring-background"
                    aria-hidden
                  />
                </span>
              }
              label="Hoy (día actual)"
            />
            <LegendItem
              icon={
                <span className="flex h-7 w-7 items-center justify-center border border-border bg-primary text-[10px] font-bold text-primary-foreground">
                  15
                </span>
              }
              label="Pago de nómina (1 y 15)"
            />
            <LegendItem
              icon={
                <span className="flex h-7 w-7 items-center justify-center border border-primary/20 bg-primary/10 text-[10px] font-bold text-primary">
                  8
                </span>
              }
              label="Adelanto disponible"
            />
            <LegendItem
              icon={
                <span className="flex h-7 w-7 items-center justify-center border border-destructive/25 bg-red-50/80 text-[10px] font-bold text-destructive/80 line-through">
                  12
                </span>
              }
              label="Sin adelanto"
            />
            <LegendItem
              icon={<CircleDollarSign className="h-4 w-4 text-primary" />}
              label="1.ª quincena: hasta el día 10"
            />
            <LegendItem
              icon={<Ban className="h-3.5 w-3.5 text-foreground/55" />}
              label="2.ª quincena: del 15 al 20"
              muted
              className="sm:col-span-2"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LegendItem({
  icon,
  label,
  muted,
  className,
}: {
  icon: ReactNode;
  label: string;
  muted?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="shrink-0">{icon}</div>
      <p
        className={cn(
          "text-xs leading-snug",
          muted ? "text-foreground/65" : "text-foreground",
        )}
      >
        {label}
      </p>
    </div>
  );
}
