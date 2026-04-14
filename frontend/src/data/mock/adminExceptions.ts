// Admin Exception Queue — Stage 3 AI-flagged deals requiring Admin review

export type DocumentCheckStatus = 'present' | 'missing' | 'inconsistent' | 'flagged'

export interface CompletenessCheckItem {
  documentName: string
  status: DocumentCheckStatus
  aiNote?: string
}

export interface AdminException {
  id: string
  dealId: string
  dealName: string
  assetType: string
  assetSubType: string
  sellerName: string
  sellerEmail: string
  dateSubmittedToStage3: string // ISO date
  flagReasons: string[]
  daysPending: number
  completenessReport: CompletenessCheckItem[]
}

export const MOCK_ADMIN_EXCEPTIONS: AdminException[] = [
  {
    id: 'exc_001',
    dealId: 'dr_002',
    dealName: 'Triangle SFR Portfolio — Raleigh',
    assetType: 'Residential Income',
    assetSubType: 'SFR Portfolio',
    sellerName: 'Nathan Ivy',
    sellerEmail: 'nathan@example.com',
    dateSubmittedToStage3: '2026-02-18T15:00:00Z',
    flagReasons: [
      'Missing rent roll',
      'Inconsistent unit count across docs',
    ],
    daysPending: 5,
    completenessReport: [
      { documentName: 'Title Commitment', status: 'present' },
      { documentName: 'Survey / Site Plan', status: 'present' },
      { documentName: 'Rent Roll', status: 'missing', aiNote: 'No rent roll was included in the document package. Required for income verification.' },
      { documentName: 'Operating Statement (T-12)', status: 'flagged', aiNote: 'Operating statement references 32 units but deal submission lists 34 units. Unit count discrepancy needs resolution.' },
      { documentName: 'Purchase & Sale Agreement', status: 'present' },
      { documentName: 'Property Tax Records', status: 'present' },
      { documentName: 'Insurance Certificate', status: 'present' },
      { documentName: 'Environmental Assessment', status: 'present' },
    ],
  },
  {
    id: 'exc_002',
    dealId: 'dr_009',
    dealName: 'Cypress Creek BFR — Austin',
    assetType: 'Residential Income',
    assetSubType: 'Build for Rent',
    sellerName: 'James Porter',
    sellerEmail: 'james.porter@example.com',
    dateSubmittedToStage3: '2026-03-01T10:00:00Z',
    flagReasons: [
      'Development budget missing line-item detail',
      'No certificate of occupancy for completed units',
    ],
    daysPending: 8,
    completenessReport: [
      { documentName: 'Title Commitment', status: 'present' },
      { documentName: 'Survey / Site Plan', status: 'present' },
      { documentName: 'Development Budget', status: 'flagged', aiNote: 'Budget provided as a single-page summary without line-item breakdown. Institutional buyers require detailed cost allocation.' },
      { documentName: 'Pro Forma', status: 'present' },
      { documentName: 'Certificate of Occupancy', status: 'missing', aiNote: 'No CO provided for the 28 completed units. Required to verify habitable status.' },
      { documentName: 'Rent Roll', status: 'present' },
      { documentName: 'Operating Statement (T-12)', status: 'present' },
      { documentName: 'Environmental Assessment', status: 'inconsistent', aiNote: 'Phase I report is dated 2023. Platform standard requires reports within 18 months. Current report may be expired.' },
    ],
  },
  {
    id: 'exc_003',
    dealId: 'dr_010',
    dealName: 'Harbor View Multifamily — Jacksonville',
    assetType: 'Residential Income',
    assetSubType: 'Multifamily',
    sellerName: 'Linda Nakamura',
    sellerEmail: 'linda.nakamura@example.com',
    dateSubmittedToStage3: '2026-03-10T08:30:00Z',
    flagReasons: [
      'Operating statement shows unexplained revenue spike in Month 9',
    ],
    daysPending: 3,
    completenessReport: [
      { documentName: 'Title Commitment', status: 'present' },
      { documentName: 'Survey / Site Plan', status: 'present' },
      { documentName: 'Rent Roll', status: 'present' },
      { documentName: 'Operating Statement (T-12)', status: 'flagged', aiNote: 'Month 9 shows a 34% revenue increase over Month 8 with no corresponding occupancy change. Possible one-time fee income or data entry error — requires Admin verification.' },
      { documentName: 'Pro Forma', status: 'present' },
      { documentName: 'Environmental Assessment', status: 'present' },
      { documentName: 'Property Tax Records', status: 'present' },
      { documentName: 'Insurance Certificate', status: 'present' },
    ],
  },
]
