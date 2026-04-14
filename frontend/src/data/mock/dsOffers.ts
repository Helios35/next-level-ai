import type { Offer } from '@shared/types/offer'

// ── dr_001 · Magnolia Farms BFR — Charlotte (Stage 8) ────────────────────
// Round 1 complete, Round 2 open

export const MOCK_OFFERS_DR001: Offer[] = [
  {
    id: 'offer_001',
    dealRoomId: 'dr_001',
    buyerId: 'user_buyer_01',
    amount: 15200000,
    financingType: 'financed',
    closingTimelineDays: 60,
    earnestMoneyAmount: 300000,
    terms: 'Standard PSA, 30-day due diligence, financing contingency',
    round: 1,
    submittedAt: '2026-02-12T14:00:00Z',
  },
  {
    id: 'offer_002',
    dealRoomId: 'dr_001',
    buyerId: 'user_buyer_02',
    amount: 14800000,
    financingType: 'cash',
    closingTimelineDays: 45,
    earnestMoneyAmount: 500000,
    terms: 'All cash, 21-day due diligence, no contingencies',
    round: 1,
    submittedAt: '2026-02-12T16:30:00Z',
  },
  {
    id: 'offer_003',
    dealRoomId: 'dr_001',
    buyerId: 'user_buyer_03',
    amount: 14500000,
    financingType: 'financed',
    closingTimelineDays: 75,
    earnestMoneyAmount: 250000,
    terms: 'Standard PSA, 45-day due diligence, financing + appraisal contingency',
    round: 1,
    submittedAt: '2026-02-13T09:00:00Z',
  },
  // Round 2 — only buyer_01 improved
  {
    id: 'offer_004',
    dealRoomId: 'dr_001',
    buyerId: 'user_buyer_01',
    amount: 16000000,
    financingType: 'financed',
    closingTimelineDays: 55,
    earnestMoneyAmount: 400000,
    terms: 'Increased earnest, shortened timeline, standard PSA',
    round: 2,
    submittedAt: '2026-02-18T11:00:00Z',
  },
]

// AI feedback drafts — keyed by offerId
export interface AiFeedbackDraft {
  offerId: string
  buyerId: string
  round: number
  draft: string
  status: 'pending_authorization' | 'authorized' | 'sent'
  authorizedAt?: string
}

export const MOCK_AI_FEEDBACK_DRAFTS: AiFeedbackDraft[] = [
  {
    offerId: 'offer_001',
    buyerId: 'user_buyer_01',
    round: 1,
    draft: 'Your Round 1 offer of $15.2M was competitive. The seller is looking for stronger terms on closing timeline. Consider tightening your due diligence window to stay in the running.',
    status: 'authorized',
    authorizedAt: '2026-02-14T10:00:00Z',
  },
  {
    offerId: 'offer_002',
    buyerId: 'user_buyer_02',
    round: 1,
    draft: 'Your all-cash offer at $14.8M was noted. The seller values certainty of close — your cash position is strong. Consider increasing your offer amount to remain competitive.',
    status: 'authorized',
    authorizedAt: '2026-02-14T10:15:00Z',
  },
  {
    offerId: 'offer_003',
    buyerId: 'user_buyer_03',
    round: 1,
    draft: 'Your Round 1 offer of $14.5M was the lowest received. The 75-day timeline and multiple contingencies weaken your position. A significant increase in price and removal of the appraisal contingency would be needed to remain competitive.',
    status: 'sent',
    authorizedAt: '2026-02-14T10:30:00Z',
  },
  {
    offerId: 'offer_004',
    buyerId: 'user_buyer_01',
    round: 2,
    draft: 'Strong improvement to $16M with increased earnest money. Your position is leading. Recommend holding firm on these terms into Round 3 if it opens.',
    status: 'pending_authorization',
  },
]

// Offer round metadata
export interface OfferRound {
  round: 1 | 2 | 3
  status: 'open' | 'closed' | 'pending'
  deadline?: string
}

export const MOCK_OFFER_ROUNDS_DR001: OfferRound[] = [
  { round: 1, status: 'closed', deadline: '2026-02-13T23:59:00Z' },
  { round: 2, status: 'open', deadline: '2026-02-20T23:59:00Z' },
  { round: 3, status: 'pending' },
]
