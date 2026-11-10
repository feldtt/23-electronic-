// Local admin + analytics server for 23 Electronic. No dependencies.
//   node scripts/admin-server.mjs        (port 8082, override with ADMIN_PORT)
//
// Public (any device on the LAN, used by the website tracker):
//   POST /api/track              records a pageview / click event
// Admin (loopback only, needs header "X-Admin: 1"):
//   GET  /api/stats?days=7       aggregated traffic + WhatsApp numbers
//   GET/POST /api/products       list / create
//   PUT/DELETE /api/products/:id update / delete
//   POST /api/upload?name=x.jpg  raw image body -> uploads folder
//   POST /api/rebuild            runs scripts/import-mockup.mjs
import http from "node:http";
import { spawn } from "node:child_process";
import {
  appendFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.ADMIN_PORT) || 8082;
const productsDir = path.join(root, "content", "products");
const analyticsDir = path.join(root, "content", "analytics");
const eventsFile = path.join(analyticsDir, "events.jsonl");
const uploadDirs = [
  path.join(root, "mockup", "toko-23", "assets", "uploads"),
  path.join(root, "public", "assets", "uploads"),
];
mkdirSync(analyticsDir, { recursive: true });
mkdirSync(productsDir, { recursive: true });

const CATEGORIES = ["ac", "kulkas", "mesin-cuci", "tv"];
const FIELD_ORDER = ["category", "group", "title", "photo", "alt", "description", "wa_message", "order", "published"];
const EVENT_TYPES = new Set(["pageview", "click_whatsapp", "click_call", "click_maps"]);

// ---------- helpers ----------
const isLoopback = (addr = "") => ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(addr);
const slugify = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
const json = (res, code, body) => {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
};
const readBody = (req, limit) => new Promise((resolve, reject) => {
  const chunks = []; let size = 0;
  req.on("data", (c) => {
    size += c.length;
    if (size > limit) { reject(Object.assign(new Error("Payload too large"), { code: 413 })); req.destroy(); return; }
    chunks.push(c);
  });
  req.on("end", () => resolve(Buffer.concat(chunks)));
  req.on("error", reject);
});

function corsFor(req, res, isTrack) {
  const origin = req.headers.origin;
  if (isTrack) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (origin) {
    let host = "";
    try { host = new URL(origin).hostname; } catch { /* ignore */ }
    if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Admin");
}

// ---------- products ----------
function readProduct(file) {
  const id = file.replace(/\.json$/, "");
  return { id, ...JSON.parse(readFileSync(path.join(productsDir, file), "utf8")) };
}
function listProducts() {
  return readdirSync(productsDir).filter((f) => f.endsWith(".json")).flatMap((f) => {
    try { return [readProduct(f)]; } catch { return []; }
  });
}
function cleanProduct(input) {
  const p = {
    category: String(input.category ?? ""),
    group: String(input.group ?? "").trim(),
    title: String(input.title ?? "").trim(),
    photo: String(input.photo ?? "").trim(),
    alt: String(input.alt ?? "").trim(),
    description: String(input.description ?? "").trim(),
    wa_message: String(input.wa_message ?? "").trim(),
    order: Number.isFinite(Number(input.order)) ? Math.trunc(Number(input.order)) : 1000,
    published: input.published !== false,
  };
  if (!CATEGORIES.includes(p.category)) throw Object.assign(new Error("Kategori tidak valid"), { code: 400 });
  if (!p.title) throw Object.assign(new Error("Nama produk wajib diisi"), { code: 400 });
  if (p.photo && !/^\/assets\/uploads\/[\w.\-]+$/.test(p.photo)) throw Object.assign(new Error("Path foto tidak valid"), { code: 400 });
  return Object.fromEntries(FIELD_ORDER.map((k) => [k, p[k]]));
}
const writeProduct = (id, p) => writeFileSync(path.join(productsDir, `${id}.json`), JSON.stringify(p, null, 2) + "\n");
const safeId = (id) => /^[a-z0-9][a-z0-9\-_.]*$/i.test(id) && !id.includes("..");

// ---------- analytics ----------
function loadEvents() {
  if (!existsSync(eventsFile)) return [];
  return readFileSync(eventsFile, "utf8").split("\n").flatMap((l) => {
    if (!l) return [];
    try { return [JSON.parse(l)]; } catch { return []; }
  });
}
const dayKey = (t) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
function summarize(events) {
  const views = events.filter((e) => e.type === "pageview");
  const wa = events.filter((e) => e.type === "click_whatsapp");
  const visitors = new Set(events.map((e) => e.vid)).size;
  const waVisitors = new Set(wa.map((e) => e.vid)).size;
  return {
    pageviews: views.length,
    visitors,
    waClicks: wa.length,
    waVisitors,
    callClicks: events.filter((e) => e.type === "click_call").length,
    mapsClicks: events.filter((e) => e.type === "click_maps").length,
    conversion: visitors ? waVisitors / visitors : 0,
  };
}
function topBy(list, keyFn, n = 8) {
  const m = new Map();
  for (const e of list) { const k = keyFn(e); if (k) m.set(k, (m.get(k) || 0) + 1); }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n);
}
function stats(days) {
  const all = loadEvents();
  const now = Date.now();
  const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - (days - 1));
  const from = start.getTime();
  const prevFrom = from - days * 86400000;
  const cur = all.filter((e) => e.t >= from);
  const prev = all.filter((e) => e.t >= prevFrom && e.t < from);

  const series = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(from); d.setDate(d.getDate() + i);
    const key = dayKey(d.getTime());
    const day = cur.filter((e) => dayKey(e.t) === key);
    const s = summarize(day);
    series.push({ date: key, pageviews: s.pageviews, visitors: s.visitors, waClicks: s.waClicks });
  }
  const views = cur.filter((e) => e.type === "pageview");
  const waEv = cur.filter((e) => e.type === "click_whatsapp");
  const hours = Array.from({ length: 24 }, () => ({ pageviews: 0, waClicks: 0 }));
  for (const e of views) hours[new Date(e.t).getHours()].pageviews++;
  for (const e of waEv) hours[new Date(e.t).getHours()].waClicks++;

  const waByPath = new Map();
  for (const e of waEv) waByPath.set(e.path, (waByPath.get(e.path) || 0) + 1);

  return {
    days,
    generatedAt: now,
    totalEventsEver: all.length,
    current: summarize(cur),
    previous: summarize(prev),
    series,
    hours,
    topPages: topBy(views, (e) => e.path, 8).map(([p, n]) => ({ path: p, views: n, waClicks: waByPath.get(p) || 0 })),
    topProducts: topBy(waEv.filter((e) => e.product), (e) => e.product, 8).map(([name, n]) => ({ name, clicks: n })),
    topButtons: topBy(waEv, (e) => e.label || "(tanpa label)", 6).map(([name, n]) => ({ name, clicks: n })),
    referrers: topBy(views, (e) => e.ref || "Langsung", 6).map(([name, n]) => ({ name, visits: n })),
    devices: {
      mobile: views.filter((e) => e.dev === "mobile").length,
      desktop: views.filter((e) => e.dev !== "mobile").length,
    },
    recentWa: waEv.slice(-12).reverse().map((e) => ({ t: e.t, path: e.path, label: e.label || "", product: e.product || "", dev: e.dev })),
  };
}

// ---------- rebuild ----------
let rebuilding = false;
function rebuild() {
  return new Promise((resolve) => {
    if (rebuilding) return resolve({ ok: false, output: "Sedang berjalan, tunggu sebentar." });
    rebuilding = true;
    const child = spawn(process.execPath, [path.join(root, "scripts", "import-mockup.mjs")], { cwd: root });
    let out = "";
    child.stdout.on("data", (d) => (out += d));
    child.stderr.on("data", (d) => (out += d));
    child.on("close", (code) => { rebuilding = false; resolve({ ok: code === 0, output: out.trim() }); });
    child.on("error", (e) => { rebuilding = false; resolve({ ok: false, output: String(e) }); });
  });
}

// ---------- router ----------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  const route = url.pathname;
  const isTrack = route === "/api/track";
  corsFor(req, res, isTrack);
  if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }

  try {
    if (isTrack && req.method === "POST") {
      const raw = (await readBody(req, 4096)).toString("utf8");
      const e = JSON.parse(raw);
      const ua = String(req.headers["user-agent"] || "");
      if (/bot|crawl|spider|headless|lighthouse/i.test(ua) || !EVENT_TYPES.has(e.type)) { res.writeHead(204); return res.end(); }
      const clip = (v, n) => String(v ?? "").slice(0, n);
      const rec = {
        t: Date.now(), type: e.type, vid: clip(e.vid, 40) || "anon",
        path: clip(e.path, 200), page: clip(e.page, 40), ref: clip(e.ref, 120),
        label: clip(e.label, 80), product: clip(e.product, 120),
        dev: /Mobi|Android|iPhone/i.test(ua) ? "mobile" : "desktop",
      };
      appendFileSync(eventsFile, JSON.stringify(rec) + "\n");
      res.writeHead(204); return res.end();
    }

    if (!route.startsWith("/api/")) return json(res, 404, { error: "Not found" });

    // Everything below is admin-only.
    if (!isLoopback(req.socket.remoteAddress) || req.headers["x-admin"] !== "1") {
      return json(res, 403, { error: "Hanya bisa diakses dari komputer ini" });
    }

    if (route === "/api/stats" && req.method === "GET") {
      const days = Math.min(90, Math.max(1, Number(url.searchParams.get("days")) || 7));
      return json(res, 200, stats(days));
    }
    if (route === "/api/products" && req.method === "GET") return json(res, 200, listProducts());
    if (route === "/api/products" && req.method === "POST") {
      const p = cleanProduct(JSON.parse((await readBody(req, 65536)).toString("utf8")));
      const base = `${p.category}-${slugify(p.title) || "produk"}`;
      let id = base, n = 2;
      while (existsSync(path.join(productsDir, `${id}.json`))) id = `${base}-${n++}`;
      writeProduct(id, p);
      return json(res, 201, { id, ...p });
    }
    const m = route.match(/^\/api\/products\/([^/]+)$/);
    if (m) {
      const id = decodeURIComponent(m[1]);
      const file = path.join(productsDir, `${id}.json`);
      if (!safeId(id) || !existsSync(file)) return json(res, 404, { error: "Produk tidak ditemukan" });
      if (req.method === "PUT") {
        const merged = { ...readProduct(`${id}.json`), ...JSON.parse((await readBody(req, 65536)).toString("utf8")) };
        const p = cleanProduct(merged);
        writeProduct(id, p);
        return json(res, 200, { id, ...p });
      }
      if (req.method === "DELETE") { rmSync(file); return json(res, 200, { ok: true }); }
    }
    if (route === "/api/upload" && req.method === "POST") {
      const orig = path.basename(url.searchParams.get("name") || "foto.jpg");
      const ext = path.extname(orig).toLowerCase();
      if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return json(res, 400, { error: "Format harus JPG, PNG, atau WebP" });
      const body = await readBody(req, 8 * 1024 * 1024);
      if (!body.length) return json(res, 400, { error: "File kosong" });
      const base = slugify(path.basename(orig, ext)) || "foto";
      let name = `${base}${ext}`, n = 2;
      while (uploadDirs.some((d) => existsSync(path.join(d, name)))) name = `${base}-${n++}${ext}`;
      for (const d of uploadDirs) { mkdirSync(d, { recursive: true }); writeFileSync(path.join(d, name), body); }
      return json(res, 201, { path: `/assets/uploads/${name}` });
    }
    if (route === "/api/rebuild" && req.method === "POST") return json(res, 200, await rebuild());

    return json(res, 404, { error: "Not found" });
  } catch (err) {
    const code = err.code === 413 ? 413 : err.code === 400 ? 400 : err instanceof SyntaxError ? 400 : 500;
    return json(res, code, { error: err.message });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Admin + analytics server: http://localhost:${PORT}  (admin UI: http://localhost:4321/admin/index.html)`);
});
