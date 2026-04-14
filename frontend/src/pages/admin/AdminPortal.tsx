import { useMemo } from 'react'
import { MOCK_ADMIN_EXCEPTIONS } from '@/data/mock/adminExceptions'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, AlertTriangle } from 'lucide-react'
import type { DealRoomStatus } from '@shared/types/enums'

const STAGE_LABELS: Record<number, string> = {
  1: 'Intake',
  2: 'Submission',
  3: 'QA Review',
  4: 'Financial Analysis',
  5: 'Decision Point',
  6: 'Coming Soon',
  7: 'Active Disposition',
  8: 'Offer Negotiation',
  9: 'Accepted Offer',
}

const STATUS_LABELS: Record<DealRoomStatus, string> = {
  active: 'Active',
  market_tested: 'Market Tested',
  dormant: 'Dormant',
  closed: 'Closed',
  withdrawn: 'Withdrawn',
  draft: 'Draft',
}

interface AdminPortalProps {
  onNavigateToExceptions: () => void
  onNavigateToDeal: (dealId: string) => void
}

export default function AdminPortal({ onNavigateToExceptions, onNavigateToDeal }: AdminPortalProps) {
  // Exception queue summary
  const topExceptions = useMemo(
    () =>
      [...MOCK_ADMIN_EXCEPTIONS]
        .sort((a, b) => b.daysPending - a.daysPending)
        .slice(0, 3),
    []
  )

  // Pipeline snapshot — deal counts by stage and status
  const stageCounts = useMemo(() => {
    const counts: Record<number, number> = {}
    for (let s = 1; s <= 9; s++) counts[s] = 0
    MOCK_SELLER_DEAL_ROOMS.forEach((d) => {
      counts[d.currentStage] = (counts[d.currentStage] || 0) + 1
    })
    return counts
  }, [])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      active: 0,
      market_tested: 0,
      dormant: 0,
      closed: 0,
      withdrawn: 0,
    }
    MOCK_SELLER_DEAL_ROOMS.forEach((d) => {
      if (d.status !== 'draft') {
        counts[d.status] = (counts[d.status] || 0) + 1
      }
    })
    return counts
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-foreground">Admin Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Exception queue and pipeline status at a glance.
        </p>
      </div>

      {/* Exception Queue Summary */}
      <div className="mb-8 rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            <h2 className="text-base font-semibold text-foreground">Exception Queue</h2>
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400">
              {MOCK_ADMIN_EXCEPTIONS.length} pending
            </Badge>
          </div>
          <Button variant="outline" size="sm" onClick={onNavigateToExceptions}>
            View All
            <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </div>

        {topExceptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No exceptions pending.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {topExceptions.map((exc) => (
              <button
                key={exc.id}
                onClick={() => onNavigateToDeal(exc.dealId)}
                className="flex items-center justify-between rounded-lg border border-border px-4 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <div>
                  <span className="text-sm font-medium text-foreground">{exc.dealName}</span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {exc.flagReasons[0]}
                  </p>
                </div>
                <Badge variant="outline" className="border-slate-500/30 bg-slate-500/10 text-slate-400 shrink-0">
                  {exc.daysPending}d pending
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pipeline Snapshot */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 text-base font-semibold text-foreground">Pipeline Snapshot</h2>

        <div className="mb-6">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">By Stage</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {Array.from({ length: 9 }, (_, i) => i + 1).map((stage) => (
              <div
                key={stage}
                className="flex flex-col items-center rounded-lg border border-border px-3 py-2.5"
              >
                <span className="text-lg font-bold text-foreground">{stageCounts[stage]}</span>
                <span className="text-[10px] text-muted-foreground text-center leading-tight">
                  {STAGE_LABELS[stage]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">By Status</h3>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {(['active', 'market_tested', 'dormant', 'closed', 'withdrawn'] as const).map(
              (status) => (
                <div
                  key={status}
                  className="flex flex-col items-center rounded-lg border border-border px-3 py-2.5"
                >
                  <span className="text-lg font-bold text-foreground">{statusCounts[status]}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {STATUS_LABELS[status]}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
