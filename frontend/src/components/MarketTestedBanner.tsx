import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MarketTestedBannerProps {
  dealName: string
  onAdjust: () => void
  onPause: () => void
  onWithdraw: () => void
}

export default function MarketTestedBanner({
  dealName: _dealName,
  onAdjust,
  onPause,
  onWithdraw,
}: MarketTestedBannerProps) {
  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 space-y-3 mx-6 mt-4">
      <div className="flex items-start gap-2">
        <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-amber-400">Market Tested</h3>
          <p className="text-sm text-muted-foreground">
            Your buyer pool has been exhausted with no offers received. Choose how you'd like to
            proceed. If no action is taken, this listing will move to Dormant automatically.
          </p>
        </div>
      </div>
      <div className="flex gap-2 pl-6">
        <Button variant="outline" size="sm" onClick={onAdjust}>
          Adjust Listing
        </Button>
        <Button variant="outline" size="sm" onClick={onPause}>
          Pause
        </Button>
        <Button variant="outline" size="sm" onClick={onWithdraw}>
          Withdraw
        </Button>
      </div>
    </div>
  )
}
