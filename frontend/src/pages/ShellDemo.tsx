import { useState, useCallback, useMemo } from 'react'
import AppShell, { type Mode, type ChatContext } from '@/components/AppShell'
import SellingList from '@/pages/SellingList'
import SellerDealRoomView, { DEAL_ROOM_CHAT_MESSAGES } from '@/pages/SellerDealRoomView'

// ── Page identifiers ────────────────────────────────────────────────────────

type Page =
  | { mode: 'sell'; view: 'listings' }
  | { mode: 'sell'; view: 'dealRoom' }
  | { mode: 'buy'; view: 'landing' }
  | { mode: 'strategy'; view: 'landing' }

function pageKey(p: Page) {
  return `${p.mode}:${p.view}`
}

const MODE_LANDING: Record<Mode, Page> = {
  sell: { mode: 'sell', view: 'listings' },
  buy: { mode: 'buy', view: 'landing' },
  strategy: { mode: 'strategy', view: 'landing' },
}

// ── Component ───────────────────────────────────────────────────────────────

export default function ShellDemo() {
  const [page, setPage] = useState<Page>({ mode: 'sell', view: 'listings' })
  const [history, setHistory] = useState<Page[]>([{ mode: 'sell', view: 'listings' }])
  const [historyIndex, setHistoryIndex] = useState(0)

  const navigateTo = useCallback((next: Page) => {
    setHistory((prev) => {
      // Trim any forward history and append
      const trimmed = prev.slice(0, historyIndex + 1)
      return [...trimmed, next]
    })
    setHistoryIndex((i) => i + 1)
    setPage(next)
  }, [historyIndex])

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1
      setHistoryIndex(newIdx)
      setPage(history[newIdx])
    }
  }, [history, historyIndex])

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1
      setHistoryIndex(newIdx)
      setPage(history[newIdx])
    }
  }, [history, historyIndex])

  const handleModeChange = useCallback((mode: Mode) => {
    navigateTo(MODE_LANDING[mode])
  }, [navigateTo])

  const handleNavChange = useCallback((_index: number, label: string) => {
    // Sidebar nav item clicked — navigate to the appropriate page
    if (label === 'Your Listings') {
      navigateTo({ mode: 'sell', view: 'listings' })
    }
    // Other nav items just stay on their mode landing for now
  }, [navigateTo])

  // Build deal-specific chat context when viewing a deal room
  const chatContext = useMemo<ChatContext | undefined>(() => {
    if (page.mode === 'sell' && page.view === 'dealRoom') {
      return {
        messages: DEAL_ROOM_CHAT_MESSAGES.map((m) => ({
          role: m.role === 'seller' ? 'user' as const : 'ai' as const,
          text: m.text,
          time: m.time,
        })),
        contextLabel: 'Magnolia Farms BFR',
        skills: ['Analyze deal', 'Buyer activity', 'Pricing guidance', 'Document status'],
      }
    }
    return undefined
  }, [page])

  return (
    <AppShell
      activeMode={page.mode}
      onModeChange={handleModeChange}
      onNavChange={handleNavChange}
      onBack={goBack}
      onForward={goForward}
      canGoBack={historyIndex > 0}
      canGoForward={historyIndex < history.length - 1}
      chatContext={chatContext}
    >
      {page.mode === 'sell' && page.view === 'listings' && (
        <SellingList onOpenDealRoom={() => navigateTo({ mode: 'sell', view: 'dealRoom' })} />
      )}
      {page.mode === 'sell' && page.view === 'dealRoom' && (
        <SellerDealRoomView onBack={() => navigateTo({ mode: 'sell', view: 'listings' })} />
      )}
      {page.mode === 'buy' && (
        <PlaceholderPage mode="buy" title="Your Deals" description="Buy mode pages are coming soon." />
      )}
      {page.mode === 'strategy' && (
        <PlaceholderPage mode="strategy" title="Your Strategies" description="Strategy mode pages are coming soon." />
      )}
    </AppShell>
  )
}

// ── Placeholder for modes that don't have pages yet ─────────────────────────

function PlaceholderPage({ mode, title, description }: { mode: string; title: string; description: string }) {
  const accentMap: Record<string, string> = {
    buy: 'text-mode-buy',
    strategy: 'text-mode-strategy',
  }
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-5">
      <h1 className={`text-2xl font-bold ${accentMap[mode] ?? 'text-foreground'}`}>{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
