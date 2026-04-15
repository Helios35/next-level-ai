import { useState, useMemo } from 'react'
import { Mail, Phone, User, Shield, Target, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { MOCK_BUYER_POOL_DR001, MOCK_BUYER_POOL_DR002, MOCK_BUYER_POOL_DR005 } from '@/data/mock/buyerPool'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { MOCK_BUYER_STRATEGIES } from '@/data/mock/buyerStrategies'
import { DS_BUYER_NAMES, DS_BUYER_FIRM_TYPES } from '@/data/mock/dsConversations'
import type { BuyerPoolEntry } from '@shared/types/buyerPool'

const ALL_BUYER_POOL: BuyerPoolEntry[] = [
  ...MOCK_BUYER_POOL_DR001,
  ...MOCK_BUYER_POOL_DR002,
  ...MOCK_BUYER_POOL_DR005,
]

// Mock buyer contact info — in production this would come from user data
const BUYER_CONTACTS: Record<string, { email: string; phone: string }> = {
  user_buyer_01: { email: 'deals@apexcapital.com', phone: '(704) 555-0301' },
  user_buyer_02: { email: 'acquisitions@trianglecg.com', phone: '(919) 555-0412' },
  user_buyer_03: { email: 'invest@greenfield-acq.com', phone: '(843) 555-0287' },
  user_buyer_04: { email: 'info@harborpoint.com', phone: '(561) 555-0394' },
  user_buyer_05: { email: 'team@summitrealty.com', phone: '(480) 555-0218' },
  user_buyer_10: { email: 'ops@lakeshoreventures.com', phone: '(615) 555-0173' },
  user_buyer_11: { email: 'acq@pinnaclere.com', phone: '(214) 555-0345' },
  user_buyer_12: { email: 'deals@redstonecap.com', phone: '(303) 555-0429' },
  user_buyer_13: { email: 'invest@bridgewaterh.com', phone: '(404) 555-0516' },
  user_buyer_20: { email: 'ops@meridianfund.com', phone: '(512) 555-0271' },
  user_buyer_21: { email: 'info@cornerstoneprops.com', phone: '(813) 555-0382' },
  user_buyer_22: { email: 'deals@irongatecap.com', phone: '(704) 555-0493' },
}

const SEAT_BADGE: Record<string, string> = {
  seated: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  invited: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  accepted: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  passed: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
}

const SEAT_LABELS: Record<string, string> = {
  seated: 'Seated', pending: 'Pending', invited: 'Invited',
  accepted: 'Accepted', passed: 'Passed',
}

const SUBTYPE_LABELS: Record<string, string> = {
  sfr_portfolio: 'SFR Portfolio', build_for_rent: 'Build-for-Rent',
  multifamily: 'Multifamily', land: 'Land',
  bfr: 'Build-for-Rent',
}

function formatPrice(n: number): string {
  return '$' + (n / 1_000_000).toFixed(1) + 'M'
}

interface DSBuyerProfileProps {
  buyerId: string
  onBack: () => void
  onNavigateToDeal: (dealId: string) => void
}

export default function DSBuyerProfile({ buyerId, onBack, onNavigateToDeal }: DSBuyerProfileProps) {
  const [notes, setNotes] = useState('')

  const buyerName = DS_BUYER_NAMES[buyerId] ?? buyerId
  const firmType = DS_BUYER_FIRM_TYPES[buyerId] ?? '—'
  const contact = BUYER_CONTACTS[buyerId]

  // All pool entries for this buyer across deals
  const poolEntries = useMemo(() =>
    ALL_BUYER_POOL.filter((e) => e.buyerId === buyerId),
    [buyerId],
  )

  // Qualification status from most recent entry
  const qualStatus = poolEntries[0]?.qualificationStatus ?? 'not_qualified'
  const equityCheck = poolEntries[0]?.equityCheckSize ?? '—'

  // Strategy data — try to match by buyer ID patterns
  const strategies = useMemo(() =>
    MOCK_BUYER_STRATEGIES.filter((s) => s.userId === buyerId || s.userId === buyerId.replace('user_buyer_0', 'user_buyer_00')),
    [buyerId],
  )

  // Deal history with seat status
  const dealHistory = useMemo(() =>
    poolEntries.map((entry) => {
      const deal = MOCK_SELLER_DEAL_ROOMS.find((d) => d.id === entry.dealRoomId)
      return { entry, deal }
    }).filter((d) => d.deal !== undefined),
    [poolEntries],
  )

  // Intent signals
  const matchCount = strategies.reduce((sum, s) => sum + s.matchCount, 0)
  const accessRequests = poolEntries.filter((e) => e.accessRequestedAt).length
  const interestIndications = poolEntries.filter((e) => e.outreachStatus === 'responded' || e.outreachStatus === 'opened').length

  if (!contact && poolEntries.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 py-20">
        <p className="text-lg font-medium text-slate-500">Buyer not found.</p>
        <Button variant="outline" onClick={onBack}>
          Back to Buyers
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
          { label: buyerName },
        ]}
      />

      <div className="mb-6 flex items-center gap-3">
        <h1 className="text-xl font-bold text-foreground">{buyerName}</h1>
        <Badge variant="outline">{firmType}</Badge>
      </div>

      {/* Section 1: Contact info */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Contact Information</h2>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User size={14} /> <span>{buyerName}</span>
          </div>
          {contact && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail size={14} /> <span>{contact.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone size={14} /> <span>{contact.phone}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Section 2: Qualification status (read-only) */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Shield size={14} /> Qualification
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Status</p>
            <Badge className={qualStatus === 'qualified'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-400'
            }>
              {qualStatus === 'qualified' ? 'Qualified' : 'Not Qualified'}
            </Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Equity Check Size</p>
            <p className="text-sm font-medium text-foreground">{equityCheck}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Firm Type</p>
            <p className="text-sm font-medium text-foreground">{firmType}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground italic">Qualification data is read-only. DS cannot edit these fields.</p>
      </div>

      {/* Section 3: Strategy summary */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Target size={14} /> Strategy Summary
        </h2>
        {strategies.length > 0 ? (
          <div className="space-y-3">
            {strategies.map((strat) => (
              <div key={strat.id} className="rounded-lg border border-border p-3">
                <p className="text-sm font-medium text-foreground">{strat.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {SUBTYPE_LABELS[strat.assetSubType] ?? strat.assetSubType} · {strat.sharedCriteria.geography}
                </p>
                <p className="text-xs text-muted-foreground">
                  Deal Size: {formatPrice(strat.sharedCriteria.dealSizeMin)} – {formatPrice(strat.sharedCriteria.dealSizeMax)}
                </p>
                <Badge variant="outline" className="mt-2 text-xs">{strat.status}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No strategies on file for this buyer.</p>
        )}
      </div>

      {/* Section 4: Deal history */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Deal History</h2>
        {dealHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground">No deal activity found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2 pr-4 font-medium">Deal Name</th>
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Seat Status</th>
                  <th className="pb-2 font-medium">Match Score</th>
                </tr>
              </thead>
              <tbody>
                {dealHistory.map(({ entry, deal }) => (
                  <tr key={entry.id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-4">
                      <button
                        onClick={() => onNavigateToDeal(deal!.id)}
                        className="font-medium text-foreground hover:underline"
                      >
                        {deal!.name}
                      </button>
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground">
                      {SUBTYPE_LABELS[deal!.assetSubType] ?? deal!.assetSubType}
                    </td>
                    <td className="py-2.5 pr-4">
                      <Badge className={SEAT_BADGE[entry.seatStatus] ?? ''}>
                        {SEAT_LABELS[entry.seatStatus] ?? entry.seatStatus}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{entry.matchScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 5: Intent signals */}
      <div className="mb-6 rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <BarChart3 size={14} /> Intent Signals
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Match Count</p>
            <p className="text-lg font-bold text-foreground">{matchCount || poolEntries.length}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Interest Indications</p>
            <p className="text-lg font-bold text-foreground">{interestIndications}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Access Requests</p>
            <p className="text-lg font-bold text-foreground">{accessRequests}</p>
          </div>
        </div>
      </div>

      {/* DS Notes */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Notes</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          placeholder="Add notes about this buyer..."
          className="w-full rounded-lg border border-border bg-main p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>
    </div>
  )
}
