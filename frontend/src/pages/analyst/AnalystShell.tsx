import { type ReactNode } from 'react'
import { ClipboardCheck, CheckSquare, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/utils/cn'

export type AnalystView = 'queue' | 'completed' | 'pipeline' | 'settings'

const NAV_ITEMS: { view: AnalystView; label: string; icon: typeof ClipboardCheck }[] = [
  { view: 'queue', label: 'Review Queue', icon: ClipboardCheck },
  { view: 'completed', label: 'Completed', icon: CheckSquare },
  { view: 'pipeline', label: 'Pipeline', icon: BarChart3 },
  { view: 'settings', label: 'Settings', icon: Settings },
]

interface AnalystSidebarProps {
  activeView: AnalystView
  onNavigate: (view: AnalystView) => void
}

export function AnalystSidebar({ activeView, onNavigate }: AnalystSidebarProps) {
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

interface AnalystShellProps {
  children: ReactNode
}

export default function AnalystShell({ children }: AnalystShellProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
