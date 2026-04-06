# Strata NextLevel — Product Requirements Document

> **Version:** 2.0
> **Last Updated:** April 2026
> **Stack:** React 18 · Vite · TypeScript · Tailwind CSS · shadcn/ui · Supabase
> **Demo Target:** May 18, 2026
>
> **Changes from v1.9:**
> - Section 1.5 — Platform Terminology added. Locked terminology for Listing (seller-facing), Deal (buyer-facing), and Deal Room (shared). Rules for UI copy, code objects, and stats labels defined.
>
> **Changes from v1.8:**
> - Section 1 — Product Overview updated. Mission, positioning, and go-to-market phasing added from Strata NextLevel 3.2 Business Plan Narrative. Strategic context and monetization streams added as Sections 1.3 and 1.4.
> - Section 1.2 — User Model updated to reflect separate internal login and pointer to INTERNAL_INTERFACE_v1_0.md.
> - Section 3 — User Roles & Permissions updated to reflect three-mode external shell and new internal portal structures.
> - Section 4 — Feature Specifications replaced with accurate summaries and pointers to canonical build docs.
> - Section 5.3 — DealRoomStatus enum corrected — accepted_offer added.
> - Section 6 — Design System updated — brand colors marked as deferred, status badges updated to include Accepted Offer.
> - Section 7.2 — Mobile explicitly removed from scope, added to Post-MVP Backlog.
>
> **Taxonomy extraction (April 2026):**
> - Section 1.5 — Platform Terminology replaced with pointer to TAXONOMY_v1_0.md Section 1
> - Section 2.3 — Buyer Intent Ranking values replaced with pointer to TAXONOMY_v1_0.md Section 5
> - Section 2.3 — Firm Type values replaced with pointer to TAXONOMY_v1_0.md Section 4
> - Section 5.3 — DealRoomStatus enum replaced with pointer to TAXONOMY_v1_0.md Section 9
> - Section 6.2 — Status Badge Colors replaced with pointer to TAXONOMY_v1_0.md Section 9
> - Section 10 — Glossary replaced with pointer to TAXONOMY_v1_0.md
>
> **Business rules extraction (April 2026):**
> - Section 2 — Core Business Logic (2.1 through 2.12) replaced with pointer to BUSINESS_RULES_v1_0.md. All if/then logic, role responsibilities, seat rules, offer rules, matching rules, AI authorization boundaries, and lifecycle rules now live in that document.

---

## 1. Product Overview

NextLevel is Strata's internal demand-first operating system. The platform's immediate job is to enable Strata to match buyers and sellers efficiently, control transaction execution, capture real-time market intelligence, and prove that the demand-first, match-first model can generate scalable brokerage revenue. Once that proof is established, the platform expands outward to support external brokers and ancillary revenue streams.

In this phase, NextLevel is not positioned as a broad broker marketplace. It is Strata's controlled execution environment — deployed first inside Strata's own ecosystem before opening to third parties.

### 1.1 Mission

Prove that a demand-first, match-first model can generate scalable brokerage revenue by matching buyers and sellers on alignment — not discovery — and controlling all deal execution through Strata's internal team.

### 1.2 User Model

Two user categories in NextLevel: external and internal. They do not share a surface or a login.

| User Category | Type | Description |
|---------------|------|-------------|
| **External** | Buyer-Seller | All external users — investors, builders, developers, operators, brokers. One account. Can act as buyer, seller, or both. Accesses platform via standard login. |
| **Internal** | Admin | Owns document QA and completeness checks (Stage 3). Non-analyst. Accesses platform via separate internal login. |
| **Internal** | Analyst | Owns financial analysis and viability (Stage 4). Economic gate. Accesses platform via separate internal login. |
| **Internal** | Disposition Specialist (DS) | Owns deal execution from Stage 6 through close and post-disposition outcomes. In MVP: AI Disposition Engine runs buyer distribution and deal room Q&A autonomously. DS owns seller relationship, negotiation, and offer management. Accesses platform via separate internal login. |

> **Note on Brokers:** Users who identify as brokers during onboarding follow the standard Buyer-Seller path. Broker flag captured silently for future scalability — no effect on V1 experience.
>
> **Note on Acquisition Expert:** This role is eliminated. Functions absorbed into Admin (document tracking), Analyst (strategy refinement and market intelligence), and DS (buyer relationship management).
>
> **Note on Internal Portals:** Full internal interface spec — nav structure, portal layouts, route maps, and locked decisions — lives in **INTERNAL_INTERFACE_v1_0.md**.

### 1.3 Go-To-Market Phasing

The platform rollout occurs in four structured phases.

**Phase 1 — Prototype Validation (current)**
Fully clickable prototype introduced to targeted Buyer-Sellers to test market fit, gather feedback, and confirm the monetization strategy. Led by Next Sketch. Focus is validation and refinement, not live transactions.

**Phase 2 — Early Investment and Network Seeding**
Positive engagement signals from prototype testing used to engage long-time clients, colleagues, and trusted relationships in early equity investment conversations. These same signals used to begin seeding the buyer network — building demand first, absent inventory.

**Phase 3 — Buyer-First MVP Launch**
MVP delivered to engaged users. Demand side built first. Strata deploys personnel — including business development staff — to drive seller sign-ups using demonstrated buyer demand as proof. Strata simultaneously drives real transactions through its internal team. Revenue generation begins immediately post-launch.

**Phase 4 — Ancillary Revenue Layers**
After sufficient deal velocity is achieved, ancillary offerings layered in — beginning with lender participation and financing transaction fees.

### 1.4 Monetization

| Stream | Model | Timeline |
|--------|-------|----------|
| **Seller Credits** | Sellers pay for access to matched buyers — charged at deal room activation. 400 free credits on first deal room. $100 per credit thereafter. | Immediate at MVP launch |
| **Buyer Success Fee** | Buyers use platform free. 3% of gross purchase price due at closing. No fee if deal does not close. Acknowledged before entering active deal room. | Immediate at MVP launch |
| **Lender Participation** | Lenders pay per lead and per closed financing transaction. | Phase 4 — post deal velocity |

Both seller credits and buyer success fees are expected to generate revenue within the first three months of MVP launch.

### 1.5 Platform Terminology

> Platform terminology is defined and maintained in **TAXONOMY_v1_0.md — Section 1**. All UI copy, documentation, and code comments must follow that definition. Do not redefine terms here.

---

## 2. Core Business Logic

> All platform business rules — onboarding logic, buyer access rules, qualification rules, matching rules, seat assignment, offer rules, deal lifecycle rules, Market Tested and Dormant rules, AI agent authorization boundaries, credits and monetization rules, notification rules, and internal role responsibilities — are defined and maintained in **BUSINESS_RULES_v1_0.md**.
>
> Do not redefine rules here. Reference BUSINESS_RULES_v1_0.md by rule number when directing agents (e.g., "implement per Rule 8.5").
---

## 4. UI Shell & Navigation

> This section is the canonical visual and structural specification for the external user interface. Internal portals (Admin, Analyst, DS) share the same visual foundation with role-specific nav structures — fully defined in **INTERNAL_INTERFACE_v1_0.md**.

---

### 4.1 Design Foundation

The NextLevel external interface is modeled on a familiar AI-first shell — a persistent sidebar, a content area, and a persistent AI chat panel — adapted for a three-mode real estate platform. The reference model is Claude.ai's layout (sidebar + main content + right panel), augmented with a top-center mode switcher that changes the entire platform context.

**Stack:** React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui. All components built to shadcn/ui primitives. No custom component library.

**Color:** Brand colors are not yet applied. All mockups are structural only — neutral grayscale. Color application (including mode-specific sidebar accents) is a separate pass once branding is finalized.

---

### 4.2 App Shell — Layout Zones

The shell has five fixed layout zones. All zones are always present regardless of which mode or page is active.

| Zone | Position | Behavior |
|------|----------|----------|
| **Top bar** | Full width, top | Fixed. Contains mode switcher (center), global controls (right), nav controls (left). |
| **Left sidebar** | Left edge, full height | Collapsible. Icon-only by default (collapsed). Expands to labeled nav on toggle. Nav items change per mode. |
| **Content area** | Center, fills remaining width | Scrollable. Renders the active page for the current mode. |
| **AI chat panel** | Right side | Resizable and collapsible. Persistent on all screens. Contextually aware of current mode. |
| **Resize handle** | Between content and chat panel | Draggable divider. Allows user to adjust the content/chat split. |

---

### 4.3 Top Bar

Fixed across all modes. Never scrolls.

**Left side:**
- Settings gear icon — opens platform settings
- Back arrow — browser history back
- Forward arrow — browser history forward

**Center:**
- Mode switcher — three pill tabs: **Sell · Buy · Strategy**
- Active mode tab is visually selected (filled pill, higher contrast)
- Buy tab displays a numeric badge when there are active deal notifications (e.g. "Buy 1")
- Switching modes changes the left sidebar nav items and the AI chat panel context chip

**Right side:**
- Dark mode toggle icon
- Credits display — "□ 400 Credits" — icon + count. Tappable. Opens Credits modal.
- Avatar — user profile photo or initials fallback. Tappable. Opens profile/account dropdown.

---

### 4.4 Left Sidebar

**Default state:** Collapsed to icon-only. Width approximately 48px. Icons only — no labels visible.

**Expanded state:** Slides open to approximately 200px wide. Icons + text labels visible. Triggered by toggle button at top of sidebar (chevron/arrow icon).

**Structure:**

```
[Top]
  Icon row — nav items for current mode (3 items per mode)

[Bottom — persistent across all modes]
  Notifications icon
  Settings icon
```

**Nav items change per mode.** When the user switches the top-bar mode, the sidebar nav items update immediately without page reload.

#### Sell mode sidebar
| Icon | Label | Route |
|------|-------|-------|
| Grid/dashboard | Your Listings | `/selling` |
| Plus circle | Create Listing | `/selling/create` |
| Draft/pencil | Drafts | `/selling/drafts` |

#### Buy mode sidebar
| Icon | Label | Route |
|------|-------|-------|
| Grid/dashboard | Your Deals | `/buying` |
| Compass/discover | Discover Deals | `/buyer-matches` |
| Clock | Access Requested | `/buying/access-requested` |

#### Strategy mode sidebar
| Icon | Label | Route |
|------|-------|-------|
| Grid/dashboard | Your Strategies | `/strategies` |
| Plus circle | Create Strategy | `/buy-strategy/create` |
| Draft/pencil | Drafts | `/strategies/drafts` |

**Mode-specific sidebar color accent (to be applied during branding pass):**
Each mode applies a subtle color treatment to the sidebar when active — background tint or left-border accent — so that switching modes produces a clear visual signal even when the sidebar is collapsed. Color values TBD at branding. Structural behavior is locked.

| Mode | Accent color intent |
|------|-------------------|
| Sell | Teal family |
| Buy | Purple family |
| Strategy | Amber family |

---

### 4.5 AI Chat Panel

The AI chat panel is the primary surface for the AI Disposition Engine. It is always accessible regardless of which mode or page is active.

**Default state:** Visible on the right side of the screen, occupying approximately 30–35% of the horizontal space.

**Collapsed state:** Panel collapses to a thin edge with a toggle arrow. Content area expands to fill the full width.

**Resize behavior:** A draggable handle sits between the content area and the chat panel. The user can drag left or right to adjust the split. Minimum panel width is approximately 280px. Maximum is approximately 50% of the viewport.

**Context chip:** The bottom of the chat input shows a context chip indicating the current platform context — "Deals", "Listings", or "Strategies". This chip changes when the mode changes and informs the AI what context it is operating in.

**Skills bar:** Above the chat input, a horizontal row of skill chips surfaces available AI capabilities for the current context (e.g., "Analyze deal", "Compare strategies", "Summarize activity"). These are context-aware suggestions — not static.

**Empty / first-load state:**
When a user has no active content in the current mode and has not yet started a chat, the panel expands to fill the content area and the full-screen welcome state is displayed:

```
Good [Morning/Afternoon/Evening], [First Name]
Ask me anything to get started.
[Skills bar]
[Chat input]
```

The greeting is time-of-day aware. The user's first name is used, not full name.

**Chat message behavior:**
- User messages appear as right-aligned dark bubbles
- AI responses appear as left-aligned plain text
- Each AI message has copy and regenerate icons beneath it
- Timestamps shown below each message pair

---

### 4.6 Mode-Specific Empty States

Every mode has a defined empty state — shown when the user has no content yet (no listings, no deals, no strategies). Empty states are not error states. They are onboarding moments.

#### Sell mode — no listings yet
- Headline: "You don't have any listings yet."
- Body: One sentence describing what a listing is and what happens when you create one.
- CTA: "Create Your First Listing" — primary button — routes to `/selling/create`
- AI chat panel: active, with a prompt suggestion like "Help me get my first listing ready."

#### Buy mode — no deals yet
- Headline: "No deals to show yet."
- Body: One sentence explaining that deals populate once a strategy is created and matches are found.
- CTA: "Go to Strategy" — routes to Strategy mode
- AI chat panel: active, with a prompt suggestion like "Help me understand how deal matching works."

#### Strategy mode — no strategies yet
- Headline: "You haven't created a strategy yet."
- Body: One sentence explaining that a strategy defines what you're looking to buy and activates deal matching.
- CTA: "Create Your First Strategy" — primary button — routes to `/buy-strategy/create`
- AI chat panel: active and expanded, showing the full welcome state (see Section 4.5)

---

### 4.7 Credits System

Credits are the platform currency for seller deal room activation.

| Credit Event | Amount |
|-------------|--------|
| First deal room | 400 free credits included |
| Additional deal rooms | $100 per credit, purchased in-platform |

**Credits display:** Top bar right side. Always visible to logged-in users. Shows current balance as "□ [N] Credits".

**Credits modal:** Triggered by tapping the credits display in the top bar. Shows:
- Current balance
- What credits are used for
- Purchase option (credit card flow — user enters card details themselves; platform does not store or enter card details)
- Transaction history (post-MVP — placeholder in prototype)

**Credit gate trigger:** When a seller attempts to activate a deal room and has insufficient credits, the credits modal surfaces automatically with a "You need credits to activate this listing" message and the purchase flow inline.

**When the nudge surfaces:** Credits top-up prompts surface at Stage 5 only when the deal has reached a Green (viable) Analyst outcome. Monetization nudges do not surface before viability is confirmed.

**Prototype behavior:** Credits display is visual only. The modal shell is built but payment processing is mocked. The credit gate trigger is wired so the flow is demonstrable.

---

### 4.8 Breadcrumb & Page Headers

All interior pages (non-empty-state) show a consistent breadcrumb + page header treatment at the top of the content area.

**Breadcrumb:** Home icon → Section → Page name. Example: `🏠 > Strategy Home > Your Buy Strategies`

**Page header:** Large, left-aligned page title immediately below the breadcrumb. Example: `Your Buy Strategies`

**Stats row:** Immediately below the page header on list pages — a row of large-number stat tiles showing key metrics for the current section. No action elements in the stats row — display only.

Examples:
- Buy mode / Your Deals: Deal Rooms Accessed · Offers Made · Deals Won
- Sell mode / Your Listings: Deal Rooms Open · Deals Started · Deals Cancelled · Deals Closed
- Strategy mode / Your Strategies: Total Matches · Markets Covered

---

### 4.9 List Page Layout (Shared Pattern)

All list pages (Your Deals, Your Listings, Your Strategies) follow a consistent layout pattern.

**Structure:**
1. Breadcrumb + Page header
2. Stats row
3. Search bar + Filter button (left-aligned) + View toggle — list/grid (right-aligned)
4. Card grid — 2 columns, paginated
5. Pagination bar — "Showing X–Y of Z" left, page numbers center/right

**Card structure varies per mode** but all cards share:
- Property/deal icon (top left)
- Deal/listing/strategy name (bold, top)
- Property type or sub-type (below name)
- Status badge or match score badge (top right)
- Key metadata row: location · price · cap rate (or equivalent per context)
- Action buttons (bottom of card) — one secondary outline CTA, one primary filled CTA

**Strategy cards additionally show:**
- Active/Paused toggle inline
- Delete action inline
- Match count + last updated timestamp at card footer

---

### 4.10 Notifications

Notifications are accessed via the bell icon in the sidebar footer. Present in all modes.

**Notification panel:** Slides in from the left or opens as a dropdown — TBD at component build. Lists unread notifications with timestamp, type icon, and short description.

**Notification types:**
- Deal match found
- Access request status update (approved / denied / pending)
- Offer round opened or closed
- Deal status change (Dormant, Market Tested, Accepted Offer, Closed)
- Qualification nudge (Day 3 / Day 7 / Day 14)
- System messages

**Notification preferences:** Configurable independently for buyer and seller activity in Settings. See Section 2.10.

---

### 4.11 Settings

Settings are accessed via the gear icon in the sidebar footer. Present in all modes. Opens as a dedicated settings page (not a modal).

**Settings sections:**
- Profile — name, email, company, avatar
- Buyer notifications — frequency preferences
- Seller notifications — frequency preferences
- Qualification — view and edit buyer qualification fields (same Fields of Truth as the AI-guided qualification flow)
- Account — password, security

---

### 4.12 Onboarding Flow — Shell Behavior

During onboarding (Bucket 1 and Bucket 2 — pre-active platform state), the shell is simplified:

- Top bar: logo only — no mode switcher, no credits display, no nav arrows
- Left sidebar: hidden
- AI chat panel: full width — onboarding is a conversation-first experience
- Progress indicator: step dots or a minimal progress bar at the top of the content area

Onboarding routes (`/onboarding`, `/onboarding/create-strategy`, `/onboarding/create-deal-room`, `/onboarding/qualification`) all use this simplified shell. Once Bucket 2 is complete, the full shell activates.

---

### 4.13 Locked UI Decisions

| # | Decision |
|---|----------|
| 1 | **Three-mode switcher is top-center** — Sell / Buy / Strategy. Mirrors Claude.ai tab pattern. Not collapsible or movable. |
| 2 | **Left sidebar collapsed by default** — icon-only on first load. User expands manually. State persists per session. |
| 3 | **Strategy is a top-level mode** — not nested under Buy. Equal navigational weight to Sell and Buy. Earns top-level status through workflow depth and future expansion room. |
| 4 | **AI chat panel is persistent on every screen** — always accessible, never removed by page navigation. Collapsible by user. |
| 5 | **Mode-specific sidebar color accent** — each mode applies a distinct color treatment to the sidebar. Differentiates modes when sidebar is collapsed. Applied during branding pass. |
| 6 | **Credits display is always visible** — top bar, right side. Not hidden behind a menu. |
| 7 | **Empty states are onboarding moments** — not error states. Each mode has a defined empty state with a single primary CTA. |
| 8 | **Onboarding uses a simplified shell** — no sidebar, no mode switcher, no credits. Full shell activates on Bucket 2 completion. |
| 9 | **Internal portals share the visual foundation** — Admin, Analyst, DS interfaces use the same shell and component language. Separate nav structure. Designed separately. |

---

## 3. User Roles & Permissions

### 3.1 Buyer-Seller Mode

| Section | Access |
|---------|--------|
| Buy mode | Your Deals list, Discover Deals (browse matches), Access Requested — submit offers, chat with NextLevel AI agent |
| Sell mode | Your Listings — all deal rooms including Market Tested and Dormant, Create Listing, Drafts — upload docs, chat with NextLevel AI agent |
| Strategy mode | Your Strategies list, Create Strategy, Drafts — manage buy strategies and match broadcasting |
| Settings | Configure buyer and seller notification preferences independently |
| Profile | View personal info, buyer performance stats, seller performance stats, qualification status and edit |

**Post-Onboarding Gates:**
- Buyer must have an active strategy before receiving matches
- Unqualified buyers can receive matches and request deal room access — ranked lower by DS, soft gate only (see Section 2.2)
- Seller must acknowledge ownership before deal room goes live

### 3.2 Admin Portal

Accessed via `/internal/login`. Separate from external login. Accounts provisioned by Admin only.

| Section | Access |
|---------|--------|
| Overview | Exception queue (AI-flagged Stage 3 deals) + pipeline summary |
| Exception Queue | All AI-flagged Stage 3 deals — document review, advance to Analyst or return to seller |
| All Deals | Full pipeline across all stages and statuses — Active / Market Tested / Dormant / Closed / Withdrawn |
| Clients | All buyer and seller accounts — view profile, deal history, account management |
| Staff | Internal team management — provision DS / Analyst / Admin accounts, view assignments |

> Full Admin portal spec in **INTERNAL_INTERFACE_v1_0.md** Section 4.

### 3.3 Analyst Portal

Accessed via `/internal/login`. Separate from external login.

| Section | Access |
|---------|--------|
| Review Queue | Pending Stage 4 deals — AI-generated financial memos awaiting Analyst authorization |
| Completed | Previously reviewed deals with logged outcomes |
| All Deals | Read-only pipeline visibility across all stages — no actions outside Stage 4 |

> Full Analyst portal spec in **INTERNAL_INTERFACE_v1_0.md** Section 3.

### 3.4 DS Portal

Accessed via `/internal/login`. Separate from external login. Top-bar tab switcher: **Tasks · Pipeline · Clients**.

| Section | Access |
|---------|--------|
| Tasks (default landing) | Action Queue — seats to approve, offers to review, milestones to log, AI feedback to authorize. Notifications. |
| Pipeline | Active Deals (Stages 6–9), Market Tested queue, Dormant deals, All Deals full view |
| Clients | Seller relationships, Buyer Queue across all deals |
| Deal View | Per-deal: Overview, Seat Allocation, Offer Rounds, Documents, Market Intelligence, Milestones |

> Full DS portal spec in **INTERNAL_INTERFACE_v1_0.md** Section 2.

---

## 4. Feature Specifications

> This section previously contained per-screen feature specs. Those specs are now maintained in canonical build documents. This section has been updated to reference those documents as the authoritative sources.
>
> - **External UI shell, navigation, empty states, credits, onboarding shell behavior** → PRD Section 4 (UI Shell & Navigation)
> - **Landing page, sign-up, onboarding flow, PostLoginRouter logic** → **ONBOARDING_FLOW_v1_0.md**
> - **All authenticated buyer-seller routes and page-level behavior** → **SITE_ARCHITECTURE_v1_6.md** Section 3 and 4
> - **DS, Analyst, and Admin portal specs — nav, routes, page layouts** → **INTERNAL_INTERFACE_v1_0.md**
> - **Shared components and component-level specs** → **SITE_ARCHITECTURE_v1_6.md** Section 7

### 4.1 External Interface Summary

The external Buyer-Seller interface uses a three-mode shell — **Sell · Buy · Strategy** — with a persistent left sidebar, content area, and AI chat panel. Full spec in PRD Section 4 (UI Shell & Navigation).

**Sell mode** — Your Listings, Create Listing, Drafts. Seller deal room creation and management. Deal rooms progress through the 9-stage lifecycle. Market Tested and Dormant deals remain visible with status badges.

**Buy mode** — Your Deals, Discover Deals, Access Requested. Buyers browse matched deal cards, request deal room access, and manage active deal rooms. Deal cards show state-dependent CTAs (Coming Soon / Active Disposition / Access Pending / Wait Queue / Enter Deal Room).

**Strategy mode** — Your Strategies, Create Strategy, Drafts. Buyers create and manage buy strategies that broadcast against active deal rooms. Match counts populate immediately on strategy save.

**AI chat panel** — persistent on all screens, resizable and collapsible. Context chip reflects current mode and active deal. Contextually aware of platform state.

### 4.2 Onboarding Summary

Full onboarding flow spec in **ONBOARDING_FLOW_v1_0.md**. Summary:

- Landing page (`/`) — self-selection surface. Buyer / Seller CTAs. No pre-signup AI.
- Sign-up (`/signup`) — name, email, password, company, role selection.
- Bucket 1 (`/onboarding`) — profile confirmation, lightweight.
- Buyer Bucket 2 — strategy creation first (`/onboarding/create-strategy`), qualification second (`/onboarding/qualification` — optional, nudged).
- Seller Bucket 2 — deal room creation (`/onboarding/create-deal-room`) — AI-guided, Tier 1 + Tier 2 required, ownership acknowledgment hard gate.
- `PostLoginRouter` handles all post-Bucket 2 redirects — role and state aware.

### 4.3 Internal Portals Summary

Full internal portal spec in **INTERNAL_INTERFACE_v1_0.md**. Summary:

**DS portal** (`/ds`) — Tasks (default) · Pipeline · Clients tab switcher. Task Queue shows action items grouped by urgency. Deal View has six tabs: Overview, Seat Allocation, Offer Rounds, Documents, Market Intelligence, Milestones.

**Analyst portal** (`/analyst`) — Review Queue (default). AI-generated financial memo per Stage 4 deal. Analyst authorizes Approve / Return to Admin / Reject. Confirmation modal required. All decisions irreversible.

**Admin portal** (`/admin`) — Overview with exception queue (default). Exception Queue for AI-flagged Stage 3 deals. Full pipeline visibility. Client management. Staff provisioning — Admin is the only role that can create internal accounts.

### 4.4 Profile (`/profile`)

- Basic Information: avatar, name, role, email, phone, location, company
- Buyer Performance: Deal Rooms Accessed, Offers Made, Deals Won
- Seller Performance: Deal Rooms Open, Dispos Started, Deals Canceled, Deals Closed
- Qualification: completion status, last updated, link to edit (writes to same Fields of Truth as onboarding qualification flow)

### 4.5 Settings (`/settings`)

- Buyer Notifications: On/Off toggle + cadence selector (Real Time / Every X Hours / Every X Days / Weekly)
- Seller Notifications: Independent On/Off toggle + cadence selector (same options)
- Account: password, security

---

## 5. Data Layer

### 5.1 Current Database Schema (Prototype)

| Table | Columns | Purpose |
|-------|---------|---------|
| `signups` | id, name, email, user_type, terms_accepted, created_at | Landing page sign-up capture |

### 5.2 Planned Schema (Post-MVP)

| Table | Key Fields | Purpose |
|-------|-----------|---------|
| `users` | id, name, email, company, role, broker_flag, qualification_complete, created_at | User accounts |
| `buyer_qualifications` | user_id, capital_source, equity_check_size, approval_process, experience | Buyer Fields of Truth |
| `buy_strategies` | id, user_id, asset_type, shared_criteria, unique_criteria, status | Buyer acquisition profiles |
| `deal_rooms` | id, seller_id, asset_type, stage, **status** (active\|market_tested\|dormant\|closed\|withdrawn), shared_criteria, unique_criteria, ownership_acknowledged | Single-asset deal containers |
| `deal_room_documents` | id, deal_room_id, type, upload_url, status | Per-deal document storage |
| `buyer_pool` | deal_room_id, buyer_id, seat_status, access_request_date, qualification_status | Deal room seat management — max 3 seated per deal room |
| `offers` | id, deal_room_id, buyer_id, amount, terms, submitted_at, rank | Structured offer records |
| `chat_messages` | id, deal_room_id, sender_id, sender_role, content, created_at | Deal room chat history |
| `stage_transitions` | id, deal_room_id, from_stage, to_stage, actor_id, notes, created_at | Bidirectional stage audit trail — notes required for returns |
| `status_transitions` | id, deal_room_id, from_status, to_status, actor_id, notes, created_at | **NEW** — Audit trail for Market Tested and Dormant status changes |

### 5.3 DealRoomStatus Type

> All `DealRoomStatus` values, definitions, transition rules, and badge color mappings are defined in **TAXONOMY_v1_0.md — Section 9**.

### 5.4 Authentication Status

- **Not yet implemented** — sign-up writes to `signups` table without auth
- **Planned:** Supabase Auth with email/password, protected routes, user-scoped data, role-based access for Admin / Analyst / DS portals

### 5.5 State Management

- React Query (`@tanstack/react-query`) for server state
- Local component state (`useState`) for UI state
- Mock flags for post-onboarding completion state in prototype (`qualification_complete`, `strategy_created`, `ownership_acknowledged`)

### 5.6 Mock Data (Prototype)

All deal rooms, buy strategies, offers, chat messages, buyer pools, staff assignments, qualification data, AI financial memos, and client lists are hardcoded mock data. No backend persistence beyond the `signups` table.

Mock data for deal rooms should include examples of all five `DealRoomStatus` values to allow the full pipeline to be demonstrated in the prototype.

---

## 6. Design System

### 6.1 Color Palette

> **Brand colors are not yet applied.** All current mockups are structural only — neutral grayscale. Color application is a separate pass once branding is finalized. The tokens below are placeholders and will be replaced during the branding pass.

| Token | Intended Usage |
|-------|---------------|
| `--primary` | Primary backgrounds, sidebar, buttons |
| `--accent` | CTAs, highlights, badges, active states |
| `--background` | Page background |
| `--foreground` | Primary text |
| `--muted` | Muted backgrounds |
| `--border` | Borders and dividers |

**Mode-specific sidebar accents** — Sell (teal family), Buy (purple family), Strategy (amber family). Values TBD at branding pass. Structural behavior locked — see PRD Section 4.13 and Site Architecture Locked Decision #24.

**Internal portal accent** — neutral/slate to visually distinguish from external interface. TBD at branding pass.

### 6.2 Status Badge Colors

> Status badge color mappings are defined in **TAXONOMY_v1_0.md — Section 9** (Deal Room Status label-to-database mapping table).

### 6.3 Typography

- Font: System font stack (sans-serif) — to be replaced with brand font during branding pass
- Component-level type specs deferred to branding pass

### 6.4 Component Patterns

All UI primitives built on shadcn/ui. No custom component library. Component-level visual specs (card styles, button treatments, badge patterns) are structural placeholders — final visual treatment applied during branding pass.

Structural patterns locked:
- Cards: rounded corners, border, hover state
- Buttons: primary filled, secondary outline
- Status badges: pill shape with color fill
- Match score ring: SVG ring visualization — `MatchScoreRing` component
- Chat panels: AI chat on right, message bubbles differentiated by sender
- Gate prompts: banner treatment for incomplete post-onboarding states

---

## 7. Non-Functional Requirements

### 7.1 Performance
- All pages render client-side (SPA)
- No external API calls beyond Supabase (signups table only) in prototype

### 7.2 Responsiveness
- Desktop-first design — minimum supported width 1280px
- Mobile is out of scope for MVP — see Post-MVP Backlog
- Grid layouts adapt within desktop viewport sizes only

### 7.3 Security
- RLS enabled on `signups` table
- No authentication system in prototype
- Credit card fields are UI-only (no payment processing integrated)

---

## 8. Future Roadmap

| Priority | Feature | Description |
|----------|---------|-------------|
| P0 | Authentication | Supabase Auth with email/password, protected routes, role-based access for all three internal portals |
| P0 | Database persistence | Persist deal rooms, strategies, offers, qualifications, chat, stage transitions, status transitions in Supabase |
| P1 | Real-time chat | Supabase Realtime for deal room messaging |
| P1 | Document storage | Supabase Storage for deal room document uploads |
| P1 | Payment integration | Stripe for credit purchases and success fee collection |
| P2 | Email notifications | Configurable delivery based on cadence settings |
| P2 | AI-powered matching | Replace scripted intake with live LLM-driven conversations |
| P2 | Analytics dashboard | Admin metrics — deal flow, conversion rates, time-to-close by stage |
| P3 | Admin AI agent | AI agent takes over Stage 3 completeness review with human exception handling |
| P3 | Analyst AI agent | AI agent performs Stage 4 financial analysis — Analyst reviews and authorizes |
| P3 | DS AI agent — Phase 2 | AI-assisted seat recommendation with DS override at every seat |
| P3 | DS AI agent — Phase 3 | AI handles offer round sequencing and buyer feedback; DS authorizes each round |
| P3 | DS AI agent — Phase 4 | Full AI disposition; DS as exception handler and relationship owner only |
| P3 | External broker expansion | Open platform to third-party brokers operating within structured environment |
| P3 | Lender participation | Lender lead and financing transaction fees |
| P3 | Mobile app | React Native or PWA |

---

## 9. Locked Decisions (Do Not Re-Litigate)

1. **Unified Buyer-Seller** — one external user type, all treated the same
2. **Broker = Buyer-Seller path** — no separate portal, broker flag stored silently
3. **Acquisition Expert eliminated** — absorbed into Admin, Analyst, DS
4. **DS as NextLevel AI in MVP** — client-facing chat is AI agent; DS escalates for market-impacting decisions
5. **Qualification does not feed matching** — matching is driven by Shared Deal Criteria + Unique Deal Criteria only
6. **Terminology locked** — "Shared Deal Criteria" not "Spine"; "Unique Deal Criteria" not "module fields"
7. **One asset per Deal Room** — MVP rule, locked
8. **Human-authorized system** — AI recommends at every layer, humans authorize at every structural, economic, and market gate
9. **9-stage lifecycle** — locked; bidirectional at Stages 2–4; every return requires documented notes
10. **Three internal roles** — Admin (QA gate, Stage 3), Analyst (economic gate, Stage 4), DS (execution, Stages 6–9)
11. **3 seats per Deal Room** — maximum 3 concurrent buyers; scarcity and controlled competition are intentional *(locked March 2026)*
12. **Market Tested status** — formal outcome when all 3 seats exhausted and full buyer pool passed with no offers; seller must choose a path before deal can reactivate *(locked March 2026)*
13. **Dormant status** — paused state for stalled or seller-elected holds; deals remain in system and reactivate via DS on seller request *(locked March 2026)*
14. **Tier A/B/C classification is internal SOP only** — not replicated in the platform; Analyst outcomes map to Approve / Return to Admin / Reject *(locked March 2026)*
15. **Three-tier data architecture locked** — Tier 1 (Universal/Shared Deal Criteria) and Tier 2 (Sub-Type Group Shared) are hard matching — no alignment means deal is invisible. Tier 3 (Unique/sub-type specific) is soft matching — affects ranking and DS seat allocation only, never blocks visibility. Field categorization must be respected in the matching engine. Do not flatten back to two tiers. *(locked March 2026)*
16. **Firm Type is a qualification field, not a platform role** — Firm Type (Solo Investor / Builder / Land Developer / Operator / Sponsor / Capital Allocator / Other) is captured in Buyer Qualification Section A. It is distinct from platform role (Buyer/Seller/Both/Broker) set at onboarding. Firm Type does not feed the matching engine — it is used by the DS for seat allocation context. *(locked March 2026)*
17. **DealPreviewModal is the only pre-seating deal visibility surface** — buyers see asset type/sub-type, geography, deal stage, match score, and blurred price only; exact price is gated until seated; Request Access CTA lives inside the modal; sellers see the same read-only view from Stage 5 onward for confirmation only; no editing from the preview surface. *(locked March 2026)*
18. **Pre-signup AI intake conversation removed** — landing page is the qualification and conversion surface for both buyers and sellers. AI engagement begins post-signup inside the platform. *(locked March 2026)*
19. **Qualification is not a hard gate on deal room access** — unqualified buyers can receive matches and request access. Soft gate model — ranked lower by DS, may be excluded from seats. Nudge sequence applies. *(locked March 2026)*
20. **Strategy creation before qualification in buyer journey** — strategy delivers immediate value (matches populate instantly). Qualification follows via natural checkpoint in the same AI agent conversation arc. *(locked March 2026)*
21. **Sealed offer model** — buyer offer amounts and terms are not visible to other buyers at any point. Seller sees all offers in full. Buyers see other buyers at credential level only. *(locked March 2026)*
22. **3-round offer maximum** — firm platform rule, no exceptions. Round 1 establishes landscape. Round 2 is where serious buyers separate. Round 3 is best and final. DS advances to Stage 9 after Round 3 regardless of outcome. *(locked March 2026)*
23. **Accepted Offer and Closed are distinct deal statuses** — offer acceptance and actual closing can be weeks or months apart. Accepted Offer status set when DS confirms winning offer. Closed status set only when DS marks Closed milestone in post-acceptance tracker. *(locked March 2026)*
24. **Post-acceptance milestone tracking — MVP only** — DS manually logs 5 milestones with date stamps: PSA Executed / Earnest Money Received / Due Diligence Complete / Financing Confirmed / Closed. Full post-acceptance transaction workflow is post-MVP. *(locked March 2026)*
25. **Buyer deal progress tracker shows stages 6–9 only** — buyers see only the four stages relevant to their experience (Coming Soon, Active Disposition, Offer Negotiation, Accepted Offer). Stages 1–5 are internal review and setup stages — not surfaced in the buyer's tracker. Prior stage completions are shown to buyers as notification history or status tags. Seller sees all 9 stages. *(locked March 2026)*
26. **AI Disposition Engine viability flags use Green / Yellow / Red** — Tier A/B/C language does not appear in any platform UI surface. Reserved for SOP and data schema only. *(locked March 2026)*

---

## Post-MVP Backlog

Items explicitly deferred from MVP scope. To be addressed in subsequent development phases.

| Item | Context |
|------|---------|
| DocuSign integration for listing agreement | Listing agreement handled off-platform in MVP — DS manually confirms task completion |
| Full post-acceptance transaction workflow | PSA management, due diligence document exchange, financing confirmation workflow, title and escrow coordination, automated closing communications — all off-platform in MVP, milestone tracking only |
| Mobile app | Mobile is out of scope for MVP. Desktop-first minimum 1280px. Mobile React Native or PWA deferred to post-MVP. |

---

## 10. Glossary

> All platform terms are defined in **TAXONOMY_v1_0.md**. Terms are not duplicated here. Reference that document for definitions of: Deal Room, Listing, Deal, Buy Strategy, Shared Deal Criteria, Unique Deal Criteria, Three-Tier Data Architecture, Firm Type, Seat, Market Tested, Dormant, Buyer Pool Exhaustion, Disposition Specialist, NextLevel AI / AI Disposition Engine, Match Score, Broadcasting, Buyer Qualification, Fields of Truth, Success Fee, Credits, Dispo, Deal Preview Modal, Buyer-Seller.
