// Shared header / footer / sticky WA for 23 Electronic
// Each page sets: window.__page = { active: 'home'|'produk'|'jasa'|'tentang'|'kontak'|'faq'|'review', basePath: '' or '../' }

(function () {
  const page = window.__page || { active: '', basePath: '' };
  const base = page.basePath || '';
  const waNumber = '628111523239'; // real — owner WhatsApp
  const sourcePage = page.active || 'unknown';
  const waMsg = encodeURIComponent(`Halo 23 Electronic, saya mau tanya stok/harga/service. [src:${sourcePage}]`);
  const waLink = `https://wa.me/${waNumber}?text=${waMsg}`;
  const mapsLink = 'https://share.google/0QVk0UbpNqSYhuXnu';
  const telLink = 'tel:+628111523239';

  const isActive = (k) => page.active === k ? ' active' : '';

  // ===== Top utility bar =====
  const topbar = `
    <div class="topbar">
      <div class="container">
        <div class="top-left">
          <span>📍 Jl. Dewi Sartika, Ciputat</span>
          <span>🕗 Senin–Minggu 08.00–21.00</span>
        </div>
        <div class="top-right">
          <a href="${telLink}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57a1.02 1.02 0 0 0-1.02.24l-2.2 2.2a15.07 15.07 0 0 1-6.59-6.59l2.2-2.2a1 1 0 0 0 .25-1A11.36 11.36 0 0 1 8.5 4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1c0 9.39 7.61 17 17 17a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z"/></svg>
            0811-1523-239
          </a>
          <a href="${base}kontak-lokasi.html">Kontak &amp; Lokasi</a>
          <a href="${base}faq.html">Bantuan / FAQ</a>
          <a href="${base}kebijakan-garansi.html">Garansi</a>
        </div>
      </div>
    </div>
  `;

  // ===== Main header =====
  const header = `
    <header class="header">
      <div class="container header-inner">
        <a href="${base}index.html" class="logo" aria-label="23 Electronic">
          <img src="/assets/uploads/logo-23-electronic.png" alt="23 Electronic" class="logo-img" width="180" height="56" />
        </a>
        <div class="header-search">
          <input class="hs-input" type="text" placeholder="Cari produk: AC, Kulkas, Mesin Cuci..." aria-label="Cari produk" id="hsInput" />
          <a class="hs-btn" href="${waLink}" target="_blank" rel="noopener" id="hsBtn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/></svg>
            Cari
          </a>
        </div>
        <div class="header-actions">
          <a href="${waLink}" class="nav-cta" target="_blank" rel="noopener">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1l-1 1.1c-.2.2-.4.2-.6.1-.9-.4-1.7-.9-2.5-1.6-.7-.6-1.2-1.4-1.6-2.2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5 0-.2 0-.3-.1-.5l-1-2.2c-.2-.5-.4-.5-.7-.5h-.5c-.2 0-.5.2-.7.4-.9.9-1.4 2.1-1.4 3.3.1 1.5.7 3 1.6 4.2 1.7 2.4 3.9 4.2 6.5 5.2.7.3 1.3.5 2 .6.7.1 1.3.1 2 0 .8-.1 1.6-.7 2.1-1.4.3-.4.4-.9.5-1.4v-.6c0-.1-.2-.2-.5-.3zM12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.1 1.6 5.9L0 24l6.3-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12S18.6 0 12 0z"/></svg>
            <span class="nav-cta-text">Chat Admin</span>
          </a>
          <button class="menu-toggle" aria-label="Menu" onclick="document.getElementById('mainSubnav').classList.toggle('open')">☰</button>
        </div>
      </div>
    </header>
  `;

  // ===== Sub-nav with categories =====
  const subnav = `
    <nav class="subnav" id="mainSubnav">
      <div class="container">
        <a href="${base}index.html" class="${isActive('home')}">Beranda</a>
        <a href="${base}produk/index.html" class="${isActive('produk')}">Semua Produk</a>
        <div class="nav-dd" id="ddAc"><a href="${base}produk/ac.html">AC <span class="dd-caret">&#9662;</span></a><div class="dd-panel" id="ddAcPanel"></div></div>
        <a href="${base}produk/kulkas.html">Kulkas</a>
        <a href="${base}produk/mesin-cuci.html">Mesin Cuci</a>
        <a href="${base}produk/tv-dan-elektronik-rumah.html">TV &amp; Elektronik</a>
        <a href="${base}jasa-service/index.html" class="${isActive('jasa')}">Jasa Service</a>
        <a href="${base}area-layanan/index.html" class="${isActive('area')}">Area Layanan</a>
        <a href="${base}promo/index.html" class="${isActive('promo')}">Promo</a>
        <a href="${base}review-dan-testimoni.html" class="${isActive('review')}">Review</a>
        <a href="${base}tentang-toko-23.html" class="${isActive('tentang')}">Tentang</a>
        <a href="${base}kontak-lokasi.html" class="subnav-cta ${isActive('kontak')}">📍 Lokasi Toko</a>
      </div>
    </nav>
  `;

  // ===== CTA strip =====
  const cta = `
    <section class="cta-strip">
      <div class="container">
        <h2>Tanya Stok, Harga, atau Booking Service Sekarang</h2>
        <p>Admin balas via WhatsApp untuk produk &amp; jasa. Datang langsung juga boleh — buka 08.00–21.00.</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <a href="${waLink}" class="btn btn-wa" target="_blank" rel="noopener">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1l-1 1.1c-.2.2-.4.2-.6.1-.9-.4-1.7-.9-2.5-1.6-.7-.6-1.2-1.4-1.6-2.2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5 0-.2 0-.3-.1-.5l-1-2.2c-.2-.5-.4-.5-.7-.5h-.5c-.2 0-.5.2-.7.4-.9.9-1.4 2.1-1.4 3.3.1 1.5.7 3 1.6 4.2 1.7 2.4 3.9 4.2 6.5 5.2.7.3 1.3.5 2 .6.7.1 1.3.1 2 0 .8-.1 1.6-.7 2.1-1.4.3-.4.4-.9.5-1.4v-.6c0-.1-.2-.2-.5-.3zM12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.1 1.6 5.9L0 24l6.3-1.6c1.7.9 3.7 1.4 5.7 1.4 6.6 0 12-5.4 12-12S18.6 0 12 0z"/></svg>
            Chat WhatsApp Sekarang
          </a>
          <a href="${mapsLink}" class="btn btn-secondary" target="_blank" rel="noopener">Buka Lokasi di Google Maps</a>
        </div>
      </div>
    </section>
  `;

  // ===== Footer =====
  const footer = `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="logo" style="margin-bottom:14px;">
              <span class="logo-mark">23</span>
              <span style="color:#fff;">23 Electronic<small>Toko Dua Tiga · Ciputat</small></span>
            </div>
            <p style="color:rgba(255,255,255,0.7);font-size:13px;max-width:340px;line-height:1.55;margin-bottom:14px;">
              Toko elektronik lokal di Jl. Dewi Sartika, Ciputat. Tanya stok, harga, dan kebutuhan pemasangan AC via WhatsApp — atau datang langsung ke toko.
            </p>
            <div style="font-size:12px;color:rgba(255,255,255,0.85);font-weight:600;margin-bottom:6px;">Pembayaran Diterima</div>
            <div class="pay-row">
              <span class="pay-chip">Tunai</span>
              <span class="pay-chip">Transfer</span>
              <span class="pay-chip">QRIS *</span>
              <span class="pay-chip">Cicilan AEON</span>
              <span class="pay-chip">Debit *</span>
            </div>
            <div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:6px;">* konfirmasi ke admin</div>
          </div>
          <div>
            <h5>Produk</h5>
            <ul>
              <li><a href="${base}produk/ac.html">AC</a></li>
              <li><a href="${base}produk/kulkas.html">Kulkas</a></li>
              <li><a href="${base}produk/mesin-cuci.html">Mesin Cuci</a></li>
              <li><a href="${base}produk/tv-dan-elektronik-rumah.html">TV &amp; Elektronik</a></li>
              <li><a href="${base}produk/index.html">Semua Produk</a></li>
            </ul>
          </div>
          <div>
            <h5>Jasa Service</h5>
            <ul>
              <li><a href="${base}jasa-service/service-ac-ciputat.html">Service AC</a></li>
              <li><a href="${base}jasa-service/cuci-ac-ciputat.html">Cuci AC</a></li>
              <li><a href="${base}jasa-service/pasang-ac-ciputat.html">Pasang AC</a></li>
              <li><a href="${base}jasa-service/isi-freon-ac-ciputat.html">Isi Freon AC</a></li>
              <li><a href="${base}jasa-service/bongkar-pasang-ac-ciputat.html">Bongkar Pasang AC</a></li>
              <li><a href="${base}jasa-service/service-kulkas-ciputat.html">Service Kulkas</a></li>
              <li><a href="${base}jasa-service/service-mesin-cuci-ciputat.html">Service Mesin Cuci</a></li>
              <li><a href="${base}jasa-service/index.html">Semua Layanan</a></li>
            </ul>
          </div>
          <div>
            <h5>Informasi</h5>
            <ul>
              <li><a href="${base}tentang-toko-23.html">Tentang Toko</a></li>
              <li><a href="${base}kontak-lokasi.html">Kontak &amp; Lokasi</a></li>
              <li><a href="${base}area-layanan/index.html">Area Layanan</a></li>
              <li><a href="${base}promo/index.html">Promo</a></li>
              <li><a href="${base}review-dan-testimoni.html">Review Pelanggan</a></li>
              <li><a href="${base}faq.html">FAQ / Bantuan</a></li>
              <li><a href="${base}kebijakan-garansi.html">Kebijakan Garansi</a></li>
              <li><a href="${base}syarat-layanan.html">Syarat Layanan</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <div>© 2026 23 Electronic Ciputat. Semua hak dilindungi.</div>
          <div>
            <a href="${base}kebijakan-garansi.html">Kebijakan Garansi</a> ·
            <a href="${base}syarat-layanan.html">Syarat Layanan</a>
          </div>
        </div>
      </div>
    </footer>
  `;

  // ===== Sticky WhatsApp =====
  const sticky = `
    <a href="${waLink}" class="wa-sticky" target="_blank" rel="noopener" aria-label="Chat WhatsApp">
      <span class="wa-icon">W</span>
      Chat Admin
    </a>
  `;

  // Inject
  const slot = (id, html) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  };
  slot('topbar', topbar);
  slot('header', header);
  slot('subnav', subnav);
  slot('cta', cta);
  slot('footer', footer);

  // Product cards of a series: hovering (or focusing) a PK chip shows that variant's price on the card.
  window.__wireChips = (root = document) => root.querySelectorAll('.cv-chip[data-price]').forEach((chip) => {
    if (chip.dataset.wired) return;
    chip.dataset.wired = '1';
    const priceEl = chip.closest('.card-body')?.querySelector('.price');
    if (!priceEl) return;
    const base = priceEl.textContent;
    const modelEl = chip.closest('.card-body')?.querySelector('.card-model span');
    const baseModel = modelEl ? modelEl.textContent : '';
    const imgEl = chip.closest('.card')?.querySelector('.card-img img');
    const basePhoto = imgEl ? imgEl.getAttribute('src') : '';
    // Preload the variant photo and swap only once it is decoded, so the card never goes blank (flicker).
    let pre = null;
    if (imgEl && chip.dataset.photo) { pre = new Image(); pre.src = chip.dataset.photo; }
    const setPhoto = (src) => {
      if (!imgEl || !src || imgEl.getAttribute('src') === src) return;
      const next = src === chip.dataset.photo && pre ? pre : new Image();
      if (next !== pre) next.src = src;
      const tok = imgEl._tok = (imgEl._tok || 0) + 1;
      const apply = () => { if (imgEl._tok !== tok) return; imgEl.removeAttribute('loading'); imgEl.src = src; };
      (next.decode ? next.decode() : Promise.resolve()).then(apply, apply);
    };
    const show = () => { setPhoto(chip.dataset.photo); priceEl.textContent = chip.dataset.price; if (modelEl && chip.dataset.model) modelEl.textContent = chip.dataset.model; };
    const reset = () => { setPhoto(basePhoto); priceEl.textContent = base; if (modelEl) modelEl.textContent = baseModel; };
    chip.addEventListener('mouseenter', show);
    chip.addEventListener('focus', show);
    chip.addEventListener('mouseleave', reset);
    chip.addEventListener('blur', reset);
    // Touch screens have no hover: first tap on a chip previews it (photo, price, model), second tap opens the page.
    chip.addEventListener('click', (ev) => {
      if (!window.matchMedia('(hover: none)').matches || chip.dataset.preview === '1') return;
      ev.preventDefault();
      chip.closest('.card-variants')?.querySelectorAll('.cv-chip').forEach((c) => { c.dataset.preview = ''; c.classList.remove('on'); });
      chip.dataset.preview = '1'; chip.classList.add('on'); show();
    });
  });
  window.__wireChips();

  // Per-button WhatsApp messages (product cards, product pages): <a class="wa-link" data-msg="...">
  window.__waUrl = (msg) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg || 'Halo 23 Electronic')}`;
  document.querySelectorAll('.wa-link').forEach((a) => {
    a.href = window.__waUrl(a.dataset.msg);
    a.target = '_blank';
    a.rel = 'noopener';
  });

  // Sticky
  const stick = document.createElement('div');
  stick.innerHTML = sticky.trim();
  document.body.appendChild(stick.firstElementChild);

  // =====================================================================
  // Site-wide JSON-LD: LocalBusiness on every page (canonical entity)
  // =====================================================================
  const ld = {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    "name": "23 Electronic",
    "alternateName": ["Toko Dua Tiga", "23 Electronic Ciputat"],
    "image": location.origin + (base || '/') + "assets/og-fasad.jpg",
    "telephone": "+62-811-1523-239",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jl. Dewi Sartika, Cipayung / Ciputat",
      "addressLocality": "Ciputat",
      "addressRegion": "Tangerang Selatan",
      "addressCountry": "ID"
    },
    "openingHoursSpecification": [{
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
      "opens": "08:00",
      "closes": "21:00"
    }],
    "areaServed": [
      "Ciputat","Ciputat Timur","Cipayung","Pamulang","Pondok Cabe",
      "Serua","Sawah Baru","Sawah Lama","Rempoa","Rengas"
    ],
    "url": location.href,
    "sameAs": []
  };
  const ldScript = document.createElement('script');
  ldScript.type = 'application/ld+json';
  ldScript.textContent = JSON.stringify(ld);
  document.head.appendChild(ldScript);

  // =====================================================================
  // GA4-compatible event tracking stubs.
  // Adds data-event attributes — when GA4 is wired up, gtag() will be called.
  // Until then, events log to console for QA.
  // =====================================================================
  // First-party analytics: posts to the local admin server (scripts/admin-server.mjs).
  // sendBeacon with a string body is a "simple" request, so there is no CORS preflight
  // and a stopped server just fails silently.
  const ANALYTICS_URL = /^https?:$/.test(location.protocol) ? `${location.protocol}//${location.hostname}:8082/api/track` : '';
  const visitorId = (() => {
    try {
      let v = localStorage.getItem('a23vid');
      if (!v) { v = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('a23vid', v); }
      return v;
    } catch (e) { return 'anon'; }
  })();
  const refHost = (() => {
    try { const h = new URL(document.referrer).hostname; return h && h !== location.hostname ? h.replace(/^www\./, '') : ''; } catch (e) { return ''; }
  })();
  const beacon = (type, extra = {}) => {
    if (!ANALYTICS_URL || !navigator.sendBeacon) return;
    try {
      navigator.sendBeacon(ANALYTICS_URL, JSON.stringify({ type, vid: visitorId, path: location.pathname, page: sourcePage, ref: refHost, ...extra }));
    } catch (e) { /* ignore */ }
  };

  const track = (name, params = {}) => {
    params.source_page = sourcePage;
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params);
    } else if (window.dataLayer) {
      window.dataLayer.push({ event: name, ...params });
    } else {
      // dev / pre-GA4 fallback
      console.debug('[evt]', name, params);
    }
  };

  // Auto-bind to anchors based on href patterns
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (href.includes('wa.me') || href.includes('whatsapp')) {
      track('click_whatsapp', { link_text: a.textContent.trim().slice(0, 60) });
      const card = a.closest('.card');
      beacon('click_whatsapp', { label: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 60), product: a.dataset.product || (card ? (card.querySelector('h3')?.textContent.trim() || '') : '') });
    } else if (href.startsWith('tel:')) {
      track('click_call', { phone: href.replace('tel:', '') });
      beacon('click_call');
    } else if (href.includes('maps.google.com') || href.includes('goo.gl/maps')) {
      track('click_maps');
      beacon('click_maps');
    } else if (href.includes('tokopedia') || href.includes('shopee') || href.includes('blibli')) {
      track('click_marketplace', { dest: new URL(href, location.href).hostname });
    }
  });

  // Page view event with intent classification
  const intent =
    sourcePage === 'jasa' ? 'view_service_page' :
    sourcePage === 'produk' ? 'view_product_category' :
    'view_page';
  track(intent, { page: location.pathname });
  beacon('pageview');

  // Search bar: typing prefills WA message + tracks submit
  const hsInput = document.getElementById('hsInput');
  const hsBtn = document.getElementById('hsBtn');
  if (hsInput && hsBtn) {
    const update = () => {
      const q = hsInput.value.trim();
      const msg = q
        ? `Halo 23 Electronic, saya mau tanya tentang: ${q}`
        : 'Halo 23 Electronic, saya mau tanya stok/harga.';
      hsBtn.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;
    };
    hsInput.addEventListener('input', update);

    // ---- Product search (also used by cari.html) ----
    // Understands general queries: category words (ac, kulkas...), PK size ("1 pk", "setengah pk"),
    // a few synonyms ("standar", "hemat"), and falls back to the closest products.
    const wrap = hsInput.closest('.header-search');
    const box = document.createElement('div');
    box.className = 'hs-results';
    box.hidden = true;
    wrap.appendChild(box);
    let index = null;
    let loading = null;
    let res = null;
    let items = [];
    let active = -1;
    const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9/ ]+/g, ' ').replace(/\s+/g, ' ').trim();
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const CATS = [['air conditioner', 'ac'], ['mesin cuci', 'mesin-cuci'], ['lemari es', 'kulkas'], ['televisi', 'tv'], ['kulkas', 'kulkas'], ['freezer', 'kulkas'], ['washer', 'mesin-cuci'], ['ac', 'ac'], ['tv', 'tv']];
    const CAT_LABEL = { ac: 'AC', kulkas: 'Kulkas', 'mesin-cuci': 'Mesin Cuci', tv: 'TV' };
    const pkNum = (raw) => {
      const m = String(raw).replace(',', '.').match(/(\d+)\s*\/\s*(\d+)|(\d+(?:\.\d+)?)/);
      if (!m) return null;
      return m[3] ? parseFloat(m[3]) : Number(m[1]) / Number(m[2]);
    };
    const pkText = (n) => (n === 0.5 ? '1/2' : n === 0.75 ? '3/4' : String(n).replace('.', ','));
    window.__searchLoad = () => loading || (loading = fetch('/assets/search-index.json').then((r) => r.json()).then((d) => { index = d.map((x) => ({ ...x, h: norm(`${x.t} ${x.k} ${x.c}`) })); }).catch(() => { index = []; }));
    window.__search = (q, g) => {
      let s = String(q || '').toLowerCase()
        .replace(/satu setengah/g, '1.5').replace(/tiga perempat/g, '3/4').replace(/setengah/g, '1/2')
        .replace(/\bsatu\b/g, '1').replace(/\bdua\b/g, '2').replace(/\btiga\b/g, '3');
      let pk = null;
      s = s.replace(/(\d+(?:[.,]\d+)?(?:\s*\/\s*\d+)?)\s*pk\b/, (_, n) => { pk = pkNum(n); return ' '; });
      s = ` ${norm(s)} `;
      let cat = null;
      for (const [word, c] of CATS) {
        if (s.includes(` ${word} `)) { cat = cat || c; s = s.replace(` ${word} `, ' '); }
      }
      s = s.replace(/ standar /g, ' standard ').replace(/ (hemat|irit|lowatt) /g, ' low watt ');
      const tokens = norm(s).split(' ').filter((t) => t && t !== 'pk');
      const label = [cat ? CAT_LABEL[cat] : '', g || '', pk !== null ? `${pkText(pk)} PK` : '', ...tokens].filter(Boolean).join(' ') || String(q || '').trim();
      const out = { exact: [], near: [], label, cat, pk, tokens };
      if (!cat && pk === null && !tokens.length) return out;
      const pool = (index || []).filter((x) => (!cat || x.c === cat) && (!g || (x.g || []).includes(g)));
      const dist = (x) => (pk === null ? 0 : !x.v.length ? 99 : Math.min(...x.v.map((v) => Math.abs(v - pk))));
      const scored = pool.map((x) => ({ x, n: tokens.filter((t) => x.h.includes(t)).length, d: dist(x) }));
      out.exact = scored.filter((r) => r.d < 0.01 && r.n === tokens.length).map((r) => r.x);
      if (!out.exact.length) {
        out.near = scored
          .filter((r) => r.n > 0 || (!tokens.length && pk !== null))
          .sort((a, b) => (b.n - a.n) || (a.d - b.d))
          .map((r) => r.x);
      }
      return out;
    };

    const card = (x, pk) => {
      const chips = (x.s || []).map((m) => {
        const hit = pk != null && Math.abs((pkNum(m.v) ?? -1) - pk) < 0.01;
        return { hit, html: `<a class="cv-chip${hit ? ' on' : ''}" href="${esc(`${x.u}#${m.id}`)}" title="Lihat ${esc(m.v)}" data-model="${esc(m.mo || '')}" data-photo="${esc(m.ph || '')}" data-price="${esc(m.p || 'Cek harga via WA')}">${esc(m.v)}</a>` };
      });
      const hit = (x.s || []).find((m) => pk != null && Math.abs((pkNum(m.v) ?? -1) - pk) < 0.01);
      const price = hit ? hit.p : x.p;
      const model = x.s ? ((hit || x.s[0]).mo || '') : (x.m || '');
      return `<div class="card"><a class="card-img${x.i ? ' has-photo' : ''}" href="${esc(hit ? `${x.u}#${hit.id}` : x.u)}" tabindex="-1" aria-hidden="true">${x.i ? `<img src="${esc(x.i)}" alt="" loading="lazy">` : ''}</a><div class="card-body"><h3><a class="card-title" href="${esc(hit ? `${x.u}#${hit.id}` : x.u)}">${esc(x.t)}</a></h3>${model ? `<div class="card-model"><span>${esc(model)}</span></div>` : ''}${chips.length ? `<div class="card-variants">${chips.map((c) => c.html).join('')}</div>` : ''}<div class="price">${esc(price || 'Cek harga via WA')}</div></div></div>`;
    };
    window.__searchCard = card;

    const waSearch = (q) => window.__waUrl('Halo 23 Electronic, saya cari ' + q + '. Ada stok? Boleh dibantu infonya (merek dan harga).');
    const searchUrl = () => `${base}cari.html?q=${encodeURIComponent(hsInput.value.trim())}`;
    const render = () => {
      const q = hsInput.value.trim();
      active = -1;
      if (!q) { box.hidden = true; items = []; res = null; return; }
      res = window.__search(q);
      const list = res.exact.length ? res.exact : res.near;
      items = list.slice(0, 5);
      let html = '';
      if (list.length) {
        html += `<a class="hs-all" href="${esc(searchUrl())}">Lihat semua ${esc(res.label)} <b>(${list.length})</b> &rsaquo;</a>`;
        if (!res.exact.length) html += '<div class="hs-note">Tidak ada yang persis <b>' + esc(res.label) + '</b>. Mungkin ini yang kamu cari:</div>';
        html += items.map((x) => `<a class="hs-item" href="${esc(x.u)}">${x.i ? `<img src="${esc(x.i)}" alt="">` : '<span class="hs-noimg"></span>'}<span class="hs-t">${esc(x.t)}${x.m ? `<small>${esc(x.m)}</small>` : ''}</span><span class="hs-p">${esc(x.p || 'Cek harga via WA')}</span></a>`).join('');
        if (!res.exact.length) html += '<a class="hs-wa-row" href="' + esc(waSearch(q)) + '" target="_blank" rel="noopener">Minta dicarikan via WA &rsaquo;</a>';
      } else {
        html = `<div class="hs-empty"><strong>Belum ada di daftar, tapi mungkin kami punya stoknya.</strong><span>Tanya admin untuk <em>${esc(q)}</em>, dibalas cepat.</span><a class="hs-wa" href="${esc(waSearch(q))}" target="_blank" rel="noopener">Tanya stok via WhatsApp</a></div>`;
      }
      box.innerHTML = html;
      box.hidden = false;
    };
    const mark = () => box.querySelectorAll('.hs-item').forEach((el, i) => el.classList.toggle('on', i === active));
    const go = () => {
      if (!hsInput.value.trim()) return;
      if (items[active]) location.href = items[active].u;
      else if (res && res.exact.length === 1) location.href = res.exact[0].u;
      else if (res && (res.exact.length || res.near.length)) location.href = searchUrl();
      else window.open(hsBtn.href, '_blank');
    };
    hsInput.addEventListener('input', () => { window.__searchLoad().then(render); });
    hsInput.addEventListener('focus', () => { window.__searchLoad().then(render); });
    hsInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); window.__searchLoad().then(() => { render(); go(); }); }
      else if (e.key === 'ArrowDown' && items.length) { e.preventDefault(); active = (active + 1) % items.length; mark(); }
      else if (e.key === 'ArrowUp' && items.length) { e.preventDefault(); active = (active - 1 + items.length) % items.length; mark(); }
      else if (e.key === 'Escape') { box.hidden = true; }
    });
    hsBtn.addEventListener('click', (e) => { e.preventDefault(); window.__searchLoad().then(() => { render(); go(); }); });
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) box.hidden = true; });
  }

  // AC mega menu: AC Split > Standard / Inverter / Low Watt > PK sizes. Built from the search index,
  // so it only lists what the catalog really has. Links go to cari.html (filtered results).
  (function () {
    const panel = document.getElementById('ddAcPanel');
    if (!panel) return;
    const pkText = (n) => (n === 0.5 ? '1/2' : n === 0.75 ? '3/4' : String(n).replace('.', ','));
    const url = (q, g) => `${base}cari.html?q=${encodeURIComponent(q)}${g ? `&g=${encodeURIComponent(g)}` : ''}`;
    const ORDER = ['Standard', 'Low Watt', 'Inverter'];
    fetch('/assets/search-index.json').then((r) => r.json()).then((all) => {
      const ac = all.filter((x) => x.c === 'ac');
      if (!ac.length) return;
      const groups = [...new Set(ac.flatMap((x) => x.g || []))].sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99));
      const groupHtml = groups.map((g) => {
        const inG = ac.filter((x) => (x.g || []).includes(g));
        const pks = [...new Set(inG.flatMap((x) => x.v))].sort((a, b) => a - b);
        const pkHtml = pks.map((n) => `<li><a href="${url(`ac ${pkText(n)} pk`, g)}">${pkText(n)} PK <small>${inG.filter((x) => x.v.includes(n)).length}</small></a></li>`).join('');
        return `<li class="dd-has"><a href="${url('ac', g)}">${g} <small>${inG.length}</small></a><ul class="dd-sub"><li><a href="${url('ac', g)}"><b>Semua ${g}</b></a></li>${pkHtml}</ul></li>`;
      }).join('');
      panel.innerHTML = `<ul class="dd-l1"><li class="dd-has"><a href="${url('ac')}">AC Split <small>${ac.length}</small></a><ul class="dd-sub"><li><a href="${url('ac')}"><b>Semua AC Split</b></a></li>${groupHtml}</ul></li><li><a href="${base}kalkulator-pk.html">Kalkulator PK</a></li><li><a href="${base}produk/ac.html">Halaman AC (dengan paket pasang)</a></li></ul>`;
      document.getElementById('ddAc').classList.add('ready');
    }).catch(() => {});
  })();

  // Expose
  window.__waLink = waLink;
  window.__mapsLink = mapsLink;
  window.__telLink = telLink;
})();
