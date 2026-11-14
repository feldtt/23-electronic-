// Renders content/products/*.json into HTML:
//   - product cards that replace the <!--PRODUCTS:<category>--> markers in produk/*.html
//   - the featured cards that replace <!--FEATURED-->...<!--/FEATURED--> on the home page
//   - one detail page per product (produk/<id>.html), see renderDetailPage()
// A product's URL is its file name (content/products/<id>.json), which never changes
// when the display name is edited, so shared links keep working.
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
      const cat = taxonomy.categories?.find((c) => c.v === raw.category);
      const stock = raw.stock === null || raw.stock === undefined || raw.stock === "" ? null : Number(raw.stock);
      return {
        file: f,
        ...raw,
        id,
        photos,
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

// `prefix` is the path from the page to produk/, '' on produk/*.html and 'produk/' on the home page.
function card(p, prefix = "") {
  const title = requireTitle(p);
  const href = `${prefix}${p.id}.html`;
  const photo = p.photos[0];
  const badge = soldOut(p) ? '<span class="card-badge gray">Stok habis</span>' : "";
  const img = photo
    ? `<a class="card-img has-photo" href="${esc(href)}" tabindex="-1" aria-hidden="true">${badge}<img src="${esc(photo)}" alt="${esc(p.alt || title)}" loading="lazy"></a>`
    : `<a class="card-img" href="${esc(href)}" tabindex="-1" aria-hidden="true">${badge}${FRIDGE_ICON}</a>`;
  const price = formatPrice(p.price);
  return `<div class="card">
              ${img}
              <div class="card-body">
                <h3><a class="card-title" href="${esc(href)}">${esc(title)}</a></h3>
                <div class="card-meta">${esc(p.description)}</div>
                <div class="price">${price ?? "Cek harga via WA"}</div>
                <div class="card-actions">
                  <a href="${esc(href)}" class="btn btn-secondary">Detail</a>
                  <a href="#" class="btn btn-wa wa-link" data-msg="${esc(defaultMessage(p))}">Tanya stok</a>
                </div>
              </div>
            </div>`;
}

export function renderCategory(products, category) {
  const items = products.filter((p) => p.category === category && isShown(p)).sort(byOrder);

  // Groups keep the order in which their first product appears.
  const groups = new Map();
  for (const p of items) {
    // `group` may be a string (old files) or an array (multiple sub-categories).
    const names = groupsOf(p);
    for (const g of names.length ? names : [DEFAULT_GROUP[category] || "Produk"]) {
      if (!groups.has(g)) groups.set(g, []);
      groups.get(g).push(p);
    }
  }
  if (groups.size === 0) {
    return `<p style="color:var(--muted);">Daftar produk sedang diperbarui. Hubungi admin via WhatsApp untuk stok terbaru.</p>`;
  }

  let first = true;
  let out = "";
  for (const [name, list] of groups) {
    const style = first ? "margin-bottom:16px;" : "margin-top:40px;margin-bottom:16px;";
    out += `<h2 style="${style}">${esc(name)}</h2>\n          <div class="grid-3">\n            ${list.map((p) => card(p)).join("\n            ")}\n          </div>\n          `;
    first = false;
  }
  return out;
}

// Home page: products ticked "Featured" in the admin. With none ticked, the hand-written
// cards between the markers stay as they are.
const FEATURED_MAX = 10;
export function renderFeatured(products) {
  const items = products.filter((p) => p.featured === true && isShown(p)).sort(byOrder).slice(0, FEATURED_MAX);
  return items.length ? items.map((p) => card(p, "produk/")).join("\n          ") : null;
}

export function expandProductMarkers(html, products) {
  return html
    .replace(/<!--PRODUCTS:([a-z-]+)-->/g, (_, category) => renderCategory(products, category))
    .replace(/<!--FEATURED-->([\s\S]*?)<!--\/FEATURED-->/g, (_, fallback) => renderFeatured(products) ?? fallback);
}

// Up to 4 other shown products that share at least one sub-category, sold-out ones left out.
function relatedProducts(p, products) {
  const mine = new Set(groupsOf(p).map((g) => g.toLowerCase()));
  if (!mine.size) return [];
  return products
    .filter((x) => x.id !== p.id && x.category === p.category && isShown(x) && !soldOut(x))
    .map((x) => ({ x, shared: groupsOf(x).filter((g) => mine.has(g.toLowerCase())).length }))
    .filter((r) => r.shared > 0)
    .sort((a, b) => b.shared - a.shared || byOrder(a.x, b.x))
    .slice(0, 4)
    .map((r) => r.x);
}

function renderDetailPage(p, products) {
  const title = requireTitle(p);
  const href = `${p.id}.html`;
  const cat = CATEGORY_PAGES[p.category];
  const price = formatPrice(p.price);
  const groups = groupsOf(p);
  const description = String(p.description ?? "").trim();
  const metaDesc = (description.replace(/\s+/g, " ").slice(0, 150) || `Tanya stok dan harga ${title} di 23 Electronic, Ciputat.`);
  const related = relatedProducts(p, products);
  const absolute = (src) => `${SITE_URL}${src.startsWith("/") ? "" : "/"}${src}`;

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

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: title,
    ...(description ? { description } : {}),
    ...(p.photos.length ? { image: p.photos.map(absolute) } : {}),
    category: p.categoryLabel,
    ...(price
      ? { offers: { "@type": "Offer", priceCurrency: "IDR", price: String(Math.round(Number(p.price))), availability: soldOut(p) ? "https://schema.org/OutOfStock" : "https://schema.org/InStock" } }
      : {}),
  };
  const ldJson = JSON.stringify(ld).replace(/</g, "\\u003c");

  const crumbCat = cat ? `<a href="${cat.page}">${esc(p.categoryLabel)}</a>` : `<span>${esc(p.categoryLabel)}</span>`;

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
      <strong>${esc(title)}</strong>
    </div>
  </div>

  <section class="section">
    <div class="container">
      <div class="pd">
        <div class="pd-gallery">
          ${gallery}
        </div>
        <div class="pd-info">
          ${groups.length ? `<div class="pd-tags">${groups.map((g) => `<span class="tag">${esc(g)}</span>`).join(" ")}</div>` : ""}
          <h1>${esc(title)}</h1>
          ${priceBlock}
          ${stockBlock}
          <a href="#" class="btn btn-wa pd-wa wa-link" data-msg="${esc(defaultMessage(p))}" data-product="${esc(title)}">Chat WhatsApp</a>
          <p class="pd-note">Stok dan harga final dikonfirmasi admin via WhatsApp.</p>
        </div>
      </div>
${description ? `
      <div class="pd-section">
        <h2>Deskripsi Produk</h2>
        <div class="pd-desc">${esc(description)}</div>
      </div>
` : ""}${related.length ? `
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
    document.querySelectorAll('.pd-thumb').forEach(function (b) {
      b.addEventListener('click', function () {
        document.getElementById('pdMain').src = b.dataset.src;
        document.querySelectorAll('.pd-thumb').forEach(function (x) { x.classList.toggle('on', x === b); });
      });
    });
  </script>
</body>
</html>
`;
}

// [{ id, html }] for every published product.
export function renderDetailPages(products) {
  return products.filter(isShown).map((p) => ({ id: p.id, html: renderDetailPage(p, products) }));
}
