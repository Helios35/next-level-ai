import type { DealRoomStatus } from '@shared/types/enums'

// Shared label maps used across internal role overviews and pipeline views.

export const STAGE_LABELS: Record<number, string> = {
  1: 'Intake',
  2: 'Submission',
  3: 'QA Review',
  4: 'Financial Analysis',
  5: 'Decision Point',
  6: 'Coming Soon',
  7: 'Active Disposition',
  8: 'Offer Negotiation',
  9: 'Accepted Offer',
}

export const STATUS_LABELS: Record<DealRoomStatus, string> = {
  active: 'Active',
  market_tested: 'Market Tested',
  dormant: 'Dormant',
  closed: 'Closed',
  withdrawn: 'Withdrawn',
  draft: 'Draft',
}

// Order in which statuses are displayed in the pipeline snapshot
export const STATUS_DISPLAY_ORDER: DealRoomStatus[] = [
  'active',
  'market_tested',
  'dormant',
  'closed',
  'withdrawn',
]
