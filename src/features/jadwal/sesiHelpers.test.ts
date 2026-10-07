import { describe, it, expect } from 'vitest';
import {
  parseWaktuKeMenit,
  cariSesiAktifHariIni,
  cariSesiBerikutnya,
  type SesiKelas,
} from './sesiHelpers.js';

describe('sesiHelpers', () => {
  // Simulasi sesi hari Rabu (hari = 3) sesuai data user:
  // 1. Proyek Sistem Multimedia: 08:00 - 09:00
  // 2. Sistem Digital: 10:30 - 13:00
  // 3. Pancasila: 13:00 - 14:40
  const daftarSesiUji: SesiKelas[] = [
    {
      id: 1,
      matkulId: 101,
      hari: 3,
      jamMulai: '08:00',
      jamSelesai: '09:00',
      tipe: 'praktikum',
      ruang: 'LAB CITRA',
    },
    {
      id: 2,
      matkulId: 102,
      hari: 3,
      jamMulai: '10:30',
      jamSelesai: '13:00',
      tipe: 'teori',
      ruang: 'GB V RK3.01',
    },
    {
      id: 3,
      matkulId: 103,
      hari: 3,
      jamMulai: '13:00',
      jamSelesai: '14:40',
      tipe: 'teori',
      ruang: 'GB V RK3.05',
    },
    // Sesi Kamis (hari = 4)
    {
      id: 4,
      matkulId: 104,
      hari: 4,
      jamMulai: '08:00',
      jamSelesai: '09:40',
      tipe: 'teori',
      ruang: 'R.302',
    },
  ];

  // Fungsi pembantu membuat objek Date di hari Rabu (7 Okt 2026)
  const buatWaktuRabu = (jam: number, menit: number): Date => {
    const d = new Date(2026, 9, 7, jam, menit, 0, 0); // 7 Okt 2026 = Rabu
    return d;
  };

  it('parseWaktuKeMenit mengonversi format jam:menit dengan benar', () => {
    expect(parseWaktuKeMenit('08:00')).toBe(480);
    expect(parseWaktuKeMenit('10:30')).toBe(630);
    expect(parseWaktuKeMenit('13:00')).toBe(780);
    expect(parseWaktuKeMenit('13:23')).toBe(803);
    expect(parseWaktuKeMenit('14:40')).toBe(880);
  });

  it('jam 13:23: memilih Pancasila (13:00-14:40) sebagai sesi aktif, bukan Sistem Digital', () => {
    const waktu1323 = buatWaktuRabu(13, 23);
    const hasil = cariSesiAktifHariIni(daftarSesiUji, waktu1323);

    expect(hasil).toBeDefined();
    expect(hasil?.sesi.id).toBe(3); // Pancasila
    expect(hasil?.sesi.jamMulai).toBe('13:00');
    expect(hasil?.status).toBe('berlangsung');
  });

  it('jam 13:00 tepat: langsung berpindah ke Pancasila (13:00-14:40)', () => {
    const waktu1300 = buatWaktuRabu(13, 0);
    const hasil = cariSesiAktifHariIni(daftarSesiUji, waktu1300);

    expect(hasil).toBeDefined();
    expect(hasil?.sesi.id).toBe(3); // Pancasila
    expect(hasil?.status).toBe('berlangsung');
  });

  it('jam 12:59: masih memilih Sistem Digital (10:30-13:00)', () => {
    const waktu1259 = buatWaktuRabu(12, 59);
    const hasil = cariSesiAktifHariIni(daftarSesiUji, waktu1259);

    expect(hasil).toBeDefined();
    expect(hasil?.sesi.id).toBe(2); // Sistem Digital
    expect(hasil?.status).toBe('berlangsung');
  });

  it('jam 09:05 (antara sesi 1 dan sesi 2): tidak ada sesi berlangsung karena ada kelas lain nanti', () => {
    const waktu0905 = buatWaktuRabu(9, 5);
    const hasil = cariSesiAktifHariIni(daftarSesiUji, waktu0905);

    expect(hasil).toBeUndefined();

    // Sesi berikutnya harus Sistem Digital (10:30) hari ini
    const berikutnya = cariSesiBerikutnya(daftarSesiUji, waktu0905);
    expect(berikutnya).toBeDefined();
    expect(berikutnya?.sesi.id).toBe(2);
    expect(berikutnya?.hariSama).toBe(true);
  });

  it('toleransi 10 menit untuk kelas terakhir hari ini: jam 14:45 (selesai 14:40)', () => {
    const waktu1445 = buatWaktuRabu(14, 45);
    const hasil = cariSesiAktifHariIni(daftarSesiUji, waktu1445);

    expect(hasil).toBeDefined();
    expect(hasil?.sesi.id).toBe(3); // Pancasila
    expect(hasil?.status).toBe('baru_selesai');
  });

  it('setelah lewat toleransi 10 menit (jam 14:51): sesi aktif bernilai undefined', () => {
    const waktu1451 = buatWaktuRabu(14, 51);
    const hasil = cariSesiAktifHariIni(daftarSesiUji, waktu1451);

    expect(hasil).toBeUndefined();

    // Sesi berikutnya berpindah ke Kamis
    const berikutnya = cariSesiBerikutnya(daftarSesiUji, waktu1451);
    expect(berikutnya).toBeDefined();
    expect(berikutnya?.sesi.id).toBe(4);
    expect(berikutnya?.hariSama).toBe(false);
  });
});
