# Strata NextLevel — Business Rules

> **Version:** 1.0
> **Last Updated:** April 2026
> **Status:** Active — Source of Truth
>
> **Purpose:** Single source of truth for every "if this, then that" decision in the NextLevel platform. Written in plain language — no code, no implementation detail. All rules are numbered so agents and humans can reference them precisely (e.g., "implement per Rule 3.2").
>
> **Companion documents:**
> - Classification systems (statuses, roles, labels, values) → **TAXONOMY_v1_0.md**
> - Page structure, routes, and navigation → **SITE_ARCHITECTURE_v1_6.md**
> - What is being built → **PRODUCT_REQUIREMENTS_v2_0.md**

---

## Glossary

Terms used throughout this document. Full definitions in **TAXONOMY_v1_0.md**.

| Term | Short Definition |
|------|-----------------|
| **Buyer-Seller** | Unified external user type — can act as buyer, seller, or both |
| **DS** | Disposition Specialist — internal role owning Stages 6–9 |
| **Deal Room** | Single-asset transaction workspace |
| **Listing** | Seller-facing term for a deal room submission |
| **Seat** | One of 3 concurrent buyer positions in an active deal room |
| **Fields of Truth** | Buyer qualification data — slow-changing, organization-level |
| **Soft gate** | Access is not blocked, but outcomes are affected (e.g., ranked lower) |
| **Hard gate** | Access is fully blocked until condition is met |
| **Market Tested** | Status when buyer pool is exhausted with no offers received |
| **Dormant** | Status when a deal is paused with no active buyer exposure |

---

## Rules Index

1. [Onboarding Rules](#1-onboarding-rules)
2. [Buyer Access Rules](#2-buyer-access-rules)
3. [Buyer Qualification Rules](#3-buyer-qualification-rules)
4. [Buy Strategy Rules](#4-buy-strategy-rules)
5. [Matching Rules](#5-matching-rules)
6. [Deal Room Creation Rules](#6-deal-room-creation-rules)
7. [Deal Lifecycle Rules](#7-deal-lifecycle-rules)
8. [Seat Assignment Rules](#8-seat-assignment-rules)
9. [Offer Rules](#9-offer-rules)
10. [Market Tested Rules](#10-market-tested-rules)
11. [Dormant Rules](#11-dormant-rules)
12. [AI Agent Rules](#12-ai-agent-rules)
13. [Credits and Monetization Rules](#13-credits-and-monetization-rules)
14. [Notification Rules](#14-notification-rules)
15. [Internal Role Rules](#15-internal-role-rules)

---

## 1. Onboarding Rules

**1.1** Every user goes through three sequential buckets: Universal Onboarding → Role-Dependent Post-Onboarding → Active Platform Use. No user skips a bucket.

**1.2** Universal Onboarding (Bucket 1) is identical for all users. It captures: name, email, password, company name, and platform role selection (Buyer / Seller / Both / Broker).

**1.3** Users who select Broker at onboarding follow the Buyer path in V1. Broker flag is stored silently. No separate Broker experience exists.

**1.4** No AI conversation occurs before account creation. The landing page is the qualification and conversion surface. AI engagement begins post-signup, inside the platform.

**1.5** After account creation, routing depends on platform role:
- Buyer or Both → AI activation conversation → strategy creation → qualification nudge
- Seller or Both → deal room creation flow
- Broker → same as Buyer

**1.6** Ownership acknowledgment is a hard gate for sellers. A deal room cannot go live until the seller checks the ownership acknowledgment checkbox. No exceptions.

**1.7** Tier 1 and Tier 2 deal room data are mandatory hard gates for sellers. A deal cannot be submitted for review without both tiers complete. Tier 3 is optional — nudged but never required.

---

## 2. Buyer Access Rules

**2.1** A buyer with no strategy and no qualification receives no matches and cannot request deal room access.

**2.2** A buyer with a strategy but no qualification receives matches and can request deal room access. They are ranked lower by DS for seat allocation. This is a soft gate — access is not blocked.

**2.3** A buyer with qualification but no strategy is trusted but receives no matches. No strategy means no criteria to match against.

**2.4** A buyer with both a strategy and qualification receives full access — matches, deal room access requests, and higher DS ranking for seat allocation.

**2.5** Qualification is never a hard gate on deal room access. Unqualified buyers can always receive matches and request access. The only effect of being unqualified is lower DS ranking.

**2.6** A buyer cannot request access to a Coming Soon deal (Stage 6). They can preview it and indicate interest only. Access requests open at Stage 7 (Active Disposition).

**2.7** *(Removed April 2026)* — Success fee gate removed. Buyers enter deal rooms directly without any fee acknowledgment.

**2.8** A buyer who is denied a seat by DS is placed in the Wait Queue. They are not removed from the deal — they remain visible to DS and can be seated if a seat opens.

---

## 3. Buyer Qualification Rules

**3.1** Qualification is collected via AI agent-guided conversation after strategy creation. It flows from a natural checkpoint in the same conversation arc — the AI agent does not restart a separate session.

**3.2** Buyers can also view and edit all qualification fields at any time from their profile page. The profile page and the AI conversation write to the same Fields of Truth. Editing one updates both views.

**3.3** Qualification does not feed the matching engine. It is used only by DS for seat allocation ranking and access decisions.

**3.4** Buyer intent ranking (High / Medium / Low) is assigned by the AI agent during the activation conversation. It is not self-reported by the buyer.

**3.5** Qualification nudge sequence for buyers who skip or delay after strategy creation:
- Day 3 — informational nudge: what qualification is and why it matters
- Day 7 — ranking nudge: how qualification improves seat allocation odds
- Day 14 — urgency nudge: direct call to action

**3.6** If a buyer with a High intent ranking has not completed qualification after Day 14, the DS is notified directly. This is the only automatic DS notification tied to qualification delay.

**3.7** DS can see a buyer's qualification status and the timestamp of when it was last updated. DS cannot edit a buyer's qualification fields — these are buyer-owned.

---

## 4. Buy Strategy Rules

**4.1** A buyer must complete Tier 1 and Tier 2 criteria before a strategy can go live (Broadcasting). Tier 3 is optional — nudged but never blocks activation.

**4.2** A strategy in Draft state is not broadcasting and generates no matches. Draft strategies are only visible to the buyer.

**4.3** A buyer can have multiple active strategies simultaneously. Each strategy broadcasts independently.

**4.4** Matches populate immediately when a strategy is saved and moves to Broadcasting. There is no delay.

**4.5** A buyer can toggle a strategy between Broadcasting and Paused at any time. Paused strategies do not generate new matches but retain existing match history.

**4.6** After a strategy is saved, the AI agent presents a natural checkpoint asking if the buyer wants to continue into qualification. This is not a force — the buyer can exit and the nudge sequence begins (see Rule 3.5).

---

## 5. Matching Rules

**5.1** Matching is driven exclusively by Shared Deal Criteria (Tier 1) and Unique Deal Criteria Tier 2. Qualification fields never feed the matching engine.

**5.2** Tier 1 (Universal/Shared Deal Criteria) is a hard match. No alignment on Tier 1 means the deal is invisible to the buyer's strategy — it does not appear in matches.

**5.3** Equity Check Size (buyer) is cross-matched against the seller's asking price as a Tier 1 hard match. The buyer's equity check size range must cover the seller's asking price. If the seller's asking price falls outside the buyer's equity check size range, the deal is invisible to that buyer's strategy — same as any other Tier 1 mismatch. Pricing Posture (seller) signals to the engine how to interpret the seller's price value: Exact Price uses the exact figure, Price Range uses the range midpoint or spread, Needs Guidance treats the price as unset and does not block matching.

**5.4** Tier 2 (Sub-Type Group Shared) is a hard match. No alignment on Tier 2 means the deal is invisible to the buyer's strategy.

**5.5** Tier 3 (Unique/sub-type specific) is a soft match. Tier 3 affects match ranking and DS seat allocation context only. A Tier 3 mismatch never blocks deal visibility.

**5.6** Match Score is a 0–100% alignment metric calculated from Shared and Unique Deal Criteria. It is displayed to buyers on deal cards and in the Deal Preview Modal.

**5.7** A deal in Coming Soon state (Stage 6) is visible to matched buyers as a preview-only card. Buyers cannot request access — they can only indicate interest.

**5.8** A deal in Active Disposition (Stage 7) is fully visible to matched buyers. Buyers can preview and request access.

---

## 6. Deal Room Creation Rules

**6.1** One asset per deal room. A single deal room cannot contain multiple assets. This is a locked MVP rule.

**6.2** AI agent guides the seller through deal room creation. Tier 1 and Tier 2 data entry are mandatory. AI nudges Tier 3 but cannot require it.

**6.3** A deal room cannot be submitted for review without the ownership acknowledgment checkbox completed. This is a hard gate — the system blocks submission.

**6.4** A deal room submission triggers Stage 2 (Submission Review) → Stage 3 (QA Review) automatically. No DS action is required to advance from Stage 2 to Stage 3.

---

## 7. Deal Lifecycle Rules

**7.1** Every deal progresses through 9 stages. No stage is skipped in the forward direction.

**7.2** Stages 2–4 are bidirectional. A deal can be returned to a previous stage. Every return requires documented notes from the returning party. No undocumented stage reversals.

**7.3** Stages 1–5 are internal review and setup stages. They are not surfaced in the buyer's deal progress tracker. Buyers only see Stages 6–9.

**7.4** Stage 3 (QA Review): AI checklist agent runs first. If the package is clean, it auto-advances to Stage 4. If exceptions are flagged, the deal is routed to human Admin for review. Admin can advance to Stage 4 or return to the seller.

**7.5** Stage 4 (Financial Analysis): AI analyst agent generates a financial memo. Human Analyst reviews and authorizes before any output is communicated to the seller. Analyst outcomes are irreversible — no undoing a Stage 4 decision.

**7.6** Stage 5 (Decision Point): Outcome options depend on Analyst determination.
- Green outcome: Seller can proceed to Listing Agreement, upgrade or top up credits, pause, or withdraw
- Yellow/Red outcome: Seller can request changes, optimize, pause (21-day guardrail), or withdraw

**7.7** Stage 6 (Coming Soon): DS receives an automatic task notification to handle the listing agreement off-platform. DS marks the task complete in the platform to advance the deal to Stage 7. The deal is visible to matched buyers in preview-only mode during this stage.

**7.8** Stage 9 (Accepted Offer): When DS confirms the winning offer, deal status moves to `accepted_offer` — not `closed`. Accepted offer and actual closing are distinct events. The deal status only moves to `closed` when DS marks the Closed milestone in the post-acceptance tracker.

**7.9** All credit and upgrade nudges surface at Stage 5 only after a Green (Approve) Analyst outcome. These prompts do not appear before viability is confirmed.

---

## 8. Seat Assignment Rules

**8.1** Maximum 3 concurrent seats per deal room at all times. This cap is absolute — no exceptions.

**8.2** DS controls all seating. No auto-seating occurs without a DS action, with one exception (see Rule 8.3).

**8.3** Path 1 — DS-Invited Buyer: DS sends a direct invite to a specific buyer.
- If a seat is available when the buyer accepts → buyer is seated immediately. The invite is the approval. No second DS confirmation required.
- If all 3 seats are full when the buyer accepts → buyer moves to Pending with priority status.

**8.4** Path 2 — Buyer-Initiated Request: A buyer discovers a deal and submits an access request without being invited.
- Buyer goes directly to Pending. No auto-seating.
- DS reviews and approves or rejects.

**8.5** When a seat opens, the priority queue determines who fills it:
1. DS-invited buyers in Pending — sorted by invite date, oldest first
2. Self-requested buyers in Pending — only considered after all invited buyers in Pending are exhausted, sorted by request date, oldest first

DS-invited buyers always take priority over self-requested buyers, regardless of when the self-request was submitted.

**8.6** When a buyer is denied a seat, the AI Disposition Engine sends a structured denial message. The buyer moves to Wait Queue. DS does not write the denial message — AI generates it, DS authorizes delivery.

**8.7** When a buyer is approved for a seat, the AI Disposition Engine sends a welcome message. The buyer can then enter the deal room immediately.

---

## 9. Offer Rules

**9.1** Offers are only accepted during Stage 8 (Offer Negotiation). Buyers cannot submit offers in Stage 7.

**9.2** Maximum 3 offer rounds per deal. This is a firm platform rule — no exceptions, no extensions.

**9.3** DS sets the deadline for each round. Default is 48–72 hours. DS has discretion to adjust per round.

**9.4** Offers are sealed. Buyers cannot see other buyers' offer amounts or terms at any point during negotiation.

**9.5** Seller sees all offers in full — amounts, terms, and buyer credential profiles.

**9.6** Buyers see other buyers in the pool at credential level only. No offer details from other buyers are visible.

**9.7** A buyer is not required to improve their offer in a subsequent round. An existing offer stands automatically. If no offer is submitted in a round, the buyer is treated as having passed.

**9.8** After Round 3, no further offers are accepted. DS advances to Stage 9 regardless of outcome.

**9.9** The AI Disposition Engine generates structured improvement feedback for each buyer after every round. DS reviews and authorizes all feedback before it is delivered to buyers. DS does not write this feedback — AI generates it, DS authorizes it.

**9.10** A buyer's own offer is displayed with a gold border in the deal room. No other visual distinction between offers is surfaced to buyers.

**9.11** When DS confirms the winning offer, the competitive phase is frozen. No further offers are accepted. Non-winning buyers receive an anonymized outcome message: "A winning offer has been accepted. The deal is now under contract."

---

## 10. Market Tested Rules

**10.1** DS can only mark a deal as Market Tested when all four buyer pool exhaustion conditions are simultaneously true:
1. All 3 seats have been filled sequentially
2. All seated buyers have formally passed or allowed their underwriting window to expire
3. No written LOIs have been received
4. All eligible matched buyers in the filtered pool have been invited and passed

**10.2** Market Tested is set by DS only. The system cannot auto-set Market Tested — it requires a deliberate DS action.

**10.3** When a deal is marked Market Tested, the seller is notified and presented with four options:
- Adjust pricing or modify structure → deal re-enters Stage 7
- Pause → deal moves to Dormant
- No response within DS follow-up window → deal moves to Dormant
- Withdraw → deal status moves to Withdrawn

**10.4** A Market Tested deal remains visible in the seller's deal room list with a Market Tested status badge. It is not hidden or archived.

**10.5** DS portal surfaces a dedicated Market Tested Queue showing all deals awaiting a seller decision.

---

## 11. Dormant Rules

**11.1** A deal enters Dormant in three scenarios:
1. Document collection stalls — no seller response within 21 days of initial document request (system-triggered)
2. Seller elects to pause after a Market Tested outcome and declines adjustment
3. Seller voluntarily requests a pause (DS discretion)

**11.2** The 21-day document stall trigger is system-automated. No DS action is required to move the deal to Dormant in this scenario.

**11.3** A Dormant deal has no active buyer exposure and no open seats.

**11.4** A Dormant deal remains visible in the seller's deal room list with a Dormant badge. It is not hidden or archived.

**11.5** DS can reactivate a Dormant deal on seller request. Reactivation returns the deal to Active status and re-enters it at the appropriate stage.

**11.6** Dormant deals are visually separated from the active pipeline in both Admin and DS portals — present but de-emphasized.

---

## 12. AI Agent Rules

**12.1** The AI Disposition Engine executes, routes, and recommends. It never authorizes. Every structural, economic, and market gate requires human authorization.

**12.2** Authorization boundaries by stage:

| Gate | Human Owner | What They Authorize |
|------|-------------|---------------------|
| Stage 3 | Admin | Document completeness — exception handling only |
| Stage 4 | Analyst | Deal viability — reviews and authorizes AI memo |
| Stage 5 | DS (escalation) | Complex seller situations, pricing negotiation, structural edge cases |
| Stage 6 | DS | Listing agreement task completion |
| Stage 7 | DS | Every seat allocation — AI recommends, DS authorizes |
| Stage 8 | DS | Round deadlines; authorizes AI-generated buyer feedback before delivery |
| Stage 9 | DS | Winning offer confirmation; post-acceptance milestones |
| Market Tested | DS | Buyer pool exhaustion declaration |
| Dormant | DS | Reactivation |

**12.3** AI question routing in Stage 7 deal room Q&A:
- Document retrieval questions → AI answers directly
- Negotiation-adjacent or market judgment questions → routed to human DS
- Seller-specific questions → routed to seller

**12.4** The handoff trigger from AI to DS is a two-level system:
- **Soft signal:** Buyer opens the offer form — DS receives an awareness notification. No handoff occurs.
- **Hard trigger:** Buyer submits the completed offer form — DS is formally notified and steps into the buyer-facing process. This is the logged handoff point.

**12.5** At Stage 5, the AI agent leads the seller outcome conversation. The AI escalates to the human DS when:
- The seller is resistant or disputes the outcome
- Pricing negotiation is required
- Structural complexity exceeds AI capability
- The seller explicitly requests a human

When the DS steps in, the handoff is transparent — the seller is informed.

**12.6** *(Updated April 2026)* The buyer deal room chat panel presents two distinct channels via a toggle: an AI channel (automated platform responses) and a Specialist channel (DS-composed and DS-authorized messages). Buyers can see which channel they are on at all times. The platform identity label for the Specialist channel is TBD pending the branding sprint — it will not explicitly expose the DS's name or say "Human," but it makes clear that a human specialist is involved. The prior pattern of representing the DS as a fully automated system is retired. This aligns with the rebranding direction documented in `INTERNAL_INTERFACE_v1_0.md` Section 5.2.

**12.7** The AI Chat Script Spec must exist before Stage 7 buyer Q&A and Stage 6 buyer-facing behavior can be implemented. Frontend components can be built without it. AI routing behavior cannot be implemented until the spec is complete.

---

## 13. Credits and Monetization Rules

**13.1** Sellers receive 400 free credits on their first deal room. No credits are charged for the first deal room activation.

**13.2** Additional deal room activations cost credits. Credits are purchased in-platform at $100 per credit.

**13.3** Credit nudges and upgrade prompts surface at Stage 5 only after a Green (Approve) Analyst outcome. They do not appear before viability is confirmed.

**13.4** If a seller attempts to activate a deal room with insufficient credits, the credit gate modal surfaces automatically. The seller must purchase credits before proceeding. The deal room cannot go live without sufficient credits.

**13.5** *(Updated April 2026)* There is no buyer success fee. Commission is collected from the seller prior to the deal room going live. Buyers enter deal rooms without any fee gate.

**13.6** *(Removed April 2026)* — See updated Rule 13.5.

**13.7** Payment information is never entered or stored by the platform on behalf of the user. Buyers and sellers enter payment details themselves.

---

## 14. Notification Rules

**14.1** Seller notifications and buyer notifications are configured independently. A user acting as both buyer and seller manages two separate notification preferences.

**14.2** Notification cadence options: Real Time / Every X Hours (1–24) / Every X Days (1–30) / Weekly.

**14.3** Notification triggers by audience:

| Trigger | Audience |
|---------|---------|
| Deal match found | Buyer |
| Access request status update (approved / denied / pending) | Buyer |
| Offer round opened or closed | Buyer |
| Deal status change (Dormant, Market Tested, Accepted Offer, Closed) | Buyer + Seller |
| Qualification nudge (Day 3 / Day 7 / Day 14) | Buyer |
| Listing Agreement Required task | DS |
| High intent buyer — Day 14 qualification not complete | DS |
| Seat approval required | DS |
| Buyer offer submitted (hard trigger) | DS |
| Market Tested — seller path selection needed | DS |
| System messages | All |

---

## 15. Internal Role Rules

**15.1** Internal accounts cannot be self-created. Admin is the only role that can provision internal accounts for DS, Analyst, and other Admins.

**15.2** Internal users access the platform via a separate login at `/internal/login`. No internal user shares a login with external users.

**15.3** Admin responsibilities:
- Owns Stage 3 as exception handler — engages only when AI flags an exception
- Does not perform financial analysis
- Can advance a deal to Analyst or return it to seller with a documented reason
- Full pipeline visibility — all deals, all stages, all statuses
- Manages client and staff assignments

**15.4** Analyst responsibilities:
- Owns Stage 4 — reviews AI-generated financial memo
- Does not perform analysis from scratch — reviews and authorizes AI output
- Three outcomes: Approve / Return to Admin / Reject
- All Stage 4 decisions are irreversible — no undoing after submission
- A confirmation modal is required before any Analyst decision is submitted
- Owns the economic gate — no deal advances to Active Disposition without Analyst approval

**15.5** DS responsibilities:
- Owns Stages 6–9 and post-disposition outcomes
- Primary role: seller relationship manager, deal negotiator, offer manager — not process executor
- Controls all seat allocation — AI recommends, DS authorizes every seat
- Sets offer round deadlines
- Reviews and authorizes all AI-generated buyer feedback before delivery
- Marks deals as Market Tested, manages Dormant reactivation
- Logs all five post-acceptance milestones
- Receives soft signal when buyer opens offer form
- Receives hard trigger notification when buyer submits offer form

**15.6** The Analyst role owns the economic gate exclusively. No deal advances past Stage 4 without Analyst authorization — Admin cannot override this.

**15.7** DS portal default landing is the Task Queue (`/ds/tasks`). The Task Queue shows all items needing DS action today — not the full pipeline.

---

## Edge Cases and Exceptions

**E.1** A buyer who passes on a deal cannot be re-seated in the same deal room. Pass is terminal for that buyer-deal relationship.

**E.2** If a buyer in Wait Queue is later invited directly by DS, they move to Invited status. The DS invite supersedes their Wait Queue position.

**E.3** If a seller reaches Stage 5 with a Yellow or Red outcome and agrees to the changes specified by the AI agent, the deal routes back immediately. If the seller is resistant, the situation escalates to the human DS — not back to AI.

**E.4** If a deal reaches Market Tested and the seller does not respond within the DS follow-up window, the deal automatically moves to Dormant. No seller action required for Dormant to trigger in this scenario.

**E.5** Buyers see other buyers in the pool as anonymized credentials only (e.g., "Investor #1042"). A buyer's own entry is labeled "You" with their seat position and total count (e.g., "Seat 2 of 3").

**E.6** A seller can view the Deal Preview Modal from Stage 5 onward as a read-only confirmation of what buyers will see. No editing is possible from this view. All edits go through the deal room build flow.

**E.7** If no buyer submits an offer in a given round, they are treated as having passed. DS advances to the next round or to Stage 9 if it was Round 3.

**E.8** Tier A and Tier B in the internal SOP both map to Green / Approve on the platform. Tier C maps to Red / Reject. Yellow routes through Return to Admin. Tier A/B/C language does not appear anywhere in the platform UI.

**E.9** *(Added April 2026)* Before a buyer can submit an offer, they must declare their intent: "Indicate Interest to Offer" or "Pass." This is the Offer Intent Gate. It renders at the top of the Offer Round section when `offerIntent === 'undecided'`.

**E.10** *(Added April 2026)* If a buyer selects "Pass," a Watch/Pass modal opens. The buyer must select a reason before the pass is confirmed. On confirmation, their seat is released (Rule E.1) and their feedback is recorded for market intelligence purposes.

**E.11** *(Added April 2026)* If a buyer selects "Indicate Interest to Offer," the offer form is revealed. The `recordOfferIntent` stub is called. The intent gate collapses and does not re-render for this session.

**E.12** *(Added April 2026)* Buyers can only see **seated** buyers in the Buyer Pool panel. Pending buyers, passed buyers, and the recent activity timeline are seller-only views. This prevents buyers from inferring deal momentum or competitive dynamics beyond their immediate cohort.

---

## Open Questions

| # | Question | Blocking? |
|---|----------|-----------|
| OQ-1 | What is the exact DS follow-up window before a Market Tested deal auto-moves to Dormant? Duration not yet defined. | No — does not block build |
| OQ-2 | What is the buyer's underwriting window expiration period? Referenced in Market Tested Rule 10.1 — duration not yet defined. | No — does not block build |
| OQ-3 | AI Chat Script Spec — question routing logic for Stage 7 buyer Q&A is referenced in Rule 12.3 but the spec does not yet exist. | Yes — blocks Stage 7 AI implementation |

---

*Last updated: April 2026*
