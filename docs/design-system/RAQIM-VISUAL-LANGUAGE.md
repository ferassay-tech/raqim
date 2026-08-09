# RAQIM Visual Language

**Status:** Proposal — Phase 1.5. Pending approval.
**Purpose:** to answer one question — what makes RAQIM instantly recognizable, even before the logo is read. Where the Foundation document defined the architecture of type, space, radius, and elevation, this document defines the *character* that architecture is expressed with. Phase 2 will give these ideas values. Nothing here is a value.

---

## 1. Color Philosophy

Color in RAQIM is not decoration and not branding in the usual sense — it is a small number of roles, each with a job, and each forbidden from doing any other job.

**Canvas.** The ambient ground everything else rests on. Canvas is not a color choice so much as an absence — it should recede so completely that no one remembers what shade it was, only that everything sitting on it had room to breathe. Canvas is felt, not seen.

**Paper.** The surface of a bounded object — a card, a workspace. If Canvas is the room, Paper is the desk in it: still calm, but distinct enough that the eye knows this is where content lives. Paper is always warmer or brighter than Canvas, but only by a degree that must be discovered on close attention, never one that announces itself.

**Surface.** A further, smaller grading inside Paper — the tone a nested element takes when it sits atop a card. It exists so that nesting can be understood without needing another border to explain it: one more quiet step in the same warmth, not a new material.

**Ink.** Not one color but a family of weights. The darkest ink is reserved for what must be read; each lighter weight is for what should be understood without being dwelt on. RAQIM's real hierarchy lives here, in ink, far more than in any accent — a page with its accent color removed should still make complete sense.

**Accent.** The single color permitted to mean something. It is reserved for the rare moment something deserves to be *found*, not merely seen. Its entire authority is built on scarcity: the moment it appears twice within the same glance, both instances have already lost their meaning. Accent marks the one thing. It never marks a category of things.

**Highlight.** A momentary, reversible state — what a row becomes for the instant a cursor rests on it. Highlight borrows warmth from Paper; it never introduces a new hue. A highlight should feel like light shifting across a surface that was already there, not like the surface changing identity.

**Success, Warning, Danger.** These exist to be understood at a glance by someone already paying attention — never to interrupt someone who isn't. They stay inside RAQIM's own warm family (sage, ochre, brick) rather than borrowing the stoplight red and green of generic software, because confirming an action should never make the product suddenly look like it came from somewhere else.

**Disabled.** The visual equivalent of a closed door, not a struck-through one. Something disabled should read as quiet and momentarily unavailable — never broken, never apologetic.

**Interactive.** Not a color of its own. What can be acted on is signaled primarily by cursor, by motion, and — rarely — by the presence of Accent where it is genuinely warranted. Color alone should almost never be the only evidence that something can be pressed.

**Quiet.** The deliberate absence of everything above. Quiet is the state of most of the interface, most of the time. RAQIM's calm is not a mood applied on top — it is the simple fact that most of any page is allowed to just be Quiet.

**Permanent principles:**
- *Color creates hierarchy. Color never replaces hierarchy.* Order must already exist in composition, type, and space before color is permitted to reinforce it.
- *Gold is emphasis, not decoration.* It marks a single thing. It is never applied to a set of things, a category, or a pattern.
- *Whitespace outranks color.* When something needs more attention, the first tool is space around it — color is reached for only after space has already done what it can.
- *Warmth is constant, not a palette choice.* Every role, including status colors, is drawn from the same warm family, so nothing — not even an error state — ever looks like it arrived from a different product.

**Color should never appear** to manufacture urgency, to compensate for hierarchy that composition failed to establish, as ornament with no role attached, or applied to more than one element competing for the same attention at once.

---

## 2. Motion Philosophy

Motion in RAQIM describes behavior; it is not an effect layered on afterward.

**Appearance.** Content should arrive the way understanding arrives — settling into place rather than sliding in from an edge or announcing itself. A slight rise, a fade into presence, nothing more. The content should feel like it was always about to be there, and motion simply confirmed it.

**Disappearance.** Quicker and quieter than arrival. Leaving never asks for as much attention as arriving did. Something dismissed yields immediately — it does not linger for the sake of being noticed on its way out.

**Loading.** RAQIM does not perform effort. A wait should feel like a brief, respectful pause, not a spinner insisting on being watched or a progress bar dramatizing how much work is underway. If something takes a moment, the interface is honest and calm about it — it does not theatricalize the delay to seem more capable.

**Hover.** A whisper, not an announcement — the barest acknowledgment that attention has arrived, expressed through warmth (Highlight), never through movement. Nothing should shift, scale, or lift on hover. Only its surface should soften.

**Press.** Immediate and certain. Confirmation arrives in the same instant as the action, not as a flourish that follows it. Confidence, in motion, looks like instant response — not embellished response.

**Transitions.** An interface that knows what it is doing moves in one direction, once, and stops. It does not overshoot and settle back. It does not call attention to its own cleverness. Confidence looks like certainty, not performance — this is what separates an editorial product from a startup demo reel.

**What motion must never do:**
- It must never be the first thing noticed on a screen — content is always the first thing noticed, motion only ever escorts it.
- It must never repeat for its own sake — no looping, no pulsing, no motion whose only purpose is to keep attracting attention.
- It must never simulate urgency — no shaking, no bouncing, no motion designed to make something feel more important than it is.
- It must never outlast the patience of someone who has already understood what happened. If the meaning has landed, the motion is already over.

Motion here is closer to the way a page turns than the way a notification arrives: a single, quiet, expected gesture — never a performance.

---

## 3. Texture Philosophy

RAQIM should feel like it is made of something, even though it is made of nothing but light on a screen. This is achieved through the *quality of light*, never through applied texture.

**Paper.** The governing metaphor for every bounded surface — not a literal texture, but paper's behavior: a very slight, warm variation in tone; light that diffuses across it rather than reflecting sharply off it; edges that are soft, never hard like glass or metal.

**Grain.** RAQIM has none, and should have none. Grain belongs to a different visual vocabulary — film, vintage print — and introducing it here would date the interface against the explicit mandate to be timeless. RAQIM's materiality comes from light and proportion, never from surface noise.

**Light.** The only material property RAQIM actually uses. Every shadow is a description of how far a surface has lifted off the page — soft, wide, low-contrast, the way light behaves around a genuinely raised edge — never tight, dark, or high-contrast, which reads as synthetic rather than physical.

**Depth.** Used sparingly and only to describe elevation, never to decorate. A surface rises off the page only when it has genuinely earned that distinction — depth is a report of hierarchy, not an effect applied for richness.

**When texture disappears entirely:** on anything meant to feel permanent, structural, or ambient — Canvas, and any content that is organized rather than elevated. Texture, in the form of light and shadow, is reserved for surfaces meant to feel handled or acted upon, never for the ground they sit on.

**How subtle it must be:** subtle enough that someone would struggle to describe it if asked, yet would notice its absence immediately if it were removed. That tension — invisible until it's gone — is the test for whether texture is supporting luxury or becoming decoration.

---

## 4. Shape Philosophy

Geometry in RAQIM is a form of manners, not decoration. A shape tells the user how to approach an object before a single word has been read.

**Soft geometry** — rounded cards, dialogs, buttons — signals "this is meant to be considered, touched, or held." Roundness invites engagement.

**Architectural geometry** — images, structural dividers, the page's own outer frame — signals "this is fixed, this is the structure, not the content." Sharper edges recede into the frame rather than inviting touch.

**The relationship between them is a spectrum, not a set of independent choices.** As an object moves from structural (an image, a section boundary) to functional (an input) to interactive (a button) to temporary (a dialog), its corners soften in that same order. Geometry tracks a single spectrum from *fixed* to *fleeting* — the more transient or actionable an object is, the softer it is allowed to feel.

Despite these differences, every shape in the system must look drawn by the same hand — related by one continuous curvature logic, not a set of arbitrary independent decisions. No individual component should ever look like it was borrowed from a different product.

RAQIM deliberately sits between the two extremes common in software design: the fully-squared, cold, "enterprise tool" geometry that feels architectural everywhere, and the fully-pill-rounded, soft "consumer app" geometry that feels structural nowhere. The gradient between those two extremes is itself the hierarchy signal — not a stylistic compromise, but a working part of the system.

---

## 5. Icon Philosophy

An icon in RAQIM is a quiet footnote, never an illustration. It exists to be understood in passing, not admired.

**Stroke.** Consistent, thin, and even — a line that reads as drawn with a fine pen, not assembled from geometric primitives. No filled or solid icon style: filled icons carry more visual weight than RAQIM's typography does, and would compete with the words they're meant to support.

**Weight.** An icon should carry roughly the same visual weight as the Caption or Label text it accompanies — never bolder, never more saturated than the words beside it. An icon supports a label; it does not outcompete it.

**Corner treatment.** Gently rounded terminals, following the same curvature logic as the rest of the system, rather than sharp mechanical corners or purely geometric shapes. An icon should feel like it was drawn by the same hand that set the type.

**Density.** Simple enough to remain legible at the smallest size it will ever appear at. If a concept needs more detail to be understood, the answer is a word, not a more elaborate icon.

**Visual rhythm.** Icons appear sparingly, and always in predictable positions — beside a label, never floating alone as ornament. Their rhythm should be as calm and evenly spaced as the type around them; they are never used to fill empty space or add visual "texture" to a screen.

**Relationship to typography.** Icons are always subordinate to text. An icon never stands as the only way to understand what something does — it accompanies a label, it never replaces one. RAQIM is a reading-first product; its icons behave accordingly.

**What to avoid:** multi-color icons, filled or solid styles, playful or novelty icon sets, icons placed purely for visual interest with no attached meaning, and any icon whose legibility depends on a passing trend rather than a plain, durable reading of its own shape.

---

## What Phase 2 inherits from this document

Every token, every component, and every animation curve defined in Phase 2 must be traceable to a role or principle named here. If Phase 2 needs a color, shape, texture, or motion that doesn't fit anything described above, that is a signal to amend this document first — not to make an exception around it.
