import { useState, useMemo } from 'react'
import { MOCK_ANALYST_MEMOS, type AnalystMemo, type AiFlagColor } from '@/data/mock/analystMemos'
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
import { ArrowLeft, CheckCircle, RotateCcw, XCircle, Send, Sparkles } from 'lucide-react'

const FLAG_CONFIG: Record<AiFlagColor, { label: string; className: string }> = {
  green: {
    label: 'Green — Approve',
    className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  yellow: {
    label: 'Yellow — Return',
    className: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  },
  red: {
    label: 'Red — Reject',
    className: 'border-red-500/30 bg-red-500/10 text-red-400',
  },
}

type Decision = 'approve' | 'return' | 'reject'

const DECISION_CONFIG: Record<
  Decision,
  {
    label: string
    title: string
    description: string
    requiresNotes: boolean
    icon: typeof CheckCircle
    buttonClass: string
  }
> = {
  approve: {
    label: 'Approve',
    title: 'Approve this deal?',
    description:
      'This will advance the deal to Stage 5 (Decision Point) and trigger the seller outcome conversation. This action is irreversible — it cannot be undone after confirmation.',
    requiresNotes: false,
    icon: CheckCircle,
    buttonClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
  },
  return: {
    label: 'Return to Admin',
    title: 'Return this deal to Admin?',
    description:
      'This will send the deal back to Stage 3 for Admin review. You must provide a reason. This action is irreversible — it cannot be undone after confirmation.',
    requiresNotes: true,
    icon: RotateCcw,
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  reject: {
    label: 'Reject',
    title: 'Reject this deal?',
    description:
      'This will close the deal path permanently. You must provide a documented reason. This action is irreversible — it cannot be undone after confirmation.',
    requiresNotes: true,
    icon: XCircle,
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
}

const SUGGESTED_PROMPTS = [
  'Explain this pricing assessment',
  'Compare to similar deals in the pipeline',
  'Flag a concern for the memo record',
]

interface AnalystReviewViewProps {
  memoId: string
  onBack: () => void
}

export default function AnalystReviewView({ memoId, onBack }: AnalystReviewViewProps) {
  const memo = useMemo(
    () => MOCK_ANALYST_MEMOS.find((m) => m.id === memoId),
    [memoId]
  )

  const [activeDecision, setActiveDecision] = useState<Decision | null>(null)
  const [notes, setNotes] = useState('')
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [chatInput, setChatInput] = useState('')

  if (!memo) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Memo not found.</p>
      </div>
    )
  }

  const flag = FLAG_CONFIG[memo.flagColor]
  const decisionConfig = activeDecision ? DECISION_CONFIG[activeDecision] : null
  const confirmDisabled = decisionConfig?.requiresNotes && notes.trim().length === 0

  const handleConfirm = () => {
    setActiveDecision(null)
    setNotes('')
    onBack()
  }

  const handleChatSend = () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: userMsg },
      {
        role: 'ai',
        text: "I've reviewed the data. Here's what I found based on the deal documentation and comparable transactions in the pipeline.",
      },
    ])
  }

  const sections = [
    memo.sections.dealSummary,
    memo.sections.documentAssessment,
    memo.sections.pricingAssessment,
    memo.sections.demandAlignment,
    memo.sections.aiRecommendation,
    memo.sections.aiReasoning,
  ]

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border bg-background px-6 py-3">
          <button
            onClick={onBack}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-foreground">{memo.dealName}</h1>
            <Badge variant="outline" className={flag.className}>
              {flag.label}
            </Badge>
          </div>
        </div>

        {/* Split layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left — AI Financial Memo (read-only) */}
          <div className="min-w-0 flex-1 overflow-y-auto border-r border-border p-6">
            <h2 className="mb-1 text-base font-bold text-foreground">AI Financial Memo</h2>
            <p className="mb-6 text-xs text-muted-foreground">
              {memo.assetType} &middot; {memo.assetSubType} &middot; {memo.sellerName}
            </p>

            <div className="flex flex-col gap-6">
              {sections.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-2 text-sm font-semibold text-foreground">{section.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{section.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Actions + AI Chat */}
          <div className="flex w-[380px] shrink-0 flex-col overflow-hidden">
            {/* Actions */}
            <div className="border-b border-border p-5">
              <h3 className="mb-3 text-sm font-semibold text-foreground">Decision</h3>
              <div className="flex flex-col gap-2">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white justify-start"
                  onClick={() => setActiveDecision('approve')}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Approve
                </Button>
                <Button
                  className="bg-amber-600 hover:bg-amber-700 text-white justify-start"
                  onClick={() => setActiveDecision('return')}
                >
                  <RotateCcw size={16} className="mr-2" />
                  Return to Admin
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white justify-start"
                  onClick={() => setActiveDecision('reject')}
                >
                  <XCircle size={16} className="mr-2" />
                  Reject
                </Button>
              </div>
            </div>

            {/* AI Chat */}
            <div className="flex flex-1 flex-col overflow-hidden p-5">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-slate-400" />
                <h3 className="text-sm font-semibold text-foreground">AI Assistant</h3>
              </div>

              {/* Suggested prompts */}
              {chatMessages.length === 0 && (
                <div className="mb-3 flex flex-col gap-1.5">
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        setChatMessages([
                          { role: 'user', text: prompt },
                          {
                            role: 'ai',
                            text: "I've reviewed the data. Here's what I found based on the deal documentation and comparable transactions in the pipeline.",
                          },
                        ])
                      }}
                      className="rounded-lg border border-border px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col gap-3">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`rounded-lg px-3 py-2 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'ml-8 bg-slate-600 text-white'
                          : 'mr-8 bg-muted text-foreground'
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat input */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Ask about this deal..."
                  className="flex-1 rounded-lg border border-border bg-main px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <Button variant="outline" size="sm" onClick={handleChatSend}>
                  <Send size={14} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={activeDecision !== null} onOpenChange={() => { setActiveDecision(null); setNotes('') }}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{decisionConfig?.title}</DialogTitle>
            <DialogDescription>{decisionConfig?.description}</DialogDescription>
          </DialogHeader>

          {decisionConfig?.requiresNotes && (
            <div className="py-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Notes / Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Provide your reasoning..."
                className="w-full rounded-lg border border-border bg-main px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              className={decisionConfig?.buttonClass}
              disabled={!!confirmDisabled}
              onClick={handleConfirm}
            >
              Confirm {decisionConfig?.label}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
