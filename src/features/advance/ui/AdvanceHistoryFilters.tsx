import { useState } from "react";
import { ChevronDown, ListFilter, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  const [open, setOpen] = useState(false);
  const filtersActive = hasActiveAdvanceHistoryFilters(filters);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className={cn("glass-card glow-border p-4 sm:p-5", className)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CollapsibleTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "border-primary/25 bg-background text-foreground shadow-sm",
                "hover:border-primary/35 hover:bg-primary/8 hover:text-foreground",
                "active:bg-primary/10 active:text-foreground",
                "data-[state=open]:border-primary/40 data-[state=open]:bg-primary/10 data-[state=open]:text-foreground",
              )}
              aria-expanded={open}
            >
              <ListFilter
                className="h-4 w-4 text-primary"
                strokeWidth={2.25}
                aria-hidden
              />
              <span className="font-medium">Filtrar</span>
              {filtersActive ? (
                <Badge
                  variant="secondary"
                  className="ml-0.5 h-5 rounded-full bg-primary/10 px-1.5 text-[10px] font-semibold text-primary"
                >
                  Activos
                </Badge>
              ) : null}
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-300",
                  open && "rotate-180",
                )}
                aria-hidden
              />
            </Button>
          </CollapsibleTrigger>

          <p className="text-xs text-muted-foreground">
            {resultCount} de {totalCount}{" "}
            {totalCount === 1 ? "adelanto" : "adelantos"}
          </p>
        </div>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="mt-4 border-t border-primary/10 pt-4">
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
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
