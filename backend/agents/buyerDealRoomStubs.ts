export function notifyDispositionSpecialist(dealId: string, buyerId: string, reason: 'inactivity'): void {
  console.log(`[Stub] notifyDispositionSpecialist — dealId: ${dealId}, buyerId: ${buyerId}, reason: ${reason}`)
}

export function recordPassFeedback(
  dealId: string,
  buyerId: string,
  reason: string,
  notes?: string
): void {
  console.log(`[Stub] recordPassFeedback — dealId: ${dealId}, buyerId: ${buyerId}, reason: ${reason}, notes: ${notes ?? 'none'}`)
}

export function recordOfferIntent(dealId: string, buyerId: string): void {
  console.log(`[Stub] recordOfferIntent — dealId: ${dealId}, buyerId: ${buyerId}`)
}
