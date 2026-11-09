# 23 Electronic (repo: toko-23)

Client website for **23 Electronic** (brand name; repo/URL kept as `toko-23`) — AC, kulkas, mesin cuci & home-electronics sales and service (Ciputat / Pamulang / Tangerang Selatan). Deployed on Cloudflare Pages.

- **Status:** Stage 1 (preview) — deployed, mobile-QA'd + polished. Real product catalog + real logo applied 2026-05-30.
- **Live preview:** https://toko-23.pages.dev
- **Stack:** Astro (static); header / footer / sticky-WhatsApp injected client-side by `public/assets/partials.js`.
- **Brand:** real "23 Electronic" logo in the header (`assets/uploads/logo-23-electronic.png`); brand text is "23 Electronic" site-wide.
- **Catalog:** real owner inventory — 12 washers, 10 AC, 17 TVs (photo + brand + model + warranty per card) in `produk/*`. Kulkas page = 12 real models (8 one-door + 4 two-door) as text cards with "Foto menyusul" — **no fridge photos yet**. Photos live in `public/assets/uploads/`, referenced as `/assets/uploads/...`.

The mockup source stays in `mockup/toko-23`; `src/pages` are generated via `npm run import:mockup` (it **wipes** `src/pages` and rebuilds from the mockup + copies every non-HTML file into `public/` — always edit the mockup, never `src/pages`).

## Commands
```bash
npm install
npm run import:mockup
npm run dev
npm run build
npx wrangler pages deploy dist --project-name toko-23   # deploy
```

## Notes / outstanding
- **WhatsApp number = real & live:** `628111523239` (+62 811-1523-239) in `partials.js` (committed `4f082cd`).
- **Kulkas:** 1-pintu models now carry specs (kapasitas/daya/rak) from `docs`/owner spec sheet; **photos still not sent** (cards show "Foto menyusul"). 2-pintu + Polytron 159/179 have no spec sheet entry yet. **Store / technician / "foto pengerjaan" / service-action photos** not sent — those slots stay placeholder.
- The TV page's old non-TV placeholder categories (speaker / dispenser / water-heater / small-appliance) were replaced by the 17 real TVs — re-add if those categories are stocked + photographed.
- Maps/address (`Jl. Dewi Sartika, Ciputat`) is unverified placeholder.
