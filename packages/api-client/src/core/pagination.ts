/**
 * Pagination utilities for API Client
 * Handles Django REST Framework's pagination format
 */

/**
 * Paginated response structure (matches DRF PageNumberPagination)
 */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Cursor-based pagination response
 */
export interface CursorPaginated<T> {
  next: string | null;
  previous: string | null;
  results: T[];
}

/**
 * Pagination parameters for requests
 */
export interface PaginationParams {
  page?: number | undefined;
  pageSize?: number | undefined;
  cursor?: string | undefined;
}

/**
 * Helper to extract page number from URL
 */
export function extractPageNumber(url: string | null): number | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const page = urlObj.searchParams.get('page');
    return page ? parseInt(page, 10) : null;
  } catch {
    return null;
  }
}

/**
 * Helper to extract cursor from URL
 */
export function extractCursor(url: string | null): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('cursor');
  } catch {
    return null;
  }
}

/**
 * Check if there are more pages
 */
export function hasNextPage<T>(response: Paginated<T> | CursorPaginated<T>): boolean {
  return response.next !== null;
}

/**
 * Check if there is a previous page
 */
export function hasPreviousPage<T>(response: Paginated<T> | CursorPaginated<T>): boolean {
  return response.previous !== null;
}

/**
 * Iterator for paginated results
 * Automatically fetches all pages
 */
export async function* iterateAll<T>(
  fetchPage: (params: PaginationParams) => Promise<Paginated<T>>
): AsyncGenerator<T, void, unknown> {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetchPage({ page });

    for (const item of response.results) {
      yield item;
    }

    hasMore = hasNextPage(response);
    page++;
  }
}

/**
 * Iterator for cursor-based pagination
 */
export async function* iterateCursor<T>(
  fetchPage: (params: PaginationParams) => Promise<CursorPaginated<T>>
): AsyncGenerator<T, void, unknown> {
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const params: PaginationParams = {};
    if (cursor !== undefined) {
      params.cursor = cursor;
    }
    const response = await fetchPage(params);

    for (const item of response.results) {
      yield item;
    }

    hasMore = hasNextPage(response);
    const nextCursor = extractCursor(response.next);
    cursor = nextCursor ?? undefined;
  }
}

/**
 * Collect all items from paginated endpoint
 */
export async function collectAll<T>(
  fetchPage: (params: PaginationParams) => Promise<Paginated<T>>
): Promise<T[]> {
  const items: T[] = [];

  for await (const item of iterateAll(fetchPage)) {
    items.push(item);
  }

  return items;
}

/**
 * Collect all items from cursor-paginated endpoint
 */
export async function collectAllCursor<T>(
  fetchPage: (params: PaginationParams) => Promise<CursorPaginated<T>>
): Promise<T[]> {
  const items: T[] = [];

  for await (const item of iterateCursor(fetchPage)) {
    items.push(item);
  }

  return items;
}
