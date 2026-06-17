import { CalendarRange, RotateCcw } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ADVANCE_HISTORY_STATUS_FILTER_OPTIONS,
  DEFAULT_ADVANCE_HISTORY_FILTERS,
  hasActiveAdvanceHistoryFilters,
  type AdvanceHistoryFilters,
} from "@/features/advance/model/advanceHistoryFilters";
import { cn } from "@/lib/utils";

type AdvanceHistoryFiltersProps = {
  filters: AdvanceHistoryFilters;
  onChange: (filters: AdvanceHistoryFilters) => void;
  resultCount: number;
  totalCount: number;
  className?: string;
};

export function AdvanceHistoryFiltersBar({
  filters,
  onChange,
  resultCount,
  totalCount,
  className,
}: AdvanceHistoryFiltersProps) {
  const filtersActive = hasActiveAdvanceHistoryFilters(filters);

  return (
    <div className={cn("glass-card glow-border p-4 sm:p-5", className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-primary" strokeWidth={2.25} />
          <p className="text-sm font-semibold text-foreground">Filtros</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {resultCount} de {totalCount}{" "}
          {totalCount === 1 ? "adelanto" : "adelantos"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="advance-filter-status">Estado</Label>
          <Select
            value={filters.status}
            onValueChange={(value) =>
              onChange({
                ...filters,
                status: value as AdvanceHistoryFilters["status"],
              })
            }
          >
            <SelectTrigger
              id="advance-filter-status"
              className="border-primary/15 bg-background/80"
            >
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              {ADVANCE_HISTORY_STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="advance-filter-from">Desde</Label>
          <Input
            id="advance-filter-from"
            type="date"
            value={filters.dateFrom}
            max={filters.dateTo || undefined}
            onChange={(event) =>
              onChange({ ...filters, dateFrom: event.target.value })
            }
            className="border-primary/15 bg-background/80"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="advance-filter-to">Hasta</Label>
          <Input
            id="advance-filter-to"
            type="date"
            value={filters.dateTo}
            min={filters.dateFrom || undefined}
            onChange={(event) =>
              onChange({ ...filters, dateTo: event.target.value })
            }
            className="border-primary/15 bg-background/80"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={() => onChange(DEFAULT_ADVANCE_HISTORY_FILTERS)}
            disabled={!filtersActive}
            className={cn(
              "inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
              filtersActive
                ? "border-primary/20 text-primary hover:bg-primary/5"
                : "cursor-not-allowed border-border/60 text-muted-foreground/60",
            )}
          >
            <RotateCcw className="h-4 w-4" />
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
}
