import { useEffect, type ReactNode } from 'react'

interface OnboardingShellProps {
  children: ReactNode
  showChat?: boolean       // default false — hidden in Bucket 1, shown in Bucket 2
  step?: number            // current step (1-based)
  totalSteps?: number      // total steps for progress dots
}

export default function OnboardingShell({ children, step, totalSteps }: OnboardingShellProps) {
  const showDots = step !== undefined && totalSteps !== undefined

  // Default to dark mode for onboarding
  useEffect(() => {
    document.documentElement.classList.add('dark')
    return () => { document.documentElement.classList.remove('dark') }
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar — logo only during onboarding */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <span className="text-lg font-semibold text-foreground">NextLevel</span>
      </div>

      {/* Progress dots */}
      {showDots && (
        <div className="flex justify-center gap-2 py-3">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${i + 1 <= step ? 'bg-foreground' : 'bg-border'}`}
            />
          ))}
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}
