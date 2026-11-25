# Foto produk 23 Electronic

Semua bahan untuk membuat foto produk (template + logo merek + foto mentah) ada di folder ini,
jadi di komputer lain tidak perlu mengunduh ulang.

- `template.png` — template 740 x 740 (logo 23 Electronic, bingkai biru, "100% ORI / Pengiriman Cepat / Garansi Resmi")
- `logos/` — logo merek: AQUA, Daikin, Gree, LG, Midea, Mitsubishi Heavy, Panasonic, Polytron, Samsung, Sharp, TCL
  (Xiaomi, Coocaa, Advance, dll. belum ada logonya; fotonya dibuat tanpa logo)
- `raw/` — foto mentah TV yang dipakai (nama = merek-model)
- `arsip-kiriman/` — semua gambar yang pernah dikirim ke Claude di sesi pembuatan katalog
  (foto produk, screenshot spesifikasi, logo). Nomor file = urutan kirim. Boleh dihapus kalau sudah tidak perlu.
- `foto-produk.cjs` — skrip pembuat foto

## Cara pakai

Dari folder utama proyek (`npm install` dulu):

```
node tools/foto-produk/foto-produk.cjs <id-produk> <foto-mentah> <left,top,width,height>
```

- `<id-produk>` = nama file JSON di `content/products/` tanpa `.json`, mis. `tv-tcl-50s5k`
- `<foto-mentah>` = nama file di `raw/` (atau path lengkap)
- `left,top,width,height` = kotak potongan TV di foto mentah (piksel)
- opsional argumen ke-4: kotak watermark yang dikaburkan

Hasil: `produk-<id>-1.png` ditulis ke `mockup/toko-23/assets/uploads/` dan `public/assets/uploads/`,
`photo`/`photos` di JSON produk diisi otomatis, preview di `tools/foto-produk/preview/`.
Logo dipilih dari kata pertama judul produk (mis. "TCL 50S5K" -> `tcl`). Setelah itu jalankan
`node scripts/import-mockup.mjs` lalu `npm run build`.
