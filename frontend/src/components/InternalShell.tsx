import { useState, useEffect, type ReactNode } from 'react'
import { LogOut, Sun, Moon } from 'lucide-react'
import type { InternalRole } from '@shared/types/enums'
import SidebarNav, { type SidebarNavItem } from '@/components/SidebarNav'

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
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
      {/* ═══ TOP BAR ═══ */}
      <header className="flex h-14 min-h-[56px] items-center justify-between border-b border-border bg-background px-4">
        {/* Left — wordmark */}
        <span className="text-base font-bold tracking-tight text-foreground">
          NextLevel
          <span className="ml-1.5 text-xs font-normal text-slate-500">internal</span>
        </span>

        {/* Center — role label */}
        <span className="text-sm font-medium text-slate-500">
          {ROLE_LABELS[role]}
        </span>

        {/* Right — user + sign out */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDark(!dark)}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-600 text-sm font-semibold text-white">
            {initials}
          </div>
          <span className="hidden sm:inline text-sm text-muted-foreground">{userName}</span>
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
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
        >
          {children}
        </SidebarNav>
      </div>
    </div>
  )
}
