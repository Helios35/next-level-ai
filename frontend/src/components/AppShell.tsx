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
} from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────

type Mode = 'sell' | 'buy' | 'strategy'

interface NavItem {
  icon: typeof LayoutGrid
  label: string
}

// ── Constants ──────────────────────────────────────────────────────────────

const MODE_CONFIG: Record<Mode, { label: string; accent: string; accentBg: string; accentBorder: string; navItems: NavItem[]; contextChip: string }> = {
  sell: {
    label: 'Sell',
    accent: 'text-teal-500',
    accentBg: 'bg-teal-500/10',
    accentBorder: 'border-teal-500',
    navItems: [
      { icon: LayoutGrid, label: 'Your Listings' },
      { icon: PlusCircle, label: 'Create Listing' },
      { icon: PenLine, label: 'Drafts' },
    ],
    contextChip: '\u{1F4CB} Listings',
  },
  buy: {
    label: 'Buy',
    accent: 'text-violet-500',
    accentBg: 'bg-violet-500/10',
    accentBorder: 'border-violet-500',
    navItems: [
      { icon: LayoutGrid, label: 'Your Deals' },
      { icon: Compass, label: 'Discover Deals' },
      { icon: Clock, label: 'Access Requested' },
    ],
    contextChip: '\u{1F3E2} Deals',
  },
  strategy: {
    label: 'Strategy',
    accent: 'text-amber-500',
    accentBg: 'bg-amber-500/10',
    accentBorder: 'border-amber-500',
    navItems: [
      { icon: LayoutGrid, label: 'Your Strategies' },
      { icon: PlusCircle, label: 'Create Strategy' },
      { icon: PenLine, label: 'Drafts' },
    ],
    contextChip: '\u{1F3AF} Strategies',
  },
}

const MODES: Mode[] = ['sell', 'buy', 'strategy']

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

export default function AppShell({ children }: { children?: ReactNode }) {
  const [mode, setMode] = useState<Mode>('sell')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(true)
  const [dark, setDark] = useState(true)
  const [activeNav, setActiveNav] = useState(0)
  const [chatWidth, setChatWidth] = useState(0)

  const shellRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  // Apply dark class to html
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // Initialize chat width to 30% of viewport
  useEffect(() => {
    setChatWidth(Math.max(CHAT_MIN_W, Math.round(window.innerWidth * 0.3)))
  }, [])

  // Reset active nav when mode changes
  useEffect(() => {
    setActiveNav(0)
  }, [mode])

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

  // ── Pill accent colors (inline style for mode-specific colors) ──────────

  const pillActiveStyle = (m: Mode): React.CSSProperties => {
    const colors: Record<Mode, string> = {
      sell: '#0D9488',
      buy: '#7C3AED',
      strategy: '#D97706',
    }
    return mode === m
      ? { backgroundColor: colors[m], color: '#fff' }
      : {}
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div ref={shellRef} className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      {/* ═══ TOP BAR ═══ */}
      <header className="flex h-14 min-h-[56px] items-center justify-between border-b border-border bg-card px-3">
        {/* Left cluster */}
        <div className="flex items-center gap-1">
          <button className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <Settings size={18} />
          </button>
          <button className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ArrowLeft size={18} />
          </button>
          <button className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Center — mode switcher */}
        <div className="flex items-center rounded-full bg-muted p-1">
          {MODES.map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={pillActiveStyle(m)}
              className={cn(
                'relative rounded-full px-5 py-1.5 text-sm font-medium transition-all',
                mode === m ? 'shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {MODE_CONFIG[m].label}
              {m === 'buy' && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  2
                </span>
              )}
            </button>
          ))}
        </div>

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
            <span>400 Credits</span>
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
          className="flex flex-col border-r border-border bg-card transition-[width] duration-200 ease-in-out"
        >
          {/* Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-10 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </button>

          {/* Mode nav items */}
          <div className="flex flex-1 flex-col gap-0.5 px-1.5">
            {config.navItems.map((item, i) => {
              const Icon = item.icon
              const isActive = i === activeNav
              return (
                <button
                  key={item.label}
                  onClick={() => setActiveNav(i)}
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
        <main className="flex-1 overflow-y-auto">
          {children ?? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <FileText size={48} strokeWidth={1} className="opacity-30" />
              <p className="text-sm">No content yet.</p>
              <p className="text-xs opacity-60">This area will render the active page.</p>
            </div>
          )}
        </main>

        {/* ═══ RESIZE HANDLE ═══ */}
        {chatOpen && (
          <div
            onMouseDown={onMouseDown}
            className="group flex w-1 cursor-col-resize items-center justify-center hover:bg-border transition-colors"
          >
            <div className="h-8 w-0.5 rounded-full bg-border group-hover:bg-muted-foreground transition-colors" />
          </div>
        )}

        {/* ═══ AI CHAT PANEL ═══ */}
        <aside
          style={{ width: effectiveChatW }}
          className={cn(
            'flex flex-col border-l border-border bg-card transition-[width] duration-200 ease-in-out',
            !chatOpen && 'items-center',
          )}
        >
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
            <>
              {/* Panel header */}
              <div className="flex h-10 items-center justify-between border-b border-border px-3">
                <span className="text-xs font-semibold text-muted-foreground tracking-wide uppercase">
                  NextLevel AI
                </span>
                <button
                  onClick={() => setChatOpen(false)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
                {CHAT_MESSAGES.map((msg, i) => (
                  <div key={i} className={cn('flex flex-col', msg.role === 'user' ? 'items-end' : 'items-start')}>
                    <div
                      className={cn(
                        'max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-foreground text-background rounded-br-sm'
                          : 'text-foreground',
                      )}
                    >
                      {msg.text}
                    </div>
                    {/* Action icons for AI messages */}
                    {msg.role === 'ai' && (
                      <div className="mt-1 flex items-center gap-2 px-1">
                        <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                          <Copy size={12} />
                        </button>
                        <button className="text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                          <RefreshCw size={12} />
                        </button>
                      </div>
                    )}
                    <span className="mt-0.5 px-1 text-[10px] text-muted-foreground/50">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Skills bar */}
              <div className="flex gap-2 overflow-x-auto px-3 pb-2 scrollbar-none">
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    className="shrink-0 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {skill}
                  </button>
                ))}
              </div>

              {/* Chat input */}
              <div className="border-t border-border p-3">
                {/* Context chip */}
                <div className="mb-2">
                  <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                    {config.contextChip}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                  <input
                    type="text"
                    placeholder="Ask NextLevel AI anything..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none"
                    readOnly
                  />
                  <button className="rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors">
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
