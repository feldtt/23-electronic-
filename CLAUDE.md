# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Client website for **23 Electronic** (repo/URL kept as `toko-23`): sells and services AC, kulkas, mesin cuci and TVs in Ciputat / Pamulang / Tangerang Selatan. Content is Indonesian. Static Astro site deployed on Cloudflare Pages (https://toko-23.pages.dev).

## Commands

```bash
npm install
npm run import:mockup   # regenerate src/pages + public/ from mockup/ (destructive, see below)
npm run dev             # astro dev on 0.0.0.0, http://localhost:4321
npm run build           # astro check && astro build -> dist/
npm run preview         # serve dist/
npx wrangler pages deploy dist --project-name toko-23
```

There is no test or lint setup; `astro check` (run by `build`) is the only static check.

## Architecture: the mockup is the source of truth

The site is authored as plain static HTML in `mockup/toko-23/`. `scripts/import-mockup.mjs` converts it into the Astro project:

- **`src/pages/` and everything copied into `public/` are generated.** The importer does `rmSync` on `src/pages` and rebuilds it, so any edit made directly in `src/pages` is lost on the next import. **Edit `mockup/toko-23/` and re-run `npm run import:mockup`.**
- Each `*.html` becomes a `.astro` file with the HTML kept verbatim, except that every `<script>` gets `is:inline` (Astro would otherwise parse `{`/`}` in JS and JSON-LD as expressions).
- Every non-HTML file in the mockup (CSS, JS, `assets/uploads/` images) is copied into `public/` at the same relative path. `screenshots/` and `.thumbnail` are design artifacts and are skipped. So `public/assets/styles.css`, `public/assets/partials.js` and the product photos are also generated copies; the originals live in `mockup/toko-23/assets/`.
- Folder index pages are nested as `src/pages/<folder>/index/index.astro` so that, with `build.format: "file"` in `astro.config.mjs`, they emit `/<folder>/index.html`. The mockup links use `.html` URLs (`produk/index.html`, `../faq.html`), and this layout keeps them working without rewriting links.

## Shared header / footer

There are no Astro layouts or components. The header, footer, top bar and sticky WhatsApp button are injected client-side by `assets/partials.js`. Each page sets `window.__page = { active, basePath }` (`basePath` is `''` or `'../'`) so the script can highlight the nav and build relative links. The WhatsApp number, maps link and phone number are constants at the top of `partials.js`. A change to the header or footer is a change to that one file.

## Content facts

- Product catalog lives in `mockup/toko-23/produk/*.html` as hand-written cards (photo, brand, model, warranty). Photos are referenced as `/assets/uploads/...`.
- Kulkas page: 12 real models shown as text cards with "Foto menyusul" because there are no fridge photos yet. Store, technician and service-action photos are also placeholders.
- Spec research and the owner's spec sheet are in `docs/` (`state2-spec-research.md`, the PDFs).
- The address "Jl. Dewi Sartika, Ciputat" is an unverified placeholder.
