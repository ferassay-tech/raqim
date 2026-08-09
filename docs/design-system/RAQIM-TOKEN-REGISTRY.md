# RAQIM Token Registry

Not a design document — a maintenance reference. Updated as each implementation milestone lands. Source of truth for philosophy remains `RAQIM-DESIGN-ENGINE.md`; this file just tracks what's actually been built and where it's used.

**Note on Tailwind v4 tree-shaking:** a token with "no consumer yet" is declared in `src/index.css` but will not appear in the compiled CSS output until something references its utility class. This is expected and desirable — it is not a defect to fix.

## Color Engine

| Semantic role | Current implementation token | First consumer |
|---|---|---|
| Canvas | `--color-canvas` (new) | `AdminLayout.tsx` (page background) |
| Paper | `--color-paper` (new) | none yet |
| Surface | `--color-cream` (reused, pre-existing) | pre-dates this system; not yet consumed *as this role* deliberately |
| Surface Elevated | `--color-surface-elevated` (new) | none yet |
| Surface Floating | `--color-surface-floating` (new) | none yet |
| Ink | `--color-ink` (pre-existing) | global base text color (`html`, `body`) |
| Ink Soft | `--color-ink-soft` (pre-existing) | widespread (established during Dashboard work) |
| Ink Quiet | `--color-ink-faint` (pre-existing, fulfills this role) | widespread (established during Dashboard work) |
| Border | `--color-beige` (pre-existing) | global base border rule (`* { border-color }`) |
| Divider | `--color-divider` (new) | none yet |
| Accent | `--color-gold` (pre-existing) | widespread (primary actions, links, emphasis) |
| Interactive | `--color-gold-deep` (pre-existing, fulfills this role) | widespread (hover states, "view all" links) |
| Success | `--color-success` (pre-existing) | status badges, all-clear states |
| Warning | `--color-warning` (pre-existing) | status badges |
| Danger | `--color-danger` (pre-existing) | status badges, destructive actions |
| Disabled | `--color-disabled` (new) | none yet |
| Focus | `--color-focus` (new, aliases `--color-gold`) | none yet |
| Selection | `--color-selection` (new, aliases `--color-gold`) | `::selection` base rule |
| Overlay | `--color-overlay` (new) | none yet |
| Scrim | `--color-scrim` (new) | none yet |

## Typography Engine

| Semantic role | Current implementation token | First consumer |
|---|---|---|
| Display XL | `--text-display-xl` (4.5rem / 1.1, new) | none yet |
| Display L | `--text-display-l` (3.75rem / 1.15, new) | none yet |
| H1 | `--text-h1` (1.875rem / 1.25, new) | base `h1` rule (inert today — every real `<h1>` has its own explicit size class) |
| H2 | `--text-h2` (1.125rem / 1.3, new) | base `h2` rule (same as above) |
| H3 | `--text-h3` (1rem / 1.35, new) | base `h3` rule (same as above) |
| H4 | `--text-h4` (0.875rem / 1.4, new) | base `h4` rule — first place the Reading face + 600 weight replaces Display below H3 |
| Body Large | `--text-body-lg` (1rem / 1.6, new) | none yet |
| Body | `--text-body` (0.875rem / 1.5, new) | none yet |
| Body Small | `--text-body-sm` (0.75rem / 1.45, new) | none yet — shares a literal size with Caption today, kept as a separate token (see note) |
| Caption | `--text-caption` (0.75rem / 1.4, new) | none yet |
| Label | `--text-label` (0.75rem / 1.3, new) | none yet — distinguished from Body Small/Caption by treatment (tracking/case), not size |
| Micro | `--text-micro` (0.6875rem / 1.3, new) | none yet |
| Numeric / Monospace family | `--font-mono` (IBM Plex Mono, new) | none yet |

**Note:** Body Small and Caption currently resolve to the same literal size (12px) because that's genuinely what's rendering across the app today — they remain separate tokens since they pair with different ink tiers and may diverge later without a rename.

## Spacing Engine

| Semantic role | Current implementation token | First consumer |
|---|---|---|
| Inline | `--spacing-inline` (0.25rem, new) | none yet |
| Paragraph | `--spacing-paragraph` (0.375rem, new) | none yet |
| Group (tight) | `--spacing-group-tight` (0.75rem, new) | none yet |
| Group (loose) | `--spacing-group` (1.25rem, new) | none yet |
| Section | `--spacing-section` (3rem, new — matches the Dashboard's own established `mt-12` rhythm) | none yet |
| Chapter | `--spacing-chapter` (5rem, new) | none yet |
| Page | `--spacing-page` (2rem, new — matches `DashboardPage`'s existing `pt-8`) | none yet |

Base numeric scale (`--spacing: 0.25rem`) is untouched — every existing `p-*`/`gap-*`/`m-*` utility across the app renders identically.

## Elevation Engine

| Level | Current implementation token | First consumer |
|---|---|---|
| Canvas | no shadow (by design) | — |
| Paper | no shadow (by design) | — |
| Workspace | no shadow (by design) | — |
| Interactive | `--shadow-soft` (pre-existing) | `DashboardPanel.tsx` (`primary` weight) |
| Floating | `--shadow-md` (pre-existing) | none yet |
| Overlay | `--color-overlay` (Color Engine — a backdrop, not a shadow) | none yet |
| Modal | `--shadow-lg` (new) + `--color-scrim` | none yet |

## Motion Engine

| Semantic role | Current implementation token | First consumer |
|---|---|---|
| Arrival | `--duration-arrival` (700ms) + `--ease-arrival` (new tokens, codify existing behavior) | already matches `<Reveal>` in `motion-primitives.tsx` exactly — no code change needed |
| Departure | `--duration-departure` (200ms, new) | none yet |
| Hover | `--duration-hover` (150ms) + `--ease-standard` (new tokens, codify existing behavior) | already matches Tailwind's default `transition-colors`, used throughout |
| Press | `--duration-press` (80ms, new) | none yet |
| Focus | `--duration-focus` (100ms, new) | none yet |
| Loading | `--duration-loading` (1200ms, new) | none yet |
| Success | `--duration-success` (400ms, new) | none yet |
| Failure | `--duration-failure` (400ms, new) | none yet |
| Reduced Motion | no token — behavioral requirement | already correctly implemented: `<Reveal>` checks Framer Motion's `useReducedMotion()` and resolves to `opacity: 1` directly |

## Shape Engine

| Role | Current implementation token | First consumer |
|---|---|---|
| Pressable action (primary) | `rounded-full` (existing Tailwind default, no new token needed) | `Button.tsx` (`primary` variant) |
| Bounded container (secondary/danger/ghost actions, form-field inputs) | `rounded-md` → `--radius-md` (pre-existing, now used semantically instead of the ad hoc `rounded-[10px]` bracket value seen elsewhere in the codebase) | `Button.tsx` (`secondary`/`danger`/`ghost`); `TextField.tsx`, `TextArea.tsx`, `Select.tsx` |
| Pill control (toolbar search/filter) | `rounded-full` (existing Tailwind default) — a deliberately different, pre-existing convention for unlabeled toolbar controls, not touched this milestone | `SearchInput.tsx`, `FilterSelect.tsx` (pre-existing) |

Image, dialog, badge, and menu radius roles remain undeclared until a component in that category is actually built.

## Shared Components — Milestone 6

| Component | File | Status |
|---|---|---|
| Button | `src/admin/components/ui/Button.tsx` (new) | 6.1 complete. Variants: `primary`/`secondary`/`danger`/`ghost`; sizes `sm`/`md`/`lg`; `loading` and `icon` props. First real consumer: `AdminTopbar.tsx`'s "جديد" button (a deliberate single smoke-test wiring, not mass adoption — the ~78 other inline pill occurrences found in the pre-implementation audit are untouched). One disclosed refinement: buttons now carry `font-medium`, a small weight increase over the previous ad hoc inline classes. |
| Input System | `src/admin/components/forms/{TextField,TextArea,Select}.tsx` + `src/admin/components/ui/{SearchInput,FilterBar}.tsx` (all pre-existing) | 6.2 complete. No new component built — audit found these five already form a working, widely-adopted system (41 usages across 19 files) across two legitimate conventions (labeled form-field vs. unlabeled toolbar control). Only change: the form-field trio's `rounded-[10px]` → `rounded-md` (identical value). One real consumer migrated: `AdminTopbar.tsx`'s hand-duplicated search input now uses `SearchInput` directly. No separate `Label` component exists — noted, not extracted, since doing so would touch all five components for no immediate need. |
| Card / Panel System | `src/admin/components/ui/Panel.tsx` (relocated + renamed from `src/admin/modules/dashboard/components/DashboardPanel.tsx`) | 6.3 complete. No new component built — the Dashboard's own card shell (with its `primary`/`secondary`/`flat` weight system) was already the correct implementation, just trapped inside the Dashboard module. Moved to `components/ui/`, renamed `DashboardPanel` → `Panel`; all 5 existing Dashboard consumers updated to the new import path (mechanical, zero behavior change). Applied the same `rounded-[10px]` → `rounded-md` fix as Button/Input. One real external consumer migrated: `CustomerContactCard.tsx` (previously hand-duplicated the identical `primary`-weight wrapper + its own `h2`). Audit found ~9 more Order/Customer detail cards with the same duplicated wrapper (`OrderPaymentCard`, `OrderCustomerCard`, `OrderItemsCard`, `OrderTimelineCard`, `OrderDownloadsCard`, `CustomerNotesCard`, `CustomerOrderHistoryCard`, `CustomerActivityTimelineCard`, `ConversationCustomerPanel`) — left untouched per the standing rule (migrate when their own page is next modified, not in bulk). One disclosed, trivial delta: `Panel`'s header-to-content gap is `mt-5`; `CustomerContactCard` previously used `mt-4` — a 4px difference. |
| Table System | `src/admin/components/ui/DataTable.tsx` (pre-existing, already correctly located) | 6.4 complete. No new component built, no migration performed — audit found exactly one `<table>` element in the entire codebase, already in `DataTable<T>`, already adopted by all 11 list pages in the admin (Categories, Books, Communication Categories/Templates/Variables, Orders, Media Library, Coupons, Downloads/Library, Customers, Articles). Zero duplication found, so there was no second implementation to consolidate and no consumer to migrate. Only change: the same `rounded-[10px]` → `rounded-md` consistency fix applied to Button/Input/Panel. |
| Badge / Tag System | `src/admin/components/ui/StatusBadge.tsx` (pre-existing, already correctly located; extended, not replaced) | 6.5 complete. Canonical component already existed (`success`/`warning`/`danger`/`info`/`neutral` variants, 13 consumers) but always rendered a hardcoded leading dot, which is what pushed two real duplicates into existence: `MetricCard.tsx`'s private `TrendPill` helper (identical `bg-{status}/10 text-{status}` pairing, an arrow icon instead of a dot) and a hand-rolled channel-status pill in `CommunicationDashboardPage.tsx`. Extended `StatusBadge` with an optional `icon` prop (`undefined` = default dot, `null` = no icon, or a custom node) — additive and backward-compatible; all 13 existing consumers are unaffected. Migrated `TrendPill` to render through `StatusBadge`. One disclosed, trivial delta: the icon-to-text gap changed from `gap-1` (4px) to `StatusBadge`'s fixed `gap-1.5` (6px). `CommunicationDashboardPage.tsx`'s smaller duplicate was found but left untouched, per the standing rule. |

## Icon / Texture Engines

*(added as their respective milestones land)*
