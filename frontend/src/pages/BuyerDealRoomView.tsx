import { useState } from 'react'
import { Check, Eye, FileText, Send } from 'lucide-react'
import BuyerInactivityNudge from '@/components/BuyerInactivityNudge'
import OfferIntentGate from '@/components/OfferIntentGate'
import WatchPassModal from '@/components/WatchPassModal'
import { recordPassFeedback, recordOfferIntent } from '@backend/agents/buyerDealRoomStubs'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { MOCK_DOCUMENTS_DR001, MOCK_DOCUMENTS_DR002, MOCK_DOCUMENTS_DR005 } from '@/data/mock/documents'
import { MOCK_BUYER_POOL_DR001, MOCK_BUYER_POOL_DR005 } from '@/data/mock/buyerPool'
import { MOCK_CHAT_BUYER_DR001 } from '@/data/mock/chat'
import type { DealDocument } from '@shared/types/document'
import type { BuyerPoolEntry } from '@shared/types/buyerPool'
import type { Offer } from '@shared/types/offer'
import DealRoomHeader from '@/components/DealRoomHeader'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import BuyerPoolPanel from '@/components/BuyerPoolPanel'
import OfferSubmissionForm from '@/components/OfferSubmissionForm'
import { DocumentListItem, DocumentListGroup } from '@/components/ui/document-list-item'
import { Button } from '@/components/ui/button'

// ── Mock data lookups by dealId ────────────────────────────────────────────

const DOCUMENTS_BY_DEAL: Record<string, DealDocument[]> = {
  dr_001: MOCK_DOCUMENTS_DR001,
  dr_002: MOCK_DOCUMENTS_DR002,
  dr_005: MOCK_DOCUMENTS_DR005,
}

const BUYER_POOL_BY_DEAL: Record<string, BuyerPoolEntry[]> = {
  dr_001: MOCK_BUYER_POOL_DR001,
  dr_005: MOCK_BUYER_POOL_DR005,
}

// ── Buyer context mock (inactivity data) ──────────────────────────────────

const BUYER_CONTEXT_BY_DEAL: Record<string, { daysInactive: number }> = {
  dr_001: { daysInactive: 4 },
  dr_002: { daysInactive: 1 },
  dr_005: { daysInactive: 0 },
}

// ── Currency formatter ────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)

// ── Exported chat messages for ShellDemo wiring ────────────────────────────

export const BUYER_DEAL_ROOM_CHAT = MOCK_CHAT_BUYER_DR001

// ── Component ──────────────────────────────────────────────────────────────

interface BuyerDealRoomViewProps {
  dealId: string
  onBack: () => void
}

type OfferIntent = 'undecided' | 'interested' | 'passed'

export default function BuyerDealRoomView({ dealId, onBack }: BuyerDealRoomViewProps) {
  const deal = MOCK_SELLER_DEAL_ROOMS.find((d) => d.id === dealId) ?? MOCK_SELLER_DEAL_ROOMS[0]
  const documents = DOCUMENTS_BY_DEAL[dealId] ?? []
  const buyers = BUYER_POOL_BY_DEAL[dealId] ?? []

  // Seat status
  const seatedBuyers = buyers.filter(b => b.seatStatus === 'seated')

  // Inactivity
  const daysInactive = BUYER_CONTEXT_BY_DEAL[dealId]?.daysInactive ?? 0
  const [nudgeDismissed, setNudgeDismissed] = useState(false)

  // Offer intent state
  const [offerIntent, setOfferIntent] = useState<OfferIntent>('undecided')
  const [watchPassOpen, setWatchPassOpen] = useState(false)

  // Offer state
  const [offerFormOpen, setOfferFormOpen] = useState(false)
  const [currentOffer, setCurrentOffer] = useState<Offer | undefined>(undefined)

  const handleOfferSubmit = (data: Partial<Offer>) => {
    setCurrentOffer({
      id: currentOffer?.id ?? crypto.randomUUID(),
      dealRoomId: dealId,
      buyerId: 'mock-buyer-id',
      submittedAt: new Date().toISOString(),
      round: 1,
      amount: 0,
      financingType: 'cash',
      closingTimelineDays: 30,
      earnestMoneyAmount: 0,
      terms: '',
      ...currentOffer,
      ...data,
    } as Offer)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 pt-4">
        <Breadcrumbs
          items={[
            { label: 'Buy' },
            { label: 'Your Deals', onClick: onBack },
            { label: deal.name },
          ]}
        />
      </div>
      {/* Section 1 — Header */}
      <DealRoomHeader deal={deal} viewer="buyer" seatedBuyerCount={seatedBuyers.length} onBack={onBack} />

      {/* Inactivity nudge */}
      {!nudgeDismissed && daysInactive >= 3 && (
        <div className="px-6 pt-4">
          <BuyerInactivityNudge
            daysInactive={daysInactive}
            dealId={dealId}
            buyerId="mock-buyer-id"
            onDismiss={() => setNudgeDismissed(true)}
          />
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {/* Section 2 — Document Package (read-only) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-mode-buy" />
            <h3 className="text-sm font-semibold text-foreground">Document Package</h3>
          </div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Uploaded Documents
          </h4>
          <DocumentListGroup>
            {documents.map((doc) => {
              const dateStr = doc.uploadedAt
                ? new Date(doc.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : ''

              return (
                <DocumentListItem
                  key={doc.id}
                  variant="uploaded"
                  icon={Check}
                  title={doc.label}
                  description={`${doc.fileName} · Uploaded ${dateStr}`}
                  primaryAction={{ label: 'View', icon: Eye }}
                />
              )
            })}
          </DocumentListGroup>
          <p className="text-xs italic text-muted-foreground">
            Documents are read-only. Contact the Disposition Specialist with questions.
          </p>
        </div>

        {/* Section 3 — Buyer Pool Panel */}
        <BuyerPoolPanel buyers={buyers} />

        {/* Section 4 — Offer Round (visible only at Stage 8) */}
        {deal.currentStage >= 8 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Send size={16} className="text-mode-buy" />
              <h3 className="text-sm font-semibold text-foreground">Offer Round</h3>
            </div>

            {/* Round status — always visible */}
            <div className="flex items-baseline justify-between">
              <p className="text-sm text-foreground">Round 1 of 3</p>
              <p className="text-xs text-muted-foreground">Closes in 36 hours</p>
            </div>

            {/* Intent gate — only when undecided */}
            {offerIntent === 'undecided' && (
              <OfferIntentGate
                dealName={deal.name}
                onInterestedInOffering={() => {
                  recordOfferIntent(dealId, 'mock-buyer-id')
                  setOfferIntent('interested')
                }}
                onPass={() => setWatchPassOpen(true)}
              />
            )}

            {/* Offer form entry — only after indicating interest */}
            {offerIntent === 'interested' && (
              <>
                {currentOffer ? (
                  <>
                    <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Your Offer</p>

                      <p className="text-2xl font-bold text-foreground">{formatCurrency(currentOffer.amount)}</p>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Earnest Money</p>
                          <p className="text-sm font-semibold text-foreground">{formatCurrency(currentOffer.earnestMoneyAmount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Close In</p>
                          <p className="text-sm font-semibold text-foreground">{currentOffer.closingTimelineDays} days</p>
                          <p className="text-xs text-muted-foreground">{currentOffer.closingTimelineDays === 30 ? 'Standard' : 'Custom'}</p>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Financing</span>
                        <span className="font-medium text-foreground">{currentOffer.financingType === 'cash' ? 'Cash' : 'Financed'}</span>
                      </div>

                      {currentOffer.terms ? (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Notes</span>
                          <span className="font-medium text-foreground truncate max-w-[60%] text-right">{currentOffer.terms}</span>
                        </div>
                      ) : null}
                    </div>

                    <Button
                      className="w-full bg-mode-buy text-white hover:bg-mode-buy/80"
                      onClick={() => setOfferFormOpen(true)}
                    >
                      Update Offer
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full bg-mode-buy text-white hover:bg-mode-buy/80"
                    onClick={() => setOfferFormOpen(true)}
                  >
                    Submit Offer
                  </Button>
                )}
              </>
            )}

            {/* Passed state */}
            {offerIntent === 'passed' && (
              <p className="text-sm text-muted-foreground text-center py-2">
                You have passed on this deal. Your seat has been released.
              </p>
            )}
          </div>
        )}

        {/* Offer form sheet */}
        <OfferSubmissionForm
          open={offerFormOpen}
          onOpenChange={setOfferFormOpen}
          dealRoomId={dealId}
          round={1}
          existingOffer={currentOffer}
          onSubmit={handleOfferSubmit}
        />
      </div>

      {/* Watch/Pass modal */}
      <WatchPassModal
        open={watchPassOpen}
        dealName={deal.name}
        onConfirm={(reason, notes) => {
          recordPassFeedback(dealId, 'mock-buyer-id', reason, notes)
          setWatchPassOpen(false)
          setOfferIntent('passed')
        }}
        onBack={() => setWatchPassOpen(false)}
      />
    </div>
  )
}
