// ⚠️ AGNOSTIC — paginated list responses from Django REST API

export interface PaginatedResponse<T> {
  count: number;
  page: number;
  page_size: number;
  /** Número de página siguiente, o null si no hay más. */
  next: number | null;
  /** Número de página anterior, o null. */
  previous: number | null;
  results: T[];
}
