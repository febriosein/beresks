import { addDays, getISODay } from 'date-fns';
import { setAkhirHari } from '../../lib/tanggal.js';

export interface ParseQuickAddResult {
  judul: string;
  tenggat?: number;
}

const HARI_MAP: Record<string, number> = {
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
  "jum'at": 5,
  sabtu: 6,
  minggu: 7,
};

/**
 * Mem-parse teks tugas untuk mengekstrak tenggat alami (hari ini, besok, lusa, nama hari, minggu depan).
 * Menghasilkan judul bersih dan tenggat dalam epoch ms.
 */
export function parseQuickAdd(teks: string, sekarang: Date = new Date()): ParseQuickAddResult {
  const teksTrimmed = teks.trim();
  if (!teksTrimmed) {
    return { judul: '' };
  }

  // Pola pencarian dengan urutan spesifik (frasa lebih panjang dicek terlebih dahulu)
  const polaList: Array<{
    regex: RegExp;
    hitungTenggat: () => Date;
  }> = [
    {
      regex: /\b(hari\s+ini)\b/i,
      hitungTenggat: () => setAkhirHari(sekarang),
    },
    {
      regex: /\b(minggu\s+depan)\b/i,
      hitungTenggat: () => setAkhirHari(addDays(sekarang, 7)),
    },
    {
      regex: /\b(besok)\b/i,
      hitungTenggat: () => setAkhirHari(addDays(sekarang, 1)),
    },
    {
      regex: /\b(lusa)\b/i,
      hitungTenggat: () => setAkhirHari(addDays(sekarang, 2)),
    },
  ];

  // Cek frasa waktu umum
  for (const item of polaList) {
    const match = teksTrimmed.match(item.regex);
    if (match) {
      const judulDibersihkan = teksTrimmed
        .replace(item.regex, '')
        .replace(/\s+/g, ' ')
        .trim();
      return {
        judul: judulDibersihkan || teksTrimmed,
        tenggat: item.hitungTenggat().getTime(),
      };
    }
  }

  // Cek nama hari (senin..minggu, termasuk jum'at)
  const regexHari = /\b(senin|selasa|rabu|kamis|jum['']?at|sabtu|minggu)\b/i;
  const matchHari = teksTrimmed.match(regexHari);
  if (matchHari) {
    const kataKunci = matchHari[1].toLowerCase().replace("'", '').replace('’', '');
    const targetHariIndex = kataKunci === 'jumat' ? 5 : HARI_MAP[kataKunci];

    if (targetHariIndex) {
      const currentHari = getISODay(sekarang); // 1 = Senin ... 7 = Minggu
      let daysToAdd = (targetHariIndex - currentHari + 7) % 7;
      // Per aturan: nama hari = kemunculan berikutnya setelah hari ini (bukan hari ini sendiri)
      if (daysToAdd === 0) {
        daysToAdd = 7;
      }

      const targetDate = setAkhirHari(addDays(sekarang, daysToAdd));
      const judulDibersihkan = teksTrimmed
        .replace(regexHari, '')
        .replace(/\s+/g, ' ')
        .trim();

      return {
        judul: judulDibersihkan || teksTrimmed,
        tenggat: targetDate.getTime(),
      };
    }
  }

  // Tidak ditemukan kata tenggat
  return {
    judul: teksTrimmed,
  };
}
