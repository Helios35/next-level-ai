# Strata NextLevel — Site Architecture

> **Version:** 1.6
> **Stack:** React 18 · Vite · TypeScript · Tailwind CSS · shadcn/ui · Supabase
> **Demo Target:** May 18, 2026
>
> **Changes from v1.5:**
> - Section 3 route map expanded — new routes added for Sell mode (create listing, drafts), Strategy mode (strategies list, strategy drafts), Access Requested, and onboarding simplified shell routes
> - Section 4 added — External Nav Structure. Full three-mode navigation map, sidebar states per mode, and persistent global items. This is the canonical nav reference for Cursor agent builds.
> - Section 5 updated — Empty state routes added for all three modes
> - Credits modal and credit gate trigger documented in route map and shared components
> - Gaps identified from mockup review captured and assigned routes
> - Locked decision #22 added — Strategy as top-level mode
> - Locked decision #23 added — Sidebar collapsed by default
> - Locked decision #24 added — Mode-specific sidebar color accent (deferred to branding pass)

---

## Platform Terminology

These terms are locked platform-wide. All documentation, UI copy, and code comments must follow this taxonomy.

| Term | Definition | Audience |
|------|------------|----------|
| **Listing** | The asset a seller submits for disposition. Sellers create, manage, and track listings. | Sellers only |
| **Deal Room** | The temporary transaction workspace created around a listing. Both sellers and buyers operate inside a deal room. | Both |
| **Deal** | Buyer-facing language for what they discover and access. Buyers discover deals, request access to deals, and participate in deal rooms. | Buyers only |

**Rules:**

- Seller-facing UI always uses **"Listing"** — never "Deal" for the thing they created
- Buyer-facing UI always uses **"Deal"** or **"Deal Room"** — never "Listing"
- Internal code object type remains `listing` for the seller-side entity
- Stats and labels follow the audience:
  - Seller stats → "Listings Open," "Listings Started," "Listings Closed"
  - Buyer stats → "Deals Accessed," "Offers Made," "Deals Won"

---

## 1. User Model

Two distinct user categories. They do not share a surface or sidebar.

### 1.1 Buyer-Seller (External)

All external users — investors, builders, developers, operators, brokers — are a single unified type called a **Buyer-Seller**. One account can act as buyer, seller, or both. No separate broker experience in V1. Broker flag stored silently at onboarding.

**Access state is determined by post-onboarding completion:**

| Qualification | Strategy | Deal Room | Result |
|--------------|----------|-----------|--------|
| No | No | No | No matches, no deal room access |
| No | Yes | No | Receives matches — can request deal room access — ranked lower by DS, may be excluded from seats |
| Yes | No | No | Trusted — no matches (no strategy) |
| Yes | Yes | No | Full buyer access — ranked higher for seat allocation |
| — | — | Yes (live) | Active seller — deal room visible to matched buyers |

### 1.2 Internal Team

Three distinct internal roles. Each has a separate portal. All accessed via the Admin mode toggle in the sidebar footer.

| Role | Portal | Owns |
|------|--------|------|
| **Admin** | `/admin` | Stage 3 — QA Review. Document completeness. Pipeline visibility. |
| **Analyst** | `/analyst` | Stage 4 — Financial analysis and viability determination. |
| **Disposition Specialist (DS)** | `/ds` | Stages 6–9 — Deal execution, seat allocation (max 3), offer rounds, client communication. In MVP: represented to external users as the NextLevel AI agent. |

> **Note:** Acquisition Expert role is eliminated. Functions absorbed into Admin (document tracking), Analyst (strategy/market intelligence), and DS (buyer relationship management).

---

## 2. User Flow — Three Buckets

### Bucket 1 — Universal Onboarding

```
Landing Page (/)
  → Landing page communicates value — buyer or seller self-selects
  → Sign Up
    → Onboarding (/onboarding):
        - Name, email, password, company
        - Role selection: Buyer / Seller / Both / Broker
          (Broker flag stored silently — no separate path)
    → Account created → AI activation conversation begins immediately (buyer)
                      → Deal room creation flow begins immediately (seller)
    → Bucket 2 routing
```

### Bucket 2 — Post-Onboarding (Role-Dependent)

**Buyer or Both:**
```
→ AI activation conversation — captures intent, assigns High/Medium/Low ranking
→ Create Buy Strategy (/onboarding/create-strategy)   ← Strategy first — delivers immediate value
  → Natural checkpoint — AI agent asks if buyer wants to continue into qualification
    → Continue → Buyer Qualification (/onboarding/qualification)
    → Exit → Qualification nudge sequence begins (Day 3 / Day 7 / Day 14)
```

**Seller or Both:**
```
→ Create Deal Room (/onboarding/create-deal-room)
  → AI agent guides Tier 1 + Tier 2 data entry (mandatory)
  → AI agent nudges Tier 3 completion (optional)
  → Ownership acknowledgment (checkbox — hard gate before deal goes live)
```

**Broker:** Follows Buyer path exactly. Broker flag stored, not surfaced.

**Incomplete state behavior:**
- Strategy without qualification → receives matches, can request deal room access, ranked lower by DS
- Qualification without strategy → trusted, no matches
- Dashboard surfaces clear nudge banners for incomplete qualification
- Qualification nudge sequence: Day 3 informational / Day 7 ranking context / Day 14 urgency

### Bucket 3 — Active Platform Use

```
Buyer-Seller Dashboard
  ├── Buying: View matches → Request access → Active deal rooms → Offers
  └── Selling: Manage deal rooms → Upload docs → Monitor buyer activity
```

---

## 3. Route Map

### Public Routes (Pre-Auth)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Index` | Landing page — Buyer/Seller toggle, value communication, self-selection — no pre-signup AI intake |
| `/login` | `Login` | Login page |
| `/signup` | `SignUp` | Sign-up entry point |

### Onboarding Routes (Post-Sign-Up, Pre-Active)

| Route | Component | Description |
|-------|-----------|-------------|
| `/onboarding` | `Onboarding` | Profile basics — name, company, role selection |
| `/onboarding/qualification` | `BuyerQualification` | Buyer qualification — capital, experience, approval process |
| `/onboarding/create-strategy` | `CreateBuyStrategy` | Create first buy strategy |
| `/onboarding/create-deal-room` | `CreateDealRoom` | Create first deal room |

### Authenticated Buyer-Seller Routes

#### Buy Mode

| Route | Component | Description |
|-------|-----------|-------------|
| `/buying` | `BuyerDealRooms` | Buy mode home — Your Deals list (default) |
| `/buying/access-requested` | `BuyerDealRooms` | Access Requested tab — pending deal room requests |
| `/buying/active` | `BuyerDealRooms` | Active Deal Rooms tab |
| `/buying/empty` | `BuyerDealsEmpty` | Empty state — no deals yet. CTA routes to Strategy mode. |
| `/buyer-matches` | `BuyerMatches` | Discover Deals — browse matched deal cards, request access |
| `/buyer-matches/:strategyId` | `BuyerMatches` | Matched deals filtered by strategy |
| `/buyer-deal-room/:type/:id` | `BuyerDealRoomView` | Buyer deal room — chat, docs, buyer pool, offers |

#### Sell Mode

| Route | Component | Description |
|-------|-----------|-------------|
| `/selling` | `SellerDealRooms` | Sell mode home — Your Listings list — all deal rooms including Market Tested and Dormant |
| `/selling/create` | `CreateDealRoom` | Create new listing / deal room (post-onboarding) |
| `/selling/drafts` | `SellerDrafts` | Draft listings — incomplete deal rooms not yet submitted |
| `/selling/empty` | `SellerListingsEmpty` | Empty state — no listings yet. CTA to create first listing. |
| `/seller-deal-room/:type/:id` | `SellerDealRoomView` | Seller deal room — chat, docs, buyer pool, stages |

#### Strategy Mode

| Route | Component | Description |
|-------|-----------|-------------|
| `/strategies` | `StrategiesList` | Strategy mode home — Your Strategies list with match counts |
| `/strategies/drafts` | `StrategyDrafts` | Draft strategies — incomplete, not yet broadcasting |
| `/strategies/empty` | `StrategiesEmpty` | Empty state — no strategies yet. Full AI chat welcome shown. |
| `/buy-strategy/create` | `CreateBuyStrategy` | Create new buy strategy (post-onboarding) |
| `/buy-strategy/:id` | `BuyStrategyView` | Strategy detail — matches, activity feed, edit |

#### Global / Shared Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/profile` | `Profile` | Profile — personal info, buyer/seller stats, qualification status |
| `/settings` | `Settings` | Settings — notification preferences (buyer and seller independent), account |

### Internal Portal Routes

> Full internal interface spec — nav structure, page-level layouts, locked decisions — lives in **INTERNAL_INTERFACE_v1_0.md**. Routes below are the canonical route map for Cursor agent builds.

#### Shared Internal

| Route | Component | Description |
|-------|-----------|-------------|
| `/internal/login` | `InternalLogin` | Internal-only login. No sign-up. Role-based routing on auth. |

#### DS Portal

| Route | Component | Description |
|-------|-----------|-------------|
| `/ds` | `DSPortal` | Default — redirects to `/ds/tasks` |
| `/ds/tasks` | `DSTaskQueue` | Action Queue — tasks needing DS attention today (default landing) |
| `/ds/notifications` | `DSNotifications` | All DS notifications |
| `/ds/pipeline` | `DSPipeline` | All Deals — full pipeline across all stages |
| `/ds/pipeline/active` | `DSPipelineActive` | Active Deals — Stages 6–9 only |
| `/ds/pipeline/market-tested` | `DSMarketTested` | Market Tested queue — awaiting seller decision |
| `/ds/pipeline/dormant` | `DSDormant` | Dormant deals |
| `/ds/deal/:id` | `DSDealView` | DS deal management — seat allocation, offers, docs, intelligence, milestones |
| `/ds/clients/sellers` | `DSSellerClients` | Seller relationship list |
| `/ds/clients/sellers/:id` | `DSSellerProfile` | Individual seller profile and deal history |
| `/ds/clients/buyers` | `DSBuyerQueue` | Buyer queue across all deals |
| `/ds/clients/buyers/:id` | `DSBuyerProfile` | Individual buyer profile — qualification, intent, deal history |
| `/ds/settings` | `DSSettings` | DS settings |

#### Analyst Portal

| Route | Component | Description |
|-------|-----------|-------------|
| `/analyst` | `AnalystPortal` | Default landing — Review Queue (pending AI memos) |
| `/analyst/completed` | `AnalystCompleted` | Completed reviews with outcomes |
| `/analyst/pipeline` | `AnalystPipeline` | Full pipeline — read-only |
| `/analyst/review/:id` | `AnalystReviewView` | Individual deal review — AI memo + Approve / Return / Reject |
| `/analyst/settings` | `AnalystSettings` | Analyst settings |

#### Admin Portal

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | `AdminPortal` | Default landing — Overview (exception queue + pipeline summary) |
| `/admin/exceptions` | `AdminExceptions` | Exception Queue — AI-flagged Stage 3 deals |
| `/admin/pipeline` | `AdminPipeline` | Full pipeline — all deals, all stages, all statuses |
| `/admin/deal/:id` | `AdminDealView` | Individual deal — document review, advance or return |
| `/admin/clients` | `AdminClients` | All buyer and seller accounts |
| `/admin/clients/:id` | `AdminClientProfile` | Individual client profile |
| `/admin/staff` | `AdminStaff` | Internal team management |
| `/admin/staff/create` | `AdminStaffCreate` | Provision new internal user account |
| `/admin/settings` | `AdminSettings` | Admin settings |

### Catch-All

| Route | Component | Description |
|-------|-----------|-------------|
| `*` | `NotFound` | 404 catch-all |

---

## 4. External Nav Structure

> This section is the canonical navigation reference for the external Buyer-Seller interface. For full UI shell specs (layout zones, top bar, AI chat panel, empty states, credits, onboarding shell behavior), see PRD Section 4.

### 4.1 Three-Mode Switcher

The top bar contains a three-tab mode switcher: **Sell · Buy · Strategy**

- Switching modes changes the left sidebar nav items and the AI chat panel context chip
- The active tab is visually selected — filled pill, higher contrast
- The Buy tab displays a numeric badge when there are active deal notifications
- Mode state persists across navigation within a session
- No page reload required on mode switch — sidebar and context update in place

### 4.2 Left Sidebar — Per Mode

The sidebar collapses to icon-only by default (~48px wide). Expands to icon + label on user toggle (~200px wide). Nav items determined by active mode.

#### Sell mode sidebar

| # | Icon | Label | Route |
|---|------|-------|-------|
| 1 | Grid/dashboard | Your Listings | `/selling` |
| 2 | Plus circle | Create Listing | `/selling/create` |
| 3 | Draft/pencil | Drafts | `/selling/drafts` |

#### Buy mode sidebar

| # | Icon | Label | Route |
|---|------|-------|-------|
| 1 | Grid/dashboard | Your Deals | `/buying` |
| 2 | Compass/discover | Discover Deals | `/buyer-matches` |
| 3 | Clock | Access Requested | `/buying/access-requested` |

#### Strategy mode sidebar

| # | Icon | Label | Route |
|---|------|-------|-------|
| 1 | Grid/dashboard | Your Strategies | `/strategies` |
| 2 | Plus circle | Create Strategy | `/buy-strategy/create` |
| 3 | Draft/pencil | Drafts | `/strategies/drafts` |

#### Persistent sidebar footer (all modes)

| Icon | Label | Destination |
|------|-------|-------------|
| Bell | Notifications | Notification panel |
| Gear | Settings | `/settings` |

### 4.3 Mode-Specific Sidebar Color Accent

Each mode applies a distinct color treatment to the sidebar (background tint or left-border accent) to visually differentiate modes even when the sidebar is collapsed.

| Mode | Accent intent | Status |
|------|--------------|--------|
| Sell | Teal family | Deferred to branding pass |
| Buy | Purple family | Deferred to branding pass |
| Strategy | Amber family | Deferred to branding pass |

### 4.4 Persistent Global Elements

| Element | Location | Behavior |
|---------|----------|----------|
| AI chat panel | Right side | Resizable, collapsible. Context chip matches current mode. |
| Mode switcher | Top bar center | Always visible. Three tabs: Sell · Buy · Strategy. |
| Credits display | Top bar right | Always visible. Tappable — opens Credits modal. |
| Avatar | Top bar right | Tappable — opens profile/account dropdown. |
| Dark mode toggle | Top bar right | Tappable. |
| Notifications | Sidebar footer | Bell icon. All modes. |
| Settings | Sidebar footer | Gear icon. All modes. |

### 4.5 Internal Portal Navigation

Internal portals (Admin, Analyst, DS) share the same visual shell but have a separate nav structure. Designed separately. No external user has access to internal routes.

---

## 5. Key User Flows

### Buyer Flow

```
Landing (/)
  → Landing page communicates value — buyer self-selects
  → Sign Up → Onboarding (/onboarding)
    → AI activation conversation — intent captured, High/Medium/Low ranking assigned
    → Create Buy Strategy (/onboarding/create-strategy) ← Strategy first
      → Natural checkpoint → Continue into qualification OR exit (nudge sequence begins)
        → Buyer Qualification (/onboarding/qualification) ← Optional but nudged
          → Dashboard (/dashboard)
            → Buy Strategy card → View Matches (/buyer-matches/:strategyId)
              → Deal card with state-dependent CTAs:
                  Coming Soon (Stage 6): Preview [active] | Access [disabled]
                  Active Disposition (Stage 7): Preview [active] | Access [active]
                  Access Pending: Preview [active] | Pending [withdrawal available]
                  Wait Queue: Preview [active] | Wait Queue
                → DealPreviewModal (asset type/sub-type, geography, deal stage, match score, blurred price)
                → "Access" CTA submits request directly from card OR from inside modal
                  → Access Pending state (queue transparency message shown)
                    → DS reviews and approves or denies seat
                      → [Denied] AI Disposition Engine sends structured denial message → Wait Queue state
                      → [Approved] AI Disposition Engine welcome message
                        → Accept 3% Success Fee Agreement modal (hard gate)
                          → Active Deal Room (/buyer-deal-room/:type/:id)
                              → Chat with AI Disposition Engine — question routing in real time
                              → View docs (read-only) · Buyer pool (seat position visible) · Submit offer
                                → Open offer form → soft signal to DS (awareness only)
                                  → Submit offer form → hard trigger → DS steps in
                                    → Offer Negotiation (Stage 8) — sealed, max 3 rounds
                                      → Win → Accepted Offer state → milestone tracker visible
                                      → Lose → anonymized winning summary → read-only deal room
                                      → Deal stalls → Market Tested → AI Disposition Engine notification
```

### Seller Flow

```
Landing (/)
  → Landing page communicates value — seller self-selects
  → Sign Up → Onboarding (/onboarding)
    → Create Deal Room (/onboarding/create-deal-room)
      → AI agent guides Tier 1 + Tier 2 data entry (mandatory hard gates)
      → AI agent nudges Tier 3 completion (optional — improves match quality)
      → Ownership acknowledgment (checkbox — hard gate)
      → "Send to Review" → Stage 2 complete
        → Stage 3: AI checklist agent runs completeness check → completeness report
            → Clean: auto-advances to Stage 4
            → Exceptions: human Admin reviews → advance or return to seller
          → Stage 4: AI analyst agent generates financial memo → human Analyst reviews
              → Green flag: advance to Stage 5
              → Yellow flag: return to Admin
              → Red flag: reject with reasoning + upsell
            → Stage 5: Decision Point (state-dependent, AI agent leads conversation)
                Yellow/Red state: Request Changes / Optimize / Pause (21-day guardrail) / Withdraw
                Green state: Proceed to Listing Agreement / Upgrade or Top Up Credits / Pause / Withdraw
                  → Seller sees DealPreviewModal (confirmation only — read-only buyer-facing view)
                  → Stage 6: Coming Soon
                      → Seller receives acknowledgement modal — confirms deal visible to buyers
                      → Platform creates DS task: "Listing Agreement Required"
                      → DS handles listing agreement off-platform → marks task complete
                    → Stage 7: Active Disposition
                        → AI Disposition Engine manages buyer outreach, Q&A, feedback
                        → DS approves every seat (max 3, no auto-seating)
                        → Seller Deal Room (/seller-deal-room/:type/:id)
                          → Chat with AI Disposition Engine · Monitor buyer activity · Review offers
                            → Stage 8: Offer Negotiation (sealed, max 3 rounds, DS-set deadlines)
                              → Stage 9: Accepted Offer
                                  → DS logs post-acceptance milestones
                                  → Deal status → Closed when DS marks Closed milestone
                              OR
                            → Buyer pool exhausted → Market Tested
                              → Seller options: Adjust / Pause / Withdraw
                                → Adjust → deal re-enters Stage 7
                                → Pause or no response → Dormant (21-day guardrail)
                                → Withdraw → Withdrawn
```

### Admin Flow (Stage 3 — QA Review)

```
Admin Portal (/admin)
  → All Deals — pipeline view, stage filter (includes Market Tested + Dormant filter)
  → QA Tab (/admin?tab=qa)
    → Select deal in Stage 3
      → Review AI-flagged exceptions
      → Confirm document completeness
        → Advance to Analyst (Stage 4)
          OR
        → Return to Seller (requires documented reason, deal returns to Stage 2)
  → Clients Tab — view all Buyer-Sellers, assign staff
  → Staff Tab — DS and Analyst assignments
```

### Analyst Flow (Stage 4 — Financial Review)

```
Analyst Portal (/analyst)
  → Review Queue — deals in Stage 4
    → Select deal
      → Review AI-generated financial memo
      → Make viability determination:
          → Approve → seller advances to Decision Point (Stage 5)
          → Return to Admin → Admin re-reviews (requires documented reason)
          → Reject → seller notified with reasoning + upsell opportunity
```

### DS Flow (Stages 6–9 + Post-Disposition)

```
DS Portal (/ds)
  → Deal Pipeline — Active Dispo / Offer Negotiation / Accepted Offer / Market Tested / Dormant
    → Stage 6: Coming Soon
        → Receives automatic task notification: "Listing Agreement Required — [Deal Name]"
        → Handles listing agreement off-platform
        → Returns to platform → marks task complete → deal advances to Stage 7
        → Reviews Indicate Interest signals from Coming Soon period for seat allocation context
    → Stage 7: Active Disposition
        → AI Disposition Engine manages buyer outreach, Q&A, feedback autonomously
        → DS reviews AI-recommended seat allocations
        → Approves or overrides each seat (max 3 concurrent, no auto-seating)
        → Receives soft signal when buyer opens offer form (awareness only — no handoff)
        → Receives hard trigger when buyer submits offer form → steps into buyer-facing process
        → Manages wait queue
        → Buyer Pool Exhaustion Check:
            If all 3 seats filled sequentially
            + all seated buyers passed or underwriting expired
            + no written LOIs received
            + all eligible matched buyers in pipeline invited and passed:
            → DS marks deal Market Tested — No Immediate Demand
              → Seller notified
              → Seller chooses: Adjust / Pause / Withdraw
                → Adjust → deal re-enters Stage 7
                → Pause or no response → Dormant
                → Withdraw → Withdrawn
    → Stage 8: Offer Negotiation
        → Sets round deadline per round (default 48–72 hours)
        → Maximum 3 rounds — firm rule
        → Reviews AI Disposition Engine-generated improvement feedback for each buyer
        → Authorizes all feedback before delivery to buyers
        → DS and seller review all offers between rounds (sealed — seller sees all, buyers see own only)
        → Advances to Stage 9 after Round 3 regardless of outcome
    → Stage 9: Accepted Offer
        → Confirms winning offer → deal status set to Accepted Offer
        → Competitive phase frozen
        → AI Disposition Engine notifies non-winning buyers with anonymized summary
        → Logs post-acceptance milestones with date stamps:
            PSA Executed / Earnest Money Received / Due Diligence Complete / Financing Confirmed / Closed
        → Marks Closed milestone → deal status updates to Closed
  → Market Tested Queue — deals awaiting seller decision
  → Dormant Deals — reactivation controls, seller follow-up
```

---

## 6. Deal Room Status Model

Deal rooms carry a `status` field separate from `currentStage`. Stage tracks where in the lifecycle a deal is. Status tracks the deal's operational state — active in pipeline, or in a terminal/paused condition.

| Status | Description | Who Sets It |
|--------|-------------|-------------|
| `active` | Deal is progressing through the 9-stage lifecycle | System on creation; DS on reactivation |
| `accepted_offer` | Winning offer confirmed by DS — competitive phase frozen — post-acceptance milestones in progress | DS |
| `market_tested` | All 3 seats filled, all buyers passed, no offers received, full buyer pool exhausted | DS only |
| `dormant` | Deal paused — stalled documents (21-day rule), seller-elected pause, or post-market-tested with no adjustment | DS or system (21-day rule) |
| `closed` | Deal closed successfully — DS marks Closed milestone in post-acceptance tracker | DS |
| `withdrawn` | Seller withdrew the deal | Seller or DS |

### Transition Rules

- `active` → `accepted_offer`: DS confirms winning offer at Stage 9
- `accepted_offer` → `closed`: DS marks Closed milestone in post-acceptance tracker
- `active` → `market_tested`: DS action only — requires buyer pool exhaustion confirmation
- `market_tested` → `active`: Seller elects to adjust pricing or structure — deal re-enters Stage 7
- `market_tested` → `dormant`: Seller declines adjustment or does not respond within follow-up window
- `active` → `dormant`: Document collection stalls past 21-day window (system-triggered) or seller elects to pause
- `dormant` → `active`: DS reactivates on seller request — deal re-enters at appropriate stage
- `active` → `withdrawn`: Seller withdraws at Decision Point (Stage 5) or DS closes with no path forward

### Buyer Pool Exhaustion Rule

All four conditions must be true before DS can mark a deal as Market Tested:

1. All 3 seats have been filled sequentially
2. All seated buyers have either formally passed or allowed their underwriting window to expire
3. No written LOIs have been received
4. All eligible matched buyers in the filtered pool have been invited and passed

### Seller Visibility for Non-Active Statuses

Market Tested and Dormant deals remain visible in the seller's deal room list with clear status badges. Sellers can request reactivation from either status — DS confirms and advances the deal.

### Admin and DS Pipeline Visibility

- All Deals view in Admin portal and DS portal includes filter tabs for Market Tested and Dormant
- Dormant deals are visually separated from the active pipeline — present but de-emphasized
- DS portal surfaces a dedicated Market Tested Queue showing seller decision status

---

## 7. Shared Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `AppSidebar` | `src/components/AppSidebar.tsx` | Main sidebar — mode toggle, nav items, strategy list |
| `NavLink` | `src/components/NavLink.tsx` | React Router Link wrapper with active styling |
| `LoginModal` | `src/components/LoginModal.tsx` | Login dialog |
| `SignUpModal` | `src/components/SignUpModal.tsx` | Sign-up dialog |
| `CreditsModal` | `src/components/CreditsModal.tsx` | Credits / payment modal for seller deal room activation |
| `QualificationModal` | `src/components/QualificationModal.tsx` | Post-onboarding prompt for incomplete qualification |
| `StrategyPromptModal` | `src/components/StrategyPromptModal.tsx` | Post-onboarding prompt for missing buy strategy |
| `OwnershipGate` | `src/components/OwnershipGate.tsx` | Ownership acknowledgment checkbox gate |
| `SuccessFeeModal` | `src/components/SuccessFeeModal.tsx` | 3% success fee agreement before buyer enters active deal room |
| `MatchScoreRing` | `src/components/MatchScoreRing.tsx` | SVG match score ring visualization |
| `DealProgressTracker` | `src/components/DealProgressTracker.tsx` | 9-stage deal lifecycle tracker. Seller view: all 9 stages. Buyer view: stages 6–9 only — accepts a `viewerRole` prop (`seller` / `buyer`) to control visible stages. Stages 1–5 surfaced to buyers as notification history/tags, not tracker steps. |
| `MarketTestedBanner` | `src/components/MarketTestedBanner.tsx` | **NEW** — Seller-facing status banner when deal reaches Market Tested — surfaces seller options (Adjust / Pause / Withdraw) |
| `DormantStatusBadge` | `src/components/DormantStatusBadge.tsx` | **NEW** — Status badge for dormant deals in pipeline and seller deal room list |
| `DealPreviewModal` | `src/components/DealPreviewModal.tsx` | **NEW** — Modal showing limited deal detail before seating. Buyer view: asset type/sub-type, geography, deal stage, match score, blurred price, Request Access CTA. Seller view (Stage 5+): same fields, read-only, confirmation only. |
| `BuyerDealsEmpty` | `src/components/BuyerDealsEmpty.tsx` | **NEW** — Buy mode empty state. No deals yet. CTA routes user to Strategy mode. |
| `SellerListingsEmpty` | `src/components/SellerListingsEmpty.tsx` | **NEW** — Sell mode empty state. No listings yet. CTA to create first listing. |
| `StrategiesEmpty` | `src/components/StrategiesEmpty.tsx` | **NEW** — Strategy mode empty state. No strategies yet. Expands AI chat panel to full welcome state. |
| `CreditGate` | `src/components/CreditGate.tsx` | **NEW** — Credit gate modal. Surfaces when seller attempts to activate a deal room with insufficient credits. Triggers CreditsModal with purchase flow inline. |

All UI primitives live in `src/components/ui/` (shadcn/ui).

---

## 8. Post-Onboarding State Logic

Platform tracks completion state per user and surfaces the appropriate prompt or gate when an action requires a prerequisite.

| Incomplete State | User Attempts | Platform Response |
|-----------------|--------------|-------------------|
| No qualification | Request deal room access | Soft gate — buyer can request access but is ranked lower by DS. Qualification nudge modal surfaces. |
| No strategy | View matches | Prompt to create strategy first |
| No ownership acknowledgment | Make deal room live | Hard gate — must acknowledge before proceeding |
| No qual + no strategy | Visit dashboard | Surface strategy creation nudge first, qualification nudge second via dashboard banner |

---

## 9. Data Layer

- **Database:** Supabase
- **Current table:** `signups` (name, email, user_type, terms_accepted)
- **Auth:** Not yet implemented — sign-up writes to `signups` table
- **State management:** React Query (`@tanstack/react-query`) + local component state
- **Post-onboarding state:** Mock flags in prototype (`qualification_complete`, `strategy_created`, `ownership_acknowledged`)
- **Stage audit trail:** `stage_transitions` table planned — every return between stages requires documented notes
- **Deal room status:** `status` field on `deal_rooms` table — see Section 6 for values and transition rules
- **Status audit trail:** `status_transitions` table planned — every Market Tested and Dormant change logged with actor and notes

---

## 10. Deprecated / Legacy Files

Remove or archive before MVP build begins.

| File | Status |
|------|--------|
| `BrokerClients.tsx` | Deprecated — replaced by AdminPanel Clients tab |
| `BrokerDealRoomsList.tsx` | Deprecated — replaced by SellerDealRooms / BuyerDealRooms |
| `BrokerAcceptedClients.tsx` | Deprecated |
| `BrokerPendingClients.tsx` | Deprecated |
| `DealRoom.tsx` | Legacy — only routed at `/broker-deal-room/:type/:id` (unused) |
| `Dashboard.tsx` | **Deprecated** — `/dashboard` route retired. Replaced by three-mode shell. Post-login routing handled by smart landing logic — see Locked Decision #25. |

---

## 11. Locked Decisions (Do Not Re-Litigate)

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
14. **Tier A/B/C classification is internal SOP only** — not replicated in the platform; Analyst outcomes map to Green/Approve / Yellow/Return to Admin / Red/Reject *(locked March 2026)*
15. **DealPreviewModal** — buyers see asset type/sub-type, geography, deal stage, match score, and blurred price before being seated; Request Access CTA lives inside the modal and on the deal card directly; sellers can view the same read-only preview from Stage 5 onward (confirmation only, no editing from preview) *(locked March 2026)*
16. **Pre-signup AI intake removed** — landing page is the conversion and self-qualification surface for both buyers and sellers. No AI conversation before account creation. *(locked March 2026)*
17. **Qualification is not a hard gate** — unqualified buyers can receive matches and request deal room access. Soft gate model — ranked lower by DS. Nudge sequence replaces hard block. *(locked March 2026)*
18. **Strategy creation before qualification** — strategy delivers immediate value to buyers. Qualification follows via natural AI agent conversation checkpoint. *(locked March 2026)*
19. **Sealed offer model** — offers are not visible to competing buyers at any point. Seller sees all offers in full. Buyers see credential profiles only. *(locked March 2026)*
20. **3-round offer maximum** — firm platform rule. DS advances to Stage 9 after Round 3 regardless of outcome. *(locked March 2026)*
21. **Accepted Offer and Closed are distinct statuses** — Accepted Offer set on DS confirmation of winning offer. Closed set only when DS marks Closed milestone in post-acceptance tracker. *(locked March 2026)*
22. **Strategy is a top-level mode** — not nested under Buy. Equal navigational weight to Sell and Buy. Earns top-level status through workflow depth and future expansion room for both buyer and seller strategy surfaces. *(locked March 2026)*
23. **Left sidebar collapsed by default** — icon-only on first load (~48px). User expands manually. Collapsed state is the default to maximize content area. *(locked March 2026)*
24. **Mode-specific sidebar color accent** — each mode (Sell / Buy / Strategy) applies a distinct sidebar color treatment to visually differentiate modes even when collapsed. Color values deferred to branding pass. Structural behavior locked. *(locked March 2026)*
25. **Smart post-login landing — role and state aware** — `/dashboard` route retired. Post-login routing logic: (1) New user with no strategies → `/strategies/empty` — full AI welcome state. (2) Returning buyer with active deals → `/buying`. (3) Returning seller with active listings → `/selling`. (4) Both role or returning user with content in multiple modes → last visited mode, persisted in session. Logic lives in a `PostLoginRouter` component that runs once after auth confirmation. *(locked March 2026)*
26. **Internal portals use completely separate login** — `/internal/login` only. No shared login with external users. Internal accounts provisioned by Admin only. No self-signup. *(locked March 2026)*
27. **DS portal has top-tab switcher: Tasks · Pipeline · Clients** — same interaction pattern as external mode switcher. Sidebar nav items change per tab. Admin and Analyst have no tab switcher — sidebar nav only. *(locked March 2026)*
28. **DS default landing is Task Queue** — `/ds/tasks`. What needs action today. Pipeline is secondary navigation. *(locked March 2026)*
29. **Internal portals share the external visual shell** — same layout zones, same shadcn/ui primitives, same AI chat panel behavior. Differentiated by neutral/slate color accent applied during branding pass. *(locked March 2026)*
