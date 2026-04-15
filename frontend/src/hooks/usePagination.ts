import { useMemo, useState, useEffect } from 'react'

interface UsePaginationOptions {
  /** Rows per page. Default: 25 */
  pageSize?: number
  /** Reset to page 1 whenever this value changes (e.g. a filter string) */
  resetKey?: unknown
}

export interface PaginationResult<T> {
  /** Slice of `data` for the current page */
  pagedData: T[]
  /** Full post-filter count (what the footer shows as total) */
  totalCount: number
  /** Effective rows-per-page (same as input pageSize) */
  pageSize: number
  /** 1-indexed current page, safe against out-of-range values */
  currentPage: number
  /** Call this to change the current page */
  setPage: (page: number) => void
}

/**
 * Client-side pagination helper. Slices the input `data` into a single page
 * and exposes setPage for Prev/Next wiring.
 *
 * Resets to page 1 whenever `resetKey` changes — pass the active search
 * string or filter value so filtering sends the user back to the first page.
 */
export function usePagination<T>(
  data: T[],
  { pageSize = 25, resetKey }: UsePaginationOptions = {},
): PaginationResult<T> {
  const [page, setPage] = useState(1)

  // Reset page when filter/search state changes
  useEffect(() => {
    setPage(1)
  }, [resetKey])

  // Also clamp page whenever data length shrinks below the current page
  const totalCount = data.length
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)

  const pagedData = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, safePage, pageSize])

  return {
    pagedData,
    totalCount,
    pageSize,
    currentPage: safePage,
    setPage,
  }
}
