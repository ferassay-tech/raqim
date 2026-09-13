# RAQIM — رقيم

RAQIM is a bilingual digital publishing house focused on Arabic-first digital
books for women and mothers, combining a premium editorial storefront with an
internal platform for managing books, digital editions, orders, payments, and
publishing operations.

## What RAQIM Is

RAQIM is not a generic bookstore template — it's a purpose-built platform for
one publisher's own catalog. The public site is where readers discover and
purchase digital books; the Admin is where the RAQIM team runs the business
behind it: writing and pricing books, managing the files customers download,
reviewing and confirming payments, and controlling who on the team can do
what.

There are no customer accounts. Checkout is guest-only, and a "customer" in
the Admin is simply a view derived from someone's order history — not a
sign-up system. Payment is handled through manual, region-appropriate payment
confirmation: a customer submits proof of payment during checkout, and an
admin reviews and confirms it before the order is marked paid and the
customer's download access is granted.

## Experience

The public site is built around a cinematic, editorial presentation of each
book rather than a conventional product grid. The homepage Hero centers on an
interactive 3D rendering of the featured book, which responds to cursor
movement on desktop and to physical device orientation on mobile — tilting
naturally as the visitor moves their phone, with reduced-motion preferences
respected throughout. Individual book pages read as a designed narrative
(story, chapters, features, reader testimonials, FAQ) rather than a bare
listing.

The interface is Arabic-first and right-to-left by design, with English
supported as a secondary language across the public site. Typography, color,
and spacing follow a single, deliberate design system rather than
per-page styling.

## Core Capabilities

- **Books & Digital Editions** — bilingual book records with multi-currency
  pricing (USD/EGP/ILS, no currency conversion), curated placement
  (hero/featured/library/coming soon), categories, and full editorial content
  per book.
- **Digital Library & Secure Downloads** — a centralized library of
  downloadable files (PDF/EPUB/MOBI/ZIP), with one book able to carry
  multiple files (e.g. separate language editions). Customer delivery goes
  through expiring, download-limited tokens rather than direct file links,
  and is only ever issued for a confirmed paid order.
- **Orders & Manual Payment Confirmation** — guest checkout, region-appropriate
  manual payment methods, customer-submitted payment proof, and an
  admin-reviewed confirmation step before an order is marked paid.
- **Customers** — a read-only view derived from order history; there is no
  customer login or account system.
- **Admin & Role-Based Access** — a full back office covering books, orders,
  coupons, media, site content, and team communications, protected by a
  Supabase-backed role and permission system (owner, super admin, admin,
  editor, analyst) with a two-step invitation flow for adding new team
  members.
- **Bilingual, RTL-first Experience** — Arabic as the primary language and
  writing direction across the entire public site, with English maintained
  as a first-class second language.

## Technology

- **React 19** + **TypeScript**
- **Vite 6** — build tooling and dev server
- **React Router 7** — client-side routing
- **Tailwind CSS 4** — styling
- **Motion** (`motion/react`) — animation and interaction
- **react-pageflip** — the interactive 3D book experience
- **Supabase** — Postgres database, authentication, and file storage
- **Vercel** — hosting and serverless functions

## Architecture

```
src/
  pages/               public routes (home, books, checkout, blog, etc.)
  components/          shared public UI (nav, footer, hero, motion helpers)
  admin/
    modules/           one folder per Admin feature area (books, orders,
                        marketing, downloads, media, communications,
                        customers, categories, settings, admin users,
                        dashboard)
    context/           the shared data layer between the public site and Admin
  context/             checkout and language/locale state
  config/              payment method and brand configuration
  i18n/                Arabic/English translation files
api/                   Vercel serverless functions (email sending, payment
                       attachment handling — anything requiring a
                       server-side-only key)
supabase/migrations/   the database schema, as a sequence of migrations
```

The public site and the Admin are one application, sharing the same data
layer (`src/admin/context/`) — content managed in the Admin is what the
public site renders, not a separate synced copy.

## Local Development

This project uses **npm**.

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # production build (sitemap + typecheck + build + SEO prerender) -> dist/
npm run preview  # preview the production build locally
npm run lint     # run ESLint
```

## Deployment

RAQIM is deployed on **Vercel** as a single-page application with SPA
fallback routing (see `vercel.json`), alongside a small set of Vercel
serverless functions under `api/` for operations that require a server-side
secret — sending transactional email, handling payment-attachment uploads,
and related cleanup. The application backend (database, authentication, and
file storage) is **Supabase**.

## Environment & Security

Configuration is provided through environment variables — see
`.env.example` for the complete list and explanation of each. Broadly:

- A small set of `VITE_`-prefixed variables (the Supabase project URL and
  its public anon key) are intentionally part of the client bundle; access
  control for the data and files they can reach is enforced by Supabase
  Row-Level Security policies, not by keeping these values secret.
- Server-only variables (used exclusively by the functions in `api/`) are
  never exposed to the client and must only ever be set as environment
  variables on the server/hosting side.

No secrets, credentials, or infrastructure details beyond this are stored in
the repository.

## Project Status

The large majority of the Admin and the entire public site described above
are live and in production use. Two areas are currently placeholders,
confirmed directly in the code rather than assumed:

- **Analytics** (`/admin/analytics`) — not yet built; the page currently
  displays a "coming soon" placeholder.
- **Communications → History** and **Communications → Settings** — not yet
  built; both currently display placeholders. The rest of Communications
  (dashboard, templates, theme, messages) is fully functional.

Everything else documented in this README reflects current, working
functionality.
