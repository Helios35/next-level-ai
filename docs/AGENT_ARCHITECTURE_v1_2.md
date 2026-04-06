# Agent Architecture — NextLevel Platform
**Version:** 1.2  
**Audience:** Nathan Ivy (Next Sketch LLC), Cursor agents  
**Status:** Locked for prototype build — production flags noted inline  
**Last updated:** 2026-03-21  
**Changelog:**
- v1.1 — Renamed `agent_disposition` → `agent_buyer`; added `agent_seller` (2 modes); updated file paths, shared rules, and pre-build flags accordingly.
- v1.2 — Locked intent signal thresholds (flag #2 resolved); locked pricing guidance trigger and availability window (flag #4 resolved); flag #3 (strategy modifier) remains open.

---

## How to Read This Document

- **LOCKED** — Decision made. Build from this. Do not deviate.
- **⚠️ PRE-BUILD FLAG** — Needs a decision or additional spec before this piece is built. Do not assume. Stop and resolve.
- **PROTOTYPE NOTE** — How the prototype simulates this. Swap for real implementation in production.
- **PRODUCTION NOTE** — Applies to the live system only. Not in scope for prototype.

All agents are simulated in the prototype using scripted responses and hardcoded data. No live LLM calls in the demo build. Architecture defined here represents production behavior.

---

## Naming Convention — LOCKED

The human Disposition Specialist (DS) owns both the buyer and seller relationships. The AI agents are named for who they face — not for the human role they support.

| Agent ID | Name | Faces | Routes to |
|----------|------|-------|-----------|
| `agent_intake` | Intake Agent | Buyers + sellers (pre-signup) | No escalation path |
| `agent_buyer` | Buyer Agent | Buyers (deal room) | Human DS |
| `agent_seller` | Seller Agent | Sellers (deal room) | Human DS |
| `agent_offer_feedback` | Offer Feedback Agent | Buyers (offer rounds) | Human DS (approval gate) |

The DS is never replaced by an agent. Both `agent_buyer` and `agent_seller` route to the same human DS when escalation is needed.

---

## Agent Roster — Summary

| ID | Name | Modes | LLM | Human Gate | Prototype |
|----|------|-------|-----|------------|-----------|
| `agent_intake` | Intake Agent | 1 | Yes | None | Scripted |
| `agent_buyer` | Buyer Agent | 3 (A/B/C) | Yes | DS approval on outreach + escalations | Scripted |
| `agent_seller` | Seller Agent | 2 (A/B) | Yes | DS approval on pricing drafts; Mode A doc-scoped answers exempt | Scripted |
| `agent_offer_feedback` | Offer Feedback Agent | 1 | Yes | DS approval before delivery | Scripted |

**Logic systems (no LLM):** match scoring, buyer ranking, deal analysis scoring, stage transition engine  
**Conversational wrappers (no LLM):** doc collection guidance, buyer strategy modifier

---

## Core Principle — LOCKED

```
AI recommends or drafts at every layer.
Humans authorize at every structural, economic, and deal-facing gate.
```

No agent sends a message, advances a deal stage, or exposes deal data without DS review — **except:**
- `agent_intake` (pre-signup, zero transactional stakes)
- `agent_buyer` Mode A answers (bounded by document context, no transactional action)
- `agent_seller` Mode A answers (bounded by document context + authored platform mechanics, no transactional action)

---

## Agent Definitions

---

### `agent_intake`

**Identity:** "NextLevel AI" — pre-signup intake assistant  
**Zone:** Pre-signup flow (unauthenticated)  
**Lifecycle:** Spawned on intake page load, destroyed on signup completion or exit

```typescript
interface IntakeAgentContext {
  sessionId: string;
  entryType: 'seller' | 'buyer';
  rawInput: SellerIntakeFields | BuyerStrategyFields;  // from initial form
  refinementHistory: RefinementTurn[];
  currentMatchCount: number;       // from match scoring engine
  currentMatchQuality: MatchQuality; // from match scoring engine
}

interface RefinementTurn {
  agentQuestion: string;
  userAnswer: string;
  matchCountAfter: number;
  matchQualityAfter: MatchQuality;
}

type MatchQuality = 'high' | 'medium' | 'low';
```

**Trigger:** User submits initial deal or strategy fields on pre-signup page  
**Inputs:** Raw intake fields + current match count/quality from match scoring engine  
**Outputs:**
- `refinedMatchCount: number`
- `refinedMatchQuality: MatchQuality`
- `prefilledSignupFields: Partial<UserProfile>`
- `refinementConversationLog: RefinementTurn[]`

**Human gate:** None. Fully autonomous.  
**Escalation path:** None — if agent cannot proceed, surface a fallback CTA to contact Strata directly.

**PROTOTYPE NOTE:** Replace LLM call with scripted branching conversation. Match counts are hardcoded per scenario. No API call made.

---

### `agent_buyer`

**Identity:** "NextLevel AI" — visible to buyers as platform AI, not as DS  
**Zone:** Authenticated deal room — buyer-facing only  
**Lifecycle:** Persistent per deal room. One instance per `dealRoomId`.

```typescript
interface BuyerAgentContext {
  dealRoomId: string;
  dealSummary: DealSharedFields;        // from DealRoom record
  documentIndex: DocumentIndex[];       // ⚠️ RAG in production — see Mode A flag
  buyerPool: BuyerPoolEntry[];
  activeOutreachQueue: OutreachDraft[];
  intentSignals: BuyerIntentSignal[];
}

interface DocumentIndex {
  documentId: string;
  label: string;
  // PRODUCTION: chunks: EmbeddedChunk[] — not in prototype
}

type BuyerAgentMode = 'qa' | 'outreach' | 'intent';
```

---

#### Mode A — Deal Room Q&A (`mode: 'qa'`)

**Trigger:** Buyer sends a chat message in the deal room  
**Inputs:**
- `buyerMessage: string`
- `buyerId: string`
- `dealRoomId: string`
- `documentIndex: DocumentIndex[]` — deal package context

**Decision logic:**
```
IF question answerable from document context:
  → generate answer
  → append to chat as senderRole: 'ai_agent'
  → log ChatMessage

IF question NOT answerable from document context:
  → do NOT guess or hallucinate
  → create EscalationItem { status: 'pending_ds', routedTo: 'ds' }
  → notify DS via DS portal queue
  → send buyer: "Great question — I've flagged this for our team and you'll hear back shortly."
```

**Outputs:**
- `ChatMessage` (senderRole: `'ai_agent'`, messageType: `'message'`) — direct answer, OR
- `ChatMessage` (messageType: `'question_routed'`) + `EscalationItem { status: 'pending_ds', routedTo: 'ds' }`

**Human gate:** DS handles all escalated questions directly. No auto-reply from DS persona.

**⚠️ PRE-BUILD FLAG — RAG ARCHITECTURE (shared with `agent_seller` Mode A):**  
Both `agent_buyer` and `agent_seller` read from the same deal documents. One RAG infrastructure serves both. In production this requires:
1. Document chunking strategy (chunk size, overlap, by section vs. by page)
2. Embedding model selection
3. Vector store (Supabase pgvector recommended — already in stack)
4. Retrieval logic (top-k, similarity threshold, reranking)
5. Hallucination guard — when retrieved context is insufficient, route to DS, never synthesize

This is the highest-complexity production dependency. Spec once, implement once, serve both agents. Do not build without a dedicated spec.

**PROTOTYPE NOTE:** Hardcode 3–5 scripted Q&A pairs per mock deal room. Route any question outside that set to the DS queue. No LLM call.

---

#### Mode B — Buyer Outreach Drafting (`mode: 'outreach'`)

**Trigger:** DS initiates outreach batch for a deal room  
**Inputs per buyer:**
- `buyerProfile: BuyerProfile`
- `matchScore: number`
- `dealSummary: DealSharedFields`
- `previousOutreachHistory?: OutreachEntry[]`

**Output per buyer:**
```typescript
interface OutreachDraft {
  id: string;
  dealRoomId: string;
  buyerId: string;
  buyerAnonymizedLabel: string;
  draftBody: string;
  status: 'pending_ds_approval' | 'approved' | 'rejected' | 'sent';
  generatedAt: string;
  approvedAt?: string;
  approvedByDSId?: string;
  sentAt?: string;
}
```

**Human gate:** LOCKED. DS must explicitly approve or edit each `OutreachDraft` before `status` transitions to `'sent'`. No message sends on `'pending_ds_approval'` status. Enforce at API layer — not just UI.

**PROTOTYPE NOTE:** Pre-write one outreach draft per mock buyer per deal. Render in DS portal as if generated. DS approval flow UI still needs to function.

---

#### Mode C — Buyer Intent Signals (`mode: 'intent'`)

**Trigger:** Buyer activity events in the deal room  
**Inputs:**
- `buyerEngagementEvents: BuyerEngagementEvent[]`
- `dealRoomId: string`
- `buyerId: string`

```typescript
interface BuyerEngagementEvent {
  eventType: BuyerEngagementEventType;
  buyerId: string;
  dealRoomId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

type BuyerEngagementEventType =
  | 'message_sent'
  | 'document_viewed'
  | 'outreach_opened'
  | 'outreach_responded'
  | 'offer_submitted'
  | 'offer_updated';
```

**Output:**
```typescript
interface BuyerIntentSignal {
  id: string;
  dealRoomId: string;
  buyerId: string;
  buyerAnonymizedLabel: string;
  intentRating: 'high' | 'medium' | 'low';
  reasoning: string;     // plain English for DS — "Responded to outreach within 2 hours, viewed rent roll twice, submitted offer in round 1"
  updatedAt: string;
}
```

**Human gate:** Signal is surfaced in DS portal only. No automated action. DS decides how to respond.

**Intent signal thresholds — LOCKED:**

```
HIGH:
  - Submitted an offer (any round), OR
  - Responded to outreach within 24hrs AND viewed all documents in the deal package

MEDIUM:
  - Responded to outreach but has not viewed all documents, OR
  - Viewed all documents but has not responded to outreach
  - Active engagement present but not meeting High criteria

LOW:
  - Never opened outreach, OR
  - Asked one question then had no further activity

RECALCULATES ON (trigger events only — not on every action):
  - offer_submitted
  - outreach_opened
  - outreach_responded
  - all_documents_viewed  // fires when final unviewed doc is viewed
```

**PROTOTYPE NOTE:** Hardcode intent signals per mock buyer in `MOCK_AI_OUTREACH_DR001`. `intentToOffer: boolean` already exists in schema — use it.

---

### `agent_seller`

**Identity:** "NextLevel AI" — visible to sellers as platform AI, not as DS  
**Zone:** Authenticated deal room — seller-facing only  
**Lifecycle:** Persistent per deal room. One instance per `dealRoomId`.

```typescript
interface SellerAgentContext {
  dealRoomId: string;
  sellerId: string;
  dealSummary: DealSharedFields;
  documentIndex: DocumentIndex[];       // ⚠️ RAG in production — shared with agent_buyer
  platformMechanicsContent: PlatformMechanicsEntry[];  // authored static content
  demandSignals: DealDemandSignals;     // for Mode B pricing guidance
}

interface PlatformMechanicsEntry {
  topic: string;    // e.g. 'stage_3_what_happens', 'listing_agreement_faq'
  content: string;  // authored plain-English answer — no LLM needed at runtime
}

interface DealDemandSignals {
  matchedBuyerCount: number;
  matchQuality: MatchQuality;
  buyerActivitySummary: string;   // e.g. "2 of 3 seated buyers have viewed all documents"
  comparableDeals?: ComparableDeal[];
}

type SellerAgentMode = 'qa' | 'pricing_guidance';
```

---

#### Mode A — Seller Q&A (`mode: 'qa'`)

**Trigger:** Seller sends a message in their deal room chat  
**Inputs:**
- `sellerMessage: string`
- `sellerId: string`
- `dealRoomId: string`
- `documentIndex: DocumentIndex[]` — their own deal documents
- `platformMechanicsContent: PlatformMechanicsEntry[]` — authored process content

**Decision logic:**
```
IF question answerable from deal documents:
  → generate answer from document context
  → append to chat as senderRole: 'ai_agent'

IF question answerable from platform mechanics content:
  → return authored answer (no LLM retrieval needed)
  → append to chat as senderRole: 'ai_agent'

IF question NOT answerable from either source:
  → do NOT guess
  → create EscalationItem { status: 'pending_ds', routedTo: 'ds' }
  → notify DS via DS portal queue
  → send seller: "Good question — I've flagged this for your Disposition Specialist and they'll be in touch shortly."
```

**Outputs:**
- `ChatMessage` (senderRole: `'ai_agent'`) — direct answer, OR
- `ChatMessage` (messageType: `'question_routed'`) + `EscalationItem { status: 'pending_ds', routedTo: 'ds' }`

**Human gate:** Doc-scoped answers: no gate. Platform mechanics answers: no gate. Anything outside both sources: DS handles directly.

**Knowledge split — important:**  
Two sources, two retrieval strategies:
- Deal documents → RAG (shared infrastructure with `agent_buyer`)
- Platform mechanics → authored static lookup (no LLM at runtime, key-value by topic)

**PROTOTYPE NOTE:** Hardcode 3–5 scripted seller Q&A pairs per mock deal room (mix of doc questions and process questions). Route anything outside that set to DS queue. No LLM call.

---

#### Mode B — Pricing & Strategy Guidance (`mode: 'pricing_guidance'`)

**Trigger — LOCKED:**
- DS initiates from the DS portal (push to seller), OR
- Seller explicitly requests pricing context in their deal room chat
- Both paths generate a `PricingGuidanceDraft` — DS approval required regardless of who initiated

**Availability — LOCKED:** Mode B is only available at Stage 5 (Active Disposition) and beyond. Not available before buyers are in the room. No demand data exists before activation — a recommendation without real signal is misleading.
**Inputs:**
- `dealSummary: DealSharedFields`
- `demandSignals: DealDemandSignals`
- `sellerId: string`
- `dealRoomId: string`

**Output:**
```typescript
interface PricingGuidanceDraft {
  id: string;
  dealRoomId: string;
  sellerId: string;
  draftBody: string;           // AI-generated recommendation with supporting data
  demandSignalSnapshot: DealDemandSignals;  // data used to generate — for DS review
  status: 'pending_ds_approval' | 'approved' | 'sent';
  generatedAt: string;
  approvedAt?: string;
  approvedByDSId?: string;
  sentAt?: string;
}
```

**Human gate:** LOCKED. DS reviews every `PricingGuidanceDraft` before the seller sees it. This is an economic recommendation — no path where it delivers without DS approval. Enforce at API layer.

**PROTOTYPE NOTE:** Pre-write one pricing guidance draft per mock deal. Render in DS portal as if generated. DS approval UI must function.

---

### `agent_offer_feedback`

**Identity:** Internal — output delivered to buyers, generated and reviewed internally first  
**Zone:** Offer rounds (authenticated, DS-triggered)  
**Lifecycle:** Spawned when DS closes an offer round. Destroyed when all drafts approved/rejected.

```typescript
interface OfferFeedbackAgentContext {
  dealRoomId: string;
  closedRound: number;           // 1 | 2 | 3 (max 3 rounds — LOCKED)
  allOffers: Offer[];            // full round, anonymized
  nonWinningBuyerIds: string[];
  dealContext: DealSharedFields;
}
```

**Trigger:** DS closes offer round (sets round status to `'closed'`)  
**Inputs per non-winning buyer:**
- `buyerOffer: Offer`
- `roundOffers: Offer[]` (anonymized — no buyer identity exposed)
- `closedRound: number`
- `dealContext: DealSharedFields`

**Output per non-winning buyer:**
```typescript
interface OfferFeedbackDraft {
  id: string;
  dealRoomId: string;
  buyerId: string;
  round: number;
  draftBody: string;
  status: 'pending_ds_approval' | 'approved' | 'sent';
  generatedAt: string;
  approvedAt?: string;
  approvedByDSId?: string;
  sentAt?: string;
}
```

**Human gate:** LOCKED. DS reviews and approves every `OfferFeedbackDraft` before delivery. Same enforcement pattern as outreach drafts — gate at API layer.

**PROTOTYPE NOTE:** Pre-write feedback templates per offer position (rank 1 = winner, rank 2 = near miss, rank 3 = furthest). Swap in buyer-specific data at render time. No LLM call.

---

## Logic Systems (No LLM)

These systems produce outputs that *feel* like AI but are pure rule-based computation.

### Match Scoring Engine

**Inputs:** `DealSharedFields` (deal) + `BuyerStrategy` (buyer)  
**Logic:** Three-tier field hierarchy (Tier 1 = hard gate, Tier 2 = hard gate, Tier 3 = soft nudge)  
**Outputs:** `matchCount: number`, `matchQuality: MatchQuality`  
**Consumers:** `agent_intake`, DS portal buyer queue, buyer strategy dashboard

> Tier architecture is defined in `PRODUCT_REQUIREMENTS_v1_8.md` and `BUYER_QUALIFICATION_FRAMEWORK_v1_3.md`. Do not redefine here.

---

### Buyer Ranking Algorithm

**Inputs:** `BuyerPoolEntry[]` for a deal room  
**Logic:** Composite score from `matchScore` + `intentSignal.intentRating` + `outreachStatus`  
**Output:** `aiRankPosition: number` per buyer (1 = highest priority)  
**DS override:** `dsOverrideRank?: number` — if set, UI shows override indicator  
**Consumer:** DS portal seat invitation queue

---

### Deal Analysis Scoring

**Inputs:** Deal financial data + buyer demand signals for the deal's market/type  
**Output:** `dealViabilityTier: 'A' | 'B' | 'C'`, pricing alignment flag, demand signal summary  
**Consumer:** Analyst portal — human reviews and acts. Never auto-advances a deal.

---

### Stage Transition Engine

**Inputs:** Stage change event (`fromStage`, `toStage`, `actorId`, `actorRole`)  
**Logic:** Deterministic — defined notification templates per transition  
**Outputs:** Notification sent to relevant parties, `DealRoom.stageHistory` appended  
**Rule:** Stage transitions are always human-initiated (DS, Admin, or Analyst action). Engine handles downstream notifications only.

---

## Conversational Wrappers

These present as AI-guided conversations but use no LLM at runtime. Pre-written contextual prompts keyed on deal type and current state.

### Doc Collection Guidance

**Where:** Seller deal room, Stage 3 (Admin-owned)  
**Pattern:** Checklist with contextual prompts. Prompts pre-written per `assetType` + `assetSubType` + missing doc state.  
**No LLM call.** Content is authored, not generated.  
**Example:** "You're missing the T12 for a BFR deal — lenders and buyers always ask for trailing 12-month income. Upload it here."

### Buyer Strategy Modifier

**Where:** Buyer dashboard, strategy cards  
**Pattern:** Conversational UI for updating `BuyerStrategy` fields. Parses natural language input to field updates. Shows confirmation before saving.  
**Implementation options:** Rule-based keyword extraction (V1) OR lightweight LLM call for field extraction only (if rules prove brittle). Decide at build time.  
**No deal-room or transactional access from this context.**

---

## Shared Behavior Rules

These apply across all agents. Cursor agents: enforce these at every agent implementation.

1. **No agent auto-sends to external users** without DS approval — except `agent_intake` (pre-signup), `agent_buyer` Mode A direct answers (bounded to document context), and `agent_seller` Mode A direct answers (bounded to document context and authored platform mechanics).

2. **No agent advances a deal stage.** Stage transitions are always initiated by a human role action.

3. **No agent has write access to `Offer`, `DealRoom.currentStage`, or `BuyerPoolEntry.seatStatus`.** Read-only for all agents except via explicit approved action flow.

4. **All agent outputs that enter a DS approval queue** use `status: 'pending_ds_approval'` and are blocked from delivery until `status` transitions to `'approved'` via DS action.

5. **DS identity is never exposed to external users.** All buyer-facing and seller-facing AI messages use `senderLabel: 'NextLevel AI'`. The DS persona (`senderRole: 'ds'`) is visible only in the DS portal.

6. **`agent_buyer` and `agent_seller` are context-isolated.** Buyer Agent has no access to seller context. Seller Agent has no access to buyer pool data, individual buyer intent signals, or offer details. Both share the same deal document index but with different retrieval contexts.

7. **Prototype agents use scripted responses only.** No live LLM calls in prototype build. All `agent_*` invocations in prototype return from a local mock response map keyed on `{ dealRoomId, scenario }`.

---

## File Locations

```
shared/types/agents.ts              — All agent context interfaces, mode types, output types
shared/types/chat.ts                — ChatMessage, EscalationItem (existing + extended)
shared/types/internalStaff.ts       — AIOutreachEntry, IntentSignal (extend here)
frontend/src/data/mock/agents/      — Scripted prototype responses per agent
backend/agents/                     — Stub folder — DO NOT inline agent logic in frontend
backend/agents/intake/
backend/agents/buyer/               — renamed from disposition/
backend/agents/seller/              — new
backend/agents/offer-feedback/
backend/agents/shared/rag/          — shared RAG infrastructure (production only)
```

> Backend stub folder must exist even in prototype. Prevents Cursor from inlining agent logic into React components. All agent invocations go through `backend/agents/` even when the response is a local mock.
>
> `backend/agents/shared/rag/` is a production-only stub. Create the folder in prototype but leave it empty. Both `agent_buyer` and `agent_seller` will import from here in production.

---

## Open Items (Pre-Build Flags Summary)

| # | Item | Blocking what | Owner | Status |
|---|------|---------------|-------|--------|
| 1 | RAG architecture spec | `agent_buyer` Mode A + `agent_seller` Mode A production builds | Nathan + Adam | Open — session scheduled |
| 3 | Field extraction approach for strategy modifier (rules vs. LLM) | Buyer strategy modifier | Nathan | Open — decide at build time |

**Resolved:**
- ~~Flag #2 — Intent signal thresholds~~ — LOCKED. See `agent_buyer` Mode C above.
- ~~Flag #4 — Pricing guidance trigger~~ — LOCKED. DS-initiated or seller-requested; Stage 5+ only. See `agent_seller` Mode B above.

Only flag #1 (RAG spec) requires an external decision before production build. Flag #3 can be resolved independently at build time.
