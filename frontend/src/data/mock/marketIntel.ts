export interface MarketStat {
  label: string
  value: number
}

export interface PassReason {
  reason: string
  count: number
  pct: number
}

export interface MarketIntelData {
  stats: MarketStat[]
  passReasons: PassReason[]
  summary: string
  summaryBadge?: string
}

// ── dr_001 · Magnolia Farms BFR — Charlotte (Stage 7, active) ──────────────

const MARKET_INTEL_DR001: MarketIntelData = {
  stats: [
    { label: 'Buyers Invited', value: 14 },
    { label: 'Buyers Who Opened Deal Room', value: 3 },
    { label: 'Buyers Who Passed', value: 8 },
    { label: 'Information Requests', value: 7 },
    { label: 'Offers Submitted', value: 0 },
  ],
  passReasons: [
    { reason: 'Pricing', count: 3, pct: 37.5 },
    { reason: 'Strategy Fit', count: 2, pct: 25 },
    { reason: 'Location', count: 1, pct: 12.5 },
    { reason: 'Need More Information', count: 1, pct: 12.5 },
    { reason: 'Other', count: 1, pct: 12.5 },
  ],
  summary: 'Early buyer activity is positive. 3 of 14 invited buyers converted to seated — a healthy conversion rate for this price range. The primary friction point is pricing: 3 of 8 pass reasons cited pricing as the barrier. DS note: The $14M–$18M range may be slightly above where initial demand is concentrating. Recommend holding current range through the first offer round before advising seller on adjustment.',
  summaryBadge: 'DS Authored',
}

// ── dr_002 · Triangle SFR Portfolio — Raleigh (Stage 3, active) ────────────

const MARKET_INTEL_DR002: MarketIntelData = {
  stats: [
    { label: 'Buyers Invited', value: 0 },
    { label: 'Buyers Who Opened Deal Room', value: 0 },
    { label: 'Buyers Who Passed', value: 0 },
    { label: 'Information Requests', value: 0 },
    { label: 'Offers Submitted', value: 0 },
  ],
  passReasons: [],
  summary: 'Buyer outreach has not yet begun. The deal is in Stage 3 (document collection). 11 potential buyer matches have been identified in the pool. Outreach will begin once required documents are uploaded and the analyst memo is finalized. No market signal available yet.',
}

// ── dr_005 · Brookside MF — Nashville (Stage 7, market_tested) ─────────────

const MARKET_INTEL_DR005: MarketIntelData = {
  stats: [
    { label: 'Buyers Invited', value: 18 },
    { label: 'Buyers Who Opened Deal Room', value: 5 },
    { label: 'Buyers Who Passed', value: 4 },
    { label: 'Information Requests', value: 12 },
    { label: 'Offers Submitted', value: 0 },
  ],
  passReasons: [
    { reason: 'Pricing', count: 2, pct: 50 },
    { reason: 'Cap Rate', count: 1, pct: 25 },
    { reason: 'Deferred Maintenance', count: 1, pct: 25 },
  ],
  summary: 'Market testing complete. 5 of 18 invited buyers engaged, with 4 passing and zero offers received. Pricing was the dominant concern — 2 of 4 pass reasons cited the $22.5M ask as above market for stabilized multifamily in the Nashville corridor. Cap rate and deferred maintenance were secondary factors. Full buyer pool exhausted with no viable offer path. DS recommendation: consider a 5–8% price reduction to reactivate buyer interest if relisting.',
  summaryBadge: 'DS Authored',
}

export const MOCK_MARKET_INTEL: Record<string, MarketIntelData> = {
  dr_001: MARKET_INTEL_DR001,
  dr_002: MARKET_INTEL_DR002,
  dr_005: MARKET_INTEL_DR005,
}
