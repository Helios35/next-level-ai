import { useState, useCallback, useMemo, useEffect } from 'react'
import AppShell, { type Mode, type ChatContext } from '@/components/AppShell'
import SellingList from '@/pages/SellingList'
import SellerDealRoomView, { DEAL_ROOM_CHAT_MESSAGES } from '@/pages/SellerDealRoomView'
import CreateListingWizard, { type WizardFormState, type ListingDraft } from '@/pages/CreateListingWizard'
import SellerDraftsPage from '@/pages/SellerDraftsPage'

// ── Page identifiers ────────────────────────────────────────────────────────

type Page =
  | { mode: 'sell'; view: 'listings' }
  | { mode: 'sell'; view: 'dealRoom'; dealId: string }
  | { mode: 'sell'; view: 'createListing' }
  | { mode: 'sell'; view: 'drafts' }
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

// ── Wizard script ───────────────────────────────────────────────────────────

const WIZARD_OPENING =
  "Let\u2019s get your listing set up. Tell me about the property \u2014 type, location, and your pricing expectations."

const WIZARD_SCRIPT = [
  "Got it \u2014 I\u2019ve captured the deal overview. Now let\u2019s get the asset-specific details. Tell me about the product type and where you are in the development timeline.",
  "Almost there \u2014 I\u2019ve locked in the asset specs. Let\u2019s position the sale. Where are you in the deal process?",
  "Perfect. Any documents you want to attach upfront? I\u2019ll flag anything missing as pending \u2014 you can always upload later.",
  "I\u2019ve got everything I need. Here\u2019s your draft listing \u2014 review the details below and submit when you\u2019re ready.",
]

// ── Component ───────────────────────────────────────────────────────────────

export default function ShellDemo() {
  const [page, setPage] = useState<Page>({ mode: 'sell', view: 'listings' })
  const [history, setHistory] = useState<Page[]>([{ mode: 'sell', view: 'listings' }])
  const [historyIndex, setHistoryIndex] = useState(0)

  // Wizard state
  const [wizardStep, setWizardStep] = useState(0)
  const [wizardMessages, setWizardMessages] = useState<
    { role: 'ai' | 'user'; text: string; time: string }[]
  >([])

  // Draft state
  const [drafts, setDrafts] = useState<ListingDraft[]>([])
  const [resumeDraft, setResumeDraft] = useState<{
    formState: WizardFormState
    step: number
  } | null>(null)

  const navigateTo = useCallback((next: Page) => {
    setHistory((prev) => {
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
    if (label === 'Your Listings') {
      navigateTo({ mode: 'sell', view: 'listings' })
    } else if (label === 'Create Listing') {
      navigateTo({ mode: 'sell', view: 'createListing' })
    } else if (label === 'Drafts') {
      navigateTo({ mode: 'sell', view: 'drafts' })
    }
  }, [navigateTo])

  // Initialize / reset wizard state when entering the create listing page
  useEffect(() => {
    if (page.mode === 'sell' && page.view === 'createListing') {
      const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

      if (resumeDraft) {
        // Restore wizard to saved step, replay scripted conversation
        setWizardStep(resumeDraft.step)
        const msgs: typeof wizardMessages = [
          { role: 'ai', text: WIZARD_OPENING, time: now },
        ]
        for (let i = 0; i < resumeDraft.step; i++) {
          msgs.push({ role: 'user', text: '…', time: now })
          msgs.push({ role: 'ai', text: WIZARD_SCRIPT[i], time: now })
        }
        setWizardMessages(msgs)
      } else {
        setWizardMessages([{ role: 'ai', text: WIZARD_OPENING, time: now }])
        setWizardStep(0)
      }
    }
  }, [pageKey(page)])

  // Clear resume draft after it's been consumed by the wizard mount
  useEffect(() => {
    if (resumeDraft && page.mode === 'sell' && page.view === 'createListing') {
      const timer = setTimeout(() => setResumeDraft(null), 0)
      return () => clearTimeout(timer)
    }
  }, [resumeDraft, pageKey(page)])

  // Draft handlers
  const handleSaveAsDraft = useCallback((formState: WizardFormState, currentStep: number) => {
    const draft: ListingDraft = {
      id: crypto.randomUUID(),
      formState,
      wizardStep: currentStep,
      savedAt: new Date().toISOString(),
    }
    setDrafts(prev => [...prev, draft])
    navigateTo({ mode: 'sell', view: 'drafts' })
  }, [navigateTo])

  const handleContinueDraft = useCallback((draftId: string) => {
    const draft = drafts.find(d => d.id === draftId)
    if (!draft) return
    setResumeDraft({ formState: draft.formState, step: draft.wizardStep })
    setDrafts(prev => prev.filter(d => d.id !== draftId))
    navigateTo({ mode: 'sell', view: 'createListing' })
  }, [drafts, navigateTo])

  // Wizard send handler — advances the scripted conversation
  const handleWizardSend = useCallback((userText: string) => {
    if (wizardStep >= 4) return

    const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    const userMsg = { role: 'user' as const, text: userText, time: now }
    const aiMsg = { role: 'ai' as const, text: WIZARD_SCRIPT[wizardStep], time: now }

    setWizardMessages((prev) => [...prev, userMsg, aiMsg])
    setWizardStep((prev) => prev + 1)
  }, [wizardStep])

  // Build page-specific chat context
  const chatContext = useMemo<ChatContext | undefined>(() => {
    if (page.mode === 'sell' && page.view === 'createListing') {
      return {
        messages: wizardMessages,
        contextLabel: 'New Listing',
        skills: [],
      }
    }
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
  }, [page, wizardMessages])

  const isCreateListing = page.mode === 'sell' && page.view === 'createListing'

  // Map current page to sidebar nav index (sell mode: 0=Listings, 1=Create, 2=Drafts)
  const activeNavIndex = useMemo(() => {
    if (page.mode !== 'sell') return 0
    if (page.view === 'listings' || page.view === 'dealRoom') return 0
    if (page.view === 'createListing') return 1
    if (page.view === 'drafts') return 2
    return 0
  }, [page])

  return (
    <AppShell
      activeMode={page.mode}
      activeNavIndex={activeNavIndex}
      onModeChange={handleModeChange}
      onNavChange={handleNavChange}
      onBack={goBack}
      onForward={goForward}
      canGoBack={historyIndex > 0}
      canGoForward={historyIndex < history.length - 1}
      chatContext={chatContext}
      onSendMessage={isCreateListing ? handleWizardSend : undefined}
    >
      {page.mode === 'sell' && page.view === 'listings' && (
        <SellingList onOpenDealRoom={(deal) => navigateTo({ mode: 'sell', view: 'dealRoom', dealId: deal.id })} />
      )}
      {page.mode === 'sell' && page.view === 'dealRoom' && (
        <SellerDealRoomView dealId={page.dealId} onBack={() => navigateTo({ mode: 'sell', view: 'listings' })} />
      )}
      {isCreateListing && (
        <CreateListingWizard
          step={wizardStep}
          onSubmit={() => navigateTo({ mode: 'sell', view: 'listings' })}
          onSaveAsDraft={handleSaveAsDraft}
          initialState={resumeDraft?.formState}
        />
      )}
      {page.mode === 'sell' && page.view === 'drafts' && (
        <SellerDraftsPage
          drafts={drafts}
          onContinue={handleContinueDraft}
          onDelete={(id) => setDrafts(prev => prev.filter(d => d.id !== id))}
        />
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
