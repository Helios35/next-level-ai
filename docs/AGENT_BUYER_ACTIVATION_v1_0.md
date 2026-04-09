# Agent Buyer — Mode D: Activation Conversation Spec

**Version:** 1.0
**Status:** Active — Source of Truth
**Last Updated:** April 2026
**Audience:** Nathan Ivy (Next Sketch LLC), Cursor agents

**Parent document:** `AGENT_ARCHITECTURE_v1_2.md`
**Companion documents:** `BUSINESS_RULES_v1_0.md` (Rules 1.5, 3.1–3.7, 4.1–4.6), `SITE_ARCHITECTURE_v1_6.md` (Bucket 2 — Buyer flow)

---

## Purpose

Defines `agent_buyer` **Mode D** — the post-signup buyer activation conversation. This is the AI-guided onboarding arc that runs immediately after account creation for all buyers. It covers intent capture, strategy creation guidance, the qualification checkpoint, and exit handling.

Mode D is not in `AGENT_ARCHITECTURE_v1_2.md`. It is added here as the fourth mode of `agent_buyer`. The naming convention and shared behavior rules from the parent doc apply in full.

---

## How to Read This Document

- **LOCKED** — Decision made. Build from this. Do not deviate.
- **⚠️ PRE-BUILD FLAG** — Needs a decision before this piece is built.
- **PROTOTYPE NOTE** — How the prototype simulates this. Swap for real implementation in production.

---

## Scope and Isolation

Mode D runs in the **onboarding shell only** (`/onboarding/*`). It is context-isolated from the deal room agent (Modes A/B/C):

- No access to deal room data, seat data, or other buyers
- No access to deal documents
- No DS approval gate — Mode D is **fully autonomous**
- Lifecycle ends when strategy is saved or buyer exits without saving

---

## Mode D — Activation Conversation (`mode: 'activation'`) — LOCKED

**Trigger:** User completes account creation and selects Buyer, Both, or Broker at onboarding.
**Zone:** Onboarding shell (`/onboarding`, `/onboarding/create-strategy`, `/onboarding/qualification`)
**Lifecycle:** Begins immediately post-signup. Ends when (a) qualification is complete, or (b) buyer exits at Phase 4 checkpoint.
**Human gate:** None. Fully autonomous.
**Identity:** "NextLevel AI" — same persona as all buyer-facing agent modes.

```typescript
interface BuyerActivationContext {
  userId: string;
  userName: string;                          // first name only for greeting
  accountRole: 'buyer' | 'both' | 'broker';
  intentSignals: IntentCaptureSignal[];      // collected during Phase 1
  intentRating: 'high' | 'medium' | 'low';  // assigned at end of Phase 1, never shown to buyer
  strategyDraft: Partial<BuyerStrategy>;     // pre-populated from Phase 1 signals
  strategyId?: string;                       // set when strategy is saved
  qualificationStarted: boolean;
  qualificationComplete: boolean;
}

interface IntentCaptureSignal {
  dimension: 'asset_type' | 'geography' | 'deal_size' | 'timeline' | 'capital_readiness' | 'experience';
  value: string;
  strength: 'strong' | 'soft'; // strong = specific, soft = vague or hedging
}
```

---

## Conversation Arc — Five Phases

### Phase 1 — Welcome + Intent Capture

**Route:** `/onboarding`
**Purpose:** Understand what the buyer is looking for. Assign intent ranking. Pre-populate strategy fields.

**Agent behavior:**
- Greet buyer by first name. Do not use company name in the greeting.
- Ask open-ended questions to surface buying intent across six dimensions: asset type, geography, deal size, timeline, capital readiness, and experience level.
- Do NOT sequence all six as a list. Surface them conversationally across 2–3 natural exchanges.
- Capture responses as `IntentCaptureSignal[]`. Classify each as `strong` or `soft`.
- Use signals to pre-populate `strategyDraft` fields before routing to Phase 2.
- Stop at 4 exchanges maximum. If fields are still incomplete after 4 exchanges, proceed with what is available.

**Intent ranking assignment — LOCKED:**

Assigned at the end of Phase 1. Written to `BuyerProfile.intentRating`. Never shown to the buyer.

```
HIGH:
  - 4 or more dimensions answered with strong signals, AND
  - Timeline is specific (e.g., "actively looking," "next 90 days," "Q3 close"), AND
  - Capital readiness is confirmed (e.g., "equity in hand," "pre-approved," "discretionary capital ready")

MEDIUM:
  - 2–3 dimensions answered with strong signals, OR
  - Timeline is present but soft (e.g., "sometime this year," "when the right deal comes"), OR
  - Capital readiness mentioned but unconfirmed

LOW:
  - Fewer than 2 strong signals, OR
  - Timeline is absent or indefinite, OR
  - Capital readiness is absent or exploratory
```

**Guardrails — Phase 1:**
- Do not ask qualification fields here (capital source, approval process, equity check size, firm type). Those belong in Phase 4.
- Do not tell the buyer their intent ranking under any circumstances.
- Do not ask more than 4 questions before routing to Phase 2.

---

### Phase 2 — Strategy Creation Guidance

**Route:** `/onboarding/create-strategy`
**Purpose:** Guide buyer through completing Tier 1 and Tier 2 strategy fields. Tier 3 is optional, nudged once.

**Agent behavior:**
- Present the pre-populated `strategyDraft` from Phase 1 as a starting point. Do not present a blank form.
- Walk buyer through any missing Tier 1 and Tier 2 fields conversationally.
- After Tier 1 and Tier 2 are complete, surface Tier 3 once as optional. If buyer skips, do not re-ask.
- When Tier 1 and Tier 2 are complete: save strategy, set `status: 'broadcasting'`, trigger match calculation immediately (Business Rules 4.4).

**Blocking rule — LOCKED:** Strategy cannot be saved until Tier 1 AND Tier 2 are complete. Do not route to Phase 3 on an incomplete strategy.

**Guardrails — Phase 2:**
- Do not explain the tier architecture to the buyer. Fields are just fields.
- If the buyer asks how matching works, one sentence only: "Your strategy broadcasts against active deals and surfaces matches based on alignment."
- Do not promise a specific match count before strategy is saved.

---

### Phase 3 — Match Reveal

**Route:** `/onboarding/create-strategy` (post-save state) or redirect to `/buyer-matches`
**Purpose:** Confirm strategy is live and matches have populated.

**Agent behavior:**
- Confirm the strategy is saved and broadcasting.
- Surface current match count. If 0 matches: acknowledge neutrally and note that new deals are added regularly.
- Transition to Phase 4 checkpoint without delay.

**Guardrails — Phase 3:**
- Show match count only. Do not characterize match quality.
- Do not apologize for a low or zero match count. State it matter-of-factly and move forward.
- Do not name, preview, or describe any specific deal at this stage.

---

### Phase 4 — Qualification Checkpoint

**Route:** `/onboarding/create-strategy` (inline prompt or modal after match reveal)
**Purpose:** Natural transition from strategy to qualification. This is not a force — buyer can exit.

**Agent behavior:**
- Surface a single, low-friction transition prompt after the match reveal.
- Framing: completing a buyer profile strengthens their position when DS allocates seats. Do not frame as required.
- If buyer continues → route to `/onboarding/qualification` and begin qualification arc.
- If buyer declines or exits → log `qualificationStarted: false` and trigger nudge sequence (Phase 5).

**Qualification arc (if buyer continues):**

Collect Fields of Truth in this order. These write to `buyer_qualifications` table — same data visible on Profile page.

1. Capital source (equity, debt, both)
2. Equity check size (dollar range)
3. Approval process (discretionary, committee, other)
4. Relevant experience (years, deal count, or asset types)
5. Firm type (Solo Investor / Builder / Land Developer / Operator / Sponsor / Capital Allocator / Other)

When all five fields are collected: set `qualification_complete: true`. Mode D lifecycle ends.

**Guardrails — Phase 4:**
- Do not frame qualification as required. It is never a hard gate.
- Do not tell the buyer they will be ranked lower without qualification. Say it strengthens their position — nothing more.
- Do not ask questions that duplicate strategy fields (asset type, geography, deal size). No overlap between Phases 2 and 4.
- Do not re-ask intent-capture questions from Phase 1.

---

### Phase 5 — Exit Handling and Nudge Trigger

**Trigger:** Buyer exits at Phase 4 checkpoint without completing qualification.

**System behavior — LOCKED:**
- Log `qualificationStarted: false`, `qualificationComplete: false`.
- Schedule nudge sequence per Business Rules 3.5:
  - Day 3 — informational nudge: what buyer qualification is and why it matters
  - Day 7 — ranking nudge: how qualification improves seat allocation odds
  - Day 14 — urgency nudge: direct call to action
- If `intentRating === 'high'` and Day 14 fires without qualification complete: notify DS directly (Business Rules 3.6). No buyer-facing message changes.

**Agent behavior at exit:**
- Acknowledge the exit without friction. No guilt language. No repeated CTA.
- Confirm the strategy is live and matches are populating.
- Remind buyer that their buyer profile can be completed anytime from Settings → Profile.

**Mode D ends here regardless of qualification status.**

---

## Guardrails — Mode D (All Phases)

These apply across all five phases. Enforce at the agent level.

| # | Rule |
|---|------|
| G-1 | Never reveal the buyer's intent ranking to the buyer under any circumstances. |
| G-2 | Never ask qualification fields (capital source, approval process, equity check, firm type) during Phases 1 or 2. |
| G-3 | Never make deal-specific recommendations. No deal inventory is visible in this context. |
| G-4 | Never tell the buyer how many other buyers exist on the platform. |
| G-5 | Never promise outcomes ("you'll get a seat," "you'll see more matches if you qualify"). |
| G-6 | Never ask more than 4 questions before a meaningful action occurs (strategy save or qualification start). |
| G-7 | No DS escalation path in Mode D. All interactions are fully autonomous. If the agent cannot proceed, surface a fallback: "You can complete this anytime from your profile." |
| G-8 | Never mention that a human may review the buyer's information. |

---

## File Locations

```
backend/agents/buyer/activation/        — Mode D implementation stub
shared/types/agents.ts                  — Extend BuyerAgentMode to add 'activation'
shared/types/agents.ts                  — Add BuyerActivationContext and IntentCaptureSignal interfaces
frontend/src/data/mock/agents/          — Scripted prototype activation conversation
```

**PROTOTYPE NOTE:** Scripted conversation with 3–4 pre-written exchanges across Phases 1–3. Qualification arc scripted as a 5-question sequence. Intent ranking hardcoded per mock scenario. No LLM call in prototype.

---

*Last updated: April 2026*
