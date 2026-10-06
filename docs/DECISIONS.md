# Catatan Keputusan Desain dan Implementasi KuliahKu

- 2026-10-06: Font utama menggunakan Plus Jakarta Sans (`@fontsource/plus-jakarta-sans`) sesuai preferensi pengguna.
- 2026-10-06: Palet warna sumber tema menggunakan key color `#1F6F5F` (deep teal) dengan aksen `#2FA084` dan `#6FCF97` serta surface light `#EEEEEE` sesuai pilihan pengguna, dikonversi menggunakan `@material/material-color-utilities` ke token M3 `--md-sys-*`.
- 2026-10-06: Router menggunakan `react-router` v8 SPA client-side routing.
- 2026-10-06: Jam tenggat bawaan adalah pukul 23:59 waktu lokal.
- 2026-10-06: Batas toleransi "baru berlangsung" untuk deteksi otomatis mata kuliah sesi aktif adalah <= 30 menit setelah sesi berakhir.
- 2026-10-06: Durasi snackbar Urungkan diatur ke 6000 ms (6 detik).
- 2026-10-06: Ruangan disimpan per sesi (`SesiKelas.ruang`), dan opsi `MataKuliah.ruangDefault` digunakan sebagai nilai bawaan saat membuat sesi baru.
- 2026-10-06: Pola kampus minggu ganjil/genap tidak didukung pada MVP (di luar cakupan).
- 2026-10-06: Mode tema terang dan gelap otomatis mengikuti prefers-color-scheme sistem operasi tanpa toggle manual di MVP.
- 2026-10-06: Mengganti font ikon woff2 berukuran 5.4MB dengan SVG path per ikon via @material-symbols/svg-400 sesuai klausul Section 6.4 untuk efisiensi precache PWA dan performa loading instan.
- 2026-10-06: Komponen M3 NavigationBar diimplementasikan di `src/ui/NavigationBar.tsx` menggunakan token `--md-sys-*` untuk memastikan kompatibilitas penuh dan reliabilitas kontrol tab.
