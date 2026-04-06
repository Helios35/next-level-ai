# NextLevel — Mock Data Schema

> **Version:** 1.2 — Deal Preview Modal
> **Last Updated:** March 2026
> **Audience:** Engineering (Nathan) — Cursor agent context
> **Stack:** React 18 · TypeScript
> **Purpose:** Canonical TypeScript type definitions and mock data instances for all prototype UI entities. All screens are driven by this data. Do not invent new shapes — extend from these.
>
> **Changes from v1.1:**
> - `DealPreviewProps` interface added — Section 16
> - Mock deal preview instances added for buyer and seller contexts — Section 16
>
> **Changes from v1.0:**
> - `DealRoomStatus` type added to enums — `active | market_tested | dormant | closed | withdrawn`
> - `DealRoom` interface updated — `status: DealRoomStatus` field added
> - `BuyerPoolEntry` comment corrected — `aiRankPosition` is 1–3 (was 1–4)
> - `bp_004` corrected from `seated` to `wait_queue` — 3-seat maximum enforced
> - `matchedBuyerCount` corrected to 3 on `dr_001`, `dr_003`, `dr_004` (was 4)
> - `MOCK_SELLER_DEAL_ROOMS` extended with two new examples: `dr_005` (market_tested) and `dr_006` (dormant)
> - Section 15 added: `StatusTransition` type and mock data for DS portal status audit trail

---

## Usage Rules for Cursor Agents

**Where code lives:**
- Types live in `shared/types/` — one file per entity. Both frontend and backend import from here. Never duplicate a type definition inside `frontend/` or `backend/`.
- Mock data lives in `frontend/src/data/mock/` — one file per entity. Frontend-only. Never import mock data in backend code.
- Shared constants (endpoints, status codes) live in `shared/constants/`.
- Shared utility functions (formatting, validation used on both sides) live in `shared/utils/`.
- Frontend-only utility functions live in `frontend/src/utils/`.
- Reusable UI components (used in 2+ pages) live in `frontend/src/components/`.
- Page-level components (one per route, not reusable) live in `frontend/src/pages/`.
- Custom React hooks live in `frontend/src/hooks/`.

**Import rules:**
- Import shared types using the `@shared/types/` path alias.
- Import mock data using the `@/data/mock/` alias (resolves to `frontend/src/data/mock/`).
- Never cross the boundary: frontend components must not import from `backend/`.

**Prototype rules:**
- Import mock data directly into components — no API calls in prototype.
- Never modify type shapes mid-session without updating this document.
- When a screen needs data not covered here, flag it — do not invent a new shape.
- Follow the decision tree: Is it used in 2+ places? → `shared/` or `frontend/src/utils/`. Is it React-specific? → `frontend/src/hooks/`. Is it a standalone function? → `frontend/src/utils/`.

---

## 1. Shared Enums & Constants

```typescript
// shared/types/enums.ts

export type UserRole = 'buyer' | 'seller' | 'both' | 'broker';

export type InternalRole = 'admin' | 'analyst' | 'ds';

export type AssetType = 'residential_income' | 'land';

export type AssetSubType =
  | 'sfr_portfolio'
  | 'build_for_rent'
  | 'multifamily'
  | 'land';

export type DealStage =
  | 'pre_development'
  | 'in_development'
  | 'delivered_vacant'
  | 'lease_up'
  | 'stabilized';

export type PricingPosture = 'exact_price' | 'price_range' | 'needs_guidance';

export type DealRoomStage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// Operational status of a deal room — separate from stage.
// Stage = where in the lifecycle. Status = is it active, paused, or terminal.
export type DealRoomStatus =
  | 'active'         // progressing through 9-stage lifecycle
  | 'market_tested'  // all 3 seats exhausted, no offers received, full buyer pool passed
  | 'dormant'        // paused — stalled docs (21-day rule), seller pause, or post-market-tested inaction
  | 'closed'         // Stage 9 accepted offer confirmed
  | 'withdrawn';     // seller withdrew deal

export type StrategyStatus = 'broadcasting' | 'paused' | 'draft';

export type SeatStatus =
  | 'outreach_sent'
  | 'access_requested'
  | 'access_pending'
  | 'seated'
  | 'wait_queue'
  | 'passed';

export type QualificationStatus = 'qualified' | 'not_qualified';

export type OutreachStatus = 'pending' | 'sent' | 'opened' | 'responded' | 'passed';

export type MatchScoreColor = 'green' | 'gold' | 'gray';

export type Geography = {
  msa: string;
  cities?: string[];
  zips?: string[];
};

export type PriceRange = {
  min: number;
  max: number;
};

export type UnitCountRange = {
  min: number;
  max: number;
};

export type CapRateRange = {
  min: number; // percentage e.g. 5.0
  max: number;
};

// Helper
export const getMatchScoreColor = (score: number): MatchScoreColor => {
  if (score >= 80) return 'green';
  if (score >= 50) return 'gold';
  return 'gray';
};
```

---

## 2. User

```typescript
// shared/types/user.ts

export interface User {
  id: string;
  name: string;
  email: string;
  company: string;
  role: UserRole;
  brokerFlag: boolean;         // stored silently — no effect on V1 UX
  phone?: string;
  location?: string;
  avatarInitials: string;      // derived from name e.g. "NI"
  qualificationComplete: boolean;
  createdAt: string;           // ISO date string
}

export interface BuyerPerformance {
  dealRoomsAccessed: number;
  offersMade: number;
  dealsWon: number;
}

export interface SellerPerformance {
  dealRoomsOpen: number;
  disposStarted: number;
  dealsCanceled: number;
  dealsClosed: number;
}
```

```typescript
// frontend/src/data/mock/users.ts

import { User, BuyerPerformance, SellerPerformance } from '@/types/user';

export const MOCK_CURRENT_USER: User = {
  id: 'user_001',
  name: 'Marcus Webb',
  email: 'marcus.webb@trianglecap.com',
  company: 'Triangle Capital Group',
  role: 'both',
  brokerFlag: false,
  phone: '(704) 555-0192',
  location: 'Charlotte, NC',
  avatarInitials: 'MW',
  qualificationComplete: true,
  createdAt: '2026-01-14T10:00:00Z',
};

export const MOCK_BUYER_PERFORMANCE: BuyerPerformance = {
  dealRoomsAccessed: 4,
  offersMade: 2,
  dealsWon: 1,
};

export const MOCK_SELLER_PERFORMANCE: SellerPerformance = {
  dealRoomsOpen: 2,
  disposStarted: 1,
  dealsCanceled: 0,
  dealsClosed: 1,
};
```

---

## 3. Buyer Qualification

```typescript
// shared/types/qualification.ts

export type EquitySource =
  | 'personal_balance_sheet'
  | 'captive_fund'
  | 'institutional_pe'
  | 'syndication_lp'
  | 'public_syndication'
  | 'other';

export type EquityCheckSize =
  | 'under_1m'
  | '1m_5m'
  | '5m_15m'
  | '15m_50m'
  | '50m_plus';

export type EquityTimeline =
  | 'not_required'
  | 'under_2_weeks'
  | '2_4_weeks'
  | '4_8_weeks'
  | '8_12_weeks'
  | '12_plus_weeks'
  | 'deal_dependent';

export type DebtSource =
  | 'established_bank'
  | 'debt_fund'
  | 'agency'
  | 'deal_by_deal'
  | 'not_used'
  | 'other';

export type DebtReadiness =
  | 'active_credit_facility'
  | 'established_relationships'
  | 'deal_by_deal'
  | 'not_used'
  | 'other';

export type DecisionAuthority =
  | 'sole_decision_maker'
  | 'partner_group'
  | 'investment_committee'
  | 'capital_partner'
  | 'other';

export type ApprovalTimeline =
  | 'same_day'
  | '1_3_days'
  | '4_7_days'
  | '1_2_weeks'
  | '2_4_weeks'
  | '4_plus_weeks'
  | 'deal_dependent';

export type ApprovalStage =
  | 'no_formal_approval'
  | 'pre_loi'
  | 'pre_contract'
  | 'during_due_diligence'
  | 'varies'
  | 'other';

export type TransactionVolume =
  | 'no_prior'
  | 'under_10m'
  | '10m_50m'
  | '50m_250m'
  | '250m_1b'
  | '1b_plus';

export type AcquisitionCount =
  | '0'
  | '1_2'
  | '3_10'
  | '11_25'
  | '26_50'
  | '50_plus';

export type ActiveRegion =
  | 'southeast'
  | 'mid_atlantic'
  | 'northeast'
  | 'midwest'
  | 'texas'
  | 'mountain_west'
  | 'west_coast'
  | 'national'
  | 'other';

export interface BuyerQualification {
  userId: string;
  // A. Capital Source
  equitySource: EquitySource;
  equityCheckSize: EquityCheckSize;
  equityTimeline: EquityTimeline;
  debtSource: DebtSource;
  debtReadiness: DebtReadiness;
  // B. Approval Process
  decisionAuthority: DecisionAuthority;
  approvalTimeline: ApprovalTimeline;
  approvalStage: ApprovalStage;
  // C. Experience
  transactionVolume: TransactionVolume;
  acquisitionCount: AcquisitionCount;
  assetTypesAcquired: AssetSubType[];
  activeRegions: ActiveRegion[];
  completedAt: string;
}
```

```typescript
// frontend/src/data/mock/qualifications.ts

import { BuyerQualification } from '@/types/qualification';

export const MOCK_QUALIFICATION: BuyerQualification = {
  userId: 'user_001',
  equitySource: 'captive_fund',
  equityCheckSize: '5m_15m',
  equityTimeline: 'under_2_weeks',
  debtSource: 'established_bank',
  debtReadiness: 'active_credit_facility',
  decisionAuthority: 'sole_decision_maker',
  approvalTimeline: '1_3_days',
  approvalStage: 'pre_loi',
  transactionVolume: '50m_250m',
  acquisitionCount: '11_25',
  assetTypesAcquired: ['build_for_rent', 'sfr_portfolio'],
  activeRegions: ['southeast', 'mid_atlantic'],
  completedAt: '2026-01-15T14:00:00Z',
};
```

---

## 4. Buy Strategy

```typescript
// shared/types/strategy.ts

import {
  AssetType, AssetSubType, DealStage, PricingPosture,
  StrategyStatus, Geography, PriceRange, UnitCountRange, CapRateRange
} from './enums';

export interface SharedDealCriteria {
  assetType: AssetType;
  assetSubType: AssetSubType;
  geography: Geography[];
  dealStages: DealStage[];
  pricingPosture: PricingPosture;
  priceRange?: PriceRange;         // populated when pricingPosture !== 'needs_guidance'
}

// Tier 1 — hard matching, required
export interface UniqueCriteriaTier1 {
  equityCheckSize: PriceRange;     // in dollars e.g. { min: 5000000, max: 15000000 }
  unitCountRange: UnitCountRange;
  capRateRange?: CapRateRange;     // not applicable for Land
  landProductTypes?: AssetSubType[]; // Land only
  landUnitCountRange?: UnitCountRange; // Land only
}

// Tier 2 — refinement, never blocks visibility
export interface UniqueCriteriaTier2_SFR {
  hoaTolerance?: 'none' | 'limited' | 'any';
  septicTolerance?: 'none' | 'any';
  section8Tolerance?: 'none' | 'limited' | 'any';
  vintageMin?: number;
  garageTolerance?: 'required' | 'preferred' | 'no_preference';
}

export interface UniqueCriteriaTier2_BFR {
  productMixPreference?: ('detached' | 'townhomes' | 'duplex' | 'mixed')[];
  leaseUpRiskAppetite?: 'light' | 'moderate' | 'heavy';
  targetPricePerUnit?: PriceRange;
  garagePreference?: 'required' | 'preferred' | 'no_preference';
  amenityRequirements?: ('pool' | 'clubhouse' | 'fitness' | 'none')[];
}

export interface UniqueCriteriaTier2_MF {
  vintageMin?: number;
  valueAddTolerance?: 'core' | 'light' | 'moderate' | 'heavy';
}

export interface UniqueCriteriaTier2_Land {
  targetBasisPerLot?: PriceRange;
  targetBasisPerAcre?: PriceRange;
  minDensityUnitsPerAcre?: number;
  requiredEntitlementDepth?: 'raw_ok' | 'submitted_ok' | 'approved_required' | 'recorded_required';
  requiredDevelopmentDepth?: 'raw_only' | 'entitled' | 'horizontal_underway' | 'finished_lots_only';
  phasedTakedownPreference?: 'required' | 'preferred' | 'not_needed';
}

export type UniqueCriteriaTier2 =
  | UniqueCriteriaTier2_SFR
  | UniqueCriteriaTier2_BFR
  | UniqueCriteriaTier2_MF
  | UniqueCriteriaTier2_Land;

export interface BuyStrategy {
  id: string;
  userId: string;
  name: string;
  status: StrategyStatus;
  shared: SharedDealCriteria;
  tier1: UniqueCriteriaTier1;
  tier2?: UniqueCriteriaTier2;
  matchScore: number;            // 0–100
  activeMatchCount: number;
  matchGrowthPercent: number;    // e.g. 12 = +12%
  lastActivity: string;          // ISO date string
  createdAt: string;
}
```

```typescript
// frontend/src/data/mock/strategies.ts

import { BuyStrategy } from '@/types/strategy';

export const MOCK_STRATEGIES: BuyStrategy[] = [
  {
    id: 'strat_001',
    userId: 'user_001',
    name: 'Carolinas BFR — Lease-Up',
    status: 'broadcasting',
    shared: {
      assetType: 'residential_income',
      assetSubType: 'build_for_rent',
      geography: [{ msa: 'Charlotte-Concord-Gastonia, NC-SC' }, { msa: 'Raleigh-Cary, NC' }],
      dealStages: ['lease_up', 'stabilized'],
      pricingPosture: 'price_range',
      priceRange: { min: 8000000, max: 25000000 },
    },
    tier1: {
      equityCheckSize: { min: 3000000, max: 10000000 },
      unitCountRange: { min: 40, max: 150 },
      capRateRange: { min: 4.5, max: 6.5 },
    },
    tier2: {
      leaseUpRiskAppetite: 'moderate',
      garagePreference: 'preferred',
      amenityRequirements: ['pool', 'fitness'],
    },
    matchScore: 87,
    activeMatchCount: 14,
    matchGrowthPercent: 18,
    lastActivity: '2026-03-01T09:30:00Z',
    createdAt: '2026-01-20T11:00:00Z',
  },
  {
    id: 'strat_002',
    userId: 'user_001',
    name: 'Southeast SFR Portfolio',
    status: 'broadcasting',
    shared: {
      assetType: 'residential_income',
      assetSubType: 'sfr_portfolio',
      geography: [{ msa: 'Atlanta-Sandy Springs-Alpharetta, GA' }, { msa: 'Tampa-St. Petersburg-Clearwater, FL' }],
      dealStages: ['stabilized'],
      pricingPosture: 'price_range',
      priceRange: { min: 5000000, max: 20000000 },
    },
    tier1: {
      equityCheckSize: { min: 2000000, max: 8000000 },
      unitCountRange: { min: 20, max: 100 },
      capRateRange: { min: 5.0, max: 7.0 },
    },
    tier2: {
      hoaTolerance: 'limited',
      septicTolerance: 'none',
      section8Tolerance: 'none',
      vintageMin: 2005,
    },
    matchScore: 74,
    activeMatchCount: 9,
    matchGrowthPercent: 7,
    lastActivity: '2026-02-28T16:00:00Z',
    createdAt: '2026-02-01T09:00:00Z',
  },
  {
    id: 'strat_003',
    userId: 'user_001',
    name: 'Phoenix Land — Entitled',
    status: 'paused',
    shared: {
      assetType: 'land',
      assetSubType: 'land',
      geography: [{ msa: 'Phoenix-Mesa-Chandler, AZ' }],
      dealStages: ['pre_development', 'in_development'],
      pricingPosture: 'price_range',
      priceRange: { min: 3000000, max: 12000000 },
    },
    tier1: {
      equityCheckSize: { min: 2000000, max: 6000000 },
      unitCountRange: { min: 50, max: 250 },
      landProductTypes: ['build_for_rent'],
      landUnitCountRange: { min: 50, max: 250 },
    },
    tier2: {
      requiredEntitlementDepth: 'approved_required',
      phasedTakedownPreference: 'preferred',
    },
    matchScore: 61,
    activeMatchCount: 4,
    matchGrowthPercent: 3,
    lastActivity: '2026-02-20T14:00:00Z',
    createdAt: '2026-02-10T10:00:00Z',
  },
];
```

---

## 5. Deal Room

```typescript
// shared/types/dealRoom.ts

import {
  AssetType, AssetSubType, DealStage, PricingPosture,
  DealRoomStage, DealRoomStatus, Geography, PriceRange
} from './enums';

export type SaleWindow = 'immediate' | '3_6_months' | '6_12_months' | '12_plus_months';

export type PortfolioType = 'clustered' | 'scattered' | 'mixed';

export type BFRProductType = 'detached' | 'townhomes' | 'duplexes' | 'mixed';

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
  | 'horizontals_complete';

export type MFDeferredMaintenance = 'none' | 'light' | 'moderate' | 'heavy';

export interface DealRoomSharedCriteria {
  assetType: AssetType;
  assetSubType: AssetSubType;
  geography: Geography;
  dealStage: DealStage;
  pricingPosture: PricingPosture;
  priceRange?: PriceRange;
  exactPrice?: number;
}

// Asset-specific Unique Deal Criteria
export interface UniqueCriteria_SFR {
  mustSellAsPackage: boolean;
  portfolioType: PortfolioType;
  saleWindow: SaleWindow;
  // system-derived from spreadsheet upload
  unitCount?: number;
  occupancyPercent?: number;
}

export interface UniqueCriteria_BFR {
  productType: BFRProductType;
  saleStageStatus: DealStage;
  currentDevelopmentStatus: DevelopmentStatus;
  coStatus?: 'complete' | 'pending' | 'not_applicable' | 'unknown';
  estimatedCompletionDate?: string;
  phaseSaleAllowed: boolean;
  mustSellAsPackage: boolean;
  saleWindow: SaleWindow;
  unitCount?: number;
}

export interface UniqueCriteria_MF {
  saleStageStatus: DealStage;
  mustSellAsPackage: boolean;
  deferredMaintenance?: MFDeferredMaintenance;
  saleWindow: SaleWindow;
  unitCount?: number;
}

export interface UniqueCriteria_Land {
  totalAcreage: number;
  buildableAcreage: number;
  projectedUnitCount: number | 'unknown';
  productTypesAllowed: AssetSubType[];
  sellerIntendedProduct: AssetSubType;
  currentDevelopmentStatus: DevelopmentStatus;
  saleStageStatus: DealStage;
  estimatedCompletionDate?: string;
  utilityWater: 'city' | 'well' | 'unknown';
  utilitySewer: 'city' | 'septic' | 'unknown';
  zoningClassification: string;
  mustSellAsPackage: boolean;
  phasedTakedownAllowed: boolean;
  sellerWillingToStructure: boolean;
  saleWindow: SaleWindow;
}

export type UniqueCriteria =
  | UniqueCriteria_SFR
  | UniqueCriteria_BFR
  | UniqueCriteria_MF
  | UniqueCriteria_Land;

export interface StageTransition {
  fromStage: DealRoomStage;
  toStage: DealRoomStage;
  actorId: string;
  actorRole: 'seller' | 'admin' | 'analyst' | 'ds' | 'system';
  notes?: string;         // required for returns (toStage < fromStage)
  timestamp: string;
}

export interface DealRoom {
  id: string;
  sellerId: string;
  assetType: AssetType;
  assetSubType: AssetSubType;
  name: string;               // display name e.g. "Magnolia Farms BFR — Charlotte"
  address?: string;
  currentStage: DealRoomStage;
  status: DealRoomStatus;     // operational state — separate from stage
  shared: DealRoomSharedCriteria;
  unique?: UniqueCriteria;    // undefined until Stage 2 complete
  ownershipAcknowledged: boolean;
  matchScore: number;
  matchedBuyerCount: number;
  assignedDSId?: string;
  assignedAdminId?: string;
  assignedAnalystId?: string;
  stageHistory: StageTransition[];
  createdAt: string;
  updatedAt: string;
}
```

```typescript
// frontend/src/data/mock/dealRooms.ts

import { DealRoom } from '@/types/dealRoom';

export const MOCK_SELLER_DEAL_ROOMS: DealRoom[] = [
  {
    id: 'dr_001',
    sellerId: 'user_001',
    assetType: 'residential_income',
    assetSubType: 'build_for_rent',
    name: 'Magnolia Farms BFR — Charlotte',
    address: 'Cabarrus County, NC',
    currentStage: 7,
    status: 'active',
    shared: {
      assetType: 'residential_income',
      assetSubType: 'build_for_rent',
      geography: { msa: 'Charlotte-Concord-Gastonia, NC-SC', cities: ['Concord'] },
      dealStage: 'lease_up',
      pricingPosture: 'price_range',
      priceRange: { min: 14000000, max: 18000000 },
    },
    unique: {
      productType: 'detached',
      saleStageStatus: 'lease_up',
      currentDevelopmentStatus: 'lease_up_underway',
      phaseSaleAllowed: false,
      mustSellAsPackage: true,
      saleWindow: 'immediate',
      unitCount: 72,
    },
    ownershipAcknowledged: true,
    matchScore: 91,
    matchedBuyerCount: 3,
    assignedDSId: 'internal_001',
    assignedAdminId: 'internal_002',
    assignedAnalystId: 'internal_003',
    stageHistory: [
      { fromStage: 1, toStage: 2, actorId: 'user_001', actorRole: 'seller', timestamp: '2026-01-18T10:00:00Z' },
      { fromStage: 2, toStage: 3, actorId: 'user_001', actorRole: 'seller', timestamp: '2026-01-22T14:00:00Z' },
      { fromStage: 3, toStage: 4, actorId: 'internal_002', actorRole: 'admin', timestamp: '2026-01-24T11:00:00Z' },
      { fromStage: 4, toStage: 5, actorId: 'internal_003', actorRole: 'analyst', timestamp: '2026-01-27T16:00:00Z' },
      { fromStage: 5, toStage: 6, actorId: 'user_001', actorRole: 'seller', timestamp: '2026-01-29T10:00:00Z' },
      { fromStage: 6, toStage: 7, actorId: 'internal_001', actorRole: 'ds', timestamp: '2026-02-03T09:00:00Z' },
    ],
    createdAt: '2026-01-16T10:00:00Z',
    updatedAt: '2026-03-01T09:00:00Z',
  },
  {
    id: 'dr_002',
    sellerId: 'user_001',
    assetType: 'residential_income',
    assetSubType: 'sfr_portfolio',
    name: 'Triangle SFR Portfolio — Raleigh',
    address: 'Wake County, NC',
    currentStage: 3,
    status: 'active',
    shared: {
      assetType: 'residential_income',
      assetSubType: 'sfr_portfolio',
      geography: { msa: 'Raleigh-Cary, NC' },
      dealStage: 'stabilized',
      pricingPosture: 'price_range',
      priceRange: { min: 6500000, max: 9000000 },
    },
    unique: {
      mustSellAsPackage: true,
      portfolioType: 'scattered',
      saleWindow: '3_6_months',
      unitCount: 34,
      occupancyPercent: 96,
    },
    ownershipAcknowledged: true,
    matchScore: 78,
    matchedBuyerCount: 11,
    assignedDSId: 'internal_001',
    assignedAdminId: 'internal_002',
    stageHistory: [
      { fromStage: 1, toStage: 2, actorId: 'user_001', actorRole: 'seller', timestamp: '2026-02-10T10:00:00Z' },
      { fromStage: 2, toStage: 3, actorId: 'user_001', actorRole: 'seller', timestamp: '2026-02-18T15:00:00Z' },
    ],
    createdAt: '2026-02-08T10:00:00Z',
    updatedAt: '2026-02-28T14:00:00Z',
  },
  // Market Tested example — all 3 seats exhausted, no offers received, awaiting seller decision
  {
    id: 'dr_005',
    sellerId: 'user_001',
    assetType: 'residential_income',
    assetSubType: 'multifamily',
    name: 'Brookside MF — Nashville',
    address: 'Davidson County, TN',
    currentStage: 7,
    status: 'market_tested',
    shared: {
      assetType: 'residential_income',
      assetSubType: 'multifamily',
      geography: { msa: 'Nashville-Davidson-Murfreesboro-Franklin, TN' },
      dealStage: 'stabilized',
      pricingPosture: 'exact_price',
      exactPrice: 22500000,
    },
    unique: {
      saleStageStatus: 'stabilized',
      mustSellAsPackage: true,
      deferredMaintenance: 'light',
      saleWindow: '3_6_months',
      unitCount: 96,
    },
    ownershipAcknowledged: true,
    matchScore: 68,
    matchedBuyerCount: 3,
    assignedDSId: 'internal_001',
    assignedAdminId: 'internal_002',
    assignedAnalystId: 'internal_003',
    stageHistory: [
      { fromStage: 1, toStage: 2, actorId: 'user_009', actorRole: 'seller', timestamp: '2026-01-05T10:00:00Z' },
      { fromStage: 2, toStage: 3, actorId: 'user_009', actorRole: 'seller', timestamp: '2026-01-10T14:00:00Z' },
      { fromStage: 3, toStage: 4, actorId: 'internal_002', actorRole: 'admin', timestamp: '2026-01-13T11:00:00Z' },
      { fromStage: 4, toStage: 5, actorId: 'internal_003', actorRole: 'analyst', timestamp: '2026-01-16T16:00:00Z' },
      { fromStage: 5, toStage: 6, actorId: 'user_009', actorRole: 'seller', timestamp: '2026-01-18T10:00:00Z' },
      { fromStage: 6, toStage: 7, actorId: 'internal_001', actorRole: 'ds', timestamp: '2026-01-22T09:00:00Z' },
    ],
    createdAt: '2026-01-03T10:00:00Z',
    updatedAt: '2026-02-28T11:00:00Z',
  },
  // Dormant example — seller stalled on document collection past 21-day window
  {
    id: 'dr_006',
    sellerId: 'user_001',
    assetType: 'land',
    assetSubType: 'land',
    name: 'Sunridge Land — Austin',
    address: 'Travis County, TX',
    currentStage: 2,
    status: 'dormant',
    shared: {
      assetType: 'land',
      assetSubType: 'land',
      geography: { msa: 'Austin-Round Rock-Georgetown, TX' },
      dealStage: 'pre_development',
      pricingPosture: 'price_range',
      priceRange: { min: 4500000, max: 7000000 },
    },
    ownershipAcknowledged: true,
    matchScore: 55,
    matchedBuyerCount: 8,
    assignedDSId: 'internal_001',
    assignedAdminId: 'internal_002',
    stageHistory: [
      { fromStage: 1, toStage: 2, actorId: 'user_010', actorRole: 'seller', timestamp: '2026-01-20T10:00:00Z' },
    ],
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-02-10T09:00:00Z',
  },
];

// Deal rooms the current user is viewing as a buyer
export const MOCK_BUYER_DEAL_ROOMS: DealRoom[] = [
  {
    id: 'dr_003',
    sellerId: 'user_002',
    assetType: 'residential_income',
    assetSubType: 'build_for_rent',
    name: 'Palmetto Ridge BFR — Charleston',
    address: 'Berkeley County, SC',
    currentStage: 7,
    status: 'active',
    shared: {
      assetType: 'residential_income',
      assetSubType: 'build_for_rent',
      geography: { msa: 'Charleston-North Charleston, SC' },
      dealStage: 'lease_up',
      pricingPosture: 'price_range',
      priceRange: { min: 16000000, max: 21000000 },
    },
    ownershipAcknowledged: true,
    matchScore: 92,
    matchedBuyerCount: 3,
    assignedDSId: 'internal_001',
    stageHistory: [],
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'dr_004',
    sellerId: 'user_003',
    assetType: 'residential_income',
    assetSubType: 'build_for_rent',
    name: 'Lakewood Commons BFR — Atlanta',
    address: 'Gwinnett County, GA',
    currentStage: 8,
    status: 'active',
    shared: {
      assetType: 'residential_income',
      assetSubType: 'build_for_rent',
      geography: { msa: 'Atlanta-Sandy Springs-Alpharetta, GA' },
      dealStage: 'stabilized',
      pricingPosture: 'exact_price',
      exactPrice: 19500000,
    },
    ownershipAcknowledged: true,
    matchScore: 85,
    matchedBuyerCount: 3,
    assignedDSId: 'internal_001',
    stageHistory: [],
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-02-25T10:00:00Z',
  },
];
```

---

## 6. Buyer Pool Entry

```typescript
// shared/types/buyerPool.ts

import { QualificationStatus, SeatStatus, OutreachStatus } from './enums';

export interface BuyerPoolEntry {
  id: string;
  dealRoomId: string;
  buyerId: string;
  anonymizedLabel: string;       // e.g. "Investor #1042" — shown to other buyers
  isCurrentUser: boolean;        // true = highlight as "You"
  qualificationStatus: QualificationStatus;
  seatStatus: SeatStatus;
  outreachStatus: OutreachStatus; // AI outreach tracking — visible in DS portal
  matchScore: number;
  equityCheckSize: string;       // display string e.g. "$5M–$15M"
  accessRequestedAt?: string;
  seatedAt?: string;
  passedAt?: string;
  passReason?: string;
  aiRankPosition: number;        // AI-recommended rank 1–3 (max 3 seats per deal room)
  dsOverrideRank?: number;       // set if DS overrode AI recommendation
}
```

```typescript
// frontend/src/data/mock/buyerPool.ts

import { BuyerPoolEntry } from '@/types/buyerPool';

// Buyer pool for dr_003 (Palmetto Ridge — buyer view)
// 3 seated buyers — max seats filled. bp_004 is in wait_queue, not seated.
export const MOCK_BUYER_POOL_DR003: BuyerPoolEntry[] = [
  {
    id: 'bp_001',
    dealRoomId: 'dr_003',
    buyerId: 'user_001',
    anonymizedLabel: 'Investor #2847',
    isCurrentUser: true,
    qualificationStatus: 'qualified',
    seatStatus: 'seated',
    outreachStatus: 'responded',
    matchScore: 92,
    equityCheckSize: '$5M–$15M',
    accessRequestedAt: '2026-02-10T09:00:00Z',
    seatedAt: '2026-02-12T11:00:00Z',
    aiRankPosition: 1,
  },
  {
    id: 'bp_002',
    dealRoomId: 'dr_003',
    buyerId: 'user_004',
    anonymizedLabel: 'Investor #1042',
    isCurrentUser: false,
    qualificationStatus: 'qualified',
    seatStatus: 'seated',
    outreachStatus: 'responded',
    matchScore: 88,
    equityCheckSize: '$15M–$50M',
    accessRequestedAt: '2026-02-11T10:00:00Z',
    seatedAt: '2026-02-12T11:00:00Z',
    aiRankPosition: 2,
  },
  {
    id: 'bp_003',
    dealRoomId: 'dr_003',
    buyerId: 'user_005',
    anonymizedLabel: 'Investor #3391',
    isCurrentUser: false,
    qualificationStatus: 'qualified',
    seatStatus: 'seated',
    outreachStatus: 'responded',
    matchScore: 81,
    equityCheckSize: '$5M–$15M',
    accessRequestedAt: '2026-02-13T08:00:00Z',
    seatedAt: '2026-02-14T09:00:00Z',
    aiRankPosition: 3,
  },
  // Seat 3 is the last seat — bp_004 onward are wait_queue
  {
    id: 'bp_004',
    dealRoomId: 'dr_003',
    buyerId: 'user_006',
    anonymizedLabel: 'Investor #0774',
    isCurrentUser: false,
    qualificationStatus: 'not_qualified',
    seatStatus: 'wait_queue',
    outreachStatus: 'responded',
    matchScore: 76,
    equityCheckSize: '$1M–$5M',
    accessRequestedAt: '2026-02-14T11:00:00Z',
    aiRankPosition: 4,
  },
];

// Extended pool for DS portal — includes wait queue and outreach pipeline
export const MOCK_BUYER_POOL_DS_VIEW: BuyerPoolEntry[] = [
  ...MOCK_BUYER_POOL_DR003,
  {
    id: 'bp_005',
    dealRoomId: 'dr_003',
    buyerId: 'user_007',
    anonymizedLabel: 'Investor #5512',
    isCurrentUser: false,
    qualificationStatus: 'qualified',
    seatStatus: 'wait_queue',
    outreachStatus: 'opened',
    matchScore: 73,
    equityCheckSize: '$5M–$15M',
    accessRequestedAt: '2026-02-16T09:00:00Z',
    aiRankPosition: 5,
  },
  {
    id: 'bp_006',
    dealRoomId: 'dr_003',
    buyerId: 'user_008',
    anonymizedLabel: 'Investor #4208',
    isCurrentUser: false,
    qualificationStatus: 'not_qualified',
    seatStatus: 'outreach_sent',
    outreachStatus: 'sent',
    matchScore: 69,
    equityCheckSize: '$1M–$5M',
    aiRankPosition: 6,
  },
];
```

---

## 7. Offer

```typescript
// shared/types/offer.ts

export type FinancingType = 'all_cash' | 'conventional' | 'agency' | 'debt_fund' | 'other';

export interface Offer {
  id: string;
  dealRoomId: string;
  buyerId: string;
  anonymizedLabel: string;     // "Investor #2847" — matches buyer pool label
  isCurrentUser: boolean;
  offerAmount: number;
  financingType: FinancingType;
  ltvPercent?: number;         // e.g. 65 = 65% LTV — null for all_cash
  closeTimelineDays: number;
  dueDiligenceDays: number;
  additionalTerms?: string;
  rank: number;                // 1 = highest — shown only for current user's offer
  submittedAt: string;
  updatedAt: string;
  round: number;               // offer round number, controlled by DS
}
```

```typescript
// frontend/src/data/mock/offers.ts

import { Offer } from '@/types/offer';

export const MOCK_OFFERS_DR004: Offer[] = [
  {
    id: 'offer_001',
    dealRoomId: 'dr_004',
    buyerId: 'user_001',
    anonymizedLabel: 'Investor #2847',
    isCurrentUser: true,
    offerAmount: 19200000,
    financingType: 'conventional',
    ltvPercent: 65,
    closeTimelineDays: 30,
    dueDiligenceDays: 15,
    additionalTerms: 'No contingencies, as-is',
    rank: 2,
    submittedAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-02-22T14:00:00Z',
    round: 2,
  },
  {
    id: 'offer_002',
    dealRoomId: 'dr_004',
    buyerId: 'user_004',
    anonymizedLabel: 'Investor #1042',
    isCurrentUser: false,
    offerAmount: 19500000,
    financingType: 'all_cash',
    closeTimelineDays: 21,
    dueDiligenceDays: 10,
    additionalTerms: 'As-is, hard money day 1',
    rank: 1,
    submittedAt: '2026-02-20T11:00:00Z',
    updatedAt: '2026-02-22T15:00:00Z',
    round: 2,
  },
  {
    id: 'offer_003',
    dealRoomId: 'dr_004',
    buyerId: 'user_005',
    anonymizedLabel: 'Investor #3391',
    isCurrentUser: false,
    offerAmount: 18900000,
    financingType: 'debt_fund',
    ltvPercent: 70,
    closeTimelineDays: 45,
    dueDiligenceDays: 20,
    rank: 3,
    submittedAt: '2026-02-20T14:00:00Z',
    updatedAt: '2026-02-21T09:00:00Z',
    round: 2,
  },
];
```

---

## 8. Chat Message

```typescript
// shared/types/chat.ts

export type ChatSenderRole =
  | 'ai_agent'      // NextLevel AI (represents DS to external users)
  | 'seller'
  | 'buyer'
  | 'ds'            // DS direct — only visible in DS portal
  | 'system';       // automated stage transition messages

export type ChatMessageType = 'message' | 'stage_update' | 'question_routed' | 'feedback';

export interface ChatMessage {
  id: string;
  dealRoomId: string;
  senderId: string;
  senderRole: ChatSenderRole;
  senderLabel: string;         // display name e.g. "NextLevel AI" or "Marcus Webb"
  content: string;
  messageType: ChatMessageType;
  timestamp: string;
  isAiHandoff?: boolean;       // true = marks the moment DS takes over from AI
  routedQuestionId?: string;   // links to a BuyerFeedback item if question was routed
}

// Buyer Feedback Loop — questions AI cannot answer, routed to seller
export interface BuyerFeedbackItem {
  id: string;
  dealRoomId: string;
  buyerAnonymizedLabel: string;
  question: string;
  status: 'pending_seller' | 'answered' | 'unanswered';
  sellerResponse?: string;
  submittedAt: string;
  answeredAt?: string;
}
```

```typescript
// frontend/src/data/mock/chat.ts

import { ChatMessage, BuyerFeedbackItem } from '@/types/chat';

// Seller deal room chat — dr_001 (Magnolia Farms)
export const MOCK_CHAT_SELLER_DR001: ChatMessage[] = [
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
];

// Buyer deal room chat — dr_003 (Palmetto Ridge — buyer view)
export const MOCK_CHAT_BUYER_DR003: ChatMessage[] = [
  {
    id: 'msg_010',
    dealRoomId: 'dr_003',
    senderId: 'ai_agent',
    senderRole: 'ai_agent',
    senderLabel: 'NextLevel AI',
    content: 'Welcome to the Palmetto Ridge BFR deal room. You\'ve been approved for access. The full deal package is available in the Documents tab. I\'m here to answer questions — feel free to ask anything about the asset.',
    messageType: 'message',
    timestamp: '2026-02-12T11:05:00Z',
  },
  {
    id: 'msg_011',
    dealRoomId: 'dr_003',
    senderId: 'user_001',
    senderRole: 'buyer',
    senderLabel: 'Marcus Webb',
    content: 'What\'s the current occupancy rate and average rent per unit?',
    messageType: 'message',
    timestamp: '2026-02-12T14:30:00Z',
  },
  {
    id: 'msg_012',
    dealRoomId: 'dr_003',
    senderId: 'ai_agent',
    senderRole: 'ai_agent',
    senderLabel: 'NextLevel AI',
    content: 'Based on the current rent roll in the documents: 68 of 88 units are leased (77% occupancy). Average rent is $1,847/month across all unit types. Detached units average $1,920 and townhomes average $1,740.',
    messageType: 'message',
    timestamp: '2026-02-12T14:32:00Z',
  },
];

// Buyer Feedback Loop — seller view
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
];
```

---

## 9. Document

```typescript
// shared/types/document.ts

export type DocumentType =
  | 'property_spreadsheet'
  | 't12'
  | 'rent_roll'
  | 'pro_forma'
  | 'site_plan'
  | 'construction_schedule'
  | 'sample_lease'
  | 'insurance_summary'
  | 'other';

export type DocumentStatus = 'uploaded' | 'under_review' | 'approved' | 'flagged';

export interface DealDocument {
  id: string;
  dealRoomId: string;
  type: DocumentType;
  label: string;               // display name e.g. "T12 Income Report"
  fileName: string;
  fileSizeMb: number;
  status: DocumentStatus;
  uploadedAt: string;
  flagNote?: string;           // populated by Admin if flagged
  required: boolean;
}
```

```typescript
// frontend/src/data/mock/documents.ts

import { DealDocument } from '@/types/document';

export const MOCK_DOCUMENTS_DR001: DealDocument[] = [
  {
    id: 'doc_001',
    dealRoomId: 'dr_001',
    type: 'rent_roll',
    label: 'Current Rent Roll',
    fileName: 'MagnoliaFarms_RentRoll_Feb2026.xlsx',
    fileSizeMb: 0.4,
    status: 'approved',
    uploadedAt: '2026-01-21T10:00:00Z',
    required: true,
  },
  {
    id: 'doc_002',
    dealRoomId: 'dr_001',
    type: 't12',
    label: 'T12 Income Report',
    fileName: 'MagnoliaFarms_T12_2025.pdf',
    fileSizeMb: 1.2,
    status: 'approved',
    uploadedAt: '2026-01-21T10:05:00Z',
    required: true,
  },
  {
    id: 'doc_003',
    dealRoomId: 'dr_001',
    type: 'site_plan',
    label: 'Community Site Plan',
    fileName: 'MagnoliaFarms_SitePlan.pdf',
    fileSizeMb: 3.8,
    status: 'approved',
    uploadedAt: '2026-01-21T10:10:00Z',
    required: false,
  },
];
```

---

## 10. Internal Staff

```typescript
// shared/types/internalStaff.ts

import { InternalRole } from './enums';

export interface InternalStaffMember {
  id: string;
  name: string;
  role: InternalRole;
  email: string;
  phone: string;
  avatarInitials: string;
  assignedDealRoomIds: string[];
  assignedClientIds: string[];
}

// DS portal: outreach queue entry — one per buyer per deal
export interface AIOutreachEntry {
  id: string;
  dealRoomId: string;
  buyerPoolEntryId: string;
  buyerAnonymizedLabel: string;
  matchScore: number;
  qualificationStatus: 'qualified' | 'not_qualified';
  outreachStatus: 'pending' | 'sent' | 'opened' | 'responded' | 'passed';
  sentAt?: string;
  openedAt?: string;
  respondedAt?: string;
  aiRankPosition: number;
  intentToOffer: boolean;      // true = triggers DS handoff
  handoffAt?: string;
}
```

```typescript
// frontend/src/data/mock/internalStaff.ts

import { InternalStaffMember, AIOutreachEntry } from '@/types/internalStaff';

export const MOCK_DS: InternalStaffMember = {
  id: 'internal_001',
  name: 'Jordan Calloway',
  role: 'ds',
  email: 'jordan.calloway@stratarei.com',
  phone: '(980) 555-0241',
  avatarInitials: 'JC',
  assignedDealRoomIds: ['dr_001', 'dr_003', 'dr_004', 'dr_005', 'dr_006'],
  assignedClientIds: ['user_001', 'user_002', 'user_003'],
};

export const MOCK_ADMIN: InternalStaffMember = {
  id: 'internal_002',
  name: 'Priya Sharma',
  role: 'admin',
  email: 'priya.sharma@stratarei.com',
  phone: '(980) 555-0188',
  avatarInitials: 'PS',
  assignedDealRoomIds: ['dr_002'],
  assignedClientIds: ['user_001'],
};

export const MOCK_ANALYST: InternalStaffMember = {
  id: 'internal_003',
  name: 'Derek Fontaine',
  role: 'analyst',
  email: 'derek.fontaine@stratarei.com',
  phone: '(980) 555-0310',
  avatarInitials: 'DF',
  assignedDealRoomIds: [],
  assignedClientIds: [],
};

// AI outreach queue for dr_001 — shown in DS portal
export const MOCK_AI_OUTREACH_DR001: AIOutreachEntry[] = [
  {
    id: 'out_001',
    dealRoomId: 'dr_001',
    buyerPoolEntryId: 'bp_001',
    buyerAnonymizedLabel: 'Investor #2847',
    matchScore: 92,
    qualificationStatus: 'qualified',
    outreachStatus: 'responded',
    sentAt: '2026-02-03T09:10:00Z',
    openedAt: '2026-02-03T11:00:00Z',
    respondedAt: '2026-02-03T14:00:00Z',
    aiRankPosition: 1,
    intentToOffer: true,
    handoffAt: '2026-02-20T09:00:00Z',
  },
  {
    id: 'out_002',
    dealRoomId: 'dr_001',
    buyerPoolEntryId: 'bp_002',
    buyerAnonymizedLabel: 'Investor #1042',
    matchScore: 88,
    qualificationStatus: 'qualified',
    outreachStatus: 'responded',
    sentAt: '2026-02-03T09:15:00Z',
    openedAt: '2026-02-03T13:00:00Z',
    respondedAt: '2026-02-04T10:00:00Z',
    aiRankPosition: 2,
    intentToOffer: false,
  },
  {
    id: 'out_003',
    dealRoomId: 'dr_001',
    buyerPoolEntryId: 'bp_005',
    buyerAnonymizedLabel: 'Investor #5512',
    matchScore: 73,
    qualificationStatus: 'qualified',
    outreachStatus: 'opened',
    sentAt: '2026-02-04T09:00:00Z',
    openedAt: '2026-02-04T15:00:00Z',
    aiRankPosition: 5,
    intentToOffer: false,
  },
];
```

---

## 11. Match Card (Buyer Matches View)

```typescript
// shared/types/matchCard.ts

import { AssetType, AssetSubType, DealStage, DealRoomStage } from './enums';

export type AccessRequestStatus = 'none' | 'pending' | 'approved' | 'denied';

export interface MatchCard {
  id: string;
  dealRoomId: string;
  strategyId: string;
  name: string;
  address: string;
  assetType: AssetType;
  assetSubType: AssetSubType;
  dealStage: DealStage;
  currentRoomStage: DealRoomStage;
  matchScore: number;
  priceDisplay: string;         // formatted e.g. "$14M–$18M" or "$19.5M"
  unitCount?: number;
  highlights: string[];         // 2–3 bullet points e.g. ["72-unit BFR", "77% leased", "Cabarrus County NC"]
  accessRequestStatus: AccessRequestStatus;
}
```

```typescript
// frontend/src/data/mock/matchCards.ts

import { MatchCard } from '@/types/matchCard';

export const MOCK_MATCH_CARDS_STRAT001: MatchCard[] = [
  {
    id: 'match_001',
    dealRoomId: 'dr_003',
    strategyId: 'strat_001',
    name: 'Palmetto Ridge BFR',
    address: 'Berkeley County, SC',
    assetType: 'residential_income',
    assetSubType: 'build_for_rent',
    dealStage: 'lease_up',
    currentRoomStage: 7,
    matchScore: 92,
    priceDisplay: '$16M–$21M',
    unitCount: 88,
    highlights: ['88-unit BFR community', 'Lease-Up — 77% occupied', 'Charleston MSA'],
    accessRequestStatus: 'approved',
  },
  {
    id: 'match_002',
    dealRoomId: 'dr_005',
    strategyId: 'strat_001',
    name: 'Highpoint Townhomes BFR',
    address: 'Mecklenburg County, NC',
    assetType: 'residential_income',
    assetSubType: 'build_for_rent',
    dealStage: 'stabilized',
    currentRoomStage: 6,
    matchScore: 84,
    priceDisplay: '$11M–$14M',
    unitCount: 54,
    highlights: ['54-unit BFR townhomes', 'Stabilized — 96% occupied', 'Charlotte MSA'],
    accessRequestStatus: 'pending',
  },
  {
    id: 'match_003',
    dealRoomId: 'dr_006',
    strategyId: 'strat_001',
    name: 'Riverbend Cottages BFR',
    address: 'Durham County, NC',
    assetType: 'residential_income',
    assetSubType: 'build_for_rent',
    dealStage: 'lease_up',
    currentRoomStage: 7,
    matchScore: 79,
    priceDisplay: '$9M–$12M',
    unitCount: 42,
    highlights: ['42-unit detached BFR', 'Lease-Up — 62% occupied', 'Raleigh-Durham MSA'],
    accessRequestStatus: 'none',
  },
];
```

---

## 12. Analyst Financial Memo

```typescript
// shared/types/analystMemo.ts

export interface AnalystMemo {
  id: string;
  dealRoomId: string;
  generatedAt: string;
  // AI-generated summary sections
  executiveSummary: string;
  incomeAnalysis: string;
  expenseAnalysis: string;
  valuationSummary: string;
  riskFlags: string[];
  recommendation: 'approve' | 'return_to_admin' | 'reject';
  analystNotes?: string;       // added by Analyst after review
  determinationAt?: string;
}
```

```typescript
// frontend/src/data/mock/analystMemos.ts

import { AnalystMemo } from '@/types/analystMemo';

export const MOCK_ANALYST_MEMO_DR002: AnalystMemo = {
  id: 'memo_001',
  dealRoomId: 'dr_002',
  generatedAt: '2026-02-19T08:00:00Z',
  executiveSummary: 'Triangle SFR Portfolio consists of 34 scattered single-family rentals in Wake County, NC. The portfolio is fully stabilized at 96% occupancy with strong rent growth trajectory. Trailing 12-month NOI supports the seller\'s pricing range at a 5.8%–7.1% cap rate.',
  incomeAnalysis: 'Gross potential rent of $612,000 annually based on current rent roll. Effective gross income of $588,000 after 4% vacancy assumption. Management fee assumed at 8%. T12 income is consistent with current rent roll.',
  expenseAnalysis: 'Operating expenses total $187,400 based on T12. Property taxes represent the largest expense at $72,000. No significant deferred maintenance identified from available documentation.',
  valuationSummary: 'At the midpoint of the seller\'s price range ($7.75M), the implied cap rate is 5.9% on trailing NOI. This is within market range for stabilized SFR portfolios in the Raleigh MSA. Supports pricing.',
  riskFlags: [
    'Scattered portfolio — 34 properties across 12 ZIP codes increases management complexity',
    'No CapEx schedule provided — age distribution skews 2004–2012, some deferred maintenance risk',
    'Section 8 exposure not documented — Admin should request clarification',
  ],
  recommendation: 'approve',
};
```

---

## 13. Notification Settings

```typescript
// shared/types/notifications.ts

export type NotificationCadence = 'real_time' | 'every_x_hours' | 'every_x_days' | 'weekly';

export interface NotificationSettings {
  userId: string;
  buyer: {
    enabled: boolean;
    cadence: NotificationCadence;
    xHours?: number;   // 1–24 — used when cadence = 'every_x_hours'
    xDays?: number;    // 1–30 — used when cadence = 'every_x_days'
  };
  seller: {
    enabled: boolean;
    cadence: NotificationCadence;
    xHours?: number;
    xDays?: number;
  };
}
```

```typescript
// frontend/src/data/mock/notifications.ts

import { NotificationSettings } from '@/types/notifications';

export const MOCK_NOTIFICATION_SETTINGS: NotificationSettings = {
  userId: 'user_001',
  buyer: {
    enabled: true,
    cadence: 'real_time',
  },
  seller: {
    enabled: true,
    cadence: 'every_x_hours',
    xHours: 4,
  },
};
```

---

## 14. Pre-Signup Intake State

```typescript
// shared/types/intake.ts
// Used by the landing page chat state machine — not persisted

import { AssetType, AssetSubType, DealStage, PricingPosture, Geography } from './enums';

export type IntakeMode = 'buyer' | 'seller';

export interface BuyerIntakeState {
  mode: 'buyer';
  assetType?: AssetType;
  assetSubType?: AssetSubType;
  geography?: Geography;
  dealStages?: DealStage[];
  equityCheckSize?: string;       // display string e.g. "$5M–$15M"
  matchScore: number;             // starts at 0, increments per answer
  matchedDealCount: number;       // starts high, narrows per answer
  currentStep: number;            // 0–4
  signUpPromptTriggered: boolean; // true when matchScore >= 95
}

export interface SellerIntakeState {
  mode: 'seller';
  assetType?: AssetType;
  assetSubType?: AssetSubType;
  geography?: Geography;
  dealStage?: DealStage;
  pricingPosture?: PricingPosture;
  matchScore: number;
  matchedBuyerCount: number;
  currentStep: number;
  signUpPromptTriggered: boolean;
}

export type IntakeState = BuyerIntakeState | SellerIntakeState;

// Match score increments per answered question — buyer flow
export const BUYER_SCORE_INCREMENTS: Record<number, number> = {
  0: 20,  // asset type + sub-type answered
  1: 25,  // geography answered
  2: 25,  // deal stage answered
  3: 25,  // equity check size answered
  // total: 95 — triggers sign-up prompt
};

// Match score increments per answered question — seller flow
export const SELLER_SCORE_INCREMENTS: Record<number, number> = {
  0: 20,  // asset type + sub-type answered
  1: 25,  // geography answered
  2: 25,  // deal stage answered
  3: 25,  // pricing posture answered
};

// Starting matched counts — narrows as criteria tighten
export const BUYER_INITIAL_MATCH_COUNT = 847;
export const SELLER_INITIAL_BUYER_COUNT = 1240;
```

---

## 15. Status Transition

Audit trail for deal room status changes (Market Tested, Dormant, reactivation). Separate from `StageTransition` which tracks lifecycle stage movement.

```typescript
// shared/types/statusTransition.ts

import { DealRoomStatus } from './enums';

export interface StatusTransition {
  id: string;
  dealRoomId: string;
  fromStatus: DealRoomStatus;
  toStatus: DealRoomStatus;
  actorId: string;
  actorRole: 'seller' | 'ds' | 'system';
  notes?: string;              // required when moving to market_tested or dormant
  timestamp: string;
}
```

```typescript
// frontend/src/data/mock/statusTransitions.ts

import { StatusTransition } from '@/types/statusTransition';

// Status transitions for dr_005 (Brookside MF — Nashville — Market Tested)
export const MOCK_STATUS_TRANSITIONS_DR005: StatusTransition[] = [
  {
    id: 'st_001',
    dealRoomId: 'dr_005',
    fromStatus: 'active',
    toStatus: 'market_tested',
    actorId: 'internal_001',
    actorRole: 'ds',
    notes: 'All 3 seats filled sequentially. All buyers passed. No LOIs received. Full matched buyer pipeline exhausted. Seller notified — awaiting decision on path forward.',
    timestamp: '2026-02-28T11:00:00Z',
  },
];

// Status transitions for dr_006 (Sunridge Land — Austin — Dormant)
export const MOCK_STATUS_TRANSITIONS_DR006: StatusTransition[] = [
  {
    id: 'st_002',
    dealRoomId: 'dr_006',
    fromStatus: 'active',
    toStatus: 'dormant',
    actorId: 'system',
    actorRole: 'system',
    notes: 'Document collection stalled — no seller response within 21-day window. Deal moved to Dormant automatically. DS notified.',
    timestamp: '2026-02-10T09:00:00Z',
  },
];
```

---

## File Structure Summary

```
my-app/
│
├── shared/                          ← Both frontend & backend use this
│   ├── types/
│   │   ├── enums.ts                 ← includes DealRoomStatus (v1.1)
│   │   ├── user.ts
│   │   ├── qualification.ts
│   │   ├── strategy.ts
│   │   ├── dealRoom.ts              ← includes status: DealRoomStatus field (v1.1)
│   │   ├── buyerPool.ts
│   │   ├── offer.ts
│   │   ├── chat.ts
│   │   ├── document.ts
│   │   ├── internalStaff.ts
│   │   ├── matchCard.ts
│   │   ├── analystMemo.ts
│   │   ├── notifications.ts
│   │   ├── intake.ts
│   │   └── statusTransition.ts      ← NEW in v1.1
│   ├── constants/
│   └── utils/
│
├── frontend/                        ← React app
│   └── src/
│       ├── components/              ← Reusable UI — used in 2+ pages
│       ├── pages/                   ← One per route — not reusable
│       ├── hooks/                   ← Custom React hooks
│       ├── utils/                   ← Frontend-only utility functions
│       ├── styles/                  ← Global CSS / Tailwind config
│       └── data/
│           └── mock/                ← Prototype mock data — frontend only
│               ├── users.ts
│               ├── qualifications.ts
│               ├── strategies.ts
│               ├── dealRooms.ts     ← includes dr_005 (market_tested), dr_006 (dormant) (v1.1)
│               ├── buyerPool.ts     ← bp_004 corrected to wait_queue (v1.1)
│               ├── offers.ts
│               ├── chat.ts
│               ├── documents.ts
│               ├── internalStaff.ts
│               ├── matchCards.ts
│               ├── analystMemos.ts
│               ├── notifications.ts
│               ├── statusTransitions.ts  ← NEW in v1.1
│               └── dealPreviews.ts       ← NEW in v1.2
│
└── backend/                         ← Server & API (not in prototype scope)
    └── src/
        ├── routes/
        ├── controllers/
        ├── models/
        └── middleware/
```

---

## 16. Deal Preview Modal

### Type Definition

```typescript
// shared/types/dealPreview.ts

import { AssetType, AssetSubType, DealStage, PricingPosture, PriceRange } from './enums';

export type DealPreviewViewerRole = 'buyer' | 'seller';

export interface DealPreviewProps {
  dealRoomId: string;
  assetType: AssetType;
  assetSubType: AssetSubType;
  geography: string;              // MSA-level label e.g. "Phoenix-Mesa-Chandler, AZ"
  dealStage: DealStage;
  matchScore: number;             // 0–100
  pricingPosture: PricingPosture;
  priceRange?: PriceRange;        // populated when pricingPosture !== 'needs_guidance'
  viewerRole: DealPreviewViewerRole;
  // buyer: price is blurred; Request Access CTA shown
  // seller: price is blurred; read-only, no CTA — confirmation view only
}
```

### Mock Instances

```typescript
// frontend/src/data/mock/dealPreviews.ts

import { DealPreviewProps } from '../../../shared/types/dealPreview';

// Buyer viewing a matched deal — price blurred, Request Access CTA shown
export const MOCK_DEAL_PREVIEW_BUYER: DealPreviewProps = {
  dealRoomId: 'dr_001',
  assetType: 'residential_income',
  assetSubType: 'build_for_rent',
  geography: 'Phoenix-Mesa-Chandler, AZ',
  dealStage: 'lease_up',
  matchScore: 87,
  pricingPosture: 'price_range',
  priceRange: { min: 8000000, max: 25000000 },
  viewerRole: 'buyer',
};

// Seller viewing their own deal at Stage 5 — same fields, read-only, no CTA
export const MOCK_DEAL_PREVIEW_SELLER: DealPreviewProps = {
  dealRoomId: 'dr_001',
  assetType: 'residential_income',
  assetSubType: 'build_for_rent',
  geography: 'Phoenix-Mesa-Chandler, AZ',
  dealStage: 'lease_up',
  matchScore: 87,
  pricingPosture: 'price_range',
  priceRange: { min: 8000000, max: 25000000 },
  viewerRole: 'seller',
};
```

### Behavior Rules

- Price is always blurred regardless of `viewerRole` — exact figure is gated until buyer is seated
- When `viewerRole === 'buyer'`: Request Access CTA is rendered inside the modal
- When `viewerRole === 'seller'`: No CTA rendered — read-only confirmation only
- Seller preview is only available from Stage 5 (Decision Point) onward — do not render before Stage 5
- Fields shown: asset type/sub-type, geography, deal stage, match score ring, blurred price indicator
- Fields never shown in preview: docs, financials, buyer pool, deal room content
