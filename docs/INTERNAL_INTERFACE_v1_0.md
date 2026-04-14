# NextLevel — Internal Interface Specification
**Version:** 1.0
**Date:** April 2026
**Author:** Nate / Next Sketch LLC
**Status:** Draft — pending review before adding to `docs/`

---

## Change Log

| Version | Date | Change |
|---------|------|--------|
| 1.0 | April 2026 | Initial document — DS, Analyst, Admin portal specs |

---

## Document Scope

This document is the canonical spec for the internal team interface — the portals used by the Disposition Specialist (DS), Analyst, and Admin roles. It covers shell structure, nav design, page-level layouts, component patterns, and locked UI decisions for each role.

**What this document does not duplicate:**
- Business logic, rules, and if/then conditions → `BUSINESS_RULES_v1_0.md`
- Route map (canonical component names and paths) → `SITE_ARCHITECTURE_v1_6.md`
- Core product decisions and role responsibilities → `PRODUCT_REQUIREMENTS_v2_0.md`
- Tier field definitions → `TIER_DATA_BREAKDOWN.md`

**Pointer rule:** When logic is referenced here, the source document is authoritative. This spec defines how the logic surfaces in the UI — not what the logic is.

---

## Section 1 — Shared Internal Shell

### 1.1 Separation from External Interface

Internal portals are fully separate from the external user interface. They do not share routes, login, or navigation with the buyer/seller shell.

- External users access via `/` (landing) and `/auth`
- Internal users access via `/internal/login` — role-based routing on authentication
- No external user has visibility into or access to any `/ds`, `/analyst`, or `/admin` route
- The internal shell uses the same visual foundation as the external shell (same component library, same Tailwind/shadcn primitives) with a distinct nav structure and internal accent color

### 1.2 Internal Accent

Internal portals use a **neutral/slate** accent to visually distinguish them from the external interface. Exact color token TBD pending branding docs. Placeholder: use `slate-600` / `slate-500` for all accent elements until the branding sprint runs.

The mode-specific accent system (`mode-sell`, `mode-buy`, `mode-strategy`) does not apply inside internal portals.

### 1.3 Internal Login

**Route:** `/internal/login`
**Component:** `InternalLogin`

- Email + password login only. No sign-up surface — accounts are provisioned by Admin only.
- On successful auth, routing is role-based:
  - DS → `/ds/tasks`
  - Analyst → `/analyst`
  - Admin → `/admin`
- Failed auth: standard error state. No account recovery flow in MVP — handled off-platform.

### 1.4 Shell Layout

All three portals share the same base shell layout:

```
┌─────────────────────────────────────────────────────┐
│  Top Bar — Role label + current user + sign out     │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│  Left        │  Main Content Area                   │
│  Sidebar     │                                      │
│  Nav         │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

**Exception — DS Portal:** The DS portal uses a **top-bar tab switcher** (Tasks · Pipeline · Clients) as its primary nav rather than a sidebar. The left sidebar is replaced by the tab switcher pattern consistent with the external shell's mode switcher. This is the only portal with this treatment — DS workflows are action-driven and benefit from the flat tab model.

**Top bar (all portals):**
- Left: platform wordmark (NextLevel — internal)
- Center: role label (Disposition Specialist / Analyst / Admin)
- Right: current user display name + sign-out

### 1.5 AI Chat Panel — DS and Analyst Only

DS and Analyst portals include a persistent AI chat panel. Admin does not.

**Behavior:**
- Accessible via a persistent icon in the shell (bottom-right or collapsible right drawer — agent decides based on layout fit)
- Context-aware: when inside a deal view, the panel is scoped to that deal. When at the queue/list level, it is general-purpose.
- The panel is an **operational assistant only** — it surfaces information, drafts text, and answers questions. It does not take actions or authorize anything.
- DS use cases: deal summary, buyer intel, draft communications, surface anomalies
- Analyst use cases: explain pricing assessment, compare to similar deals, flag a concern

No AI chat panel in Admin portal.

---

## Section 2 — DS Portal

### 2.1 Overview

The DS portal is the operational center for deal execution across Stages 6–9. The DS owns every seat decision, every offer round, every milestone, and every point where the platform requires human authorization before something is delivered externally.

The default landing is always the **Task Queue** (`/ds/tasks`). Every action that requires DS attention surfaces there.

> Full DS role responsibilities and stage-by-stage AI interaction map: `BUSINESS_RULES_v1_0.md` Section 12 and `INTERNAL_TEAM_PLATFORM_GUIDE_v1_0.md` Section 2.

### 2.2 Navigation — DS Portal

Top-bar tab switcher with three primary tabs:

| Tab | Default Route | Description |
|-----|---------------|-------------|
| **Tasks** (default) | `/ds/tasks` | Action Queue — all items needing DS attention |
| **Pipeline** | `/ds/pipeline` | All deals across all stages and statuses |
| **Clients** | `/ds/clients/sellers` | Seller and buyer relationship management |

Sub-navigation within Pipeline (filter tabs or inline toggle):
- All Deals
- Active (Stages 6–9)
- Market Tested
- Dormant

Sub-navigation within Clients:
- Sellers
- Buyers

Notifications (`/ds/notifications`) accessible from the top bar via a bell icon — not a primary tab.

Settings (`/ds/settings`) accessible from the top bar or a secondary nav item.

### 2.3 Task Queue — `/ds/tasks`

The Task Queue is the DS's daily to-do list. Every item requiring DS action surfaces here. The DS should be able to clear their queue without visiting any other page — each task provides the minimum context needed to act inline or navigate directly to the relevant deal view.

**Task types (all surfaces on the queue):**

| Task Type | Trigger | DS Action |
|-----------|---------|-----------|
| Seat Approval | Buyer requests access (Stage 7) | Approve seat or Deny — navigates to deal's Seat Allocation tab |
| Seat Approval — Invited | DS-invited buyer accepts | Confirm or review — navigates to deal's Seat Allocation tab |
| Offer Feedback Authorization | AI generates draft after offer round | Review and authorize draft before delivery — navigates to deal's Offer Rounds tab |
| Pricing Guidance Authorization | AI generates pricing guidance for a deal | Review and authorize draft before delivery to seller — navigates to deal's Overview tab |
| Buyer Outreach Authorization | AI generates batch of outreach messages for Stage 7 | Review and authorize batch before messages send — navigates to deal's Messages tab |
| Seller Escalation | AI routes a seller conversation to DS at Stage 5 | Review conversation history and step in — navigates to deal's Overview tab |
| Buyer Q&A Escalation | AI routes a buyer question that requires DS judgment | Review question and compose authorized response — navigates to deal's Messages tab |
| Listing Agreement Task | Deal advances to Stage 6 | Mark listing agreement complete off-platform — inline action |
| Milestone Logging | Post-acceptance milestones pending | Log milestone with date stamp — navigates to deal's Milestones tab |
| Market Tested Declaration | All buyer pool exhaustion conditions met | Declare Market Tested — navigates to deal view |

**Task card structure:**

Each task card displays:
- Deal name
- Asset subtype + geography (one-line context)
- Task type label (e.g., "Seat Approval", "Offer Feedback")
- Urgency indicator: **Action Required** (red) / **Review Pending** (amber) / **Informational** (slate)
- Timestamp (when the task was created / how long it's been pending)
- Primary CTA button — navigates to the relevant deal view tab or triggers inline action

Tasks are sorted by urgency (Action Required first), then by timestamp within each group (oldest first).

**Empty state:** "No pending tasks. All caught up." — uses internal slate accent.

### 2.4 DS Pipeline — `/ds/pipeline`

A deal list view showing all deals the DS has visibility into, across all stages and statuses.

**Columns:**

| Column | Content |
|--------|---------|
| Deal Name | Linked — navigates to `/ds/deal/:id` |
| Asset Type / Subtype | e.g., Residential Income · BFR |
| Seller | Seller name |
| Stage | Current stage number + label |
| Status | Active / Market Tested / Dormant / Accepted Offer / Closed |
| Seats | X / 3 (filled / max) |
| Last Activity | Relative timestamp |

**Filters:** All · Active (Stages 6–9) · Market Tested · Dormant

Dormant deals are visually de-emphasized (reduced opacity or muted text) but remain visible and linked. They are not hidden.

### 2.5 DS Deal View — `/ds/deal/:id`

The DS deal view is the primary work surface for managing an individual deal. It uses a **seven-tab layout**:

```
[ Overview ][ Seat Allocation ][ Offer Rounds ][ Documents ][ Market Intelligence ][ Milestones ][ Messages ]
```

---

#### Tab 1 — Overview

Surfaces the deal's current state at a glance. Read-heavy — most actions happen in other tabs.

**Content:**
- Deal name, asset type/subtype, geography
- Current stage + status badge
- Seller name + contact info (email, phone)
- Deal size range
- Stage timeline — visual indicator of where the deal sits in the 9-stage lifecycle
- Active seat count (X / 3)
- Quick links to other tabs (e.g., "2 seats pending approval" → Seat Allocation tab)
- AI chat panel accessible from this view (deal-scoped)
- **Pricing Guidance panel** (Stage 7+): AI-generated pricing guidance draft displayed inline when pending DS authorization. DS can read, edit, and authorize from this panel. Authorization triggers delivery. Displayed only when a draft is pending — hidden otherwise.

**Stage 5 seller escalation surface:**

When AI escalates the seller outcome conversation to DS (seller is resisting pricing or situation requires negotiation), the deal's Overview tab becomes the DS intervention surface:

- The AI-led seller conversation history is displayed in a read-only thread above the DS compose area
- A "You've been escalated into this conversation" banner makes the handoff state explicit
- DS composes a response in a text area below the thread — this response is sent to the seller as a continuation of the conversation
- The seller is shown a transparent handoff notice: a specialist has joined the conversation
- Once DS sends a response, the escalation task is cleared from the Task Queue
- DS can hand back to AI or continue managing the conversation directly — toggle control on the compose area

---

#### Tab 2 — Seat Allocation

The primary surface for managing who enters the deal room. DS controls all seating — no auto-seating, no exceptions.

> Seat rules in full: `BUSINESS_RULES_v1_0.md` Section 8.

**Buyer pool table:**

| Column | Content |
|--------|---------|
| Buyer Name | Linked → `/ds/clients/buyers/:id` |
| Firm Type | From qualification |
| Qualification Status | Qualified / Unqualified / Pending |
| Seat Status | Invited / Access Requested / Seated / Wait Queue / Passed |
| Match Score | Tier 1/2/3 alignment indicator |
| Requested / Invited | Timestamp |
| Actions | Context-sensitive — see below |

**Actions by seat status:**

| Seat Status | Available Actions |
|-------------|-------------------|
| Access Requested | Approve Seat · Deny |
| Invited (pending acceptance) | — (awaiting buyer) |
| Invited (accepted, seat available) | Seat is filled automatically — no DS action |
| Invited (accepted, no seat available) | Approve Seat (from Wait Queue) |
| Seated | Remove (with confirmation) |
| Wait Queue | Promote to Seat · Remove |
| Passed | — (read-only) |

**DS Invite flow:** "Invite Buyer" action at the top of the tab — opens a search/select panel to find a buyer by name or email from the platform's buyer database. DS selects the buyer and sends the invite. The invite is logged in the buyer's pool record.

**Seat counter:** Persistent display — "X / 3 seats filled" — always visible at the top of the tab. When all 3 seats are filled, Approve Seat actions are disabled until a seat opens.

---

#### Tab 3 — Offer Rounds

Manages the sealed offer process across up to 3 rounds.

> Offer rules in full: `BUSINESS_RULES_v1_0.md` Section 9.

**Round structure:**

Each round is displayed as an expandable section. Within each round:

- Round number + status (Open / Closed / Pending)
- DS-set deadline (editable while round is Open)
- Offer table:

| Column | Content |
|--------|---------|
| Buyer Name | |
| Offer Amount | |
| Terms summary | |
| Submitted At | Timestamp |
| AI Feedback Draft | Status: Pending Auth / Authorized / Sent |

**Offer feedback authorization flow:**
When AI generates feedback for a buyer after a round, a task appears in the Task Queue. DS clicks through to this tab. The AI-generated draft is displayed in a review panel. DS can read, edit inline, and authorize. Authorization triggers immediate delivery to the buyer. Nothing is sent without DS authorization.

**Round controls (DS only):**
- "Open Next Round" — available after the current round closes, up to Round 3 maximum
- "Set Deadline" — date/time picker per round
- "Advance to Stage 9" — available after Round 3 closes; requires confirmation modal

**Winning offer confirmation:** After Round 3, DS selects the winning offer and confirms. Confirmation modal: "Confirm [Buyer Name] as winning buyer? This action is irreversible." — on confirm, non-winning buyers receive automated outcome messages, deal status moves to `accepted_offer`.

---

#### Tab 4 — Documents

Read-only document viewer for the DS. Shows all documents associated with the deal.

**Content:**
- Document list: name, type, uploaded by, upload date, status (Verified / Flagged / Pending)
- Download links for each document
- Any Admin or AI notes associated with flagged documents
- No upload or edit actions — DS does not manage documents directly

---

#### Tab 5 — Market Intelligence

Operational signals DS uses to inform seat allocation and deal strategy.

**Content:**
- **Pass reasons** — structured reasons from buyers who passed or were denied, by round
- **Buyer feedback themes** — anonymized Q&A patterns from deal room activity
- **Interest signals** — buyers who indicated interest during Coming Soon (Stage 6), not yet in the buyer pool
- **Seat history** — log of all seat events (who was seated, when, who passed, who was denied)
- **Deal health summary** — AI-generated summary of deal activity, updated each time the DS views it (not pushed automatically)

This tab is read-only. No actions.

---

#### Tab 6 — Milestones

Post-acceptance milestone tracker. Active only after deal reaches `accepted_offer` status.

**5 milestones, logged by DS in order:**

| # | Milestone | DS Action |
|---|-----------|-----------|
| 1 | PSA Executed | Log date |
| 2 | Earnest Money Received | Log date |
| 3 | Due Diligence Complete | Log date |
| 4 | Financing Confirmed | Log date |
| 5 | Closed | Log date → triggers deal status → `closed` |

Each milestone: date picker + optional notes field. Logged milestones are locked — cannot be edited after submission.

When milestone 5 (Closed) is logged, a confirmation modal fires: "Mark this deal as Closed? This is permanent." On confirm, deal status is set to `closed`.

If deal has not reached `accepted_offer`, this tab shows: "Milestones are unlocked after the winning offer is confirmed."

---

---

#### Tab 7 — Messages

The DS's unified messaging surface for all buyer communication on this deal. DS reads buyer messages from the deal room and composes authorized responses. Nothing is sent to a buyer without DS composing and sending from this tab — there is no email integration in MVP.

**Layout — split panel:**

```
┌─────────────────────┬──────────────────────────────┐
│  Conversation List  │  Active Thread               │
│                     │                              │
│  [Buyer Name]       │  Buyer message history       │
│  Last msg · time    │  DS response history         │
│                     │                              │
│  [Buyer Name]       │  ─────────────────────────── │
│  Last msg · time    │  Compose area                │
│                     │  [ Send ]                    │
│  [ + New Message ]  │                              │
└─────────────────────┴──────────────────────────────┘
```

**Conversation list (left panel):**
- One list item per buyer who has an active conversation on this deal
- Uses the platform's list item component — buyer name, last message preview, relative timestamp, unread indicator
- "+" action at the top — DS initiates a new outreach message to a seated or invited buyer
- Sorted by most recent message, unread conversations first

**Thread view (right panel):**
- Full message history between DS and the selected buyer
- Buyer messages appear on the left, DS responses on the right
- AI-generated messages (outreach drafts, Q&A responses) appear with an "AI Draft — Authorized by DS" label once sent — distinguishes AI-authored from DS-authored within the thread
- Compose area at the bottom — plain text, send on submit

**Buyer Outreach Authorization flow:**
When AI generates a batch of outreach messages for Stage 7, a task appears in the Task Queue. DS clicks through to this tab. Each AI-drafted message appears as a pending item in the conversation list — labeled "Pending Authorization." DS opens each draft, reviews in the thread view, edits if needed, and authorizes. Authorization sends the message and records it in the thread. DS can authorize all in sequence or handle individually.

**Buyer Q&A escalation flow:**
When AI routes a buyer question to DS, it appears as an unread message in the relevant buyer's thread. DS reads the buyer's question (and the AI's conversation history above it for context), composes a response, and sends. The Q&A escalation task clears from the Task Queue on send.

**What buyers see — deal room chat (buyer-side changes, ref: `UX_DESIGN_SPEC_BUYER_v1_0.md`):**

The buyer deal room chat panel has two connected updates that must be spec'd in `UX_DESIGN_SPEC_BUYER_v1_0.md` before the internal portal build:

**1. DS Identity Card**
A persistent identity card sits at the top of the deal room chat panel — above the message thread. It uses the platform's list item component and displays:
- Platform identity name (label TBD — branding sprint; placeholder: "Your Specialist")
- Last active relative timestamp (e.g., "Last seen 2 hours ago")
- A status indicator (active / away)
- The "+" action on the component is informational — tapping opens a brief identity profile (role description, not personal DS details). It does not initiate a separate message flow.

The card persists regardless of which message channel the buyer is viewing. Its purpose is to answer "who am I talking to" before the buyer engages.

**2. AI / Human Channel Toggle**
The deal room chat panel has a two-state toggle above the message thread (below the identity card):

```
[ AI ]  [ Specialist ]
  ●
```

- **AI channel** — automated responses from the platform's AI Disposition Engine (deal Q&A, outreach, system messages)
- **Specialist channel** — direct communication with the DS; DS-composed messages and authorized outreach appear here
- Each channel maintains its own independent message thread
- An unread badge appears on the toggle button for whichever channel has new unread messages — clears on view
- Toggle labels are placeholders pending branding sprint. Do not use "Human" or "AI" literally in shipped copy.

The toggle makes it unambiguous to the buyer who they're interacting with at any point. This is intentional — it replaces the "DS as AI illusion" pattern flagged in Business Rules 12.6, consistent with the rebranding direction in Section 5.2 of this document.

From the DS side, both channels are visible in the Messages tab of the DS Deal View — the toggle is a buyer-facing concept only. DS sees a unified thread with channel labels indicating which stream each message belongs to.

---

### 2.6 DS Client Views

#### Seller List — `/ds/clients/sellers`

Table view of all sellers the DS has active or past deals with.

**Columns:** Seller Name · Active Deals (count, linked) · Last Activity

Navigates to individual seller profile at `/ds/clients/sellers/:id`.

**Seller profile content:**
- Contact info (name, email, phone)
- Deal history (all deals associated with this seller, with stage/status)
- Notes field (DS-editable)

---

#### Buyer Queue — `/ds/clients/buyers`

Table view of all buyers across all deals in the DS's pipeline.

**Columns:** Buyer Name · Firm Type · Qualification Status · Active Deals (count) · Seat Status (most recent) · Last Activity

Navigates to individual buyer profile at `/ds/clients/buyers/:id`.

**Buyer profile content:**
- Contact info (name, email, phone)
- Qualification status + qualification data (read-only — DS cannot edit buyer qualification fields)
- Strategy summary (asset type/subtype, geography, deal size — from their buy strategy)
- Deal history — all deals this buyer has been active in, with seat status per deal
- Intent signals — match count, interest indications, access requests
- Notes field (DS-editable)

---

## Section 3 — Analyst Portal

### 3.1 Overview

The Analyst owns Stage 4 — the economic gate. Every deal that passes Stage 3 generates an AI financial memo. The Analyst reviews each memo and makes a final, irreversible determination: Approve, Return to Admin, or Reject.

The Analyst's portal is focused and narrow. The default landing is always the **Review Queue** — pending memos awaiting authorization.

> Full Analyst responsibilities: `BUSINESS_RULES_v1_0.md` Section 7.5 and `INTERNAL_TEAM_PLATFORM_GUIDE_v1_0.md` Section 2.

### 3.2 Navigation — Analyst Portal

Left sidebar nav:

| Item | Route | Description |
|------|-------|-------------|
| **Review Queue** (default) | `/analyst` | Pending AI memos — awaiting Analyst decision |
| **Completed** | `/analyst/completed` | Past reviews with outcomes and notes |
| **Pipeline** | `/analyst/pipeline` | Full pipeline — read-only visibility across all stages |
| **Settings** | `/analyst/settings` | Analyst account settings |

### 3.3 Review Queue — `/analyst`

A list of all deals at Stage 4 with AI memos generated and awaiting Analyst authorization.

**Queue card (per deal):**
- Deal name
- Asset type / subtype
- Seller name
- Date AI memo was generated
- AI flag color: 🟢 Green / 🟡 Yellow / 🔴 Red
- "Review" CTA → navigates to `/analyst/review/:id`

Sorted by: oldest memo first (longest waiting at top).

**Empty state:** "No pending reviews. Queue is clear."

### 3.4 Analyst Review View — `/analyst/review/:id`

The primary work surface. Split layout: AI financial memo on the left, action panel and AI chat on the right.

**Left panel — AI Financial Memo:**

Structured memo containing:

| Section | Content |
|---------|---------|
| Deal Summary | Asset type, subtype, geography, deal size, seller background |
| Document Assessment | Completeness check results from Stage 3, any Admin notes |
| Pricing Assessment | AI's pricing analysis relative to market comps and deal structure |
| Demand Alignment | Buyer pool size, match quality, strategy alignment across the buyer database |
| AI Recommendation | Green (Approve) / Yellow (Return — specific concern flagged) / Red (Reject — viability issue) |
| AI Reasoning | Narrative explanation of the recommendation |

The memo is read-only. The Analyst cannot edit it.

**Right panel — Actions + AI Chat:**

Action section at the top:

Three decision buttons:
- **Approve** — advances deal to Stage 5. Triggers seller outcome conversation (AI-led).
- **Return to Admin** — sends deal back to Stage 3 with required notes.
- **Reject** — closes the deal path. Requires documented reason.

Each action triggers a **confirmation modal** before executing. All three decisions are irreversible — stated explicitly in the modal copy.

Return and Reject require a text field (reason / notes) before the confirmation button is active.

AI chat panel below the action section — scoped to this deal. Analyst-facing prompts:
- "Explain this pricing assessment"
- "Compare to similar deals in the pipeline"
- "Flag a concern for the memo record"

The AI chat does not take actions. It surfaces information and assists reasoning.

### 3.5 Completed Reviews — `/analyst/completed`

Archive of all completed Analyst decisions.

**Columns:** Deal Name · Decision (Approve / Return / Reject) · Date · Notes (if any)

Read-only. No actions.

### 3.6 Analyst Pipeline — `/analyst/pipeline`

Full pipeline visibility across all stages. Read-only — Analyst cannot take actions outside Stage 4.

**Columns:** Deal Name · Stage · Status · Seller · Last Activity

Filtered view — Analyst cannot modify any deal from this surface.

---

## Section 4 — Admin Portal

### 4.1 Overview

Admin owns Stage 3 exception handling, full pipeline visibility, client management, and internal staff provisioning. Admin is the only role that can create internal accounts.

The default landing is the **Overview** — exception queue summary plus pipeline snapshot.

> Full Admin responsibilities: `BUSINESS_RULES_v1_0.md` Section 7.4 and `INTERNAL_TEAM_PLATFORM_GUIDE_v1_0.md` Section 2.

### 4.2 Navigation — Admin Portal

Left sidebar nav:

| Item | Route | Description |
|------|-------|-------------|
| **Overview** (default) | `/admin` | Exception queue + pipeline summary |
| **Exception Queue** | `/admin/exceptions` | AI-flagged Stage 3 deals requiring Admin review |
| **Pipeline** | `/admin/pipeline` | All deals, all stages, all statuses |
| **Clients** | `/admin/clients` | All buyer and seller accounts |
| **Staff** | `/admin/staff` | Internal team management + account provisioning |
| **Settings** | `/admin/settings` | Admin account settings |

### 4.3 Overview — `/admin`

Two-section landing page:

**Top section — Exception Queue summary:**
- Count of AI-flagged deals currently awaiting Admin review
- List of the 3 most urgent exceptions with deal name, flag reason, and days pending
- "View All" link → `/admin/exceptions`

**Bottom section — Pipeline snapshot:**
- Count of deals at each stage (Stages 1–9)
- Count by status (Active / Market Tested / Dormant / Accepted Offer / Closed)
- No actions — this is a read surface only

### 4.4 Exception Queue — `/admin/exceptions`

All Stage 3 deals the AI checklist agent flagged and could not auto-advance. These are the only deals Admin actively works on — clean packages are auto-advanced without Admin involvement.

**Exception card (per deal):**
- Deal name
- Seller name
- Date submitted to Stage 3
- Flag reason(s) — specific document issues the AI identified (e.g., "Missing rent roll", "Inconsistent unit count across docs")
- Days pending
- "Review" CTA → navigates to `/admin/deal/:id`

Sorted by: oldest flag first.

**Empty state:** "No exceptions pending. All Stage 3 packages are clear."

### 4.5 Admin Deal View — `/admin/deal/:id`

Document review surface for Stage 3 exception handling.

**Content:**

- Deal summary header: deal name, asset type/subtype, seller, date received at Stage 3
- AI Completeness Report — structured checklist of all required documents:
  - Document name
  - Status: Present / Missing / Inconsistent / Flagged
  - AI note (reason for flag, if flagged)
- Document viewer — all uploaded documents displayed inline or as downloadable links
- Admin notes field — text input for documenting the Admin's review reasoning (required before taking any action)

**Actions:**

| Action | Condition | Result |
|--------|-----------|--------|
| Advance to Analyst | Admin is satisfied the package is complete | Deal moves to Stage 4. AI analyst agent generates financial memo. |
| Return to Seller | Package has unresolvable gaps | Deal moves back to Stage 2. Admin notes are sent to seller as context. |

Both actions require the notes field to be populated. Both trigger a confirmation modal.

### 4.6 Admin Pipeline — `/admin/pipeline`

Full pipeline view across all deals and all stages.

**Columns:** Deal Name · Seller · Stage · Status · Submitted Date · Last Activity

**Filters:** All · By Stage · By Status (Active / Market Tested / Dormant / Accepted Offer / Closed)

No deal actions from this view. Navigates to `/admin/deal/:id` for Stage 3 deals only — other stages are read-only from Admin.

### 4.7 Client Management — `/admin/clients`

All buyer and seller accounts on the platform.

**Default view:** Combined list with a toggle to filter Buyers / Sellers / All.

**Columns (Sellers):** Name · Email · Active Deals (count) · Joined Date
**Columns (Buyers):** Name · Email · Qualification Status · Active Deals · Joined Date

Navigates to `/admin/clients/:id` for individual client profiles.

**Individual client profile:**
- Contact info
- Account status (Active / Suspended)
- Deal history
- Admin-editable notes field
- Account suspension action (with confirmation) — no account deletion in MVP

### 4.8 Staff Management — `/admin/staff`

Internal team management. Admin is the only role that can create, view, or manage internal accounts.

**Staff list:**

| Column | Content |
|--------|---------|
| Name | |
| Role | DS / Analyst / Admin |
| Email | |
| Status | Active / Inactive |
| Last Login | |

**Actions:**
- "Add Staff Member" → `/admin/staff/create`
- Deactivate account (with confirmation) — does not delete, sets status to Inactive
- No password management in MVP — handled off-platform

**Create staff account — `/admin/staff/create`:**
- Name, email, role selection (DS / Analyst / Admin)
- System generates a temporary credential and emails it to the new staff member — off-platform email in MVP (no automated platform email)
- In practice for MVP: Admin creates the account and communicates credentials manually

---

## Section 5 — Open Items

These items are known gaps identified during spec creation. They must be resolved before or during the internal portal build sprint.

### 5.1 DS-Created Deal Rooms on Behalf of Sellers

Some sellers are non-technical or will not engage with the platform independently. The current workaround is a screen-share setup call. The platform needs a surface that allows a DS to create a deal room on behalf of a seller and then hand ownership to the seller after the fact.

**Current status:** Not scoped. Not a structural change to the data schema — it's an additional surface in the DS portal. Needs a dedicated sprint to define the flow, then a prompt for the agent.

**Likely location:** A "Create Deal Room" action on the DS portal (possibly in the Clients → Sellers view or as a standalone action in the pipeline), with a seller assignment step.

---

### 5.2 Platform Branding in Internal AI Copy

All AI-generated buyer-facing messages currently reference "NextLevel AI" in the existing spec. Per the internal team guide, this label creates legal and trust exposure — buyers believe they're interacting with a fully automated system.

**Decision made:** Rebrand away from AI-specific language. All buyer-facing AI communication should present as a platform-driven process — not explicitly AI, not explicitly human. Framing: *"a platform-driven process combining intelligent automation and specialist oversight."*

**Current status:** Rebranding sprint blocked pending branding docs from Adam. All documents and code currently retain NextLevel branding. This change will be applied in a dedicated rebranding sprint once docs are received.

**Scope when sprint runs:** All outreach messages, deal room chat labels, DS-facing message previews, and notification copy.

---

### 5.3 Internal Accent Color

Placeholder: `slate-600` / `slate-500`. Final token TBD at branding pass.

---

*Last updated: April 2026*
