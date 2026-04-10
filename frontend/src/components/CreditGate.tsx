import { Children, cloneElement, isValidElement, useState, type ReactElement, type MouseEvent, type ReactNode } from 'react'
import CreditsModal from '@/components/CreditsModal'

interface CreditGateProps {
  currentBalance: number
  requiredCredits: number
  onSufficientCredits: () => void
  children: ReactNode
}

export default function CreditGate({
  currentBalance,
  requiredCredits,
  onSufficientCredits,
  children,
}: CreditGateProps) {
  const [gateOpen, setGateOpen] = useState(false)

  const handleActivationAttempt = (e?: MouseEvent) => {
    e?.preventDefault()
    if (currentBalance >= requiredCredits) {
      onSufficientCredits()
    } else {
      setGateOpen(true)
    }
  }

  const child = Children.only(children)
  const trigger = isValidElement(child)
    ? cloneElement(child as ReactElement<{ onClick?: (e: MouseEvent) => void }>, {
        onClick: handleActivationAttempt,
      })
    : child

  return (
    <>
      {trigger}
      <CreditsModal
        open={gateOpen}
        onOpenChange={setGateOpen}
        currentBalance={currentBalance}
        mode="gate"
        requiredCredits={requiredCredits}
      />
    </>
  )
}
