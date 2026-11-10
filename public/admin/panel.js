// Seller Center admin for 23 Electronic. Vanilla JS, talks to scripts/admin-server.mjs (port 8082).
(() => {
  const API = `http://${location.hostname}:8082/api`;
  const $ = (s, el = document) => el.querySelector(s);
  const view = $('#view');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nf = new Intl.NumberFormat('id-ID');

  const CATS = [
    { v: 'ac', l: 'AC' }, { v: 'kulkas', l: 'Kulkas' },
    { v: 'mesin-cuci', l: 'Mesin Cuci' }, { v: 'tv', l: 'TV & Elektronik' },
  ];
  const catLabel = (v) => CATS.find((c) => c.v === v)?.l || v;

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
      el.className = 'srv ok'; el.lastElementChild.textContent = 'Server aktif';
      return true;
    } catch {
      el.className = 'srv bad'; el.lastElementChild.textContent = 'Server mati';
      return false;
    }
  }
  const offlineBanner = () => `<div class="banner"><b>Server admin belum jalan.</b> Buka terminal baru di folder proyek lalu jalankan <span class="code">npm.cmd run admin</span>, kemudian muat ulang halaman ini.</div>`;

  // ---------- router ----------
  const routes = { dashboard: renderDashboard, produk: renderProducts };
  const titles = { dashboard: 'Dashboard', produk: 'Produk' };
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
  const setPending = (v) => { pending = v; $('#rebuildBtn').textContent = v ? 'Terapkan ke website •' : 'Terapkan ke website'; };
  $('#rebuildBtn').onclick = async (e) => {
    const b = e.currentTarget; b.disabled = true; b.textContent = 'Memproses…';
    try {
      const r = await api('/rebuild', { method: 'POST' });
      if (r.ok) { setPending(false); toast('Website diperbarui. Muat ulang halaman toko untuk melihat hasilnya.'); }
      else toast('Gagal: ' + (r.output || 'tidak diketahui').slice(0, 200), true);
    } catch (err) { toast(err.message, true); }
    b.disabled = false; setPending(pending);
  };

  // =====================================================================
  // DASHBOARD
  // =====================================================================
  let days = 7;

  function delta(cur, prev, suffix = '') {
    if (!prev && !cur) return `<span class="d flat">–</span>`;
    if (!prev) return `<span class="d up">▲ baru</span>`;
    const p = ((cur - prev) / prev) * 100;
    const cls = p > 0.5 ? 'up' : p < -0.5 ? 'down' : 'flat';
    const arrow = p > 0.5 ? '▲' : p < -0.5 ? '▼' : '■';
    return `<span class="d ${cls}">${arrow} ${Math.abs(p).toFixed(0)}%${suffix}</span>`;
  }
  const pct = (x) => (x * 100).toFixed(1).replace('.', ',') + '%';
  const niceMax = (m) => { if (m <= 5) return 5; const p = 10 ** Math.floor(Math.log10(m)); return Math.ceil(m / p) * p; };
  const shortDate = (k) => { const [, m, d] = k.split('-'); return `${+d}/${+m}`; };
  const dayName = (k) => new Date(k + 'T00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });

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
    return `<div class="chart" id="lc"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik pengunjung dan klik WhatsApp per hari">
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
      tip.innerHTML = `<b>${dayName(s.date)}</b>Pengunjung: ${s.visitors}<br>Klik WhatsApp: ${s.waClicks}<br>Halaman dilihat: ${s.pageviews}`;
    });
    svg.addEventListener('mouseleave', () => { tip.hidden = true; vline.setAttribute('opacity', 0); });
  }

  function hourChart(hours) {
    const W = 520, H = 170, L = 6, B = 22, T = 8, bw = (W - L) / 24;
    const max = Math.max(1, ...hours.map((h) => h.pageviews));
    const bars = hours.map((h, i) => {
      const bh = (h.pageviews / max) * (H - B - T), wh = (h.waClicks / max) * (H - B - T);
      const xx = L + i * bw;
      return `<g><title>${String(i).padStart(2, '0')}:00 — ${h.pageviews} dilihat, ${h.waClicks} klik WA</title>
        <rect x="${xx + 2}" y="${H - B - bh}" width="${bw - 4}" height="${Math.max(bh, h.pageviews ? 2 : 0)}" rx="3" fill="#c8def0"/>
        <rect x="${xx + 2}" y="${H - B - wh}" width="${bw - 4}" height="${Math.max(wh, h.waClicks ? 2 : 0)}" rx="3" fill="#25d366"/>
        ${i % 3 === 0 ? `<text x="${xx + bw / 2}" y="${H - 6}" text-anchor="middle" font-size="10.5" fill="#8a92a0">${String(i).padStart(2, '0')}</text>` : ''}</g>`;
    }).join('');
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto" role="img" aria-label="Aktivitas per jam">${bars}</svg>`;
  }

  function rankList(items, { valueKey, nameKey, subFn, green }) {
    if (!items.length) return `<div class="empty">Belum ada data</div>`;
    const max = Math.max(...items.map((i) => i[valueKey]));
    return `<ol class="rank ${green ? 'g' : ''}">${items.map((it, i) => `<li>
      <span class="n">${i + 1}</span>
      <span class="nm" title="${esc(it[nameKey])}">${esc(it[nameKey])}${subFn ? `<small>${subFn(it)}</small>` : ''}</span>
      <span class="vl">${nf.format(it[valueKey])}</span>
      <span class="meter"><b style="width:${(it[valueKey] / max) * 100}%"></b></span></li>`).join('')}</ol>`;
  }
  const pageName = (p) => p === '/' || p === '/index.html' ? 'Beranda' : p.replace(/^\//, '').replace(/\.html$/, '').replace(/\/index$/, '') || p;
  const ago = (t) => {
    const s = Math.max(1, Math.round((Date.now() - t) / 1000));
    if (s < 60) return `${s} dtk lalu`; if (s < 3600) return `${Math.round(s / 60)} mnt lalu`;
    if (s < 86400) return `${Math.round(s / 3600)} jam lalu`; return `${Math.round(s / 86400)} hari lalu`;
  };

  async function renderDashboard() {
    view.innerHTML = `<div class="empty">Memuat…</div>`;
    let s;
    try { s = await api(`/stats?days=${days}`); } catch (e) { view.innerHTML = offlineBanner(); checkServer(); return; }
    checkServer();
    const c = s.current, p = s.previous;
    const totalDev = s.devices.mobile + s.devices.desktop || 1;
    const mPct = Math.round((s.devices.mobile / totalDev) * 100);
    view.innerHTML = `
      <div class="bar">
        <p>Data ${days} hari terakhir, dibandingkan ${days} hari sebelumnya.</p>
        <div class="seg">${[7, 30, 90].map((d) => `<button data-d="${d}" class="${d === days ? 'on' : ''}">${d} hari</button>`).join('')}</div>
      </div>
      ${s.totalEventsEver === 0 ? `<div class="banner"><b>Belum ada data masuk.</b> Buka website di <a href="/index.html" target="_blank">localhost:4321</a>, klik tombol WhatsApp, lalu muat ulang dashboard ini. Pastikan <span class="code">npm.cmd run admin</span> sedang berjalan.</div>` : ''}
      <section class="kpis">
        <div class="card kpi wa"><div class="k">Klik tombol WhatsApp</div><div class="v">${nf.format(c.waClicks)}</div><div>${delta(c.waClicks, p.waClicks)}<span class="foot">dari ${nf.format(c.waVisitors)} orang</span></div></div>
        <div class="card kpi"><div class="k">Pengunjung unik</div><div class="v">${nf.format(c.visitors)}</div><div>${delta(c.visitors, p.visitors)}<span class="foot">vs periode lalu</span></div></div>
        <div class="card kpi"><div class="k">Halaman dilihat</div><div class="v">${nf.format(c.pageviews)}</div><div>${delta(c.pageviews, p.pageviews)}<span class="foot">${c.visitors ? (c.pageviews / c.visitors).toFixed(1).replace('.', ',') : '0'} per pengunjung</span></div></div>
        <div class="card kpi"><div class="k">Konversi ke WhatsApp</div><div class="v">${pct(c.conversion)}</div><div>${delta(c.conversion, p.conversion)}<span class="foot">pengunjung yang chat</span></div></div>
      </section>
      <section class="grid2">
        <div class="card"><div class="card-h"><h2>Tren harian</h2><div class="legend"><span><i style="background:#0f69ab"></i>Pengunjung</span><span><i style="background:#25d366"></i>Klik WhatsApp</span></div></div><div class="card-b">${lineChart(s.series)}</div></div>
        <div class="card"><div class="card-h"><h2>Perangkat</h2></div><div class="card-b">
          <div class="split" title="Mobile ${mPct}%"><b style="width:${mPct}%"></b><i style="width:${100 - mPct}%;background:#c8def0"></i></div>
          <div style="display:flex;justify-content:space-between"><span><span class="pill b">Mobile</span> ${nf.format(s.devices.mobile)}</span><span><span class="pill">Desktop</span> ${nf.format(s.devices.desktop)}</span></div>
          <h2 style="font-size:15px;margin:22px 0 4px">Aktivitas per jam</h2>
          <div class="legend" style="margin:0 0 4px"><span><i style="background:#c8def0"></i>Dilihat</span><span><i style="background:#25d366"></i>Klik WA</span></div>
          ${hourChart(s.hours)}
        </div></div>
      </section>
      <section class="grid3">
        <div class="card"><div class="card-h"><h2>Produk paling banyak diklik</h2><span class="sub">tombol "Tanya stok"</span></div><div class="card-b">${rankList(s.topProducts, { valueKey: 'clicks', nameKey: 'name', green: true })}</div></div>
        <div class="card"><div class="card-h"><h2>Halaman terpopuler</h2></div><div class="card-b">${rankList(s.topPages.map((x) => ({ ...x, nm: pageName(x.path) })), { valueKey: 'views', nameKey: 'nm', subFn: (x) => `${x.waClicks} klik WA` })}</div></div>
        <div class="card"><div class="card-h"><h2>Asal pengunjung</h2></div><div class="card-b">${rankList(s.referrers, { valueKey: 'visits', nameKey: 'name' })}</div></div>
        <div class="card"><div class="card-h"><h2>Tombol WhatsApp yang diklik</h2></div><div class="card-b">${rankList(s.topButtons, { valueKey: 'clicks', nameKey: 'name', green: true })}</div></div>
      </section>
      <section class="card"><div class="card-h"><h2>Klik WhatsApp terbaru</h2><span class="sub">termasuk telepon dan peta: ${c.callClicks} telepon · ${c.mapsClicks} peta</span></div>
        <div class="tbl-wrap">${s.recentWa.length ? `<table><thead><tr><th>Waktu</th><th>Halaman</th><th>Tombol / produk</th><th>Perangkat</th></tr></thead><tbody>${s.recentWa.map((r) => `<tr><td>${ago(r.t)}</td><td>${esc(pageName(r.path))}</td><td>${esc(r.product || r.label)}</td><td><span class="pill ${r.dev === 'mobile' ? 'b' : ''}">${r.dev === 'mobile' ? 'Mobile' : 'Desktop'}</span></td></tr>`).join('')}</tbody></table>` : `<div class="empty">Belum ada klik WhatsApp</div>`}</div>
      </section>`;
    view.querySelectorAll('.seg button').forEach((b) => (b.onclick = () => { days = +b.dataset.d; renderDashboard(); }));
    wireChart(s.series);
  }

  // =====================================================================
  // PRODUCTS
  // =====================================================================
  let products = [], tab = 'all', q = '', sort = 'order', onlyNoPhoto = false;

  async function renderProducts() {
    view.innerHTML = `<div class="empty">Memuat…</div>`;
    try { products = await api('/products'); } catch { view.innerHTML = offlineBanner(); checkServer(); return; }
    checkServer();
    $('#navCount').textContent = products.length;
    drawList(true);
  }

  function filtered() {
    let list = products.filter((p) => (tab === 'all' || p.category === tab));
    if (onlyNoPhoto) list = list.filter((p) => !p.photo);
    if (q) { const k = q.toLowerCase(); list = list.filter((p) => `${p.title} ${p.group} ${p.description}`.toLowerCase().includes(k)); }
    const cmp = {
      order: (a, b) => (a.order ?? 1000) - (b.order ?? 1000) || a.title.localeCompare(b.title),
      name: (a, b) => a.title.localeCompare(b.title),
      hidden: (a, b) => (a.published === b.published ? 0 : a.published ? 1 : -1) || a.title.localeCompare(b.title),
    }[sort];
    return list.sort(cmp);
  }

  function drawList(full) {
    if (full) {
      const count = (v) => products.filter((p) => v === 'all' || p.category === v).length;
      view.innerHTML = `
        <div class="card">
          <div class="tabs" id="tabs">${[{ v: 'all', l: 'Semua' }, ...CATS].map((c) => `<button data-t="${c.v}" class="${c.v === tab ? 'on' : ''}">${c.l}<span>${count(c.v)}</span></button>`).join('')}</div>
          <div class="tools">
            <label class="search"><svg viewBox="0 0 24 24"><path d="M10 2a8 8 0 105.3 14l5.4 5.4 1.4-1.4-5.4-5.4A8 8 0 0010 2zm0 2a6 6 0 110 12 6 6 0 010-12z"/></svg><input id="q" type="search" placeholder="Cari nama, jenis, atau deskripsi produk" value="${esc(q)}"></label>
            <select id="sort"><option value="order">Urutan tampil</option><option value="name">Nama A–Z</option><option value="hidden">Disembunyikan dulu</option></select>
            <label style="display:flex;gap:6px;align-items:center;color:var(--soft)"><input type="checkbox" id="nophoto" ${onlyNoPhoto ? 'checked' : ''}> Tanpa foto</label>
            <button class="btn" id="addBtn">+ Tambah produk</button>
          </div>
          <div class="tbl-wrap" id="tbl"></div>
          <div class="pager" id="pager"></div>
        </div>`;
      $('#sort').value = sort;
      $('#tabs').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; tab = b.dataset.t; drawList(true); };
      $('#q').oninput = (e) => { q = e.target.value; drawList(false); };
      $('#sort').onchange = (e) => { sort = e.target.value; drawList(false); };
      $('#nophoto').onchange = (e) => { onlyNoPhoto = e.target.checked; drawList(false); };
      $('#addBtn').onclick = () => openDrawer(null);
    }
    const list = filtered();
    $('#pager').textContent = `Menampilkan ${list.length} dari ${products.length} produk`;
    $('#tbl').innerHTML = list.length ? `<table><thead><tr><th>Produk</th><th>Kategori / jenis</th><th>Urutan</th><th>Tampil</th><th></th></tr></thead><tbody>${list.map((p) => `
      <tr data-id="${esc(p.id)}">
        <td><div class="prod"><div class="thumb" style="${p.photo ? `background-image:url('${esc(p.photo)}')` : ''}">${p.photo ? '' : 'No foto'}</div><div><b>${esc(p.title)}</b><small>${esc(p.description)}</small></div></div></td>
        <td><span class="pill b">${esc(catLabel(p.category))}</span><div style="color:var(--muted);font-size:12px;margin-top:4px">${esc(p.group || '—')}</div></td>
        <td>${p.order ?? 1000}</td>
        <td><label class="sw"><input type="checkbox" class="tg" ${p.published !== false ? 'checked' : ''}><span></span></label></td>
        <td><div class="row-act"><button class="btn btn-ghost btn-sm ed">Ubah</button></div></td>
      </tr>`).join('')}</tbody></table>` : `<div class="empty">Tidak ada produk yang cocok.</div>`;
    $('#tbl').querySelectorAll('tr[data-id]').forEach((tr) => {
      const id = tr.dataset.id;
      tr.querySelector('.ed').onclick = () => openDrawer(products.find((p) => p.id === id));
      tr.querySelector('.tg').onchange = async (e) => {
        const on = e.target.checked;
        try {
          const saved = await api(`/products/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ published: on }) });
          Object.assign(products.find((p) => p.id === id), saved);
          setPending(true); toast(on ? 'Produk ditampilkan' : 'Produk disembunyikan');
        } catch (err) { e.target.checked = !on; toast(err.message, true); }
      };
    });
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

  function openDrawer(p) {
    ensureDrawer();
    const isNew = !p;
    const d = p ? { ...p } : { category: tab !== 'all' ? tab : 'ac', group: '', title: '', photo: '', alt: '', description: '', wa_message: '', order: 1000, published: true };
    const groups = [...new Set(products.map((x) => x.group).filter(Boolean))];
    drawer.innerHTML = `
      <div class="drawer-h"><h2>${isNew ? 'Tambah produk' : 'Ubah produk'}</h2><button id="dx" aria-label="Tutup">×</button></div>
      <form class="drawer-b" id="pf" autocomplete="off">
        <div class="fld photo">
          <div class="thumb" id="pth"></div>
          <div>
            <div class="drop" id="drop">Klik atau seret foto ke sini<br><small>JPG, PNG, WebP · maks 8 MB</small></div>
            <input type="file" id="file" accept="image/jpeg,image/png,image/webp" hidden>
            <button type="button" class="btn btn-ghost btn-sm" id="rmPhoto" style="margin-top:8px" ${d.photo ? '' : 'hidden'}>Hapus foto</button>
          </div>
        </div>
        <div class="fld"><label for="f_title">Nama / model *</label><input type="text" id="f_title" required value="${esc(d.title)}"></div>
        <div class="two">
          <div class="fld"><label for="f_cat">Kategori</label><select id="f_cat">${CATS.map((c) => `<option value="${c.v}" ${c.v === d.category ? 'selected' : ''}>${c.l}</option>`).join('')}</select></div>
          <div class="fld"><label for="f_order">Urutan</label><input type="number" id="f_order" value="${d.order ?? 1000}"><small>Angka kecil tampil lebih dulu.</small></div>
        </div>
        <div class="fld"><label for="f_group">Jenis / sub-kategori</label><input type="text" id="f_group" list="groups" value="${esc(d.group)}"><datalist id="groups">${groups.map((g) => `<option value="${esc(g)}">`).join('')}</datalist><small>Judul bagian di halaman kategori. Samakan persis dengan produk lain agar masuk bagian yang sama.</small></div>
        <div class="fld"><label for="f_desc">Deskripsi singkat</label><textarea id="f_desc">${esc(d.description)}</textarea><small>Contoh: AC split ½ PK · 350 W · R32</small></div>
        <div class="fld"><label for="f_wa">Pesan WhatsApp otomatis</label><textarea id="f_wa">${esc(d.wa_message)}</textarea><small>Kosong = pesan standar berisi nama produk.</small></div>
        <div class="fld"><label for="f_alt">Teks alternatif foto</label><input type="text" id="f_alt" value="${esc(d.alt)}"></div>
        <div class="fld" style="display:flex;align-items:center;gap:12px"><label class="sw"><input type="checkbox" id="f_pub" ${d.published !== false ? 'checked' : ''}><span></span></label><b>Tampilkan di website</b></div>
        <div class="preview"><h4>Pratinjau kartu</h4><div class="pc"><div class="thumb" id="pv_th"></div><div><b id="pv_t"></b><div style="color:var(--muted);font-size:12.5px" id="pv_d"></div><span class="wa">Tanya stok</span></div></div></div>
      </form>
      <div class="drawer-f">
        ${isNew ? '<span></span>' : '<button type="button" class="btn btn-danger" id="del">Hapus</button>'}
        <button type="button" class="btn btn-ghost" id="cancel">Batal</button>
        <button type="submit" class="btn" id="save" form="pf">Simpan</button>
      </div>`;
    requestAnimationFrame(() => { drawer.classList.add('on'); scrim.classList.add('on'); });

    const g = (id) => $(id, drawer);
    let photo = d.photo || '';
    const paint = () => {
      const bg = photo ? `url('${photo.replace(/'/g, '%27')}')` : 'none';
      for (const id of ['#pth', '#pv_th']) { const el = g(id); el.style.backgroundImage = bg; el.textContent = photo ? '' : 'No foto'; }
      g('#pv_t').textContent = g('#f_title').value || 'Nama produk';
      g('#pv_d').textContent = g('#f_desc').value || 'Deskripsi singkat';
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
      drop.textContent = 'Mengunggah…';
      try {
        const r = await api(`/upload?name=${encodeURIComponent(f.name)}`, { method: 'POST', body: f });
        photo = r.path; if (!g('#f_alt').value) g('#f_alt').value = g('#f_title').value;
        paint(); drop.innerHTML = 'Foto terunggah. Klik untuk mengganti.';
      } catch (err) { drop.innerHTML = 'Klik atau seret foto ke sini'; toast(err.message, true); }
    }

    g('#pf').onsubmit = async (e) => {
      e.preventDefault();
      const body = {
        category: g('#f_cat').value, group: g('#f_group').value, title: g('#f_title').value, photo,
        alt: g('#f_alt').value, description: g('#f_desc').value, wa_message: g('#f_wa').value,
        order: g('#f_order').value, published: g('#f_pub').checked,
      };
      const btn = g('#save'); btn.disabled = true;
      try {
        const saved = isNew
          ? await api('/products', { method: 'POST', body: JSON.stringify(body) })
          : await api(`/products/${encodeURIComponent(p.id)}`, { method: 'PUT', body: JSON.stringify(body) });
        if (isNew) products.push(saved); else Object.assign(p, saved);
        $('#navCount').textContent = products.length;
        setPending(true); closeDrawer(); drawList(true);
        toast("Tersimpan. Klik 'Terapkan ke website' untuk menampilkan di toko.");
      } catch (err) { toast(err.message, true); }
      btn.disabled = false;
    };
    if (!isNew) {
      let armed = false;
      g('#del').onclick = async (e) => {
        if (!armed) { armed = true; e.target.textContent = 'Klik lagi untuk menghapus'; setTimeout(() => { armed = false; e.target.textContent = 'Hapus'; }, 3500); return; }
        try {
          await api(`/products/${encodeURIComponent(p.id)}`, { method: 'DELETE' });
          products = products.filter((x) => x.id !== p.id);
          $('#navCount').textContent = products.length;
          setPending(true); closeDrawer(); drawList(true); toast('Produk dihapus');
        } catch (err) { toast(err.message, true); }
      };
    }
  }

  checkServer().then((ok) => { if (ok) api('/products').then((r) => ($('#navCount').textContent = r.length)).catch(() => {}); });
  route();
})();
