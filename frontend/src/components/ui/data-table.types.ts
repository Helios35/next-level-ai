import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

// ── Column definition ────────────────────────────────────────────────────

export interface Column<T> {
  /** Unique column id — used as a sort key and React key */
  key: string
  /** Header label shown in the table header */
  label: string
  /** Custom cell renderer. Defaults to String(row[key]) when omitted. */
  render?: (row: T) => ReactNode
  /** When true the header becomes clickable and shows sort chevrons */
  sortable?: boolean
  /**
   * Value used for comparison when sorting. Required if the column is
   * sortable and the default String(row[key]) isn't correct.
   */
  sortAccessor?: (row: T) => string | number | Date
  /** Cell alignment. Default: left */
  align?: 'left' | 'right' | 'center'
  /** Hide the column below this Tailwind breakpoint (e.g. 'md' hides on sm) */
  hideBelow?: 'sm' | 'md' | 'lg'
  /** Optional explicit column width (CSS length, e.g. '140px') */
  width?: string
  /** Extra classname applied to both <th> and <td> for this column */
  className?: string
}

// ── Sort state ───────────────────────────────────────────────────────────

export type SortDirection = 'asc' | 'desc'

export interface SortState {
  key: string
  direction: SortDirection
}

// ── Tab filter option ────────────────────────────────────────────────────

export interface TabOption {
  value: string
  label: string
  icon?: LucideIcon
}
