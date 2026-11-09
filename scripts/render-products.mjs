// Renders content/products/*.json into the product-card HTML that replaces the
// <!--PRODUCTS:<category>--> markers in mockup/toko-23/produk/*.html.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_GROUP = {
  ac: "Unit AC yang Tersedia",
  kulkas: "Kulkas",
  "mesin-cuci": "Mesin Cuci yang Tersedia",
  tv: "Televisi yang Tersedia",
};

const FRIDGE_ICON = '<svg width="46" height="52" viewBox="0 0 46 52" fill="none" stroke="#9aa4b0" stroke-width="2" aria-hidden="true"><rect x="10" y="3" width="26" height="46" rx="3"/><line x1="10" y1="21" x2="36" y2="21"/><line x1="15" y1="9" x2="15" y2="15"/><line x1="15" y1="26" x2="15" y2="35"/></svg>';

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function loadProducts(repoRoot) {
  const dir = path.join(repoRoot, "content", "products");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => {
      try {
        return { file: f, ...JSON.parse(readFileSync(path.join(dir, f), "utf8")) };
      } catch (err) {
        throw new Error(`content/products/${f} is not valid JSON: ${err.message}`);
      }
    });
}

function card(p) {
  const title = String(p.title ?? "").trim();
  if (!title) throw new Error(`content/products/${p.file} has no title`);
  const photo = String(p.photo ?? "").trim();
  const img = photo
    ? `<div class="card-img has-photo"><img src="${esc(photo)}" alt="${esc(p.alt || title)}" loading="lazy"></div>`
    : `<div class="card-img">${FRIDGE_ICON}</div>`;
  const msg = p.wa_message?.trim() || `Halo 23 Electronic, mau tanya stok & harga ${title}.`;
  return `<div class="card">
              ${img}
              <div class="card-body">
                <h3>${esc(title)}</h3>
                <div class="card-meta">${esc(p.description)}</div>
                <div class="price">Cek harga via WA</div>
                <a href="#" class="btn btn-wa wa-link" data-msg="${esc(msg)}">Tanya stok</a>
              </div>
            </div>`;
}

export function renderCategory(products, category) {
  const items = products
    .filter((p) => p.category === category && p.published !== false)
    .sort((a, b) => (a.order ?? 1000) - (b.order ?? 1000) || String(a.title).localeCompare(String(b.title)));

  // Groups keep the order in which their first product appears.
  const groups = new Map();
  for (const p of items) {
    const g = p.group?.trim() || DEFAULT_GROUP[category] || "Produk";
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(p);
  }
  if (groups.size === 0) {
    return `<p style="color:var(--muted);">Daftar produk sedang diperbarui. Hubungi admin via WhatsApp untuk stok terbaru.</p>`;
  }

  let first = true;
  let out = "";
  for (const [name, list] of groups) {
    const style = first ? "margin-bottom:16px;" : "margin-top:40px;margin-bottom:16px;";
    out += `<h2 style="${style}">${esc(name)}</h2>\n          <div class="grid-3">\n            ${list.map(card).join("\n            ")}\n          </div>\n          `;
    first = false;
  }
  return out;
}

export function expandProductMarkers(html, products) {
  return html.replace(/<!--PRODUCTS:([a-z-]+)-->/g, (_, category) => renderCategory(products, category));
}
