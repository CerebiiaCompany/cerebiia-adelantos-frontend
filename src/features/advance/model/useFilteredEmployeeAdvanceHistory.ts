import { useMemo, useState } from "react";
import {
  DEFAULT_ADVANCE_HISTORY_FILTERS,
  filterAdvanceHistory,
  hasActiveAdvanceHistoryFilters,
} from "@/features/advance/model/advanceHistoryFilters";
import { useEmployeeAdvanceHistory } from "@/features/advance/model/useEmployeeAdvanceHistory";
import type { AdvanceHistoryRecord } from "@/shared/config/advanceHistory";

export function useFilteredEmployeeAdvanceHistory() {
  const advanceHistory = useEmployeeAdvanceHistory();
  const [filters, setFilters] = useState(DEFAULT_ADVANCE_HISTORY_FILTERS);

  const filteredRecords = useMemo(
    () => filterAdvanceHistory(advanceHistory, filters),
    [advanceHistory, filters],
  );

  const filtersActive = hasActiveAdvanceHistoryFilters(filters);

  return {
    advanceHistory,
    filteredRecords,
    filters,
    setFilters,
    filtersActive,
  };
}

export type { AdvanceHistoryRecord };
