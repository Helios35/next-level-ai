# Strata NextLevel — Taxonomy

> **Version:** 1.0
> **Last Updated:** April 2026
> **Status:** Active — Source of Truth
>
> **Purpose:** Single source of truth for every classification system in the NextLevel platform. Every category, status, label, type, and tag — defined once. All other documents reference this doc. When a term, label, or value is defined here, it is not re-defined elsewhere.

---

## Classification Systems Index

1. [Platform Terminology](#1-platform-terminology) — Listing, Deal, Deal Room
2. [User Roles](#2-user-roles) — External and internal role types
3. [Platform Roles (Onboarding)](#3-platform-roles-onboarding) — Buyer / Seller / Both / Broker
4. [Firm Types](#4-firm-types) — Buyer qualification operator classification
5. [Buyer Intent Ranking](#5-buyer-intent-ranking) — High / Medium / Low
6. [Buy Strategy States](#6-buy-strategy-states) — Broadcasting / Paused / Draft
7. [Deal Card CTA States](#7-deal-card-cta-states) — Buyer-facing deal card action states
8. [Deal Lifecycle Stages](#8-deal-lifecycle-stages) — The 9-stage deal progression
9. [Deal Room Status](#9-deal-room-status) — Operational state of a deal room
10. [Buyer Funnel Status](#10-buyer-funnel-status) — A buyer's position relative to a deal room
11. [Analyst Viability Outcomes](#11-analyst-viability-outcomes) — Stage 4 determination values
12. [Qualification Status](#12-qualification-status) — Buyer qualification completion state
13. [Stat Labels by Mode](#13-stat-labels-by-mode) — UI display labels for platform stats
14. [Naming Conventions](#14-naming-conventions) — Casing, format, and consistency rules

---

## 1. Platform Terminology

**Purpose:** Defines the three core nouns of the platform and which audience uses each. These terms govern all UI copy, documentation, and code comments. They are not interchangeable.

| Term | Definition | Audience |
|------|------------|----------|
| **Listing** | The asset a seller submits for disposition. Sellers create, manage, and track listings. | Sellers only |
| **Deal** | Buyer-facing language for what they discover and access. Buyers discover deals, request access to deals, and participate in deal rooms. | Buyers only |
| **Deal Room** | The temporary transaction workspace created around a listing. Both sellers and buyers operate inside a deal room. | Both |

**Rules:**
- Seller-facing UI always uses **"Listing"** — never "Deal" for the thing they created
- Buyer-facing UI always uses **"Deal"** or **"Deal Room"** — never "Listing"
- Internal code object type remains `listing` for the seller-side entity — this is intentional and does not change
- Both sellers and buyers enter and use the **Deal Room** — the term is shared

**Label-to-Database Mapping:**

| UI Label | Database Object | Notes |
|----------|----------------|-------|
| Listing | `listing` / `deal_rooms` table | Seller-facing label for the same underlying `deal_rooms` record |
| Deal | `deal_rooms` table | Buyer-facing label for the same record |
| Deal Room | `deal_rooms` table | Shared label once both parties are inside |

---

## 2. User Roles

**Purpose:** Defines every user type in the platform, their category, and what they own.

### 2.1 External Roles

| Role | Description | Access Surface |
|------|-------------|---------------|
| **Buyer-Seller** | All external users — investors, builders, developers, operators, brokers. One account. Can act as buyer, seller, or both. | External interface — three-mode shell (Sell / Buy / Strategy) |

> Broker is not a separate external role. Users who select "Broker" at onboarding follow the Buyer-Seller path. Broker flag is stored silently for future use — no effect on V1 experience.

### 2.2 Internal Roles

| Role | Portal | Owns |
|------|--------|------|
| **Admin** | `/admin` | Stage 3 — document completeness QA. Can advance to Analyst or return to seller. Only role that can provision internal accounts. |
| **Analyst** | `/analyst` | Stage 4 — financial analysis and viability determination. Can approve, return to Admin, or reject. |
| **Disposition Specialist (DS)** | `/ds` | Stages 6–9 — deal execution, seat allocation, offer rounds, seller relationship, post-disposition milestones. Represented externally as "NextLevel AI" in MVP. |

> The Acquisition Expert role is eliminated. Its functions are absorbed into Admin (document tracking), Analyst (strategy refinement and market intelligence), and DS (buyer relationship management).

---

## 3. Platform Roles (Onboarding)

**Purpose:** The role a user selects at onboarding. Determines which interface surfaces the user sees post-login. Distinct from Firm Type (see Section 4).

| Value | DB Value | Description | Effect |
|-------|----------|-------------|--------|
| **Buyer** | `buyer` | User intends to acquire assets | Buyer onboarding path — strategy creation first |
| **Seller** | `seller` | User intends to sell assets | Seller onboarding path — deal room creation |
| **Both** | `both` | User acts as buyer and seller | Both paths available — strategy + deal room creation |
| **Broker** | `broker` | User is a broker | Stored silently — follows Buyer path in V1 |

**Rules:**
- Pick-one — a user selects one value at onboarding
- Broker flag stored in `broker_flag` field — no separate UI path in V1
- This field determines interface routing only — it does not feed the matching engine

---

## 4. Firm Types

**Purpose:** Captures what kind of operator the buyer represents. A buyer qualification field — not a platform role. Used by the DS for seat allocation context. Does not feed the matching engine.

| Value | DB Value | Description |
|-------|----------|-------------|
| **Solo Investor** | `solo_investor` | Individual investor operating independently |
| **Builder** | `builder` | Developer focused on new construction |
| **Land Developer** | `land_developer` | Focused on land acquisition and entitlement |
| **Operator** | `operator` | Owns and operates income-producing properties |
| **Sponsor** | `sponsor` | Raises capital from LPs to acquire assets |
| **Capital Allocator** | `capital_allocator` | Deploys institutional or fund capital |
| **Other** | `other` | Does not fit a defined category |

**Rules:**
- Captured in Buyer Qualification Section A — not at onboarding
- Distinct from Platform Role (Section 3) — a user's platform role and firm type are independent
- Pick-one per buyer profile
- Used by DS during seat allocation review — visible in the buyer queue
- DS can see Firm Type but cannot change it — buyer-owned field

---

## 5. Buyer Intent Ranking

**Purpose:** An AI-assigned signal capturing how actively a buyer is deploying capital. Assigned during the post-signup AI activation conversation. Used by the DS for seat allocation prioritization and follow-up decisions.

| Value | DB Value | Description |
|-------|----------|-------------|
| **High** | `high` | Actively deploying capital, clear strategy, fast decision process |
| **Medium** | `medium` | Interested but slower decision process or unclear timing |
| **Low** | `low` | Exploratory or long acquisition timeline |

**Rules:**
- Assigned by AI agent during buyer activation conversation — not self-reported
- Stored on the buyer's profile — one value per user
- Visible to DS in buyer queue and buyer profile view
- DS uses ranking to prioritize seat allocation and follow-up decisions
- If a buyer with High intent has not completed qualification after 14 days, DS is notified directly
- Can be updated by AI agent on subsequent conversations if buyer behavior signals a change

---

## 6. Buy Strategy States

**Purpose:** Tracks the operational state of a buyer's acquisition strategy.

| Value | DB Value | Description | UI Signal |
|-------|----------|-------------|-----------|
| **Broadcasting** | `broadcasting` | Strategy is active and matching against deal rooms | Green status dot |
| **Paused** | `paused` | Temporarily inactive — not matching | Amber status dot |
| **Draft** | `draft` | Incomplete — not yet broadcasting | No dot — draft indicator |

**Rules:**
- A strategy must complete Tier 1 and Tier 2 criteria before it can move from Draft to Broadcasting
- Buyer can toggle between Broadcasting and Paused at any time
- Draft strategies are visible only to the buyer — not surfaced to DS or matching engine
- A buyer can have multiple strategies simultaneously

---

## 7. Deal Card CTA States

**Purpose:** Defines the buyer-facing action states on deal cards in the Discover Deals view. Each state controls which CTAs are active or disabled.

| State | Preview CTA | Action CTA | Description |
|-------|-------------|------------|-------------|
| **Coming Soon** | Active — opens Deal Preview Modal | Disabled — grayed out | Deal is in Stage 6. Buyers can preview but not request access. |
| **Active Disposition** | Active — opens Deal Preview Modal | "Access" — active, submits request | Deal is in Stage 7. Buyers can request access. |
| **Access Pending** | Active | "Pending" — withdrawal available | Buyer has requested access, DS is reviewing |
| **Wait Queue** | Active | "Wait Queue" | DS denied the seat — buyer placed in queue |
| **Access Granted** | Active | "Enter Deal Room" | DS approved the seat — buyer can enter |

**Rules:**
- These states live on the buyer's relationship to a deal — not on the deal itself
- A deal can show different CTA states to different buyers simultaneously
- "Access" CTA submits the request directly from the card or from inside the Deal Preview Modal — both routes produce the same outcome

---

## 8. Deal Lifecycle Stages

**Purpose:** The 9-stage lifecycle every deal progresses through. Stage tracks where in the process a deal is. Distinct from Deal Room Status (Section 9), which tracks operational state.

| Stage | Name | Owner | Description |
|-------|------|-------|-------------|
| **1** | Intake | Seller / AI | Seller submits listing data. AI agent guides Tier 1 + Tier 2 entry (mandatory). Tier 3 nudged (optional). Ownership acknowledgment is a hard gate before submission. |
| **2** | Submission Review | System | Seller completes submission. Deal sent for internal review. |
| **3** | QA Review | Admin | Admin reviews document completeness. AI completeness agent runs first. Admin reviews exceptions. Can advance to Stage 4 or return to seller (Stage 2). Return requires documented notes. |
| **4** | Financial Analysis | Analyst | Analyst reviews AI-generated financial memo. Determines viability. Can approve (→ Stage 5), return to Admin, or reject. All decisions are irreversible. |
| **5** | Decision Point | Seller / DS | Seller presented with options based on Analyst outcome. Green: proceed, pause, or withdraw. Yellow/Red: request changes, optimize, pause, or withdraw. AI agent leads conversation — DS escalates for complex situations. |
| **6** | Coming Soon | DS | Deal is visible to buyers in preview-only mode. Buyers can indicate interest — no access requests yet. DS handles listing agreement off-platform and marks task complete to advance. |
| **7** | Active Disposition | DS / AI | AI Disposition Engine manages buyer outreach, Q&A, and feedback autonomously. DS approves every seat (max 3 — no auto-seating). DS steps in when buyer submits offer form. |
| **8** | Offer Negotiation | DS | Sealed offer model. Maximum 3 rounds. DS sets round deadlines. AI generates buyer feedback — DS authorizes before delivery. DS and seller see all offers in full. Buyers see own offer only. |
| **9** | Accepted Offer | DS | DS confirms winning offer. Deal status moves to `accepted_offer`. Competitive phase frozen. DS logs post-acceptance milestones through to close. |

**Rules:**
- Stages 2–4 are bidirectional — a deal can be returned to a previous stage
- Every return requires documented notes — no undocumented stage reversals
- Stages 1–5 are internal review and setup stages — not surfaced in the buyer's deal progress tracker
- Buyers see only Stages 6–9 in their deal progress tracker
- Sellers see all 9 stages in their deal progress tracker

**Buyer-Facing Stage Labels (Stages 6–9 only):**

| Stage | Buyer-Facing Label |
|-------|--------------------|
| 6 | Coming Soon |
| 7 | Active Disposition |
| 8 | Offer Negotiation |
| 9 | Accepted Offer |

---

## 9. Deal Room Status

**Purpose:** Tracks the operational state of a deal room — separate from stage. Stage = where in the process. Status = is the deal alive, paused, or closed.

| Value | DB Value | Description | Who Sets It |
|-------|----------|-------------|-------------|
| **Active** | `active` | Deal is progressing through the 9-stage lifecycle | System on creation; DS on reactivation |
| **Accepted Offer** | `accepted_offer` | Winning offer confirmed by DS — competitive phase frozen — post-acceptance milestones in progress | DS |
| **Market Tested** | `market_tested` | All 3 seats exhausted, all buyers passed, no offers received, full buyer pool exhausted | DS only |
| **Dormant** | `dormant` | Deal paused — stalled documents (21-day rule), seller-elected pause, or post-Market Tested with no adjustment | DS or system (21-day rule trigger) |
| **Closed** | `closed` | Deal closed successfully — DS marks Closed milestone in post-acceptance tracker | DS |
| **Withdrawn** | `withdrawn` | Seller withdrew the deal | Seller or DS |

**Status Transition Rules:**

| From | To | Trigger |
|------|----|---------|
| `active` | `accepted_offer` | DS confirms winning offer at Stage 9 |
| `accepted_offer` | `closed` | DS marks Closed milestone in post-acceptance tracker |
| `active` | `market_tested` | DS action only — requires all 4 buyer pool exhaustion conditions met |
| `market_tested` | `active` | Seller elects to adjust pricing or structure — deal re-enters Stage 7 |
| `market_tested` | `dormant` | Seller declines adjustment or does not respond within follow-up window |
| `active` | `dormant` | Document collection stalls past 21-day window (system-triggered) OR seller elects to pause |
| `dormant` | `active` | DS reactivates on seller request — deal re-enters at appropriate stage |
| `active` | `withdrawn` | Seller withdraws at Decision Point (Stage 5) or DS closes with no path forward |

**Terminal Values:** `closed` and `withdrawn` are terminal — once set, they do not transition to any other status.

**Buyer Pool Exhaustion — Required Before DS Can Set `market_tested`:**
All four conditions must be true:
1. All 3 seats have been filled sequentially
2. All seated buyers have formally passed or allowed their underwriting window to expire
3. No written LOIs have been received
4. All eligible matched buyers in the filtered pool have been invited and passed

**Label-to-Database Mapping:**

| UI Label | DB Value | Badge Color Intent |
|----------|----------|--------------------|
| Active | `active` | Green |
| Accepted Offer | `accepted_offer` | Blue |
| Market Tested | `market_tested` | Amber |
| Dormant | `dormant` | Gray |
| Closed | `closed` | Muted green |
| Withdrawn | `withdrawn` | Muted red |

---

## 10. Buyer Funnel Status

**Purpose:** Tracks a specific buyer's position relative to a specific deal room. A buyer can be in different funnel positions across different deals simultaneously.

| Value | DB Value | Description |
|-------|----------|-------------|
| **Buyer Pool** | `buyer_pool` | Buyer has been matched to the deal but has not been invited or requested access |
| **Invited** | `invited` | DS has sent the buyer a direct invite to the deal room |
| **Accepted** | `accepted` | Buyer has accepted the invite or been approved by DS — seat is confirmed |
| **Seated** | `seated` | Buyer is actively in the deal room |
| **Passed** | `passed` | Buyer declined or formally passed on the deal |
| **Pending** | `pending` | Buyer has requested access — awaiting DS review |

**Funnel Order:**
```
Buyer Pool → Invited → Pending → Accepted → Seated
                                           → Passed
```

**Rules:**
- A buyer can hold one funnel status per deal room at a time
- Maximum 3 buyers can be in `seated` status in any single deal room simultaneously
- DS-invited buyers in `pending` take priority over self-requested buyers in `pending` when a seat opens
- `passed` is a terminal state for that deal — a passed buyer is not re-seated in the same deal room

---

## 11. Analyst Viability Outcomes

**Purpose:** The three possible outcomes an Analyst can assign at Stage 4 financial review. These outcomes determine what options the seller is presented with at Stage 5.

| Value | DB Value | Description | Stage 5 Effect |
|-------|----------|-------------|----------------|
| **Approve** | `approved` | Deal is financially viable — proceed | Seller presented with: Proceed to Listing Agreement / Upgrade or Top Up Credits / Pause / Withdraw |
| **Return to Admin** | `return_to_admin` | Deal needs additional document or admin review | Deal returns to Stage 3 — Admin re-reviews |
| **Reject** | `rejected` | Deal is not viable in current form | Seller notified with reasoning — upsell opportunity surfaced |

**Rules:**
- All three outcomes are irreversible — once the Analyst submits, the decision cannot be undone
- Analyst decisions require a confirmation modal before submission
- **Tier A / B / C language does not appear in any platform UI** — it is internal SOP only. Platform-facing language uses Approve / Return to Admin / Reject exclusively.
- The AI Disposition Engine viability flags use Green / Yellow / Red internally — these map to the Analyst outcomes but are not shown in the platform UI

**Internal-to-Platform Label Mapping (for engineering reference):**

| Internal SOP Label | Platform UI Label | DB Value |
|--------------------|-------------------|----------|
| Tier A / Green | Approve | `approved` |
| Tier B / Yellow | Return to Admin | `return_to_admin` |
| Tier C / Red | Reject | `rejected` |

---

## 12. Qualification Status

**Purpose:** Tracks whether a buyer has completed the qualification process. Visible to DS during buyer queue review and seat allocation decisions.

| Value | DB Value | Description |
|-------|----------|-------------|
| **Qualified** | `qualified` | Buyer has completed all qualification fields |
| **Not Qualified** | `not_qualified` | Buyer has not completed qualification |

**Rules:**
- Displayed as a badge in the buyer pool within a deal room
- Does not block deal room access — qualification is a soft gate only
- Qualified buyers are ranked higher by DS for seat allocation
- Unqualified buyers can receive matches and request access — ranked lower, may be excluded from seats
- DS can see qualification status and last-updated timestamp for every buyer in their queue

---

## 13. Stat Labels by Mode

**Purpose:** The exact display labels for platform stats, organized by interface mode and audience. These labels are audience-specific and must not be swapped.

### Seller Mode Stats

| Stat | Label | Where Shown |
|------|-------|-------------|
| Deal rooms currently active | Listings Open | Your Listings page — stats row |
| Deal rooms initiated | Listings Started | Your Listings page — stats row |
| Deal rooms cancelled | Listings Cancelled | Your Listings page — stats row |
| Deal rooms successfully closed | Listings Closed | Your Listings page — stats row |

### Buyer Mode Stats

| Stat | Label | Where Shown |
|------|-------|-------------|
| Deal rooms buyer has entered | Deals Accessed | Your Deals page — stats row |
| Offers submitted by buyer | Offers Made | Your Deals page — stats row |
| Deals where buyer's offer was accepted | Deals Won | Your Deals page — stats row |

### Profile Page Stats

| Audience | Stat | Label |
|----------|------|-------|
| Seller | Rooms active | Deal Rooms Open |
| Seller | Rooms initiated | Dispos Started |
| Seller | Rooms cancelled | Deals Canceled |
| Seller | Rooms closed | Deals Closed |
| Buyer | Rooms accessed | Deal Rooms Accessed |
| Buyer | Offers submitted | Offers Made |
| Buyer | Accepted offers | Deals Won |

### Strategy Mode Stats

| Stat | Label | Where Shown |
|------|-------|-------------|
| Total matches across all strategies | Total Matches | Your Strategies page — stats row |
| Unique MSAs covered by active strategies | Markets Covered | Your Strategies page — stats row |

---

## 14. Naming Conventions

**Purpose:** Consistency rules for how things are named across the platform — UI labels, database values, code, and documentation.

### Casing Rules

| Context | Convention | Example |
|---------|------------|---------|
| UI labels — display text | Title Case | "Active Disposition", "Deal Room", "Buyer Pool" |
| Database values / enums | `snake_case` | `active`, `market_tested`, `accepted_offer` |
| TypeScript types / interfaces | `PascalCase` | `DealRoomStatus`, `BuyerFunnelStatus` |
| React component names | `PascalCase` | `DealPreviewModal`, `MatchScoreRing` |
| Route paths | `kebab-case` | `/buyer-matches`, `/seller-deal-room` |
| CSS variables | `kebab-case` with `--` prefix | `--primary`, `--accent` |

### Singular vs. Plural

| Term | Singular | Plural |
|------|----------|--------|
| Listing | Listing | Listings |
| Deal Room | Deal Room | Deal Rooms |
| Deal | Deal | Deals |
| Strategy | Strategy | Strategies |
| Seat | Seat | Seats |

### Reserved Terms — Do Not Use Interchangeably

| Use This | Not This | Context |
|----------|----------|---------|
| Shared Deal Criteria | Spine | Internal field grouping — "Spine" is deprecated |
| Unique Deal Criteria | Module fields | Internal field grouping — "Module fields" is deprecated |
| Listing | Deal (seller context) | Seller-facing UI only |
| Deal | Listing (buyer context) | Buyer-facing UI only |
| Disposition Specialist / DS | Acquisition Expert | Acquisition Expert role is eliminated |

---

*Last updated: April 2026*
