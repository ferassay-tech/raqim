# RAQIM Foundation Design System

**Status:** Proposal — Phase 1 (Foundation). Pending approval.
**Relationship to prior documents:** `RAQIM-DESIGN-SYSTEM.md` (V1) established *why* RAQIM looks and feels the way it does. `RAQIM-DESIGN-FOUNDATION-REVIEW.md` audited the gaps in that philosophy. `RAQIM-DESIGN-CONSTITUTION.md` turned the surviving philosophy into enforceable rules and precedence. None of those are altered by this document. This document is the next layer down: it defines the *architecture* of the visual language itself — type, space, radius, elevation, border — so that Phase 2 can translate it into actual tokens without re-litigating first principles on every page.

This is architecture, not implementation. No exact sizes, no CSS, no code. Every value in Phase 2 must trace back to a decision made here.

---

## 1. Typography System

### 1.1 The type families

A publishing house's identity lives in its type more than in any other single choice. RAQIM uses four families plus one technical face, each with one job:

| Role | Face | Why |
|---|---|---|
| **Arabic Display** | Amiri | A classical Naskh-style serif with real literary weight — it reads as heritage and craftsmanship, not corporate software. Reserved for moments that should feel written, not typed. |
| **Arabic Reading** | IBM Plex Sans Arabic | A clean, humanist sans built for legibility at small sizes, where Amiri's calligraphic detail would blur. This is the face the administrator actually reads all day. |
| **English Display** | Cormorant Garamond | A refined, high-contrast serif already carrying the RAQIM logotype. Used wherever Latin script needs the same literary register Amiri gives Arabic — rare, and always a deliberate choice, never a default. |
| **English Reading** | IBM Plex Sans | The Latin sibling of the Arabic reading face. Sharing one type family across scripts means an English word or number sitting inside an Arabic sentence never feels like a foreign insert — it belongs to the same design DNA. |
| **Monospace (numeric)** | IBM Plex Mono | Same family again, not an unrelated "coder" face. Reserved exclusively for values meant to be *compared* — prices, statistics, order totals, SKUs — where digits must line up column to column. An incidental number inside a sentence ("3 books") stays in the Reading face; a number in a ledger or a price tag moves to Mono with tabular alignment. |

**Rule:** three type families (Amiri, IBM Plex Sans Arabic/Sans, IBM Plex Mono), never a fourth introduced casually. Every new face considered for the system must justify why none of these three can do the job.

### 1.2 The type scale

Twelve levels. Each is defined by *purpose* first — size and weight are Phase 2's job to assign.

| Level | Purpose | Family | Weight character | Line-height philosophy |
|---|---|---|---|---|
| **Display XL** | The single largest editorial moment on a page — a book's own hero title. Appears at most once per page, and not on every page. | Arabic/English Display | Heaviest presence in the system, used with real restraint | Very open — large type needs room for Arabic connectors and ligatures to resolve without collision |
| **Display L** | A page's own masthead moment, one step below Display XL — reserved for pages that are genuinely a destination, not routine screens. | Display | Strong, still rare | Open, slightly tighter than Display XL |
| **H1** | The standard page title — the one heading every real page has exactly once. | Display | Confident, not shouting | Moderately open |
| **H2** | Section headings inside a page — panel titles, named groupings. | Display | Present but clearly secondary to H1 | Moderate |
| **H3** | The last level allowed in the Display face. Sub-section or card-level headings. | Display | Quiet | Moderate, tightening |
| **H4** | Minor headings — a small label introducing a cluster of fields. This is where the system deliberately leaves the Display face behind. | Reading (medium/semibold) | Firm enough to still read as a heading without calligraphic weight | Tight |
| **Body Large** | Lead paragraphs — the few places genuine sustained reading happens (a book's description, a settings explanation). | Reading | Regular | The most open line-height in the Reading tier — this is the one place comfort matters more than density |
| **Body** | The default interface text — table cells, form values, standard copy. | Reading | Regular | Standard |
| **Body Small** | Supporting text attached to a Body element — a hint under a field, a secondary line under a title. | Reading | Regular, quieter color | Slightly tighter |
| **Caption** | Metadata — timestamps, muted facts, always paired with the faintest ink tier. | Reading | Light presence | Tight, usually single-line |
| **Label** | Structural markers, not content — eyebrow labels, column headers, field labels. Distinguished by *treatment* (uppercase, tracked letter-spacing), not just size. | Reading | Deliberately understated | Tight |
| **Micro** | The floor of the system — badge text, tiny inline counts. Nothing renders smaller. If content needs to be smaller than Micro, the content is wrong, not the type size. | Reading | Lightest | Tightest |

**Rules that govern the whole scale:**
- **The Display face never appears below H3.** Amiri's detail degrades at small sizes; asking it to do a Caption's job breaks legibility, not just taste.
- **Letter-spacing and uppercase are exclusively a Label-level device.** If text is tracked and capitalized, it is always structural metadata, never content — this lets the eye distinguish "this is organizing something" from "this is the thing" without reading a word.
- **Monospace is orthogonal to the scale, not a rung on it.** A number can appear at Body size or at Display-adjacent size in Mono — the family changes, not the level.

---

## 2. Spacing Rhythm

Named steps, not raw pixel values — the same discipline a book's typesetting uses (word space, line space, paragraph space, section break, chapter break) rather than a flat numeric ramp.

| Step | Used for | What it signals |
|---|---|---|
| **XS** | Inside an atomic element — an icon beside its label, a value beside its unit. | "These two marks are one unit." Never used between separate elements. |
| **S** | Between two closely bound lines in one block — a title and the caption directly under it, a form label and its input. | "One thought, two lines." |
| **M** | The default gap between sibling elements in the same group — rows in a list, one field to the next. | The system's most common rhythm — the "paragraph break." |
| **L** | Between sub-groups inside the same section — a card's header to its body, one form group to the next within a page. | "Related, but a new thought starts here." |
| **XL** | Between independent components that share a page but not a heading — side-by-side cards, a hero element to what follows it. | "Different objects, same neighborhood." |
| **Section** | Between one named section of a page and the next. | The point where the reader is expected to consciously change subject — this is the rhythm break the Dashboard rebuild proved matters more than any card treatment. |
| **Chapter** | Between genuinely distinct parts of a long, book-like flow — a book's public page moving from hero to description to reviews to FAQ. | Reserved for content that actually has chapters. Used sparingly; using it on an ordinary page flattens its meaning. |
| **Page** | The outer margin between the page's content and the surrounding chrome. | Establishes the page as a composed object, not content bleeding to the edges. |

**The philosophy:** spacing should step up in *perceptible, deliberate jumps*, not a smooth linear scale. A reader — or an administrator — should be able to tell "still the same thought" from "new thought" from "new section" from "new chapter" by the size of the gap alone, without reading a label. This is the exact lesson the Dashboard rebuild learned the hard way: uniform spacing between everything produces no hierarchy at all, no matter how each individual thing is styled.

---

## 3. Radius System

Radius is assigned by a component's **role**, not its size or its author's taste. Three roles, three radius characters:

| Role | Components | Radius character | Why |
|---|---|---|---|
| **Static content** | Images, book covers, photography | Smallest in the system — a bare softening of the edge, sometimes none | An image is content, presented the way a museum presents a plate — not wrapped in app chrome. Heavy rounding on a photograph reads as software, not as an object. |
| **Bounded containers** | Cards, workspace panels | Moderate, consistent — the system's default | Enough to feel calm and considered; not so round it feels playful. This is the reference radius everything else is described relative to. |
| **Precise instruments** | Inputs, form fields | Slightly crisper than the container default | An input is a precise tool; excess softness undermines the sense that it will hold exact data. |
| **Pressable actions** | Primary buttons | Fullest radius (pill) — reserved for the one primary action per screen | A pill shape is the clearest possible "press me" signal. If every button is a pill, none of them are — full-pill radius stays rare on purpose. |
| **Discrete tokens** | Badges, status pills | Always full pill | The shape itself says "this is a small, self-contained label," independent of size. |
| **Floating surfaces** | Dropdowns, popovers | Matches the container default | They're small floating cards; their "temporary" nature is expressed through elevation, not through a different radius. |
| **Suspended surfaces** | Dialogs, modals | The most generous radius in the system | A modal is detached from the page's grid entirely — the softest corners reinforce that it belongs to a different, temporary layer. |

**Rule:** any new component is assigned a radius by first answering "which of these three roles is this — static content, a bounded container, or a pressable/temporary surface" — never by matching whatever radius looks good next to its neighbor.

---

## 4. Elevation System

Six levels, each answering a different question the user is implicitly asking about a surface. Not one more, not one fewer — collapsing any two of these together is exactly the mistake the Dashboard made when "workspace" and "interactive object" shared one visual treatment.

| Level | Question it answers | Shadow | Notes |
|---|---|---|---|
| **Canvas** | "Where am I?" | None — it is the ground truth | The page's own background. Never elevated. |
| **Section** | "What topic is this?" | None | A named grouping of content. Organized by typography and spacing alone — a section is a *topic*, not an object, and does not need its own surface to exist. |
| **Workspace** | "What can I look at here?" | None, or the faintest possible lift | A genuinely bounded area with a light background/border shift — present, but resting *on* the canvas, not floating above it. |
| **Interactive Card** | "What can I act on here?" | The first real shadow in the system | Reserved for the one (or very few) genuinely decision-worthy, clickable objects per screen. A shadow here is a claim of primacy — it must be earned, and it must stay rare. |
| **Floating Layer** | "What did I just summon?" | Stronger than Interactive Card | Dropdowns, popovers, tooltips — temporarily detached from page flow, must visually win against everything beneath it, dismissed as easily as it appeared. |
| **Modal** | "What must I resolve before continuing?" | Strongest, with a dimming scrim behind it | Suspends interaction with everything else. Reserved for moments that genuinely require full, undivided attention — a destructive confirmation, a focused edit. |

**Why six:** each level corresponds to a distinct relationship between the user and that surface. Fewer levels forces two different relationships to share one treatment (which is precisely what made every early Dashboard pass feel flat); more levels would start distinguishing differences the user doesn't actually perceive.

---

## 5. Border Philosophy

Learned directly from the Dashboard rebuild and now made permanent:

> **A border marks an object. A divider marks an item within an object. Whitespace marks a relationship between objects.**

Three distinct devices, three distinct meanings, never used interchangeably:

- **Borders** exist only around a surface that is a genuinely independent, bounded object — an Interactive Card, a Workspace, a Modal. A border is a claim ("this has edges, this is a thing"), and that claim must be true, not decorative.
- **Dividers** (hairline rules) live *inside* a bounded surface, separating individual items that belong to the same object — rows in a list, entries in a ledger. They never appear between two unrelated top-level sections.
- **Whitespace** is the default separator everywhere else — between sections of a page, between sibling cards in a grid, between anything that is merely *near* something else rather than contained by it. Two adjacent cards are never given a shared or touching border; each card's own boundary (if it has one at all) is sufficient, and the gap between them does the rest.

**Section separation** on any page is achieved through the Spacing Rhythm (Section/Chapter steps), never through a border — sections are topics, not objects, per the Elevation System above.

**Card separation** within a grid or list is achieved through gap (whitespace), never through shared edges — touching borders read as a table, not as a collection of distinct objects.

---

## 6. Editorial Principles

*How RAQIM should feel, and why it is not a SaaS product wearing publishing-house colors.*

- **Read, not operated.** A SaaS dashboard is a tool you operate to extract value. RAQIM — even its admin — is a space you occupy, closer to a study or an atelier than a control panel.
- **Calm over urgency.** SaaS products often manufacture urgency — badges, counters, streaks — to drive engagement. RAQIM has no engagement incentive. Nothing here should ever try to alarm someone into noticing it.
- **Confidence over cleverness.** The interface never explains itself in a friendly, conversational voice. Confidence comes from clarity and restraint, not from personality or narration.
- **Editorial rhythm over grid density.** Where a SaaS dashboard maximizes what fits above the fold, RAQIM paces itself the way a magazine paces a feature — slower, more spacious, comfortable with a screen that isn't full.
- **Reading-first, even in the admin.** Every sentence, label, and heading is set with the same care a published sentence would receive — this is an operational surface, but it is never allowed to look like one at the expense of feeling considered.
- **Museum-quality restraint around the object.** A book cover, a piece of imagery, is presented the way a museum presents an artifact — minimal frame, so the object's own quality is what's noticed.
- **Luxury without decoration.** Luxury here is the absence of the unnecessary, not the presence of ornament. No gradients, no decorative icons, no flourishes — the sense of quality comes entirely from what was deliberately left out.
- **Trust through consistency.** RAQIM serves real customers making a considered purchase, often for their families. Every surface — public site and admin alike — must feel like it came from the same disciplined hand, because that discipline *is* the evidence that this is a real, careful publishing house.

---

## 7. Design Principles

Ten permanent rules. Every future design decision should be traceable to one of these.

1. **Hierarchy before decoration.** Any visual distinction earns its place by helping someone understand order or importance first — appearance is never sufficient justification on its own.
2. **Whitespace is structure, not emptiness.** Space is an active design element that carries meaning — it is never leftover area waiting to be filled.
3. **Typography carries identity.** If every color were removed from a RAQIM screen, it should still be recognizable as RAQIM by its type and rhythm alone.
4. **A surface must earn its elevation.** Nothing receives a border, shadow, or background because "it looks more finished" — every elevated surface corresponds to a real, distinct relationship the user has with that content.
5. **Color supports hierarchy; it does not create it.** Hierarchy is established first through composition, scale, and spacing. Color is the last and lightest layer, applied on top, never the primary mechanism.
6. **One page, one true hero.** Every screen has exactly one element that deserves the reader's first attention. Everything else is deliberately quieter and never competes with it.
7. **Remove before adding.** When a screen feels unclear, the first question is what can be taken away — not what new element would explain it.
8. **Motion must explain, never decorate.** Animation exists to clarify a relationship — this appeared because of that, this now belongs with that. Motion added purely for delight has no place in this system.
9. **Arabic leads; Latin follows.** As an Arabic-first product, every layout, spacing, and type decision is made for RTL first, with LTR built as a faithful mirror — never the reverse.
10. **Consistency is the luxury.** The same rule applied everywhere without exception is what makes the product feel premium. A single inconsistency undermines more trust than any individual imperfection.

---

## What Phase 2 will do with this

Phase 2 translates each section above into actual tokens: the twelve type levels get real sizes/weights/line-heights per family; the spacing rhythm gets real values; radius and elevation get real CSS. Nothing in Phase 2 should introduce a concept that isn't already named here — if it does, this document needs to be amended first, not worked around.
