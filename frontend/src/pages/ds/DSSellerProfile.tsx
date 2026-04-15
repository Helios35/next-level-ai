import { useState, useMemo } from 'react'
import { Mail, Phone, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { STAGE_LABELS } from '@/components/StageProgressBar'
import { SELLER_CONTACTS } from './DSSellerClients'
import type { DealRoomStage, DealRoomStatus } from '@shared/types/enums'

const STATUS_BADGE: Record<DealRoomStatus, string> = {
  active: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  market_tested: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  dormant: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
  closed: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  withdrawn: 'border-red-500/30 bg-red-500/10 text-red-400',
  draft: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
}

const STATUS_LABELS: Record<DealRoomStatus, string> = {
  active: 'Active', market_tested: 'Market Tested', dormant: 'Dormant',
  closed: 'Closed', withdrawn: 'Withdrawn', draft: 'Draft',
}

const SUBTYPE_LABELS: Record<string, string> = {
  sfr_portfolio: 'SFR Portfolio', build_for_rent: 'Build-for-Rent',
  multifamily: 'Multifamily', land: 'Land',
}

interface DSSellerProfileProps {
  sellerId: string
  onBack: () => void
  onNavigateToDeal: (dealId: string) => void
}

export default function DSSellerProfile({ sellerId, onBack, onNavigateToDeal }: DSSellerProfileProps) {
  const [notes, setNotes] = useState('')
  const contact = SELLER_CONTACTS[sellerId]

  const deals = useMemo(() =>
    MOCK_SELLER_DEAL_ROOMS.filter((d) => d.sellerId === sellerId),
    [sellerId],
  )

  if (!contact) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 py-20">
        <p className="text-lg font-medium text-slate-500">Seller not found.</p>
        <Button variant="outline" onClick={onBack}>
          Back to Sellers
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: 'Clients', onClick: onBack },
          { label: contact.name },
        ]}
      />

      <h1 className="mb-6 text-xl font-bold text-foreground">{contact.name}</h1>

      {/* Contact info */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Contact Information</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User size={14} /> <span>{contact.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail size={14} /> <span>{contact.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone size={14} /> <span>{contact.phone}</span>
          </div>
        </div>
      </div>

      {/* Deal history */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Deal History</h2>
        {deals.length === 0 ? (
          <p className="text-sm text-muted-foreground">No deals found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Deal Name</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Stage</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4">
                      <button
                        onClick={() => onNavigateToDeal(deal.id)}
                        className="font-medium text-foreground hover:underline"
                      >
                        {deal.name}
                      </button>
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {SUBTYPE_LABELS[deal.assetSubType] ?? deal.assetSubType}
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      Stage {deal.currentStage} — {STAGE_LABELS[deal.currentStage as DealRoomStage]}
                    </td>
                    <td className="py-2.5">
                      <Badge className={STATUS_BADGE[deal.status]}>{STATUS_LABELS[deal.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DS Notes */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add notes about this seller..."
          className="w-full rounded-lg border border-border bg-main p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>
    </div>
  )
}
