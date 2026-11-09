# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Client website for **23 Electronic** (repo/URL kept as `toko-23`): sells and services AC, kulkas, mesin cuci and TVs in Ciputat / Pamulang / Tangerang Selatan. Content is Indonesian. Static Astro site, run locally only. It is not published: the old toko-23.pages.dev deployment belonged to the original developer and is no longer used.

## Goal

The site helps people find home electronic appliances and converts them into buyers by contacting the shop on WhatsApp. There is no online checkout or cart, by design. When making design or content decisions, favor whatever moves a visitor toward a WhatsApp message (clear product info, visible WhatsApp CTAs, trust signals).

## Commands

```bash
npm install
npm run import:mockup   # regenerate src/pages + public/ from mockup/ (destructive, see below)
npm run dev             # astro dev on 0.0.0.0, http://localhost:4321
npm run build           # astro check && astro build -> dist/
npm run preview         # serve dist/
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

- Status: local only, not deployed. The WhatsApp number in `partials.js` is real and live (`628111523239`); don't change it casually.
- Product catalog lives in `content/products/*.json`, one file per product (category, group, title, photo, description, wa_message, order, published). The category pages in `mockup/toko-23/produk/*.html` contain only a `<!--PRODUCTS:<category>-->` marker (`ac`, `kulkas`, `mesin-cuci`, `tv`); `scripts/render-products.mjs` expands it into cards during `import:mockup`. Photos are referenced as `/assets/uploads/...`. Currently 10 AC, 6 kulkas, 18 washers, 24 TVs. The featured cards on the home page and `produk/index.html` are still hand-written HTML.

- Kulkas 2-pintu models and Polytron 159/179 have no spec-sheet entry yet.
- Kulkas page: 6 real models shown as icon cards because there are no fridge photos yet (README mentions 12 models; only 6 are on the page). Store, technician and service-action photos are also placeholders.
- Spec research and the owner's spec sheet are in `docs/` (`state2-spec-research.md`, the PDFs).
- The address "Jl. Dewi Sartika, Ciputat" is an unverified placeholder.

## Admin panel (Decap CMS)

Local-only product editor at `/admin/index.html` (`public/admin/index.html` + `config.yml`, hand-maintained, not generated). Run `npx decap-server` alongside `npm run dev`; the `proxy` backend in `config.yml` writes JSON to `content/products/` and photos to `mockup/toko-23/assets/uploads/` on disk, with no login. Re-run `npm run import:mockup` after saving. There is no deploy pipeline or OAuth. To change a product field, update both `public/admin/config.yml` and `scripts/render-products.mjs`.
