# RAQIM Design Engine

**Status:** Proposal — Phase 2. Pending approval.
**Relationship to prior documents:** `RAQIM-FOUNDATION-DESIGN-SYSTEM.md` (Phase 1) defined the architecture — type scale, spacing rhythm, radius roles, elevation levels, border rules. `RAQIM-VISUAL-LANGUAGE.md` (Phase 1.5) defined the character — what each color, motion, texture, shape, and icon is *for*, emotionally and philosophically. This document is the bridge between that thinking and real implementation: it names the actual tokens the system will expose, and the rules governing how they relate to one another. It still assigns **no values** — no hex, no pixels, no durations, no Tailwind, no CSS. That is Phase 3.

Every token below exists because Phase 1 or Phase 1.5 already justified it. If a token doesn't trace back to one of those two documents, it doesn't belong in this one.

---

## 1. Color Engine

Color tokens are named by **role**, never by hue. A token's name should tell a future designer when to reach for it without needing to know what it looks like.

| Token | Role | Relationship to neighbors |
|---|---|---|
| **Canvas** | The ambient ground of the whole application. Never elevated. | The reference point every other surface is compared against. |
| **Paper** | The surface of a bounded, resting object — a Workspace-level container. | One perceptible step brighter/warmer than Canvas — the minimum distinction needed to read as "a surface," not a decoration. |
| **Surface** | A nested grading inside Paper — the tone a smaller element takes when placed on top of a card. | One further, smaller step from Paper. Exists so nesting reads without needing an additional Border. |
| **Surface Elevated** | The surface of an Interactive Card — the rare, genuinely actionable object per screen. | Must read as clearly brighter than Paper, in tandem with the Elevation Engine's shadow at this level. Color and elevation both change together here — that's what earns this level its status. |
| **Surface Floating** | Dropdowns, popovers, tooltips. | Brighter or more opaque than Surface Elevated — a Floating surface must visually win against everything beneath it, since it's temporary and time-sensitive. |
| **Ink** | Primary text — what must be read. | The anchor of the whole ink family; every other ink token is a controlled step away from it, never an independent color. |
| **Ink Soft** | Secondary text — supporting lines, descriptions. | A single, deliberate step lighter than Ink. Still fully legible; reads as "important, but not the point." |
| **Ink Quiet** | Captions, metadata, timestamps. | The lightest ink still considered legible body text. Below this, text is not quieter — it's a different token (Disabled). |
| **Border** | Marks a genuine, bounded object (per the Border Philosophy) — an Interactive Card, a Workspace, a Modal. | Only ever appears where Elevation says an object actually exists. Never used to organize a Section — that's Chapter/Section spacing's job. |
| **Divider** | Separates individual items *inside* a bounded object — rows in a list, entries in a ledger. | Deliberately quieter than Border. A Divider is a lower-stakes mark than a Border; the two must never be visually identical, or the Border/Divider distinction collapses. |
| **Accent** | Gold. Marks the one thing that deserves to be found. | Used at most once per view in a given context. Never repeated across simultaneous, competing elements. |
| **Interactive** | The affordance marker for something clickable that isn't already carrying Accent — a link, an actionable icon. | Distinct from Accent: Accent means *importance*, Interactive means *can be acted on*. The two may share a family resemblance but answer different questions, and a component should never need both to make sense. |
| **Success / Warning / Danger** | Status communication, understood at a glance by someone already looking. | Each exists as a *pair* — a quiet background tint (for a pill or a soft alert surface) and a legible foreground (for text or an icon) — never introduced as a single flat value. All three stay inside RAQIM's warm family; none may read as generic stoplight color. |
| **Disabled** | A closed door, not a struck-through one. | Applies to both a surface and its ink together — a disabled element is quieted as a whole, not just faded in one dimension. |
| **Focus** | The one state where Accent-level attention is not just allowed but required. | Reuses Accent's authority for a genuinely different reason: a keyboard user must be able to find their place. Focus is the exception that proves the "Accent appears once" rule — when something is focused, it *is* the one thing. |
| **Selection** | Text selection highlight. | Also drawn from Accent, applied to a specific mechanism (browser text selection) rather than to editorial emphasis. |
| **Overlay** | A light, ambient dimming behind a Floating surface. | Barely perceptible — its only job is to reduce competition from what's behind a dropdown or popover, not to draw attention to itself. |
| **Scrim** | A deliberate, stronger dimming behind a Modal. | Must make everything beneath it recede enough that the Modal is unmistakably the only thing left to act on. Distinct from Overlay in intensity and intent, not just in name. |

**Governing rules carried forward from Phase 1.5, restated as engine constraints:**
- Every token above must be justified by a role that already existed in the Color Philosophy — none of them are new colors, only more precisely named applications of Canvas / Paper / Surface / Ink / Accent / Quiet.
- No token may be introduced to solve a one-off visual problem on a single page. If a future page seems to need a new color role, that need is evaluated against this table first — the honest answer is usually that an existing role was misapplied, not that a new one is missing.

---

## 2. Typography Engine

Typography tokens are grouped into six hierarchies. Each hierarchy is a closed set — a fixed number of steps — because an open-ended scale is what turns into arbitrary font-sizing over time.

| Hierarchy | Steps (from Phase 1) | Relationship rule |
|---|---|---|
| **Display** | Display XL, Display L | At most one Display step appears per page. A Display element is always followed by a Reading-hierarchy element next — never by another Display or Heading step directly beneath it. Display exists to be encountered once, not stacked. |
| **Heading** | H1, H2, H3, H4 | Strictly sequential — a page may skip a level going *down* (H1 straight to H3) if no content exists at the intermediate level, but may never skip going *up*. H1 appears once per page. H4 is the boundary where the Display face is left behind (per Phase 1's rule). |
| **Reading** | Body Large, Body, Body Small | The only hierarchy designed for sustained attention rather than scanning. Body Large is reserved for genuine lead paragraphs; defaulting to it for ordinary interface copy dilutes its purpose. |
| **Caption** | Caption | A single step, always paired with Ink Quiet. Caption never carries a heading's job — if something needs to be found rather than just referenced, it isn't a Caption. |
| **Label** | Label | Distinguished by treatment (tracked, uppercase-equivalent), not size. A Label is always metadata *about* content, never the content itself. |
| **Numeric / Monospace** | Cuts across all of the above | Not a rung — an orthogonal swap. Any hierarchy step can render its digits in the Monospace family when those digits are meant to be compared in a column (price, total, statistic). Digits inside ordinary prose stay in the Reading family. |

**Typographic relationships (the rules that make this an engine, not a list):**
- **Each step down must be a perceptible drop in presence, never a marginal one.** The same discipline the Spacing Engine applies to gaps applies here to type — if two adjacent steps are hard to tell apart, one of them is unnecessary.
- **Every Heading step has a fixed spacing relationship to what follows it**, defined by the Spacing Engine (§3) — a Heading is never placed against body content with an arbitrary, page-specific gap. Type and space are one system, not two.
- **Weight substitutes for size at the bottom of the scale.** Between H4 and Label, where sizes are already close, distinction comes from weight and treatment (tracking, case) rather than pushing sizes closer and closer together.

---

## 3. Spacing Engine

Spacing tokens are named for the **relationship** they mark, not their rank in a scale — a future designer should be able to pick the right token by asking "what is the relationship between these two things," not "how big a gap do I want."

| Token | Marks the relationship... | Carried forward from Phase 1 |
|---|---|---|
| **Inline** | ...between two parts of one atomic unit — an icon and its label, a value and its unit. | XS |
| **Paragraph** | ...between two lines of one continuous thought — a title and the caption directly beneath it. | S |
| **Group** | ...between sibling elements that belong to the same collection — rows in a list, fields in a form, cards in a grid. Group has two intensities: a **tight** Group for items inside one bounded object (list rows), and a **loose** Group for sub-groups within the same section (one form cluster to the next). | M and L, unified under one relational name |
| **Section** | ...the point where a reader consciously changes subject. | Section |
| **Chapter** | ...a genuinely distinct part of a longer, book-like flow. Reserved for content that actually has chapters — using it elsewhere flattens its meaning. | Chapter |
| **Page** | ...the outer edge of the composed object — the margin between content and surrounding chrome. | Page |

**Rule:** spacing tokens are chosen by answering a relationship question first, size second. If two elements' relationship is unclear, that is a content/hierarchy problem to resolve before a spacing token is picked — never the other way around.

---

## 4. Shape Engine

Radius tokens sit on one continuous curvature scale — tightest to loosest — because Phase 1.5 established that every shape in the system must look drawn by the same hand.

| Token | Role (from Phase 1) | Position on the scale |
|---|---|---|
| **radius.image** | Static content | Tightest — a bare softening, sometimes none |
| **radius.input** | Precise instrument | Slightly looser than image, still crisp |
| **radius.card** | Bounded container | The system's reference radius — everything else is described relative to this |
| **radius.menu** | Floating surface | Equal to `radius.card` — a menu is a small floating card, not a different shape family |
| **radius.floating** | Floating surface (tooltips, inline popovers) | Equal to `radius.card` |
| **radius.badge** | Discrete token | Full pill, always — independent of the element's size |
| **radius.button** | Pressable primary action | Full pill — reserved for the single primary action per screen; secondary/tertiary actions use `radius.card` instead, so pill radius stays a meaningful signal rather than a default |
| **radius.dialog** | Suspended surface | Loosest in the system — reinforces that a Modal belongs to a different layer entirely |

**Rule:** a new component is assigned a radius by first asking which of Phase 1's three roles it belongs to (static content / bounded container / pressable-or-temporary), then taking that role's existing token — never by eyeballing a new value next to its neighbor.

---

## 5. Elevation Engine

Seven named levels — a refinement of Phase 1's six. "Section" is folded into Canvas here, since Phase 1 already established a Section has no depth of its own (it's organized by spacing and type, not lifted); "Paper" replaces it as the first level that actually has presence, matching the Color Engine token of the same name. "Overlay" is added as the backdrop mechanism, distinct from the content that floats above it.

| Level | Communicates | Notes |
|---|---|---|
| **Canvas** | "Where am I." | Zero elevation. Sections live here too — organized, not lifted. |
| **Paper** | "What can I look at here." | The Workspace level — a real surface, still resting on the canvas. |
| **Workspace** | "What is this area for." | A named, bounded region inside Paper-level content — the container a set of related information lives in. |
| **Interactive** | "What can I act on here." | The first level with genuine shadow. Reserved for the rare, decision-worthy object per screen — this level's rarity is what gives it meaning. |
| **Floating** | "What did I just summon." | Dropdowns, popovers, tooltips — detached from page flow, dismissed as easily as they appeared. |
| **Overlay** | (Not a surface — a backdrop.) | The light dimming behind Floating content. Exists to reduce competition, not to be noticed. |
| **Modal** | "What must I resolve before continuing." | Highest elevation, paired with Scrim rather than Overlay — the strongest possible separation from everything else on screen. |

**Rule:** no two levels may ever share an identical treatment. If a future component seems to need "something between Workspace and Interactive," that is a sign the component's actual role needs clarifying — not a signal to add an eighth level.

---

## 6. Motion Engine

Each token is a **behavior contract**, not a duration or easing curve.

| Token | Contract |
|---|---|
| **Arrival** | Content settles into place — a slight rise and fade, never a slide from off-screen. Reads as "confirmed," not "delivered." |
| **Departure** | Always faster and quieter than Arrival. Dismissal never asks for as much attention as appearing did. |
| **Hover** | Warmth only (Highlight) — no movement, no scale, no shift. A whisper, not an announcement. |
| **Press** | Effectively instant. Confirmation arrives with the action, not after it. |
| **Focus** | Immediate and unambiguous — this is the one motion moment allowed to be the most noticeable thing on screen, because accessibility requires it. |
| **Loading** | A calm, honest pause. Never dramatizes effort. If a wait crosses the point where patience turns to doubt, the interface says so directly rather than continuing to animate silently. |
| **Success** | A quiet settling, not a celebration — no bursts, no confetti, no motion that outsizes the action taken. |
| **Failure** | A brief, honest indication — no shaking, no alarm-red flashing. Consistent with the rule that RAQIM never simulates urgency. |
| **Reduced Motion** | Not an afterthought — every token above must resolve to an instant, opacity-only change when reduced motion is preferred. Comprehension must survive motion's complete absence. |

**Rule:** motion never carries meaning alone — every token here escorts something a color, type, or spacing change has already communicated. If removing the motion would make a screen incomprehensible, the motion was doing someone else's job.

---

## 7. Icon Engine

- **Sizing** is tied to the type-scale step an icon accompanies — an icon beside Label text is Label-sized, an icon beside Body text is Body-sized. Icons never carry an independent, arbitrary pixel size chosen per component.
- **Alignment** is optical, not mechanical — an icon is nudged to align with the cap-height or x-height of the text beside it, since icons and glyphs don't share a natural center.
- **Stroke** scales proportionally with size but stays within a narrow, consistently thin band at every size — an icon never approaches a bold or filled treatment just because it's rendered larger.
- **Semantic usage** falls into three categories — navigational, status/indicator, action-affordance — and a given icon's meaning is fixed within its category across the entire product. The same glyph is never repurposed to mean two different things on two different pages.
- **Relationship to typography:** an icon is sized, weighted, and positioned as an extension of the text it sits beside — never as an independent graphic element competing with it.

---

## 8. Texture Engine

The Texture Engine does not introduce new primitives. It documents how the Color Engine (Paper, Surface grading) and the Elevation Engine (shadow, depth) already combine to produce the felt sense of material — and it exists specifically to close the door on adding anything else.

- **Paper-grading** (the step from Canvas → Paper → Surface) is the only source of perceived material warmth. No gradients, no photographic textures, no simulated grain are ever layered on top of it.
- **Light** (the shadow values defined per Elevation level) is the only source of perceived depth. A shadow is always a report of *which elevation level* a surface occupies — never an effect chosen for richness on its own.
- **Restraint is the deliverable.** The Texture Engine's job is to make sure every future contributor reaches for Color Engine and Elevation Engine tokens to express materiality — and never reaches for a new decorative primitive to get there instead.

---

## What Phase 3 inherits from this document

Phase 3 assigns real values to every token named above and begins applying them, page by page. No new token may be introduced during Phase 3 without first amending this document — if implementation reveals a genuine gap, the gap is named and justified here before it is built.
