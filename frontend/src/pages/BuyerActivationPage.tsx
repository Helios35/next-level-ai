import { useState, useEffect, useRef } from 'react'
import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'

// ── Scripted conversation ──────────────────────────────────────────────────

interface ScriptMessage {
  role: 'ai' | 'user'
  text: string
}

const SCRIPT: ScriptMessage[] = [
  {
    role: 'ai',
    text: "Welcome to NextLevel. I\u2019m here to help you find the right deals. Tell me \u2014 what are you looking to buy? Asset type, location, and deal size are a great place to start.",
  },
  {
    role: 'user',
    text: 'Looking for multifamily in the Southeast \u2014 50 to 150 units. Budget around $15M\u2013$25M.',
  },
  {
    role: 'ai',
    text: "Got it. And what geography are you focused on \u2014 are you market-specific or open to a broader region?",
  },
  {
    role: 'user',
    text: 'Primarily Atlanta and Charlotte metros, but open to Nashville if the numbers work.',
  },
  {
    role: 'ai',
    text: "Good. Last thing before we build your strategy \u2014 what\u2019s your typical equity check size per deal?",
  },
  {
    role: 'user',
    text: 'Usually $3M\u2013$5M equity, rest is agency debt.',
  },
  {
    role: 'ai',
    text: "Perfect. I have what I need. Let me set up your strategy now.",
  },
  {
    role: 'ai',
    text: "Your strategy is live. I\u2019ve found 7 deals matching your criteria. Want to take one more step and complete your buyer profile? It strengthens your position when seats are allocated.",
  },
]

// ── Component ──────────────────────────────────────────────────────────────

interface BuyerActivationPageProps {
  onCompleteProfile: () => void
  onSkip: () => void
}

export default function BuyerActivationPage({ onCompleteProfile, onSkip }: BuyerActivationPageProps) {
  const [visibleCount, setVisibleCount] = useState(1)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Progressive reveal — show next message after a delay
  useEffect(() => {
    if (visibleCount >= SCRIPT.length) return

    const next = SCRIPT[visibleCount]
    // Shorter delay for user messages, longer for AI
    const delay = next.role === 'user' ? 800 : 1200
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), delay)
    return () => clearTimeout(timer)
  }, [visibleCount])

  // Auto-scroll as new messages appear
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [visibleCount])

  const showCta = visibleCount >= SCRIPT.length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            <span className="text-mode-buy">NextLevel</span> Buyer Activation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Let\u2019s set up your strategy and start matching you with deals.
          </p>
        </div>

        {/* Chat messages */}
        <div className="flex-1 space-y-4 mb-8">
          {SCRIPT.slice(0, visibleCount).map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2.5`}
            >
              {msg.role === 'ai' && (
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-mode-buy/10 flex items-center justify-center mt-0.5">
                  <Bot className="w-4 h-4 text-mode-buy" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'ai'
                    ? 'bg-card border border-border text-foreground'
                    : 'bg-mode-buy text-white'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator while messages are still revealing */}
          {!showCta && (
            <div className="flex justify-start gap-2.5">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-mode-buy/10 flex items-center justify-center mt-0.5">
                <Bot className="w-4 h-4 text-mode-buy" />
              </div>
              <div className="bg-card border border-border rounded-lg px-3.5 py-2.5">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* CTA buttons — visible after final message */}
        {showCta && (
          <div className="border-t border-border pt-6 pb-4 space-y-3">
            <Button
              className="w-full bg-mode-buy text-white hover:bg-mode-buy/80"
              size="lg"
              onClick={onCompleteProfile}
            >
              Complete My Profile
            </Button>
            <button
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={onSkip}
            >
              Not Now
            </button>
          </div>
        )}

        {/* Decorative input area (disabled) */}
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-2 rounded-lg border border-input bg-transparent px-3 py-2 opacity-50">
            <span className="text-sm text-muted-foreground flex-1">Type a message…</span>
          </div>
        </div>
      </div>
    </div>
  )
}
