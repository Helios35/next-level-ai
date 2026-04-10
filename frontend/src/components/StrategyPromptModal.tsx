import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface StrategyPromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateStrategy: () => void
  onDismiss: () => void
}

export default function StrategyPromptModal({
  open,
  onOpenChange,
  onCreateStrategy,
  onDismiss,
}: StrategyPromptModalProps) {
  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Create a Buy Strategy</DialogTitle>
          <DialogDescription className="pt-2 text-sm text-muted-foreground">
            Your strategy defines what you're looking for — asset type, geography, and deal size.
            Once live, matched deals appear here automatically.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex-row justify-end gap-2">
          <Button variant="ghost" onClick={onDismiss}>
            Not Now
          </Button>
          <Button
            className="bg-mode-strategy hover:bg-mode-strategy/90 text-white"
            onClick={onCreateStrategy}
          >
            Create My Strategy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
