import { useEffect } from 'react'
import { PreAuthBackground } from '@/components/ui/pre-auth-background'

interface LandingPageProps {
  onSellerCTA: () => void
  onBuyerCTA: () => void
  onLogin: () => void
}

export default function LandingPage({ onSellerCTA, onBuyerCTA, onLogin }: LandingPageProps) {
  // Default to dark mode for pre-auth pages
  useEffect(() => {
    document.documentElement.classList.add('dark')
    return () => { document.documentElement.classList.remove('dark') }
  }, [])

  return (
    <div className="relative min-h-screen flex flex-col">
      <PreAuthBackground />
      {/* Logo */}
      <div className="px-6 py-4">
        <span className="text-lg font-semibold text-foreground">NextLevel</span>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
        <div className="space-y-3 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Demand-first. Match-first.
          </h1>
          <p className="text-base text-muted-foreground max-w-md mx-auto">
            The disposition platform for serious real estate operators.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onSellerCTA}
            className="bg-mode-sell hover:bg-mode-sell/80 text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            I'm a Seller
          </button>
          <button
            onClick={onBuyerCTA}
            className="bg-mode-buy hover:bg-mode-buy/80 text-white px-8 py-3 rounded-lg text-sm font-medium transition-colors"
          >
            I'm a Buyer
          </button>
        </div>

        <button
          onClick={onLogin}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Already have an account? Log in
        </button>
      </div>
    </div>
  )
}
