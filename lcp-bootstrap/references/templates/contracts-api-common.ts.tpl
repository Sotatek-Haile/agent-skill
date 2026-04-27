// ============================================================
// Shared types — used across ALL features
// Copy this file as-is. Do not add feature-specific types here.
// ============================================================

/** Standard API response wrapper (auto-applied by backend interceptor) */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PageMeta;
}

/** Pagination metadata returned with list endpoints */
export interface PageMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

/** Pagination query params for list endpoints */
export interface PageQueryParams {
  page?: number;
  limit?: number;
  orderBy?: string;
  direction?: 'ASC' | 'DESC';
}

/** Date range filter used in query params */
export interface DateRangeFilter {
  from?: string; // ISO 8601
  to?: string;   // ISO 8601
}
