# Strata NextLevel — Product Requirements Document

> **Version:** 1.9
> **Last Updated:** March 2026
> **Stack:** React 18 · Vite · TypeScript · Tailwind CSS · shadcn/ui · Supabase
> **Demo Target:** May 18, 2026
>
> **Changes from v1.8:**
> - Section 1 — Product Overview updated. Mission, positioning, and go-to-market phasing added from Strata NextLevel 3.2 Business Plan Narrative. Strategic context and monetization streams added as Sections 1.3 and 1.4.
> - Section 1.2 — User Model updated to reflect separate internal login and pointer to INTERNAL_INTERFACE_v1_0.md.
> - Section 3 — User Roles & Permissions updated to reflect three-mode external shell and new internal portal structures.
> - Section 4 — Feature Specifications replaced with accurate summaries and pointers to canonical build docs.
> - Section 5.3 — DealRoomStatus enum corrected — accepted_offer added.
> - Section 6 — Design System updated — brand colors marked as deferred, status badges updated to include Accepted Offer.
> - Section 7.2 — Mobile explicitly removed from scope, added to Post-MVP Backlog.

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

---

## 2. Core Business Logic

### 2.1 Pre-Signup Experience — Landing Page First

The platform's primary conversion surface is the landing page. Before creating an account, users are shown what the platform does and who it is for. A well-designed landing page communicates value and self-selects the right users — if a buyer or seller reads it and signs up, they have qualified themselves.

**The pre-signup AI intake conversation has been removed for both buyers and sellers.** Leading with a chatbot before the user understands what the platform is creates friction and confusion. The AI engagement moves post-signup, inside the platform, where it is contextually appropriate.

#### Landing Page Entry Points

- Buyer selects "Buyer" on the landing page
- Seller selects "Seller" on the landing page
- Both paths lead to account creation — no AI conversation before signup
- MD team outreach drives external traffic via marketplace link — same landing page experience regardless of entry source

#### Post-Signup AI Engagement

AI engagement begins immediately after account creation — inside the platform:

- **Seller:** AI agent guides seller through deal room creation, Tier 1 + Tier 2 data entry (mandatory), Tier 3 nudge (optional)
- **Buyer:** AI activation conversation begins immediately after account creation — captures intent, assigns High / Medium / Low intent ranking, nudges toward strategy creation then qualification

> **Note on source tracking:** MD referral link source is tracked in the data schema for analytics. No platform behavior is tied to referral link status in MVP.

---

### 2.2 User Onboarding — Three Buckets

Every user progresses through three sequential buckets.

#### Bucket 1 — Universal Onboarding (Lightweight)

Same for all users. Captures the minimum to create an account.

- Name, email, password
- Company / Firm name
- Role selection: **Buyer / Seller / Both / Broker** (Broker flag stored silently — no separate path in V1)

#### Bucket 2 — Post-Onboarding (Role-Dependent)

**Buyer or Both:**
- Create a **Buy Strategy** first — strategy creation delivers immediate value (matches populate instantly). AI agent-guided conversation.
- Complete **Buyer Qualification** second — establishes execution credibility for DS seat allocation. AI agent-guided conversation flowing from strategy creation checkpoint.
- Neither is a hard access gate — see Post-Onboarding Access State Logic below.

**Seller or Both:**
- Create a **Deal Room** — AI agent guides seller through Tier 1 + Tier 2 data entry (mandatory), Tier 3 nudge (optional)
- Acknowledge ownership of the asset (checkbox in MVP) — hard gate before deal room goes live

#### Bucket 3 — Active Platform Use

Full platform access once Bucket 2 is complete.

#### Post-Onboarding Access State Logic

> **Change from v1.6:** Qualification is no longer a hard gate on deal room access. Unqualified buyers can receive matches and request deal room access — they are ranked lower by the DS for seat allocation. The hard block is removed and replaced with a soft gate model.

| Qualification | Strategy | Result |
|--------------|----------|--------|
| No | No | No matches, no deal room access |
| No | Yes | Receives matches — can request deal room access — ranked lower by DS, may be excluded from seat allocation |
| Yes | No | Trusted — receives no matches (no strategy to match against) |
| Yes | Yes | Full access — receives matches, eligible for deal room access, ranked higher for seat allocation |

#### Buyer Qualification Nudge Sequence

For buyers who skip or delay qualification after strategy creation:

- Day 3 — informational nudge: what qualification is and why it matters
- Day 7 — ranking nudge: how qualification improves seat allocation odds
- Day 14 — urgency nudge: "you're missing deals" direct call to action
- After Day 14 — human DS notified if buyer has High intent ranking from activation conversation

---

### 2.3 Buyer Qualification System

Qualification establishes a buyer's execution credibility. Stored as user-level Fields of Truth — slow-changing, organization-driven, predictive of whether a deal will close.

> **Qualification does not feed the matching engine.** It is used by the DS for seat allocation ranking and access decisions.

> **Qualification is not a hard gate on deal room access.** Unqualified buyers can receive matches and request access. They are ranked lower by the DS and may be excluded from seats. See Section 2.2 for nudge sequence.

#### Collection Mechanism

Qualification is collected via AI agent-guided conversation — part of the continuous post-signup conversation arc that flows from buyer activation through strategy creation into qualification. The AI agent already knows the buyer's role and intent and picks up contextually at a natural checkpoint after strategy creation.

Buyers can also view and edit all qualification fields at any time via their **profile page** — self-serve, outside the conversational experience. Both surfaces write to the same Fields of Truth. DS can see when qualification data was last updated.

#### Buyer Intent Ranking

During the post-signup AI activation conversation, the AI agent assigns a buyer intent ranking based on the conversation:

- **High** — actively deploying capital, clear strategy, fast decision process
- **Medium** — interested but slower decision process or unclear timing
- **Low** — exploratory or long acquisition timeline

Intent ranking is stored against the buyer profile and used by the DS for seat allocation prioritization and follow-up decisions.

#### Qualification Sections

**A. Profile**
- Firm Type (Solo Investor / Builder / Land Developer / Operator / Sponsor / Capital Allocator / Other)

> **Note:** Firm Type is distinct from platform role selection (Buyer/Seller/Both/Broker) set at onboarding. Platform role determines what surfaces the user sees. Firm Type describes what kind of operator they are — used by DS for seat allocation context. Does not feed the matching engine.

**B. Capital Source**
- Equity sourcing method (personal balance sheet, captive fund, institutional, syndication, public raise)
- Typical equity check size per transaction ($1M–$5M, $5M–$15M, $15M–$50M, $50M+)
- Timeline to secure outside equity (under 2 weeks → 12+ weeks / deal dependent)
- Debt sourcing method (established bank, debt fund, agency, deal-by-deal, none)
- Debt readiness (active credit facility, established relationships, deal-by-deal, none)

**C. Approval Process**
- Decision authority (sole decision maker, partner group, investment committee, capital partner)
- Internal approval timeline (same day → 4+ weeks / deal dependent)
- Stage at which formal approval is required (pre-LOI, pre-contract, during DD, varies)

**D. Experience**
- Historical transaction volume (under $10M → $1B+)
- Number of historical acquisitions (0 → 50+)
- Asset types acquired (SFR, BFR, Residential Land, Multifamily, Other)
- Regions active (Southeast, Mid-Atlantic, Northeast, Midwest, Texas, Mountain West, West Coast, National)

#### Qualification Impact

- Qualified buyers ranked higher for deal room seat allocation by the DS
- Unqualified buyers receive matches and can request access — ranked lower, may be excluded from seats
- Qualification status and last-updated timestamp visible to DS during buyer queue review
- Shown as a badge in the buyer pool (Qualified / Not Qualified)

---

### 2.4 Buy Strategy System

Buyers create and manage **Buy Strategies** — persistent acquisition profiles that broadcast against seller deal rooms to generate matches.

#### Strategy Lifecycle

```
Draft → Broadcasting → Matches Found → Request Access → Access Pending (DS review)
  → [Denied: Wait Queue] → [Approved: Success Fee Agreement (3%)] → Active Deal Room → Offer → Close
```

#### Strategy States

| State | Description |
|-------|-------------|
| **Broadcasting** | Actively matching against deal rooms — green status dot |
| **Paused** | Temporarily inactive — amber status dot — toggleable |
| **Draft** | Incomplete — not yet broadcasting |

#### Deal Card CTA States

| Deal State | Preview CTA | Action CTA |
|-----------|-------------|------------|
| Coming Soon (Stage 6) | Active — opens Deal Preview Modal | Disabled — grayed out |
| Active Disposition (Stage 7) | Active — opens Deal Preview Modal | "Access" — active, submits request directly from card |
| Access Pending | Active | "Pending" — withdrawal available |
| Wait Queue | Active | "Wait Queue" |
| Access Granted | Active | "Enter Deal Room" |

#### Strategy Properties

- Name, Asset Type, Asset Sub-Type
- Shared Deal Criteria: Geography (MSA), Deal Stage targets, Pricing range
- Unique Deal Criteria Tier 2 (Sub-Type Group — Hard Matching): Unit count range, Cap rate range, Equity check size, Product type, Square footage range, Garage preference
- Unique Deal Criteria Tier 3 (Unique — Refinement/Ranking Only — Never Blocks Visibility): Asset sub-type specific preferences — HOA, Septic, Section 8, Vintage, Amenities, Lease-up risk, Value-add tolerance, etc.
- Match Score, Active Matches count, Growth %

> **Three-Tier Matching Architecture (Locked):** Tier 1 (Universal/Shared) and Tier 2 (Sub-Type Group) are hard matching — no alignment means deal is invisible. Tier 3 (Unique) is soft matching — affects ranking and DS seat allocation only, never blocks visibility. See Section 2.11 for full tier definitions.

#### Strategy Creation Flow

- AI agent-led conversation — two-column layout: Left = AI agent chat, Right = progressively populated strategy card
- AI agent walks through Tier 1 criteria first (asset type, sub-type, geography, deal stage, pricing range), then Tier 2 criteria
- Right panel sections unlock progressively as criteria are provided
- Tier 1 and Tier 2 are hard gates — strategy cannot go live without both
- Tier 3 is optional but nudged — completion indicator shown, improves match quality
- Buyer inputs via free text or multiple choice option chips throughout
- Final CTA: "Save Strategy & Start Broadcasting"
- On save — natural checkpoint: AI agent asks buyer if they want to continue into qualification

---

### 2.5 Deal Room System

Deal Rooms are temporary, single-asset transaction workspaces. One asset per Deal Room (MVP rule, locked). Disposed of when the deal closes. All execution controlled by Strata's internal team.

#### Deal Room Data Layers

| Layer | Tier | Matching Behavior | Description |
|-------|------|-------------------|-------------|
| **Shared Deal Criteria** | Tier 1 — Universal | Hard match | Asset Category, Geography, Deal Stage, Pricing Posture — applies to every deal room regardless of asset type |
| **Unique Deal Criteria — Sub-Type Group** | Tier 2 — Group Shared | Hard match | Fields shared across a sub-type group (e.g., Unit Count + Cap Rate apply to SFR/BFR/MF together; Land Product Type + Unit Count apply to Land). No alignment = deal invisible. |
| **Unique Deal Criteria — Unique** | Tier 3 — Sub-Type Specific | Soft match | Fields specific to one sub-type only (HOA, Amenities, Vintage, etc.). Affects ranking and DS seat allocation only — never blocks visibility. |

#### Deal Room Lifecycle — 9 Stages

Stages 2–4 are bidirectional — every return requires notes documenting the reason.

| Stage | Name | Primary Actor | Gate Owner | Description |
|-------|------|--------------|-----------|-------------|
| 1 | Buyer Matching | Seller | System | Seller creates deal room. AI agent guides Tier 1 + Tier 2 data entry (mandatory hard gates). Tier 3 nudged. Auto-advances on submit. |
| 2 | Deal Completion | Seller | Seller | Seller uploads required documents. AI agent guides process. Conversational AI agent sets expectations. 21-day dormancy rule applies. Exit CTA: "Send to Review." |
| 3 | QA Review | Admin | **Admin (structural gate — exception handling only)** | AI checklist agent identifies deal type, runs completeness check, produces structured completeness report. Clean packages auto-advance. Flagged exceptions route to human Admin. Output: completeness report — not financial analysis. |
| 4 | Analyst Review | Analyst | **Analyst (economic gate)** | AI analyst agent generates financial memo. Human Analyst reviews and authorizes. Flag options: Green (viable) / Yellow (needs more docs or adjustments) / Red (not viable). Tier A/B/C language does not appear in platform UI. |
| 5 | Decision Point | Seller | Seller | State-dependent options. Yellow/Red state: Request Changes (AI agent specifies, routes immediately if seller agrees, escalates to human DS if needed) / Optimize / Pause (21-day guardrail) / Withdraw. Green state: Proceed to Listing Agreement / Upgrade or Top Up Credits / Pause / Withdraw. AI agent leads conversation — human DS escalation for complex situations. |
| 6 | Coming Soon | DS | **DS-controlled** | Platform creates task for DS: "Listing Agreement Required." Seller receives acknowledgement modal — confirms deal visible to buyers in Coming Soon state. Listing agreement handled off-platform by DS. DS marks task complete to advance. Buyers can Indicate Interest only — no Request Access. Indicate Interest signals surfaced to DS for Stage 7 seat planning. |
| 7 | Active Disposition | DS | **DS gate (market)** | AI Disposition Engine builds buyer pool, sequences outreach, manages responses, handles Q&A with real-time routing. Max 3 concurrent seats. DS approves every seat — no auto-seating. Question routing: document questions answered by AI, negotiation-adjacent questions routed to human DS, seller-specific questions routed to seller. Soft signal when buyer opens offer form (DS awareness). Hard trigger when buyer submits offer form (DS steps in). |
| 8 | Offer Negotiation | DS | **DS-controlled** | Sealed offer model — buyers cannot see other buyers' amounts or terms. Max 3 rounds. DS sets round deadlines (default 48–72 hours). AI Disposition Engine generates improvement feedback per buyer — human DS reviews and authorizes before delivery. Buyers see own rank and feedback only. Buyer credential profiles visible (experience, deal count, portfolio size, investor type). Seller sees all offers in full. |
| 9 | Accepted Offer | DS | **DS-controlled** | DS confirms winning offer — deal status set to Accepted Offer (distinct from Closed). Competitive phase frozen. Non-winning seated buyers receive anonymized winning summary: "A winning offer has been accepted. The deal is now under contract." DS logs post-acceptance milestones: PSA Executed / Earnest Money Received / Due Diligence Complete / Financing Confirmed / Closed. Deal status updates to Closed when DS marks Closed milestone. |

#### Internal Role Gate Summary

| Stage | Gate Owner | What They Authorize |
|-------|-----------|---------------------|
| 3 | Admin | Completeness — can advance or return |
| 4 | Analyst | Viability — can approve, return to Admin, or reject |
| 6 | DS | Listing agreement status — manual update |
| 7 | DS | Every seat allocation — AI recommends, DS authorizes (max 3 seats) |
| 8 | DS | Every offer round — DS controls sequencing |
| 9 | DS | Winning offer confirmation |

> **Locked Principle:** AI recommends at every layer. Humans authorize at every structural, economic, and market gate.

#### Deal Room Status Model

Deal rooms carry a `status` field separate from `currentStage`. Stage tracks lifecycle position. Status tracks operational state.

| Status | Description | Who Sets It |
|--------|-------------|-------------|
| `active` | Deal is progressing through the 9-stage lifecycle | System on creation; DS on reactivation |
| `accepted_offer` | Winning offer confirmed by DS — competitive phase frozen — post-acceptance milestones in progress | DS |
| `market_tested` | All 3 seats filled, all buyers passed, no offers received, full buyer pool exhausted | DS only |
| `dormant` | Deal paused — stalled documents (21-day rule), seller-elected pause, or post-market-tested with no adjustment | DS or system (21-day rule) |
| `closed` | Deal closed successfully — DS marks Closed milestone in post-acceptance tracker | DS |
| `withdrawn` | Seller withdrew the deal | Seller or DS |

**Status transition rules:**
- `active` → `accepted_offer`: DS confirms winning offer at Stage 9
- `accepted_offer` → `closed`: DS marks Closed milestone in post-acceptance tracker
- `active` → `market_tested`: DS action only — requires buyer pool exhaustion confirmation
- `market_tested` → `active`: Seller elects to adjust pricing or structure — deal re-enters Stage 7
- `market_tested` → `dormant`: Seller declines adjustment or does not respond within follow-up window
- `active` → `dormant`: Document collection stalls past 21-day window (system-triggered) or seller elects to pause
- `dormant` → `active`: DS reactivates on seller request — deal re-enters at appropriate stage
- `active` → `withdrawn`: Seller withdraws at Decision Point or DS closes with no path forward

#### Buyer Pool Exhaustion Rule

When all four conditions are true, the DS marks the deal as Market Tested — No Immediate Demand:

1. All 3 seats have been filled sequentially
2. All seated buyers have formally passed or allowed their underwriting window to expire
3. No written LOIs have been received
4. All eligible matched buyers in the filtered pool have been invited and passed

When Market Tested is reached, the seller is notified and presented with four options: Adjust pricing / Modify structure / Pause (moves to Dormant) / Withdraw. If the seller elects to adjust, the deal re-enters Stage 7.

#### Dormant Status

A deal enters Dormant in three scenarios:
- Document collection stalls — no seller response within 21 days of initial document request (system-triggered)
- Seller elects to pause after Market Tested outcome and declines adjustment
- Seller voluntarily pauses at DS discretion

Dormant behavior: no active buyer exposure, no open seats, deal remains visible in seller's deal room list with Dormant badge, reactivatable at any time via DS on seller request.

#### Post-Acceptance Milestone Tracking (Stage 9)

When DS confirms the winning offer, the deal status moves to `accepted_offer` — not `closed`. Accepted offer and actual closing are distinct events that can be weeks or months apart.

The DS logs five post-acceptance milestones manually in the platform with date stamps. All actual work happens off-platform. This gives Strata operational visibility into pipeline health between acceptance and close without requiring full transaction management infrastructure in MVP.

| Milestone | Set By |
|-----------|--------|
| PSA Executed | DS |
| Earnest Money Received | DS |
| Due Diligence Complete | DS |
| Financing Confirmed | DS |
| Closed | DS |

- Each milestone is a DS-checked event with a date stamp — no workflow, no documents, no automation
- Winning buyer can see milestone progress in their deal room
- Deal status updates to `closed` only when DS marks the Closed milestone
- Full post-acceptance transaction workflow (PSA management, due diligence coordination, financing tracking, title and escrow) is out of scope for MVP — see Post-MVP Backlog

#### Seller Deal Room View
- **Left panel:** Deal Room Chat (AI Disposition Engine + Seller) and Buyer Feedback Loop (real-time buyer comments)
- **Right panel:** Deal Progress tracker (9-stage), Documents (upload and manage), DS card with contact info, Buyer Pool with qualification status

#### Buyer Deal Room View
- **Left panel:** Deal Room Chat (AI Disposition Engine ↔ Buyer) — AI agent welcome message visible on first entry
- **Right panel:** Deal Progress tracker (stages 6–9 only — buyer-visible stages), Documents (read-only), DS card, Buyer Pool (anonymized — "Investor #1042" — own entry highlighted as "You" with seat position and total count e.g. "Seat 2 of 3"), Offers section with submit form

> **Deal Progress Tracker — buyer view:** Buyers see only the four stages relevant to their experience — Stage 6 (Coming Soon), Stage 7 (Active Disposition), Stage 8 (Offer Negotiation), Stage 9 (Accepted Offer). Stages 1–5 (internal review and setup stages) are not shown in the buyer's tracker. Prior stage completions (Stages 1–5) are surfaced to the buyer as notification history or status tags — not as active tracker steps. The seller sees all 9 stages in their tracker.

#### Deal Room Feature Matrix

| Feature | Seller View | Buyer View |
|---------|------------|------------|
| Chat | AI Disposition Engine + Seller | AI Disposition Engine only |
| Documents | Upload & manage | Read-only |
| Buyer Pool | Anonymized investors with credential profiles | Anonymized + self highlighted as "You" + seat position and count |
| Offers | All offers in full — amounts, terms, credential profiles | Own offer only — sealed, gold border. Other buyers visible at credential level only |
| Buyer Feedback | Real-time buyer comments | Not visible |
| Deal Progress tracker | All 9 stages | Stages 6–9 only. Stages 1–5 shown as notification history / status tags |
| Pass on Deal | N/A | Available — structured pass reason required before confirmation |
| Qualification Status | Shown per buyer in pool | Shown for self + others |
| Post-Acceptance Milestones | Not visible | Visible to winning buyer only |

#### Buyer Access Flow (Stages 6–7)

```
Buy Strategy → View Matches → Deal Card CTA States:
  Coming Soon (Stage 6): Preview [active] | Access [disabled]
  Active Disposition (Stage 7): Preview [active] | Access [active — submits request]
    → Access Pending: Preview [active] | Pending [withdrawal available]
      → [Denied] Wait Queue: Preview [active] | Wait Queue
      → [Approved] Success Fee Gate (3% at closing — hard gate)
        → AI Disposition Engine welcome message
          → Active Deal Room (Stage 7)
```

---

### 2.6 Internal Roles — Detailed Responsibilities

#### Admin
- Owns Stage 3 (QA Review) as exception handler only
- AI checklist agent runs the completeness check autonomously — Admin only engages when AI flags an exception
- Reviews AI-flagged document exceptions and completeness issues
- Confirms structural completeness — does not perform financial analysis
- Advances deal to Analyst or returns to seller with documented reason
- Full pipeline visibility across all deals including Market Tested and Dormant
- Manages client and staff assignments

#### Analyst
- Owns Stage 4 (Analyst Review)
- Reviews AI analyst agent-generated financial memos — does not perform analysis from scratch
- Confirms, adjusts, or overrides AI-generated viability flag before any output is communicated to seller
- Three outcomes: Approve — Green flag (pass to Decision Point) / Return to Admin — Yellow flag (insufficient docs) / Reject — Red flag (with reasoning and upsell opportunity)
- Owns the economic gate — no deal moves to Active Disposition without Analyst approval

> **Note on Tier A/B/C:** The SOP Tier A/B/C classification is an internal operating concept only and is not replicated in the platform. Tier A and Tier B both map to Green/Approve. Tier C maps to Red/Reject. Yellow flag routes through Return to Admin.

> **Note on viability flags:** Platform uses Green / Yellow / Red flags in all UI surfaces. Tier A/B/C language does not appear anywhere in the platform.

#### Disposition Specialist (DS)
- Owns Stages 6–9 and post-disposition outcomes (Market Tested, Dormant)
- **Primary role: seller relationship manager, deal negotiator, and offer manager** — not process executor
- Establishes and maintains the seller relationship from deal submission through close
- Communicates QA and Analyst outcomes to the seller
- Routes optimization decisions between seller, Admin, and Analyst
- Manages the Listing Agreement process (Stage 6) — off-platform, marks task complete in platform on execution
- Receives automatic task notifications when deals advance to Stage 6
- Controls seat allocation at Stage 7 — AI Disposition Engine recommends, DS authorizes every seat (max 3 concurrent)
- Reviews Indicate Interest signals from Stage 6 to inform seat allocation decisions
- Steps into buyer-facing process when buyer submits offer form (hard trigger)
- Receives soft signal awareness when buyer opens offer form (no handoff triggered)
- Sets offer round deadlines — default 48 to 72 hours per round, DS discretion to adjust
- Reviews and authorizes all AI Disposition Engine-generated improvement feedback before delivery to buyers
- Controls offer collection, negotiation, and winning offer confirmation (Stages 8–9)
- Logs post-acceptance milestones in platform: PSA Executed / Earnest Money Received / Due Diligence Complete / Financing Confirmed / Closed
- Marks deal as Market Tested when buyer pool exhaustion conditions are met
- Communicates Market Tested outcome to seller and manages reactivation or dormant path
- Reactivates Dormant deals on seller request
- Notified when High intent buyers exceed Day 14 qualification nudge without completing qualification

---

### 2.7 NextLevel AI Agent — Disposition Engine

#### Design Principle

The AI Disposition Engine is the North Star design principle for the platform. The goal is to progressively transfer disposition execution to AI as capabilities are proven — starting with buyer distribution and deal room Q&A in MVP, and expanding from there. The DS is a relationship manager and negotiator. The platform is the execution engine.

#### Two-Layer Model

**Layer 1 — AI Disposition Engine (Platform)**

The AI Disposition Engine runs buyer-facing and seller-facing workflow autonomously across multiple stages. Responsibilities by stage:

**Stage 1 (Seller) / Post-signup (Buyer):**
- Guides seller through deal room creation and Tier 1 + Tier 2 data entry
- Conducts buyer activation conversation — captures intent, assigns High / Medium / Low intent ranking
- Nudges buyer toward strategy creation, then qualification via natural checkpoint

**Stage 2 (Seller):**
- Sets expectations conversationally — explains process, documents needed, timeline
- Guides seller through document upload — flags what is missing

**Stage 3:**
- AI checklist agent identifies deal type, selects appropriate checklist
- Verifies document presence and internal consistency
- Produces structured completeness report
- Auto-advances clean packages — routes exceptions to human Admin

**Stage 4:**
- AI analyst agent ingests verified document package
- Generates financial memo with deal summary, pricing assessment, demand alignment, and recommended viability flag (Green / Yellow / Red)
- Human Analyst reviews and authorizes before any output is communicated

**Stage 5 (Seller):**
- Leads outcome delivery conversation with seller
- Delivers finding in deal room — what was flagged and why
- Specifies changes required on yellow/red outcomes and routes deal back immediately if seller agrees
- Escalates to human DS when seller is resistant, pricing negotiation required, or structural complexity exceeds AI capability

**Stage 6:**
- Sends Indicate Interest confirmation to buyers in Coming Soon state

**Stage 7:**
- Builds qualified buyer pool from matched buy strategies
- Sequences buyer outreach — prioritizing by match quality and qualification score
- Sends outbound outreach via email and SMS
- Manages buyer responses — pass or request access — without human DS involvement
- Handles all deal room Q&A with real-time routing decisions:
    - Document retrieval questions — answered directly by AI
    - Negotiation-adjacent or market judgment questions — routed to human DS
    - Seller-specific questions — routed to seller
- Sends queue transparency message to buyers in Access Pending state
- Sends structured denial message to buyers denied a seat
- Delivers deal room entry welcome message to newly seated buyers
- Collects and structures buyer feedback in real time

**Stage 8:**
- Generates structured improvement feedback for each buyer after every offer round
- Human DS reviews and authorizes all feedback before delivery to buyers

**Stage 9:**
- Sends congratulatory message to winning buyer
- Sends structured outcome message to non-winning buyers: "A winning offer has been accepted. The deal is now under contract."
- Sends Market Tested notification to seated buyers when DS marks deal as Market Tested
- Sends Dormant notification to buyers when deal becomes inactive

> 🚫 **BUILD BLOCKER — AI Chat Script Spec required:** The question routing logic for Stage 7 buyer Q&A — what the AI answers directly, what it routes to the human DS, and what it routes to the seller — must be fully defined in the AI Chat Script Spec before Stage 7 and buyer Stage 6 can be implemented. Frontend components can be built independently. AI routing behavior cannot be implemented until the spec exists.

**Layer 2 — Disposition Specialist (Human)**

The DS owns the seller relationship and negotiation layer throughout. See Section 2.6 for full DS responsibilities.

#### Handoff Trigger — AI to Human

**Soft signal:** Buyer opens offer form inside the deal room — DS receives awareness notification. No handoff triggered.

**Hard trigger:** Buyer submits completed offer form — DS is formally notified and steps into the buyer-facing process. This is the explicit, logged handoff point.

**Stage 5 escalation:** AI agent leads seller outcome conversation. Escalates to human DS when seller is resistant, situation requires pricing negotiation, structural complexity exceeds agent capability, or seller explicitly requests a human. Handoff is transparent — seller is informed when DS is stepping in.

#### Authorization Boundary

| Gate | Owner | What They Authorize |
|------|-------|---------------------|
| Stage 3 | Admin | Document completeness — exception handling only |
| Stage 4 | Analyst | Deal viability — reviews and authorizes AI-generated memo |
| Stage 6 | DS | Listing agreement status — task completion |
| Stage 7 | DS | Every seat allocation — AI sequences and recommends, DS authorizes (max 3 seats) |
| Stage 8 | DS | Every offer round — sets deadlines, authorizes AI-generated feedback |
| Stage 9 | DS | Winning offer confirmation — logs post-acceptance milestones |
| Market Tested | DS | Buyer pool exhaustion declaration and seller path selection |
| Dormant | DS | Reactivation on seller request |

> The AI Disposition Engine does not authorize anything. It executes, routes, and recommends. Humans authorize at every gate.

#### Progressive AI Expansion — Roadmap

| Phase | AI Responsibility | Human Role |
|-------|------------------|------------|
| MVP | Buyer outreach, sequencing, deal room Q&A, feedback collection, seller outcome delivery, buyer communications | DS owns seller relationship, seat approval, offer round management, all negotiation |
| Phase 2 | AI-assisted seat recommendation with DS override | DS approves every seat but AI does the ranking work |
| Phase 3 | AI handles offer round sequencing and buyer feedback during negotiation | DS reviews and authorizes each round |
| Phase 4 | Full AI disposition with DS as exception handler and relationship owner | DS intervenes only for complex negotiations and escalations |

No phase skips human authorization at the gate level.

---

### 2.8 Offer System

Buyers submit structured offers within active deal rooms during Stage 8 (Offer Negotiation).

| Field | Example |
|-------|---------|
| Offer Amount | $11.2M |
| Financing | All Cash, 70/30 LTV |
| Close Timeline | 30-day close |
| Due Diligence Period | 15-day DD |
| Additional Terms | No contingencies, As-is |

#### Offer Visibility — Sealed Model

- **Offers are sealed** — buyers cannot see other buyers' offer amounts or terms at any point during negotiation
- Seller sees all offers in full — amounts, terms, and buyer credential profiles
- Buyers can view other buyers in the pool at credential level only — no offer details visible

#### Buyer Credential Profile (Visible to All Participants — No Identity or Offer Details)

| Field | Description |
|-------|-------------|
| Experience level | Years in market |
| Deals completed | Number of historical acquisitions |
| Portfolio size range | Broad range — not exact figure |
| Investor type | Institutional fund / Family office / Private operator / Home builder |

#### Round Structure

- Maximum 3 offer rounds — firm platform rule, no exceptions
- DS sets round deadline per round — default 48 to 72 hours, DS discretion to adjust
- Buyers can submit an improved offer in each subsequent round
- Buyers are not required to improve — existing offer stands
- If no offer submitted in any round — buyer is treated as having passed
- After Round 3 — no further offers accepted, DS advances to Stage 9

#### Improvement Feedback

- AI Disposition Engine generates structured improvement feedback for each buyer after every round
- Based on buyer's ranking and deal criteria
- Human DS reviews and authorizes all feedback before delivery
- Buyers receive own rank and specific feedback only — no visibility into competitors' positions
- Self-submitted offers highlighted with gold border

---

### 2.9 Credits & Monetization

| Revenue Stream | Details |
|----------------|---------|
| **Seller Credits** | 400 free credits on first deal room; additional credits at $100 each — charged at deal room activation |
| **Buyer Success Fee** | 3% of gross purchase price, due at closing — no fee if deal does not close — acknowledged before entering active deal room via success fee gate modal |

> **Upgrade and credit nudge timing:** Upgrade and credit top-up prompts surface at Stage 5 only when the deal has reached a Green (viable) outcome. Presenting monetization nudges before a deal reaches viability is not appropriate. The upgrade and credit prompts are part of the natural activation path toward listing — not a standalone upsell moment.

---

### 2.10 Notification System

Seller and Buyer notifications are configured independently.

| Option | Description |
|--------|-------------|
| Real Time | Instant notifications |
| Every X Hours | Configurable 1–24 hours |
| Every X Days | Configurable 1–30 days |
| Weekly | Once per week digest |

---

### 2.11 Market Intelligence Engine

The Market Intelligence Engine captures structured buyer behavior and feedback during the disposition process and converts it into actionable intelligence for the DS and seller. It is an active output system — not a passive data layer — with defined surfaces in the DS portal and the seller deal room view.

#### When Intelligence Is Captured

- **When a buyer passes** — Pass Reason (structured, required) + Buyer Feedback (free text, optional)
- **Continuously during disposition** — Buyer Intelligence Metrics updated in real time

#### Pass Reason Field

Required before a pass is confirmed. Single Select:
Pricing / Location / Asset Type / Stage or Timing / Deal Size / Strategy Fit / Need More Information / Other

#### Buyer Feedback Field

Free text. Optional for buyer. DS can add or edit on behalf of buyer.

#### Buyer Intelligence Metrics (Per Deal)

Tracked automatically. Surfaced to DS in deal room management view and to seller in Market Intelligence Panel (Stage 7+):

- Buyers invited
- Buyers who opened the deal room
- Buyers who passed (with Pass Reason breakdown by category)
- Information requests submitted
- Offers submitted

#### Market Intelligence Summary

Free-text field authored by DS after reviewing buyer feedback. Surfaced to seller as the official market feedback narrative. DS-only write access.

#### Market Tested Outcome Flag

Set by DS when all buyer pool exhaustion conditions are met. Triggers seller notification and path selection (Adjust / Pause / Withdraw).

#### Output Surfaces

| Output | Surface | Audience |
|--------|---------|----------|
| Pass Reason breakdown | DS Market Intelligence View (per deal) | DS only |
| Buyer Intelligence Metrics | DS Market Intelligence View + Seller Market Intelligence Panel | DS + Seller (Stage 7+) |
| Market Intelligence Summary | Seller Deal Room — Market Intelligence Panel | DS + Seller |
| Market Tested Outcome notice | Seller Deal Room — MarketTestedBanner | DS + Seller |

#### Output Use Cases

1. **Seller reporting** — seller sees normalized buyer feedback, not raw buyer comments
2. **Market-tested outcome reporting** — formal summary when buyer pool is exhausted
3. **Internal pricing guidance** — DS uses pass reason data to advise seller on adjustments before relaunch
4. **Buyer matching refinement** — pass patterns over time inform future AI matching recommendations (Phase 2+)

---

### 2.12 Deal Preview Modal

The Deal Preview Modal surfaces limited deal information to buyers before they are seated, and to sellers as a read-only confirmation view before their deal goes live.

#### Buyer View (Pre-Seated)

Triggered from a deal card on the Buyer Matches screen (`/buyer-matches/:strategyId`). Opens as a modal overlay.

**Visible fields:**
- Asset type + sub-type
- Geography (MSA level)
- Deal stage
- Match score (ring visualization)
- Price — blurred/teased. Visual signal that pricing exists; exact figure gated until seated.

**Action available inside the modal:**
- "Request Access" CTA — submits access request without closing the modal; transitions deal card to Access Pending state

**Not visible:** Docs, financials, buyer pool, deal room content. All gated behind seating.

#### Seller View (Stage 5+ — Confirmation Only)

Available from the seller's deal room view once a deal reaches Stage 5 (Decision Point). Allows the seller to see exactly what buyers will see before the deal goes live.

**Visible fields:** Same as buyer view — asset type/sub-type, geography, deal stage, match score, blurred price.

**Read-only.** No editing from this view. All deal edits go through the deal room build flow, not the preview.

**Purpose:** Seller confidence and confirmation before go-live. Not an editing surface.

#### Component Reference

| Component | Location | Notes |
|-----------|----------|-------|
| `DealPreviewModal` | `src/components/DealPreviewModal.tsx` | Shared by buyer and seller views. `viewerRole` prop controls CTA visibility and read-only state. |

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

The `status` field on `deal_rooms` uses the following locked enum:

```typescript
// shared/types/enums.ts

export type DealRoomStatus =
  | 'active'          // progressing through 9-stage lifecycle
  | 'accepted_offer'  // winning offer confirmed by DS — competitive phase frozen — milestones in progress
  | 'market_tested'   // all 3 seats exhausted, no offers received, full buyer pool passed
  | 'dormant'         // paused — stalled docs, seller pause, or post-market-tested
  | 'closed'          // DS marks Closed milestone in post-acceptance tracker
  | 'withdrawn';      // seller withdrew deal
```

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

| Status | Color Intent |
|--------|-------------|
| Active / Broadcasting | Green — deal is live and progressing |
| Accepted Offer | Blue — deal under contract, competitive phase frozen |
| Market Tested | Amber — signals action required from seller |
| Dormant | Gray — de-emphasized, deal is paused |
| Closed | Muted green — successfully closed |
| Withdrawn | Muted red — deal removed |

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

| Term | Definition |
|------|------------|
| **Deal Preview Modal** | The limited-visibility modal surfaced to buyers on the Buyer Matches screen before they are seated. Shows asset type/sub-type, geography, deal stage, match score, and blurred price. Contains the Request Access CTA. Also available to sellers from Stage 5 onward as a read-only confirmation of what buyers will see. |
| **Buyer-Seller** | The unified external user type — any investor, builder, developer, operator, or broker who buys and/or sells investment real estate on the platform |
| **Buy Strategy** | A persistent buyer acquisition profile defining target criteria — broadcasts against deal rooms to generate matches |
| **Deal Room** | A temporary, single-asset transaction workspace created for one deal and disposed of at close |
| **Shared Deal Criteria** | Universal fields that apply to every deal room and every buyer strategy regardless of asset type — Asset Category, Geography, Deal Stage, Size, Pricing Posture |
| **Unique Deal Criteria** | Asset-specific fields organized across two tiers. Tier 2 (Sub-Type Group) = hard matching fields shared across a group of sub-types (e.g., Unit Count Range and Cap Rate apply to SFR/BFR/MF together) — no alignment blocks visibility. Tier 3 (Unique) = sub-type specific refinement fields — affect ranking and DS seat allocation only, never block visibility. |
| **Three-Tier Data Architecture** | The locked matching architecture: Tier 1 (Universal/Shared Deal Criteria — hard match), Tier 2 (Sub-Type Group Shared — hard match), Tier 3 (Unique/sub-type specific — soft match, refinement only). Internal engineering concept — external UI labels remain Shared Deal Criteria and Unique Deal Criteria. |
| **Firm Type** | A buyer qualification field capturing what kind of operator the buyer represents — Solo Investor / Builder / Land Developer / Operator / Sponsor / Capital Allocator / Other. Distinct from platform role (Buyer/Seller/Both/Broker). Does not feed the matching engine. Used by DS for seat allocation context. |
| **Market Intelligence Engine** | The platform system that captures structured buyer behavior and feedback during disposition — Pass Reasons, Buyer Feedback, Buyer Intelligence Metrics, Market Intelligence Summary — and surfaces it to the DS and seller as actionable intelligence. |
| **Seat** | One of the 3 concurrent buyer positions available in an Active Disposition deal room — controlled by DS |
| **Market Tested** | Formal deal status reached when all 3 seats have been exhausted, all eligible buyers have passed, and no offers were received. Seller must choose to adjust, pause, or withdraw. |
| **Dormant** | Paused deal status — no active buyer exposure, no open seats. Triggered by stalled documents (21-day rule), seller-elected pause, or post-Market Tested inaction. Reactivatable by DS on seller request. |
| **Buyer Pool Exhaustion** | The condition where all 3 seats have been filled sequentially, all seated buyers have passed or expired, and all eligible matched buyers in the pipeline have been invited and passed |
| **Disposition Specialist (DS)** | Strata's internal execution role — owns Stages 6–9 and post-disposition outcomes, controls seat allocation and offer rounds |
| **NextLevel AI / AI Disposition Engine** | The AI agent that runs the buyer-facing disposition workflow autonomously — outreach, sequencing, deal room Q&A, question routing, feedback collection. DS steps in at buyer intent to offer. |
| **Match Score** | 0–100% alignment metric between a buyer's strategy and a seller's deal room based on Shared and Unique Deal Criteria |
| **Broadcasting** | Active state where a buy strategy is matching against new deal rooms |
| **Buyer Qualification** | User-level Fields of Truth capturing a buyer's execution credibility — capital, experience, approval process. Does not feed matching. Used by DS for seat allocation. |
| **Fields of Truth** | Qualification data intrinsic to a buyer — slow-changing, organization-driven, stored at the user level |
| **Success Fee** | 3% of gross purchase price paid by the buyer to NextLevel upon closing — no fee if deal does not close |
| **Credits** | Platform currency used by sellers to activate deal room features — 400 free on first deal room, $100 each thereafter |
| **Dispo** | Short for disposition — the process of marketing and selling a property through the platform |
