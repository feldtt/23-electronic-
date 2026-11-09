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
            Tanya via WA
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
        <a href="${base}produk/ac.html">AC</a>
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
    } else if (href.startsWith('tel:')) {
      track('click_call', { phone: href.replace('tel:', '') });
    } else if (href.includes('maps.google.com') || href.includes('goo.gl/maps')) {
      track('click_maps');
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
    hsInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); window.open(hsBtn.href, '_blank'); } });
  }

  // Expose
  window.__waLink = waLink;
  window.__mapsLink = mapsLink;
  window.__telLink = telLink;
})();
