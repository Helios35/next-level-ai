import { useState, useCallback, useMemo, useEffect } from 'react'
import AppShell, { type Mode, type ChatContext } from '@/components/AppShell'
import SellingList from '@/pages/SellingList'
import SellerDealRoomView, { DEAL_ROOM_CHAT_MESSAGES } from '@/pages/SellerDealRoomView'
import CreateListingWizard, { type WizardFormState, type ListingDraft } from '@/pages/CreateListingWizard'
import SellerDraftsPage from '@/pages/SellerDraftsPage'
import YourDeals from '@/pages/YourDeals'
import DiscoverDeals from '@/pages/DiscoverDeals'
import AccessRequested from '@/pages/AccessRequested'
import YourStrategies from '@/pages/YourStrategies'
import CreateStrategyWizard, { type StrategyFormState, type StrategyDraft } from '@/pages/CreateStrategyWizard'
import StrategyDrafts from '@/pages/StrategyDrafts'
import BuyerDealRoomView, { BUYER_DEAL_ROOM_CHAT } from '@/pages/BuyerDealRoomView'
import BuyerActivationPage from '@/pages/BuyerActivationPage'
import BuyerQualificationForm from '@/pages/BuyerQualificationForm'
import LandingPage from '@/pages/LandingPage'
import LoginPage from '@/pages/LoginPage'
import SignUp from '@/pages/SignUp'
import Onboarding from '@/pages/Onboarding'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'
import { MOCK_CURRENT_USER } from '@/data/mock/users'
import { MOCK_BUYER_STRATEGIES } from '@/data/mock/buyerStrategies'
import CreditsModal from '@/components/CreditsModal'
import { postLoginRoute } from '@/utils/postLoginRoute'
import type { User } from '@shared/types/user'
import type { UserRole } from '@shared/types/enums'
import { MOCK_SELLER_DEAL_ROOMS } from '@/data/mock/dealRooms'
import { Sparkles, FileSearch, HelpCircle, Users } from 'lucide-react'
import type { AiTip } from '@/components/ui/ai-tip-card'
import InternalLogin from '@/pages/InternalLogin'
import InternalShell from '@/components/InternalShell'
import DSShell, { DSHeaderNav } from '@/pages/ds/DSShell'
import type { DsView } from '@/pages/ds/DSShell'
import DSTaskQueue from '@/pages/ds/DSTaskQueue'
import DSPipeline from '@/pages/ds/DSPipeline'
import DSNotifications from '@/pages/ds/DSNotifications'
import DSDealView from '@/pages/ds/DSDealView'
import DSClients from '@/pages/ds/DSClients'
import DSSellerProfile from '@/pages/ds/DSSellerProfile'
import DSBuyerProfile from '@/pages/ds/DSBuyerProfile'
import type { InternalUser } from '@shared/types/internalUser'
import type { InternalRole } from '@shared/types/enums'

// ── Page identifiers ────────────────────────────────────────────────────────

type Page =
  | { mode: 'sell'; view: 'listings' }
  | { mode: 'sell'; view: 'dealRoom'; dealId: string }
  | { mode: 'sell'; view: 'createListing' }
  | { mode: 'sell'; view: 'drafts' }
  | { mode: 'buy'; view: 'yourDeals' }
  | { mode: 'buy'; view: 'discoverDeals' }
  | { mode: 'buy'; view: 'accessRequested' }
  | { mode: 'buy'; view: 'dealRoom'; dealId: string }
  | { mode: 'buy'; view: 'activation' }
  | { mode: 'buy'; view: 'qualification' }
  | { mode: 'strategy'; view: 'yourStrategies' }
  | { mode: 'strategy'; view: 'createStrategy'; strategyId?: string }
  | { mode: 'strategy'; view: 'drafts' }
  | { mode: 'auth'; view: 'landing' }
  | { mode: 'auth'; view: 'login' }
  | { mode: 'auth'; view: 'signup'; role?: UserRole }
  | { mode: 'auth'; view: 'onboarding' }
  | { mode: 'global'; view: 'profile' }
  | { mode: 'global'; view: 'settings' }
  | { mode: 'internal'; view: 'login' }
  | { mode: 'internal'; view: 'portal'; role: InternalRole; dsView?: DsView }
  | { mode: 'internal'; view: 'deal'; role: 'ds'; dealId: string; dealTab?: string }
  | { mode: 'internal'; view: 'seller-profile'; role: 'ds'; sellerId: string }
  | { mode: 'internal'; view: 'buyer-profile'; role: 'ds'; buyerId: string }

function pageKey(p: Page) {
  if (p.mode === 'auth' && p.view === 'signup' && p.role) {
    return `auth:signup:${p.role}`
  }
  if (p.mode === 'strategy' && p.view === 'createStrategy' && p.strategyId) {
    return `strategy:createStrategy:${p.strategyId}`
  }
  if (p.mode === 'internal' && p.view === 'portal' && p.dsView) {
    return `internal:portal:${p.role}:${p.dsView}`
  }
  if (p.mode === 'internal' && p.view === 'deal') {
    return `internal:deal:${p.dealId}:${p.dealTab ?? 'overview'}`
  }
  if (p.mode === 'internal' && p.view === 'seller-profile') {
    return `internal:seller:${p.sellerId}`
  }
  if (p.mode === 'internal' && p.view === 'buyer-profile') {
    return `internal:buyer:${p.buyerId}`
  }
  return `${p.mode}:${p.view}`
}

const MODE_LANDING: Record<Mode, Page> = {
  sell: { mode: 'sell', view: 'listings' },
  buy: { mode: 'buy', view: 'yourDeals' },
  strategy: { mode: 'strategy', view: 'yourStrategies' },
}

// ── Wizard script ───────────────────────────────────────────────────────────

const WIZARD_OPENING =
  "Let\u2019s get your listing set up. Tell me about the property \u2014 type, location, and your pricing expectations."

const WIZARD_SCRIPT = [
  "Got it \u2014 I\u2019ve captured the deal overview. Now let\u2019s get the asset-specific details. Tell me about the product type and where you are in the development timeline.",
  "Almost there \u2014 I\u2019ve locked in the asset specs. Let\u2019s position the sale. Where are you in the deal process?",
  "Perfect. Any documents you want to attach upfront? I\u2019ll flag anything missing as pending \u2014 you can always upload later.",
  "Looking good \u2014 I\u2019ve collected what I need on documents. Let me know when you\u2019re ready and I\u2019ll pull together your listing for review.",
]

const WIZARD_REVIEW_PROMPT =
  "I\u2019ve got everything I need. Here\u2019s your draft listing \u2014 review the details below and submit when you\u2019re ready."

// ── Strategy wizard script ─────────────────────────────────────────────────

const STRATEGY_WIZARD_OPENING =
  "Let\u2019s build your strategy. Tell me what you\u2019re looking to buy \u2014 asset type, location, and deal size are a good starting point."

const STRATEGY_WIZARD_SCRIPT = [
  "Got it \u2014 I\u2019ve captured your core criteria. Now let\u2019s get more specific on the asset type details.",
  "Good. Let\u2019s add some optional refinements \u2014 or skip ahead and save your strategy now.",
  "Here\u2019s your strategy summary. Review the details and save when you\u2019re ready.",
]

// ── Component ───────────────────────────────────────────────────────────────

export default function ShellDemo() {
  const [page, setPage] = useState<Page>({ mode: 'auth', view: 'landing' })
  const [history, setHistory] = useState<Page[]>([{ mode: 'auth', view: 'landing' }])
  const [historyIndex, setHistoryIndex] = useState(0)
  // Remembered last mode-tab so the shell still renders correctly while on
  // mode-agnostic global pages (Profile / Settings).
  const [lastMode, setLastMode] = useState<Mode>('sell')

  // Wizard state
  const [wizardStep, setWizardStep] = useState(0)
  const [wizardMessages, setWizardMessages] = useState<
    { role: 'ai' | 'user'; text: string; time: string; attachment?: { docName: string; fileName: string } }[]
  >([])
  const [wizardDocuments, setWizardDocuments] = useState<
    { name: string; status: string; fileName?: string }[]
  >([])

  // Draft state
  const [drafts, setDrafts] = useState<ListingDraft[]>([])
  const [resumeDraft, setResumeDraft] = useState<{
    formState: WizardFormState
    step: number
  } | null>(null)

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [internalUser, setInternalUser] = useState<InternalUser | null>(null)

  // Credits modal state
  const [creditsModalOpen, setCreditsModalOpen] = useState(false)

  // Strategy wizard state
  const [strategyWizardStep, setStrategyWizardStep] = useState(0)
  const [strategyWizardMessages, setStrategyWizardMessages] = useState<
    { role: 'ai' | 'user'; text: string; time: string }[]
  >([])
  const [strategyDrafts, setStrategyDrafts] = useState<StrategyDraft[]>([])
  const [strategyResumeDraft, setStrategyResumeDraft] = useState<{
    formState: StrategyFormState
    step: number
  } | null>(null)

  // Buyer deal room chat state
  const [buyerDealRoomMessages, setBuyerDealRoomMessages] = useState<
    { role: 'ai' | 'user'; text: string; time: string }[]
  >([])

  // Initialize buyer deal room messages from mock data when entering a buyer deal room
  useEffect(() => {
    if (page.mode === 'buy' && page.view === 'dealRoom') {
      setBuyerDealRoomMessages(
        BUYER_DEAL_ROOM_CHAT.map((m) => ({
          role: m.senderRole === 'buyer' ? 'user' as const : 'ai' as const,
          text: m.content,
          time: new Date(m.timestamp).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
          }),
        })),
      )
    }
  }, [pageKey(page)])

  const handleBuyerDealRoomMessage = useCallback((text: string) => {
    const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    setBuyerDealRoomMessages((prev) => [
      ...prev,
      { role: 'user', text, time: now },
      { role: 'ai', text: "Great question \u2014 I've flagged this for our team and you'll hear back shortly.", time: now },
    ])
  }, [])

  const getDealName = (dealId: string) =>
    MOCK_SELLER_DEAL_ROOMS.find((d) => d.id === dealId)?.name ?? 'Deal Room'

  const navigateTo = useCallback((next: Page) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1)
      return [...trimmed, next]
    })
    setHistoryIndex((i) => i + 1)
    setPage(next)
    if (next.mode === 'sell' || next.mode === 'buy' || next.mode === 'strategy') {
      setLastMode(next.mode)
    }
  }, [historyIndex])

  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1
      setHistoryIndex(newIdx)
      const target = history[newIdx]
      setPage(target)
      if (target.mode === 'sell' || target.mode === 'buy' || target.mode === 'strategy') {
        setLastMode(target.mode)
      }
    }
  }, [history, historyIndex])

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1
      setHistoryIndex(newIdx)
      const target = history[newIdx]
      setPage(target)
      if (target.mode === 'sell' || target.mode === 'buy' || target.mode === 'strategy') {
        setLastMode(target.mode)
      }
    }
  }, [history, historyIndex])

  const handleModeChange = useCallback((mode: Mode) => {
    navigateTo(MODE_LANDING[mode])
  }, [navigateTo])

  const handleNavChange = useCallback((_index: number, label: string) => {
    // Sell mode nav
    if (label === 'Your Listings') {
      navigateTo({ mode: 'sell', view: 'listings' })
    } else if (label === 'Create Listing') {
      navigateTo({ mode: 'sell', view: 'createListing' })
    } else if (label === 'Drafts' && page.mode === 'sell') {
      navigateTo({ mode: 'sell', view: 'drafts' })
    }
    // Buy mode nav
    else if (label === 'Your Deals') {
      navigateTo({ mode: 'buy', view: 'yourDeals' })
    } else if (label === 'Discover Deals') {
      navigateTo({ mode: 'buy', view: 'discoverDeals' })
    } else if (label === 'Access Requested') {
      navigateTo({ mode: 'buy', view: 'accessRequested' })
    }
    // Strategy mode nav
    else if (label === 'Your Strategies') {
      navigateTo({ mode: 'strategy', view: 'yourStrategies' })
    } else if (label === 'Create Strategy') {
      navigateTo({ mode: 'strategy', view: 'createStrategy' })
    } else if (label === 'Drafts' && page.mode === 'strategy') {
      navigateTo({ mode: 'strategy', view: 'drafts' })
    }
  }, [navigateTo, page.mode])

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
        setWizardDocuments([])
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

  // Populate pending documents when step reaches 4
  useEffect(() => {
    if (wizardStep >= 4 && wizardDocuments.length === 0) {
      setWizardDocuments([
        { name: 'Purchase & Sale Agreement', status: 'pending' },
        { name: 'Survey / Site Plan', status: 'pending' },
        { name: 'Pro Forma', status: 'pending' },
      ])
    }
  }, [wizardStep, wizardDocuments.length])

  // Handle document upload from chat or wizard
  const handleDocumentUpload = useCallback((docName: string, fileName: string) => {
    setWizardDocuments((prev) =>
      prev.map((d) => (d.name === docName ? { ...d, status: 'uploaded', fileName } : d)),
    )
    const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    const pendingCount = wizardDocuments.filter(
      (d) => d.status === 'pending' && d.name !== docName,
    ).length
    const aiText =
      pendingCount > 0
        ? `Got it — I've received your ${docName}. ${pendingCount} document${pendingCount === 1 ? '' : 's'} still pending.`
        : `Got it — I've received your ${docName}. All documents are in!`
    setWizardMessages((prev) => [
      ...prev,
      { role: 'user', text: '', time: now, attachment: { docName, fileName } },
      { role: 'ai', text: aiText, time: now },
    ])

    // Auto-advance to review when all documents are uploaded
    if (pendingCount === 0) {
      setTimeout(() => {
        setWizardMessages((prev) => [
          ...prev,
          { role: 'ai', text: WIZARD_REVIEW_PROMPT, time: now },
        ])
        setWizardStep(5)
      }, 600)
    }
  }, [wizardDocuments])

  // Wizard send handler — advances the scripted conversation
  const handleWizardSend = useCallback((userText: string) => {
    if (wizardStep >= 5) return

    const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    const userMsg = { role: 'user' as const, text: userText, time: now }

    // Step 4 (documents) → 5 (review): flag remaining docs as pending, advance
    if (wizardStep === 4) {
      const pending = wizardDocuments.filter((d) => d.status === 'pending')
      const pendingNote =
        pending.length > 0
          ? ` I\u2019ve flagged ${pending.map((d) => d.name).join(', ')} as pending \u2014 you can upload ${pending.length === 1 ? 'it' : 'them'} anytime.`
          : ''
      const aiMsg = { role: 'ai' as const, text: WIZARD_REVIEW_PROMPT + pendingNote, time: now }
      setWizardMessages((prev) => [...prev, userMsg, aiMsg])
      setWizardStep(5)
      return
    }

    const aiMsg = { role: 'ai' as const, text: WIZARD_SCRIPT[wizardStep], time: now }
    setWizardMessages((prev) => [...prev, userMsg, aiMsg])
    setWizardStep((prev) => prev + 1)
  }, [wizardStep, wizardDocuments])

  // ── Strategy wizard lifecycle ─────────────────────────────────────────────

  // Initialize / reset strategy wizard state when entering create strategy page
  useEffect(() => {
    if (page.mode === 'strategy' && page.view === 'createStrategy') {
      const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

      if (strategyResumeDraft) {
        setStrategyWizardStep(strategyResumeDraft.step)
        const msgs: typeof strategyWizardMessages = [
          { role: 'ai', text: STRATEGY_WIZARD_OPENING, time: now },
        ]
        for (let i = 0; i < strategyResumeDraft.step; i++) {
          msgs.push({ role: 'user', text: '\u2026', time: now })
          msgs.push({ role: 'ai', text: STRATEGY_WIZARD_SCRIPT[i], time: now })
        }
        setStrategyWizardMessages(msgs)
      } else {
        setStrategyWizardMessages([{ role: 'ai', text: STRATEGY_WIZARD_OPENING, time: now }])
        setStrategyWizardStep(0)
      }
    }
  }, [pageKey(page)])

  // Clear strategy resume draft after consumed
  useEffect(() => {
    if (strategyResumeDraft && page.mode === 'strategy' && page.view === 'createStrategy') {
      const timer = setTimeout(() => setStrategyResumeDraft(null), 0)
      return () => clearTimeout(timer)
    }
  }, [strategyResumeDraft, pageKey(page)])

  // Strategy draft handlers
  const handleSaveStrategyAsDraft = useCallback((formState: StrategyFormState, currentStep: number) => {
    const draft: StrategyDraft = {
      id: crypto.randomUUID(),
      formState,
      wizardStep: currentStep,
      savedAt: new Date().toISOString(),
    }
    setStrategyDrafts(prev => [...prev, draft])
    navigateTo({ mode: 'strategy', view: 'drafts' })
  }, [navigateTo])

  const handleContinueStrategyDraft = useCallback((draftId: string) => {
    const draft = strategyDrafts.find(d => d.id === draftId)
    if (!draft) return
    setStrategyResumeDraft({ formState: draft.formState, step: draft.wizardStep })
    setStrategyDrafts(prev => prev.filter(d => d.id !== draftId))
    navigateTo({ mode: 'strategy', view: 'createStrategy' })
  }, [strategyDrafts, navigateTo])

  // Strategy wizard send handler
  const handleStrategyWizardSend = useCallback((userText: string) => {
    if (strategyWizardStep >= 3) return

    const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    const userMsg = { role: 'user' as const, text: userText, time: now }
    const aiMsg = { role: 'ai' as const, text: STRATEGY_WIZARD_SCRIPT[strategyWizardStep], time: now }
    setStrategyWizardMessages((prev) => [...prev, userMsg, aiMsg])
    setStrategyWizardStep((prev) => prev + 1)
  }, [strategyWizardStep])

  // Derive initialState for edit mode from mock data
  const editStrategyInitialState = useMemo<StrategyFormState | undefined>(() => {
    if (page.mode !== 'strategy' || page.view !== 'createStrategy' || !page.strategyId) return undefined
    const s = MOCK_BUYER_STRATEGIES.find((b) => b.id === page.strategyId)
    if (!s) return undefined
    return {
      name: s.name,
      assetType: s.assetType,
      assetSubType: s.assetSubType,
      geography: (s.sharedCriteria?.geography as string) ?? '',
      dealSizeMin: (s.sharedCriteria?.dealSizeMin as number) ?? 5_000_000,
      dealSizeMax: (s.sharedCriteria?.dealSizeMax as number) ?? 25_000_000,
      tier2Fields: { ...s.uniqueCriteria },
      tier3Fields: { ...(s.optionalCriteria ?? {}) },
    }
  }, [page])

  // Build page-specific chat context
  const chatContext = useMemo<ChatContext | undefined>(() => {
    if (page.mode === 'sell' && page.view === 'createListing') {
      return {
        messages: wizardMessages,
        contextLabel: 'New Listing',
        skills: [],
        onAttach: wizardStep >= 4 ? handleDocumentUpload : undefined,
        pendingDocs: wizardStep >= 4 ? wizardDocuments : undefined,
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
    if (page.mode === 'buy' && page.view === 'dealRoom') {
      const dealRoomTips: AiTip[] = [
        { id: 'summary', icon: Sparkles, label: 'Get Deal Summary', description: 'AI overview of key deal metrics and terms', prompt: 'Give me a summary of this deal', featured: true },
        { id: 'docs', icon: FileSearch, label: 'Ask About the Documents', description: 'Questions about uploaded deal docs', prompt: 'Ask about the documents' },
        { id: 'offer', icon: HelpCircle, label: 'How Does the Offer Process Work?', description: 'Rounds, timing, and submission rules', prompt: 'How does the offer process work?' },
        { id: 'competition', icon: Users, label: 'What Is My Competition?', description: 'Anonymized buyer pool insights', prompt: 'What is my competition?' },
      ]
      return {
        messages: buyerDealRoomMessages,
        contextLabel: getDealName(page.dealId),
        tips: dealRoomTips,
      }
    }
    if (page.mode === 'buy') {
      return {
        messages: [
          { role: 'ai' as const, text: "Good morning, James. I've found 3 new deals matching your Phoenix multifamily strategy. Want me to walk you through them?", time: '9:04 AM' },
          { role: 'user' as const, text: 'Yes, show me the best match first.', time: '9:04 AM' },
          { role: 'ai' as const, text: 'The top match is a 24-unit multifamily asset in Scottsdale — 94% match score. Strong rent roll, stabilized. Want me to request access?', time: '9:05 AM' },
        ],
        contextLabel: 'Deals',
        skills: ['Show top matches', 'Summarize activity', 'Filter by type'],
      }
    }
    if (page.mode === 'strategy' && page.view === 'createStrategy') {
      return {
        messages: strategyWizardMessages,
        contextLabel: 'New Strategy',
        skills: ['What should I include?', 'Explain matching', 'Tier 2 fields'],
      }
    }
    if (page.mode === 'strategy') {
      return {
        messages: [
          { role: 'ai' as const, text: "Your strategies are broadcasting. I\u2019ll notify you when new matches come in.", time: '9:00 AM' },
        ],
        contextLabel: 'Strategies',
        skills: ['Show match summary', 'Edit strategy', 'Create new strategy'],
      }
    }
    return undefined
  }, [page, wizardMessages, wizardStep, wizardDocuments, handleDocumentUpload, strategyWizardMessages, buyerDealRoomMessages])

  const isCreateListing = page.mode === 'sell' && page.view === 'createListing'
  const isCreateStrategy = page.mode === 'strategy' && page.view === 'createStrategy'
  const isBuyerDealRoom = page.mode === 'buy' && page.view === 'dealRoom'

  // Map current page to sidebar nav index (sell mode: 0=Listings, 1=Create, 2=Drafts)
  const activeNavIndex = useMemo(() => {
    if (page.mode === 'auth') return 0
    if (page.mode === 'global') return -1
    if (page.mode === 'sell') {
      if (page.view === 'listings' || page.view === 'dealRoom') return 0
      if (page.view === 'createListing') return 1
      if (page.view === 'drafts') return 2
      return 0
    }
    if (page.mode === 'buy') {
      if (page.view === 'yourDeals' || page.view === 'dealRoom') return 0
      if (page.view === 'discoverDeals') return 1
      if (page.view === 'accessRequested') return 2
      if (page.view === 'activation' || page.view === 'qualification') return 0
      return 0
    }
    if (page.mode === 'strategy') {
      if (page.view === 'yourStrategies') return 0
      if (page.view === 'createStrategy') return 1
      if (page.view === 'drafts') return 2
      return 0
    }
    return 0
  }, [page])

  // Auth pages render outside AppShell
  if (page.mode === 'auth' && page.view === 'landing') {
    return (
      <LandingPage
        onSellerCTA={() => navigateTo({ mode: 'auth', view: 'signup', role: 'seller' })}
        onBuyerCTA={() => navigateTo({ mode: 'auth', view: 'signup' })}
        onLogin={() => navigateTo({ mode: 'auth', view: 'login' })}
      />
    )
  }

  if (page.mode === 'auth' && page.view === 'login') {
    return (
      <LoginPage
        onSuccess={() => navigateTo({ mode: 'sell', view: 'listings' })}
        onSignUp={() => navigateTo({ mode: 'auth', view: 'signup' })}
      />
    )
  }

  if (page.mode === 'auth' && page.view === 'signup') {
    return (
      <SignUp
        initialRole={page.role}
        onComplete={(user, role) => {
          setCurrentUser(user)
          navigateTo({ mode: 'auth', view: 'onboarding' })
        }}
        onLogin={() => navigateTo({ mode: 'auth', view: 'login' })}
      />
    )
  }

  if (page.mode === 'auth' && page.view === 'onboarding') {
    if (!currentUser) {
      navigateTo({ mode: 'auth', view: 'landing' })
      return null
    }
    return (
      <Onboarding
        user={currentUser}
        onComplete={(updatedUser) => {
          setCurrentUser(updatedUser)
          navigateTo(postLoginRoute(updatedUser))
        }}
      />
    )
  }

  // Onboarding pages render outside AppShell (simplified standalone layout)
  if (page.mode === 'buy' && page.view === 'activation') {
    return (
      <BuyerActivationPage
        onCompleteProfile={() => navigateTo({ mode: 'buy', view: 'qualification' })}
        onSkip={() => navigateTo({ mode: 'buy', view: 'yourDeals' })}
      />
    )
  }

  if (page.mode === 'buy' && page.view === 'qualification') {
    return (
      <BuyerQualificationForm
        onComplete={() => navigateTo({ mode: 'buy', view: 'yourDeals' })}
        onSkip={() => navigateTo({ mode: 'buy', view: 'yourDeals' })}
      />
    )
  }

  // Internal login — renders outside both shells
  if (page.mode === 'internal' && page.view === 'login') {
    return (
      <InternalLogin
        onSuccess={(user) => {
          setInternalUser(user)
          const roleRouteMap: Record<InternalRole, Page> = {
            ds: { mode: 'internal', view: 'portal', role: 'ds', dsView: 'tasks' },
            analyst: { mode: 'internal', view: 'portal', role: 'analyst' },
            admin: { mode: 'internal', view: 'portal', role: 'admin' },
          }
          navigateTo(roleRouteMap[user.role])
        }}
      />
    )
  }

  // DS Deal View — renders inside InternalShell without tab nav
  if (page.mode === 'internal' && page.view === 'deal' && internalUser) {
    return (
      <InternalShell
        role="ds"
        userName={internalUser.name}
        onSignOut={() => {
          setInternalUser(null)
          navigateTo({ mode: 'internal', view: 'login' })
        }}
      >
        <DSDealView
          dealId={page.dealId}
          defaultTab={page.dealTab}
          onBack={() => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: 'pipeline' })}
        />
      </InternalShell>
    )
  }

  // DS Seller Profile — renders inside InternalShell without tab nav
  if (page.mode === 'internal' && page.view === 'seller-profile' && internalUser) {
    return (
      <InternalShell
        role="ds"
        userName={internalUser.name}
        onSignOut={() => {
          setInternalUser(null)
          navigateTo({ mode: 'internal', view: 'login' })
        }}
      >
        <DSSellerProfile
          sellerId={page.sellerId}
          onBack={() => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: 'clients' })}
          onNavigateToDeal={(dealId) => navigateTo({ mode: 'internal', view: 'deal', role: 'ds', dealId })}
        />
      </InternalShell>
    )
  }

  // DS Buyer Profile — renders inside InternalShell without tab nav
  if (page.mode === 'internal' && page.view === 'buyer-profile' && internalUser) {
    return (
      <InternalShell
        role="ds"
        userName={internalUser.name}
        onSignOut={() => {
          setInternalUser(null)
          navigateTo({ mode: 'internal', view: 'login' })
        }}
      >
        <DSBuyerProfile
          buyerId={page.buyerId}
          onBack={() => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: 'clients' })}
          onNavigateToDeal={(dealId) => navigateTo({ mode: 'internal', view: 'deal', role: 'ds', dealId })}
        />
      </InternalShell>
    )
  }

  // Internal portal shell — renders outside AppShell
  if (page.mode === 'internal' && page.view === 'portal' && internalUser) {
    const portalContent = (() => {
      // DS portal — uses top-bar tab switcher
      if (page.role === 'ds') {
        const dsView = page.dsView ?? 'tasks'
        return (
          <DSShell>
            {dsView === 'tasks' && (
              <DSTaskQueue
                onNavigateToDeal={(dealId, tab) => {
                  navigateTo({ mode: 'internal', view: 'deal', role: 'ds', dealId, dealTab: tab })
                }}
              />
            )}
            {dsView === 'pipeline' && (
              <DSPipeline
                onNavigateToDeal={(dealId) => {
                  navigateTo({ mode: 'internal', view: 'deal', role: 'ds', dealId })
                }}
              />
            )}
            {dsView === 'notifications' && <DSNotifications />}
            {dsView === 'clients' && (
              <DSClients
                onNavigateToSellerProfile={(sellerId) =>
                  navigateTo({ mode: 'internal', view: 'seller-profile', role: 'ds', sellerId })
                }
                onNavigateToBuyerProfile={(buyerId) =>
                  navigateTo({ mode: 'internal', view: 'buyer-profile', role: 'ds', buyerId })
                }
              />
            )}
          </DSShell>
        )
      }

      // Analyst / Admin — placeholder (future sprints)
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-5">
          <h1 className="text-2xl font-bold text-slate-500">
            {page.role === 'analyst' ? 'Analyst Portal' : 'Admin Portal'}
          </h1>
          <p className="text-sm text-muted-foreground">Portal content will be built in subsequent sprints.</p>
        </div>
      )
    })()

    return (
      <InternalShell
        role={page.role}
        userName={internalUser.name}
        onSignOut={() => {
          setInternalUser(null)
          navigateTo({ mode: 'internal', view: 'login' })
        }}
        headerCenter={
          page.role === 'ds'
            ? (
              <DSHeaderNav
                activeView={page.dsView ?? 'tasks'}
                onNavigate={(view) =>
                  navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: view })
                }
              />
            )
            : undefined
        }
      >
        {portalContent}
      </InternalShell>
    )
  }

  return (
    <AppShell
      activeMode={page.mode === 'global' ? lastMode : (page.mode as Mode)}
      activeNavIndex={activeNavIndex}
      onModeChange={handleModeChange}
      onNavChange={handleNavChange}
      onBack={goBack}
      onForward={goForward}
      canGoBack={historyIndex > 0}
      canGoForward={historyIndex < history.length - 1}
      chatContext={chatContext}
      onSendMessage={isCreateListing ? handleWizardSend : isCreateStrategy ? handleStrategyWizardSend : isBuyerDealRoom ? handleBuyerDealRoomMessage : undefined}
      onCreditsClick={() => setCreditsModalOpen(true)}
      onAvatarClick={() => navigateTo({ mode: 'global', view: 'profile' })}
      onSettingsClick={() => navigateTo({ mode: 'global', view: 'settings' })}
    >
      {page.mode === 'sell' && page.view === 'listings' && (
        <SellingList
          onOpenDealRoom={(deal) => navigateTo({ mode: 'sell', view: 'dealRoom', dealId: deal.id })}
          onCreateListing={() => navigateTo({ mode: 'sell', view: 'createListing' })}
        />
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
          documents={wizardDocuments}
          onDocumentUpload={handleDocumentUpload}
        />
      )}
      {page.mode === 'sell' && page.view === 'drafts' && (
        <SellerDraftsPage
          drafts={drafts}
          onContinue={handleContinueDraft}
          onDelete={(id) => setDrafts(prev => prev.filter(d => d.id !== id))}
        />
      )}
      {page.mode === 'buy' && page.view === 'yourDeals' && (
        <YourDeals onOpenDealRoom={(id) => navigateTo({ mode: 'buy', view: 'dealRoom', dealId: id })} />
      )}
      {page.mode === 'buy' && page.view === 'discoverDeals' && (
        <DiscoverDeals onOpenDealRoom={(id) => navigateTo({ mode: 'buy', view: 'dealRoom', dealId: id })} />
      )}
      {page.mode === 'buy' && page.view === 'accessRequested' && (
        <AccessRequested onOpenDealRoom={(id) => navigateTo({ mode: 'buy', view: 'dealRoom', dealId: id })} />
      )}
      {page.mode === 'buy' && page.view === 'dealRoom' && (
        <BuyerDealRoomView
          dealId={page.dealId}
          onBack={() => navigateTo({ mode: 'buy', view: 'yourDeals' })}
        />
      )}
      {page.mode === 'strategy' && page.view === 'yourStrategies' && (
        <YourStrategies
          onCreateStrategy={() => navigateTo({ mode: 'strategy', view: 'createStrategy' })}
          onEditStrategy={(id) => {
            // Reset wizard state before navigating to edit
            setStrategyWizardStep(0)
            setStrategyWizardMessages([])
            navigateTo({ mode: 'strategy', view: 'createStrategy', strategyId: id })
          }}
          onOpenDealRoom={(dealId) => navigateTo({ mode: 'buy', view: 'dealRoom', dealId })}
        />
      )}
      {isCreateStrategy && (
        <CreateStrategyWizard
          step={strategyWizardStep}
          onSubmit={() => navigateTo({ mode: 'strategy', view: 'yourStrategies' })}
          onSaveAsDraft={handleSaveStrategyAsDraft}
          initialState={editStrategyInitialState ?? strategyResumeDraft?.formState}
        />
      )}
      {page.mode === 'strategy' && page.view === 'drafts' && (
        <StrategyDrafts
          drafts={strategyDrafts}
          onContinue={handleContinueStrategyDraft}
          onDelete={(id) => setStrategyDrafts(prev => prev.filter(d => d.id !== id))}
        />
      )}
      {page.mode === 'global' && page.view === 'profile' && (
        <Profile user={currentUser ?? MOCK_CURRENT_USER} onBack={() => goBack()} />
      )}
      {page.mode === 'global' && page.view === 'settings' && (
        <Settings userRole={(currentUser ?? MOCK_CURRENT_USER).role} />
      )}
      <CreditsModal
        open={creditsModalOpen}
        onOpenChange={setCreditsModalOpen}
        currentBalance={400}
        mode="view"
      />
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
