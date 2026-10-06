import {
  format,
  formatDistanceToNowStrict,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
} from 'date-fns';
import { id } from 'date-fns/locale';

export const NAMA_HARI_MAP: Record<number, string> = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
  7: 'Minggu',
};

export function getNamaHari(hariIndex: number): string {
  return NAMA_HARI_MAP[hariIndex] || '';
}

/**
 * Format tenggat ramah pengguna: "Hari ini, 23:59", "Besok, 23:59", "Jumat, 10 Okt"
 */
export function formatTenggat(tenggatMs: number | null): string {
  if (tenggatMs === null) return 'Tanpa tenggat';
  const date = new Date(tenggatMs);

  if (isToday(date)) {
    return `Hari ini, ${format(date, 'HH:mm')}`;
  }
  if (isTomorrow(date)) {
    return `Besok, ${format(date, 'HH:mm')}`;
  }
  if (isYesterday(date)) {
    return `Kemarin, ${format(date, 'HH:mm')}`;
  }

  // Tampilkan hari dan tanggal
  return format(date, 'EEEE, d MMM · HH:mm', { locale: id });
}

export function formatTanggalLengkap(ms: number): string {
  return format(new Date(ms), 'EEEE, d MMMM yyyy', { locale: id });
}

export function formatJamMenit(ms: number): string {
  return format(new Date(ms), 'HH:mm');
}

export function formatHitungMundur(targetMs: number): string {
  return formatDistanceToNowStrict(new Date(targetMs), { locale: id, addSuffix: true });
}

export function apakahTerlambat(tenggatMs: number | null, status: string): boolean {
  if (!tenggatMs || status === 'selesai') return false;
  return isPast(new Date(tenggatMs));
}

export function apakahMendesak(tenggatMs: number | null, status: string): boolean {
  if (!tenggatMs || status === 'selesai') return false;
  const sekarang = Date.now();
  const selisih = tenggatMs - sekarang;
  // Kurang dari 24 jam dan belum lewat
  return selisih > 0 && selisih <= 24 * 60 * 60 * 1000;
}

/**
 * Mengembalikan akhir hari (23:59:59.999)
 */
export function setAkhirHari(date: Date): Date {
  return setMilliseconds(setSeconds(setMinutes(setHours(date, 23), 59), 59), 999);
}
