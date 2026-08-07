# RAQIM Design Constitution

```
Document class:   Constitution (highest authority)
Status:           Ratified
Version:          1.0
Supersedes:       None
Amends:           None
Subordinate to:   Nothing
Governs:          RAQIM-DESIGN-SYSTEM.md (v1) and all future design/product decisions
```

## 0. Purpose and Scope

This document resolves design decisions when multiple valid options exist. It is not a description of the brand and it is not a source of inspiration. It is a set of rules. Where `RAQIM-DESIGN-SYSTEM.md` explains *why* RAQIM looks and feels the way it does, this document defines *what may and may not be built*, and *which rule wins* when two acceptable-sounding rules conflict.

Every rule in this document has a stable identifier (e.g. `NNP-3`, `PIC-5`). Identifiers are permanent once ratified and MUST be cited when a decision references this document — in a design review, a pull request, or a future amendment. A decision is not compliant because it "feels right." It is compliant because it does not violate a cited rule, or it is non-compliant because it does.

### 0.1 Keyword Conventions

This document uses `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and `MAY` as normative keywords:

- **MUST / MUST NOT** — non-compliance is a defect. The feature does not ship until resolved.
- **SHOULD / SHOULD NOT** — a strong default. Deviation requires a documented reason, recorded per `AM-5`.
- **MAY** — permitted, not required.

---

## 1. Non-Negotiable Principles (NNP)

These are immutable per `AM-1`. A design that violates one of these is wrong, independent of how well it performs on any other measure — usability, aesthetics, conversion, or speed of delivery.

| ID | Rule | Test |
|---|---|---|
| **NNP-1** | The product's function is reading and comprehension, not engagement volume. No design decision MAY be justified primarily by time-on-site, session count, or click-through rate. | If the stated justification for a change is an engagement metric rather than reader benefit, it fails. |
| **NNP-2** | Arabic is the primary language and reading direction. Every layout, spacing, and navigation decision MUST be authored and validated in Arabic/RTL first. | If a layout only functions correctly in LTR/English and breaks or degrades in RTL/Arabic, it fails. |
| **NNP-3** | Editorial curation outranks algorithmic or engagement-based content ordering. | If content is sorted or surfaced by default using popularity, personalization, or engagement signals, with no editorial override, it fails. |
| **NNP-4** | No visual element may exist purely for decoration. Every element MUST be traceable to a stated functional or emotional purpose. | If asked "what does this element do or communicate," and no answer exists beyond "it looks good," it fails. |
| **NNP-5** | The interface MUST NOT manufacture urgency, scarcity, or pressure to act quickly. | Countdown timers, live "N people viewing" counters, artificial low-stock warnings, and similar mechanics fail this rule outright. |
| **NNP-6** | Every screen MUST have exactly one dominant focal point. | If two elements compete for primary attention at equal visual weight, it fails. |
| **NNP-7** | The system MUST NOT report success before the underlying operation is confirmed by the system of record. | If a UI shows a success state prior to write confirmation, it fails. This applies identically to customer-facing and administrative surfaces. |
| **NNP-8** | No reader may receive a visibly degraded experience solely because of the language she is reading in. | If a page is publicly reachable in a language where its content is empty, placeholder, or truncated relative to the other language, it fails. |

---

## 2. Decision Hierarchy

When two applicable rules conflict, the rule belonging to the higher-precedence tier wins outright. Precedence is not negotiated per-case; it is fixed by tier.

### 2.1 Precedence Order (highest to lowest)

1. **Tier 0 — Non-Negotiable Principles** (Section 1)
2. **Tier 1 — Product Identity Constraints** (Section 3)
3. **Tier 2 — Trust Constraints** (Section 5)
4. **Tier 3 — Editorial Constraints** (Section 4)
5. **Tier 4 — UX Constraints** (Section 6)
6. **Tier 5 — Interaction Constraints** (Section 7)
7. **Tier 6 — Growth Constraints** (Section 8) — governs *how* new work is added; invoked only after Tiers 0–5 are satisfied.

Rationale for the order: identity failures (becoming a different kind of product) are harder to reverse than trust failures; trust failures are harder to recover from than editorial inconsistency; editorial inconsistency is harder to fix silently than a usability rough edge; usability outranks interaction polish, because a screen that works plainly beats a screen that moves beautifully but confuses.

### 2.2 Conflict Resolution Algorithm

```
1. Identify every rule the proposed decision touches.
2. Determine the tier of each touched rule.
3. If rules from different tiers conflict:
      the rule from the numerically lower tier wins, unconditionally.
4. If rules from the SAME tier conflict:
      apply the tie-break (2.3).
5. If no existing rule applies at all:
      resolve per GC-3 (extrapolate or defer for amendment).
      Do not invent a new unstated rule ad hoc.
```

### 2.3 Same-Tier Tie-Break

When two rules in the same tier conflict and neither yields, the decision MUST default to whichever option is: (a) more reversible, and failing that, (b) quieter — i.e. makes fewer simultaneous demands on the reader's attention. This is a tie-break of last resort, not a general design instruction.

---

## 3. Product Identity Constraints (PIC)

RAQIM MUST NOT converge toward the following adjacent product categories. Each sub-section states the specific, testable rules that prevent that convergence.

### 3.1 Not a Marketplace

- **PIC-1**: The product MUST NOT support multiple third-party sellers or vendor-branded storefronts. RAQIM publishes; it does not host.
- **PIC-2**: Catalog and search results MUST default to editorial ordering. Popularity- or personalization-based sorting MAY exist only as an explicit, non-default alternative view.
- **PIC-3**: The purchase flow MUST center on a single, deliberate title at a time. Multi-item cart mechanics optimized for basket size (bundle upsells, quantity discounts, "add N more to save") MUST NOT be introduced.

### 3.2 Not a SaaS Dashboard

- **PIC-4**: The administrative area MUST NOT present dense, multi-chart analytics or live KPI walls as a primary surface. Metrics MAY be shown only as a small, fixed set of summary figures.
- **PIC-5**: No administrative screen MAY be organized around configurable widgets, dashboards-of-dashboards, or user-customizable panel layouts.

### 3.3 Not a Generic Admin Panel

- **PIC-6**: Every administrative screen MUST use the same typography, color system, and spatial rules as the public-facing product. A separate "admin theme" (distinct font, distinct palette, generic dark-mode dashboard aesthetic) MUST NOT be introduced.
- **PIC-7**: Administrative editing surfaces MUST be tailored to RAQIM's actual content types (books, articles, orders, conversations). Generic, schema-agnostic field-builder patterns are prohibited.

### 3.4 Not a Social Feed

- **PIC-8**: Infinite scroll MUST NOT be the default browsing pattern for the catalog or blog. Pagination or an explicit "load more" action is required.
- **PIC-9**: Likes, reactions, follower counts, share-count displays, and engagement-driven content resurfacing MUST NOT be implemented.

### 3.5 Not a CMS Clone

- **PIC-10**: If an administrative screen could have its labels swapped for another industry's terms and still make sense unchanged, it fails this constraint. Every admin surface MUST reflect RAQIM's specific content model, not a generic content-management abstraction.

---

## 4. Editorial Constraints (EC)

- **EC-1**: Every publicly listed book or article MUST carry human-authored descriptive content. Auto-generated or placeholder metadata MUST NOT be the only visible description.
- **EC-2**: A book or article MUST NOT be publicly exposed in a language where its content is incomplete relative to the other language (operationalizes `NNP-8`). An item with incomplete English content either has complete parallel content before it is exposed to English-reading traffic, or it is not exposed in English yet.
- **EC-3**: Reading surfaces (book body, article body) MUST NOT be interrupted by promotional interstitials, pop-ups, or upsell modals.
- **EC-4**: Any AI-assisted or automated content MUST be human-reviewed before publication. Raw, unreviewed automated output MUST NOT reach a public content surface.

---

## 5. Trust Constraints (TC)

- **TC-1**: Every transaction (purchase, download, form submission) MUST return an unambiguous, immediate confirmation of success or failure. Silence is a failure state and MUST be treated as one.
- **TC-2**: A success state MUST NOT be shown to a customer before the underlying write is confirmed (operationalizes `NNP-7` for customer-facing flows specifically).
- **TC-3**: Failure messages shown to a customer MUST state what happened and what she can do next. A generic, unexplained error message fails this rule.
- **TC-4**: The product MUST NOT request personal or payment information beyond what is strictly required to complete the stated transaction.
- **TC-5**: Any failure occurring during a paid transaction MUST be resolved or explicitly acknowledged within the same session. A customer MUST NOT be left uncertain whether she was charged.

---

## 6. UX Constraints (UXC)

- **UXC-1**: Every primary flow (purchase, contact, account/download access) MUST be completable in the reader's active language without a forced language switch mid-flow.
- **UXC-2**: A multi-step flow MUST NOT discard user-entered data on a failed submission. Entered content MUST be preserved for correction and retry.
- **UXC-3**: Every interactive element MUST have a discoverable, unambiguous accessible label. Icon-only controls without one are prohibited.
- **UXC-4**: Navigation from the homepage to any purchasable title MUST NOT exceed three deliberate steps.
- **UXC-5**: Text contrast and touch-target sizing MUST meet WCAG AA at minimum. Aesthetic palette restraint MUST NOT be used to justify a contrast ratio below this floor.

---

## 7. Interaction Constraints (IC)

- **IC-1**: No screen MAY run more than one attention-seeking animation simultaneously.
- **IC-2**: Auto-playing media (video, audio, carousels) MUST NOT be enabled by default. Playback MUST be user-initiated.
- **IC-3**: Any operation whose duration is unpredictable to the user MUST present a loading indication. A silent, indefinite wait is prohibited.
- **IC-4**: Motion MUST respect the operating system's reduced-motion preference. Decorative animation MUST be suppressed when reduced motion is requested.
- **IC-5**: Confirmation weight MUST be proportional to reversibility. A reversible action MUST NOT require double confirmation; an irreversible action MUST NOT skip confirmation.

---

## 8. Growth Constraints (GC)

- **GC-1**: A new feature MAY be added only if justified by at least one of: reduced reader effort, deepened editorial trust, or direct support of the publishing business. Competitive parity ("competitors have this") and engagement alone are not sufficient justification.
- **GC-2**: A new feature MUST be checked against Section 1 (NNP) and Section 3 (PIC) before implementation begins, using the Validation Checklist (Section 10) — not after the feature is built.
- **GC-3**: A proposed pattern with no existing precedent in this document MUST be resolved by extrapolating from the nearest applicable rule at the highest relevant tier. If no reasonable extrapolation exists, the feature MUST be deferred pending a formal amendment (Section 9) rather than shipped ahead of it.
- **GC-4**: Extending an existing pattern is preferred over introducing a new one. A new UI pattern MAY be introduced only when no existing pattern can reasonably serve the need.

---

## 9. Amendment Rules (AM)

- **AM-1 — Immutable.** Section 1 (Non-Negotiable Principles) and the core identity facts established in `RAQIM-DESIGN-SYSTEM.md` §1.1–1.3 (name meaning, target reader, editorial-not-marketplace identity) MUST NOT be amended. They may only be replaced in their entirety by a deliberate re-founding of the product, which is explicitly out of scope for a routine amendment.
- **AM-2 — Amendable with recorded review.** Sections 3–8 of this document (Tiers 1–6) MAY change as the product matures. Any change MUST be recorded as an explicit, dated decision that cites the rule ID being changed and the reason. A silent edit is not a valid amendment.
- **AM-3 — Freely amendable.** Visual and motion specifics in `RAQIM-DESIGN-SYSTEM.md` (exact colors, spacing, timing values) MAY evolve without formal review, provided no change violates a Tier 0–2 rule in this document.
- **AM-4**: Any change to a Tier 0 or Tier 1 rule MUST be treated as a new constitution, not a patch to this one. It requires explicit acknowledgment that the product's fundamental identity is changing.
- **AM-5**: No individual feature, ticket, or design file may silently redefine or bypass a rule in this document. Any deviation MUST either be brought into compliance or MUST first be recorded as an amendment under `AM-2`.

---

## 10. Validation Checklist (VC)

Every future feature MUST pass this checklist before implementation begins. Each item cites the rule(s) it enforces. A "no" on any `MUST`-derived item blocks the feature until resolved.

- [ ] **VC-1** — Does this feature violate any Non-Negotiable Principle? (`NNP-1`–`NNP-8`)
- [ ] **VC-2** — Does this feature introduce marketplace, SaaS-dashboard, generic-admin, social-feed, or CMS-clone patterns? (`PIC-1`–`PIC-10`)
- [ ] **VC-3** — Is this feature authored and validated in Arabic/RTL first, with full bilingual parity before public exposure? (`NNP-2`, `NNP-8`, `EC-2`)
- [ ] **VC-4** — Does this feature report success/failure truthfully and only after confirmation from the system of record? (`NNP-7`, `TC-1`, `TC-2`)
- [ ] **VC-5** — Does this feature introduce urgency, scarcity, or pressure mechanics? (`NNP-5`)
- [ ] **VC-6** — Does this feature preserve a single dominant focal point per screen? (`NNP-6`)
- [ ] **VC-7** — Does this feature preserve user-entered data on failure? (`UXC-2`)
- [ ] **VC-8** — Does this feature meet the accessibility floor: contrast, touch targets, accessible labels, reduced-motion support? (`UXC-3`, `UXC-5`, `IC-4`)
- [ ] **VC-9** — Is confirmation friction proportional to reversibility — no double-confirming reversible actions, no skipping confirmation on irreversible ones? (`IC-5`)
- [ ] **VC-10** — Can this feature be justified by reader effort reduction, editorial trust, or business support, rather than competitive parity or engagement alone? (`GC-1`)
- [ ] **VC-11** — Does this feature reuse an existing pattern before introducing a new one? (`GC-4`)
- [ ] **VC-12** — If this feature has no precedent in this document, has it been resolved by extrapolation or explicitly deferred for amendment, rather than shipped ad hoc? (`GC-3`)
- [ ] **VC-13** — If this feature deviates from any rule above, has that deviation been recorded as an explicit amendment rather than a silent exception? (`AM-5`)

---

*This document is the highest authority in the product. Where any other design document, ticket, or file conflicts with a rule stated here, this document governs, subject only to its own amendment process (Section 9).*
