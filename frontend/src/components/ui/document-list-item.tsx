import type { LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import {
  Item,
  ItemMedia,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemActions,
} from '@/components/ui/item'
import { Button } from '@/components/ui/button'

interface DocumentListItemAction {
  label: string
  icon?: LucideIcon
  onClick?: () => void
}

interface DocumentListItemProps {
  variant: 'uploaded' | 'pending'
  icon: LucideIcon
  iconClassName?: string
  title: string
  description?: string
  primaryAction: DocumentListItemAction
  secondaryAction?: DocumentListItemAction
  className?: string
}

function DocumentListItem({
  variant,
  icon: Icon,
  iconClassName,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: DocumentListItemProps) {
  const PrimaryIcon = primaryAction.icon
  const SecondaryIcon = secondaryAction?.icon

  return (
    <Item variant="outline" className={cn('flex-nowrap px-4 py-3', className)}>
      <ItemMedia variant="icon">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
            variant === 'uploaded'
              ? 'bg-green-500/10 text-green-400'
              : 'bg-muted text-muted-foreground',
            iconClassName
          )}
        >
          <Icon size={15} />
        </div>
      </ItemMedia>

      <ItemContent className="min-w-0">
        <ItemTitle className="w-auto truncate">{title}</ItemTitle>
        {description && <ItemDescription className="truncate">{description}</ItemDescription>}
      </ItemContent>

      <ItemActions className="shrink-0">
        {secondaryAction && (
          <Button variant="ghost" size="xs" onClick={secondaryAction.onClick}>
            {SecondaryIcon && <SecondaryIcon size={12} />}
            {secondaryAction.label}
          </Button>
        )}
        <Button variant="outline" size="xs" onClick={primaryAction.onClick}>
          {PrimaryIcon && <PrimaryIcon size={12} />}
          {primaryAction.label}
        </Button>
      </ItemActions>
    </Item>
  )
}

function DocumentListGroup({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        className
      )}
      {...props}
    />
  )
}

export { DocumentListItem, DocumentListGroup }
export type { DocumentListItemProps, DocumentListItemAction }
