// Renders content/products/*.json into HTML:
//   - product cards that replace the <!--PRODUCTS:<category>--> markers in produk/*.html
//   - the featured cards that replace <!--FEATURED-->...<!--/FEATURED--> on the home page
//   - one detail page per product (produk/<id>.html), see renderDetailPage()
// A product's URL is its file name (content/products/<id>.json), which never changes
// when the display name is edited, so shared links keep working.
//
// Series: products that share the same `series` text (and have a `variant` label such as
// "1/2 PK") are shown as ONE card and ONE page (produk/<series-slug>.html) with a PK
// picker. Each product's own URL produk/<id>.html redirects to that page with the
// variant preselected (#<id>). A series with fewer than 2 shown products is not grouped.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const SITE_URL = (process.env.SITE_URL || "http://localhost:4321").replace(/\/$/, "");

const DEFAULT_GROUP = {
  ac: "Unit AC yang Tersedia",
  kulkas: "Kulkas",
  "mesin-cuci": "Mesin Cuci yang Tersedia",
  tv: "Televisi yang Tersedia",
};

// Built-in categories that have their own listing page in produk/.
const CATEGORY_PAGES = {
  ac: { label: "AC", page: "ac.html" },
  kulkas: { label: "Kulkas", page: "kulkas.html" },
  "mesin-cuci": { label: "Mesin Cuci", page: "mesin-cuci.html" },
  tv: { label: "TV & Elektronik", page: "tv-dan-elektronik-rumah.html" },
};
// File names in produk/ that a product id must never take over.
const RESERVED_IDS = new Set(["index", ...Object.values(CATEGORY_PAGES).map((c) => c.page.replace(/\.html$/, ""))]);

const FRIDGE_ICON = '<svg width="46" height="52" viewBox="0 0 46 52" fill="none" stroke="#9aa4b0" stroke-width="2" aria-hidden="true"><rect x="10" y="3" width="26" height="46" rx="3"/><line x1="10" y1="21" x2="36" y2="21"/><line x1="15" y1="9" x2="15" y2="15"/><line x1="15" y1="26" x2="15" y2="35"/></svg>';

// Escapes for HTML text/attributes. Braces are escaped too: Astro would otherwise read
// "{...}" inside a page body as a JS expression.
const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\{/g, "&#123;")
    .replace(/\}/g, "&#125;");

export function loadProducts(repoRoot) {
  const dir = path.join(repoRoot, "content", "products");
  if (!existsSync(dir)) return [];
  const uploadsRoot = path.join(repoRoot, "mockup", "toko-23");
  let taxonomy = { categories: [] };
  try { taxonomy = JSON.parse(readFileSync(path.join(repoRoot, "content", "taxonomy.json"), "utf8")); } catch { /* optional */ }

  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      let raw;
      try {
        raw = JSON.parse(readFileSync(path.join(dir, f), "utf8"));
      } catch (err) {
        throw new Error(`content/products/${f} is not valid JSON: ${err.message}`);
      }
      const id = f.replace(/\.json$/, "");
      // `photos` is the list; `photo` (older files) is the same as the first entry.
      const listed = Array.isArray(raw.photos) ? raw.photos : raw.photo ? [raw.photo] : [];
      const photos = listed.map((x) => String(x).trim()).filter(Boolean).filter((src) => {
        if (existsSync(path.join(uploadsRoot, src))) return true;
        console.warn(`[products] ${id}: photo ${src} not found, showing placeholder`);
        return false;
      });
      const specs = (Array.isArray(raw.specs) ? raw.specs : [])
        .map((x) => ({ label: String(x?.label ?? "").trim(), value: String(x?.value ?? "").trim() }))
        .filter((x) => x.label && x.value);
      const cat = taxonomy.categories?.find((c) => c.v === raw.category);
      const stock = raw.stock === null || raw.stock === undefined || raw.stock === "" ? null : Number(raw.stock);
      return {
        file: f,
        ...raw,
        id,
        photos,
        specs,
        stock: Number.isFinite(stock) ? stock : null,
        categoryLabel: CATEGORY_PAGES[raw.category]?.label || cat?.l || raw.category,
      };
    });
}

// "Rp 3.450.000" when a price is set, otherwise null.
function formatPrice(price) {
  const n = Math.round(Number(price));
  if (!Number.isFinite(n) || n <= 0) return null;
  return `Rp ${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

const groupsOf = (p) => [].concat(p.group ?? []).map((x) => String(x).trim()).filter(Boolean);
const byOrder = (a, b) => (a.order ?? 1000) - (b.order ?? 1000) || String(a.title).localeCompare(String(b.title));
const isShown = (p) => p.published !== false && !RESERVED_IDS.has(p.id);
// stock null = never filled in (shows nothing); 0 = sold out; >0 = available.
const soldOut = (p) => p.stock === 0;
const defaultMessage = (p) => p.wa_message?.trim() || `Halo 23 Electronic, mau tanya stok & harga ${String(p.title).trim()}.`;

function requireTitle(p) {
  const title = String(p.title ?? "").trim();
  if (!title) throw new Error(`content/products/${p.file} has no title`);
  return title;
}

// ---------- series ----------

const slugify = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
// "1/2 PK" -> 0.5, "1,5 PK" -> 1.5, "3/4" -> 0.75, unknown -> 99 (sorted last).
function pkValue(v) {
  const m = String(v ?? "").replace(",", ".").match(/(\d+)\s*\/\s*(\d+)|(\d+(?:\.\d+)?)/);
  if (!m) return 99;
  return m[3] ? parseFloat(m[3]) : Number(m[1]) / Number(m[2]);
}
const byPk = (a, b) => pkValue(a.variant) - pkValue(b.variant) || byOrder(a, b);
const unionGroups = (members) => [...new Set(members.flatMap(groupsOf))];

// One entry per card/page: a series (>= 2 shown members) or a single product.
// { id: page slug, series: name|null, members: [product], lead: product, category, groups, order }
export function buildEntities(products) {
  const shown = products.filter(isShown);
  const taken = new Set([...products.map((p) => p.id), ...RESERVED_IDS]);
  const bySeries = new Map();
  for (const p of shown) {
    const s = String(p.series ?? "").trim();
    if (!s || !String(p.variant ?? "").trim()) continue;
    const key = `${p.category}|${s}`;
    if (!bySeries.has(key)) bySeries.set(key, []);
    bySeries.get(key).push(p);
  }
  const grouped = new Set();
  const entities = [];
  const slugs = new Set();
  for (const members of bySeries.values()) {
    if (members.length < 2) continue;
    members.sort(byPk);
    const name = String(members[0].series).trim();
    let slug = slugify(name) || "seri";
    if (taken.has(slug) || slugs.has(slug)) slug = `seri-${slug}`;
    slugs.add(slug);
    members.forEach((m) => grouped.add(m.id));
    entities.push({
      id: slug, series: name, members, lead: members[0], category: members[0].category,
      groups: unionGroups(members), order: Math.min(...members.map((m) => m.order ?? 1000)),
      featured: members.some((m) => m.featured === true),
    });
  }
  for (const p of shown) {
    if (grouped.has(p.id)) continue;
    entities.push({ id: p.id, series: null, members: [p], lead: p, category: p.category, groups: groupsOf(p), order: p.order ?? 1000, featured: p.featured === true });
  }
  return entities;
}

const entityTitle = (e) => (e.series ? e.series : requireTitle(e.lead));
const entityByOrder = (a, b) => a.order - b.order || entityTitle(a).localeCompare(entityTitle(b));
const allSoldOut = (e) => e.members.every(soldOut);
const minPrice = (e) => {
  const prices = e.members.map((m) => Math.round(Number(m.price))).filter((n) => Number.isFinite(n) && n > 0);
  return prices.length ? Math.min(...prices) : null;
};
const maxPrice = (e) => {
  const prices = e.members.map((m) => Math.round(Number(m.price))).filter((n) => Number.isFinite(n) && n > 0);
  return prices.length ? Math.max(...prices) : null;
};

// `prefix` is the path from the page to produk/, '' on produk/*.html and 'produk/' on the home page.
function card(e, prefix = "") {
  const p = e.lead;
  const isSeries = !!e.series;
  const title = entityTitle(e);
  const href = `${prefix}${e.id}.html`;
  const photo = p.photos[0];
  const badge = allSoldOut(e) ? '<span class="card-badge gray">Stok habis</span>' : "";
  const img = photo
    ? `<a class="card-img has-photo" href="${esc(href)}" tabindex="-1" aria-hidden="true">${badge}<img src="${esc(photo)}" alt="${esc(p.alt || title)}" loading="lazy"></a>`
    : `<a class="card-img" href="${esc(href)}" tabindex="-1" aria-hidden="true">${badge}${FRIDGE_ICON}</a>`;
  let priceText;
  let meta;
  let metaHtml = null;
  let msg;
  if (isSeries) {
    const lowest = minPrice(e);
    const highest = maxPrice(e);
    // One price when all variants cost the same, otherwise the range. Hovering a chip shows that variant's price.
    priceText = !lowest ? "Cek harga via WA" : lowest === highest ? formatPrice(lowest) : `${formatPrice(lowest)} - ${formatPrice(highest).replace(/^Rp /, "")}`;
    metaHtml = `<div class="card-variants">${e.members.map((m) => `<a class="cv-chip" href="${esc(`${href}#${m.id}`)}" title="Lihat ${esc(String(m.variant).trim())}" data-price="${esc(formatPrice(m.price) ?? "Cek harga via WA")}">${esc(String(m.variant).trim())}</a>`).join("")}</div>`;
    msg = `Halo 23 Electronic, mau tanya stok & harga ${title}.`;
  } else {
    priceText = formatPrice(p.price) ?? "Cek harga via WA";
    meta = p.description;
    msg = defaultMessage(p);
  }
  return `<div class="card">
              ${img}
              <div class="card-body">
                <h3><a class="card-title" href="${esc(href)}">${esc(title)}</a></h3>
                ${metaHtml ?? `<div class="card-meta">${esc(meta)}</div>`}
                <div class="price">${esc(priceText)}</div>
              </div>
            </div>`;
}

// Flat list for the header search (public/assets/search-index.json). u = page path, k = extra search text.
export function buildSearchIndex(products) {
  return buildEntities(products).sort(entityByOrder).map((e) => {
    const lo = minPrice(e);
    const hi = maxPrice(e);
    return {
      t: entityTitle(e),
      u: `/produk/${e.id}.html`,
      c: e.category,
      g: e.groups,
      i: e.lead.photos[0] ?? "",
      // PK sizes (0.5, 0.75, 1, 1.5 ...) so "ac 1 pk" can match on size instead of substrings.
      v: [...new Set(e.members.map((m) => {
        const raw = String(m.variant || "").trim() || (String(m.title).match(/(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?)\s*PK/i) || [])[1];
        const n = pkValue(raw);
        return n === 99 ? null : n;
      }).filter((n) => n !== null))],
      s: e.series ? e.members.map((m) => ({ v: String(m.variant).trim(), p: formatPrice(m.price) ?? "", id: m.id })) : undefined,
      p: !lo ? "" : lo === hi ? formatPrice(lo) : `${formatPrice(lo)} - ${formatPrice(hi).replace(/^Rp /, "")}`,
      k: [...new Set(e.members.flatMap((m) => [m.title, m.variant, m.id.replace(/-/g, " ")]))].filter(Boolean).join(" "),
    };
  });
}

export function renderCategory(products, category) {
  const items = buildEntities(products).filter((e) => e.category === category).sort(entityByOrder);

  // Groups keep the order in which their first product appears.
  const groups = new Map();
  for (const e of items) {
    // `group` may be a string (old files) or an array (multiple sub-categories).
    for (const g of e.groups.length ? e.groups : [DEFAULT_GROUP[category] || "Produk"]) {
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(e);
    }
  }
  if (groups.size === 0) {
    return `<p style="color:var(--muted);">Daftar produk sedang diperbarui. Hubungi admin via WhatsApp untuk stok terbaru.</p>`;
  }

  let first = true;
  let out = "";
  for (const [name, list] of groups) {
    const style = first ? "margin-bottom:16px;" : "margin-top:40px;margin-bottom:16px;";
    out += `<h2 style="${style}">${esc(name)}</h2>\n          <div class="grid-3">\n            ${list.map((e) => card(e)).join("\n            ")}\n          </div>\n          `;
    first = false;
  }
  return out;
}

// Home page: products ticked "Featured" in the admin. With none ticked, the hand-written
// cards between the markers stay as they are.
const FEATURED_MAX = 10;
export function renderFeatured(products) {
  const items = buildEntities(products).filter((e) => e.featured).sort(entityByOrder).slice(0, FEATURED_MAX);
  return items.length ? items.map((e) => card(e, "produk/")).join("\n          ") : null;
}

export function expandProductMarkers(html, products) {
  return html
    .replace(/<!--PRODUCTS:([a-z-]+)-->/g, (_, category) => renderCategory(products, category))
    .replace(/<!--FEATURED-->([\s\S]*?)<!--\/FEATURED-->/g, (_, fallback) => renderFeatured(products) ?? fallback);
}

// Up to 4 other entities that share at least one sub-category, sold-out ones left out.
function relatedEntities(e, entities) {
  const mine = new Set(e.groups.map((g) => g.toLowerCase()));
  if (!mine.size) return [];
  return entities
    .filter((x) => x.id !== e.id && x.category === e.category && !allSoldOut(x))
    .map((x) => ({ x, shared: x.groups.filter((g) => mine.has(g.toLowerCase())).length }))
    .filter((r) => r.shared > 0)
    .sort((a, b) => b.shared - a.shared || entityByOrder(a.x, b.x))
    .slice(0, 4)
    .map((r) => r.x);
}

// The parts of a detail page that change when another variant is picked.
function view(p) {
  const title = requireTitle(p);
  const price = formatPrice(p.price);
  const description = String(p.description ?? "").trim();

  const gallery = p.photos.length
    ? `<div class="pd-main"><img id="pdMain" src="${esc(p.photos[0])}" alt="${esc(p.alt || title)}"></div>
          ${p.photos.length > 1 ? `<div class="pd-thumbs">${p.photos.map((src, i) => `<button type="button" class="pd-thumb${i === 0 ? " on" : ""}" data-src="${esc(src)}" aria-label="Foto ${i + 1}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}`
    : `<div class="pd-main pd-noimg">${FRIDGE_ICON}</div>`;

  const priceBlock = price
    ? `<div class="pd-price">${price}</div>
          <p class="pd-note">Harga dapat berubah, konfirmasi via WhatsApp.</p>`
    : `<div class="pd-price pd-price-cta">Hubungi kami untuk harga</div>`;
  const stockBlock = soldOut(p)
    ? `<div class="pd-stock out">Stok habis</div>
          <p class="pd-note">Tanya inden atau produk pengganti lewat WhatsApp.</p>`
    : p.stock > 0
      ? `<div class="pd-stock">Tersedia</div>`
      : "";
  const specs = p.specs.length ? `
      <div class="pd-section">
        <h2>Spesifikasi ${esc(title)}</h2>
        <table class="spec-table"><tbody>
          ${p.specs.map((x) => `<tr><th scope="row">${esc(x.label)}</th><td>${esc(x.value)}</td></tr>`).join("\n          ")}
        </tbody></table>
      </div>
` : "";
  const desc = description ? `
      <div class="pd-section">
        <h2>Deskripsi Produk</h2>
        <div class="pd-desc">${esc(description)}</div>
      </div>
` : "";
  return {
    id: p.id, title, price, description, gallery,
    priceHtml: `${priceBlock}\n          ${stockBlock}`,
    specs, desc, msg: defaultMessage(p),
  };
}

function renderDetailPage(e, entities) {
  const isSeries = !!e.series;
  const p = e.lead;
  const v = view(p);
  const title = isSeries ? v.title : v.title;
  const crumbTitle = isSeries ? e.series : v.title;
  const href = `${e.id}.html`;
  const cat = CATEGORY_PAGES[p.category];
  const groups = e.groups;
  const metaDesc = (v.description.replace(/\s+/g, " ").slice(0, 150) || `Tanya stok dan harga ${crumbTitle} di 23 Electronic, Ciputat.`);
  const related = relatedEntities(e, entities);
  const absolute = (src) => `${SITE_URL}${src.startsWith("/") ? "" : "/"}${src}`;

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    ...(v.description ? { description: v.description } : {}),
    ...(p.photos.length ? { image: p.photos.map(absolute) } : {}),
    category: p.categoryLabel,
    ...(v.price
      ? { offers: { "@type": "Offer", priceCurrency: "IDR", price: String(Math.round(Number(p.price))), availability: soldOut(p) ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" } }
      : {}),
  };
  const ldJson = JSON.stringify(ld).replace(/</g, "\\u003c");

  const crumbCat = cat ? `<a href="${cat.page}">${esc(p.categoryLabel)}</a>` : `<span>${esc(p.categoryLabel)}</span>`;

  const variantBlock = isSeries ? `
          <div class="pd-variants" role="group" aria-label="Pilih PK">
            <span class="pd-vlabel">Pilih PK</span>
            ${e.members.map((m, i) => `<button type="button" class="pd-vbtn${i === 0 ? " on" : ""}" data-id="${esc(m.id)}">${esc(String(m.variant).trim())}</button>`).join("\n            ")}
          </div>` : "";

  const data = isSeries
    ? JSON.stringify(Object.fromEntries(e.members.map((m) => {
        const mv = view(m);
        return [m.id, { variant: String(m.variant).trim(), title: mv.title, gallery: mv.gallery, price: mv.priceHtml, specs: mv.specs, desc: mv.desc, msg: mv.msg }];
      }))).replace(/</g, "\\u003c")
    : "";
  const seriesScript = isSeries ? `
  <script type="application/json" id="pdData">${data}</script>
  <script>
    (function () {
      var D = JSON.parse(document.getElementById('pdData').textContent);
      function pick(id, fromClick) {
        var v = D[id];
        if (!v) return;
        document.getElementById('pdGallery').innerHTML = v.gallery;
        document.getElementById('pdTitle').textContent = v.title;
        document.getElementById('pdPrice').innerHTML = v.price;
        document.getElementById('pdSpecs').innerHTML = v.specs;
        document.getElementById('pdDesc').innerHTML = v.desc;
        var wa = document.getElementById('pdWa');
        wa.dataset.msg = v.msg;
        wa.dataset.product = v.title;
        if (window.__waUrl) wa.href = window.__waUrl(v.msg);
        document.title = v.title + ' — 23 Electronic';
        document.querySelectorAll('.pd-vbtn').forEach(function (b) { b.classList.toggle('on', b.dataset.id === id); });
        if (fromClick && history.replaceState) history.replaceState(null, '', '#' + id);
      }
      document.querySelectorAll('.pd-vbtn').forEach(function (b) {
        b.addEventListener('click', function () { pick(b.dataset.id, true); });
      });
      var h = decodeURIComponent(location.hash.slice(1));
      if (h && D[h]) pick(h, false);
    })();
  </script>` : "";

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} — 23 Electronic</title>
  <meta name="description" content="${esc(metaDesc)}">
  <meta property="og:type" content="product">
  <meta property="og:title" content="${esc(title)} — 23 Electronic">
  <meta property="og:description" content="${esc(metaDesc)}">
  <meta property="og:url" content="${esc(`${SITE_URL}/produk/${href}`)}">${p.photos.length ? `\n  <meta property="og:image" content="${esc(absolute(p.photos[0]))}">` : ""}
  <link rel="stylesheet" href="../assets/styles.css">
  <script type="application/ld+json">${ldJson}</script>
</head>
<body>
  <div id="topbar"></div>
  <div id="header"></div>
  <div id="subnav"></div>

  <div class="crumbs">
    <div class="container">
      <a href="../index.html">Beranda</a><span class="sep">›</span>
      <a href="index.html">Produk</a><span class="sep">›</span>
      ${crumbCat}<span class="sep">›</span>
      <strong>${esc(crumbTitle)}</strong>
    </div>
  </div>

  <section class="section">
    <div class="container">
      <div class="pd">
        <div class="pd-gallery" id="pdGallery">
          ${v.gallery}
        </div>
        <div class="pd-info">
          ${groups.length ? `<div class="pd-tags">${groups.map((g) => `<span class="tag">${esc(g)}</span>`).join(" ")}</div>` : ""}
          <h1 id="pdTitle">${esc(title)}</h1>${variantBlock}
          <div id="pdPrice">
          ${v.priceHtml}
          </div>
          <a href="#" id="pdWa" class="btn btn-wa pd-wa wa-link" data-msg="${esc(v.msg)}" data-product="${esc(title)}">Chat WhatsApp</a>
          <p class="pd-note">Stok dan harga final dikonfirmasi admin via WhatsApp.</p>
        </div>
      </div>
      <div id="pdSpecs">${v.specs}</div>
      <div id="pdDesc">${v.desc}</div>
${related.length ? `
      <div class="pd-section">
        <h2>Produk Serupa</h2>
        <div class="grid-4">
          ${related.map((x) => card(x)).join("\n          ")}
        </div>
      </div>
` : ""}    </div>
  </section>

  <div id="cta"></div>
  <div id="footer"></div>

  <script>window.__page = { active: 'produk', basePath: '../' };</script>
  <script src="../assets/partials.js"></script>
  <script>
    document.getElementById('pdGallery').addEventListener('click', function (ev) {
      var b = ev.target.closest('.pd-thumb');
      if (!b) return;
      document.getElementById('pdMain').src = b.dataset.src;
      document.querySelectorAll('.pd-thumb').forEach(function (x) { x.classList.toggle('on', x === b); });
    });
  </script>${seriesScript}
</body>
</html>
`;
}

// Page that sends an old per-product URL to its series page with the variant preselected.
function renderRedirectPage(p, seriesId) {
  const title = requireTitle(p);
  const to = `${seriesId}.html#${p.id}`;
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(title)} — 23 Electronic</title>
  <meta name="robots" content="noindex">
  <meta http-equiv="refresh" content="0;url=${esc(to)}">
  <link rel="canonical" href="${esc(`${SITE_URL}/produk/${seriesId}.html`)}">
</head>
<body>
  <p>Membuka <a href="${esc(to)}">${esc(title)}</a>...</p>
  <script>location.replace(${JSON.stringify(to).replace(/</g, "\\u003c")});</script>
</body>
</html>
`;
}

// [{ id, html }]: one page per single product and per series, plus a redirect page
// for every product that belongs to a series.
export function renderDetailPages(products) {
  const entities = buildEntities(products);
  const pages = [];
  for (const e of entities) {
    pages.push({ id: e.id, html: renderDetailPage(e, entities) });
    if (e.series) for (const m of e.members) pages.push({ id: m.id, html: renderRedirectPage(m, e.id) });
  }
  return pages;
}
