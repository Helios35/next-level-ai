import { useMemo, useState } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Column, SortState, SortDirection } from './data-table.types'

// ── Helpers ──────────────────────────────────────────────────────────────

function hideBelowClass(hideBelow?: 'sm' | 'md' | 'lg'): string {
  if (!hideBelow) return ''
  if (hideBelow === 'sm') return 'hidden sm:table-cell'
  if (hideBelow === 'md') return 'hidden md:table-cell'
  return 'hidden lg:table-cell'
}

function alignClass(align?: 'left' | 'right' | 'center'): string {
  if (align === 'right') return 'text-right'
  if (align === 'center') return 'text-center'
  return 'text-left'
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0
  if (a == null) return -1
  if (b == null) return 1
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime()
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), undefined, { numeric: true })
}

// ── Props ────────────────────────────────────────────────────────────────

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  /** Returns a stable unique id for each row (for React keys) */
  rowKey: (row: T) => string
  /** Fires when a row is clicked (in any non-action cell) */
  onRowClick?: (row: T) => void
  /** Message shown when data is empty after filtering/paging */
  emptyMessage?: string
  /** Sort applied on first render */
  defaultSort?: SortState
  /** Optional class applied to specific rows (e.g. dim dormant deals) */
  rowClassName?: (row: T) => string | undefined
  /** Extra classname for the outer container */
  className?: string
}

// ── Component ────────────────────────────────────────────────────────────

export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  emptyMessage = 'No results.',
  defaultSort,
  rowClassName,
  className,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState | null>(defaultSort ?? null)

  // Sort data when a sort state is present
  const sortedData = useMemo(() => {
    if (!sort) return data
    const col = columns.find((c) => c.key === sort.key)
    if (!col || !col.sortable) return data
    const accessor =
      col.sortAccessor ??
      ((row: T) => {
        const value = (row as Record<string, unknown>)[col.key]
        return value as string | number | Date
      })
    const sorted = [...data].sort((a, b) => {
      const cmp = compareValues(accessor(a), accessor(b))
      return sort.direction === 'asc' ? cmp : -cmp
    })
    return sorted
  }, [data, sort, columns])

  const handleHeaderClick = (col: Column<T>) => {
    if (!col.sortable) return
    setSort((prev) => {
      if (!prev || prev.key !== col.key) {
        return { key: col.key, direction: 'asc' }
      }
      const nextDirection: SortDirection | null =
        prev.direction === 'asc' ? 'desc' : null
      if (nextDirection === null) return null
      return { key: col.key, direction: nextDirection }
    })
  }

  const rowClickable = !!onRowClick

  return (
    <div
      className={cn(
        'rounded-xl border border-border overflow-hidden',
        className,
      )}
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {columns.map((col) => {
              const isSorted = sort?.key === col.key
              const SortIcon = !col.sortable
                ? null
                : !isSorted
                  ? ChevronsUpDown
                  : sort.direction === 'asc'
                    ? ChevronUp
                    : ChevronDown
              return (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(
                    'px-4 py-3 font-medium text-muted-foreground',
                    alignClass(col.align),
                    hideBelowClass(col.hideBelow),
                    col.className,
                    col.sortable &&
                      'cursor-pointer select-none hover:text-foreground transition-colors',
                  )}
                  onClick={() => handleHeaderClick(col)}
                >
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5',
                      col.align === 'right' && 'flex-row-reverse',
                    )}
                  >
                    {col.label}
                    {SortIcon && (
                      <SortIcon
                        size={12}
                        className={cn(
                          'shrink-0',
                          isSorted ? 'text-foreground' : 'text-muted-foreground/50',
                        )}
                      />
                    )}
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {sortedData.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-sm text-muted-foreground"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            sortedData.map((row) => {
              const extraRowClass = rowClassName?.(row)
              return (
                <tr
                  key={rowKey(row)}
                  className={cn(
                    'border-b border-border last:border-0 transition-colors',
                    rowClickable && 'cursor-pointer hover:bg-muted/30',
                    extraRowClass,
                  )}
                  onClick={() => rowClickable && onRowClick?.(row)}
                >
                  {columns.map((col) => {
                    const rendered =
                      col.render?.(row) ??
                      String(
                        (row as Record<string, unknown>)[col.key] ?? '—',
                      )
                    return (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-muted-foreground',
                          alignClass(col.align),
                          hideBelowClass(col.hideBelow),
                          col.className,
                        )}
                      >
                        {rendered}
                      </td>
                    )
                  })}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
