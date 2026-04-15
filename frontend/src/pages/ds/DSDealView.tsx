import { useState, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { SectionCard } from '@/components/ui/section-card'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { DocumentListGroup, DocumentListItem } from '@/components/ui/document-list-item'
import StageProgressBar, { STAGE_LABELS } from '@/components/StageProgressBar'
import MilestoneTimeline from '@/components/MilestoneTimeline'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { MOCK_BUYER_POOL_DR001, MOCK_BUYER_POOL_DR005 } from '@/data/mock/buyerPool'
import { MOCK_DOCUMENTS_DR001, MOCK_DOCUMENTS_DR005 } from '@/data/mock/documents'
import { MOCK_MILESTONES, POST_ACCEPTANCE_LABELS } from '@/data/mock/milestones'
import { MOCK_MARKET_INTEL } from '@/data/mock/marketIntel'
import { MOCK_OFFERS_DR001, MOCK_AI_FEEDBACK_DRAFTS, MOCK_OFFER_ROUNDS_DR001 } from '@/data/mock/dsOffers'
import { MOCK_DS_CONVERSATIONS_DR001, DS_BUYER_NAMES, DS_BUYER_FIRM_TYPES } from '@/data/mock/dsConversations'
import type { DsConversationThread, DsMessage } from '@/data/mock/dsConversations'
import type { AiFeedbackDraft, OfferRound } from '@/data/mock/dsOffers'
import type { DealRoom } from '@shared/types/dealRoom'
import type { BuyerPoolEntry } from '@shared/types/buyerPool'
import type { DealDocument } from '@shared/types/document'
import type { Offer } from '@shared/types/offer'
import type { DealRoomStage, DealRoomStatus } from '@shared/types/enums'
import type { MarketIntelData } from '@/data/mock/marketIntel'
import type { MilestoneItem } from '@/data/mock/milestones'
import {
  Users, FileText, BarChart3, MessageSquare, Flag,
  CheckCircle2, Circle, Clock, AlertCircle, Send, Plus, Search, Shield,
  Calendar, ChevronDown, ChevronRight, Eye, Edit3, Award,
  TrendingUp, MapPin, DollarSign, Building2, User, Sparkles, X,
} from 'lucide-react'

// ══════════════════════════════════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════════════════════════════════

const SUBTYPE_LABELS: Record<string, string> = {
  sfr_portfolio: 'SFR Portfolio',
  build_for_rent: 'Build-for-Rent',
  multifamily: 'Multifamily',
  land: 'Land',
}

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

const SEAT_STATUS_LABELS: Record<string, string> = {
  seated: 'Seated', pending: 'Pending', invited: 'Invited',
  accepted: 'Accepted', passed: 'Passed',
}

const SEAT_STATUS_CLASS: Record<string, string> = {
  seated: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  invited: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  accepted: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  passed: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
}

const DOC_STATUS_LABELS: Record<string, string> = {
  approved: 'Verified', uploaded: 'Pending', under_review: 'Under Review', flagged: 'Flagged',
}

function formatPrice(n: number): string {
  return '$' + (n / 1_000_000).toFixed(1) + 'M'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

function relativeTime(iso: string): string {
  const now = new Date('2026-04-14T12:00:00Z')
  const then = new Date(iso)
  const mins = Math.floor((now.getTime() - then.getTime()) / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getDealData(dealId: string) {
  const deal = MOCK_SELLER_DEAL_ROOMS.find((d) => d.id === dealId)
  const buyerPool = dealId === 'dr_001' ? MOCK_BUYER_POOL_DR001
    : dealId === 'dr_005' ? MOCK_BUYER_POOL_DR005 : []
  const documents = dealId === 'dr_001' ? MOCK_DOCUMENTS_DR001
    : dealId === 'dr_005' ? MOCK_DOCUMENTS_DR005 : []
  const milestones = MOCK_MILESTONES[dealId] ?? []
  const marketIntel = MOCK_MARKET_INTEL[dealId]
  const offers = dealId === 'dr_001' ? MOCK_OFFERS_DR001 : []
  const feedbackDrafts = dealId === 'dr_001' ? MOCK_AI_FEEDBACK_DRAFTS : []
  const offerRounds = dealId === 'dr_001' ? MOCK_OFFER_ROUNDS_DR001 : []
  const conversations = dealId === 'dr_001' ? MOCK_DS_CONVERSATIONS_DR001 : []
  return { deal, buyerPool, documents, milestones, marketIntel, offers, feedbackDrafts, offerRounds, conversations }
}

// ══════════════════════════════════════════════════════════════════════════
// SELLER NAME MAP
// ══════════════════════════════════════════════════════════════════════════

const SELLER_NAMES: Record<string, { name: string; email: string; phone: string }> = {
  user_001: { name: 'Marcus Webb', email: 'marcus.webb@trianglecap.com', phone: '(704) 555-0192' },
  user_009: { name: 'Jordan Fields', email: 'jordan@sunbeltdev.com', phone: '(615) 555-0314' },
  user_010: { name: 'Carol Tran', email: 'carol.tran@landmarkdev.com', phone: '(512) 555-0291' },
  user_011: { name: 'Brian Okafor', email: 'b.okafor@pinecresthomes.com', phone: '(480) 555-0178' },
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 1 — OVERVIEW
// ══════════════════════════════════════════════════════════════════════════

function OverviewTab({ deal, buyerPool, milestones, onNavigateTab }: {
  deal: DealRoom; buyerPool: BuyerPoolEntry[]; milestones: MilestoneItem[]; onNavigateTab: (tab: string) => void
}) {
  const [pricingAuthorized, setPricingAuthorized] = useState(false)
  const [escalationResolved, setEscalationResolved] = useState(false)

  const seatedCount = buyerPool.filter((b) => b.seatStatus === 'seated').length
  const pendingCount = buyerPool.filter((b) => b.seatStatus === 'pending').length
  const seller = SELLER_NAMES[deal.sellerId]
  const priceDisplay = deal.shared.exactPrice
    ? formatPrice(deal.shared.exactPrice)
    : deal.shared.priceRange
      ? `${formatPrice(deal.shared.priceRange.min)} – ${formatPrice(deal.shared.priceRange.max)}`
      : 'Needs Guidance'

  // Mock: show pricing guidance panel for dr_001 (has a pricing_guidance_authorization task)
  const showPricingGuidance = deal.id === 'dr_001' && !pricingAuthorized
  // Mock: show escalation surface for deals with seller_escalation tasks
  const showEscalation = deal.id === 'dr_004' && !escalationResolved

  return (
    <div className="space-y-6">
      {/* Deal summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 size={14} />
            <span>{SUBTYPE_LABELS[deal.assetSubType] ?? deal.assetSubType} · {deal.shared.geography.msa}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign size={14} />
            <span>Deal Size: {priceDisplay}</span>
          </div>
          {seller && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User size={14} />
                <span>{seller.name}</span>
              </div>
              <p className="pl-[22px] text-xs text-muted-foreground">{seller.email} · {seller.phone}</p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Users size={14} className="text-muted-foreground" />
            <span className="font-medium text-foreground">{seatedCount} / 3 seats filled</span>
            {pendingCount > 0 && (
              <span className="text-xs text-amber-400">({pendingCount} pending)</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick links to pending actions */}
      {(() => {
        const links: { label: string; tab: string }[] = []
        if (pendingCount > 0) links.push({ label: `${pendingCount} seat${pendingCount !== 1 ? 's' : ''} pending approval`, tab: 'seat_allocation' })
        if (deal.currentStage >= 8) links.push({ label: 'Review offer rounds', tab: 'offer_rounds' })
        if (deal.status === 'closed' || deal.currentStage === 9) links.push({ label: 'Log milestones', tab: 'milestones' })
        return links.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {links.map((link) => (
              <button
                key={link.tab}
                onClick={() => onNavigateTab(link.tab)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                {link.label} →
              </button>
            ))}
          </div>
        ) : null
      })()}

      {/* Stage timeline */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-foreground">Deal Lifecycle</h3>
        <MilestoneTimeline items={milestones} />
      </div>

      {/* Pricing Guidance Panel — conditional */}
      {showPricingGuidance && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-400">Pricing Guidance — Pending Authorization</h3>
          </div>
          <p className="mb-3 text-sm text-muted-foreground">
            AI-generated pricing guidance for this deal. Review, edit if needed, and authorize to deliver to the seller.
          </p>
          <div className="mb-3 rounded-lg border border-border bg-background p-3 text-sm text-foreground">
            Based on comparable BFR transactions in the Charlotte-Concord MSA over the past 12 months, the suggested pricing range of $14M–$18M aligns with market expectations for a 72-unit lease-up community. Current buyer demand indicators suggest the mid-range ($15.5M–$16.5M) would optimize both competitive interest and seller value.
          </div>
          <Button size="sm" onClick={() => setPricingAuthorized(true)}>
            <CheckCircle2 size={14} className="mr-1.5" />
            Authorize & Deliver
          </Button>
        </div>
      )}

      {/* Stage 5 Escalation Surface — conditional */}
      {showEscalation && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-400" />
            <Badge className="border-red-500/30 bg-red-500/10 text-red-400">
              You've been escalated into this conversation
            </Badge>
          </div>
          <div className="mb-3 space-y-2 rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-medium text-muted-foreground">AI Conversation History</p>
            <div className="text-sm text-muted-foreground">
              <p className="mb-1"><span className="font-medium">AI:</span> Based on the analyst review, the recommended pricing range is $6.5M–$8M.</p>
              <p className="mb-1"><span className="font-medium">Seller:</span> That's significantly below what we expected. We won't list below $9M.</p>
              <p><span className="font-medium">AI:</span> I understand your concern. Let me connect you with a specialist who can discuss pricing strategy in detail.</p>
            </div>
          </div>
          <textarea
            className="mb-3 w-full rounded-lg border border-border bg-main p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-slate-500"
            rows={3}
            placeholder="Compose your response to the seller..."
          />
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setEscalationResolved(true)}>
              <Send size={14} className="mr-1.5" />
              Send Response
            </Button>
            <Button size="sm" variant="outline">Hand Back to AI</Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 2 — SEAT ALLOCATION
// ══════════════════════════════════════════════════════════════════════════

function SeatAllocationTab({ buyerPool }: { buyerPool: BuyerPoolEntry[] }) {
  const [showInvite, setShowInvite] = useState(false)
  const seatedCount = buyerPool.filter((b) => b.seatStatus === 'seated').length
  const seatsFull = seatedCount >= 3

  return (
    <div className="space-y-4">
      {/* Seat counter + invite */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-foreground">{seatedCount} / 3 seats filled</span>
          {seatsFull && (
            <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">All Seats Full</Badge>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={() => setShowInvite(!showInvite)}>
          <Plus size={14} className="mr-1.5" />
          Invite Buyer
        </Button>
      </div>

      {/* Invite panel */}
      {showInvite && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-muted-foreground" />
            <input
              type="text"
              placeholder="Search buyer by name or email..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Select a buyer from the platform database to send an invite.</p>
        </div>
      )}

      {/* Buyer pool table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 font-medium text-muted-foreground">Buyer</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground md:table-cell">Firm Type</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground sm:table-cell">Qualification</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Seat Status</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground lg:table-cell">Match</th>
              <th className="hidden px-4 py-3 font-medium text-muted-foreground sm:table-cell">Requested</th>
              <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {buyerPool.map((buyer) => (
              <tr key={buyer.id} className="border-b border-border last:border-b-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <button className="font-medium text-foreground underline-offset-2 hover:underline">
                    {DS_BUYER_NAMES[buyer.buyerId] ?? buyer.anonymizedLabel}
                  </button>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                  {DS_BUYER_FIRM_TYPES[buyer.buyerId] ?? '—'}
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <Badge className={buyer.qualificationStatus === 'qualified'
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border-slate-500/30 bg-slate-500/10 text-slate-400'
                  }>
                    {buyer.qualificationStatus === 'qualified' ? 'Qualified' : 'Not Qualified'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge className={SEAT_STATUS_CLASS[buyer.seatStatus] ?? ''}>
                    {SEAT_STATUS_LABELS[buyer.seatStatus] ?? buyer.seatStatus}
                  </Badge>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                  {buyer.matchScore}%
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                  {buyer.accessRequestedAt ? formatDate(buyer.accessRequestedAt) : '—'}
                </td>
                <td className="px-4 py-3">
                  <SeatActions buyer={buyer} seatsFull={seatsFull} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SeatActions({ buyer, seatsFull }: { buyer: BuyerPoolEntry; seatsFull: boolean }) {
  switch (buyer.seatStatus) {
    case 'pending':
      return (
        <div className="flex gap-1.5">
          <Button size="xs" disabled={seatsFull}>Approve</Button>
          <Button size="xs" variant="outline">Deny</Button>
        </div>
      )
    case 'invited':
      return <span className="text-xs text-muted-foreground">Awaiting buyer</span>
    case 'accepted':
      return <Button size="xs" disabled={seatsFull}>Confirm Seat</Button>
    case 'seated':
      return <Button size="xs" variant="outline">Remove</Button>
    case 'passed':
      return <span className="text-xs text-muted-foreground">—</span>
    default:
      return null
  }
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 3 — OFFER ROUNDS
// ══════════════════════════════════════════════════════════════════════════

function OfferRoundsTab({ offers, feedbackDrafts, offerRounds }: {
  offers: Offer[]; feedbackDrafts: AiFeedbackDraft[]; offerRounds: OfferRound[]
}) {
  const [expandedRound, setExpandedRound] = useState<number>(offerRounds.find(r => r.status === 'open')?.round ?? 1)
  const [confirmAdvance, setConfirmAdvance] = useState(false)
  const [confirmWinner, setConfirmWinner] = useState<string | null>(null)
  const [authDrafts, setAuthDrafts] = useState<Set<string>>(new Set())

  const allRoundsClosed = offerRounds.every((r) => r.status === 'closed')
  const round3Closed = offerRounds.find((r) => r.round === 3)?.status === 'closed'

  return (
    <div className="space-y-4">
      {offerRounds.map((round) => {
        const roundOffers = offers.filter((o) => o.round === round.round)
        const isOpen = expandedRound === round.round

        return (
          <div key={round.round} className="rounded-xl border border-border bg-card">
            <button
              onClick={() => setExpandedRound(isOpen ? 0 : round.round)}
              className="flex w-full items-center justify-between p-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-foreground">Round {round.round}</span>
                <Badge className={
                  round.status === 'open' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : round.status === 'closed' ? 'border-slate-500/30 bg-slate-500/10 text-slate-400'
                      : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                }>
                  {round.status === 'open' ? 'Open' : round.status === 'closed' ? 'Closed' : 'Pending'}
                </Badge>
                {round.deadline && (
                  <span className="text-xs text-muted-foreground">
                    Deadline: {formatDate(round.deadline)}
                  </span>
                )}
              </div>
              {isOpen ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
            </button>

            {isOpen && (
              <div className="border-t border-border px-4 pb-4">
                {roundOffers.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">No offers submitted for this round.</p>
                ) : (
                  <table className="mt-3 w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="pb-2 font-medium text-muted-foreground">Buyer</th>
                        <th className="pb-2 font-medium text-muted-foreground">Amount</th>
                        <th className="hidden pb-2 font-medium text-muted-foreground sm:table-cell">Terms</th>
                        <th className="hidden pb-2 font-medium text-muted-foreground md:table-cell">Submitted</th>
                        <th className="pb-2 font-medium text-muted-foreground">AI Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roundOffers.map((offer) => {
                        const draft = feedbackDrafts.find((d) => d.offerId === offer.id)
                        const isAuthed = authDrafts.has(offer.id) || draft?.status === 'authorized' || draft?.status === 'sent'
                        return (
                          <tr key={offer.id} className="border-b border-border last:border-b-0">
                            <td className="py-3 font-medium text-foreground">
                              {DS_BUYER_NAMES[offer.buyerId] ?? offer.buyerId}
                            </td>
                            <td className="py-3 text-foreground">{formatPrice(offer.amount)}</td>
                            <td className="hidden py-3 text-muted-foreground sm:table-cell">
                              {offer.financingType === 'cash' ? 'Cash' : 'Financed'} · {offer.closingTimelineDays}d close
                            </td>
                            <td className="hidden py-3 text-muted-foreground md:table-cell">
                              {formatDate(offer.submittedAt)}
                            </td>
                            <td className="py-3">
                              {draft ? (
                                isAuthed ? (
                                  <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                                    {draft.status === 'sent' ? 'Sent' : 'Authorized'}
                                  </Badge>
                                ) : (
                                  <Button size="xs" onClick={() => setAuthDrafts((prev) => new Set(prev).add(offer.id))}>
                                    Authorize
                                  </Button>
                                )
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}

                {/* Round controls */}
                {round.status === 'open' && (
                  <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                    <Button size="sm" variant="outline">
                      <Calendar size={14} className="mr-1.5" />
                      Set Deadline
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* Round controls — Open Next Round / Advance to Stage 9 */}
      <div className="flex items-center gap-2">
        {!round3Closed && offerRounds.some((r) => r.status === 'closed') && (
          <Button size="sm" variant="outline">Open Next Round</Button>
        )}
        {round3Closed && (
          <Button size="sm" variant="destructive" onClick={() => setConfirmAdvance(true)}>
            Advance to Stage 9
          </Button>
        )}
        {offerRounds.some((r) => r.status === 'closed') && (
          <Button size="sm" onClick={() => setConfirmWinner(offers[0]?.buyerId ?? null)}>
            <Award size={14} className="mr-1.5" />
            Select Winning Offer
          </Button>
        )}
      </div>

      {/* Advance to Stage 9 modal */}
      <Dialog open={confirmAdvance} onOpenChange={setConfirmAdvance}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advance to Stage 9?</DialogTitle>
            <DialogDescription>
              This will close the offer negotiation phase and advance the deal to Accepted Offer status.
              This action is irreversible — no further offers will be accepted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={() => setConfirmAdvance(false)}>
              Confirm Advance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Winning offer confirmation modal */}
      <Dialog open={!!confirmWinner} onOpenChange={() => setConfirmWinner(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Winning Offer</DialogTitle>
            <DialogDescription>
              Confirm {DS_BUYER_NAMES[confirmWinner ?? ''] ?? 'this buyer'} as the winning buyer?
              This action is irreversible. Non-winning buyers will receive automated outcome messages
              and the deal status will move to Accepted Offer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={() => setConfirmWinner(null)}>
              Confirm Winner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 4 — DOCUMENTS
// ══════════════════════════════════════════════════════════════════════════

function DocumentsTab({ documents }: { documents: DealDocument[] }) {
  if (documents.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No documents uploaded for this deal.</p>
  }

  return (
    <DocumentListGroup>
      {documents.map((doc) => (
        <DocumentListItem
          key={doc.id}
          variant={doc.status === 'approved' ? 'uploaded' : 'pending'}
          icon={FileText}
          title={doc.label}
          description={`${doc.fileName} · ${doc.fileSizeMb} MB · ${DOC_STATUS_LABELS[doc.status]}${doc.flagNote ? ` — ${doc.flagNote}` : ''}`}
          primaryAction={{ label: 'Download' }}
        />
      ))}
    </DocumentListGroup>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 5 — MARKET INTELLIGENCE
// ══════════════════════════════════════════════════════════════════════════

function MarketIntelTab({ data }: { data?: MarketIntelData }) {
  if (!data) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No market intelligence available for this deal.</p>
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Activity Summary</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {data.stats.map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pass reasons */}
      {data.passReasons.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Pass Reasons</h3>
          <div className="space-y-2">
            {data.passReasons.map((pr) => (
              <div key={pr.reason} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5">
                <span className="text-sm text-foreground">{pr.reason}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{pr.count} buyer{pr.count !== 1 ? 's' : ''}</span>
                  <span className="text-xs text-muted-foreground">{pr.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Buyer Q&A Themes */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Buyer Q&A Themes</h3>
        <div className="space-y-2">
          {[
            { theme: 'Lease-up timeline & stabilization projections', mentions: 4 },
            { theme: 'Cap rate assumptions & NOI validation', mentions: 3 },
            { theme: 'Construction schedule vs. occupancy discrepancies', mentions: 2 },
            { theme: 'Environmental & zoning compliance', mentions: 1 },
          ].map((item) => (
            <div key={item.theme} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5">
              <span className="text-sm text-foreground">{item.theme}</span>
              <span className="text-xs text-muted-foreground">{item.mentions} mention{item.mentions !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interest signals (mock) */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Coming Soon Interest Signals</h3>
        <p className="text-sm text-muted-foreground">
          {data.stats[0]?.value ?? 0} buyers were contacted during the Coming Soon period.
          Interest indications are tracked as soft signals for seat allocation context.
        </p>
      </div>

      {/* Seat history (mock) */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Seat History</h3>
        <p className="text-sm text-muted-foreground">
          All seat events — approvals, denials, passes, and removals — are logged chronologically.
          Full history is available once deal enters active disposition.
        </p>
      </div>

      {/* AI deal health summary */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-2 flex items-center gap-2">
          <TrendingUp size={14} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-foreground">Deal Health Summary</h3>
          {data.summaryBadge && (
            <Badge variant="outline" className="text-xs">{data.summaryBadge}</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{data.summary}</p>
      </div>
    </div>
  )
}

// ── Milestone log form (date + notes) ────────────────────────────────────

function MilestoneLogForm({ index, onLog }: { index: number; onLog: (i: number, date: string, notes: string) => void }) {
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded border border-border bg-main px-2 py-1 text-xs text-foreground"
      />
      <input
        type="text"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        className="rounded border border-border bg-main px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground"
      />
      <Button
        size="xs"
        onClick={() => onLog(index, date || new Date().toLocaleDateString(), notes)}
      >
        Log
      </Button>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 6 — MILESTONES
// ══════════════════════════════════════════════════════════════════════════

function MilestonesTab({ deal }: { deal: DealRoom }) {
  const isPostAcceptance = deal.status === 'closed' || deal.currentStage === 9
  const [logged, setLogged] = useState<Record<number, { date: string; notes: string }>>({})
  const [confirmClose, setConfirmClose] = useState(false)

  if (!isPostAcceptance) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16">
        <Shield size={32} className="text-slate-500" />
        <p className="text-sm font-medium text-slate-500">Milestones are unlocked after the winning offer is confirmed.</p>
      </div>
    )
  }

  const handleLog = (index: number, date: string, notes: string) => {
    if (index === 4) {
      setConfirmClose(true)
      return
    }
    setLogged((prev) => ({ ...prev, [index]: { date, notes } }))
  }

  return (
    <div className="space-y-4">
      {POST_ACCEPTANCE_LABELS.map((label, i) => {
        const isLogged = logged[i] !== undefined
        const prevLogged = i === 0 || logged[i - 1] !== undefined

        return (
          <div
            key={label}
            className={`rounded-xl border border-border p-4 ${isLogged ? 'bg-card opacity-70' : 'bg-card'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isLogged ? (
                  <CheckCircle2 size={18} className="text-emerald-400" />
                ) : (
                  <Circle size={18} className="text-muted-foreground" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{i + 1}. {label}</p>
                  {isLogged && (
                    <p className="text-xs text-muted-foreground">
                      Logged: {logged[i].date}{logged[i].notes ? ` — ${logged[i].notes}` : ''}
                    </p>
                  )}
                </div>
              </div>

              {!isLogged && prevLogged && (
                <MilestoneLogForm index={i} onLog={handleLog} />
              )}
            </div>
          </div>
        )
      })}

      {/* Confirm Close modal */}
      <Dialog open={confirmClose} onOpenChange={setConfirmClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark this deal as Closed?</DialogTitle>
            <DialogDescription>
              This is permanent. The deal status will be set to Closed and cannot be reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                setLogged((prev) => ({ ...prev, 4: { date: new Date().toLocaleDateString(), notes: '' } }))
                setConfirmClose(false)
              }}
            >
              Confirm Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// TAB 7 — MESSAGES
// ══════════════════════════════════════════════════════════════════════════

function MessagesTab({ conversations }: { conversations: DsConversationThread[] }) {
  const [activeThread, setActiveThread] = useState<string | null>(conversations[0]?.id ?? null)
  const [composeText, setComposeText] = useState('')
  const [localMessages, setLocalMessages] = useState<Record<string, DsMessage[]>>({})
  const [authorizedMsgs, setAuthorizedMsgs] = useState<Set<string>>(new Set())

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      if (a.unread && !b.unread) return -1
      if (!a.unread && b.unread) return 1
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    })
  }, [conversations])

  const currentThread = conversations.find((c) => c.id === activeThread)
  const allMessages = currentThread
    ? [...currentThread.messages, ...(localMessages[currentThread.id] ?? [])]
    : []

  const handleSend = () => {
    if (!composeText.trim() || !activeThread) return
    const newMsg: DsMessage = {
      id: `msg_local_${Date.now()}`,
      senderRole: 'ds',
      senderLabel: 'Rachel Torres',
      content: composeText.trim(),
      timestamp: new Date().toISOString(),
    }
    setLocalMessages((prev) => ({
      ...prev,
      [activeThread]: [...(prev[activeThread] ?? []), newMsg],
    }))
    setComposeText('')
  }

  if (conversations.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No conversations for this deal.</p>
  }

  return (
    <div className="flex h-[500px] overflow-hidden rounded-xl border border-border">
      {/* Left — conversation list */}
      <div className="w-64 shrink-0 border-r border-border bg-card overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">Conversations</span>
          <button className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <Plus size={14} />
          </button>
        </div>
        {sortedConversations.map((thread) => (
          <button
            key={thread.id}
            onClick={() => setActiveThread(thread.id)}
            className={`w-full border-b border-border px-3 py-3 text-left transition-colors ${
              activeThread === thread.id ? 'bg-muted' : 'hover:bg-muted/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground truncate">{thread.buyerName}</span>
              {thread.unread && <div className="h-2 w-2 rounded-full bg-blue-400" />}
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{thread.lastMessagePreview}</p>
            <p className="mt-0.5 text-xs text-muted-foreground/60">{relativeTime(thread.lastMessageAt)}</p>
          </button>
        ))}
      </div>

      {/* Right — thread view */}
      <div className="flex flex-1 flex-col">
        {currentThread ? (
          <>
            {/* Thread header */}
            <div className="border-b border-border px-4 py-2.5">
              <span className="text-sm font-semibold text-foreground">{currentThread.buyerName}</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {allMessages.map((msg) => {
                const isBuyer = msg.senderRole === 'buyer'
                const isAiDraft = msg.senderRole === 'ai_draft'
                const isPending = isAiDraft && msg.pendingAuthorization && !authorizedMsgs.has(msg.id)
                const wasAuthorized = isAiDraft && (msg.aiAuthorized || authorizedMsgs.has(msg.id))

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isBuyer ? 'items-start' : 'items-end'}`}
                  >
                    {isPending && (
                      <div className="mb-1 flex items-center gap-1.5">
                        <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-400">Pending Authorization</Badge>
                        <Button size="xs" onClick={() => setAuthorizedMsgs((prev) => new Set(prev).add(msg.id))}>
                          Authorize
                        </Button>
                      </div>
                    )}
                    {wasAuthorized && (
                      <span className="mb-1 text-[10px] text-slate-500">AI Draft — Authorized by DS</span>
                    )}
                    <div
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                        isBuyer
                          ? 'bg-muted text-foreground'
                          : isPending
                            ? 'border border-amber-500/30 bg-amber-500/5 text-foreground'
                            : 'bg-slate-600 text-white'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="mt-0.5 text-[10px] text-muted-foreground">
                      {msg.senderLabel} · {formatTime(msg.timestamp)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Compose area */}
            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-border bg-main px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
                <Button size="sm" onClick={handleSend} disabled={!composeText.trim()}>
                  <Send size={14} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// AI CHAT PANEL — deal-scoped, accessible from all tabs
// ══════════════════════════════════════════════════════════════════════════

function DealAiChatPanel({ dealName }: { dealName: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: `I'm your AI assistant for ${dealName}. Ask me about deal activity, buyer signals, market context, or anything else about this deal.` },
  ])
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (!input.trim()) return
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: input.trim() },
      { role: 'ai', text: 'This is a mock response. In production, I would surface real-time deal intelligence, buyer activity summaries, and market context.' },
    ])
    setInput('')
  }

  return (
    <>
      {/* Floating toggle button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 text-slate-200 shadow-lg hover:bg-slate-600 transition-colors"
          title="AI Assistant"
        >
          <Sparkles size={20} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[420px] w-[340px] flex-col rounded-xl border border-border bg-background shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-slate-400" />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">NextLevel AI</span>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                  msg.role === 'user'
                    ? 'bg-slate-700 text-slate-100'
                    : 'bg-muted text-foreground'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Compose */}
          <div className="border-t border-border px-3 py-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about this deal..."
                className="flex-1 rounded-lg border border-border bg-main px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-slate-500"
              />
              <button onClick={handleSend} className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════

interface DSDealViewProps {
  dealId: string
  onBack: () => void
  defaultTab?: string
}

export default function DSDealView({ dealId, onBack, defaultTab }: DSDealViewProps) {
  const { deal, buyerPool, documents, milestones, marketIntel, offers, feedbackDrafts, offerRounds, conversations } = getDealData(dealId)
  const [tab, setTab] = useState(defaultTab ?? 'overview')

  if (!deal) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 py-20">
        <p className="text-lg font-medium text-slate-500">Deal not found.</p>
        <Button variant="outline" onClick={onBack}>
          Back to Pipeline
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Breadcrumbs
        className="mb-4"
        items={[
          { label: 'Pipeline', onClick: onBack },
          { label: deal.name },
        ]}
      />
      {/* Deal header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">{deal.name}</h1>
          <Badge className={STATUS_BADGE[deal.status]}>{STATUS_LABELS[deal.status]}</Badge>
          <Badge variant="outline">Stage {deal.currentStage} — {STAGE_LABELS[deal.currentStage as DealRoomStage]}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {SUBTYPE_LABELS[deal.assetSubType] ?? deal.assetSubType} · {deal.shared.geography.msa}
        </p>
        <StageProgressBar currentStage={deal.currentStage as DealRoomStage} className="mt-3" />
      </div>

      {/* 7-tab layout */}
      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="seat_allocation">Seat Allocation</TabsTrigger>
            <TabsTrigger value="offer_rounds">Offer Rounds</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="market_intelligence">Market Intel</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <OverviewTab deal={deal} buyerPool={buyerPool} milestones={milestones} onNavigateTab={setTab} />
        </TabsContent>
        <TabsContent value="seat_allocation">
          <SeatAllocationTab buyerPool={buyerPool} />
        </TabsContent>
        <TabsContent value="offer_rounds">
          <OfferRoundsTab offers={offers} feedbackDrafts={feedbackDrafts} offerRounds={offerRounds} />
        </TabsContent>
        <TabsContent value="documents">
          <DocumentsTab documents={documents} />
        </TabsContent>
        <TabsContent value="market_intelligence">
          <MarketIntelTab data={marketIntel} />
        </TabsContent>
        <TabsContent value="milestones">
          <MilestonesTab deal={deal} />
        </TabsContent>
        <TabsContent value="messages">
          <MessagesTab conversations={conversations} />
        </TabsContent>
      </Tabs>

      {/* AI chat panel — deal-scoped, accessible from all tabs */}
      <DealAiChatPanel dealName={deal.name} />
    </div>
  )
}
