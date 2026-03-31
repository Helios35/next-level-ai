import type { ChatMessage, BuyerFeedbackItem } from '@shared/types/chat'

// ── dr_001 · Magnolia Farms BFR — Charlotte (Stage 7, active) ──────────────

export const MOCK_CHAT_SELLER_DR001: ChatMessage[] = [
  // Early messages (deal activation — Feb 3-5)
  {
    id: 'msg_001',
    dealRoomId: 'dr_001',
    senderId: 'ai_agent',
    senderRole: 'ai_agent',
    senderLabel: 'NextLevel AI',
    content: 'Your deal has been activated and is now in Active Disposition. We have 3 qualified buyers in the room. I\'ll be managing buyer outreach and Q&A — I\'ll keep you updated on activity and route any questions I can\'t answer from the deal documents.',
    messageType: 'message',
    timestamp: '2026-02-03T09:05:00Z',
  },
  {
    id: 'msg_002',
    dealRoomId: 'dr_001',
    senderId: 'ai_agent',
    senderRole: 'ai_agent',
    senderLabel: 'NextLevel AI',
    content: 'Buyer #2847 has requested clarification on the lease-up velocity. I\'ve routed this to you in the Buyer Feedback section below — their question is outside what the current documents cover.',
    messageType: 'question_routed',
    timestamp: '2026-02-05T11:20:00Z',
    routedQuestionId: 'feedback_001',
  },
  {
    id: 'msg_003',
    dealRoomId: 'dr_001',
    senderId: 'user_001',
    senderRole: 'seller',
    senderLabel: 'Marcus Webb',
    content: 'We\'re currently leasing approximately 6–8 units per month. We expect to hit stabilization by end of Q2.',
    messageType: 'message',
    timestamp: '2026-02-05T14:00:00Z',
  },
  // Later messages (buyer activity — Feb 28 - Mar 1)
  {
    id: 'msg_004',
    dealRoomId: 'dr_001',
    senderId: 'ai_agent',
    senderRole: 'ai_agent',
    senderLabel: 'NextLevel AI',
    content: 'Good morning. I\'ve completed the initial outreach round for Magnolia Farms. All 3 buyer seats are filled. Buyer #2041 opened the deal room yesterday and has already submitted 4 questions — I\'ve answered 3 directly from the documents and routed 1 to your DS for a pricing-adjacent response.',
    messageType: 'message',
    timestamp: '2026-02-28T09:02:00Z',
  },
  {
    id: 'msg_005',
    dealRoomId: 'dr_001',
    senderId: 'user_001',
    senderRole: 'seller',
    senderLabel: 'Marcus Webb',
    content: 'Thanks. Any feedback on the price range so far?',
    messageType: 'message',
    timestamp: '2026-02-28T09:15:00Z',
  },
  {
    id: 'msg_006',
    dealRoomId: 'dr_001',
    senderId: 'ai_agent',
    senderRole: 'ai_agent',
    senderLabel: 'NextLevel AI',
    content: 'Not yet — it\'s early. The seated buyers haven\'t passed or commented on pricing. Buyer #2041 asked a question I\'ve flagged as pricing-adjacent and routed to your DS. I\'ll surface a market intelligence summary once we have at least one pass reason on record.',
    messageType: 'message',
    timestamp: '2026-02-28T09:15:30Z',
  },
  {
    id: 'msg_007',
    dealRoomId: 'dr_001',
    senderId: 'ai_agent',
    senderRole: 'ai_agent',
    senderLabel: 'NextLevel AI',
    content: 'Update: Buyer #2038 has been active in the deal room for 3 days. No offer submitted yet. Buyer #2041 opened the offer form earlier today — I\'ve notified your DS. No offer submitted yet, just awareness.',
    messageType: 'message',
    timestamp: '2026-03-01T08:44:00Z',
  },
  {
    id: 'msg_008',
    dealRoomId: 'dr_001',
    senderId: 'user_001',
    senderRole: 'seller',
    senderLabel: 'Marcus Webb',
    content: 'Got it. How many buyers have reviewed the documents?',
    messageType: 'message',
    timestamp: '2026-03-01T09:00:00Z',
  },
  {
    id: 'msg_009',
    dealRoomId: 'dr_001',
    senderId: 'ai_agent',
    senderRole: 'ai_agent',
    senderLabel: 'NextLevel AI',
    content: 'All 3 seated buyers have opened the deal room. 2 of 3 have opened the document folder. I\'ll keep you updated as activity progresses. No action needed from you at this stage.',
    messageType: 'message',
    timestamp: '2026-03-01T09:00:30Z',
  },
]

// ── dr_002 · Triangle SFR Portfolio — Raleigh (Stage 3, active) ────────────
// Early-stage deal — brief onboarding conversation

export const MOCK_CHAT_SELLER_DR002: ChatMessage[] = [
  {
    id: 'msg_020',
    dealRoomId: 'dr_002',
    senderId: 'ai_agent',
    senderRole: 'ai_agent',
    senderLabel: 'NextLevel AI',
    content: 'Welcome to your deal room for Triangle SFR Portfolio. Your property spreadsheet and rent roll have been uploaded. We still need the T-12 statement before we can move to buyer outreach. I\'ll let you know once the documents are reviewed and approved.',
    messageType: 'message',
    timestamp: '2026-02-18T15:30:00Z',
  },
  {
    id: 'msg_021',
    dealRoomId: 'dr_002',
    senderId: 'user_001',
    senderRole: 'seller',
    senderLabel: 'Marcus Webb',
    content: 'When do you expect the first buyer outreach to go out?',
    messageType: 'message',
    timestamp: '2026-02-19T10:00:00Z',
  },
  {
    id: 'msg_022',
    dealRoomId: 'dr_002',
    senderId: 'ai_agent',
    senderRole: 'ai_agent',
    senderLabel: 'NextLevel AI',
    content: 'Once the required documents are complete and your analyst memo is finalized, we\'ll begin outreach. Based on the current pace, I estimate buyer outreach will start within 5–7 business days after the T-12 is uploaded. I\'ve flagged 11 potential matches in the buyer pool.',
    messageType: 'message',
    timestamp: '2026-02-19T10:02:00Z',
  },
]

// ── dr_005 · Brookside MF — Nashville (Stage 7, market_tested) ─────────────
// Market-tested deal — conversation reflects buyer passes and outcome

export const MOCK_CHAT_SELLER_DR005: ChatMessage[] = [
  {
    id: 'msg_050',
    dealRoomId: 'dr_005',
    senderId: 'ai_agent',
    senderRole: 'ai_agent',
    senderLabel: 'NextLevel AI',
    content: 'Your deal room for Brookside MF is now active. 3 buyer seats have been filled and outreach is underway. I\'ll keep you informed on engagement and any questions that come through.',
    messageType: 'message',
    timestamp: '2026-01-22T09:10:00Z',
  },
  {
    id: 'msg_051',
    dealRoomId: 'dr_005',
    senderId: 'ai_agent',
    senderRole: 'ai_agent',
    senderLabel: 'NextLevel AI',
    content: 'Update: Investor #4210 has passed on Brookside MF. Reason cited: pricing above market for stabilized multifamily in the Nashville corridor. This is the second pass we\'ve received — Investor #4099 was auto-released after 14 days with no response.',
    messageType: 'message',
    timestamp: '2026-02-08T16:30:00Z',
  },
  {
    id: 'msg_052',
    dealRoomId: 'dr_005',
    senderId: 'user_001',
    senderRole: 'seller',
    senderLabel: 'Marcus Webb',
    content: 'That\'s disappointing. What are the common themes in the pass reasons?',
    messageType: 'message',
    timestamp: '2026-02-09T08:15:00Z',
  },
  {
    id: 'msg_053',
    dealRoomId: 'dr_005',
    senderId: 'ai_agent',
    senderRole: 'ai_agent',
    senderLabel: 'NextLevel AI',
    content: 'Across 4 buyer passes: 2 cited pricing concerns (above market and cap rate below threshold), 1 flagged deferred maintenance scope, and 1 was non-responsive. The pricing signal is consistent — the $22.5M ask price may be above where demand is concentrating for stabilized MF in this submarket. Your DS has been notified and will follow up with a pricing recommendation.',
    messageType: 'message',
    timestamp: '2026-02-09T08:18:00Z',
  },
  {
    id: 'msg_054',
    dealRoomId: 'dr_005',
    senderId: 'system',
    senderRole: 'system',
    senderLabel: 'System',
    content: 'Deal status updated to Market Tested. All buyer seats have been cycled. Your Disposition Specialist will prepare a market feedback summary.',
    messageType: 'stage_update',
    timestamp: '2026-02-16T10:00:00Z',
  },
]

// ── Buyer Feedback — dr_001 ────────────────────────────────────────────────

export const MOCK_BUYER_FEEDBACK_DR001: BuyerFeedbackItem[] = [
  {
    id: 'feedback_001',
    dealRoomId: 'dr_001',
    buyerAnonymizedLabel: 'Investor #2847',
    question: 'What is the current monthly lease-up velocity and projected stabilization date?',
    status: 'answered',
    sellerResponse: 'We\'re currently leasing 6–8 units per month. We expect to hit stabilization by end of Q2 2026.',
    submittedAt: '2026-02-05T11:00:00Z',
    answeredAt: '2026-02-05T14:00:00Z',
  },
  {
    id: 'feedback_002',
    dealRoomId: 'dr_001',
    buyerAnonymizedLabel: 'Investor #1042',
    question: 'Are there any HOA fees associated with the community, and if so what is the monthly amount?',
    status: 'pending_seller',
    submittedAt: '2026-02-06T09:00:00Z',
  },
]
