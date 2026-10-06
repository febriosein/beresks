import { addDays, getISODay } from 'date-fns';
import { type SesiKelas } from '../../data/db.js';
import { setAkhirHari } from '../../lib/tanggal.js';

export function parseWaktuKeMenit(waktuStr: string): number {
  const [jam, menit] = waktuStr.split(':').map(Number);
  return (jam || 0) * 60 + (menit || 0);
}

/**
 * Mencari sesi yang sedang berlangsung atau baru berakhir (<= 30 menit).
 */
export function cariSesiSedangBerlangsungAtauBaruBerakhir(
  daftarSesi: SesiKelas[],
  sekarang: Date = new Date()
): SesiKelas | undefined {
  const hariSekarang = getISODay(sekarang) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();

  // Sesi hari ini
  const sesiHariIni = daftarSesi.filter((s) => s.hari === hariSekarang);

  for (const sesi of sesiHariIni) {
    const mulai = parseWaktuKeMenit(sesi.jamMulai);
    const selesai = parseWaktuKeMenit(sesi.jamSelesai);
    const batasAkhir = selesai + 30; // Toleransi 30 menit setelah selesai

    if (menitSekarang >= mulai && menitSekarang <= batasAkhir) {
      return sesi;
    }
  }

  return undefined;
}

/**
 * Mencari sesi kelas berikutnya hari ini atau di masa mendatang.
 */
export function cariSesiBerikutnya(
  daftarSesi: SesiKelas[],
  sekarang: Date = new Date()
): { sesi: SesiKelas; tanggalMs: number } | undefined {
  if (daftarSesi.length === 0) return undefined;

  const hariSekarang = getISODay(sekarang) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();

  let kandidatTerbaik: { sesi: SesiKelas; tanggalMs: number; selisihMenit: number } | null = null;

  for (const sesi of daftarSesi) {
    const mulai = parseWaktuKeMenit(sesi.jamMulai);
    let selisihHari = (sesi.hari - hariSekarang + 7) % 7;

    // Jika hari ini tapi jam mulainya sudah lewat
    if (selisihHari === 0 && mulai <= menitSekarang) {
      selisihHari = 7;
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
      };
    }
  }

  return kandidatTerbaik ? { sesi: kandidatTerbaik.sesi, tanggalMs: kandidatTerbaik.tanggalMs } : undefined;
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
