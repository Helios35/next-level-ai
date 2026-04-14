import { type ReactNode } from 'react'
import { LayoutDashboard, AlertTriangle, BarChart3, Users, UserCog, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'

export type AdminView = 'overview' | 'exceptions' | 'pipeline' | 'clients' | 'staff' | 'settings'

const NAV_ITEMS: { view: AdminView; label: string; icon: typeof LayoutDashboard }[] = [
  { view: 'overview', label: 'Overview', icon: LayoutDashboard },
  { view: 'exceptions', label: 'Exception Queue', icon: AlertTriangle },
  { view: 'pipeline', label: 'Pipeline', icon: BarChart3 },
  { view: 'clients', label: 'Clients', icon: Users },
  { view: 'staff', label: 'Staff', icon: UserCog },
  { view: 'settings', label: 'Settings', icon: Settings },
]

interface AdminSidebarProps {
  activeView: AdminView
  onNavigate: (view: AdminView) => void
}

export function AdminSidebar({ activeView, onNavigate }: AdminSidebarProps) {
  return (
    <div className="flex flex-col gap-1 px-3 py-4">
      {NAV_ITEMS.map(({ view, label, icon: Icon }) => (
        <button
          key={view}
          onClick={() => onNavigate(view)}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            activeView === view
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
          )}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
    </div>
  )
}

interface AdminShellProps {
  children: ReactNode
}

export default function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
