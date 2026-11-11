// Seller Center admin for 23 Electronic. Vanilla JS, talks to scripts/admin-server.mjs (port 8082).
(() => {
  const API = `http://${location.hostname}:8082/api`;
  const $ = (s, el = document) => el.querySelector(s);
  const view = $('#view');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = new Intl.NumberFormat('en-US');

  const CATS = [
    { v: 'ac', l: 'AC' }, { v: 'kulkas', l: 'Fridge' },
    { v: 'mesin-cuci', l: 'Washing Machine' }, { v: 'tv', l: 'TV & Electronics' },
  ];
  const catLabel = (v) => tax.categories.find((c) => c.v === v)?.l || CATS.find((c) => c.v === v)?.l || String(v).replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  // Built-in categories plus any already used by products
  let tax = { categories: [], groups: [] };
  const allCats = () => {
    const out = CATS.map((c) => ({ v: c.v, l: catLabel(c.v) }));
    for (const c of tax.categories) if (!out.some((k) => k.v === c.v)) out.push(c);
    for (const v of new Set(products.map((x) => x.category))) if (v && !out.some((k) => k.v === v)) out.push({ v, l: catLabel(v) });
    return out;
  };
  const saveTax = (type, name) => api('/taxonomy', { method: 'POST', body: JSON.stringify({ type, name }) }).then((t) => { tax = t; }).catch((e) => toast(e.message, true));
  const groupsOf = (p) => [].concat(p.group ?? []).map((x) => String(x).trim()).filter(Boolean);
  const btnCss = 'flex:none;width:38px;padding:0;font-size:20px;line-height:1';
  // Category: dropdown plus a "+" button that swaps to an inline input in the same row
  const catFieldHtml = (cur) => {
    const opts = allCats(); const known = opts.some((o) => o.v === cur);
    return `<div style="display:flex;gap:6px"><select id="f_cat" style="flex:1">${opts.map((o) => `<option value="${esc(o.v)}" ${o.v === cur ? 'selected' : ''}>${esc(o.l)}</option>`).join('')}${cur && !known ? `<option value="${esc(cur)}" selected>${esc(catLabel(cur))}</option>` : ''}</select><input type="text" id="f_cat_new" placeholder="New category name" hidden style="flex:1"><button type="button" class="btn btn-ghost" id="f_cat_add" style="${btnCss}" title="Add new category">+</button></div>`;
  };
  const wireCat = (root) => {
    const sel = root.querySelector('#f_cat'), inp = root.querySelector('#f_cat_new'), btn = root.querySelector('#f_cat_add');
    const commit = () => {
      const name = inp.value.trim(), v = slug(name);
      if (v) {
        if (![...sel.options].some((o) => o.value === v)) { sel.add(new Option(name, v)); saveTax('category', name); }
        sel.value = v;
      }
      inp.value = ''; inp.hidden = true; sel.hidden = false; btn.textContent = '+';
    };
    btn.onclick = () => {
      if (inp.hidden) { inp.hidden = false; sel.hidden = true; btn.textContent = '✓'; inp.focus(); } else commit();
    };
    inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } };
    return () => { if (!inp.hidden) commit(); return sel.value; };
  };
  // Sub-categories: chip box with an input and a "+" button; several allowed
  // Custom suggestion list (native datalist pops up at the wrong place inside the drawer)
  const suggest = (inp, host, items) => {
    host.classList.add('sug-host');
    const box = document.createElement('div'); box.className = 'sug'; box.hidden = true; host.appendChild(box);
    const show = () => {
      const k = inp.value.trim().toLowerCase();
      const m = items().filter((g) => g.toLowerCase().includes(k));
      box.innerHTML = m.map((g) => `<button type="button" data-v="${esc(g)}">${esc(g)}</button>`).join('');
      box.hidden = !m.length;
    };
    inp.addEventListener('focus', show); inp.addEventListener('input', show);
    inp.addEventListener('blur', () => { box.hidden = true; });
    box.addEventListener('mousedown', (e) => { const b = e.target.closest('button'); if (!b) return; e.preventDefault(); inp.value = b.dataset.v; box.hidden = true; inp.focus(); });
  };
  const groupFieldHtml = () => `<div id="f_group_box" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;border:1px solid var(--line,#ccc);border-radius:8px;padding:6px"><span id="f_group_chips" style="display:contents"></span><input type="text" id="f_group_in" placeholder="Type or pick a sub-category" style="flex:1;min-width:140px;border:0;outline:0;background:transparent"><button type="button" class="btn btn-ghost btn-sm" id="f_group_add" title="Add sub-category">+</button></div>`;
  const wireGroups = (root, initial, all) => {
    let list = [...initial];
    const chips = root.querySelector('#f_group_chips'), inp = root.querySelector('#f_group_in');
    suggest(inp, root.querySelector('#f_group_box'), () => all.filter((g) => !list.some((x) => x.toLowerCase() === g.toLowerCase())));
    const draw = () => {
      chips.innerHTML = list.map((g, i) => `<span class="pill b" style="display:inline-flex;gap:6px;align-items:center">${esc(g)}<button type="button" data-i="${i}" aria-label="Remove" style="border:0;background:none;cursor:pointer;font-size:15px;line-height:1;color:inherit">×</button></span>`).join('');
      chips.querySelectorAll('button').forEach((b) => (b.onclick = () => { list.splice(+b.dataset.i, 1); draw(); }));
    };
    const add = () => { const v = inp.value.trim(); if (v && !list.some((x) => x.toLowerCase() === v.toLowerCase())) { list.push(v); saveTax('group', v); } inp.value = ''; draw(); };
    root.querySelector('#f_group_add').onclick = add;
    inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } };
    draw();
    return () => { add(); return list; };
  };

  // ---------- api ----------
  async function api(path, opt = {}) {
    const res = await fetch(API + path, {
      ...opt,
      headers: { 'X-Admin': '1', ...(opt.body && !(opt.body instanceof Blob) ? { 'Content-Type': 'application/json' } : {}), ...opt.headers },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
    return data;
  }

  function toast(msg, err) {
    const t = document.createElement('div');
    t.className = 'toast' + (err ? ' err' : '');
    t.textContent = msg;
    $('#toasts').appendChild(t);
    setTimeout(() => t.remove(), err ? 5000 : 2600);
  }

  async function checkServer() {
    const el = $('#srv');
    try {
      await api('/products');
      el.className = 'srv ok'; el.lastElementChild.textContent = 'Server online';
      return true;
    } catch {
      el.className = 'srv bad'; el.lastElementChild.textContent = 'Server offline';
      return false;
    }
  }
  const offlineBanner = () => `<div class="banner"><b>The admin server is not running.</b> Open a new terminal in the project folder and run <span class="code">npm.cmd run admin</span>, then reload this page.</div>`;

  // ---------- router ----------
  const routes = { dashboard: renderDashboard, produk: renderProducts, kategori: renderTaxonomy };
  const titles = { dashboard: 'Dashboard', produk: 'Products', kategori: 'Categories' };
  function route() {
    const name = (location.hash.match(/^#\/(\w+)/) || [])[1];
    const r = routes[name] ? name : 'dashboard';
    document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('on', a.dataset.route === r));
    $('#pageTitle').textContent = titles[r];
    $('#side').classList.remove('open');
    routes[r]();
  }
  window.addEventListener('hashchange', route);
  $('#burger').onclick = () => $('#side').classList.toggle('open');

  let pending = false;
  const setPending = (v) => { pending = v; $('#rebuildBtn').textContent = v ? 'Publish to website •' : 'Publish to website'; };
  $('#rebuildBtn').onclick = async (e) => {
    const b = e.currentTarget; b.disabled = true; b.textContent = 'Working…';
    try {
      const r = await api('/rebuild', { method: 'POST' });
      if (r.ok) { setPending(false); toast('Website updated. Reload the shop page to see the changes.'); }
      else toast('Failed: ' + (r.output || 'unknown').slice(0, 200), true);
    } catch (err) { toast(err.message, true); }
    b.disabled = false; setPending(pending);
  };

  // =====================================================================
  // DASHBOARD
  // =====================================================================
  let days = 7;

  function delta(cur, prev, suffix = '') {
    if (!prev && !cur) return `<span class="d flat">–</span>`;
    if (!prev) return `<span class="d up">▲ new</span>`;
    const p = ((cur - prev) / prev) * 100;
    const cls = p > 0.5 ? 'up' : p < -0.5 ? 'down' : 'flat';
    const arrow = p > 0.5 ? '▲' : p < -0.5 ? '▼' : '■';
    return `<span class="d ${cls}">${arrow} ${Math.abs(p).toFixed(0)}%${suffix}</span>`;
  }
  const pct = (x) => (x * 100).toFixed(1) + '%';
  const niceMax = (m) => { if (m <= 5) return 5; const p = 10 ** Math.floor(Math.log10(m)); return Math.ceil(m / p) * p; };
  const shortDate = (k) => { const [, m, d] = k.split('-'); return `${+d}/${+m}`; };
  const dayName = (k) => new Date(k + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

  function lineChart(series) {
    const W = 760, H = 250, L = 38, R = 12, T = 12, B = 28;
    const iw = W - L - R, ih = H - T - B;
    const max = niceMax(Math.max(1, ...series.map((s) => Math.max(s.visitors, s.waClicks))));
    const x = (i) => L + (series.length === 1 ? iw / 2 : (i / (series.length - 1)) * iw);
    const y = (v) => T + ih - (v / max) * ih;
    const path = (k) => series.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(s[k]).toFixed(1)}`).join('');
    const area = (k) => `${path(k)}L${x(series.length - 1)},${T + ih}L${x(0)},${T + ih}Z`;
    let grid = '';
    for (let i = 0; i <= 4; i++) {
      const v = (max / 4) * i, yy = y(v);
      grid += `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" stroke="#eef0f3"/><text x="${L - 8}" y="${yy + 4}" text-anchor="end" font-size="11" fill="#8a92a0">${Math.round(v)}</text>`;
    }
    const step = Math.ceil(series.length / 8);
    const labels = series.map((s, i) => (i % step === 0 || i === series.length - 1) ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#8a92a0">${shortDate(s.date)}</text>` : '').join('');
    const dots = series.length <= 31 ? series.map((s, i) => `<circle cx="${x(i)}" cy="${y(s.visitors)}" r="3" fill="#0f69ab"/><circle cx="${x(i)}" cy="${y(s.waClicks)}" r="3" fill="#25d366"/>`).join('') : '';
    return `<div class="chart" id="lc"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Chart of visitors and WhatsApp clicks per day">
      ${grid}${labels}
      <path d="${area('visitors')}" fill="#0f69ab" opacity=".08"/>
      <path d="${path('visitors')}" fill="none" stroke="#0f69ab" stroke-width="2.2" stroke-linejoin="round"/>
      <path d="${path('waClicks')}" fill="none" stroke="#25d366" stroke-width="2.2" stroke-linejoin="round"/>
      ${dots}<line id="lcx" y1="${T}" y2="${T + ih}" stroke="#c5cdd9" opacity="0"/>
    </svg></div>`;
  }
  function wireChart(series) {
    const box = $('#lc'); if (!box) return;
    const svg = box.querySelector('svg'), vline = $('#lcx');
    const tip = document.createElement('div'); tip.className = 'tip'; tip.hidden = true; box.appendChild(tip);
    svg.addEventListener('mousemove', (e) => {
      const r = svg.getBoundingClientRect(), W = 760, L = 38, R = 12;
      const px = ((e.clientX - r.left) / r.width) * W;
      const i = Math.max(0, Math.min(series.length - 1, Math.round(((px - L) / (W - L - R)) * (series.length - 1))));
      const s = series[i];
      const cx = L + (series.length === 1 ? (W - L - R) / 2 : (i / (series.length - 1)) * (W - L - R));
      vline.setAttribute('x1', cx); vline.setAttribute('x2', cx); vline.setAttribute('opacity', 1);
      tip.hidden = false;
      tip.style.left = `${(cx / W) * r.width}px`; tip.style.top = `${(e.clientY - r.top)}px`;
      tip.innerHTML = `<b>${dayName(s.date)}</b>Visitors: ${s.visitors}<br>WhatsApp clicks: ${s.waClicks}<br>Page views: ${s.pageviews}`;
    });
    svg.addEventListener('mouseleave', () => { tip.hidden = true; vline.setAttribute('opacity', 0); });
  }

  function hourChart(hours) {
    const W = 520, H = 170, L = 6, B = 22, T = 8, bw = (W - L) / 24;
    const max = Math.max(1, ...hours.map((h) => h.pageviews));
    const bars = hours.map((h, i) => {
      const bh = (h.pageviews / max) * (H - B - T), wh = (h.waClicks / max) * (H - B - T);
      const xx = L + i * bw;
      return `<g><title>${String(i).padStart(2, '0')}:00 — ${h.pageviews} views, ${h.waClicks} WA clicks</title>
        <rect x="${xx + 2}" y="${H - B - bh}" width="${bw - 4}" height="${Math.max(bh, h.pageviews ? 2 : 0)}" rx="3" fill="#c8def0"/>
        <rect x="${xx + 2}" y="${H - B - wh}" width="${bw - 4}" height="${Math.max(wh, h.waClicks ? 2 : 0)}" rx="3" fill="#25d366"/>
        ${i % 3 === 0 ? `<text x="${xx + bw / 2}" y="${H - 6}" text-anchor="middle" font-size="10.5" fill="#8a92a0">${String(i).padStart(2, '0')}</text>` : ''}</g>`;
    }).join('');
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="Activity per hour">${bars}</svg>`;
  }

  function rankList(items, { valueKey, nameKey, subFn, green }) {
    if (!items.length) return `<div class="empty">No data yet</div>`;
    const max = Math.max(...items.map((i) => i[valueKey]));
    return `<ol class="rank ${green ? 'g' : ''}">${items.map((it, i) => `<li>
      <span class="n">${i + 1}</span>
      <span class="nm" title="${esc(it[nameKey])}">${esc(it[nameKey])}${subFn ? `<small>${subFn(it)}</small>` : ''}</span>
      <span class="vl">${nf.format(it[valueKey])}</span>
      <span class="meter"><b style="width:${(it[valueKey] / max) * 100}%"></b></span></li>`).join('')}</ol>`;
  }
  const pageName = (p) => p === '/' || p === '/index.html' ? 'Home' : p.replace(/^\//, '').replace(/\.html$/, '').replace(/\/index$/, '') || p;
  const ago = (t) => {
    const s = Math.max(1, Math.round((Date.now() - t) / 1000));
    if (s < 60) return `${s} s ago`; if (s < 3600) return `${Math.round(s / 60)} min ago`;
    if (s < 86400) return `${Math.round(s / 3600)} h ago`; return `${Math.round(s / 86400)} d ago`;
  };

  async function renderDashboard() {
    view.innerHTML = `<div class="empty">Loading…</div>`;
    let s;
    try { s = await api(`/stats?days=${days}`); } catch (e) { view.innerHTML = offlineBanner(); checkServer(); return; }
    checkServer();
    const c = s.current, p = s.previous;
    const totalDev = s.devices.mobile + s.devices.desktop || 1;
    const mPct = Math.round((s.devices.mobile / totalDev) * 100);
    view.innerHTML = `
      <div class="bar">
        <p>Last ${days} days, compared with the previous ${days} days.</p>
        <div class="seg">${[7, 30, 90].map((d) => `<button data-d="${d}" class="${d === days ? 'on' : ''}">${d} days</button>`).join('')}</div>
      </div>
      ${s.totalEventsEver === 0 ? `<div class="banner"><b>No data yet.</b> Open the website at <a href="/index.html" target="_blank">localhost:4321</a>, click a WhatsApp button, then reload this dashboard. Make sure <span class="code">npm.cmd run admin</span> is running.</div>` : ''}
      <section class="kpis">
        <div class="card kpi wa"><div class="k">WhatsApp button clicks</div><div class="v">${nf.format(c.waClicks)}</div><div>${delta(c.waClicks, p.waClicks)}<span class="foot">from ${nf.format(c.waVisitors)} people</span></div></div>
        <div class="card kpi"><div class="k">Unique visitors</div><div class="v">${nf.format(c.visitors)}</div><div>${delta(c.visitors, p.visitors)}<span class="foot">vs previous period</span></div></div>
        <div class="card kpi"><div class="k">Page views</div><div class="v">${nf.format(c.pageviews)}</div><div>${delta(c.pageviews, p.pageviews)}<span class="foot">${c.visitors ? (c.pageviews / c.visitors).toFixed(1) : '0'} per visitor</span></div></div>
        <div class="card kpi"><div class="k">WhatsApp conversion</div><div class="v">${pct(c.conversion)}</div><div>${delta(c.conversion, p.conversion)}<span class="foot">visitors who chatted</span></div></div>
      </section>
      <section class="grid2">
        <div class="card"><div class="card-h"><h2>Daily trend</h2><div class="legend"><span><i style="background:#0f69ab"></i>Visitors</span><span><i style="background:#25d366"></i>WhatsApp clicks</span></div></div><div class="card-b">${lineChart(s.series)}</div></div>
        <div class="card"><div class="card-h"><h2>Devices</h2></div><div class="card-b">
          <div class="split" title="Mobile ${mPct}%"><b style="width:${mPct}%"></b><i style="width:${100 - mPct}%;background:#c8def0"></i></div>
          <div style="display:flex;justify-content:space-between"><span><span class="pill b">Mobile</span> ${nf.format(s.devices.mobile)}</span><span><span class="pill">Desktop</span> ${nf.format(s.devices.desktop)}</span></div>
          <h2 style="font-size:15px;margin:22px 0 4px">Activity per hour</h2>
          <div class="legend" style="margin:0 0 4px"><span><i style="background:#c8def0"></i>Views</span><span><i style="background:#25d366"></i>WA clicks</span></div>
          ${hourChart(s.hours)}
        </div></div>
      </section>
      <section class="grid3">
        <div class="card"><div class="card-h"><h2>Most clicked products</h2><span class="sub">the "Tanya stok" button</span></div><div class="card-b">${rankList(s.topProducts, { valueKey: 'clicks', nameKey: 'name', green: true })}</div></div>
        <div class="card"><div class="card-h"><h2>Top pages</h2></div><div class="card-b">${rankList(s.topPages.map((x) => ({ ...x, nm: pageName(x.path) })), { valueKey: 'views', nameKey: 'nm', subFn: (x) => `${x.waClicks} WA clicks` })}</div></div>
        <div class="card"><div class="card-h"><h2>Traffic sources</h2></div><div class="card-b">${rankList(s.referrers, { valueKey: 'visits', nameKey: 'name' })}</div></div>
        <div class="card"><div class="card-h"><h2>WhatsApp buttons clicked</h2></div><div class="card-b">${rankList(s.topButtons, { valueKey: 'clicks', nameKey: 'name', green: true })}</div></div>
      </section>
      <section class="card"><div class="card-h"><h2>Recent WhatsApp clicks</h2><span class="sub">also: ${c.callClicks} call clicks · ${c.mapsClicks} map clicks</span></div>
        <div class="tbl-wrap">${s.recentWa.length ? `<table><thead><tr><th>Time</th><th>Page</th><th>Button / product</th><th>Device</th></tr></thead><tbody>${s.recentWa.map((r) => `<tr><td>${ago(r.t)}</td><td>${esc(pageName(r.path))}</td><td>${esc(r.product || r.label)}</td><td><span class="pill ${r.dev === 'mobile' ? 'b' : ''}">${r.dev === 'mobile' ? 'Mobile' : 'Desktop'}</span></td></tr>`).join('')}</tbody></table>` : `<div class="empty">No WhatsApp clicks yet</div>`}</div>
      </section>`;
    view.querySelectorAll('.seg button').forEach((b) => (b.onclick = () => { days = +b.dataset.d; renderDashboard(); }));
    wireChart(s.series);
  }

  // =====================================================================
  // PRODUCTS
  // =====================================================================
  let products = [], tab = 'all', q = '', sort = 'order', issueFilter = '';
  const selected = new Set();

  async function reloadAll() { products = await api('/products'); tax = await api('/taxonomy'); $('#navCount').textContent = products.length; }

  async function renderProducts() {
    view.innerHTML = `<div class="empty">Loading…</div>`;
    try { await reloadAll(); } catch { view.innerHTML = offlineBanner(); checkServer(); return; }
    checkServer();
    selected.clear();
    drawList(true);
  }

  // Data completeness: what a visitor would find missing on the product card
  const issuesOf = (p) => {
    const i = [];
    if (!p.photo) i.push({ k: 'photo', l: 'No photo' });
    if (!String(p.description || '').trim()) i.push({ k: 'desc', l: 'No description' });
    if (!groupsOf(p).length) i.push({ k: 'group', l: 'No sub-category' });
    if (!(p.stock > 0)) i.push({ k: 'stock', l: 'Out of stock' });
    return i;
  };
  const incomplete = (p) => issuesOf(p).some((x) => x.k !== 'stock');

  function filtered() {
    let list = products.filter((p) => (tab === 'all' || p.category === tab));
    if (issueFilter === 'any') list = list.filter(incomplete);
    else if (issueFilter) list = list.filter((p) => issuesOf(p).some((x) => x.k === issueFilter));
    if (q) { const k = q.toLowerCase(); list = list.filter((p) => `${p.title} ${groupsOf(p).join(' ')} ${p.description}`.toLowerCase().includes(k)); }
    const cmp = {
      order: (a, b) => (a.order ?? 1000) - (b.order ?? 1000) || a.title.localeCompare(b.title),
      name: (a, b) => a.title.localeCompare(b.title),
      hidden: (a, b) => (a.published === b.published ? 0 : a.published ? 1 : -1) || a.title.localeCompare(b.title),
      stock: (a, b) => (a.stock ?? 0) - (b.stock ?? 0) || a.title.localeCompare(b.title),
    }[sort];
    return list.sort(cmp);
  }

  async function bulk(action, value, okMsg) {
    const ids = [...selected];
    try {
      const r = await api('/products/bulk', { method: 'POST', body: JSON.stringify({ ids, action, value }) });
      await reloadAll();
      selected.clear(); setPending(true); drawList(true);
      toast(okMsg || `${r.changed} products updated`);
    } catch (err) { toast(err.message, true); }
  }

  function drawBulk() {
    const el = $('#bulk');
    if (!selected.size) { el.hidden = true; el.innerHTML = ''; return; }
    const groups = [...new Set([...products.flatMap(groupsOf), ...tax.groups])].sort();
    const selGroups = [...new Set(products.filter((p) => selected.has(p.id)).flatMap(groupsOf))].sort();
    el.hidden = false;
    el.innerHTML = `<b>${selected.size} selected</b>
      <button class="btn btn-ghost btn-sm" data-a="publish">Show</button>
      <button class="btn btn-ghost btn-sm" data-a="hide">Hide</button>
      <select id="bk_cat"><option value="">Move to category…</option>${allCats().map((c) => `<option value="${esc(c.v)}">${esc(c.l)}</option>`).join('')}</select>
      <span class="inl"><input type="number" id="bk_stock" min="0" placeholder="Stock"><button class="btn btn-ghost btn-sm" data-a="stock">Set</button></span>
      <span class="inl"><input type="text" id="bk_group" placeholder="Add sub-category"><button class="btn btn-ghost btn-sm" data-a="addGroup">+</button></span>
      <select id="bk_rm"><option value="">Remove sub-category…</option>${selGroups.length ? `<option value="__all__">All sub-categories</option>` : ''}${selGroups.map((g) => `<option value="${esc(g)}">${esc(g)}</option>`).join('')}</select>
      <button class="btn btn-danger btn-sm" data-a="delete">Delete</button>
      <button class="btn btn-ghost btn-sm" data-a="clear">Cancel</button>`;
    suggest($('#bk_group'), $('#bk_group').parentElement, () => groups);
    $('#bk_rm').onchange = (e) => {
      const v = e.target.value; if (!v) return;
      if (v === '__all__') bulk('clearGroup', null, 'Sub-categories cleared');
      else bulk('removeGroup', v, `Sub-category "${v}" removed`);
    };
    let armed = false;
    el.onclick = (e) => {
      const b = e.target.closest('button[data-a]'); if (!b) return;
      const a = b.dataset.a;
      if (a === 'publish') bulk('publish', null, 'Product shown');
      else if (a === 'hide') bulk('hide', null, 'Product hidden');
      else if (a === 'clear') { selected.clear(); drawList(false); }
      else if (a === 'stock') { const v = $('#bk_stock').value; if (v === '') return toast('Enter a stock number', true); bulk('stock', Number(v), 'Stock updated'); }
      else if (a === 'addGroup') { const v = $('#bk_group').value.trim(); if (!v) return toast('Enter a sub-category name', true); saveTax('group', v); bulk('addGroup', v, 'Sub-category added'); }
      else if (a === 'delete') {
        if (!armed) { armed = true; b.textContent = 'Click again to delete'; setTimeout(() => { armed = false; b.textContent = 'Delete'; }, 3500); return; }
        bulk('delete', null, 'Product deleted');
      }
    };
    $('#bk_cat').onchange = (e) => { if (e.target.value) bulk('category', e.target.value, 'Category moved'); };
  }

  function drawList(full) {
    if (full) {
      const count = (v) => products.filter((p) => v === 'all' || p.category === v).length;
      const nIncomplete = products.filter(incomplete).length;
      view.innerHTML = `
        ${nIncomplete ? `<div class="banner warn"><b>${nIncomplete} products are incomplete</b> (missing photo, description, or sub-category). <a href="#" id="showInc">Show</a></div>` : ''}
        <div class="card">
          <div class="tabs" id="tabs">${[{ v: 'all', l: 'All' }, ...allCats()].map((c) => `<button data-t="${esc(c.v)}" class="${c.v === tab ? 'on' : ''}">${esc(c.l)}<span>${count(c.v)}</span></button>`).join('')}</div>
          <div class="tools">
            <label class="search"><svg viewBox="0 0 24 24"><path d="M10 2a8 8 0 105.3 14l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/></svg><input id="q" type="search" placeholder="Search name, type, or description" value="${esc(q)}"></label>
            <select id="sort"><option value="order">Display order</option><option value="name">Name A–Z</option><option value="stock">Lowest stock</option><option value="hidden">Hidden first</option></select>
            <select id="issue"><option value="">All completeness</option><option value="any">Needs completing</option><option value="photo">No photo</option><option value="desc">No description</option><option value="group">No sub-category</option><option value="stock">Out of stock</option></select>
            <button class="btn btn-ghost" id="impBtn">Import / Export</button>
            <button class="btn" id="addBtn">+ Add product</button>
          </div>
          <div class="bulkbar" id="bulk" hidden></div>
          <div class="tbl-wrap" id="tbl"></div>
          <div class="pager" id="pager"></div>
        </div>`;
      $('#sort').value = sort; $('#issue').value = issueFilter;
      $('#tabs').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; tab = b.dataset.t; selected.clear(); drawList(true); };
      $('#q').oninput = (e) => { q = e.target.value; drawList(false); };
      $('#sort').onchange = (e) => { sort = e.target.value; drawList(false); };
      $('#issue').onchange = (e) => { issueFilter = e.target.value; drawList(false); };
      $('#addBtn').onclick = () => openDrawer(null);
      $('#impBtn').onclick = openImport;
      const inc = $('#showInc'); if (inc) inc.onclick = (e) => { e.preventDefault(); issueFilter = 'any'; $('#issue').value = 'any'; drawList(false); };
    }
    const list = filtered();
    $('#pager').textContent = `Showing ${list.length} of ${products.length} products`;
    const allOn = list.length && list.every((p) => selected.has(p.id));
    $('#tbl').innerHTML = list.length ? `<table><thead><tr><th style="width:34px"><input type="checkbox" id="selAll" ${allOn ? 'checked' : ''} aria-label="Select all"></th><th>Product</th><th>Category / type</th><th>Stock</th><th>Visible</th><th></th></tr></thead><tbody>${list.map((p) => {
      const iss = issuesOf(p).filter((x) => x.k !== 'stock');
      return `
      <tr data-id="${esc(p.id)}" class="${selected.has(p.id) ? 'sel' : ''}">
        <td><input type="checkbox" class="pick" ${selected.has(p.id) ? 'checked' : ''} aria-label="Select"></td>
        <td><div class="prod"><div class="thumb" style="${p.photo ? `background-image:url('${esc(p.photo)}')` : ''}">${p.photo ? '' : 'No photo'}</div><div><b>${esc(p.title)}</b><small>${esc(p.description)}</small>${iss.length ? `<div class="issues">${iss.map((x) => `<span class="pill o">${x.l}</span>`).join('')}</div>` : ''}</div></div></td>
        <td><span class="pill b">${esc(catLabel(p.category))}</span><div style="color:var(--muted);font-size:12px;margin-top:4px">${esc(groupsOf(p).join(', ') || '—')}</div></td>
        <td>${p.stock > 0 ? p.stock : '<span class="pill o">Out</span>'}</td>
        <td><label class="sw"><input type="checkbox" class="tg" ${p.published !== false ? 'checked' : ''}><span></span></label></td>
        <td><div class="row-act"><button class="btn btn-ghost btn-sm dup" title="Make a copy of this product">Duplicate</button><button class="btn btn-ghost btn-sm ed">Edit</button></div></td>
      </tr>`; }).join('')}</tbody></table>` : `<div class="empty">No matching products.</div>`;
    drawBulk();
    const sa = $('#selAll');
    if (sa) sa.onchange = () => { list.forEach((p) => (sa.checked ? selected.add(p.id) : selected.delete(p.id))); drawList(false); };
    $('#tbl').querySelectorAll('tr[data-id]').forEach((tr) => {
      const id = tr.dataset.id;
      tr.querySelector('.pick').onchange = (e) => { e.target.checked ? selected.add(id) : selected.delete(id); tr.classList.toggle('sel', e.target.checked); drawBulk(); const s2 = $('#selAll'); if (s2) s2.checked = list.every((p) => selected.has(p.id)); };
      tr.querySelector('.ed').onclick = () => openDrawer(products.find((p) => p.id === id));
      tr.querySelector('.dup').onclick = () => {
        const src = products.find((p) => p.id === id);
        openDrawer(null, { ...src, title: `${src.title} (copy)`, published: false });
      };
      tr.querySelector('.tg').onchange = async (e) => {
        const on = e.target.checked;
        try {
          const saved = await api(`/products/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ published: on }) });
          Object.assign(products.find((p) => p.id === id), saved);
          setPending(true); toast(on ? 'Product shown' : 'Product hidden');
        } catch (err) { e.target.checked = !on; toast(err.message, true); }
      };
    });
  }

  // =====================================================================
  // CATEGORIES (rename / delete categories and sub-categories)
  // =====================================================================
  async function renderTaxonomy() {
    view.innerHTML = `<div class="empty">Loading…</div>`;
    try { await reloadAll(); } catch { view.innerHTML = offlineBanner(); checkServer(); return; }
    checkServer();
    const BUILTIN = CATS.map((c) => c.v);
    const cats = allCats().map((c) => ({ ...c, n: products.filter((p) => p.category === c.v).length, builtin: BUILTIN.includes(c.v) }));
    const names = [...new Set([...products.flatMap(groupsOf), ...tax.groups])].sort((a, b) => a.localeCompare(b));
    const grps = names.map((g) => ({ g, n: products.filter((p) => groupsOf(p).some((x) => x.toLowerCase() === g.toLowerCase())).length }));
    view.innerHTML = `
      <section class="grid2">
        <div class="card"><div class="card-h"><h2>Categories</h2><span class="sub">${cats.length} categories</span></div>
          <div class="tbl-wrap"><table><thead><tr><th>Name</th><th>Products</th><th></th></tr></thead><tbody>${cats.map((c) => `
            <tr data-type="category" data-key="${esc(c.v)}" data-n="${c.n}"><td><b>${esc(c.l)}</b>${c.builtin ? ' <span class="pill">built-in</span>' : ''}<div style="color:var(--muted);font-size:12px">${esc(c.v)}</div></td><td>${c.n}</td>
            <td><div class="row-act"><button class="btn btn-ghost btn-sm rn">Rename</button>${c.builtin ? '' : '<button class="btn btn-danger btn-sm rm">Delete</button>'}</div></td></tr>`).join('')}</tbody></table></div>
          <div class="card-b" style="color:var(--muted);font-size:12.5px">Built-in categories have a page on the website, so they can only be renamed. A category can only be deleted when it has no products.</div>
        </div>
        <div class="card"><div class="card-h"><h2>Sub-categories</h2><span class="sub">${grps.length} sub-categories</span></div>
          ${grps.length ? `<div class="tbl-wrap"><table><thead><tr><th>Name</th><th>Products</th><th></th></tr></thead><tbody>${grps.map((x) => `
            <tr data-type="group" data-key="${esc(x.g)}" data-n="${x.n}"><td><b>${esc(x.g)}</b></td><td>${x.n}</td>
            <td><div class="row-act"><button class="btn btn-ghost btn-sm rn">Rename</button><button class="btn btn-danger btn-sm rm">Delete</button></div></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty">No sub-categories yet</div>'}
          <div class="card-b" style="color:var(--muted);font-size:12.5px">Renaming applies to all products. If the name matches another sub-category, the two are merged. Deleting only removes the sub-category from products; the products stay.</div>
        </div>
      </section>`;
    view.querySelectorAll('tr[data-type]').forEach((tr) => {
      const { type, key, n } = tr.dataset;
      const label = type === 'category' ? catLabel(key) : key;
      tr.querySelector('.rn').onclick = async () => {
        const to = prompt(`New name for "${label}":`, label);
        if (to === null || !to.trim() || to.trim() === label) return;
        try { tax = await api('/taxonomy', { method: 'PUT', body: JSON.stringify({ type, from: key, to: to.trim() }) }); setPending(true); toast('Renamed'); renderTaxonomy(); }
        catch (err) { toast(err.message, true); }
      };
      const rm = tr.querySelector('.rm');
      if (rm) rm.onclick = async () => {
        const msg = type === 'group' && +n ? `Remove "${label}" from ${n} products and delete it?` : `Delete "${label}"?`;
        if (!confirm(msg)) return;
        try { tax = await api('/taxonomy', { method: 'DELETE', body: JSON.stringify({ type, name: key }) }); setPending(true); toast('Deleted'); renderTaxonomy(); }
        catch (err) { toast(err.message, true); }
      };
    });
  }

  // =====================================================================
  // IMPORT / EXPORT (Excel or CSV)
  // =====================================================================
  const IMPORT_HEADERS = ['name', 'category', 'sub-category', 'description', 'stock', 'photo', 'alt', 'wa_message', 'published'];
  const SAMPLE_ROWS = [
    ['Daikin STC15YV', 'AC', 'Available AC Units', 'AC split ½ PK · 350 W · R32', 5, 'daikin.jpg', 'Daikin STC15YV', '', 'yes'],
    ['Sharp SJ-N162', 'Fridge', 'Fridge 1 Door; Fridge 2 Doors', '1-door fridge, 162 L', 3, '', '', '', 'yes'],
  ];
  const PHOTO_HEADERS = ['photo', 'image', 'picture', 'foto', 'gambar'];

  // Minimal CSV parser: quotes, BOM, and comma / semicolon / tab delimiters (Indonesian Excel saves CSV with ";")
  function parseCsv(text) {
    text = text.replace(/^﻿/, '');
    if (/^sep=./i.test(text)) text = text.replace(/^[^\r\n]*\r?\n/, '');
    const first = text.split(/\r?\n/, 1)[0];
    const delim = [',', ';', '\t'].map((d) => [d, first.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
    const rows = []; let row = [], cell = '', inQ = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (inQ) {
        if (ch === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else inQ = false; } else cell += ch;
      } else if (ch === '"') inQ = true;
      else if (ch === delim) { row.push(cell); cell = ''; }
      else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += ch;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }
  const gridToObjects = (grid) => {
    const [head, ...body] = grid.filter((r) => r.some((c) => String(c).trim() !== ''));
    if (!head) return [];
    return body.map((r) => Object.fromEntries(head.map((h, i) => [String(h).trim(), r[i] ?? ''])));
  };
  const csvCell = (v) => { v = String(v ?? ''); return /[",;\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v; };
  const gridToCsv = (grid) => '﻿sep=,\r\n' + grid.map((r) => r.map(csvCell).join(',')).join('\r\n');
  function saveBlob(name, parts, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(parts, { type }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  let xlsxP;
  const loadXlsx = () => window.XLSX ? Promise.resolve(window.XLSX) : (xlsxP ||= new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
    s.onload = () => res(window.XLSX);
    s.onerror = () => { xlsxP = null; rej(new Error('Could not load the Excel library (internet needed). Use the CSV version instead.')); };
    document.head.appendChild(s);
  }));
  async function saveGrid(grid, base, kind) {
    if (kind === 'csv') return saveBlob(`${base}.csv`, [gridToCsv(grid)], 'text/csv;charset=utf-8');
    const X = await loadXlsx();
    const ws = X.utils.aoa_to_sheet(grid);
    ws['!cols'] = grid[0].map((h, i) => ({ wch: Math.min(60, Math.max(String(h).length + 2, ...grid.slice(1, 40).map((r) => String(r[i] ?? '').length + 2))) }));
    const wb = X.utils.book_new(); X.utils.book_append_sheet(wb, ws, 'Products');
    X.writeFile(wb, `${base}.xlsx`);
  }
  async function readSheetFile(file) {
    if (/\.(csv|txt)$/i.test(file.name)) return gridToObjects(parseCsv(await file.text()));
    const X = await loadXlsx();
    const wb = X.read(await file.arrayBuffer(), { type: 'array' });
    return X.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', raw: false });
  }
  const exportGrid = () => [IMPORT_HEADERS, ...products.map((p) => [
    p.title, catLabel(p.category), groupsOf(p).join('; '), p.description || '', p.stock ?? 0,
    (p.photo || '').replace('/assets/uploads/', ''), p.alt || '', p.wa_message || '', p.published === false ? 'no' : 'yes',
  ])];

  function openImport() {
    ensureDrawer();
    let rows = [];
    const photoMap = {};
    drawer.innerHTML = `
      <div class="drawer-h"><h2>Import products</h2><button id="dx" aria-label="Close">×</button></div>
      <div class="drawer-b imp">
        <div class="fld"><label>1. Get the template</label>
          <div class="imp-row"><button type="button" class="btn btn-ghost btn-sm" id="tplX">Excel template (.xlsx)</button><button type="button" class="btn btn-ghost btn-sm" id="tplC">CSV template</button><button type="button" class="btn btn-ghost btn-sm" id="expX">Export current products (.xlsx)</button><button type="button" class="btn btn-ghost btn-sm" id="expC">Export (.csv)</button></div>
          <small>Columns: <b>name*</b>, <b>category*</b>, sub-category (separate several with <b>;</b>), description, stock, photo (file name), alt, wa_message, published (yes/no). New categories and sub-categories are created automatically. Tip: export, edit in Excel, then import with "Update it".</small></div>
        <div class="fld"><label for="imp_photos">2. Photos (optional)</label><input type="file" id="imp_photos" accept="image/jpeg,image/png,image/webp" multiple><small id="imp_pstat">Select the image files named in the photo column. They are uploaded right away.</small></div>
        <div class="fld"><label for="imp_file">3. Spreadsheet file</label><input type="file" id="imp_file" accept=".xlsx,.xls,.csv,.txt"></div>
        <div class="fld"><label>If a product already exists (same name and category)</label>
          <label class="rad"><input type="radio" name="imp_mode" value="skip" checked> Skip it</label>
          <label class="rad"><input type="radio" name="imp_mode" value="update"> Update it (empty cells keep the current value)</label></div>
        <div id="imp_prev"></div>
      </div>
      <div class="drawer-f"><span></span><button type="button" class="btn btn-ghost" id="imp_cancel">Cancel</button><button type="button" class="btn" id="imp_go" disabled>Import</button></div>`;
    requestAnimationFrame(() => { drawer.classList.add('on'); scrim.classList.add('on'); });
    const g = (id) => $(id, drawer);
    const mode = () => drawer.querySelector('input[name=imp_mode]:checked').value;
    g('#dx').onclick = g('#imp_cancel').onclick = closeDrawer;
    const guard = (fn) => async () => { try { await fn(); } catch (err) { toast(err.message, true); } };
    g('#tplX').onclick = guard(() => saveGrid([IMPORT_HEADERS, ...SAMPLE_ROWS], 'product-import-template', 'xlsx'));
    g('#tplC').onclick = guard(() => saveGrid([IMPORT_HEADERS, ...SAMPLE_ROWS], 'product-import-template', 'csv'));
    g('#expX').onclick = guard(() => saveGrid(exportGrid(), 'products', 'xlsx'));
    g('#expC').onclick = guard(() => saveGrid(exportGrid(), 'products', 'csv'));

    const payload = () => rows.map((r) => {
      const o = { ...r };
      for (const k of Object.keys(o)) if (PHOTO_HEADERS.includes(k.trim().toLowerCase())) o[k] = photoMap[String(o[k]).trim().toLowerCase()] || o[k];
      return o;
    });
    async function preview() {
      const box = g('#imp_prev'), go = g('#imp_go');
      go.disabled = true;
      if (!rows.length) { box.innerHTML = ''; return; }
      box.innerHTML = '<div class="empty">Checking…</div>';
      try {
        const r = await api('/products/import', { method: 'POST', body: JSON.stringify({ rows: payload(), mode: mode(), dryRun: true }) });
        const c = r.counts, pill = { created: 'g', updated: 'b', skipped: '', error: 'o' };
        box.innerHTML = `<p class="imp-sum"><b>${c.created}</b> new · <b>${c.updated}</b> updated · <b>${c.skipped}</b> skipped · <b>${c.error}</b> with errors</p>
          <div class="tbl-wrap imp-tbl"><table><thead><tr><th>Row</th><th>Name</th><th>Result</th><th>Note</th></tr></thead><tbody>${r.results.slice(0, 300).map((x) => `<tr><td>${x.row}</td><td>${esc(x.title)}</td><td><span class="pill ${pill[x.status]}">${x.status}</span></td><td>${esc(x.message)}</td></tr>`).join('')}</tbody></table></div>
          ${r.results.length > 300 ? `<small>Showing the first 300 of ${r.results.length} rows.</small>` : ''}`;
        go.disabled = c.created + c.updated === 0;
        go.textContent = `Import ${c.created + c.updated} product${c.created + c.updated === 1 ? '' : 's'}`;
      } catch (err) { box.innerHTML = ''; toast(err.message, true); }
    }
    drawer.querySelectorAll('input[name=imp_mode]').forEach((el) => (el.onchange = preview));
    g('#imp_file').onchange = guard(async () => {
      const f = g('#imp_file').files[0]; if (!f) return;
      g('#imp_prev').innerHTML = '<div class="empty">Reading file…</div>';
      rows = await readSheetFile(f);
      if (!rows.length) { g('#imp_prev').innerHTML = '<div class="empty">No rows found in this file.</div>'; return; }
      await preview();
    });
    g('#imp_photos').onchange = guard(async () => {
      const files = [...g('#imp_photos').files]; if (!files.length) return;
      const stat = g('#imp_pstat'); let ok = 0;
      for (const f of files) {
        stat.textContent = `Uploading ${ok + 1} of ${files.length}…`;
        try { const r = await api(`/upload?name=${encodeURIComponent(f.name)}`, { method: 'POST', body: f }); photoMap[f.name.trim().toLowerCase()] = r.path; ok++; }
        catch (err) { toast(`${f.name}: ${err.message}`, true); }
      }
      stat.textContent = `${ok} of ${files.length} photos uploaded.`;
      await preview();
    });
    g('#imp_go').onclick = async () => {
      const go = g('#imp_go'); go.disabled = true; go.textContent = 'Importing…';
      try {
        const r = await api('/products/import', { method: 'POST', body: JSON.stringify({ rows: payload(), mode: mode(), dryRun: false }) });
        await reloadAll(); selected.clear(); setPending(true); closeDrawer(); drawList(true);
        toast(`Imported: ${r.counts.created} new, ${r.counts.updated} updated, ${r.counts.skipped} skipped, ${r.counts.error} errors.`);
      } catch (err) { toast(err.message, true); go.disabled = false; go.textContent = 'Import'; }
    };
  }

  // ---------- drawer ----------
  let drawer, scrim;
  function ensureDrawer() {
    if (drawer) return;
    scrim = document.createElement('div'); scrim.className = 'scrim'; scrim.onclick = closeDrawer;
    drawer = document.createElement('aside'); drawer.className = 'drawer';
    document.body.append(scrim, drawer);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });
  }
  function closeDrawer() { drawer?.classList.remove('on'); scrim?.classList.remove('on'); }

  function openDrawer(p, tpl) {
    ensureDrawer();
    const isNew = !p;
    const d = p ? { ...p } : tpl ? { ...tpl } : { category: tab !== 'all' ? tab : 'ac', group: '', title: '', photo: '', alt: '', description: '', wa_message: '', order: 1000, stock: 0, published: true };
    const groups = [...new Set([...products.flatMap(groupsOf), ...tax.groups])].sort();
    drawer.innerHTML = `
      <div class="drawer-h"><h2>${isNew ? (tpl ? 'Duplicate product' : 'Add product') : 'Edit product'}</h2><button id="dx" aria-label="Close">×</button></div>
      <form class="drawer-b" id="pf" autocomplete="off">
        <div class="fld photo">
          <div class="thumb" id="pth"></div>
          <div>
            <div class="drop" id="drop">Click or drag a photo here<br><small>JPG, PNG, WebP · max 8 MB</small></div>
            <input type="file" id="file" accept="image/jpeg,image/png,image/webp" hidden>
            <button type="button" class="btn btn-ghost btn-sm" id="rmPhoto" style="margin-top:8px" ${d.photo ? '' : 'hidden'}>Remove photo</button>
          </div>
        </div>
        <div class="fld"><label for="f_title">Name / model *</label><input type="text" id="f_title" required value="${esc(d.title)}"></div>
        <div class="two">
          <div class="fld"><label for="f_cat">Category</label>${catFieldHtml(d.category)}</div>
          <div class="fld"><label for="f_stock">Stock</label><input type="number" id="f_stock" min="0" value="${d.stock ?? 0}"><small>Units available.</small></div>
        </div>
        <div class="fld"><label for="f_group">Type / sub-categories</label>${groupFieldHtml()}<small>Section headings on the category page. You can add several; the product appears in each section.</small></div>
        <div class="fld"><label for="f_desc">Short description</label><textarea id="f_desc">${esc(d.description)}</textarea><small>Example: AC split ½ PK · 350 W · R32</small></div>
        <div class="fld"><label for="f_wa">Pre-filled WhatsApp message</label><textarea id="f_wa">${esc(d.wa_message)}</textarea><small>Empty = default message containing the product name.</small></div>
        <div class="fld"><label for="f_alt">Photo alt text</label><input type="text" id="f_alt" value="${esc(d.alt)}"></div>
        <div class="fld" style="display:flex;align-items:center;gap:12px"><label class="sw"><input type="checkbox" id="f_pub" ${d.published !== false ? 'checked' : ''}><span></span></label><b>Show on website</b></div>
        <div class="preview"><h4>Card preview</h4><div class="pc"><div class="thumb" id="pv_th"></div><div><b id="pv_t"></b><div style="color:var(--muted);font-size:12.5px" id="pv_d"></div><span class="wa">Tanya stok</span></div></div></div>
      </form>
      <div class="drawer-f">
        ${isNew ? '<span></span>' : '<button type="button" class="btn btn-danger" id="del">Delete</button>'}
        <button type="button" class="btn btn-ghost" id="cancel">Cancel</button>
        <button type="submit" class="btn" id="save" form="pf">Save</button>
      </div>`;
    requestAnimationFrame(() => { drawer.classList.add('on'); scrim.classList.add('on'); });

    const g = (id) => $(id, drawer);
    const getCat = wireCat(drawer), getGroup = wireGroups(drawer, groupsOf(d), groups);
    let photo = d.photo || '';
    const paint = () => {
      const bg = photo ? `url('${photo.replace(/'/g, '%27')}')` : 'none';
      for (const id of ['#pth', '#pv_th']) { const el = g(id); el.style.backgroundImage = bg; el.textContent = photo ? '' : 'No photo'; }
      g('#pv_t').textContent = g('#f_title').value || 'Product name';
      g('#pv_d').textContent = g('#f_desc').value || 'Short description';
      g('#rmPhoto').hidden = !photo;
    };
    paint();
    ['#f_title', '#f_desc'].forEach((id) => g(id).addEventListener('input', paint));
    g('#dx').onclick = g('#cancel').onclick = closeDrawer;
    g('#rmPhoto').onclick = () => { photo = ''; paint(); };

    const drop = g('#drop'), file = g('#file');
    drop.onclick = () => file.click();
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', (e) => upload(e.dataTransfer.files[0]));
    file.onchange = () => upload(file.files[0]);
    async function upload(f) {
      if (!f) return;
      drop.textContent = 'Uploading…';
      try {
        const r = await api(`/upload?name=${encodeURIComponent(f.name)}`, { method: 'POST', body: f });
        photo = r.path; if (!g('#f_alt').value) g('#f_alt').value = g('#f_title').value;
        paint(); drop.innerHTML = 'Photo uploaded. Click to replace.';
      } catch (err) { drop.innerHTML = 'Click or drag a photo here'; toast(err.message, true); }
    }

    g('#pf').onsubmit = async (e) => {
      e.preventDefault();
      const body = {
        category: getCat(), group: getGroup(), title: g('#f_title').value, photo,
        alt: g('#f_alt').value, description: g('#f_desc').value, wa_message: g('#f_wa').value,
        stock: g('#f_stock').value, published: g('#f_pub').checked,
      };
      if (!body.category) return toast('Category is required', true);
      const btn = g('#save'); btn.disabled = true;
      try {
        const saved = isNew
          ? await api('/products', { method: 'POST', body: JSON.stringify(body) })
          : await api(`/products/${encodeURIComponent(p.id)}`, { method: 'PUT', body: JSON.stringify(body) });
        if (isNew) products.push(saved); else Object.assign(p, saved);
        $('#navCount').textContent = products.length;
        setPending(true); closeDrawer(); drawList(true);
        toast("Saved. Click 'Publish to website' to show it in the shop.");
      } catch (err) { toast(err.message, true); }
      btn.disabled = false;
    };
    if (!isNew) {
      let armed = false;
      g('#del').onclick = async (e) => {
        if (!armed) { armed = true; e.target.textContent = 'Click again to delete'; setTimeout(() => { armed = false; e.target.textContent = 'Delete'; }, 3500); return; }
        try {
          await api(`/products/${encodeURIComponent(p.id)}`, { method: 'DELETE' });
          products = products.filter((x) => x.id !== p.id);
          $('#navCount').textContent = products.length;
          setPending(true); closeDrawer(); drawList(true); toast('Product deleted');
        } catch (err) { toast(err.message, true); }
      };
    }
  }

  checkServer().then((ok) => { if (ok) api('/products').then((r) => ($('#navCount').textContent = r.length)).catch(() => {}); });
  route();
})();
