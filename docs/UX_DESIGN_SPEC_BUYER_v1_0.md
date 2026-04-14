# UX / Design Spec — Buyer-Side Build

**Version:** 1.0
**Status:** Active — Source of Truth
**Last Updated:** April 2026
**Audience:** Nathan Ivy (Next Sketch LLC), Cursor agents

**Companion documents:**
- `PRODUCT_REQUIREMENTS_v2_0.md` — what is being built
- `SITE_ARCHITECTURE_v1_6.md` — page structure and routes
- `BUSINESS_RULES_v1_0.md` — behavioral logic
- `AGENT_BUYER_ACTIVATION_v1_0.md` — activation conversation behavior
- `AGENT_BUYER_DEAL_ROOM_v1_0.md` — deal room agent behavior

---

## How to Read This Document

This spec governs the buyer-side build only. The seller-side build is the established design baseline — buyer surfaces extend it, they do not redefine it. Every rule here applies across all buyer pages unless explicitly scoped otherwise.

- **EXTEND** — Modify an existing component with new props. Do not create a parallel version.
- **NEW** — A net-new component. Build from shadcn primitives listed. Follow established card and layout patterns.
- **LOCKED** — Decision made. Do not deviate without explicit instruction.
- **Cursor agents:** Read this document fully before writing any buyer-side file. Check `components/` and `shared/types/` before creating anything new.

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

**Mode accent colors — LOCKED:**

| Mode | Token | Tailwind class | Value |
|------|-------|---------------|-------|
| Sell | `--color-mode-sell` | `text-mode-sell`, `bg-mode-sell` | `hsl(172 35% 45%)` — desaturated teal |
| Buy | `--color-mode-buy` | `text-mode-buy`, `bg-mode-buy` | `hsl(262 30% 55%)` — desaturated purple |
| Strategy | `--color-mode-strategy` | `text-mode-strategy`, `bg-mode-strategy` | `hsl(38 50% 50%)` — desaturated amber |

**Rule:** Every buyer-facing interactive element (primary CTA buttons, active nav indicators, focus rings, chat send button, AI chat bubbles) uses `mode-buy`. Never use `mode-sell` or `mode-strategy` in a buyer-mode surface. Seller build uses `mode-sell` — buyer build uses `mode-buy`. This is the primary drift prevention rule.

**Status colors (semantic — no mode association):**

| Status | Classes |
|--------|---------|
| Active / success | `bg-green-500/20 text-green-400` |
| Warning / amber | `bg-amber-500/20 text-amber-400` |
| Neutral / muted | `bg-gray-500/20 text-gray-400` |
| Destructive | `bg-red-500/20 text-red-400` |
| Closed / positive | `bg-emerald-500/20 text-emerald-300` |
| Draft / inactive | `bg-slate-500/20 text-slate-400` |

### 1.3 Typography Scale

All type uses Geist Variable. Apply via Tailwind utility classes only.

| Role | Classes | Usage |
|------|---------|-------|
| Page heading | `text-xl font-semibold text-foreground` | Page-level headings |
| Section heading | `text-base font-semibold text-foreground` | Section or card headings |
| Card title | `text-sm font-semibold text-foreground leading-snug` | Deal card name, strategy name |
| Body | `text-sm text-foreground` | Primary content text |
| Secondary / label | `text-xs text-muted-foreground` | Metadata, labels, timestamps |
| Micro | `text-xs font-medium` | Badges, tags, button labels |

### 1.4 Spacing and Radius

**Base radius:** `--radius: 0.625rem`. Use the Tailwind scale derived from this:

| Class | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | ~0.375rem | Small inline elements |
| `rounded-md` | ~0.5rem | Inputs, small buttons |
| `rounded-lg` | 0.625rem | Cards, primary buttons, modals |
| `rounded-full` | 9999px | Badges, avatars, pills |

**Card padding:** `p-5` is the standard card padding. Do not use `p-4` or `p-6` for cards — `p-5` matches all existing seller cards.

**Gap and spacing:** Use `gap-2`, `gap-3`, `gap-4`, `gap-5` in flex/grid layouts. Match surrounding context — do not introduce new spacing values.

### 1.5 Component Library — shadcn/ui — LOCKED

All new UI component primitives must come from shadcn/ui. Check `frontend/src/components/ui/` before building anything new. The following shadcn components are already installed:

`badge`, `button`, `checkbox`, `dialog`, `input`, `label`, `popover`, `select`, `separator`, `sheet`, `slider`, `tabs`, `toggle`, `toggle-group`

**Custom UI components already built** (in `frontend/src/components/ui/`):
`bar-chart-row`, `document-list-item`, `dot-grid`, `expandable-tabs`, `field`, `info-callout`, `info-popover`, `item`, `multi-select`, `nested-select`, `review-row`, `section-card`, `stat-tile`

**Rule:** If a shadcn component exists that covers the need — use it. If a custom UI component exists in `components/ui/` — use it. Build new only when neither exists. When building new, use shadcn primitives as the base.

### 1.6 Icons

**Lucide React** — already imported across the codebase. Use Lucide exclusively. Do not import from other icon libraries. Size convention: `size={12}` for inline/label icons, `size={16}` for component icons, `size={18}` for modal headers, `size={40}` for empty state illustrations.

---

## 2. Shell and Layout Rules

### 2.1 AppShell — Do Not Modify

`AppShell.tsx` is the global layout component. It is fully built and functional across all three modes. The buyer build wires up Buy and Strategy mode pages inside it — it does not change the shell itself.

**Buy mode is already wired in `AppShell` with:**
- Mode accent: `mode-buy` (purple) — already defined in `MODE_CONFIG`
- Nav items: Your Deals, Discover Deals, Access Requested — already defined
- Chat panel: `mode-buy` bubble and send button colors — already defined

Cursor agents: do not edit `AppShell.tsx` unless a bug is found. Wire buyer pages through `ShellDemo.tsx`.

### 2.2 Sidebar State

Sidebar is collapsed by default (`sidebarOpen: false`, width 48px). Buyer pages must be built to render correctly at both 48px (collapsed) and 200px (expanded) sidebar widths. Do not assume a fixed sidebar width in any buyer layout.

### 2.3 Chat Panel

The chat panel is persistent and resizable. Minimum width is 280px. Default is 30% of viewport. Buyer deal room chat uses `mode-buy` accent (already configured). All buyer pages must render correctly when the chat panel is open at any width between 280px and 50% of viewport.

### 2.4 Main Content Area

Background: `bg-main`. Scrollable vertically. Page content uses `px-6 py-5` as the standard content padding. Do not use `px-4` or `px-8` — match the seller pages exactly.

---

## 3. Component Extension Rules

### 3.1 DealCard — EXTEND, do not rebuild — LOCKED

**File:** `frontend/src/components/DealCard.tsx`

Add the following props to the existing `DealCardProps` interface:

```typescript
mode?: 'sell' | 'buy'                    // defaults to 'sell' — no breaking change
buyerCtaState?: BuyerCtaState            // only read when mode === 'buy'
matchScore?: number                      // only rendered when mode === 'buy'
```

```typescript
type BuyerCtaState =
  | 'coming_soon'       // Deal is Stage 6 — buyer can indicate interest
  | 'request_access'    // Deal is Stage 7 — buyer has not yet requested
  | 'access_pending'    // Buyer has requested, DS has not responded
  | 'wait_queue'        // DS denied seat — buyer is in wait queue
  | 'enter_deal_room'   // Buyer is seated — can enter
```

**Buyer mode rendering rules:**

- `DealMetricsBar` is **not rendered** when `mode === 'buy'`. Remove it from the buyer rendering path entirely.
- `MatchScoreRing` is rendered in the card header area (top-right, replacing or alongside `StatusBadge`) when `mode === 'buy'` and `matchScore` is provided.
- Price display: blurred (`blur-sm select-none`) when `mode === 'buy'` and `buyerCtaState` is not `'enter_deal_room'`. Unblurred only when buyer is seated.
- CTA button area: single button spanning full width, label and behavior driven by `buyerCtaState`. Color is `bg-mode-buy` (not `bg-mode-sell`).
- "View Details" secondary button: retained in buyer mode. Opens `DealPreviewModal` with `viewer="buyer"`.

**Buyer CTA button map:**

| `buyerCtaState` | Button label | Behavior | Style |
|----------------|-------------|----------|-------|
| `coming_soon` | Indicate Interest | Logs interest event, updates to "Interested ✓" | `bg-mode-buy` |
| `request_access` | Request Access | Submits access request, state → `access_pending` | `bg-mode-buy` |
| `access_pending` | Access Pending | Disabled — no action | `bg-muted text-muted-foreground cursor-not-allowed` |
| `wait_queue` | Wait Queue | Disabled — no action | `bg-muted text-muted-foreground cursor-not-allowed` |
| `enter_deal_room` | Enter Deal Room | Routes to buyer deal room view | `bg-mode-buy` |

**MatchScoreRing in buyer mode:**

`MatchScoreRing` currently uses `stroke="var(--color-mode-sell)"`. Add a `colorMode` prop:

```typescript
colorMode?: 'sell' | 'buy' | 'strategy'  // defaults to 'sell'
```

Use `var(--color-mode-buy)` when `colorMode === 'buy'`. Always pass `colorMode="buy"` from buyer deal cards.

### 3.2 DealPreviewModal — EXTEND, do not rebuild — LOCKED

**File:** `frontend/src/components/DealPreviewModal.tsx`

Add prop:

```typescript
viewer?: 'seller' | 'buyer'   // defaults to 'seller' — no breaking change
```

**Buyer viewer rendering rules:**
- Hide `BuyerFunnelStat` — that is seller-context data. Buyers do not see pool stats.
- Show `MatchScoreRing` (with `colorMode="buy"`) prominently in the header area.
- Price: blurred (`blur-sm select-none`) unless buyer's `buyerCtaState === 'enter_deal_room'`.
- CTA button: driven by `buyerCtaState` — same map as DealCard. Color `bg-mode-buy`.
- `StageProgressBar`: show only Stages 6–9 when `viewer === 'buyer'`. Seller sees all 9 stages.

### 3.3 StatusBadge — No change needed

`StatusBadge.tsx` uses semantic status colors (green, amber, gray) independent of mode. It works as-is for buyer surfaces. Do not modify.

### 3.4 SellerListingsEmpty — EXTEND pattern, create buyer variant

**Do not modify** `SellerListingsEmpty.tsx` — that is scoped to sell mode.

Create `BuyerEmptyState.tsx` following the identical pattern:

```typescript
interface BuyerEmptyStateProps {
  variant: 'no-strategy' | 'no-matches' | 'no-access-requests' | 'no-strategies' | 'no-drafts' | 'no-results'
  onCTA?: () => void
}
```

Apply the same layout: `flex flex-col items-center justify-center py-20 text-center`. Icon at `size={40}` with `text-muted-foreground/40`. CTA button uses `bg-mode-buy` (not `bg-mode-sell`).

---

## 4. Screen Specs — Buy Mode

### 4.1 Your Deals (`/buyer-matches`)

**Purpose:** Buyer's primary deal feed. Shows matched deals with state-dependent CTAs.

**Layout:** Full-width content area, `px-6 py-5`. Page heading row + filter controls + deal card grid.

**Page heading row:**
- Left: "Your Deals" — `text-xl font-semibold text-foreground`
- Right: match count — `text-sm text-muted-foreground` — e.g. "14 matches"
- Below heading: filter/sort controls using existing `FilterModal` component pattern

**Deal card grid:**
- Two-column grid at standard viewport. Single column when chat panel is wide.
- `DealCard` with `mode="buy"`, `buyerCtaState` driven by buyer's funnel status for each deal.
- Cards sorted by match score descending by default.

**Empty states:**

| Condition | Variant | CTA |
|-----------|---------|-----|
| No strategy created | `no-strategy` | "Create Your First Strategy" → `/buy-strategy/create` |
| Strategy exists, no matches yet | `no-matches` | None — informational only |
| Filters active, no results | `no-results` | "Clear Filters" |

---

### 4.2 Discover Deals (`/discover-deals`)

**Purpose:** Browse all active deals (Stage 7) regardless of strategy match. Buyer can filter and find deals outside their broadcast strategy.

**Layout:** Identical to Your Deals. Page heading "Discover Deals". No match score shown on cards in this view — match score is strategy-relative and this view is strategy-agnostic.

**Deal card behavior in Discover:**
- `mode="buy"` — buyer CTA states still apply
- `matchScore` not passed — `MatchScoreRing` not rendered
- Price still blurred until seated

**Filter controls:** Asset type, geography, deal stage. Reuse `FilterModal` pattern from seller build.

**Empty state:** `no-results` variant when filters return nothing. No `no-strategy` state here — Discover is accessible regardless of strategy.

---

### 4.3 Access Requested (`/access-requested`)

**Purpose:** Deals where the buyer has an open access request (Pending, Wait Queue, Invited). Gives buyer visibility into where they stand.

**Layout:** Single-column list. Page heading "Access Requested". Each row shows deal name, asset type, request date, and current status badge.

**Status badge values for this view:**

| Buyer funnel state | Badge label | Badge style |
|-------------------|------------|------------|
| Access Pending | "Under Review" | `bg-amber-500/20 text-amber-400` |
| Wait Queue | "Wait Queue" | `bg-gray-500/20 text-gray-400` |
| DS Invited | "Invited" | `bg-mode-buy/20 text-mode-buy` |

**Row layout:** Use `item` component from `components/ui/item.tsx` as the base pattern. Deal name bold left, status badge right, request date below name in `text-xs text-muted-foreground`.

**Empty state:** `no-access-requests` variant — "No access requests yet. Browse deals and request access from any active listing."

---

### 4.4 Buyer Deal Room View (`/deal-room/:dealId`)

**Purpose:** The buyer's workspace for an active deal. Accessible immediately upon navigation from the buyer deal feed.

**Layout:** Full-width content area. Three stacked sections: Deal Room Header → Document Section → Offer Section.

**Deal Room Header:**
- Reuse `DealRoomHeader.tsx` — confirm it accepts a `mode` prop or is mode-agnostic. If seller-specific elements are present, add `viewer="buyer"` prop to suppress them.
- Show deal name, asset type, geography, current stage badge.
- Stage progress bar showing Stages 6–9 only (`viewer="buyer"` on `StageProgressBar`).

**Document Section:**
- Reuse `DocumentListItem` and `DocumentListGroup` from `components/ui/document-list-item.tsx`.
- Documents are viewable — no upload controls. Buyer is read-only on documents.

**Buyer Pool Panel:**
- Shows **seated buyers only** — pending, passed, and recent activity sections are not rendered in buyer view (seller-only, per Business Rule E.12).
- Other seated buyers shown as anonymized credentials: "Investor #1042", "Investor #2087".
- Buyer's own entry labeled "You — Investor #XXXX" with highlighted border.
- Each buyer row uses `SeatedBuyerItem` with rank badge, qualification badge, match score ring (buy-colored), and equity range.
- Never shows names, companies, or offer details. Per Guardrail G-1, G-3 in `AGENT_BUYER_DEAL_ROOM_v1_0.md`.
- Design: flat section heading (icon + title), no card wrapper. Matches seller deal room tab content layout.

**"Get Deal Summary" Button:**
- Prominent `bg-mode-buy text-white` button placed above the Document Section, below the inactivity nudge.
- On click: sends `"Give me a summary of this deal"` to the AI chat panel via `onSendMessage`.

**Chat Panel (AI Q&A + Specialist Messaging):**

The deal room chat panel has three distinct elements stacked in order from top:

**1. Specialist Identity Card**
- Persistent card at the top of the chat panel — always visible regardless of active channel.
- Uses the platform list item component: platform identity name (label TBD — branding sprint; placeholder: "Your Specialist") + last active relative timestamp (e.g., "Last seen 2 hours ago") + status indicator dot (active / away).
- The "+" action opens a brief read-only identity card describing the role — it does not initiate a message. No email or direct contact info is shown.
- Identity card does not scroll away with the message thread — it is fixed above the channel toggle.

**2. Channel Toggle**
- Two-state toggle below the identity card, above the message thread:
  - **AI** — automated platform responses, deal Q&A, system messages
  - **Specialist** — direct messages from the DS; DS-authorized outreach appears here
- Each channel maintains an independent message thread.
- Unread badge on the toggle button for whichever channel has new unread messages — clears on view.
- Toggle labels are placeholders pending branding sprint. Do not use "Human" literally in shipped copy.
- Default active channel on deal room entry: AI.

**3. Message Thread + Compose**
- Wired through `AppShell` chat panel — same panel used by seller wizard.
- Thread renders the active channel's messages only — switching the toggle swaps the thread.
- `chatContext.contextLabel` = deal name.
- `chatContext.skills` = buyer-relevant quick actions on the AI channel only: `["Get deal summary", "Ask about the documents", "How does the offer process work?", "What is my competition?"]`. Skills chips are not shown on the Specialist channel.
- AI bubble color: `bg-mode-buy` (already configured in `AppShell` `MODE_CONFIG`).
- Specialist bubble color: neutral/slate — visually distinct from the AI channel bubbles.

**Offer Section (Offer Intent Gate):**
- Visible only at Stage 8 (Offer Negotiation).
- Entry point is the `OfferIntentGate` component — a decision gate that forces the buyer to declare intent before seeing the offer form.
- Two options: "I'm Interested in Offering" (reveals offer form, calls `recordOfferIntent` stub) and "Pass on This Deal" (opens `WatchPassModal`).
- After indicating interest: standard offer form entry (Submit Offer / Update Offer buttons).
- After passing: static text "You have passed on this deal. Your seat has been released."
- See Section 6.2 for Offer Submission Form spec. See Section 6.3 for WatchPassModal spec.

---

## 5. Screen Specs — Strategy Mode

### 5.1 Your Strategies (`/buy-strategy`)

**Purpose:** List of all buyer strategies with match counts and broadcasting status.

**Layout:** `px-6 py-5`. Page heading "Your Strategies" + "Create Strategy" CTA button (top right, `bg-mode-strategy`). Strategy cards in a two-column grid.

**Strategy Card — NEW component:** `StrategyCard.tsx`

```typescript
interface StrategyCardProps {
  strategy: BuyerStrategy
  onEdit?: () => void
  onPause?: () => void
  onResume?: () => void
}
```

Card structure (follow `DealCard` card shell pattern exactly — same border, radius, shadow, padding):
- Header: strategy name (bold) + status badge (Broadcasting / Paused / Draft)
- Body: asset type, geography, key Tier 1 fields as metadata row (same pattern as DealCard metadata row)
- Match count: prominent — `text-2xl font-bold text-mode-strategy` + "matches" label in `text-xs text-muted-foreground`
- Actions: Edit button (secondary), Pause/Resume toggle button (secondary)

**Status badge values:**

| Status | Label | Style |
|--------|-------|-------|
| `broadcasting` | Broadcasting | `bg-green-500/20 text-green-400` |
| `paused` | Paused | `bg-gray-500/20 text-gray-400` |
| `draft` | Draft | `bg-slate-500/20 text-slate-400` |

**Empty state:** `no-strategies` variant — "No strategies yet." CTA: "Create Your First Strategy".

---

### 5.2 Create Strategy (`/buy-strategy/create`)

**Purpose:** Wizard to build a buy strategy. Mirrors the seller listing wizard in interaction pattern.

**Layout:** Identical shell to `CreateListingWizard.tsx` — wizard form on the left, AI chat on the right (wired through AppShell chat panel).

**Wizard steps:**
1. Tier 1 fields — asset type, geography, deal size range (mandatory)
2. Tier 2 fields — asset sub-type specific criteria (mandatory)
3. Tier 3 fields — optional refinements (nudged, skippable)
4. Review and save

**Form components:** Use existing `field.tsx`, `input.tsx`, `select.tsx`, `nested-select.tsx`, `multi-select.tsx`, `slider.tsx` from `components/ui/`. Do not build new input primitives.

**AI chat context label:** "New Strategy". Skills: "What should I include?", "Explain Tier 2 fields".

**CTA color in wizard:** `bg-mode-strategy` for the primary advance button. This is the Strategy mode wizard — not buy mode.

**Save behavior:** On save, strategy status → `broadcasting`. Match count populates immediately. Redirect to `/buy-strategy` (Your Strategies).

**Draft behavior:** "Save as Draft" secondary button present on all steps. Follows same draft save pattern as `CreateListingWizard`.

---

### 5.3 Strategy Drafts (`/buy-strategy/drafts`)

**Purpose:** Saved strategy drafts not yet submitted.

**Layout and behavior:** Identical pattern to `SellerDraftsPage.tsx`. Draft cards show strategy name (or "Untitled Strategy"), saved date, and two actions: Continue, Delete. Use the same card pattern — do not rebuild.

**Empty state:** `no-drafts` variant — "No drafts. Any strategies you save as drafts will appear here." No CTA.

---

## 6. Modal and Overlay Specs

**6.1** *(Removed April 2026)* — Success fee modal removed. No buyer fee gate exists. Buyers enter deal rooms directly.

---

### 6.2 Offer Submission Form — NEW

**Trigger:** Buyer clicks "Submit Offer" in the deal room at Stage 8.

**Component:** `OfferSubmissionForm.tsx`. Use shadcn `Sheet` from `components/ui/sheet.tsx` as the container (slide-in from right — consistent with complex form patterns).

```typescript
interface OfferSubmissionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  dealRoomId: string
  round: 1 | 2 | 3
  existingOffer?: Offer   // pre-fills form if buyer is updating
  onSubmit: (offer: Partial<Offer>) => void
}
```

**Form fields:**
- Offer amount — `input` with currency formatting
- Offer terms — `textarea` (use shadcn `Textarea` if available, else `input` multiline)
- Round indicator — read-only display: "Round X of 3" in `text-xs text-muted-foreground`

**Submit behavior:** On submit → offer logged with `status: 'submitted'`. DS receives hard trigger notification (per Business Rules 12.4). Buyer sees their offer in the deal room with gold border: `border-yellow-400 border-2`.

**No cancel after submit.** Per Business Rules 9.7, an existing offer stands automatically. If buyer does not update, prior offer carries forward.

---

### 6.3 Watch/Pass Modal — NEW *(Added April 2026)*

**Trigger:** Buyer clicks "Pass on This Deal" in the `OfferIntentGate`.

**Component:** `WatchPassModal.tsx`. Uses shadcn `Dialog` with `disablePointerDismissal` — buyer cannot dismiss by clicking outside. No close button (`showCloseButton={false}`).

**Content:**
- Title: "Passing on this deal?"
- Body: "Once you pass, your seat is released and cannot be reclaimed. Let us know why — your feedback helps us improve future matches."
- Reason select (required): Options — Pricing, Timing, Asset Type, Market, Other
- Notes textarea (optional): placeholder "Any other context for your decision…", `h-20 resize-none`

**Footer:**
- "Confirm Pass" — `bg-destructive text-destructive-foreground hover:bg-destructive/90`, disabled until reason is selected. Calls `recordPassFeedback` stub, sets `offerIntent` to `'passed'`.
- "Go Back" — `variant="outline"`. Closes modal, returns to intent gate.

**Per Business Rule E.1:** Pass is terminal. Once confirmed, the buyer cannot re-enter the deal room.

---

## 7. Buyer Onboarding Screens

### 7.1 Activation Conversation (`/onboarding`)

**Layout:** Uses the onboarding simplified shell — no full sidebar, no mode switcher. Same simplified shell used by seller onboarding.

**Content area:** Centered, max-width container. AI chat panel occupies the right half. Left half shows context or progress indicators.

**AI chat panel style:** `mode-buy` accent. Chat bubble `bg-mode-buy text-white`. Send button `bg-mode-buy`.

**Progress indicator:** Simple step dots or a minimal progress bar above the chat. Not a numbered stepper — buyer should feel this is a conversation, not a form.

---

### 7.2 Qualification Form (`/onboarding/qualification`)

**Layout:** Same simplified onboarding shell. Form on the left, AI chat on the right.

**Form fields** (Fields of Truth):
1. Capital source — `select` (Equity / Debt / Both)
2. Equity check size — `select` with dollar ranges
3. Approval process — `select` (Discretionary / Committee / Other)
4. Experience — `input` or `select` (years / deal count)
5. Firm type — `select` (Solo Investor / Builder / Land Developer / Operator / Sponsor / Capital Allocator / Other)

Use `field.tsx` wrapper for every input (label + input + optional helper text). Same pattern as seller wizard fields.

**CTA:** "Complete Profile" — `bg-mode-buy`. "Skip for Now" — text link below, `text-sm text-muted-foreground hover:text-foreground`.

---

## 8. Empty States — Complete Reference

All buyer empty states use `BuyerEmptyState.tsx` (Section 3.4). CTA buttons use `bg-mode-buy`.

| Screen | Condition | Heading | Subtext | CTA |
|--------|-----------|---------|---------|-----|
| Your Deals | No strategy | "No strategy yet" | "Create a strategy to start receiving matched deals." | Create Your First Strategy |
| Your Deals | Strategy exists, no matches | "No matches yet" | "Your strategy is live. Deals matching your criteria will appear here." | None |
| Your Deals | Filters active, no results | "No results" | "Try adjusting your search or clearing your filters." | Clear Filters |
| Discover Deals | Filters active, no results | "No results" | "Try adjusting your filters to see more deals." | Clear Filters |
| Access Requested | No requests | "No access requests" | "Browse deals and request access from any active listing." | None |
| Your Strategies | No strategies | "No strategies yet" | "Create a strategy to start receiving matched deals." | Create Your First Strategy |
| Strategy Drafts | No drafts | "No drafts" | "Any strategies you save as drafts will appear here." | None |

---

## 9. Interaction Patterns

### 9.1 State Transitions on DealCard

When a buyer clicks "Indicate Interest" or "Request Access" — the button label and state should update **immediately** (optimistic UI) without a page reload. State updates in local component state until backend confirms.

"Indicate Interest" → button label changes to "Interested ✓" and becomes disabled. Color stays `bg-mode-buy` with reduced opacity.

"Request Access" → button label changes to "Request Sent" and `buyerCtaState` transitions to `access_pending`. Disabled.

### 9.2 Offer Gold Border

Buyer's own offer card in the deal room uses: `border-2 border-yellow-400 rounded-lg`. This is the only use of `yellow-400` in the platform. Do not apply it to anything else.

### 9.3 Price Blur

Blurred price uses: `blur-sm select-none pointer-events-none`. The blur is on the price text span only — not the entire metadata row. When buyer reaches `enter_deal_room` state, blur is removed.

### 9.4 Chat Panel — Buyer vs Seller

The AppShell chat panel is the same component across all modes. The mode accent controls the visual treatment automatically via `MODE_CONFIG`. No changes needed to the chat panel itself — wire buyer pages the same way seller pages wire it, passing `chatContext` as the prop.

---

## 10. Project Structure Rules — LOCKED

These apply to every file created in the buyer build. Cursor agents: enforce without exception.

```
frontend/src/pages/          — One file per page. Buyer pages go here.
frontend/src/components/     — Shared components. Buyer-specific components go here.
frontend/src/components/ui/  — Primitive UI components. shadcn-based only.
frontend/src/data/mock/      — Mock data files. One file per entity type.
shared/types/                — All TypeScript interfaces and types. Define here first.
backend/agents/              — Agent stubs only. No agent logic in frontend.
```

**Rule: shared types first.** Before writing any buyer page or component, confirm the required types exist in `shared/types/`. If a type is missing, add it there before touching a page file.

**Rule: no backend logic in frontend.** All agent invocations, escalation triggers, and DS queue interactions go through `backend/agents/` stubs. Mock returns live in `frontend/src/data/mock/agents/`.

**Rule: check before creating.** Before creating any new component, search `frontend/src/components/` for an existing component that can be extended with props. Creating a parallel component when an extendable one exists is a violation of this spec.

---

*Last updated: April 2026*
