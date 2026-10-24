# BereSKS 🎓

> **Aplikasi Pengatur Jadwal & Pelacak Tugas Kuliah — *Offline-First*, Cepat, dan Intuitif untuk Mahasiswa.**

BereSKS adalah Progressive Web App (PWA) modern yang dirancang khusus untuk mempermudah kehidupan akademik mahasiswa. Aplikasi ini bekerja 100% secara lokal (*offline-first*) di dalam browser tanpa ketergantungan server eksternal, menjamin privasi data sepenuhnya, serta memberikan pengalaman pengguna yang mulus layaknya aplikasi *native* dengan panduan visual **Material Design 3 (M3)**.

---

## 📑 Daftar Isi

- [BereSKS 🎓](#beresks-)
  - [📑 Daftar Isi](#-daftar-isi)
  - [✨ Fitur Utama](#-fitur-utama)
  - [🛠️ Tech Stack](#️-tech-stack)
  - [📁 Struktur Proyek](#-struktur-proyek)
  - [🚀 Panduan Instalasi \& Memulai](#-panduan-instalasi--memulai)
    - [Prasyarat](#prasyarat)
    - [Langkah Instalasi](#langkah-instalasi)
  - [📜 Skrip yang Tersedia](#-skrip-yang-tersedia)
  - [💡 Panduan Fitur Khusus](#-panduan-fitur-khusus)
    - [1. Smart Quick Add (Bahasa Alami)](#1-smart-quick-add-bahasa-alami)
    - [2. Ekspor Kalender (.ics)](#2-ekspor-kalender-ics)
    - [3. Cadangan \& Pemulihan Data (Backup JSON)](#3-cadangan--pemulihan-data-backup-json)
  - [🏛️ Arsitektur \& Desain](#️-arsitektur--desain)
    - [Data Layer \& Reaktivitas](#data-layer--reaktivitas)
    - [Desain Responsif (Adaptive Layout)](#desain-responsif-adaptive-layout)
    - [Optimasi PWA \& Kinerja Ikon](#optimasi-pwa--kinerja-ikon)
  - [🧪 Pengujian \& Kualitas Kode](#-pengujian--kualitas-kode)
  - [📄 Lisensi](#-lisensi)

---

## ✨ Fitur Utama

- 🕒 **Dashboard Hari Ini (Real-Time Tracker)**
  - Kartu sesi kelas yang sedang berlangsung atau akan segera dimulai dengan status waktu dinamis (*live countdown*).
  - Tinjauan jadwal perkuliahan lengkap hari ini (jam, ruangan, dosen, tipe teori/praktikum).
  - Daftar tugas mendesak dengan indikator tenggat waktu dan label keterlambatan (*overdue*).

- 🗓️ **Jadwal Perkuliahan Mingguan**
  - Tampilan jadwal terstruktur per hari (Senin sampai Minggu).
  - Penambahan sesi berulang dengan informasi jam mulai-selesai, jenis kelas, dan ruangan kelas.

- 📚 **Manajemen Mata Kuliah & SKS**
  - Pengelompokan mata kuliah berbasis semester aktif.
  - Detail komprehensif: nama, kode matkul, beban SKS, dosen pengampu, catatan khusus, serta penanda warna unik untuk tiap mata kuliah.
  - Halaman detail mata kuliah yang mengintegrasikan riwayat sesi perkuliahan dan tugas terkait.

- ✅ **Pelacak Tugas Kuliah (Task Tracker)**
  - Pengelolaan status tugas: *Belum*, *Dikerjakan*, dan *Selesai*.
  - Indikator tugas prioritas, label kustom, dan tenggat waktu bawaan (pukul 23:59).
  - Aksi instan selesaikan tugas yang dilengkapi fitur **Urungkan (Undo)** selama 6 detik via Snackbar.

- ⚡ **Smart Quick Add (Input Berbasis Bahasa Alami)**
  - Menambah tugas secara ekspres melalui Bottom Sheet global.
  - Otomatis mengekstrak tanggal tenggat dari teks berbahasa Indonesia seperti `"hari ini"`, `"besok"`, `"lusa"`, `"minggu depan"`, atau nama-nama hari (`"senin"`, `"jumat"`, dsb.).

- 📅 **Ekspor Kalender (.ics)**
  - Menghasilkan berkas kalender standar `.ics` yang mencakup seluruh jadwal kuliah berulang satu semester dan tugas-tugas aktif.
  - Dapat langsung diimpor ke Google Calendar, Apple Calendar, Microsoft Outlook, atau aplikasi kalender ponsel lainnya.

- 💾 **Cadangan & Pemulihan Mandiri (Backup & Restore)**
  - Ekspor seluruh basis data ke dalam berkas JSON terstruktur.
  - Pemulihan data instan dengan validasi skema menyeluruh untuk mencegah korupsi data.

- 📱 **Progressive Web App (PWA) & Offline-First**
  - Fungsionalitas 100% tanpa jaringan internet; data tersimpan aman di IndexedDB perangkat pengguna.
  - Dapat diinstal di beranda ponsel (Android / iOS) atau di desktop (Chrome / Edge / Safari).
  - Dilengkapi *Haptic Feedback* pada perangkat mobile untuk interaksi yang taktil dan responsif.

- 🎨 **Material Design 3 & Tema Otomatis**
  - Mengimplementasikan sistem token M3 (`--md-sys-*`) berbasis palet warna *Deep Teal* (`#1F6F5F`).
  - Mendukung tema Gelap (*Dark Mode*), Terang (*Light Mode*), atau otomatis mengikuti pengaturan sistem operasi.

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
| :--- | :--- |
| **Framework & Bahasa** | [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/) |
| **Bundler & Build Tool** | [Vite 8](https://vite.dev/) |
| **PWA & Offline Storage** | [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) (Workbox), [Dexie.js 4](https://dexie.com/) (IndexedDB) + `dexie-react-hooks` |
| **Desain & Komponen UI** | [Material Design 3 (M3)](https://m3.material.io/), `@material/material-color-utilities`, Plus Jakarta Sans Font |
| **Ikonografi** | `@material-symbols/svg-400` (SVG *tree-shaken* untuk efisiensi precache PWA) |
| **Animasi & Interaksi** | [Motion](https://motion.dev/) (Framer Motion 14), [Vaul](https://vaul.emilkowal.ski/) (Drawer / Bottom Sheet) |
| **State Management** | [Zustand 5](https://zustand.docs.pmnd.rs/) |
| **Routing** | [React Router 8](https://reactrouter.com/) |
| **Manipulasi Waktu** | [date-fns 4](https://date-fns.org/) |
| **Pengujian & Linting** | [Vitest 5](https://vitest.dev/), [Oxlint](https://oxc.rs/), `fake-indexeddb` |

---

## 📁 Struktur Proyek

```text
kuliahan/
├── public/                 # Aset statis PWA (ikon, manifest, logo)
├── docs/                   # Dokumentasi teknis & catatan arsitektur
│   └── DECISIONS.md        # Catatan keputusan desain & implementasi
├── scripts/                # Skrip otomatisasi build & generator
│   ├── gen-theme.ts        # Generator token tema CSS M3
│   ├── build-icons.cjs     # Pembangun kamus SVG ikon Material Symbols
│   └── make-icons.cjs      # Utilitas pembuatan aset gambar PWA
├── src/
│   ├── assets/             # Gambar & vektor lokal
│   ├── data/               # Basis data IndexedDB & Abstraksi Repositori
│   │   ├── db.ts           # Definisi skema tabel Dexie.js (KuliahKuDB_v2)
│   │   └── repo/           # DAO & hooks reaktif (matkul, sesi, tugas, semester, pengaturan)
│   ├── features/           # Modul fitur mandiri
│   │   ├── backup/         # Logika ekspor & pemulihan berkas backup JSON
│   │   ├── ics/            # Generator berkas kalender .ics (iCalendar)
│   │   ├── jadwal/         # Logika perhitungan sesi aktif & hitung mundur
│   │   └── quick-add/      # NLP parser bahasa alami & Quick Add Sheet
│   ├── lib/                # Utilitas sistem (haptic, pemformat tanggal, palet warna)
│   ├── screens/            # Halaman / rute aplikasi
│   │   ├── HariIni.tsx     # Dashboard harian & pelacak sesi aktif
│   │   ├── Jadwal.tsx      # Manajemen jadwal kelas mingguan
│   │   ├── MataKuliah.tsx  # Daftar mata kuliah per semester
│   │   ├── DetailMataKuliah.tsx # Rincian sesi dan tugas suatu mata kuliah
│   │   ├── Tugas.tsx       # Manajemen & filter daftar tugas
│   │   ├── Pengaturan.tsx  # Preferensi tema, semester, backup, & ekspor ICS
│   │   └── Onboarding.tsx  # Panduan inisialisasi semester pertama kali
│   ├── types/              # Definisi tipe global TypeScript
│   ├── ui/                 # Komponen antarmuka kustom bergaya Material 3
│   │   ├── layout/         # Layout wrapper (Screen, Header, Section, EmptyState, dll.)
│   │   ├── Button.tsx      # M3 Buttons (filled, tonal, outlined, text)
│   │   ├── Card.tsx        # M3 Cards (elevated, filled, outlined)
│   │   ├── NavigationBar.tsx # Navigasi bawah untuk layar mobile (<840px)
│   │   ├── NavigationRail.tsx# Navigasi samping vertikal untuk desktop (>=840px)
│   │   └── ...             # Fab, BottomSheet, Dialog, TextField, Select, Tabs, dll.
│   ├── App.tsx             # Root container, router, dan resolusi FAB kontekstual
│   ├── main.tsx            # Entry point aplikasi React
│   ├── theme.css           # Variabel token warna & tipografi M3
│   └── global.css          # Reset CSS & styling global
├── package.json            # Konfigurasi dependensi dan skrip proyek
├── tsconfig.json           # Konfigurasi TypeScript
└── vite.config.ts          # Konfigurasi bundler Vite & plugin PWA
```

---

## 🚀 Panduan Instalasi & Memulai

### Prasyarat

Pastikan lingkungan lokal Anda telah terpasang:
- **Node.js**: Versi `18.x` atau lebih baru (`20.x` / `22.x` direkomendasikan).
- **npm**, **pnpm**, atau **yarn**.

### Langkah Instalasi

1. **Clone repositori ini**:
   ```bash
   git clone <URL_REPOSITORY_ANDA>
   cd kuliahan
   ```

2. **Pasang seluruh dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan server pengembangan (Dev Server)**:
   ```bash
   npm run dev
   ```
   Buka peramban pada alamat `http://localhost:5173` untuk melihat aplikasi berjalan.

4. **Kompilasi untuk Lingkungan Produksi**:
   ```bash
   npm run build
   ```
   Hasil berkas siap rilis akan berada pada direktori `dist/`.

5. **Pratinjau Hasil Rilis Produksi**:
   ```bash
   npm run preview
   ```

---

## 📜 Skrip yang Tersedia

Di dalam `package.json`, Anda dapat menjalankan perintah-perintah berikut:

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan Vite development server dengan *Hot Module Replacement* (HMR). |
| `npm run build` | Menjalankan pengecekan tipe TypeScript (`tsc -b`) kemudian mem-bundle aplikasi via Vite. |
| `npm run test` | Menjalankan suite pengujian unit & integrasi menggunakan **Vitest**. |
| `npm run lint` | Memeriksa kepatuhan kode dan potensi bug secara kilat dengan **Oxlint**. |
| `npm run preview` | Menjalankan HTTP server lokal untuk menguji build produksi dari direktori `dist/`. |

---

## 💡 Panduan Fitur Khusus

### 1. Smart Quick Add (Bahasa Alami)
Anda dapat menekan tombol tambah tugas cepat (FAB) kapan saja. Masukkan judul tugas bersama kata kunci waktu dalam bahasa Indonesia, dan sistem akan mengonversinya secara otomatis menjadi tanggal tenggat (dengan jam default 23:59):

| Contoh Input Teks | Hasil Judul | Tenggat Waktu |
| :--- | :--- | :--- |
| `"Laporan Praktikum Fisika besok"` | `Laporan Praktikum Fisika` | Besok, pukul 23:59 |
| `"Kuis Algoritma lusa"` | `Kuis Algoritma` | 2 hari ke depan, pukul 23:59 |
| `"Tugas Makalah Pancasila hari ini"` | `Tugas Makalah Pancasila` | Hari ini, pukul 23:59 |
| `"Revisi Bab 2 minggu depan"` | `Revisi Bab 2` | 7 hari ke depan, pukul 23:59 |
| `"Tugas Mandiri jumat"` | `Tugas Mandiri` | Hari Jumat mendatang, pukul 23:59 |

### 2. Ekspor Kalender (.ics)
- Masuk ke menu **Pengaturan** (`/pengaturan`).
- Di bagian **Sinkronisasi Kalender**, klik tombol **Ekspor Jadwal & Tugas (.ics)**.
- Berkas `.ics` akan otomatis diunduh dan dapat diimpor langsung ke Google Calendar, Outlook, atau Apple Calendar. Sesi perkuliahan diekspor sebagai acara berulang mingguan sampai semester berakhir, lengkap dengan pengingat otomatis 2 jam sebelum sesi.

### 3. Cadangan & Pemulihan Data (Backup JSON)
- **Ekspor Cadangan**: Unduh cadangan lengkap yang mencakup daftar semester, seluruh mata kuliah, jadwal sesi, tugas, dan preferensi pengguna dalam berkas `beresks_backup.json`.
- **Pulihkan Cadangan**: Unggah berkas JSON cadangan yang pernah dibuat. Sistem akan memvalidasi skema data secara ketat sebelum menimpa database lokal untuk memastikan integritas data.

---

## 🏛️ Arsitektur & Desain

### Data Layer & Reaktivitas
- Menggunakan basis data browser **Dexie.js (IndexedDB)** melalui database `KuliahKuDB_v2`.
- Dilengkapi mekanisme *auto-recovery* pada fungsi `pastikanDatabaseTerbuka()` untuk menangani benturan skema lama atau `UpgradeError`.
- Seluruh antarmuka menggunakan reaktivitas berbasis *Dexie live queries* (`useLiveQuery` via `dexie-react-hooks`), sehingga setiap perubahan data langsung merender ulang komponen tanpa perlu *polling* atau manipulasi state manual yang redundan.

### Desain Responsif (Adaptive Layout)
- **Ponsel (< 840px)**: Menggunakan navigasi bawah *NavigationBar* bergaya M3 dan *Floating Action Button* (Extended FAB) yang mudah dijangkau satu tangan.
- **Tablet & Desktop (>= 840px)**: Otomatis bertransformasi menggunakan *NavigationRail* vertikal di sisi kiri layar untuk memaksimalkan ruang pandang horisontal.
- **Safe Area Insets**: Mendukung `viewport-fit=cover` untuk perangkat dengan notch layar (seperti iPhone atau ponsel modern).

### Optimasi PWA & Kinerja Ikon
- Alih-alih memuat seluruh font ikon Material Symbols webfont berukuran 5.4MB, proyek ini menggunakan modul kustom berbasis SVG path (`@material-symbols/svg-400`). Hal ini mengurangi ukuran unduhan awal hingga drastis dan mempercepat precaching PWA saat aplikasi pertama kali dipasang.

---

## 🧪 Pengujian & Kualitas Kode

BereSKS dilengkapi dengan pengujian unit komprehensif untuk memastikan keandalan fungsi:

- **Pengujian Database & Repository**: Menggunakan `fake-indexeddb` untuk memvalidasi operasi CRUD pada IndexedDB.
- **Pengujian Parser Bahasa Alami**: Memastikan ekstraksi tanggal pada modul Quick Add akurat pada berbagai variasi kalimat.
- **Pengujian Sesi & Jadwal**: Memverifikasi logika deteksi sesi kuliah aktif, hitung mundur menit, dan jadwal mendatang.
- **Pengujian Komponen UI**: Pengujian rendering komponen Material 3.

Jalankan suite tes lengkap dengan:
```bash
npm run test
```

---

## 📄 Lisensi

Proyek ini dikembangkan secara independen untuk keperluan akademik dan perkuliahan. Didistribusikan di bawah lisensi terbuka atau sesuai kebijakan pengembang.
