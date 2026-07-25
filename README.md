# Marafi — مرافئ

Standalone Vite + React 19 website. No framework/platform dependencies —
only public npm packages (react, react-dom, react-router-dom, lucide-react,
motion, tailwindcss, vite, typescript).

## Run locally

```bash
bun install      # or npm install / pnpm install
bun run dev       # dev server at http://localhost:5173
bun run build     # production build -> dist/
bun run preview   # preview the production build
```

## Structure

- `src/App.tsx` — router (react-router-dom v7)
- `src/pages/` — one file per route
- `src/components/` — shared nav, footer, CTA buttons, ornaments, motion helpers
- `src/lib/content.ts` — book/author/blog/FAQ content data
- `public/assets/` — all generated imagery (hero, book covers, patterns)

## Deploying

This is a plain static SPA after `bun run build` (outputs to `dist/`). It can
be deployed to any static host (Netlify, Vercel, Cloudflare Pages, GitHub
Pages, S3+CloudFront, etc.) — just serve `dist/` with an SPA fallback to
`index.html` for unknown routes.
