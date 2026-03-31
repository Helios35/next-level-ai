import type { DealRoomStage } from '@shared/types/enums'

export interface MilestoneItem {
  stage: DealRoomStage
  status: 'complete' | 'current' | 'upcoming'
  date?: string
}

// Post-acceptance milestones are the same for every deal
export const POST_ACCEPTANCE_LABELS = [
  'PSA Executed',
  'Earnest Money Received',
  'Due Diligence Complete',
  'Financing Confirmed',
  'Closed',
]

// ── dr_001 · Magnolia Farms BFR — Charlotte (Stage 7, active) ──────────────

const MILESTONES_DR001: MilestoneItem[] = [
  { stage: 1, status: 'complete', date: 'Jan 16, 2026' },
  { stage: 2, status: 'complete', date: 'Jan 22, 2026' },
  { stage: 3, status: 'complete', date: 'Jan 24, 2026' },
  { stage: 4, status: 'complete', date: 'Jan 27, 2026' },
  { stage: 5, status: 'complete', date: 'Jan 29, 2026' },
  { stage: 6, status: 'complete', date: 'Feb 3, 2026' },
  { stage: 7, status: 'current', date: 'Started Feb 3, 2026' },
  { stage: 8, status: 'upcoming' },
  { stage: 9, status: 'upcoming' },
]

// ── dr_002 · Triangle SFR Portfolio — Raleigh (Stage 3, active) ────────────

const MILESTONES_DR002: MilestoneItem[] = [
  { stage: 1, status: 'complete', date: 'Feb 8, 2026' },
  { stage: 2, status: 'complete', date: 'Feb 18, 2026' },
  { stage: 3, status: 'current', date: 'Started Feb 18, 2026' },
  { stage: 4, status: 'upcoming' },
  { stage: 5, status: 'upcoming' },
  { stage: 6, status: 'upcoming' },
  { stage: 7, status: 'upcoming' },
  { stage: 8, status: 'upcoming' },
  { stage: 9, status: 'upcoming' },
]

// ── dr_005 · Brookside MF — Nashville (Stage 7, market_tested) ─────────────

const MILESTONES_DR005: MilestoneItem[] = [
  { stage: 1, status: 'complete', date: 'Jan 3, 2026' },
  { stage: 2, status: 'complete', date: 'Jan 10, 2026' },
  { stage: 3, status: 'complete', date: 'Jan 13, 2026' },
  { stage: 4, status: 'complete', date: 'Jan 16, 2026' },
  { stage: 5, status: 'complete', date: 'Jan 18, 2026' },
  { stage: 6, status: 'complete', date: 'Jan 22, 2026' },
  { stage: 7, status: 'current', date: 'Started Jan 22, 2026' },
  { stage: 8, status: 'upcoming' },
  { stage: 9, status: 'upcoming' },
]

export const MOCK_MILESTONES: Record<string, MilestoneItem[]> = {
  dr_001: MILESTONES_DR001,
  dr_002: MILESTONES_DR002,
  dr_005: MILESTONES_DR005,
}
