import type { DocumentType } from '@shared/types/document'
import type { AssetSubType, DealStage, PricingPosture, PriceRange } from '@shared/types/enums'

export interface BuyerActivitySnapshot {
  totalViews: number
  acceptedRequests: number
  offersReceived: number
  lastActivityAt: string
}

export interface DocumentUploadItem {
  type: DocumentType
  label: string
  required: boolean
  status: 'not_started' | 'uploaded' | 'under_review' | 'approved' | 'flagged'
  fileName?: string
  uploadedAt?: string
}

export interface DealPreviewBuyer {
  assetSubType: AssetSubType
  geography: string
  dealStage: DealStage
  matchScore: number
  pricingPosture: PricingPosture
  priceRange?: PriceRange
  seatStatus: string
  accessRequestedAt?: string
}

export interface DealPreviewSeller {
  buyerActivity: BuyerActivitySnapshot
  documents: DocumentUploadItem[]
}

export const MOCK_DEAL_PREVIEW_SELLER: Record<string, DealPreviewSeller> = {
  dr_001: {
    buyerActivity: {
      totalViews: 47,
      acceptedRequests: 2,
      offersReceived: 1,
      lastActivityAt: '2026-03-28T14:30:00Z',
    },
    documents: [
      { type: 'property_spreadsheet', label: 'Property Spreadsheet', required: true, status: 'approved', fileName: 'magnolia-farms-details.xlsx', uploadedAt: '2026-01-20T10:00:00Z' },
      { type: 't12', label: 'T-12 Statement', required: true, status: 'uploaded', fileName: 'magnolia-t12-2025.pdf', uploadedAt: '2026-02-15T09:00:00Z' },
      { type: 'rent_roll', label: 'Rent Roll', required: true, status: 'under_review', fileName: 'magnolia-rent-roll.xlsx', uploadedAt: '2026-02-20T11:00:00Z' },
      { type: 'pro_forma', label: 'Pro Forma', required: true, status: 'not_started' },
      { type: 'site_plan', label: 'Site Plan', required: false, status: 'approved', fileName: 'magnolia-site-plan.pdf', uploadedAt: '2026-01-22T14:00:00Z' },
      { type: 'construction_schedule', label: 'Construction Schedule', required: false, status: 'uploaded', fileName: 'magnolia-construction.pdf', uploadedAt: '2026-02-10T16:00:00Z' },
    ],
  },
  dr_002: {
    buyerActivity: {
      totalViews: 23,
      acceptedRequests: 0,
      offersReceived: 0,
      lastActivityAt: '2026-03-25T09:15:00Z',
    },
    documents: [
      { type: 'property_spreadsheet', label: 'Property Spreadsheet', required: true, status: 'uploaded', fileName: 'triangle-sfr-details.xlsx', uploadedAt: '2026-02-12T10:00:00Z' },
      { type: 'rent_roll', label: 'Rent Roll', required: true, status: 'approved', fileName: 'triangle-rent-roll.xlsx', uploadedAt: '2026-02-14T11:00:00Z' },
      { type: 't12', label: 'T-12 Statement', required: true, status: 'not_started' },
      { type: 'insurance_summary', label: 'Insurance Summary', required: false, status: 'not_started' },
    ],
  },
  dr_005: {
    buyerActivity: {
      totalViews: 62,
      acceptedRequests: 3,
      offersReceived: 0,
      lastActivityAt: '2026-03-29T16:45:00Z',
    },
    documents: [
      { type: 'property_spreadsheet', label: 'Property Spreadsheet', required: true, status: 'approved', fileName: 'brookside-details.xlsx', uploadedAt: '2026-01-08T10:00:00Z' },
      { type: 't12', label: 'T-12 Statement', required: true, status: 'approved', fileName: 'brookside-t12.pdf', uploadedAt: '2026-01-10T09:00:00Z' },
      { type: 'rent_roll', label: 'Rent Roll', required: true, status: 'approved', fileName: 'brookside-rent-roll.xlsx', uploadedAt: '2026-01-10T11:00:00Z' },
      { type: 'pro_forma', label: 'Pro Forma', required: true, status: 'approved', fileName: 'brookside-pro-forma.xlsx', uploadedAt: '2026-01-12T14:00:00Z' },
      { type: 'sample_lease', label: 'Sample Lease', required: false, status: 'flagged', fileName: 'brookside-lease-sample.pdf', uploadedAt: '2026-01-15T10:00:00Z' },
    ],
  },
  dr_006: {
    buyerActivity: {
      totalViews: 8,
      acceptedRequests: 0,
      offersReceived: 0,
      lastActivityAt: '2026-02-05T11:00:00Z',
    },
    documents: [
      { type: 'site_plan', label: 'Site Plan', required: true, status: 'uploaded', fileName: 'sunridge-site-plan.pdf', uploadedAt: '2026-01-22T10:00:00Z' },
      { type: 'property_spreadsheet', label: 'Property Spreadsheet', required: true, status: 'not_started' },
      { type: 'pro_forma', label: 'Pro Forma', required: false, status: 'not_started' },
    ],
  },
}

// ── Buyer-side deal previews ───────────────────────────────────────────────
// Price is always blurred in buyer view; seatStatus reflects buyer's position

export const MOCK_DEAL_PREVIEW_BUYER: Record<string, DealPreviewBuyer> = {
  dr_001: {
    assetSubType: 'build_for_rent',
    geography: 'Charlotte-Concord-Gastonia, NC-SC',
    dealStage: 'lease_up',
    matchScore: 91,
    pricingPosture: 'price_range',
    priceRange: { min: 14000000, max: 18000000 },
    seatStatus: 'seated',
    accessRequestedAt: '2026-02-01T09:00:00Z',
  },
  dr_002: {
    assetSubType: 'sfr_portfolio',
    geography: 'Raleigh-Cary, NC',
    dealStage: 'stabilized',
    matchScore: 78,
    pricingPosture: 'price_range',
    priceRange: { min: 6500000, max: 9000000 },
    seatStatus: 'accepted',
    accessRequestedAt: '2026-02-20T14:00:00Z',
  },
  dr_005: {
    assetSubType: 'multifamily',
    geography: 'Nashville-Davidson-Murfreesboro-Franklin, TN',
    dealStage: 'stabilized',
    matchScore: 68,
    pricingPosture: 'exact_price',
    seatStatus: 'passed',
  },
}
