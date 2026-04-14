# UX / Design Spec — Seller-Side Build

**Version:** 1.0
**Status:** Active — Source of Truth
**Last Updated:** April 2026
**Audience:** Nathan Ivy (Next Sketch LLC), Cursor agents

**Companion documents:**
- `PRODUCT_REQUIREMENTS_v2_0.md` — what is being built
- `SITE_ARCHITECTURE_v1_6.md` — page structure and routes
- `BUSINESS_RULES_v1_0.md` — behavioral logic
- `UX_DESIGN_SPEC_BUYER_v1_0.md` — buyer-side spec; buyer surfaces extend seller patterns, not the reverse

---

## How to Read This Document

This spec is the canonical visual and behavioral reference for the seller-side build. It documents the established baseline — what is already built — and specifies what remains to be built. Both are authoritative.

- **BUILT** — Component exists and is correct. Do not rebuild. Extend with props if needed.
- **EXTEND** — Modify an existing component with new props only. Do not create a parallel version.
- **NEW** — A net-new component. Build from existing shadcn primitives and custom UI components listed in Section 1.5.
- **LOCKED** — Decision made. Do not deviate without explicit instruction.
- **Cursor agents:** Read this document fully before writing any seller-side file. Check `components/` and `shared/types/` before creating anything new.

---

## 1. Design System Reference

### 1.1 Font

**Geist Variable** — imported via `@fontsource-variable/geist`. Applied globally via `--font-sans`. Do not import or declare a different font.

### 1.2 Color Tokens — LOCKED

All colors are CSS custom properties defined in `frontend/src/index.css`. Use Tailwind utility classes that reference these tokens — never hardcode HSL values.

**Surface and base:**

| Token | Tailwind class | Usage |
|-------|---------------|-------|
| `--color-background` | `bg-background` | Page background |
| `--color-foreground` | `text-foreground` | Primary text |
| `--color-muted` | `bg-muted` | Subtle fills, metadata rows |
| `--color-muted-foreground` | `text-muted-foreground` | Secondary text, labels, icons |
| `--color-border` | `border-border` | All card and input borders |
| `--color-surface` | `bg-surface` | Sidebar, nav header, chat panel chrome |
| `--color-card` | `bg-card` | Elevated card surfaces |
| `--color-main` | `bg-main` | Primary content area background |

**Mode accent — Sell — LOCKED:**

| Token | Tailwind class | Value |
|-------|---------------|-------|
| `--color-mode-sell` | `text-mode-sell`, `bg-mode-sell` | `hsl(172 35% 45%)` — desaturated teal |

**Rule:** Every seller-facing interactive element (primary CTA buttons, active nav indicators, focus rings, active filter states, pagination active page) uses `mode-sell`. Never use `mode-buy` or `mode-strategy` on a seller surface. This is the primary drift prevention rule for the seller build.

**Status colors (semantic — no mode association):**

| Status | Classes |
|--------|---------|
| Active / success | `bg-green-500/20 text-green-400` |
| Market Tested / warning | `bg-amber-500/20 text-amber-400` |
| Dormant / neutral | `bg-gray-500/20 text-gray-400` |
| Withdrawn / destructive | `bg-red-500/20 text-red-400` |
| Closed / positive | `bg-emerald-500/20 text-emerald-300` |
| Draft / inactive | `bg-slate-500/20 text-slate-400` |

### 1.3 Typography Scale

All type uses Geist Variable. Apply via Tailwind utility classes only.

| Role | Classes | Usage |
|------|---------|-------|
| Page heading | `text-2xl font-bold text-foreground` | Page-level headings (e.g. "Your Listings") |
| Section heading | `text-base font-semibold text-foreground` | Section or card headings |
| Card title | `text-sm font-semibold text-foreground leading-snug` | Deal card name |
| Body | `text-sm text-foreground` | Primary content text |
| Secondary / label | `text-xs text-muted-foreground` | Metadata, labels, timestamps |
| Micro | `text-xs font-medium` | Badges, tags, chip labels |

### 1.4 Spacing and Radius

**Base radius:** `--radius: 0.625rem`.

| Class | Usage |
|-------|-------|
| `rounded-sm` | Small inline elements, chips |
| `rounded-md` | Inputs, small buttons |
| `rounded-lg` | Cards, primary buttons, modals |
| `rounded-full` | Badges, avatars, pills, page number buttons |

**Content area padding:** `px-4 sm:px-6 py-5` — applied at the page wrapper level. Do not vary per section.

**Card padding:** `p-5` is the standard. Do not use `p-4` or `p-6` for deal cards.

**Gap and spacing:** `gap-2`, `gap-3`, `gap-4`, `gap-5` in flex/grid layouts. Match surrounding context.

### 1.5 Component Library — LOCKED

All new UI primitive components must come from shadcn/ui. Check `frontend/src/components/ui/` before building anything new.

**shadcn/ui components installed:**
`badge`, `button`, `checkbox`, `dialog`, `input`, `label`, `popover`, `select`, `separator`, `sheet`, `slider`, `tabs`, `toggle`, `toggle-group`

**Custom UI components already built** (in `frontend/src/components/ui/`):
`bar-chart-row`, `document-list-item`, `dot-grid`, `expandable-tabs`, `field`, `info-callout`, `info-popover`, `item`, `multi-select`, `nested-select`, `review-row`, `section-card`, `stat-tile`

**Rule:** If a shadcn component exists that covers the need — use it. If a custom UI component exists in `components/ui/` — use it. Build new only when neither exists. When building new, use shadcn primitives as the base.

### 1.6 Icons

**Lucide React** — already imported across the codebase. Use Lucide exclusively. Size convention: `size={12}` for inline/label icons, `size={13}–{15}` for search/filter bar icons, `size={16}` for component icons, `size={18}` for modal headers, `size={40}` for empty state illustrations.

---

## 2. Shell and Layout Rules

### 2.1 AppShell — Do Not Modify

`AppShell.tsx` is the global layout component. Seller pages render inside it. Do not edit `AppShell.tsx` unless fixing a bug.

**Sell mode is already wired in `AppShell` with:**
- Mode accent: `mode-sell` (teal) — defined in `MODE_CONFIG`
- Nav items: Your Listings, Create Listing, Drafts — already defined
- Chat panel: `mode-sell` bubble and send button colors — already defined

Wire seller pages through `ShellDemo.tsx`. Do not add seller routing logic inside `AppShell`.

### 2.2 Sidebar State

Sidebar collapsed by default (48px wide). All seller pages render correctly at both 48px and 200px sidebar widths. Do not assume a fixed sidebar width in any layout.

### 2.3 Chat Panel

Persistent and resizable. Minimum width 280px, default ~30% of viewport. Seller deal room and wizard use `mode-sell` accent automatically via `MODE_CONFIG`. All seller pages render correctly when the chat panel is open at any width between 280px and 50% of viewport.

### 2.4 Main Content Area

Background: `bg-main`. Scrollable vertically. All seller pages use `px-4 sm:px-6 py-5` as the standard wrapper padding with `max-w-[1600px] mx-auto min-w-0`.

---

## 3. Established Component Patterns — BUILT

These components exist and define the seller design baseline. Do not rebuild them. Extend with props only when needed.

### 3.1 DealCard — BUILT

**File:** `frontend/src/components/DealCard.tsx`

Sell mode is the default (`mode="sell"`). Established pattern:

```
┌──────────────────────────────────────────┐
│ [Icon]  Deal Name                [Badge] │  ← header: asset icon + name + StatusBadge
│         MSA location (truncated)         │  ← InfoPopover label
│                                          │
│ [Sub-type · units]  [$price]  [deals]    │  ← metadata row: text-xs text-muted-foreground
│                                          │
│ ████████░░░░░░  Stage X of 9 — Label     │  ← StageProgressBar + stage label
│                              👥 N Buyer  │  ← buyer pool count
│                                          │
│ [View Details]      [Open Deal Room]     │  ← footer: outline secondary + mode-sell primary
└──────────────────────────────────────────┘
```

- Container: `rounded-lg border border-border bg-muted/30 shadow-sm p-5`
- Hover: `hover:border-mode-sell/30`
- Footer CTAs: "View Details" (`variant="outline"`) + "Open Deal Room" (`bg-mode-sell text-white`)
- `DealMetricsBar` renders in sell mode. Never render in buy mode.

### 3.2 DealCardList — BUILT

**File:** `frontend/src/components/DealCardList.tsx`

List view variant of `DealCard`. Used when `viewMode === 'list'` in `SellingList`. Same data, horizontal layout. Do not rebuild.

### 3.3 StatusBadge — BUILT

**File:** `frontend/src/components/StatusBadge.tsx`

Semantic status colors. No mode association. Used as-is across all surfaces. Do not modify.

| Status | Label | Style |
|--------|-------|-------|
| `active` | Active | `bg-green-500/20 text-green-400` |
| `market_tested` | Market Tested | `bg-amber-500/20 text-amber-400` |
| `dormant` | Dormant | `bg-gray-500/20 text-gray-400` |
| `withdrawn` | Withdrawn | `bg-red-500/20 text-red-400` |
| `closed` | Closed | `bg-emerald-500/20 text-emerald-300` |
| `draft` | Draft | `bg-slate-500/20 text-slate-400` |

### 3.4 DealPreviewModal — BUILT (seller viewer)

**File:** `frontend/src/components/DealPreviewModal.tsx`

Seller viewer (`viewer="seller"`, default) shows: asset type, sub-type, geography, deal stage, match score, price (unblurred for seller), buyer funnel stat, and "Open Deal Room" CTA in `bg-mode-sell`. Do not modify the seller viewer rendering path.

### 3.5 SellerListingsEmpty — BUILT

**File:** `frontend/src/components/SellerListingsEmpty.tsx`

Variants: `'no-results'`, `'no-listings'`. CTA uses `bg-mode-sell`. Do not modify — extend with new variants only if needed.

---

## 4. Screen Specs — Sell Mode

### 4.1 Your Listings (`/selling`) — BUILT

**File:** `frontend/src/pages/SellingList.tsx`

**Status:** Built and correct. Documents the established pattern all seller list pages follow.

**Page structure (top to bottom):**

```
Breadcrumb:    🏠 > Sell > Your Listings
Page heading:  Your Listings  [text-2xl font-bold]
Stats row:     [Deal Rooms Open] [Deals Started] [Deals Cancelled] [Deals Closed]
Search bar + Filters button + Grid/List toggle
Active filter chips (when filters applied)
Deal card grid (2-col) or list view
Pagination bar: "Showing 1–N of N" left, page numbers right
```

**Breadcrumb:** `flex items-center gap-1.5 text-xs text-muted-foreground` — `Home` icon (size 13) + `>` separators + section + current page in `text-foreground font-medium`.

**Stats row:** `StatTileGrid` with four `StatTile` components. Mock source: `MOCK_SELLER_PERFORMANCE` from `data/mock/users.ts`.

**Search input:** `rounded-lg border border-border bg-main py-2 pl-9 pr-3 text-sm`. Focus state: `focus:border-mode-sell/50`. Search icon `size={15}` positioned `left-3`.

**Filters button:** `rounded-lg border border-border px-3 py-2 text-sm`. Active (filters applied): `border-mode-sell/50 text-mode-sell bg-mode-sell/5`. Active filter count badge: `bg-mode-sell` pill with white text.

**Filter chips (active filters):** `rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-foreground`. Each chip has an X dismiss button.

**View toggle:** Grid/list icon pair in `rounded-lg border border-border`. Active state: `bg-muted text-foreground`.

**Card grid:** `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4`.

**Pagination:** `text-xs text-muted-foreground` count left. Page number buttons `h-8 w-8 rounded-md text-xs`. Active page: `bg-mode-sell text-white font-medium`. Inactive: `text-muted-foreground hover:bg-muted hover:text-foreground`.

**Empty state wiring:**
- Search/filter active, no results → `SellerListingsEmpty variant="no-results"`
- No listings at all → `SellerListingsEmpty variant="no-listings"` — must pass `onCreateListing` prop

### 4.2 Create Listing Wizard (`/selling/create`) — BUILT

**File:** `frontend/src/pages/CreateListingWizard.tsx`

**Status:** Built and correct. Documents the established wizard pattern all multi-step seller flows follow.

**Layout:** Two-column — wizard form left, AI chat panel right (wired through AppShell). Full height of content area.

**Step indicator:** Horizontal step row at top. Five steps: `['Deal Overview', 'Asset Specs', 'Asset Details', 'Documents', 'Review']`. Active step: `text-mode-sell font-semibold`. Inactive: `text-muted-foreground`.

**Section containers:** `SectionCard` from `components/ui/section-card.tsx`. One `SectionCard` per logical group of fields.

**Form fields:** `Field` + `FieldLabel` + `FieldGroup` from `components/ui/field.tsx` for all inputs. `Input` for text/number fields. `Select` for dropdowns. `MultiSelect` for multi-value fields. `NestedSelect` for hierarchical selections (asset class → sub-type). `ToggleGroup` for binary/small-option choices. `Slider` for range inputs.

**Primary advance button:** `bg-mode-sell text-white` — "Continue" or step-specific label. Full width at bottom of form area or right-aligned in footer.

**Secondary actions:** "Save as Draft" — `variant="outline"`. "Back" — `variant="ghost"` or text link.

**Ownership gate:** Hard gate on final step submit. `OwnershipGate` modal fires before `onSubmit()` is called. See Section 6.1.

**Document step (step 4):** `DocumentListItem` and `DocumentListGroup` from `components/ui/document-list-item.tsx`. Pending documents show upload affordance. Uploaded documents show filename + replace option.

**Review step (step 5):** `ReviewRow` from `components/ui/review-row.tsx` for each field summary. Read-only. "Submit Listing" CTA triggers `OwnershipGate`.

### 4.3 Seller Deal Room View (`/seller-deal-room/:type/:id`) — BUILT

**File:** `frontend/src/pages/SellerDealRoomView.tsx`

**Status:** Built and correct. Documents the established deal room pattern.

**Layout:** Full height. `DealRoomHeader` at top. Tabbed content below.

**Tabs** (shadcn `Tabs`): Documents · Buyers · Market Intel · Milestones

**Tab — Documents:**
- `DocumentListGroup` + `DocumentListItem` from `components/ui/document-list-item.tsx`
- Seller can upload and replace documents — upload affordance present
- Uploaded docs show filename + "Replace" action

**Tab — Buyers:**
- `StatTileGrid` + `StatTile` for buyer funnel stats (Buyer Pool, Invited, Accepted, Active Seats, Passes)
- `BuyerFunnelStat` component (already built)
- Seated buyers list: `SeatedBuyerItem` component. Shows buyer name/company, match score ring, qualification status.
- Non-seated buyers: anonymized — `Item` from `components/ui/item.tsx`

**Tab — Market Intel:**
- `SummaryCard` for market narrative
- `BarChartRow` from `components/ui/bar-chart-row.tsx` for comparable data

**Tab — Milestones:**
- `MilestoneTimeline` component for 9-stage lifecycle tracker
- Post-acceptance milestone tracker for Stage 9 deals

**Market Tested state:** When `deal.status === 'market_tested'`, `MarketTestedBanner` renders immediately below `DealRoomHeader`, above the tabs. See Section 6.3.

**Chat Panel — Seller Deal Room:**

The persistent chat panel in the seller deal room includes the same three-element structure introduced on the buyer side:

**1. Specialist Identity Card**
- Persistent card fixed at the top of the chat panel — does not scroll with the message thread.
- Platform list item component: platform identity name (label TBD — branding sprint; placeholder: "Your Specialist") + last active relative timestamp + status indicator dot.
- The "+" action opens a read-only role description card — not a message CTA.

**2. Channel Toggle**
- Two-state toggle below the identity card, above the message thread:
  - **AI** — automated platform responses, deal Q&A, Stage 1/2 wizard guidance, Stage 5 outcome conversation (AI-led)
  - **Specialist** — DS-composed messages; active when DS has stepped into the Stage 5 conversation or initiated direct contact
- Unread badge on whichever channel has new unread messages — clears on view.
- Toggle labels are placeholders pending branding sprint.
- Default active channel: AI.

**3. Message Thread + Compose**
- `chatContext.contextLabel` = deal name (existing behavior preserved).
- Thread renders the active channel's messages only — switching toggle swaps thread.
- Seller skills chips on the AI channel only — not shown on Specialist channel.
- Specialist bubble color: neutral/slate — visually distinct from AI channel `mode-sell` bubbles.

> See `UX_DESIGN_SPEC_BUYER_v1_0.md` Section 4.4 for the parallel buyer-side spec. The toggle and identity card pattern is identical across both external roles.

**Buyer match count prominence** (per PRD Section 4.1 locked requirement):
- Position: directly below listing title in `DealRoomHeader`
- Label: `{n} Buyer Pool` — plain language
- Style: large, accent-colored, visually dominant — not a badge
- Behavior: clickable — routes seller to Buyers tab

### 4.4 Seller Drafts (`/selling/drafts`) — BUILT

**File:** `frontend/src/pages/SellerDraftsPage.tsx`

**Status:** Built and correct.

Draft cards: listing name or "Untitled Listing", saved date, "Continue" + "Delete" actions. Same card shell pattern as `DealCard` (`rounded-lg border border-border bg-muted/30 p-5`).

Empty state: `SellerListingsEmpty variant="no-results"` with message adjusted to "No drafts yet."

---

## 5. Modal and Overlay Specs

### 5.1 OwnershipGate — NEW

**File:** `frontend/src/components/OwnershipGate.tsx`

**Trigger:** Seller clicks "Submit Listing" on the wizard review step. Hard gate — cannot be bypassed. Per Business Rules 1.6, 6.3.

**Base:** shadcn `Dialog` from `components/ui/dialog.tsx`. Same hard gate pattern as `SuccessFeeModal.tsx` — no backdrop dismiss, no Escape dismiss.

```typescript
interface OwnershipGateProps {
  open: boolean
  listingName: string
  onConfirm: () => void    // calls wizard onSubmit() — listing submitted
  onCancel: () => void     // returns seller to review step
}
```

**Content:**
- Heading: "Confirm Ownership" — `text-lg font-semibold`
- Body: "By submitting this listing, you confirm that you have the authority to list this asset for sale or disposition on behalf of the ownership entity."
- Checkbox (shadcn `Checkbox`): "I confirm I have authority to list this asset" — required before Confirm is enabled
- Confirm button: `bg-mode-sell text-white` — disabled + `opacity-50 cursor-not-allowed` until checkbox checked
- Cancel button: `variant="outline"` — returns to review step without submitting

**Hard gate rules:** `onOpenChange` must reject all attempts to close except explicit Confirm or Cancel. Match `SuccessFeeModal` pattern exactly.

### 5.2 CreditsModal — NEW

**File:** `frontend/src/components/CreditsModal.tsx`

**Trigger A:** Seller taps credits display ("400 Credits") in AppShell top bar — opens in `view` mode.
**Trigger B:** Seller attempts to activate a deal room with insufficient credits — opens in `gate` mode.

**Per:** PRD Section 4.7, Business Rules 13.1–13.4.

**Base:** shadcn `Dialog` from `components/ui/dialog.tsx`. Standard dismissible dialog (not a hard gate in either mode).

```typescript
interface CreditsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentBalance: number
  mode?: 'view' | 'gate'       // default 'view'
  requiredCredits?: number      // only used when mode === 'gate'
}
```

**View mode content:**
- Heading: "Your Credits"
- Balance: `text-3xl font-bold text-foreground` + "credits" in `text-sm text-muted-foreground`
- Explainer: "Credits activate deal rooms. Your first deal room is free — 400 credits included."
- Purchase options: three `variant="outline"` buttons — "100 credits · $100", "500 credits · $450", "1,000 credits · $800". Click: `console.log('[Credits] Purchase initiated:', amount)` — mocked per PRD Section 4.7.
- Transaction history: placeholder — `text-xs text-muted-foreground` — "Transaction history coming soon."

**Gate mode content:**
- Heading: "Credits Required"
- Message: "You need credits to activate this listing. Purchase credits below to continue."
- Same purchase options as view mode
- Cancel: `variant="outline"` — closes modal, cancels activation

### 5.3 CreditGate — NEW

**File:** `frontend/src/components/CreditGate.tsx`

Thin wrapper component that intercepts a seller's activation attempt and checks credit balance before proceeding.

```typescript
interface CreditGateProps {
  currentBalance: number
  requiredCredits: number
  onSufficientCredits: () => void
  children: React.ReactNode    // the activation CTA being wrapped
}
```

On click: if `currentBalance >= requiredCredits` → calls `onSufficientCredits()`. Otherwise → opens `CreditsModal mode="gate"`. Prototype: mock balance as 400 for first deal room (sufficient), 0 for any subsequent activation (triggers gate).

### 5.4 MarketTestedBanner — NEW

**File:** `frontend/src/components/MarketTestedBanner.tsx`

**Trigger:** `deal.status === 'market_tested'` in `SellerDealRoomView`. Per Business Rules 10.3, 10.4.

First check `components/ui/info-callout.tsx` — if it supports an amber/warning variant with multiple action buttons, extend it. If not, build `MarketTestedBanner` as a new component.

```typescript
interface MarketTestedBannerProps {
  dealName: string
  onAdjust: () => void     // adjust pricing/structure → re-enters Stage 7
  onPause: () => void      // move to Dormant
  onWithdraw: () => void   // status → Withdrawn
}
```

**Layout:** Full-width, placed below `DealRoomHeader` above tabs.
`bg-amber-500/10 border border-amber-500/30 rounded-lg p-4`

**Content:**
- Icon: `AlertTriangle` Lucide, `size={16}`, `text-amber-400` — inline left of heading
- Heading: "Market Tested" — `text-sm font-semibold text-amber-400`
- Body: "Your buyer pool has been exhausted with no offers received. Choose how you'd like to proceed." — `text-sm text-muted-foreground`
- Action row: three `variant="outline" size="sm"` buttons — "Adjust Listing", "Pause", "Withdraw"
- Prototype: all actions `console.log` the selection taken

---

## 6. Empty States

All seller empty states use `SellerListingsEmpty.tsx`. CTA buttons use `bg-mode-sell`.

| Screen | Condition | Variant | CTA |
|--------|-----------|---------|-----|
| Your Listings | No listings exist | `no-listings` | "Create Your First Listing" |
| Your Listings | Search/filter, no results | `no-results` | "Clear Filters" |
| Seller Drafts | No drafts | `no-results` | None — informational |

---

## 7. Interaction Patterns

### 7.1 Filter Active State

When filters are applied, the Filters button switches to `border-mode-sell/50 text-mode-sell bg-mode-sell/5`. Active filter count badge uses `bg-mode-sell`. Active filter chips render below the search row. "Clear All" text link right-aligned in the chip row.

### 7.2 Search Behavior

Live filtering as user types. `searchQuery.trim()` applied against deal name, MSA, cities, and asset sub-type. No debounce required for prototype — filter on every keystroke.

### 7.3 View Toggle (Grid / List)

State persists per session in component state (`useState<'grid' | 'list'>`). Grid: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4`. List: `flex flex-col gap-2` with `DealCardList` component.

### 7.4 Deal Preview Modal Trigger

"View Details" button on every deal card opens `DealPreviewModal`. Focus returns to the triggering button on close — use `triggerRef` pattern from `SellingList.tsx` (already implemented). Do not rebuild this pattern.

### 7.5 Chat Panel — Seller Context

Seller listing wizard: `chatContext.contextLabel = 'New Listing'`. Seller deal room: `chatContext.contextLabel = deal.name`. Skills are deal-specific. Wire through `ShellDemo.tsx` — do not modify `AppShell`.

---

## 8. Onboarding Shell — Seller Bucket 2

The seller onboarding path (deal room creation as first action post-signup) uses the `OnboardingShell` component:

- Top bar: logo only — no mode switcher, no credits, no nav arrows
- Left sidebar: hidden
- AI chat panel: visible — seller onboarding is wizard + AI conversation

The `CreateListingWizard` renders inside `OnboardingShell` when entered from the onboarding flow (`isOnboarding: true` flag). The same wizard component handles both post-onboarding and post-auth create listing flows — differentiated by the shell wrapper, not the component itself.

---

## 9. Project Structure Rules — LOCKED

```
frontend/src/pages/          — One file per page. Seller pages go here.
frontend/src/components/     — Shared components. Seller-specific components go here.
frontend/src/components/ui/  — Primitive UI only. shadcn-based. No new primitives without explicit instruction.
frontend/src/data/mock/      — Mock data. One file per entity type.
shared/types/                — All TypeScript interfaces. Define here first, pages second.
backend/agents/              — Agent stubs only. No agent logic in frontend.
```

**Rule: check before creating.** Before creating any new component, search `frontend/src/components/` for an existing component that can be extended with props. Creating a parallel component when an extendable one exists is a violation of this spec.

**Rule: shared types first.** Before writing any seller page or component, confirm the required types exist in `shared/types/`. Add there before touching any page file.

**Rule: no backend logic in frontend.** All agent interactions go through `backend/agents/` stubs.

---

*Last updated: April 2026*
