import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/button'

// ── Props ────────────────────────────────────────────────────────────────

export interface DataTableFooterProps {
  /** Total number of rows across all pages (post-filter, pre-paginate) */
  totalCount: number
  /** Rows per page */
  pageSize: number
  /** 1-indexed current page */
  currentPage: number
  /** Called when Prev / Next is clicked */
  onPageChange: (page: number) => void
  className?: string
}

// ── Component ────────────────────────────────────────────────────────────

export function DataTableFooter({
  totalCount,
  pageSize,
  currentPage,
  onPageChange,
  className,
}: DataTableFooterProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const safePage = Math.min(Math.max(1, currentPage), totalPages)
  const start = totalCount === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = Math.min(safePage * pageSize, totalCount)

  const canPrev = safePage > 1
  const canNext = safePage < totalPages

  return (
    <div
      className={cn(
        'mt-3 flex flex-col items-center justify-between gap-2 sm:flex-row',
        className,
      )}
    >
      <p className="text-xs text-muted-foreground tabular-nums">
        {totalCount === 0
          ? 'No results'
          : `${start}–${end} of ${totalCount} ${totalCount === 1 ? 'result' : 'results'}`}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => canPrev && onPageChange(safePage - 1)}
          disabled={!canPrev}
          className="gap-1"
        >
          <ChevronLeft size={14} />
          Prev
        </Button>
        <span className="text-xs tabular-nums text-muted-foreground">
          Page {safePage} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => canNext && onPageChange(safePage + 1)}
          disabled={!canNext}
          className="gap-1"
        >
          Next
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  )
}
