import { useState, useEffect, type ReactNode } from 'react'
import { Sun, Moon, ArrowLeft, ArrowRight } from 'lucide-react'
import type { InternalRole } from '@shared/types/enums'
import { cn } from '@/utils/cn'
import SidebarNav, { type SidebarNavItem } from '@/components/SidebarNav'
import { UserMenu } from '@/components/ui/user-menu'

const ROLE_LABELS: Record<InternalRole, string> = {
  ds: 'Disposition Specialist',
  analyst: 'Analyst',
  admin: 'Admin',
}

interface InternalShellProps {
  children: ReactNode
  role: InternalRole
  userName: string
  onSignOut: () => void
  onProfileClick: () => void
  onSettingsClick: () => void
  /** History navigation — back arrow in the header */
  onBack?: () => void
  onForward?: () => void
  canGoBack?: boolean
  canGoForward?: boolean
  navItems: SidebarNavItem[]
  activeNavIndex: number
  onNavItemClick: (index: number) => void
  bottomNavItems?: SidebarNavItem[]
  activeBottomIndex?: number
  onBottomNavItemClick?: (index: number) => void
}

export default function InternalShell({
  children,
  role,
  userName,
  onSignOut,
  onProfileClick,
  onSettingsClick,
  onBack,
  onForward,
  canGoBack = false,
  canGoForward = false,
  navItems,
  activeNavIndex,
  onNavItemClick,
  bottomNavItems,
  activeBottomIndex,
  onBottomNavItemClick,
}: InternalShellProps) {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-main text-foreground">
      {/* ═══ TOP BAR ═══ */}
      <header className="flex h-14 min-h-[56px] items-center justify-between bg-main px-4">
        {/* Left cluster — wordmark + back/forward */}
        <div className="flex items-center gap-1">
          <span className="text-base font-bold tracking-tight text-foreground">
            NextLevel
          </span>
          <button
            onClick={onBack}
            disabled={!canGoBack}
            className={cn(
              'hidden sm:flex rounded-md p-2 transition-colors ml-2',
              canGoBack
                ? 'text-muted-foreground hover:bg-muted hover:text-foreground'
                : 'text-muted-foreground/30 cursor-default',
            )}
            aria-label="Go back"
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
            aria-label="Go forward"
          >
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Right — theme toggle + user menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark(!dark)}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <UserMenu
            initials={initials}
            name={userName}
            avatarUrl="https://i.pravatar.cc/64?u=internal-user"
            onProfileClick={onProfileClick}
            onSettingsClick={onSettingsClick}
            onSignOut={onSignOut}
          />
        </div>
      </header>

      {/* ═══ BODY ═══ */}
      <div className="flex flex-1 overflow-hidden">
        <SidebarNav
          items={navItems}
          activeIndex={activeNavIndex}
          onItemClick={onNavItemClick}
          bottomItems={bottomNavItems}
          activeBottomIndex={activeBottomIndex}
          onBottomItemClick={onBottomNavItemClick}
          header={
            <div className="px-3 py-3 text-sm font-semibold text-foreground">
              {ROLE_LABELS[role]}
            </div>
          }
        >
          {children}
        </SidebarNav>
      </div>
    </div>
  )
}
