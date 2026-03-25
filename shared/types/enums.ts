export type UserRole = 'buyer' | 'seller' | 'both' | 'broker'

export type InternalRole = 'admin' | 'analyst' | 'ds'

export type AssetType = 'residential_income' | 'land'

export type AssetSubType =
  | 'sfr_portfolio'
  | 'build_for_rent'
  | 'multifamily'
  | 'land'

export type DealStage =
  | 'pre_development'
  | 'in_development'
  | 'delivered_vacant'
  | 'lease_up'
  | 'stabilized'

export type PricingPosture = 'exact_price' | 'price_range' | 'needs_guidance'

export type DealRoomStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type DealRoomStatus =
  | 'active'
  | 'market_tested'
  | 'dormant'
  | 'closed'
  | 'withdrawn'

export type StrategyStatus = 'broadcasting' | 'paused' | 'draft'

export type SeatStatus =
  | 'outreach_sent'
  | 'access_requested'
  | 'access_pending'
  | 'seated'
  | 'wait_queue'
  | 'passed'

export type QualificationStatus = 'qualified' | 'not_qualified'

export type OutreachStatus = 'pending' | 'sent' | 'opened' | 'responded' | 'passed'

export type MatchScoreColor = 'green' | 'gold' | 'gray'

export type Geography = {
  msa: string
  cities?: string[]
  zips?: string[]
}

export type PriceRange = {
  min: number
  max: number
}

export type UnitCountRange = {
  min: number
  max: number
}

export type CapRateRange = {
  min: number
  max: number
}

export const getMatchScoreColor = (score: number): MatchScoreColor => {
  if (score >= 80) return 'green'
  if (score >= 50) return 'gold'
  return 'gray'
}
