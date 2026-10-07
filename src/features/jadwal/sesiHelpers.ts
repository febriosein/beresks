import { addDays, getISODay } from 'date-fns';
import { type SesiKelas } from '../../data/db.js';
import { setAkhirHari } from '../../lib/tanggal.js';

export type { SesiKelas };

export function parseWaktuKeMenit(waktuStr: string): number {
  const [jam, menit] = waktuStr.split(':').map(Number);
  return (jam || 0) * 60 + (menit || 0);
}

export interface InfoSesiAktif {
  sesi: SesiKelas;
  status: 'berlangsung' | 'baru_selesai';
}

/**
 * Mencari sesi kelas aktif untuk hari ini.
 *
 * Aturan penentuan:
 * 1. PRIORITAS UTAMA: Sesi yang BENAR-BENAR sedang berlangsung saat ini (mulai <= menitSekarang < selesai).
 *    Jika ada bentrok waktu, prioritaskan sesi yang paling baru dimulai.
 * 2. TOLERANSI 10 MENIT: Jika tidak ada sesi yang sedang berlangsung, DAN tidak ada kelas lain
 *    yang tersisa hari ini (kelas terakhir hari ini), terapkan toleransi 10 menit setelah selesai
 *    agar pengguna sempat mencatat tugas sebelum kartu berganti.
 */
export function cariSesiAktifHariIni(
  daftarSesi: SesiKelas[],
  sekarang: Date = new Date()
): InfoSesiAktif | undefined {
  const hariSekarang = getISODay(sekarang) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();

  // Ambil sesi hari ini dan urutkan berdasarkan jam mulai
  const sesiHariIni = daftarSesi
    .filter((s) => s.hari === hariSekarang)
    .sort((a, b) => parseWaktuKeMenit(a.jamMulai) - parseWaktuKeMenit(b.jamMulai));

  if (sesiHariIni.length === 0) return undefined;

  // 1. Cek sesi yang sedang berlangsung (mulai <= menitSekarang < selesai)
  const sesiBerlangsung = sesiHariIni.filter((sesi) => {
    const mulai = parseWaktuKeMenit(sesi.jamMulai);
    const selesai = parseWaktuKeMenit(sesi.jamSelesai);
    return menitSekarang >= mulai && menitSekarang < selesai;
  });

  if (sesiBerlangsung.length > 0) {
    // Jika ada lebih dari satu sesi aktif bersamaan (bentrok jadwal),
    // pilih sesi yang jam mulainya paling baru
    const terpilih = sesiBerlangsung.sort(
      (a, b) => parseWaktuKeMenit(b.jamMulai) - parseWaktuKeMenit(a.jamMulai)
    )[0];
    return { sesi: terpilih, status: 'berlangsung' };
  }

  // 2. Jika tidak ada sesi yang sedang berlangsung, cek apakah masih ada kelas berikutnya hari ini
  const adaSesiBerikutnyaHariIni = sesiHariIni.some((sesi) => {
    const mulai = parseWaktuKeMenit(sesi.jamMulai);
    return mulai > menitSekarang;
  });

  // Jika TIDAK ada kelas lagi hari ini (kelas terakhir sudah selesai):
  // Terapkan toleransi 10 menit setelah jam selesai kelas terakhir
  if (!adaSesiBerikutnyaHariIni) {
    const sesiTerakhir = sesiHariIni[sesiHariIni.length - 1];
    const selesaiTerakhir = parseWaktuKeMenit(sesiTerakhir.jamSelesai);

    if (menitSekarang >= selesaiTerakhir && menitSekarang <= selesaiTerakhir + 10) {
      return { sesi: sesiTerakhir, status: 'baru_selesai' };
    }
  }

  return undefined;
}

/**
 * Kompatibilitas mundur: mengembalikan sesi yang sedang berlangsung murni,
 * atau baru berakhir jika itu sesi terakhir hari ini.
 */
export function cariSesiSedangBerlangsungAtauBaruBerakhir(
  daftarSesi: SesiKelas[],
  sekarang: Date = new Date()
): SesiKelas | undefined {
  const aktif = cariSesiAktifHariIni(daftarSesi, sekarang);
  return aktif?.sesi;
}

/**
 * Mencari sesi kelas berikutnya hari ini atau di masa mendatang.
 */
export function cariSesiBerikutnya(
  daftarSesi: SesiKelas[],
  sekarang: Date = new Date()
): { sesi: SesiKelas; tanggalMs: number; hariSama: boolean } | undefined {
  if (daftarSesi.length === 0) return undefined;

  const hariSekarang = getISODay(sekarang) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();

  let kandidatTerbaik: {
    sesi: SesiKelas;
    tanggalMs: number;
    selisihMenit: number;
    hariSama: boolean;
  } | null = null;

  for (const sesi of daftarSesi) {
    const mulai = parseWaktuKeMenit(sesi.jamMulai);
    let selisihHari = (sesi.hari - hariSekarang + 7) % 7;
    let isHariSama = false;

    // Jika hari ini tapi jam mulainya sudah lewat
    if (selisihHari === 0 && mulai <= menitSekarang) {
      selisihHari = 7;
    } else if (selisihHari === 0) {
      isHariSama = true;
    }

    const selisihMenitTotal = selisihHari * 24 * 60 + (mulai - menitSekarang);

    const tanggalTarget = new Date(sekarang);
    tanggalTarget.setDate(tanggalTarget.getDate() + selisihHari);
    tanggalTarget.setHours(Math.floor(mulai / 60), mulai % 60, 0, 0);

    if (!kandidatTerbaik || selisihMenitTotal < kandidatTerbaik.selisihMenit) {
      kandidatTerbaik = {
        sesi,
        tanggalMs: tanggalTarget.getTime(),
        selisihMenit: selisihMenitTotal,
        hariSama: isHariSama,
      };
    }
  }

  return kandidatTerbaik
    ? {
        sesi: kandidatTerbaik.sesi,
        tanggalMs: kandidatTerbaik.tanggalMs,
        hariSama: kandidatTerbaik.hariSama,
      }
    : undefined;
}

/**
 * Mencari tanggal pertemuan berikutnya untuk suatu mata kuliah (tenggat pertemuan berikutnya).
 */
export function cariTenggatPertemuanBerikutnya(
  daftarSesiMatkul: SesiKelas[],
  sekarang: Date = new Date()
): number | null {
  if (daftarSesiMatkul.length === 0) return null;

  const hariSekarang = getISODay(sekarang) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();

  let selisihHariTerkecil = Infinity;

  for (const sesi of daftarSesiMatkul) {
    let selisih = (sesi.hari - hariSekarang + 7) % 7;
    const mulai = parseWaktuKeMenit(sesi.jamMulai);
    if (selisih === 0 && mulai <= menitSekarang) {
      selisih = 7;
    } else if (selisih === 0) {
      // Masih hari ini tapi belum mulai, dianggap pertemuan berikutnya
      selisih = 0;
    }

    if (selisih < selisihHariTerkecil) {
      selisihHariTerkecil = selisih;
    }
  }

  if (selisihHariTerkecil === Infinity) return null;

  const targetDate = addDays(sekarang, selisihHariTerkecil);
  return setAkhirHari(targetDate).getTime();
}

/**
 * Memeriksa apakah ada bentrok waktu antara dua sesi di hari yang sama.
 */
export function apakahSesiBentrok(sesiA: SesiKelas, sesiB: SesiKelas): boolean {
  if (sesiA.hari !== sesiB.hari) return false;
  const mulaiA = parseWaktuKeMenit(sesiA.jamMulai);
  const selesaiA = parseWaktuKeMenit(sesiA.jamSelesai);
  const mulaiB = parseWaktuKeMenit(sesiB.jamMulai);
  const selesaiB = parseWaktuKeMenit(sesiB.jamSelesai);

  return Math.max(mulaiA, mulaiB) < Math.min(selesaiA, selesaiB);
}
