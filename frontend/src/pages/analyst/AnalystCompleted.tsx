import { useState } from 'react'
import { Badge } from '@/components/ui/badge'

type AnalystDecision = 'approve' | 'return' | 'reject'

interface CompletedReview {
  id: string
  dealName: string
  decision: AnalystDecision
  date: string
  notes?: string
}

const DECISION_CONFIG: Record<AnalystDecision, { label: string; className: string }> = {
  approve: {
    label: 'Approve',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  return: {
    label: 'Return',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  reject: {
    label: 'Reject',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
}

// Mock completed reviews — in production these would come from the API
const MOCK_COMPLETED: CompletedReview[] = [
  {
    id: 'cr_001',
    dealName: 'Riverside Estates — Atlanta',
    decision: 'approve',
    date: '2026-03-15T14:00:00Z',
  },
  {
    id: 'cr_002',
    dealName: 'Oakwood Portfolio — Dallas',
    decision: 'return',
    date: '2026-03-12T10:30:00Z',
    notes: 'Cap rate analysis inconsistent with trailing NOI. Returned for pricing review with seller.',
  },
  {
    id: 'cr_003',
    dealName: 'Summit Land — Denver',
    decision: 'reject',
    date: '2026-03-08T09:00:00Z',
    notes: 'No buyer demand at asking price. Unentitled parcel priced at entitled comps.',
  },
  {
    id: 'cr_004',
    dealName: 'Pinecrest Multifamily — Phoenix',
    decision: 'approve',
    date: '2026-03-05T16:45:00Z',
  },
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function AnalystCompleted() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Completed Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Archive of all past analyst decisions.
        </p>
      </div>

      {MOCK_COMPLETED.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-slate-500">No completed reviews yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Deal Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Decision</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_COMPLETED.map((review) => {
                const decision = DECISION_CONFIG[review.decision]
                return (
                  <tr key={review.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{review.dealName}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={decision.className}>
                        {decision.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(review.date)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {review.notes ?? <span className="text-muted-foreground/50">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
