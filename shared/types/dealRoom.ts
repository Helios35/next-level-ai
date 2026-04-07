import type {
  AssetType, AssetSubType, DealStage, PricingPosture,
  DealRoomStage, DealRoomStatus, Geography, PriceRange,
} from './enums'

export type SaleWindow = 'immediate' | '3_6_months' | '6_12_months' | '12_plus_months'

export type PortfolioType = 'clustered' | 'scattered' | 'mixed'

export type BFRProductType = 'detached' | 'townhomes' | 'duplexes' | 'mixed'

export type DevelopmentStatus =
  | 'vertical_under_construction'
  | 'vertical_substantially_complete'
  | 'delivered_co_in_process'
  | 'delivered_co_complete'
  | 'lease_up_underway'
  | 'stabilized_operations'
  | 'raw_no_submission'
  | 'concept_plan_prepared'
  | 'submitted_for_entitlement'
  | 'entitled_approved'
  | 'recorded_platted'
  | 'horizontal_under_construction'
  | 'horizontals_complete'

export type MFDeferredMaintenance = 'none' | 'light' | 'moderate' | 'heavy'

export interface DealRoomSharedCriteria {
  assetType: AssetType
  assetSubType: AssetSubType
  geography: Geography
  currentDevelopmentStatus: DevelopmentStatus
  pricingPosture: PricingPosture
  priceRange?: PriceRange
  exactPrice?: number
}

export interface UniqueCriteria_SFR {
  mustSellAsPackage: boolean
  portfolioType: PortfolioType
  saleWindow: SaleWindow
  unitCount?: number
  occupancyPercent?: number
}

export interface UniqueCriteria_BFR {
  productType: BFRProductType
  saleStageStatus: DealStage
  coStatus?: 'complete' | 'pending' | 'not_applicable' | 'unknown'
  estimatedCompletionDate?: string
  phaseSaleAllowed: boolean
  mustSellAsPackage: boolean
  saleWindow: SaleWindow
  unitCount?: number
}

export interface UniqueCriteria_MF {
  saleStageStatus: DealStage
  mustSellAsPackage: boolean
  deferredMaintenance?: MFDeferredMaintenance
  saleWindow: SaleWindow
  unitCount?: number
}

export interface UniqueCriteria_Land {
  totalAcreage: number
  buildableAcreage: number
  projectedUnitCount: number | 'unknown'
  productTypesAllowed: AssetSubType[]
  sellerIntendedProduct: AssetSubType
  saleStageStatus: DealStage
  estimatedCompletionDate?: string
  utilityWater: 'city' | 'well' | 'unknown'
  utilitySewer: 'city' | 'septic' | 'unknown'
  zoningClassification: string
  mustSellAsPackage: boolean
  phasedTakedownAllowed: boolean
  sellerWillingToStructure: boolean
  saleWindow: SaleWindow
}

export type UniqueCriteria =
  | UniqueCriteria_SFR
  | UniqueCriteria_BFR
  | UniqueCriteria_MF
  | UniqueCriteria_Land

export interface StageTransition {
  fromStage: DealRoomStage
  toStage: DealRoomStage
  actorId: string
  actorRole: 'seller' | 'admin' | 'analyst' | 'ds' | 'system'
  notes?: string
  timestamp: string
}

export interface DealRoom {
  id: string
  sellerId: string
  assetType: AssetType
  assetSubType: AssetSubType
  name: string
  address?: string
  currentStage: DealRoomStage
  status: DealRoomStatus
  shared: DealRoomSharedCriteria
  unique?: UniqueCriteria
  ownershipAcknowledged: boolean
  matchScore: number
  matchedBuyerCount: number
  assignedDSId?: string
  assignedAdminId?: string
  assignedAnalystId?: string
  stageHistory: StageTransition[]
  createdAt: string
  updatedAt: string
}
