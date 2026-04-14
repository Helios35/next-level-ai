import { useState, type ReactNode } from 'react'
import { PanelLeftOpen, PanelLeftClose } from 'lucide-react'
import { cn } from '@/utils/cn'

// ── Constants ─────────────────────────────────────────────────────────────

export const SIDEBAR_COLLAPSED_W = 48
export const SIDEBAR_EXPANDED_W = 200

// ── Types ─────────────────────────────────────────────────────────────────

export interface SidebarNavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
}

interface SidebarNavProps {
  items: SidebarNavItem[]
  activeIndex: number
  onItemClick: (index: number) => void
  bottomItems?: SidebarNavItem[]
  activeBottomIndex?: number
  onBottomItemClick?: (index: number) => void
  /** Active text colour class — default 'text-foreground' */
  accent?: string
  /** Active background class — default 'bg-muted' */
  accentBg?: string
  /** Active left-border colour class — default 'border-foreground' */
  accentBorder?: string
  /** Override the content wrapper className (default: 'relative flex flex-1 overflow-hidden') */
  contentClassName?: string
  /** Override the content wrapper inline style */
  contentStyle?: React.CSSProperties
  children: ReactNode
}

// ── Component ─────────────────────────────────────────────────────────────

export default function SidebarNav({
  items,
  activeIndex,
  onItemClick,
  bottomItems,
  activeBottomIndex,
  onBottomItemClick,
  accent = 'text-foreground',
  accentBg = 'bg-muted',
  accentBorder = 'border-foreground',
  contentClassName,
  contentStyle,
  children,
}: SidebarNavProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarW = sidebarOpen ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W

  const renderItem = (
    item: SidebarNavItem,
    index: number,
    isActive: boolean,
    onClick: () => void,
  ) => {
    const Icon = item.icon
    return (
      <button
        key={`${item.label}-${index}`}
        onClick={onClick}
        className={cn(
          'group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors',
          isActive
            ? cn(accentBg, accent, 'font-medium')
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )}
      >
        {/* Active left border indicator */}
        {isActive && (
          <span
            className={cn(
              'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r',
              accentBorder,
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
  }

  return (
    <>
      {/* ═══ SIDEBAR NAV ═══ */}
      <nav
        style={{ width: sidebarW }}
        className="hidden sm:flex flex-col border-r border-border bg-background transition-[width] duration-200 ease-in-out"
      >
        {/* Top nav items */}
        <div className="flex flex-1 flex-col gap-0.5 px-1.5 pt-2">
          {items.map((item, i) =>
            renderItem(item, i, i === activeIndex, () => onItemClick(i)),
          )}
        </div>

        {/* Bottom persistent items */}
        {bottomItems && bottomItems.length > 0 && (
          <div className="flex flex-col gap-0.5 border-t border-border px-1.5 py-2">
            {bottomItems.map((item, i) =>
              renderItem(
                item,
                i,
                i === activeBottomIndex,
                () => onBottomItemClick?.(i),
              ),
            )}
          </div>
        )}
      </nav>

      {/* ═══ CONTENT AREA ═══ */}
      <div
        className={contentClassName ?? 'relative flex flex-1 overflow-hidden'}
        style={contentStyle}
      >
        {/* Sidebar toggle — outside the nav panel */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="hidden sm:flex absolute left-2 top-2 z-10 h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
        </button>
        <main className="flex-1 overflow-y-auto bg-main pt-2 sm:pt-10">
          {children}
        </main>
      </div>
    </>
  )
}
