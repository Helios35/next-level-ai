export type DocumentType =
  | 'property_spreadsheet'
  | 't12'
  | 'rent_roll'
  | 'pro_forma'
  | 'site_plan'
  | 'construction_schedule'
  | 'sample_lease'
  | 'insurance_summary'
  | 'other'

export type DocumentStatus = 'uploaded' | 'under_review' | 'approved' | 'flagged'

export interface DealDocument {
  id: string
  dealRoomId: string
  type: DocumentType
  label: string
  fileName: string
  fileSizeMb: number
  status: DocumentStatus
  uploadedAt: string
  flagNote?: string
  required: boolean
}
