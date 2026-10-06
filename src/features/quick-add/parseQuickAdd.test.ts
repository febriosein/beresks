import { describe, it, expect } from 'vitest';
import { parseQuickAdd } from './parseQuickAdd.js';
import { format } from 'date-fns';

describe('parseQuickAdd', () => {
  // Misalkan sekarang adalah hari Rabu, 14 Oktober 2026, jam 10:00:00
  const rabuSekarang = new Date(2026, 9, 14, 10, 0, 0); // Rabu (getISODay = 3)

  it('1. Mengenali "hari ini"', () => {
    const res = parseQuickAdd('baca materi hari ini', rabuSekarang);
    expect(res.judul).toBe('baca materi');
    expect(res.tenggat).toBeDefined();
    const d = new Date(res.tenggat!);
    expect(format(d, 'yyyy-MM-dd HH:mm')).toBe('2026-10-14 23:59');
  });

  it('2. Mengenali "besok"', () => {
    const res = parseQuickAdd('tugas kalkulus besok', rabuSekarang);
    expect(res.judul).toBe('tugas kalkulus');
    expect(res.tenggat).toBeDefined();
    const d = new Date(res.tenggat!);
    expect(format(d, 'yyyy-MM-dd HH:mm')).toBe('2026-10-15 23:59');
  });

  it('3. Mengenali "lusa"', () => {
    const res = parseQuickAdd('lusa presentasi pbo', rabuSekarang);
    expect(res.judul).toBe('presentasi pbo');
    expect(res.tenggat).toBeDefined();
    const d = new Date(res.tenggat!);
    expect(format(d, 'yyyy-MM-dd HH:mm')).toBe('2026-10-16 23:59');
  });

  it('4. Mengenali "minggu depan"', () => {
    const res = parseQuickAdd('kumpul essay minggu depan', rabuSekarang);
    expect(res.judul).toBe('kumpul essay');
    expect(res.tenggat).toBeDefined();
    const d = new Date(res.tenggat!);
    expect(format(d, 'yyyy-MM-dd HH:mm')).toBe('2026-10-21 23:59');
  });

  it('5. Mengenali nama hari yang akan datang di minggu yang sama (jumat)', () => {
    const res = parseQuickAdd('laporan ERD jumat', rabuSekarang);
    expect(res.judul).toBe('laporan ERD');
    expect(res.tenggat).toBeDefined();
    const d = new Date(res.tenggat!);
    expect(format(d, 'yyyy-MM-dd HH:mm')).toBe('2026-10-16 23:59');
  });

  it('6. Mengenali variasi tulisan "jum\'at"', () => {
    const res = parseQuickAdd("revisi bab 1 jum'at", rabuSekarang);
    expect(res.judul).toBe('revisi bab 1');
    expect(res.tenggat).toBeDefined();
    const d = new Date(res.tenggat!);
    expect(format(d, 'yyyy-MM-dd HH:mm')).toBe('2026-10-16 23:59');
  });

  it('7. Kasus tepi: nama hari yang SAMA dengan hari ini harus menjadi kemunculan minggu berikutnya (7 hari ke depan)', () => {
    // Sekarang Rabu, kata kunci "rabu" -> harus jatuh ke Rabu depan (+7 hari, 21 Okt)
    const res = parseQuickAdd('tugas metodologi rabu', rabuSekarang);
    expect(res.judul).toBe('tugas metodologi');
    expect(res.tenggat).toBeDefined();
    const d = new Date(res.tenggat!);
    expect(format(d, 'yyyy-MM-dd HH:mm')).toBe('2026-10-21 23:59');
  });

  it('8. Kasus tepi: nama hari yang sudah lewat di minggu ini jatuh ke minggu depan', () => {
    // Sekarang Rabu, kata kunci "senin" -> Senin depan (19 Okt)
    const res = parseQuickAdd('review jurnal senin', rabuSekarang);
    expect(res.judul).toBe('review jurnal');
    expect(res.tenggat).toBeDefined();
    const d = new Date(res.tenggat!);
    expect(format(d, 'yyyy-MM-dd HH:mm')).toBe('2026-10-19 23:59');
  });

  it('9. Kasus tepi: akhir pekan (hari Minggu)', () => {
    const mingguSekarang = new Date(2026, 9, 18, 14, 0, 0); // Minggu
    const res = parseQuickAdd('tugas riset senin', mingguSekarang);
    expect(res.judul).toBe('tugas riset');
    expect(res.tenggat).toBeDefined();
    const d = new Date(res.tenggat!);
    // Hari berikutnya adalah Senin besoknya (19 Okt)
    expect(format(d, 'yyyy-MM-dd HH:mm')).toBe('2026-10-19 23:59');
  });

  it('10. Kata tenggat di tengah kalimat', () => {
    const res = parseQuickAdd('laporan praktikum jumat harus selesai', rabuSekarang);
    expect(res.judul).toBe('laporan praktikum harus selesai');
    expect(res.tenggat).toBeDefined();
    const d = new Date(res.tenggat!);
    expect(format(d, 'yyyy-MM-dd HH:mm')).toBe('2026-10-16 23:59');
  });

  it('11. Bila tidak ada kata tenggat, judul utuh dan tenggat undefined', () => {
    const res = parseQuickAdd('baca bab 3');
    expect(res.judul).toBe('baca bab 3');
    expect(res.tenggat).toBeUndefined();
  });

  it('12. Kasus tepi: jika input HANYA kata tenggat, pertahankan judul teks asli', () => {
    const res = parseQuickAdd('besok', rabuSekarang);
    expect(res.judul).toBe('besok');
    expect(res.tenggat).toBeDefined();
  });
});
