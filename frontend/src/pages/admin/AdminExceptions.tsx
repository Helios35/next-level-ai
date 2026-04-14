import { useMemo } from 'react'
import { MOCK_ADMIN_EXCEPTIONS, type AdminException } from '@/data/mock/adminExceptions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function ExceptionCard({
  exception,
  onReview,
}: {
  exception: AdminException
  onReview: (dealId: string) => void
}) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-border bg-card px-5 py-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">{exception.dealName}</span>
          <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400">
            {exception.daysPending}d pending
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {exception.sellerName} &middot; Submitted {formatDate(exception.dateSubmittedToStage3)}
        </span>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {exception.flagReasons.map((reason, i) => (
            <Badge
              key={i}
              variant="outline"
              className="border-red-500/30 bg-red-500/10 text-red-400"
            >
              {reason}
            </Badge>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onReview(exception.dealId)}
        className="shrink-0 mt-1"
      >
        Review
        <ArrowRight size={14} className="ml-1.5" />
      </Button>
    </div>
  )
}

interface AdminExceptionsProps {
  onNavigateToDeal: (dealId: string) => void
}

export default function AdminExceptions({ onNavigateToDeal }: AdminExceptionsProps) {
  // Sort oldest flag first
  const sorted = useMemo(
    () =>
      [...MOCK_ADMIN_EXCEPTIONS].sort(
        (a, b) =>
          new Date(a.dateSubmittedToStage3).getTime() -
          new Date(b.dateSubmittedToStage3).getTime()
      ),
    []
  )

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Exception Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI-flagged Stage 3 deals requiring Admin review.
        </p>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-slate-500">
            No exceptions pending. All Stage 3 packages are clear.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((exc) => (
            <ExceptionCard key={exc.id} exception={exc} onReview={onNavigateToDeal} />
          ))}
        </div>
      )}
    </div>
  )
}
