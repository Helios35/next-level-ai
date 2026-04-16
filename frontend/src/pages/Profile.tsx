import { useState } from 'react'
import { User as UserIcon, Briefcase, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import type { User } from '@shared/types/user'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { SectionCard } from '@/components/ui/section-card'
import { Breadcrumbs } from '@/components/ui/breadcrumbs'
import { StatTile, StatTileGrid } from '@/components/ui/stat-tile'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// ── Fields of Truth options (mirror BuyerQualificationForm.tsx) ──────────

const CAPITAL_SOURCE_OPTIONS = [
  { value: 'equity', label: 'Equity' },
  { value: 'debt', label: 'Debt' },
  { value: 'both', label: 'Both' },
]

const EQUITY_CHECK_OPTIONS = [
  { value: 'under_1m', label: 'Under $1M' },
  { value: '1m_5m', label: '$1M–$5M' },
  { value: '5m_10m', label: '$5M–$10M' },
  { value: '10m_25m', label: '$10M–$25M' },
  { value: '25m_plus', label: '$25M+' },
]

const APPROVAL_PROCESS_OPTIONS = [
  { value: 'discretionary', label: 'Discretionary' },
  { value: 'committee', label: 'Committee' },
  { value: 'other', label: 'Other' },
]

const EXPERIENCE_OPTIONS = [
  { value: '0_2', label: '0–2 years' },
  { value: '3_5', label: '3–5 years' },
  { value: '6_10', label: '6–10 years' },
  { value: '10_plus', label: '10+ years' },
]

const FIRM_TYPE_OPTIONS = [
  { value: 'solo_investor', label: 'Solo Investor' },
  { value: 'builder', label: 'Builder' },
  { value: 'land_developer', label: 'Land Developer' },
  { value: 'operator', label: 'Operator' },
  { value: 'sponsor', label: 'Sponsor' },
  { value: 'capital_allocator', label: 'Capital Allocator' },
  { value: 'other', label: 'Other' },
]

// ── Helpers ────────────────────────────────────────────────────────────────

function roleLabel(role: User['role']): string {
  if (role === 'principal') return 'Principal'
  if (role === 'seller') return 'Seller'
  return 'Broker'
}

function isBuyerRole(role: User['role']): boolean {
  return role === 'principal' || role === 'broker'
}

function isSellerRole(role: User['role']): boolean {
  return role === 'seller'
}

// ── Component ──────────────────────────────────────────────────────────────

interface ProfileProps {
  user: User
  onBack?: () => void
}

export default function Profile({ user }: ProfileProps) {
  const showBuyer = isBuyerRole(user.role)
  const showSeller = isSellerRole(user.role)

  // Basic info edit state
  const [editingBasic, setEditingBasic] = useState(false)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [company, setCompany] = useState(user.company)

  const handleSaveBasic = () => {
    console.log('[Profile] Updated:', { name, email, company })
    setEditingBasic(false)
  }
  const handleCancelBasic = () => {
    setName(user.name)
    setEmail(user.email)
    setCompany(user.company)
    setEditingBasic(false)
  }

  // Qualification state
  const [capitalSource, setCapitalSource] = useState('')
  const [equityCheck, setEquityCheck] = useState('')
  const [approvalProcess, setApprovalProcess] = useState('')
  const [experience, setExperience] = useState('')
  const [firmType, setFirmType] = useState('')

  const handleSaveQualification = () => {
    console.log('[Profile] Qualification saved:', {
      capitalSource,
      equityCheck,
      approvalProcess,
      experience,
      firmType,
    })
  }

  // Account / password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handlePasswordSubmit = () => {
    console.log('[Profile] Password change requested')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="px-6 py-5">
      <Breadcrumbs className="mb-3" items={[{ label: 'Profile' }]} />
      <h1 className="text-xl font-semibold text-foreground mb-5">Your Profile</h1>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {showBuyer && <TabsTrigger value="qualification">Qualification</TabsTrigger>}
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* ─── Overview ────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-5">
          <SectionCard icon={UserIcon} title="Basic Information">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-foreground shrink-0">
                  {user.avatarInitials}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  {editingBasic ? (
                    <div className="space-y-3">
                      <Field>
                        <FieldLabel>Name</FieldLabel>
                        <Input value={name} onChange={(e) => setName(e.target.value)} />
                      </Field>
                      <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                      </Field>
                      <Field>
                        <FieldLabel>Company</FieldLabel>
                        <Input value={company} onChange={(e) => setCompany(e.target.value)} />
                      </Field>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-semibold text-foreground">{user.name}</span>
                        <Badge variant="secondary">{roleLabel(user.role)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.company}</p>
                    </>
                  )}
                </div>
              </div>
              {!editingBasic && (
                <Button variant="outline" size="sm" onClick={() => setEditingBasic(true)}>
                  Edit
                </Button>
              )}
            </div>
            {editingBasic && (
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" onClick={handleCancelBasic}>
                  Cancel
                </Button>
                <Button className="bg-mode-buy text-white hover:bg-mode-buy/80" onClick={handleSaveBasic}>
                  Save
                </Button>
              </div>
            )}
          </SectionCard>

          {showSeller && (
            <SectionCard icon={Briefcase} title="Seller Activity">
              <StatTileGrid className="grid-cols-3">
                <StatTile value={4} label="Deal Rooms Open" />
                <StatTile value={4} label="Dispos Started" />
                <StatTile value={0} label="Deals Closed" />
              </StatTileGrid>
            </SectionCard>
          )}
        </TabsContent>

        {/* ─── Qualification ──────────────────────────────────────────── */}
        {showBuyer && (
          <TabsContent value="qualification" className="space-y-5">
            {user.qualificationComplete ? (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-400 shrink-0" />
                <span className="text-sm text-foreground">Profile Complete</span>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 flex items-center gap-2">
                <AlertCircle size={16} className="text-amber-400 shrink-0" />
                <span className="text-sm text-foreground">
                  Profile Incomplete — completing your profile improves your seat allocation priority.
                </span>
              </div>
            )}

            <SectionCard icon={ShieldCheck} title="Buyer Qualification" iconClassName="text-mode-buy">
              <Field>
                <FieldLabel>Capital Source</FieldLabel>
                <Select items={CAPITAL_SOURCE_OPTIONS} value={capitalSource} onValueChange={setCapitalSource}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {CAPITAL_SOURCE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Equity Check Size</FieldLabel>
                <Select items={EQUITY_CHECK_OPTIONS} value={equityCheck} onValueChange={setEquityCheck}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {EQUITY_CHECK_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Approval Process</FieldLabel>
                <Select items={APPROVAL_PROCESS_OPTIONS} value={approvalProcess} onValueChange={setApprovalProcess}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {APPROVAL_PROCESS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Experience</FieldLabel>
                <Select items={EXPERIENCE_OPTIONS} value={experience} onValueChange={setExperience}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {EXPERIENCE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Firm Type</FieldLabel>
                <Select items={FIRM_TYPE_OPTIONS} value={firmType} onValueChange={setFirmType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {FIRM_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <div className="flex justify-end pt-2">
                <Button
                  className="bg-mode-buy text-white hover:bg-mode-buy/80"
                  onClick={handleSaveQualification}
                >
                  Save Qualification
                </Button>
              </div>
            </SectionCard>
          </TabsContent>
        )}

        {/* ─── Account ────────────────────────────────────────────────── */}
        <TabsContent value="account" className="space-y-5">
          <SectionCard icon={ShieldCheck} title="Account & Security">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <p className="text-sm text-foreground">{user.email}</p>
            </Field>

            <div className="pt-2 border-t border-border" />

            <h4 className="text-sm font-semibold text-foreground">Change Password</h4>

            <Field>
              <FieldLabel>Current Password</FieldLabel>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>New Password</FieldLabel>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel>Confirm New Password</FieldLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Field>

            <div className="flex justify-end pt-2">
              <Button
                className="bg-mode-buy text-white hover:bg-mode-buy/80"
                onClick={handlePasswordSubmit}
              >
                Update Password
              </Button>
            </div>
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  )
}
