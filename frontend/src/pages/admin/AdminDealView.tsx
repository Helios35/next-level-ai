import { useState, useMemo } from 'react'
import { MOCK_ADMIN_EXCEPTIONS, type DocumentCheckStatus } from '@/data/mock/adminExceptions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { DocumentListGroup, DocumentListItem } from '@/components/ui/document-list-item'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import {
  CheckCircle,
  RotateCcw,
  FileText,
  AlertCircle,
  XCircle,
  HelpCircle,
  Download,
} from 'lucide-react'

const STATUS_CONFIG: Record<
  DocumentCheckStatus,
  { label: string; className: string; icon: typeof CheckCircle }
> = {
  present: {
    label: 'Present',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    icon: CheckCircle,
  },
  missing: {
    label: 'Missing',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
    icon: XCircle,
  },
  inconsistent: {
    label: 'Inconsistent',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    icon: AlertCircle,
  },
  flagged: {
    label: 'Flagged',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    icon: HelpCircle,
  },
}

type AdminAction = 'advance' | 'return'

const ACTION_CONFIG: Record<
  AdminAction,
  { label: string; title: string; description: string; buttonClass: string }
> = {
  advance: {
    label: 'Advance to Analyst',
    title: 'Advance this deal to Analyst?',
    description:
      'This will move the deal to Stage 4 (Financial Analysis). The AI analyst agent will generate a financial memo for Analyst review.',
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  return: {
    label: 'Return to Seller',
    title: 'Return this deal to the seller?',
    description:
      'This will move the deal back to Stage 2. Your notes will be sent to the seller as context for what needs to be addressed.',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

interface AdminDealViewProps {
  dealId: string
  onBack: () => void
}

export default function AdminDealView({ dealId, onBack }: AdminDealViewProps) {
  const exception = useMemo(
    () => MOCK_ADMIN_EXCEPTIONS.find((e) => e.dealId === dealId),
    [dealId]
  )

  const [notes, setNotes] = useState('')
  const [activeAction, setActiveAction] = useState<AdminAction | null>(null)

  if (!exception) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Deal not found.</p>
      </div>
    )
  }

  const actionConfig = activeAction ? ACTION_CONFIG[activeAction] : null
  const actionsDisabled = notes.trim().length === 0

  const handleConfirm = () => {
    setActiveAction(null)
    setNotes('')
    onBack()
  }

  return (
    <>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <Breadcrumbs
          className="mb-4"
          items={[
            { label: 'Tasks', onClick: onBack },
            { label: exception.dealName },
          ]}
        />
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">{exception.dealName}</h1>
          <p className="text-xs text-muted-foreground">
            {exception.assetType} &middot; {exception.assetSubType} &middot;{' '}
            {exception.sellerName} &middot; Received at Stage 3:{' '}
            {formatDate(exception.dateSubmittedToStage3)}
          </p>
        </div>

        {/* AI Completeness Report */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">AI Completeness Report</h2>
          <div className="flex flex-col gap-2">
            {exception.completenessReport.map((item) => {
              const config = STATUS_CONFIG[item.status]
              const Icon = config.icon
              return (
                <div
                  key={item.documentName}
                  className="flex items-start justify-between rounded-lg border border-border px-4 py-3"
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      size={16}
                      className={`mt-0.5 shrink-0 ${
                        item.status === 'present' ? 'text-emerald-400' : 'text-amber-400'
                      }`}
                    />
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {item.documentName}
                      </span>
                      {item.aiNote && (
                        <p className="mt-1 text-xs text-muted-foreground">{item.aiNote}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={config.className}>
                    {config.label}
                  </Badge>
                </div>
              )
            })}
          </div>
        </div>

        {/* Document Viewer */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">Documents</h2>
          <DocumentListGroup>
            {exception.completenessReport
              .filter((item) => item.status !== 'missing')
              .map((item) => (
                <DocumentListItem
                  key={item.documentName}
                  variant={item.status === 'present' ? 'uploaded' : 'pending'}
                  icon={FileText}
                  title={item.documentName}
                  description={
                    item.status === 'present'
                      ? 'Verified'
                      : item.status === 'flagged'
                      ? 'Flagged for review'
                      : 'Inconsistency detected'
                  }
                  primaryAction={{ label: 'Download', icon: Download }}
                />
              ))}
          </DocumentListGroup>
        </div>

        {/* Admin Notes */}
        <div className="mb-6 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 text-base font-semibold text-foreground">Admin Notes</h2>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Document your review reasoning... (required before taking action)"
            className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={actionsDisabled}
            onClick={() => setActiveAction('advance')}
          >
            <CheckCircle size={16} className="mr-2" />
            Advance to Analyst
          </Button>
          <Button
            className="bg-amber-600 hover:bg-amber-700 text-white"
            disabled={actionsDisabled}
            onClick={() => setActiveAction('return')}
          >
            <RotateCcw size={16} className="mr-2" />
            Return to Seller
          </Button>
        </div>
        {actionsDisabled && (
          <p className="mt-2 text-xs text-muted-foreground">
            Notes must be populated before taking an action.
          </p>
        )}
      </div>

      {/* Confirmation Modal */}
      <Dialog open={activeAction !== null} onOpenChange={() => setActiveAction(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{actionConfig?.title}</DialogTitle>
            <DialogDescription>{actionConfig?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button className={actionConfig?.buttonClass} onClick={handleConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
