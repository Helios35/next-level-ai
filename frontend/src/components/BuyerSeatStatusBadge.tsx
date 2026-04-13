import { cn } from '@/utils/cn'

interface BuyerSeatStatusBadgeProps {
  seatNumber: number
  maxSeats?: number
  className?: string
}

export default function BuyerSeatStatusBadge({
  seatNumber,
  maxSeats = 3,
  className,
}: BuyerSeatStatusBadgeProps) {
  return (
    <span
      className={cn(
        'text-xs font-medium text-mode-buy bg-mode-buy/10 rounded-full px-3 py-1',
        className,
      )}
    >
      You are {seatNumber} of {maxSeats} buyers seeing this deal
    </span>
  )
}
