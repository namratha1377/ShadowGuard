import type { PaginatedResponse } from './types.js';

/**
 * Slices an already-filtered array into a page and wraps it with the
 * pagination metadata the frontend expects (total, page, pageSize, totalPages).
 */
export function paginate<T>(items: T[], page = 1, pageSize = 10): PaginatedResponse<T> {
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  return {
    data,
    total: items.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
}

/** SQLite has no array/object column type, so we store JSON text. This undoes that. */
export function parseJSON<T>(value: string): T {
  return JSON.parse(value) as T;
}
