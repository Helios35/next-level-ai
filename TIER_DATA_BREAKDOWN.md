# Tier Data Breakdown

> Internal architectural reference. Not for external UI. UI labels use "Shared Deal Criteria" and "Unique Deal Criteria."

**Match type key**
- **Hard** — no alignment = deal invisible to buyer. No exceptions.
- **Soft** — affects DS ranking and seat allocation only. Never blocks visibility.

**Sides key**
- **Both** — exists on buyer strategy and seller deal room
- **Buyer only** — buyer strategy field only, no seller counterpart
- **Seller only** — seller deal room field only, no buyer counterpart

---

## Tier 1 — Universal

Applies to every asset type. Hard matching on both sides.

| Field | Match Type | Sides | Notes |
|---|---|---|---|
| Asset Type | Hard | Both | Residential Income or Land |
| Asset Sub-Type | Hard | Both | SFR / BFR / MF / Land |
| Geography | Hard | Both | MSA → City → ZIP hierarchy |
| Deal Stage | Hard | Both | Pre-Dev / In Dev / Delivered / Lease-Up / Stabilized |
| Equity Check Size | Hard | Buyer only | Min / Max range. Total deal size derived internally — buyer never calculates |
| Pricing Posture | Hard | Seller only | Exact Price / Price Range / Needs Guidance |

---

## Tier 2 — Sub-Type Group

Hard matching. Applies to a group of sub-types, not all asset types.

### Residential Income Group (SFR, BFR, MF — not Land)

| Field | Match Type | Sides | Notes |
|---|---|---|---|
| Unit Count Range | Hard | Both | Min / Max |
| Cap Rate Range | Hard | Both | Buyer sets min threshold. Seller value derived by Analyst — seller never enters |
| Product Type | Hard | Both | Detached / Townhomes / Duplexes / Mixed |
| Square Footage Range | Hard | Both | Min / Max |
| Garage Preference | Hard | Both | Required / Preferred / No preference |

### Land Group (Land only)

| Field | Match Type | Sides | Notes |
|---|---|---|---|
| Land Product Type | Hard | Both | SFD / Townhomes / Duplexes / MF |
| Target Unit Count Range | Hard | Both | Min / Max |
| Pricing Basis | Hard | Both | Per Lot / Per Acre |

---

## Tier 3 — Unique (Soft Match — Never Blocks Visibility)

Sub-type specific. Affects DS ranking and seat allocation only. All fields are buyer-side only.

### SFR Only

| Field | Match Type | Sides | Notes |
|---|---|---|---|
| HOA Tolerance | Soft | Buyer only | No / Limited / Any |
| Septic Tolerance | Soft | Buyer only | No / Any |
| Section 8 Tolerance | Soft | Buyer only | None / Limited / Any |
| Vintage Preference | Soft | Buyer only | Min year built |
| Bed / Bath Preference | Soft | Buyer only | Range |
| Value-Add Tolerance | Soft | Buyer only | Low / Medium / High |

### BFR Only

| Field | Match Type | Sides | Notes |
|---|---|---|---|
| Lease-Up Risk Appetite | Soft | Buyer only | Light / Moderate / Heavy |
| Target Price Per Unit | Soft | Buyer only | Range |
| Amenity Requirements | Soft | Buyer only | Pool / Clubhouse / Fitness / None required |
| Phase Sale Preference | Soft | Buyer only | Required / Preferred / Not needed |

### Multifamily Only

| Field | Match Type | Sides | Notes |
|---|---|---|---|
| Vintage Preference | Soft | Buyer only | Min year built |
| Value-Add Tolerance | Soft | Buyer only | Core / Light / Moderate / Heavy |

### Land Only

| Field | Match Type | Sides | Notes |
|---|---|---|---|
| Target Basis | Soft | Buyer only | Per Lot range or Per Acre range |
| Min Density Preference | Soft | Buyer only | Units per buildable acre |
| Required Entitlement Depth | Soft | Buyer only | Raw OK / Submitted OK / Approved required / Recorded required |
| Required Development Depth | Soft | Buyer only | Raw only / Entitled / Horizontal underway / Finished lots only |
| Phased Takedown Preference | Soft | Buyer only | Required / Preferred / Not needed |

---

## Open Questions

1. **Tier 1 asymmetry** — Equity Check Size (buyer) and Pricing Posture (seller) have no counterpart on the opposite side. Are these being matched against each other, or are they context-only fields?
2. **Tier 3 is entirely buyer-side** — DS ranks buyers against each other using buyer preferences only. No seller signal at Tier 3. Intentional?
3. **BFR seller data gap** — seller knows their amenity package, lease-up status, and price per unit target. None captured as seller fields. A buyer requiring a pool can't be matched against a seller who has one.
