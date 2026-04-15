import { Home } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface BreadcrumbItem {
  label: string
  /** When provided, the item is rendered as a button that navigates on click */
  onClick?: () => void
}

interface BreadcrumbsProps {
  /** Middle items + final current-page item. The home icon is always rendered first. */
  items: BreadcrumbItem[]
  /** Called when the home icon is clicked — typically navigates to the role's landing page */
  onHomeClick?: () => void
  className?: string
}

/**
 * Breadcrumb trail matching the external portal spec:
 *   🏠 > Section > Current Page
 *
 * Used on both external list pages (SellingList, etc.) and internal deep-link
 * pages (DSSellerProfile, AdminDealView, etc.). The last item in `items` is
 * rendered as the active page (emphasized, no click handler).
 */
export function Breadcrumbs({ items, onHomeClick, className }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        'flex items-center gap-1.5 text-xs text-muted-foreground',
        className,
      )}
    >
      {onHomeClick ? (
        <button
          onClick={onHomeClick}
          className="flex items-center rounded transition-colors hover:text-foreground"
          aria-label="Home"
        >
          <Home size={13} />
        </button>
      ) : (
        <Home size={13} className="text-muted-foreground" />
      )}

      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            <span aria-hidden>&gt;</span>
            {isLast ? (
              <span className="text-foreground font-medium">{item.label}</span>
            ) : item.onClick ? (
              <button
                onClick={item.onClick}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </button>
            ) : (
              <span>{item.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
