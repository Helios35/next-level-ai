import type { ReactNode } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TabOption } from './data-table.types'

// ── Props ────────────────────────────────────────────────────────────────

export interface DataTableHeaderProps {
  /** Optional — omit when the header is used as a toolbar inside a parent that owns the page title */
  title?: string
  subtitle?: string
  /**
   * Search input — shown only when `onSearchChange` is provided. Pages own
   * the search state and apply the filter to the data before passing to
   * DataTable.
   */
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  /**
   * Tab filter — primary categorical filter. Rendered as shadcn Tabs.
   * Pages own the active tab state.
   */
  tabs?: TabOption[]
  activeTab?: string
  onTabChange?: (value: string) => void
  /**
   * FilterModal trigger — this component does NOT own a modal. It only
   * renders the trigger button. Pages own the FilterModal instance and
   * pass the active filter count here so the trigger can show a chip.
   */
  filterCount?: number
  onOpenFilters?: () => void
  /** Right-side action buttons (e.g. "Add Staff Member") */
  actions?: ReactNode
  /** Extra classname for the outer container */
  className?: string
}

// ── Component ────────────────────────────────────────────────────────────

export function DataTableHeader({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  tabs,
  activeTab,
  onTabChange,
  filterCount = 0,
  onOpenFilters,
  actions,
  className,
}: DataTableHeaderProps) {
  const showSearch = !!onSearchChange
  const showFilterButton = !!onOpenFilters
  const hasFilters = filterCount > 0

  // When there's no title, we're in toolbar mode — actions inline with the
  // search/filter cluster on a single row. When there's a title, actions go
  // on the title row (canonical AdminStaff-style layout).
  const toolbarMode = !title && !subtitle
  const titleRowActions = !toolbarMode ? actions : null
  const toolbarActions = toolbarMode ? actions : null

  return (
    <div className={cn('mb-4 flex flex-col gap-4', className)}>
      {/* Row 1: title + actions — only rendered if title or title-row actions provided */}
      {(title || titleRowActions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          {title && (
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          )}
          {titleRowActions && <div className="shrink-0 sm:ml-auto">{titleRowActions}</div>}
        </div>
      )}

      {/* Row 2: tabs + search + filter button + toolbar actions (only rendered if any piece is present) */}
      {(tabs || showSearch || showFilterButton || toolbarActions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: tabs (if provided) */}
          {tabs && tabs.length > 0 && activeTab !== undefined && onTabChange && (
            <Tabs value={activeTab} onValueChange={onTabChange}>
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}

          {/* Right: search + filter button + toolbar actions */}
          {(showSearch || showFilterButton || toolbarActions) && (
            <div className="flex items-center gap-2 sm:ml-auto">
              {showSearch && (
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                  <input
                    type="text"
                    value={searchValue ?? ''}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full rounded-lg border border-border bg-main py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
              )}
              {showFilterButton && (
                <button
                  type="button"
                  onClick={onOpenFilters}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm transition-colors',
                    hasFilters
                      ? 'border-foreground/50 text-foreground bg-muted'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <SlidersHorizontal size={15} />
                  Filters
                  {hasFilters && (
                    <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium text-background">
                      {filterCount}
                    </span>
                  )}
                </button>
              )}
              {toolbarActions && <div className="shrink-0">{toolbarActions}</div>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
