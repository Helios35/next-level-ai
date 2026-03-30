import type { DealRoom } from '@shared/types/dealRoom'
import type { AssetSubType, DealStage } from '@shared/types/enums'

export const ASSET_SUBTYPE_LABELS: Record<AssetSubType, string> = {
  build_for_rent: 'Build-for-Rent',
  sfr_portfolio: 'SFR Portfolio',
  multifamily: 'Multifamily',
  land: 'Land',
}

export const DEAL_STAGE_LABELS: Record<DealStage, string> = {
  pre_development: 'Pre-Development',
  in_development: 'In Development',
  delivered_vacant: 'Delivered Vacant',
  lease_up: 'Lease-Up',
  stabilized: 'Stabilized',
}

export function formatPrice(deal: DealRoom): string {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${n.toLocaleString()}`

  if (deal.shared.pricingPosture === 'exact_price' && deal.shared.exactPrice) {
    return fmt(deal.shared.exactPrice)
  }
  if (deal.shared.priceRange) {
    return `${fmt(deal.shared.priceRange.min)}–${fmt(deal.shared.priceRange.max)}`
  }
  return 'Price TBD'
}
