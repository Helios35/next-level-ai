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
import { MOCK_SPECIALIST_SELLER_DR001, MOCK_SPECIALIST_BUYER_DR001 } from '@/data/mock/chat'
import {
  ClipboardList, BarChart3, Users as UsersIcon, Bell as BellIcon,
  CheckSquare, LayoutDashboard, UserCog,
} from 'lucide-react'
import type { SidebarNavItem } from '@/components/SidebarNav'
import InternalLogin from '@/pages/InternalLogin'
import InternalShell from '@/components/InternalShell'
import InternalProfile from '@/pages/InternalProfile'
import InternalSettings from '@/pages/InternalSettings'
import DSShell from '@/pages/ds/DSShell'
import type { DsView } from '@/pages/ds/DSShell'
import DSOverview from '@/pages/ds/DSOverview'
import DSTaskQueue from '@/pages/ds/DSTaskQueue'
import DSPipeline from '@/pages/ds/DSPipeline'
import DSNotifications from '@/pages/ds/DSNotifications'
import DSDealView from '@/pages/ds/DSDealView'
import DSClients from '@/pages/ds/DSClients'
import DSSellerProfile from '@/pages/ds/DSSellerProfile'
import DSBuyerProfile from '@/pages/ds/DSBuyerProfile'
import type { InternalUser } from '@shared/types/internalUser'
import type { InternalRole } from '@shared/types/enums'

// Analyst portal imports
import AnalystShell, { type AnalystView } from '@/pages/analyst/AnalystShell'
import AnalystOverview from '@/pages/analyst/AnalystOverview'
import AnalystTasks from '@/pages/analyst/AnalystTasks'
import AnalystClients from '@/pages/analyst/AnalystClients'
import AnalystReviewView from '@/pages/analyst/AnalystReviewView'
import AnalystCompleted from '@/pages/analyst/AnalystCompleted'
import AnalystPipeline from '@/pages/analyst/AnalystPipeline'
import AnalystNotifications from '@/pages/analyst/AnalystNotifications'

// Admin portal imports
import AdminShellComp, { type AdminView } from '@/pages/admin/AdminShell'
import AdminPortalPage from '@/pages/admin/AdminPortal'
import AdminTasks from '@/pages/admin/AdminTasks'
import AdminDealView from '@/pages/admin/AdminDealView'
import AdminPipelinePage from '@/pages/admin/AdminPipeline'
import AdminClients from '@/pages/admin/AdminClients'
import AdminClientProfile from '@/pages/admin/AdminClientProfile'
import AdminStaff from '@/pages/admin/AdminStaff'
import AdminStaffCreate from '@/pages/admin/AdminStaffCreate'
import AdminNotifications from '@/pages/admin/AdminNotifications'

// ── Internal sidebar nav items ──────────────────────────────────────────────

// All internal roles share the same bottom nav: Notifications.
// Settings moved into the UserMenu dropdown (top-right).
const INTERNAL_BOTTOM_NAV: SidebarNavItem[] = [{ icon: BellIcon, label: 'Notifications' }]

// Unified order for every internal role: Overview · Pipeline · Clients · Tasks · (role extras)
const DS_NAV_ITEMS: SidebarNavItem[] = [
  { icon: LayoutDashboard, label: 'Overview' },
  { icon: BarChart3, label: 'Pipeline' },
  { icon: UsersIcon, label: 'Clients' },
  { icon: ClipboardList, label: 'Tasks' },
]
const DS_VIEW_BY_INDEX: DsView[] = ['overview', 'pipeline', 'clients', 'tasks']

const ANALYST_NAV_ITEMS: SidebarNavItem[] = [
  { icon: LayoutDashboard, label: 'Overview' },
  { icon: BarChart3, label: 'Pipeline' },
  { icon: UsersIcon, label: 'Clients' },
  { icon: ClipboardList, label: 'Tasks' },
  { icon: CheckSquare, label: 'Completed' },
]
const ANALYST_VIEW_BY_INDEX: AnalystView[] = ['overview', 'pipeline', 'clients', 'tasks', 'completed']

const ADMIN_NAV_ITEMS: SidebarNavItem[] = [
  { icon: LayoutDashboard, label: 'Overview' },
  { icon: BarChart3, label: 'Pipeline' },
  { icon: UsersIcon, label: 'Clients' },
  { icon: ClipboardList, label: 'Tasks' },
  { icon: UserCog, label: 'Staff' },
]
const ADMIN_VIEW_BY_INDEX: AdminView[] = ['overview', 'pipeline', 'clients', 'tasks', 'staff']

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
  | { mode: 'internal'; view: 'portal'; role: InternalRole; dsView?: DsView; analystView?: AnalystView; adminView?: AdminView }
  | { mode: 'internal'; view: 'deal'; role: 'ds'; dealId: string; dealTab?: string }
  | { mode: 'internal'; view: 'seller-profile'; role: 'ds'; sellerId: string }
  | { mode: 'internal'; view: 'buyer-profile'; role: 'ds'; buyerId: string }
  // Analyst portal views
  | { mode: 'internal'; view: 'analyst-review'; memoId: string }
  // Admin portal views
  | { mode: 'internal'; view: 'admin-deal'; dealId: string }
  | { mode: 'internal'; view: 'admin-client'; clientId: string }
  | { mode: 'internal'; view: 'admin-staff-create' }
  // Internal profile/settings (accessible from UserMenu dropdown)
  | { mode: 'internal'; view: 'profile'; role: InternalRole }
  | { mode: 'internal'; view: 'settings'; role: InternalRole }

function pageKey(p: Page) {
  if (p.mode === 'auth' && p.view === 'signup' && p.role) {
    return `auth:signup:${p.role}`
  }
  if (p.mode === 'strategy' && p.view === 'createStrategy' && p.strategyId) {
    return `strategy:createStrategy:${p.strategyId}`
  }
  if (p.mode === 'internal' && p.view === 'portal' && 'dsView' in p && p.dsView) {
    return `internal:portal:${p.role}:${p.dsView}`
  }
  if (p.mode === 'internal' && p.view === 'portal' && 'analystView' in p && p.analystView) {
    return `internal:portal:analyst:${p.analystView}`
  }
  if (p.mode === 'internal' && p.view === 'portal' && 'adminView' in p && p.adminView) {
    return `internal:portal:admin:${p.adminView}`
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
  if (p.mode === 'internal' && p.view === 'analyst-review') {
    return `internal:analyst-review:${p.memoId}`
  }
  if (p.mode === 'internal' && p.view === 'admin-deal') {
    return `internal:admin-deal:${p.dealId}`
  }
  if (p.mode === 'internal' && p.view === 'admin-client') {
    return `internal:admin-client:${p.clientId}`
  }
  if (p.mode === 'internal' && p.view === 'admin-staff-create') {
    return 'internal:admin-staff-create'
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

  // Chat channel state (AI vs Specialist toggle)
  const [chatChannel, setChatChannel] = useState<'ai' | 'specialist'>('ai')
  const [unreadSpecialist, setUnreadSpecialist] = useState(true)

  // Reset channel to AI when leaving deal rooms
  useEffect(() => {
    const isDealRoom = (page.mode === 'sell' && page.view === 'dealRoom') ||
      (page.mode === 'buy' && page.view === 'dealRoom')
    if (!isDealRoom) {
      setChatChannel('ai')
      setUnreadSpecialist(true)
    }
  }, [pageKey(page)])

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

  const handleChannelChange = useCallback((channel: 'ai' | 'specialist') => {
    setChatChannel(channel)
    if (channel === 'specialist') setUnreadSpecialist(false)
  }, [])

  const SPECIALIST_CARD = {
    name: 'Rachel Torres',
    role: 'Disposition Specialist',
    description: 'Your Disposition Specialist manages buyer outreach, coordinates Q&A between parties, monitors deal activity, and guides pricing strategy. They are your primary human point of contact throughout the deal lifecycle.',
  }

  const sellerSpecialistMessages = useMemo(() =>
    MOCK_SPECIALIST_SELLER_DR001.map((m) => ({
      sender: m.senderLabel,
      text: m.content,
      time: new Date(m.timestamp).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
      }),
    })), [])

  const buyerSpecialistMessages = useMemo(() =>
    MOCK_SPECIALIST_BUYER_DR001.map((m) => ({
      sender: m.senderLabel,
      text: m.content,
      time: new Date(m.timestamp).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
      }),
    })), [])

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

  // Shared navigation props for back/forward arrows in both AppShell and InternalShell headers
  const historyNavProps = {
    onBack: goBack,
    onForward: goForward,
    canGoBack: historyIndex > 0,
    canGoForward: historyIndex < history.length - 1,
  }

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
        skills: chatChannel === 'ai' ? ['Analyze deal', 'Buyer activity', 'Pricing guidance', 'Document status'] : [],
        specialistCard: SPECIALIST_CARD,
        specialistMessages: sellerSpecialistMessages,
        activeChannel: chatChannel,
        onChannelChange: handleChannelChange,
        unreadSpecialist,
      }
    }
    if (page.mode === 'buy' && page.view === 'dealRoom') {
      const dealRoomTips: AiTip[] = chatChannel === 'ai' ? [
        { id: 'summary', icon: Sparkles, label: 'Get Deal Summary', description: 'AI overview of key deal metrics and terms', prompt: 'Give me a summary of this deal', featured: true },
        { id: 'docs', icon: FileSearch, label: 'Ask About the Documents', description: 'Questions about uploaded deal docs', prompt: 'Ask about the documents' },
        { id: 'offer', icon: HelpCircle, label: 'How Does the Offer Process Work?', description: 'Rounds, timing, and submission rules', prompt: 'How does the offer process work?' },
        { id: 'competition', icon: Users, label: 'What Is My Competition?', description: 'Anonymized buyer pool insights', prompt: 'What is my competition?' },
      ] : []
      return {
        messages: buyerDealRoomMessages,
        contextLabel: getDealName(page.dealId),
        tips: dealRoomTips,
        specialistCard: SPECIALIST_CARD,
        specialistMessages: buyerSpecialistMessages,
        activeChannel: chatChannel,
        onChannelChange: handleChannelChange,
        unreadSpecialist,
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
  }, [page, wizardMessages, wizardStep, wizardDocuments, handleDocumentUpload, strategyWizardMessages, buyerDealRoomMessages, chatChannel, handleChannelChange, unreadSpecialist, sellerSpecialistMessages, buyerSpecialistMessages])

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
        onInternalLogin={() => navigateTo({ mode: 'internal', view: 'login' })}
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
            ds: { mode: 'internal', view: 'portal', role: 'ds', dsView: 'overview' },
            analyst: { mode: 'internal', view: 'portal', role: 'analyst', analystView: 'overview' },
            admin: { mode: 'internal', view: 'portal', role: 'admin', adminView: 'overview' },
          }
          navigateTo(roleRouteMap[user.role])
        }}
      />
    )
  }

  // DS Deal View — renders inside InternalShell with sidebar
  if (page.mode === 'internal' && page.view === 'deal' && internalUser) {
    return (
      <InternalShell
        role="ds"
        userName={internalUser.name}
        onSignOut={() => {
          setInternalUser(null)
          navigateTo({ mode: 'internal', view: 'login' })
        }}
        navItems={DS_NAV_ITEMS}
        activeNavIndex={DS_VIEW_BY_INDEX.indexOf('pipeline')}
        onNavItemClick={(i) => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: DS_VIEW_BY_INDEX[i] })}
        bottomNavItems={INTERNAL_BOTTOM_NAV}
        onBottomNavItemClick={() => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: 'notifications' })}
        onProfileClick={() => navigateTo({ mode: 'internal', view: 'profile', role: 'ds' })}
        onSettingsClick={() => navigateTo({ mode: 'internal', view: 'settings', role: 'ds' })}
        {...historyNavProps}
      >
        <DSDealView
          dealId={page.dealId}
          defaultTab={page.dealTab}
          onBack={() => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: 'pipeline' })}
        />
      </InternalShell>
    )
  }

  // DS Seller Profile — renders inside InternalShell with sidebar
  if (page.mode === 'internal' && page.view === 'seller-profile' && internalUser) {
    return (
      <InternalShell
        role="ds"
        userName={internalUser.name}
        onSignOut={() => {
          setInternalUser(null)
          navigateTo({ mode: 'internal', view: 'login' })
        }}
        navItems={DS_NAV_ITEMS}
        activeNavIndex={DS_VIEW_BY_INDEX.indexOf('clients')}
        onNavItemClick={(i) => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: DS_VIEW_BY_INDEX[i] })}
        bottomNavItems={INTERNAL_BOTTOM_NAV}
        onBottomNavItemClick={() => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: 'notifications' })}
        onProfileClick={() => navigateTo({ mode: 'internal', view: 'profile', role: 'ds' })}
        onSettingsClick={() => navigateTo({ mode: 'internal', view: 'settings', role: 'ds' })}
        {...historyNavProps}
      >
        <DSSellerProfile
          sellerId={page.sellerId}
          onBack={() => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: 'clients' })}
          onNavigateToDeal={(dealId) => navigateTo({ mode: 'internal', view: 'deal', role: 'ds', dealId })}
        />
      </InternalShell>
    )
  }

  // DS Buyer Profile — renders inside InternalShell with sidebar
  if (page.mode === 'internal' && page.view === 'buyer-profile' && internalUser) {
    return (
      <InternalShell
        role="ds"
        userName={internalUser.name}
        onSignOut={() => {
          setInternalUser(null)
          navigateTo({ mode: 'internal', view: 'login' })
        }}
        navItems={DS_NAV_ITEMS}
        activeNavIndex={DS_VIEW_BY_INDEX.indexOf('clients')}
        onNavItemClick={(i) => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: DS_VIEW_BY_INDEX[i] })}
        bottomNavItems={INTERNAL_BOTTOM_NAV}
        onBottomNavItemClick={() => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: 'notifications' })}
        onProfileClick={() => navigateTo({ mode: 'internal', view: 'profile', role: 'ds' })}
        onSettingsClick={() => navigateTo({ mode: 'internal', view: 'settings', role: 'ds' })}
        {...historyNavProps}
      >
        <DSBuyerProfile
          buyerId={page.buyerId}
          onBack={() => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: 'clients' })}
          onNavigateToDeal={(dealId) => navigateTo({ mode: 'internal', view: 'deal', role: 'ds', dealId })}
        />
      </InternalShell>
    )
  }

  // Analyst Review View — renders inside InternalShell with sidebar
  if (page.mode === 'internal' && page.view === 'analyst-review' && internalUser) {
    return (
      <InternalShell
        role="analyst"
        userName={internalUser.name}
        onSignOut={() => {
          setInternalUser(null)
          navigateTo({ mode: 'internal', view: 'login' })
        }}
        navItems={ANALYST_NAV_ITEMS}
        activeNavIndex={ANALYST_VIEW_BY_INDEX.indexOf('tasks')}
        onNavItemClick={(i) => navigateTo({ mode: 'internal', view: 'portal', role: 'analyst', analystView: ANALYST_VIEW_BY_INDEX[i] })}
        bottomNavItems={INTERNAL_BOTTOM_NAV}
        onBottomNavItemClick={() => navigateTo({ mode: 'internal', view: 'portal', role: 'analyst', analystView: 'notifications' })}
        onProfileClick={() => navigateTo({ mode: 'internal', view: 'profile', role: 'analyst' })}
        onSettingsClick={() => navigateTo({ mode: 'internal', view: 'settings', role: 'analyst' })}
        {...historyNavProps}
      >
        <AnalystReviewView
          memoId={page.memoId}
          onBack={() => navigateTo({ mode: 'internal', view: 'portal', role: 'analyst', analystView: 'tasks' })}
        />
      </InternalShell>
    )
  }

  // Admin Deal View — renders inside InternalShell with sidebar
  if (page.mode === 'internal' && page.view === 'admin-deal' && internalUser) {
    return (
      <InternalShell
        role="admin"
        userName={internalUser.name}
        onSignOut={() => {
          setInternalUser(null)
          navigateTo({ mode: 'internal', view: 'login' })
        }}
        navItems={ADMIN_NAV_ITEMS}
        activeNavIndex={ADMIN_VIEW_BY_INDEX.indexOf('tasks')}
        onNavItemClick={(i) => navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: ADMIN_VIEW_BY_INDEX[i] })}
        bottomNavItems={INTERNAL_BOTTOM_NAV}
        onBottomNavItemClick={() => navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: 'notifications' })}
        onProfileClick={() => navigateTo({ mode: 'internal', view: 'profile', role: 'admin' })}
        onSettingsClick={() => navigateTo({ mode: 'internal', view: 'settings', role: 'admin' })}
        {...historyNavProps}
      >
        <AdminDealView
          dealId={page.dealId}
          onBack={() => navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: 'tasks' })}
        />
      </InternalShell>
    )
  }

  // Admin Client Profile — renders inside InternalShell with sidebar
  if (page.mode === 'internal' && page.view === 'admin-client' && internalUser) {
    return (
      <InternalShell
        role="admin"
        userName={internalUser.name}
        onSignOut={() => {
          setInternalUser(null)
          navigateTo({ mode: 'internal', view: 'login' })
        }}
        navItems={ADMIN_NAV_ITEMS}
        activeNavIndex={ADMIN_VIEW_BY_INDEX.indexOf('clients')}
        onNavItemClick={(i) => navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: ADMIN_VIEW_BY_INDEX[i] })}
        bottomNavItems={INTERNAL_BOTTOM_NAV}
        onBottomNavItemClick={() => navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: 'notifications' })}
        onProfileClick={() => navigateTo({ mode: 'internal', view: 'profile', role: 'admin' })}
        onSettingsClick={() => navigateTo({ mode: 'internal', view: 'settings', role: 'admin' })}
        {...historyNavProps}
      >
        <AdminClientProfile
          clientId={page.clientId}
          onBack={() => navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: 'clients' })}
        />
      </InternalShell>
    )
  }

  // Admin Staff Create — renders inside InternalShell with sidebar
  if (page.mode === 'internal' && page.view === 'admin-staff-create' && internalUser) {
    return (
      <InternalShell
        role="admin"
        userName={internalUser.name}
        onSignOut={() => {
          setInternalUser(null)
          navigateTo({ mode: 'internal', view: 'login' })
        }}
        navItems={ADMIN_NAV_ITEMS}
        activeNavIndex={ADMIN_VIEW_BY_INDEX.indexOf('staff')}
        onNavItemClick={(i) => navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: ADMIN_VIEW_BY_INDEX[i] })}
        bottomNavItems={INTERNAL_BOTTOM_NAV}
        onBottomNavItemClick={() => navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: 'notifications' })}
        onProfileClick={() => navigateTo({ mode: 'internal', view: 'profile', role: 'admin' })}
        onSettingsClick={() => navigateTo({ mode: 'internal', view: 'settings', role: 'admin' })}
        {...historyNavProps}
      >
        <AdminStaffCreate
          onBack={() => navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: 'staff' })}
        />
      </InternalShell>
    )
  }

  // Internal Profile — accessible from UserMenu on every internal page
  if (page.mode === 'internal' && page.view === 'profile' && internalUser) {
    const role = page.role
    const dsNav = {
      navItems: DS_NAV_ITEMS,
      activeNavIndex: -1,
      onNavItemClick: (i: number) => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: DS_VIEW_BY_INDEX[i] }),
    }
    const analystNav = {
      navItems: ANALYST_NAV_ITEMS,
      activeNavIndex: -1,
      onNavItemClick: (i: number) => navigateTo({ mode: 'internal', view: 'portal', role: 'analyst', analystView: ANALYST_VIEW_BY_INDEX[i] }),
    }
    const adminNav = {
      navItems: ADMIN_NAV_ITEMS,
      activeNavIndex: -1,
      onNavItemClick: (i: number) => navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: ADMIN_VIEW_BY_INDEX[i] }),
    }
    const nav = role === 'ds' ? dsNav : role === 'analyst' ? analystNav : adminNav
    const bottomNotifView = role === 'ds'
      ? () => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: 'notifications' })
      : role === 'analyst'
      ? () => navigateTo({ mode: 'internal', view: 'portal', role: 'analyst', analystView: 'notifications' })
      : () => navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: 'notifications' })

    return (
      <InternalShell
        role={role}
        userName={internalUser.name}
        onSignOut={() => {
          setInternalUser(null)
          navigateTo({ mode: 'internal', view: 'login' })
        }}
        onProfileClick={() => navigateTo({ mode: 'internal', view: 'profile', role })}
        onSettingsClick={() => navigateTo({ mode: 'internal', view: 'settings', role })}
        {...historyNavProps}
        {...nav}
        bottomNavItems={INTERNAL_BOTTOM_NAV}
        onBottomNavItemClick={bottomNotifView}
      >
        <InternalProfile user={internalUser} />
      </InternalShell>
    )
  }

  // Internal Settings — accessible from UserMenu on every internal page
  if (page.mode === 'internal' && page.view === 'settings' && internalUser) {
    const role = page.role
    const dsNav = {
      navItems: DS_NAV_ITEMS,
      activeNavIndex: -1,
      onNavItemClick: (i: number) => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: DS_VIEW_BY_INDEX[i] }),
    }
    const analystNav = {
      navItems: ANALYST_NAV_ITEMS,
      activeNavIndex: -1,
      onNavItemClick: (i: number) => navigateTo({ mode: 'internal', view: 'portal', role: 'analyst', analystView: ANALYST_VIEW_BY_INDEX[i] }),
    }
    const adminNav = {
      navItems: ADMIN_NAV_ITEMS,
      activeNavIndex: -1,
      onNavItemClick: (i: number) => navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: ADMIN_VIEW_BY_INDEX[i] }),
    }
    const nav = role === 'ds' ? dsNav : role === 'analyst' ? analystNav : adminNav
    const bottomNotifView = role === 'ds'
      ? () => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: 'notifications' })
      : role === 'analyst'
      ? () => navigateTo({ mode: 'internal', view: 'portal', role: 'analyst', analystView: 'notifications' })
      : () => navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: 'notifications' })

    return (
      <InternalShell
        role={role}
        userName={internalUser.name}
        onSignOut={() => {
          setInternalUser(null)
          navigateTo({ mode: 'internal', view: 'login' })
        }}
        onProfileClick={() => navigateTo({ mode: 'internal', view: 'profile', role })}
        onSettingsClick={() => navigateTo({ mode: 'internal', view: 'settings', role })}
        {...historyNavProps}
        {...nav}
        bottomNavItems={INTERNAL_BOTTOM_NAV}
        onBottomNavItemClick={bottomNotifView}
      >
        <InternalSettings role={role} />
      </InternalShell>
    )
  }

  // Internal portal shell — renders outside AppShell
  if (page.mode === 'internal' && page.view === 'portal' && internalUser) {
    const portalContent = (() => {
      // DS portal
      if (page.role === 'ds') {
        const dsView = page.dsView ?? 'overview'
        return (
          <DSShell>
            {dsView === 'overview' && (
              <DSOverview
                onNavigateToTasks={() =>
                  navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: 'tasks' })
                }
                onNavigateToDeal={(dealId, tab) =>
                  navigateTo({ mode: 'internal', view: 'deal', role: 'ds', dealId, dealTab: tab })
                }
              />
            )}
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

      // Analyst portal — sidebar nav
      if (page.role === 'analyst') {
        const analystView = page.analystView ?? 'overview'
        return (
          <AnalystShell>
            {analystView === 'overview' && (
              <AnalystOverview
                onNavigateToTasks={() =>
                  navigateTo({ mode: 'internal', view: 'portal', role: 'analyst', analystView: 'tasks' })
                }
                onNavigateToReview={(memoId) =>
                  navigateTo({ mode: 'internal', view: 'analyst-review', memoId })
                }
              />
            )}
            {analystView === 'pipeline' && <AnalystPipeline />}
            {analystView === 'clients' && <AnalystClients />}
            {analystView === 'tasks' && (
              <AnalystTasks
                onNavigateToReview={(memoId) =>
                  navigateTo({ mode: 'internal', view: 'analyst-review', memoId })
                }
              />
            )}
            {analystView === 'completed' && <AnalystCompleted />}
            {analystView === 'notifications' && <AnalystNotifications />}
            {analystView === 'settings' && <InternalSettings role="analyst" />}
          </AnalystShell>
        )
      }

      // Admin portal — sidebar nav
      if (page.role === 'admin') {
        const adminView = page.adminView ?? 'overview'
        return (
          <AdminShellComp>
            {adminView === 'overview' && (
              <AdminPortalPage
                onNavigateToTasks={() =>
                  navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: 'tasks' })
                }
                onNavigateToDeal={(dealId) =>
                  navigateTo({ mode: 'internal', view: 'admin-deal', dealId })
                }
              />
            )}
            {adminView === 'pipeline' && (
              <AdminPipelinePage
                onNavigateToDeal={(dealId) =>
                  navigateTo({ mode: 'internal', view: 'admin-deal', dealId })
                }
              />
            )}
            {adminView === 'clients' && (
              <AdminClients
                onNavigateToClient={(clientId) =>
                  navigateTo({ mode: 'internal', view: 'admin-client', clientId })
                }
              />
            )}
            {adminView === 'tasks' && (
              <AdminTasks
                onNavigateToDeal={(dealId) =>
                  navigateTo({ mode: 'internal', view: 'admin-deal', dealId })
                }
              />
            )}
            {adminView === 'staff' && (
              <AdminStaff
                onNavigateToCreate={() =>
                  navigateTo({ mode: 'internal', view: 'admin-staff-create' })
                }
              />
            )}
            {adminView === 'notifications' && <AdminNotifications />}
            {adminView === 'settings' && <InternalSettings role="admin" />}
          </AdminShellComp>
        )
      }

      return null
    })()

    // Compute nav props based on role
    const navProps = (() => {
      if (page.role === 'ds') {
        const dsView = page.dsView ?? 'overview'
        const mainIdx = DS_VIEW_BY_INDEX.indexOf(dsView as (typeof DS_VIEW_BY_INDEX)[number])
        return {
          navItems: DS_NAV_ITEMS,
          activeNavIndex: mainIdx === -1 ? -1 : mainIdx,
          onNavItemClick: (i: number) => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: DS_VIEW_BY_INDEX[i] }),
          bottomNavItems: INTERNAL_BOTTOM_NAV,
          activeBottomIndex: dsView === 'notifications' ? 0 : undefined,
          onBottomNavItemClick: () => navigateTo({ mode: 'internal', view: 'portal', role: 'ds', dsView: 'notifications' }),
        }
      }
      if (page.role === 'analyst') {
        const analystView = page.analystView ?? 'overview'
        const mainIdx = ANALYST_VIEW_BY_INDEX.indexOf(analystView as (typeof ANALYST_VIEW_BY_INDEX)[number])
        return {
          navItems: ANALYST_NAV_ITEMS,
          activeNavIndex: mainIdx === -1 ? -1 : mainIdx,
          onNavItemClick: (i: number) => navigateTo({ mode: 'internal', view: 'portal', role: 'analyst', analystView: ANALYST_VIEW_BY_INDEX[i] }),
          bottomNavItems: INTERNAL_BOTTOM_NAV,
          activeBottomIndex: analystView === 'notifications' ? 0 : undefined,
          onBottomNavItemClick: () => navigateTo({ mode: 'internal', view: 'portal', role: 'analyst', analystView: 'notifications' }),
        }
      }
      // admin
      const adminView = page.adminView ?? 'overview'
      const mainIdx = ADMIN_VIEW_BY_INDEX.indexOf(adminView as (typeof ADMIN_VIEW_BY_INDEX)[number])
      return {
        navItems: ADMIN_NAV_ITEMS,
        activeNavIndex: mainIdx === -1 ? -1 : mainIdx,
        onNavItemClick: (i: number) => navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: ADMIN_VIEW_BY_INDEX[i] }),
        bottomNavItems: INTERNAL_BOTTOM_NAV,
        activeBottomIndex: adminView === 'notifications' ? 0 : undefined,
        onBottomNavItemClick: () => navigateTo({ mode: 'internal', view: 'portal', role: 'admin', adminView: 'notifications' }),
      }
    })()

    return (
      <InternalShell
        role={page.role}
        userName={internalUser.name}
        onSignOut={() => {
          setInternalUser(null)
          navigateTo({ mode: 'internal', view: 'login' })
        }}
        onProfileClick={() => navigateTo({ mode: 'internal', view: 'profile', role: page.role })}
        onSettingsClick={() => navigateTo({ mode: 'internal', view: 'settings', role: page.role })}
        {...historyNavProps}
        {...navProps}
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
      onSendMessage={chatChannel === 'specialist' ? undefined : isCreateListing ? handleWizardSend : isCreateStrategy ? handleStrategyWizardSend : isBuyerDealRoom ? handleBuyerDealRoomMessage : undefined}
      onCreditsClick={() => setCreditsModalOpen(true)}
      onProfileClick={() => navigateTo({ mode: 'global', view: 'profile' })}
      onSettingsClick={() => navigateTo({ mode: 'global', view: 'settings' })}
      onSignOut={() => {
        setCurrentUser(null)
        navigateTo({ mode: 'auth', view: 'landing' })
      }}
      userName={(currentUser ?? MOCK_CURRENT_USER).name}
      userInitials={(currentUser ?? MOCK_CURRENT_USER).name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)}
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
