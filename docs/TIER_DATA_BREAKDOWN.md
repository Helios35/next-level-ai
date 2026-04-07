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
| Current Development Status | Hard | Both | Granular two-level field. Parent categories: Pre-Construction / Construction / Delivery / Lease-Up / Stabilized. Stored value is the granular selection, not the parent category. |
| Equity Check Size | Hard | Buyer only | Min / Max range. Total deal size derived internally — buyer never calculates |
| Pricing Posture | Hard | Seller only | Exact Price / Price Range / Needs Guidance |

**Current Development Status — Two-Level Option Set**

```
Pre-Construction
  └── Raw / No Submission
  └── Concept Plan Prepared
  └── Submitted for Entitlement
  └── Entitled / Approved
  └── Recorded / Platted

Construction
  └── Horizontal Under Construction
  └── Horizontals Complete
  └── Vertical Under Construction
  └── Vertical Substantially Complete

Delivery
  └── Delivered — CO in Process
  └── Delivered — CO Complete

Lease-Up
  └── Lease-Up Underway

Stabilized
  └── Stabilized Operations
```

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

> `currentDevelopmentStatus` has been moved to Tier 1 — it is captured in `DealRoomSharedCriteria` and is not re-captured in Tier 2.

### Land Group (Land only)

| Field | Match Type | Sides | Notes |
|---|---|---|---|
| Land Product Type | Hard | Both | SFD / Townhomes / Duplexes / MF |
| Target Unit Count Range | Hard | Both | Min / Max |
| Pricing Basis | Hard | Both | Per Lot / Per Acre |

> `currentDevelopmentStatus` has been moved to Tier 1 — it is captured in `DealRoomSharedCriteria` and is not re-captured in Tier 2.

---

## Tier 3 — Unique (Soft Match — Never Blocks Visibility)

Sub-type specific. Affects DS ranking and seat allocation only. Fields exist on both seller and buyer sides — seller enters the actual property value, buyer enters their preference or tolerance. The matching engine compares the two.

### SFR Only

| Field | Match Type | Sides | Notes |
|---|---|---|---|
| HOA Tolerance | Soft | Both | Seller: actual HOA status. Buyer: tolerance (No / Limited / Any) |
| Septic Tolerance | Soft | Both | Seller: actual septic status. Buyer: tolerance (No / Any) |
| Section 8 Tolerance | Soft | Both | Seller: actual Section 8 policy. Buyer: tolerance (None / Limited / Any) |
| Vintage Preference | Soft | Both | Seller: actual year built. Buyer: minimum year built preference |
| Bed / Bath Preference | Soft | Both | Seller: actual bed / bath counts. Buyer: minimum range preference |
| Value-Add Tolerance | Soft | Both | Seller: actual property condition. Buyer: tolerance (Low / Medium / High) |

### BFR Only

| Field | Match Type | Sides | Notes |
|---|---|---|---|
| Lease-Up Risk Appetite | Soft | Both | Seller: actual lease-up status / trajectory. Buyer: risk tolerance (Light / Moderate / Heavy) |
| Target Price Per Unit | Soft | Both | Seller: target price per unit. Buyer: acceptable price per unit range |
| Amenity Requirements | Soft | Both | Seller: actual amenity package. Buyer: required amenities (Pool / Clubhouse / Fitness / None required) |
| Phase Sale Preference | Soft | Both | Seller: whether phase sale is allowed. Buyer: preference (Required / Preferred / Not needed) |

### Multifamily Only

| Field | Match Type | Sides | Notes |
|---|---|---|---|
| Vintage Preference | Soft | Both | Seller: actual year built. Buyer: minimum year built preference |
| Value-Add Tolerance | Soft | Both | Seller: actual deferred maintenance level. Buyer: tolerance (Core / Light / Moderate / Heavy) |

### Land Only

| Field | Match Type | Sides | Notes |
|---|---|---|---|
| Target Basis | Soft | Both | Seller: actual pricing basis. Buyer: acceptable basis (Per Lot / Per Acre) |
| Min Density Preference | Soft | Both | Seller: projected unit count / density. Buyer: minimum units per buildable acre |
| Required Entitlement Depth | Soft | Both | Seller: actual entitlement status. Buyer: minimum required (Raw OK / Submitted OK / Approved required / Recorded required) |
| Required Development Depth | Soft | Both | Seller: actual development depth. Buyer: minimum required (Raw only / Entitled / Horizontal underway / Finished lots only) |
| Phased Takedown Preference | Soft | Both | Seller: whether phased takedown is allowed. Buyer: preference (Required / Preferred / Not needed) |

---

## Open Questions

1. **Tier 1 asymmetry** — Equity Check Size (buyer) and Pricing Posture (seller) have no counterpart on the opposite side. Are these being matched against each other, or are they context-only fields?
2. ~~**Tier 3 is entirely buyer-side**~~ — Resolved. All Tier 3 fields exist on both sides. Seller enters the actual property value or policy; buyer enters their preference or tolerance. The matching engine compares the two.
3. ~~**BFR seller data gap**~~ — Resolved. BFR Tier 3 fields (amenity package, lease-up status, price per unit, phase sale) are now defined as Both-sided fields.