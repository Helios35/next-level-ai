// Analyst AI Financial Memos — Stage 4 review queue mock data

export interface MemoSection {
  title: string
  content: string
}

export type AiFlagColor = 'green' | 'yellow' | 'red'

export interface AnalystMemo {
  id: string
  dealId: string
  dealName: string
  assetType: string
  assetSubType: string
  sellerName: string
  memoDate: string // ISO date
  flagColor: AiFlagColor
  sections: {
    dealSummary: MemoSection
    documentAssessment: MemoSection
    pricingAssessment: MemoSection
    demandAlignment: MemoSection
    aiRecommendation: MemoSection
    aiReasoning: MemoSection
  }
}

export const MOCK_ANALYST_MEMOS: AnalystMemo[] = [
  {
    id: 'memo_001',
    dealId: 'dr_001',
    dealName: 'Magnolia Farms BFR — Charlotte',
    assetType: 'Residential Income',
    assetSubType: 'Build for Rent',
    sellerName: 'Nathan Ivy',
    memoDate: '2026-03-28T14:00:00Z',
    flagColor: 'green',
    sections: {
      dealSummary: {
        title: 'Deal Summary',
        content:
          'Magnolia Farms is a 72-unit detached build-for-rent community located in Cabarrus County within the Charlotte-Concord-Gastonia MSA. The asset is currently in lease-up with 89% occupancy. The seller is seeking $14M–$18M and has indicated a price range posture. Development was completed in Q4 2025 with stabilized operations expected by mid-2026. The seller is an experienced regional developer with two prior successful dispositions on the platform.',
      },
      documentAssessment: {
        title: 'Document Assessment',
        content:
          'All required documents were present and verified during Stage 3 QA review. Rent roll, operating statements (trailing 12 months), development budget, site plan, and title commitment are all current. No exceptions were flagged by the AI checklist agent. The package advanced to Stage 4 without Admin intervention.',
      },
      pricingAssessment: {
        title: 'Pricing Assessment',
        content:
          'The asking range of $14M–$18M represents $194K–$250K per door, which aligns with comparable BFR transactions in the Charlotte MSA over the trailing 18 months. Recent comps include a 64-unit BFR in Mooresville ($215K/door, closed Q1 2026) and an 80-unit community in Fort Mill ($228K/door, closed Q4 2025). The midpoint of $16M ($222K/door) is well within market. Cap rate implied at the midpoint is approximately 5.8%, consistent with institutional BFR pricing in secondary Sun Belt markets.',
      },
      demandAlignment: {
        title: 'Demand Alignment',
        content:
          'The platform currently has 11 active buyer strategies targeting BFR assets in the Charlotte MSA. Of these, 8 strategies have equity check ranges that cover the seller\'s asking range. Three buyers have Tier 1 + Tier 2 hard match alignment with qualification complete. Buyer pool depth is strong — this deal is expected to fill all 3 seats within the first week of active disposition.',
      },
      aiRecommendation: {
        title: 'AI Recommendation',
        content: 'Green — Approve. Advance to Stage 5 (Decision Point).',
      },
      aiReasoning: {
        title: 'AI Reasoning',
        content:
          'This deal presents strong fundamentals across all evaluation criteria. Document package is complete and clean. Pricing is aligned with market comps and does not require guidance intervention. Buyer demand is deep with multiple qualified matches. The seller has platform experience and a track record of clean closings. No risk factors were identified that would warrant a return or rejection. Recommendation: approve and advance to seller outcome conversation.',
      },
    },
  },
  {
    id: 'memo_002',
    dealId: 'dr_007',
    dealName: 'Lakewood Multifamily — Tampa',
    assetType: 'Residential Income',
    assetSubType: 'Multifamily',
    sellerName: 'Marcus Webb',
    memoDate: '2026-03-25T10:30:00Z',
    flagColor: 'yellow',
    sections: {
      dealSummary: {
        title: 'Deal Summary',
        content:
          'Lakewood Multifamily is a 48-unit garden-style apartment complex in Hillsborough County within the Tampa-St. Petersburg MSA. The asset is stabilized with 94% occupancy. The seller is a first-time platform user seeking $8.5M (exact price posture). The property was built in 2019 and has had one ownership transition. Current NOI is approximately $520K annually.',
      },
      documentAssessment: {
        title: 'Document Assessment',
        content:
          'Document package was flagged during Stage 3 for a minor inconsistency in the unit count between the rent roll (48 units) and the operating statement summary (46 units). Admin reviewed and confirmed the rent roll is accurate — the operating statement referenced a prior reporting period before two additional units were brought online. Admin advanced the package with a note documenting the resolution. All other documents are present and verified.',
      },
      pricingAssessment: {
        title: 'Pricing Assessment',
        content:
          'The asking price of $8.5M represents $177K per door. Comparable garden-style multifamily transactions in Tampa over the trailing 12 months range from $155K–$210K per door, depending on vintage and condition. At $177K/door, the pricing is within range but positioned toward the lower-middle of the comp set. However, the implied cap rate of approximately 6.1% is slightly below the market average of 5.7% for 2019-vintage product in this submarket, suggesting the NOI may be understated or the seller\'s price expectation is marginally above what the income supports. This is not disqualifying but warrants Analyst awareness.',
      },
      demandAlignment: {
        title: 'Demand Alignment',
        content:
          'Six active buyer strategies target multifamily assets in the Tampa MSA. Four strategies have equity check ranges covering $8.5M. However, only two buyers have both Tier 1 and Tier 2 alignment with qualification complete. Buyer pool depth is moderate — seat fill is likely but may require DS outreach to supplemental buyers beyond the initial match set.',
      },
      aiRecommendation: {
        title: 'AI Recommendation',
        content: 'Yellow — Return to Admin. Pricing concern flagged for review.',
      },
      aiReasoning: {
        title: 'AI Reasoning',
        content:
          'While the deal is broadly viable, the cap rate / NOI relationship raises a concern. The seller\'s exact price of $8.5M implies a cap rate that sits above the market norm for this vintage and submarket, which may indicate the seller\'s NOI projections include assumptions not fully supported by trailing actuals. Additionally, the document inconsistency (resolved at Stage 3) introduces a minor confidence discount. Buyer pool depth is moderate but not strong. Recommendation: return to Admin for a pricing discussion with the seller before advancing. The deal is not rejected — it requires additional context before the Analyst can approve with confidence.',
      },
    },
  },
  {
    id: 'memo_003',
    dealId: 'dr_008',
    dealName: 'Pine Ridge Land Parcel — Nashville',
    assetType: 'Land',
    assetSubType: 'Land',
    sellerName: 'Rebecca Collins',
    memoDate: '2026-03-20T09:15:00Z',
    flagColor: 'red',
    sections: {
      dealSummary: {
        title: 'Deal Summary',
        content:
          'Pine Ridge is a 12-acre unentitled land parcel in Davidson County within the Nashville MSA. The seller is a private landowner with no development experience and no prior platform activity. The asking price is $4.2M (exact price posture). The parcel is currently zoned agricultural with no pending rezoning applications. The seller intends to sell without entitlements in place.',
      },
      documentAssessment: {
        title: 'Document Assessment',
        content:
          'Document package is thin. Title commitment and survey are present. No environmental assessment, no geotechnical report, no entitlement feasibility study, and no development pro forma were provided. Stage 3 Admin noted that the seller was advised to supplement but declined, stating they prefer to sell as-is. The package meets the minimum threshold for Stage 4 review but lacks the depth expected for an institutional buyer audience.',
      },
      pricingAssessment: {
        title: 'Pricing Assessment',
        content:
          'The asking price of $4.2M ($350K/acre) is significantly above recent land comps in Davidson County for unentitled agricultural parcels, which have traded between $180K–$260K per acre over the trailing 24 months. Entitled parcels with approved site plans have traded at $300K–$400K/acre, but this parcel has no entitlements. The seller\'s price expectation appears to reflect entitled value without the entitlement risk discount. At current pricing, the deal is unlikely to attract institutional interest.',
      },
      demandAlignment: {
        title: 'Demand Alignment',
        content:
          'Two active buyer strategies target land in the Nashville MSA. Neither strategy\'s equity check range covers $4.2M — both are targeting parcels under $2.5M. No Tier 1 + Tier 2 hard match exists in the current buyer pool. Demand alignment is effectively zero at the current asking price.',
      },
      aiRecommendation: {
        title: 'AI Recommendation',
        content: 'Red — Reject. Viability issue identified.',
      },
      aiReasoning: {
        title: 'AI Reasoning',
        content:
          'This deal fails on multiple criteria. Pricing is materially above market for an unentitled parcel — the seller is pricing at entitled-comparable levels without having pursued entitlements. The document package lacks key institutional-grade diligence materials and the seller has declined to supplement. Buyer demand at this price point is non-existent — no active strategy on the platform covers the asking price for Nashville land. Advancing this deal would consume DS capacity with no realistic path to a closed transaction. Recommendation: reject with a clear explanation of the pricing and demand gaps. The seller may be offered guidance on repositioning if they choose to re-engage with adjusted expectations.',
      },
    },
  },
]
