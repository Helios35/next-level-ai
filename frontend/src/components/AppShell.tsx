import { useState, useCallback, useRef, useEffect, type ReactNode } from 'react'
import { cn } from '@/utils/cn'
import {
  Settings,
  ArrowLeft,
  ArrowRight,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  PlusCircle,
  PenLine,
  Compass,
  Clock,
  Bell,
  Copy,
  RefreshCw,
  Send,
  FileText,
  Plus,
  ChevronDown,
  ArrowUp,
  Tag,
  ShoppingCart,
  Target,
  PanelLeftOpen,
  PanelLeftClose,
  Maximize2,
  Minimize2,
  Upload,
  CheckCircle2,
  Paperclip,
} from 'lucide-react'
import { ExpandableTabs } from '@/components/ui/expandable-tabs'
import { DotGrid } from '@/components/ui/dot-grid'
import { DocumentListItem, DocumentListGroup } from '@/components/ui/document-list-item'

// ── Types ──────────────────────────────────────────────────────────────────

type Mode = 'sell' | 'buy' | 'strategy'

interface NavItem {
  icon: typeof LayoutGrid
  label: string
}

// ── Constants ──────────────────────────────────────────────────────────────

const MODE_CONFIG: Record<Mode, {
  label: string; accent: string; accentBg: string; accentBorder: string;
  chatBubble: string; chatBubbleBorder: string; chatHover: string;
  chatSkill: string; chatSend: string;
  navItems: NavItem[]; contextLabel: string;
}> = {
  sell: {
    label: 'Sell',
    accent: 'text-mode-sell',
    accentBg: 'bg-mode-sell/10',
    accentBorder: 'border-mode-sell',
    chatBubble: 'bg-mode-sell text-white',
    chatBubbleBorder: 'border-mode-sell/30',
    chatHover: 'hover:text-mode-sell',
    chatSkill: 'border-mode-sell/20 hover:bg-mode-sell/10 hover:text-mode-sell',
    chatSend: 'bg-mode-sell hover:bg-mode-sell/80',
    navItems: [
      { icon: LayoutGrid, label: 'Your Listings' },
      { icon: PlusCircle, label: 'Create Listing' },
      { icon: PenLine, label: 'Drafts' },
    ],
    contextLabel: 'Listings',
  },
  buy: {
    label: 'Buy',
    accent: 'text-mode-buy',
    accentBg: 'bg-mode-buy/10',
    accentBorder: 'border-mode-buy',
    chatBubble: 'bg-mode-buy text-white',
    chatBubbleBorder: 'border-mode-buy/30',
    chatHover: 'hover:text-mode-buy',
    chatSkill: 'border-mode-buy/20 hover:bg-mode-buy/10 hover:text-mode-buy',
    chatSend: 'bg-mode-buy hover:bg-mode-buy/80',
    navItems: [
      { icon: LayoutGrid, label: 'Your Deals' },
      { icon: Compass, label: 'Discover Deals' },
      { icon: Clock, label: 'Access Requested' },
    ],
    contextLabel: 'Deals',
  },
  strategy: {
    label: 'Strategy',
    accent: 'text-mode-strategy',
    accentBg: 'bg-mode-strategy/10',
    accentBorder: 'border-mode-strategy',
    chatBubble: 'bg-mode-strategy text-white',
    chatBubbleBorder: 'border-mode-strategy/30',
    chatHover: 'hover:text-mode-strategy',
    chatSkill: 'border-mode-strategy/20 hover:bg-mode-strategy/10 hover:text-mode-strategy',
    chatSend: 'bg-mode-strategy hover:bg-mode-strategy/80',
    navItems: [
      { icon: LayoutGrid, label: 'Your Strategies' },
      { icon: PlusCircle, label: 'Create Strategy' },
      { icon: PenLine, label: 'Drafts' },
    ],
    contextLabel: 'Strategies',
  },
}

const MODES: Mode[] = ['sell', 'buy', 'strategy']

const MODE_TABS = [
  { title: 'Sell', icon: Tag },
  { title: 'Buy', icon: ShoppingCart },
  { title: 'Strategy', icon: Target },
] as const

const CHAT_MESSAGES = [
  {
    role: 'ai' as const,
    text: "Good morning, James. I've found 3 new deals matching your Phoenix multifamily strategy. Want me to walk you through them?",
    time: '9:04 AM',
  },
  {
    role: 'user' as const,
    text: 'Yes, show me the best match first.',
    time: '9:04 AM',
  },
  {
    role: 'ai' as const,
    text: 'The top match is a 24-unit multifamily asset in Scottsdale \u2014 94% match score. Strong rent roll, stabilized. Want me to request access?',
    time: '9:05 AM',
  },
]

const SKILLS = ['Analyze deal', 'Compare strategies', 'Summarize activity', 'Show top matches']

// ── Sidebar Collapse Width ─────────────────────────────────────────────────

const SIDEBAR_COLLAPSED_W = 48
const SIDEBAR_EXPANDED_W = 200

// ── Chat Panel Constraints ─────────────────────────────────────────────────

const CHAT_MIN_W = 280
const CHAT_COLLAPSED_W = 32

// ── Component ──────────────────────────────────────────────────────────────

export type { Mode }

export interface ChatContext {
  messages: { role: 'ai' | 'user'; text: string; time: string; attachment?: { docName: string; fileName: string } }[]
  contextLabel: string
  skills?: string[]
  onAttach?: (docName: string, fileName: string) => void
  pendingDocs?: { name: string; status: string; fileName?: string }[]
}

interface AppShellProps {
  children?: ReactNode
  /** Called when mode tab (Sell/Buy/Strategy) changes */
  onModeChange?: (mode: Mode) => void
  /** Called when a sidebar nav item is clicked */
  onNavChange?: (index: number, label: string) => void
  /** Called when back arrow is clicked */
  onBack?: () => void
  /** Called when forward arrow is clicked */
  onForward?: () => void
  /** Whether back navigation is available (dims the arrow) */
  canGoBack?: boolean
  /** Whether forward navigation is available (dims the arrow) */
  canGoForward?: boolean
  /** Override chat panel content (messages, context label, skills) */
  chatContext?: ChatContext
  /** When provided, makes the chat textarea interactive and calls this on send */
  onSendMessage?: (text: string) => void
  /** Controlled active sidebar nav index — syncs highlight on programmatic navigation */
  activeNavIndex?: number
}

export default function AppShell({
  children,
  onModeChange,
  onNavChange,
  onBack,
  onForward,
  canGoBack = false,
  canGoForward = false,
  chatContext,
  activeMode,
  activeNavIndex,
  onSendMessage,
}: AppShellProps & { activeMode?: Mode }) {
  const [mode, setMode] = useState<Mode>('sell')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(true)
  const [chatFullscreen, setChatFullscreen] = useState(false)
  const [dark, setDark] = useState(true)
  const [activeNav, setActiveNav] = useState(0)
  const [chatWidth, setChatWidth] = useState(0)
  const [chatInput, setChatInput] = useState('')

  const shellRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)
  const chatScrollRef = useRef<HTMLDivElement>(null)

  // Document upload refs & state (chat panel)
  const chatFileInputRef = useRef<HTMLInputElement>(null)
  const pendingDocLabelRef = useRef('')
  const [attachPopoverOpen, setAttachPopoverOpen] = useState(false)

  // Apply dark class to html
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // Initialize chat width to 30% of viewport
  useEffect(() => {
    setChatWidth(Math.max(CHAT_MIN_W, Math.round(window.innerWidth * 0.3)))
  }, [])

  // Sync controlled mode from parent (e.g. back/forward navigation)
  useEffect(() => {
    if (activeMode && activeMode !== mode) {
      setMode(activeMode)
    }
  }, [activeMode])

  // Reset active nav when mode changes
  useEffect(() => {
    setActiveNav(0)
  }, [mode])

  // Sync controlled nav index from parent (programmatic navigation)
  useEffect(() => {
    if (activeNavIndex !== undefined) {
      setActiveNav(activeNavIndex)
    }
  }, [activeNavIndex])

  // Clear chat input when onSendMessage is removed
  useEffect(() => {
    if (!onSendMessage) setChatInput('')
  }, [onSendMessage])

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight
    }
  }, [chatContext?.messages?.length])

  const config = MODE_CONFIG[mode]
  const sidebarW = sidebarOpen ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W
  const effectiveChatW = chatOpen ? chatWidth : CHAT_COLLAPSED_W

  // ── Resize handler ──────────────────────────────────────────────────────

  const onMouseDown = useCallback(() => {
    dragging.current = true

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const maxW = Math.round(window.innerWidth * 0.5)
      const newW = window.innerWidth - e.clientX
      setChatWidth(Math.max(CHAT_MIN_W, Math.min(maxW, newW)))
    }

    const onMouseUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  // ── Mode tab change handler ────────────────────────────────────────────

  const modeIndex = MODES.indexOf(mode)

  const handleModeTabChange = (index: number | null) => {
    if (index !== null && index >= 0 && index < MODES.length) {
      const newMode = MODES[index]
      setMode(newMode)
      onModeChange?.(newMode)
    }
  }

  // ── Document upload helpers (chat panel) ─────────────────────────────────

  const openChatFilePicker = useCallback((docLabel: string) => {
    pendingDocLabelRef.current = docLabel
    setAttachPopoverOpen(false)
    chatFileInputRef.current?.click()
  }, [])

  const handleChatFileSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && pendingDocLabelRef.current) {
      chatContext?.onAttach?.(pendingDocLabelRef.current, file.name)
    }
    e.target.value = '' // reset for re-selection
    pendingDocLabelRef.current = ''
  }, [chatContext])

  const pendingDocsFiltered = chatContext?.pendingDocs?.filter((d) => d.status === 'pending') ?? []

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div ref={shellRef} className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      {/* ═══ TOP BAR ═══ */}
      <header className="flex h-14 min-h-[56px] items-center justify-between border-b border-border bg-background px-3">
        {/* Left cluster */}
        <div className="flex items-center gap-1">
          <span className="px-2 text-base font-bold tracking-tight text-foreground">NextLevel</span>
          <button
            onClick={onBack}
            disabled={!canGoBack}
            className={cn(
              'hidden sm:flex rounded-md p-2 transition-colors',
              canGoBack
                ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                : 'text-muted-foreground/30 cursor-default',
            )}
          >
            <ArrowLeft size={18} />
          </button>
          <button
            onClick={onForward}
            disabled={!canGoForward}
            className={cn(
              'hidden sm:flex rounded-md p-2 transition-colors',
              canGoForward
                ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                : 'text-muted-foreground/30 cursor-default',
            )}
          >
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Center — mode switcher */}
        <ExpandableTabs
          tabs={MODE_TABS as unknown as import('@/components/ui/expandable-tabs').TabItem[]}
          activeIndex={modeIndex}
          onChange={handleModeTabChange}
          activeColor={MODE_CONFIG[mode].accent}
          className=""
        />

        {/* Right cluster */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDark(!dark)}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-amber-500/20 text-amber-500">
              <span className="text-[10px] font-bold">C</span>
            </div>
            <span className="hidden sm:inline">400 Credits</span>
          </button>
          <button className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground hover:ring-2 hover:ring-border transition-all">
            JD
          </button>
        </div>
      </header>

      {/* ═══ BODY (sidebar + content + chat) ═══ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ═══ LEFT SIDEBAR ═══ */}
        <nav
          style={{ width: sidebarW }}
          className="hidden sm:flex flex-col border-r border-border bg-background transition-[width] duration-200 ease-in-out"
        >
          {/* Mode nav items */}
          <div className="flex flex-1 flex-col gap-0.5 px-1.5 pt-2">
            {config.navItems.map((item, i) => {
              const Icon = item.icon
              const isActive = i === activeNav
              return (
                <button
                  key={item.label}
                  onClick={() => { setActiveNav(i); onNavChange?.(i, item.label) }}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors',
                    isActive
                      ? cn(config.accentBg, config.accent, 'font-medium')
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {/* Active left border indicator */}
                  {isActive && (
                    <span
                      className={cn(
                        'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r',
                        config.accentBorder,
                        'bg-current',
                      )}
                    />
                  )}
                  <Icon size={18} className="shrink-0" />
                  {sidebarOpen && (
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Bottom persistent items */}
          <div className="flex flex-col gap-0.5 border-t border-border px-1.5 py-2">
            <button className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Bell size={18} className="shrink-0" />
              {sidebarOpen && <span className="truncate">Notifications</span>}
            </button>
            <button className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <Settings size={18} className="shrink-0" />
              {sidebarOpen && <span className="truncate">Settings</span>}
            </button>
          </div>
        </nav>

        {/* ═══ CONTENT AREA ═══ */}
        <div
          className="relative flex overflow-hidden transition-[flex,opacity] duration-300 ease-in-out"
          style={{
            flex: chatFullscreen ? '0 0 0px' : '1 1 0%',
            opacity: chatFullscreen ? 0 : 1,
          }}
        >
          {/* Sidebar toggle — outside the nav panel */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden sm:flex absolute left-2 top-2 z-10 h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
          </button>
          <main className="flex-1 overflow-y-auto bg-main pt-2 sm:pt-10">
            {children ?? (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                <FileText size={48} strokeWidth={1} className="opacity-30" />
                <p className="text-sm">No content yet.</p>
                <p className="text-xs opacity-60">This area will render the active page.</p>
              </div>
            )}
          </main>
        </div>

        {/* ═══ RESIZE HANDLE ═══ */}
        {chatOpen && !chatFullscreen && (
          <div
            onMouseDown={onMouseDown}
            className="hidden sm:flex group w-1 cursor-col-resize items-center justify-center hover:bg-border transition-colors"
          >
            <div className="h-8 w-0.5 rounded-full bg-border group-hover:bg-muted-foreground transition-colors" />
          </div>
        )}

        {/* ═══ AI CHAT PANEL ═══ */}
        <aside
          style={chatFullscreen ? { flex: '1 1 0%' } : { width: effectiveChatW }}
          className={cn(
            'relative flex flex-col overflow-hidden border-l border-border bg-background transition-[width,flex] duration-300 ease-in-out',
            !chatOpen && 'items-center',
            !chatOpen && 'max-sm:hidden',
            chatOpen && 'max-sm:absolute max-sm:inset-y-0 max-sm:right-0 max-sm:z-30 max-sm:!w-full max-sm:border-l-0',
          )}
        >
          {/* Background dot grid */}
          {chatOpen && <DotGrid gap={14} dotSize={1} />}

          {/* Collapsed state */}
          {!chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              className="mt-3 rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Expanded state */}
          {chatOpen && (
            <div className="relative z-10 flex flex-1 flex-col min-h-0">
              {/* Panel header */}
              <div className="flex h-10 items-center justify-between border-b border-border bg-background px-3">
                <span className={cn('text-xs font-semibold tracking-wide uppercase', config.accent)}>
                  NextLevel AI
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setChatFullscreen(!chatFullscreen)}
                    className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {chatFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                  {!chatFullscreen && (
                    <button
                      onClick={() => setChatOpen(false)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Chat body — centered in fullscreen */}
              <div className="flex flex-1 flex-col overflow-hidden min-h-0">
                <div className={cn('flex flex-1 flex-col overflow-hidden min-h-0', chatFullscreen && 'mx-auto w-full max-w-3xl')}>
                  {/* Chat messages */}
                  <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                    {(chatContext?.messages ?? CHAT_MESSAGES).map((msg, i) => (
                      <div key={i} className={cn('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}>
                        {/* Attachment bubble (user uploaded a document) */}
                        {msg.attachment ? (
                          <div
                            className={cn(
                              'max-w-[85%] flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 rounded-br-sm',
                              config.chatBubble,
                            )}
                          >
                            <Paperclip size={14} className="shrink-0 opacity-70" />
                            <div className="min-w-0">
                              <div className="text-xs font-medium truncate">{msg.attachment.fileName}</div>
                              <div className="text-[11px] opacity-70 truncate">{msg.attachment.docName}</div>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              'max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
                              msg.role === 'user'
                                ? cn(config.chatBubble, 'rounded-br-sm')
                                : cn('bg-background/80 text-foreground border rounded-bl-sm backdrop-blur-sm', config.chatBubbleBorder),
                            )}
                          >
                            {msg.text}
                          </div>
                        )}
                        {/* Action icons for AI messages */}
                        {msg.role === 'ai' && !msg.attachment && (
                          <div className="mt-1 flex items-center gap-2 px-1">
                            <button className={cn('text-muted-foreground/50 transition-colors', config.chatHover)}>
                              <Copy size={12} />
                            </button>
                            <button className={cn('text-muted-foreground/50 transition-colors', config.chatHover)}>
                              <RefreshCw size={12} />
                            </button>
                          </div>
                        )}
                        <span className="mt-0.5 px-1 text-[10px] text-muted-foreground/50">{msg.time}</span>
                      </div>
                    ))}

                    {/* Interactive pending documents card */}
                    {chatContext?.pendingDocs && chatContext.pendingDocs.length > 0 && (
                      <div className="flex flex-col items-start">
                        <div className="w-full rounded-xl border bg-background/80 backdrop-blur-sm p-2">
                          <DocumentListGroup>
                            {chatContext.pendingDocs.map((doc) => (
                              <DocumentListItem
                                key={doc.name}
                                variant={doc.status === 'uploaded' ? 'uploaded' : 'pending'}
                                icon={doc.status === 'uploaded' ? CheckCircle2 : FileText}
                                title={doc.name}
                                description={doc.status === 'uploaded' && doc.fileName ? doc.fileName : undefined}
                                primaryAction={
                                  doc.status === 'uploaded'
                                    ? { label: 'Uploaded', icon: CheckCircle2 }
                                    : { label: 'Upload', icon: Upload, onClick: () => openChatFilePicker(doc.name) }
                                }
                              />
                            ))}
                          </DocumentListGroup>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Skills bar */}
                  {(chatContext?.skills ?? SKILLS).length > 0 && (
                    <div className="flex gap-2 overflow-x-auto px-3 pb-2 scrollbar-none">
                      {(chatContext?.skills ?? SKILLS).map((skill) => (
                        <button
                          key={skill}
                          className={cn('shrink-0 rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors', config.chatSkill)}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Chat input — elevated card */}
                  <div className="p-3">
                    <div className="rounded-2xl border border-border bg-background shadow-lg shadow-black/5 dark:shadow-black/20">
                      {/* Text input area */}
                      <div className="px-4 pt-4 pb-2">
                        <textarea
                          placeholder="Type your message here."
                          rows={2}
                          className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                          readOnly={!onSendMessage}
                          value={onSendMessage ? chatInput : ''}
                          onChange={onSendMessage ? (e) => setChatInput(e.target.value) : undefined}
                          onKeyDown={onSendMessage ? (e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              if (chatInput.trim()) {
                                onSendMessage(chatInput.trim())
                                setChatInput('')
                              }
                            }
                          } : undefined}
                        />
                      </div>
                      {/* Hidden file input for chat uploads */}
                      <input
                        ref={chatFileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleChatFileSelected}
                      />
                      {/* Bottom bar: plus, context dropdown, send */}
                      <div className="flex items-center justify-between px-3 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <button
                              onClick={() => {
                                if (chatContext?.onAttach && pendingDocsFiltered.length > 0) {
                                  setAttachPopoverOpen((prev) => !prev)
                                }
                              }}
                              className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                                chatContext?.onAttach && pendingDocsFiltered.length > 0
                                  ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                  : 'text-muted-foreground/40 cursor-default',
                              )}
                            >
                              <Plus size={18} />
                            </button>
                            {/* Attach popover */}
                            {attachPopoverOpen && pendingDocsFiltered.length > 0 && (
                              <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl border border-border bg-background shadow-lg p-1.5 z-50">
                                <p className="px-2 py-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Upload Document</p>
                                {pendingDocsFiltered.map((doc) => (
                                  <button
                                    key={doc.name}
                                    onClick={() => openChatFilePicker(doc.name)}
                                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                                  >
                                    <Upload size={14} className="text-muted-foreground shrink-0" />
                                    <span className="truncate">{doc.name}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                            {attachPopoverOpen && chatContext?.pendingDocs && pendingDocsFiltered.length === 0 && (
                              <div className="absolute bottom-full left-0 mb-2 w-56 rounded-xl border border-border bg-background shadow-lg p-3 z-50">
                                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <CheckCircle2 size={14} className="text-green-400" />
                                  All documents received
                                </p>
                              </div>
                            )}
                          </div>
                          <button className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                            <span>{chatContext?.contextLabel ?? config.contextLabel}</span>
                            <ChevronDown size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            if (onSendMessage && chatInput.trim()) {
                              onSendMessage(chatInput.trim())
                              setChatInput('')
                            }
                          }}
                          className={cn('flex h-8 w-8 items-center justify-center rounded-lg text-white transition-colors', config.chatSend)}
                        >
                          <ArrowUp size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
