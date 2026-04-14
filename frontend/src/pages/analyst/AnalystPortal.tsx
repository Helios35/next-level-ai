import { useMemo } from 'react'
import { MOCK_ANALYST_MEMOS, type AnalystMemo, type AiFlagColor } from '@/data/mock/analystMemos'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

const FLAG_CONFIG: Record<AiFlagColor, { label: string; className: string }> = {
  green: {
    label: 'Green',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  yellow: {
    label: 'Yellow',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  red: {
    label: 'Red',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function MemoCard({
  memo,
  onReview,
}: {
  memo: AnalystMemo
  onReview: (id: string) => void
}) {
  const flag = FLAG_CONFIG[memo.flagColor]

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">{memo.dealName}</span>
          <Badge variant="outline" className={flag.className}>
            {flag.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{memo.assetType} &middot; {memo.assetSubType}</span>
          <span>&middot;</span>
          <span>{memo.sellerName}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          AI memo generated {formatDate(memo.memoDate)}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onReview(memo.id)}
        className="shrink-0"
      >
        Review
        <ArrowRight size={14} className="ml-1.5" />
      </Button>
    </div>
  )
}

interface AnalystPortalProps {
  onNavigateToReview: (memoId: string) => void
}

export default function AnalystPortal({ onNavigateToReview }: AnalystPortalProps) {
  // Sort oldest memo first
  const sortedMemos = useMemo(
    () =>
      [...MOCK_ANALYST_MEMOS].sort(
        (a, b) => new Date(a.memoDate).getTime() - new Date(b.memoDate).getTime()
      ),
    []
  )

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Review Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI financial memos awaiting your review.
        </p>
      </div>

      {sortedMemos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-slate-500">No pending reviews. Queue is clear.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedMemos.map((memo) => (
            <MemoCard key={memo.id} memo={memo} onReview={onNavigateToReview} />
          ))}
        </div>
      )}
    </div>
  )
}
