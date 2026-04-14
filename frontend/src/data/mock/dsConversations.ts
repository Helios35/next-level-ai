// DS-side conversation threads for the Messages tab
// Each thread represents a buyer conversation within a deal

export interface DsMessage {
  id: string
  senderRole: 'buyer' | 'ds' | 'ai_draft'
  senderLabel: string
  content: string
  timestamp: string
  /** AI-drafted messages that were authorized by DS */
  aiAuthorized?: boolean
  /** Pending authorization — not yet sent */
  pendingAuthorization?: boolean
}

export interface DsConversationThread {
  id: string
  dealRoomId: string
  buyerId: string
  buyerName: string
  lastMessagePreview: string
  lastMessageAt: string
  unread: boolean
  messages: DsMessage[]
}

// ── dr_001 · Magnolia Farms BFR — Charlotte ──────────────────────────────

const THREAD_DR001_BUYER01: DsConversationThread = {
  id: 'thread_001',
  dealRoomId: 'dr_001',
  buyerId: 'user_buyer_01',
  buyerName: 'Apex Capital Partners',
  lastMessagePreview: `We'd like clarification on the lease-up timeline...`,
  lastMessageAt: '2026-02-17T14:30:00Z',
  unread: true,
  messages: [
    {
      id: 'msg_001',
      senderRole: 'ai_draft',
      senderLabel: 'AI Outreach',
      content: `Welcome to Magnolia Farms BFR — Charlotte. You've been granted access to the deal room. The property is a 72-unit build-for-rent community in Cabarrus County. Key documents are available in the Documents tab. Please review and reach out with any questions.`,
      timestamp: '2026-02-03T11:00:00Z',
      aiAuthorized: true,
    },
    {
      id: 'msg_002',
      senderRole: 'buyer',
      senderLabel: 'Apex Capital Partners',
      content: `Thank you for the access. We've reviewed the initial materials. Can you share the projected stabilized NOI and cap rate assumptions?`,
      timestamp: '2026-02-05T09:15:00Z',
    },
    {
      id: 'msg_003',
      senderRole: 'ds',
      senderLabel: 'Rachel Torres',
      content: `Great question. The projected stabilized NOI is $1.26M based on current lease-up projections. The seller's cap rate assumption is in the 7.0–7.8% range. I've noted your interest — feel free to dig into the T-12 in the docs tab for the trailing actuals.`,
      timestamp: '2026-02-05T14:00:00Z',
    },
    {
      id: 'msg_004',
      senderRole: 'buyer',
      senderLabel: 'Apex Capital Partners',
      content: `We'd like clarification on the lease-up timeline — the construction schedule shows a Q3 completion but the rent roll suggests units are already leasing. Which is accurate?`,
      timestamp: '2026-02-17T14:30:00Z',
    },
  ],
}

const THREAD_DR001_BUYER02: DsConversationThread = {
  id: 'thread_002',
  dealRoomId: 'dr_001',
  buyerId: 'user_buyer_02',
  buyerName: 'Triangle Capital Group',
  lastMessagePreview: `Understood, we'll submit our Round 2 offer by the deadline.`,
  lastMessageAt: '2026-02-16T11:00:00Z',
  unread: false,
  messages: [
    {
      id: 'msg_010',
      senderRole: 'ai_draft',
      senderLabel: 'AI Outreach',
      content: 'Welcome to Magnolia Farms BFR — Charlotte. Your seat has been confirmed. The deal room contains all available documents for your review. The first offer round deadline is February 13.',
      timestamp: '2026-02-03T11:00:00Z',
      aiAuthorized: true,
    },
    {
      id: 'msg_011',
      senderRole: 'buyer',
      senderLabel: 'Triangle Capital Group',
      content: `Thanks for the access. We're familiar with the Charlotte BFR market. Quick question — is the seller open to a phase sale or is this package-only?`,
      timestamp: '2026-02-04T10:00:00Z',
    },
    {
      id: 'msg_012',
      senderRole: 'ds',
      senderLabel: 'Rachel Torres',
      content: 'This is a package-only sale — the seller has confirmed they will not consider phase sales. Let me know if you have other questions as you prepare your offer.',
      timestamp: '2026-02-04T16:00:00Z',
    },
    {
      id: 'msg_013',
      senderRole: 'buyer',
      senderLabel: 'Triangle Capital Group',
      content: `Understood, we'll submit our Round 2 offer by the deadline.`,
      timestamp: '2026-02-16T11:00:00Z',
    },
  ],
}

const THREAD_DR001_BUYER03: DsConversationThread = {
  id: 'thread_003',
  dealRoomId: 'dr_001',
  buyerId: 'user_buyer_03',
  buyerName: 'Greenfield Acquisitions',
  lastMessagePreview: '[AI Draft — Pending Authorization] Based on your Round 1...',
  lastMessageAt: '2026-02-14T10:30:00Z',
  unread: false,
  messages: [
    {
      id: 'msg_020',
      senderRole: 'ai_draft',
      senderLabel: 'AI Outreach',
      content: `Welcome to Magnolia Farms BFR — Charlotte. You've been granted a seat in the deal room. All property documents are available for your review.`,
      timestamp: '2026-02-03T11:00:00Z',
      aiAuthorized: true,
    },
    {
      id: 'msg_021',
      senderRole: 'buyer',
      senderLabel: 'Greenfield Acquisitions',
      content: `Thanks. We're reviewing the site plan now. Is there flexibility on the asking price range given current lease-up status?`,
      timestamp: '2026-02-06T09:00:00Z',
    },
    {
      id: 'msg_022',
      senderRole: 'ds',
      senderLabel: 'Rachel Torres',
      content: `The seller is firm on the $14M–$18M range at this stage. I'd recommend submitting your best offer within that range for Round 1 — the seller will review all offers holistically.`,
      timestamp: '2026-02-06T15:00:00Z',
    },
    {
      id: 'msg_023',
      senderRole: 'ai_draft',
      senderLabel: 'AI Feedback Draft',
      content: 'Based on your Round 1 offer of $14.5M: your price was the lowest received this round. The 75-day timeline and multiple contingencies weaken your competitive position. To remain in consideration, we recommend a significant price increase and removal of the appraisal contingency.',
      timestamp: '2026-02-14T10:30:00Z',
      pendingAuthorization: true,
    },
  ],
}

export const MOCK_DS_CONVERSATIONS_DR001: DsConversationThread[] = [
  THREAD_DR001_BUYER01,
  THREAD_DR001_BUYER02,
  THREAD_DR001_BUYER03,
]

// ── Buyer name lookup (for DS-side display) ──────────────────────────────

export const DS_BUYER_NAMES: Record<string, string> = {
  user_buyer_01: 'Apex Capital Partners',
  user_buyer_02: 'Triangle Capital Group',
  user_buyer_03: 'Greenfield Acquisitions',
  user_buyer_04: 'Harbor Point Investments',
  user_buyer_05: 'Summit Realty Advisors',
  user_buyer_10: 'Lakeshore Ventures',
  user_buyer_11: 'Pinnacle Real Estate',
  user_buyer_12: 'Redstone Capital',
  user_buyer_13: 'Bridgewater Holdings',
  user_buyer_20: 'Meridian Fund Group',
  user_buyer_21: 'Cornerstone Properties',
  user_buyer_22: 'Iron Gate Capital',
}

// Firm type lookup
export const DS_BUYER_FIRM_TYPES: Record<string, string> = {
  user_buyer_01: 'Private Equity',
  user_buyer_02: 'Principal / Operator',
  user_buyer_03: 'Family Office',
  user_buyer_04: 'Private Equity',
  user_buyer_05: 'Institutional',
  user_buyer_10: 'Family Office',
  user_buyer_11: 'REIT',
  user_buyer_12: 'Principal / Operator',
  user_buyer_13: 'Institutional',
  user_buyer_20: 'Institutional',
  user_buyer_21: 'Family Office',
  user_buyer_22: 'Private Equity',
}
