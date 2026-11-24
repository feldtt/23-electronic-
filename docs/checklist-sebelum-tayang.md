# Checklist sebelum tayang (dicek oleh owner)

Centang satu per satu pada hari tayang. Daftar ini dibuat dari pencarian di `mockup/toko-23/` pada 20 Nov 2026,
jadi tambahkan hal baru kalau muncul.

## A. Konten placeholder (jangan tayang sebelum diganti atau disembunyikan)

- [ ] **Review pelanggan di beranda** — `index.html` baris ~373-391 (3 kartu, "Pelanggan Ciputat/Pamulang/Cipayung · testimoni WA"). Ganti dengan ulasan asli (izin pelanggan) atau sembunyikan.
- [ ] **Halaman Review & Testimoni** — `review-dan-testimoni.html` (9 `review-card`, teks "dari WhatsApp dan Google"). Sama: ganti atau sembunyikan.
- [ ] **Promo** — `promo/index.html` baris ~34: "Belum ada promo aktif yang diverifikasi owner — placeholder berikut akan diisi...". Isi promo asli atau hapus halamannya dari menu.
- [ ] **Foto pekerjaan service** — `jasa-service/service-ac-ciputat.html` baris ~98 ("Foto pekerjaan ditampilkan setelah..."). Ganti dengan foto asli atau hapus kalimat.
- [ ] **Kartu layanan di beranda** — `index.html` bagian "Layanan Service AC Ciputat": 3 kartu memakai ikon abu-abu, bukan foto. Ganti dengan foto teknisi/pekerjaan.
- [ ] **Foto toko** — `assets/uploads/store-front.jpg`, `store-front-wide.jpg`, `store-interior.jpg`: pastikan foto asli toko, bukan placeholder.
- [ ] **Foto kulkas yang masih ikon** — produk kulkas tanpa foto (ascasca, GEA, Hisense, Polytron PRB-217/219/237, Sharp SJ-195 / SJ-316 MN-HS / SJ-571, Toshiba).
- [ ] **Kalimat "contoh produk"** — `produk/index.html`, `index.html` baris ~157 dan ~447, `syarat-layanan.html` baris ~36: teks "contoh/ilustratif" boleh tetap, tapi cek apakah masih sesuai setelah katalog final.
- [ ] **Harga tes di database** — bersihkan sebelum tayang: MIDEA MSFT-05CRN8 (Rp 1.000.000), Sharp SJ-236MN-HS (Rp 1.111.111), dan harga bulat di Midea MSCE (1.000.000 / 1.250.000 / 1.500.000). Kartu produk dan hero menampilkannya sebagai harga asli.
- [ ] **Slot mesin cuci di hero** — setelah produk mesin cuci pertama dimasukkan, salin satu kartu `pick` di `index.html` (bagian "Paling sering ditanyakan") dan isi foto, nama, model, serta `data-hero-page`.
- [ ] **LG P1500RT dan P1800RT disembunyikan** (`published: false`) — P1500RT: spek di data 10 kg padahal namanya 15 kg, belum ada foto; P1800RT: belum diisi. Isi lalu aktifkan, atau hapus. P1700RT: spek lengkap, foto memakai foto P1400RT.
- [ ] **Mesin cuci tanpa foto/spek** — Sanken QW-S102GS, QW-S105DDSL (garansi belum diisi); Sharp Megamouth (ES-M7000P / ES-M8000P); Toshiba AW-M801AN; Aqua, Electrolux, Samsung, LG T2108NBTM. Isi atau sembunyikan.
- [ ] **Angka mesin cuci dari penjual (bertanda "±")** — Samsung 80H4000SW (daya cuci ± 330 W, spin ± 240 W), LG T2108NBTM (daya cuci ± 200 W), Toshiba AW-M801AN (berat ± 32 / 35 kg) berasal dari listing penjual, bukan situs resmi. Cek di label unit/dus, lalu hapus tanda "±". Berat Sharp Megamouth (28/31 dan 30/35 kg) juga dari ringkasan, bukan dari halaman Sharp.
- [ ] **TV: data yang perlu dicek ke unit/dus** — UA65DU8000KXXD (refresh rate: situs Samsung 50 Hz, Tokopedia 100 Hz; data ikut Samsung), 65NU855BPSA (dimensi dan berat identik dengan 65QNED70BSA, data dari situs LG Filipina), PLD 43CV8869 (jumlah HDMI 2 atau 3; dimensi tidak diisi). TCL 50S5K: data dari listing Tokopedia (mirip datasheet TCL); berat dengan kaki 7,2 dan tanpa kaki 7,3 kg tertukar di sumber (ditulis ± 7,2 - 7,3 kg); garansi, jumlah HDMI, USB, dan foto belum ada. TCL 32V51C: data dari listing Tokopedia (angka bertanda "±"); lama garansi panel tidak jelas (listing: "warranty panel + 1 year service & sparepart", plus klaim 10 tahun screen burning), cek ke distributor TCL; gambar layar di foto bertuliskan "Android TV" padahal OS-nya Google TV. Xiaomi A32 dan A43: garansi "1 Tahun Sparepart + 3 Tahun Panel" (A32 dari banner toko resmi Xiaomi: panel 36 bulan, suku cadang 12 bulan; A43 mengikuti A32), cek ke distributor. Listing Shopee A43 menulis 12 bulan garansi produsen. TCL 65P6L datanya dari Ruparupa (halaman TCL Indonesia 404), angka bertanda "±" (refresh rate, daya suara, HDMI, USB, konsumsi daya); dimensi, berat, Wi-Fi, Bluetooth, dan tuner belum diisi. Baris Garansi TV belum diisi untuk semua TV.
- [ ] **Harga asli** — langkah terakhir sebelum tayang; isi semua produk sekaligus supaya daftar konsisten.
- [ ] **Harga "Cek harga via WA"** — semua produk masih tanpa harga; putuskan apakah harga ditampilkan saat tayang.
- [ ] **Harga Jasa Pasang AC** — `pasang-ac.html` (`ITEMS`, `PIPE_PRICE`, `PAKET_PRICE` masih `null`).

## B. Identitas toko (samakan dengan Google Maps)

Dari Maps: **23 Elektronik**, Jalan Dewi Sartika No.90, Cipayung, Kec. Ciputat, Kota Tangerang Selatan, Banten 15411, buka setiap hari 08.00–21.00.

- [ ] **Nama**: diputuskan "23 Electronic" (situs sudah memakainya). Ubah nama bisnis di Google Maps dari "23 Elektronik" menjadi "23 Electronic" supaya sama. Kata umum "elektronik" ("Toko Elektronik di Ciputat", "TV & Elektronik") sengaja tetap memakai K karena itu kata yang dicari orang di Google.
- [ ] **Alamat lengkap** di footer/top bar/kontak/schema: sekarang "Jl. Dewi Sartika, Ciputat" atau "Cipayung / Ciputat" (tanpa No.90, kota, kode pos). Lokasi: `assets/partials.js` baris ~21, ~110, ~252; `kontak-lokasi.html` baris ~45; `index.html` baris ~344; `area-layanan/ciputat.html`; halaman tentang.
- [ ] **Jam buka**: sudah cocok (08.00–21.00, Senin–Minggu).
- [ ] **Nomor telepon** di Maps = nomor di situs (`628111523239`)?
- [ ] **Tautan Maps** di `partials.js` (`share.google/...`) masih benar.
- [ ] **Judul halaman dan teks** memakai kata "toko elektronik Ciputat", "jual AC Ciputat" (target pencarian).

## C. Teknis

- [ ] Domain dibeli (23electronic.com) dan diarahkan ke hosting; pertimbangkan `23elektronik.com` sebagai pengarah.
- [ ] **Endpoint pelacakan** di `partials.js` masih `http://<host>:8082/api/track` — harus diganti ke alamat server asli (HTTPS).
- [ ] **Panel admin** dipasang di subdomain (admin.23electronic.com) di balik login/Cloudflare Access; jangan buka tanpa login.
- [ ] Setelah tayang: daftar Google Search Console, kirim sitemap, cek halaman terindeks.
- [ ] Backup: commit dan push ke GitHub (pekerjaan hari ini belum di-commit pada 20 Nov 2026).
- [ ] Uji di HP: beranda, halaman AC (filter), halaman produk (chip varian), tombol WhatsApp.
