import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../../data/db.js';
import {
  buatBackupData,
  validasiBackupData,
  pulihkanBackupData,
} from './backupRestore.js';
import { tambahSemester } from '../../data/repo/semester.js';
import { tambahMatkul } from '../../data/repo/matkul.js';
import { tambahTugas } from '../../data/repo/tugas.js';

describe('Backup and Restore (F19)', () => {
  beforeEach(async () => {
    await db.semester.clear();
    await db.mataKuliah.clear();
    await db.sesiKelas.clear();
    await db.tugas.clear();
  });

  it('validasi menolak payload yang rusak atau salah versi', () => {
    expect(validasiBackupData(null).valid).toBe(false);
    expect(validasiBackupData({}).valid).toBe(false);
    expect(validasiBackupData({ schemaVersion: 2, data: {} }).valid).toBe(false);
    expect(validasiBackupData({ schemaVersion: 1, data: { semester: 'bukan-array' } }).valid).toBe(false);
  });

  it('ekspor lalu impor menghasilkan data yang identik', async () => {
    const semId = await tambahSemester({
      nama: 'Semester 3 Ganjil',
      tanggalMulai: 1700000000000,
      tanggalSelesai: 1710000000000,
      aktif: true,
    });

    const mId = await tambahMatkul({
      semesterId: semId,
      nama: 'Kalkulus Lanjut',
      sks: 3,
      warna: 'var(--kk-matkul-1)',
    });

    await tambahTugas({
      matkulId: mId,
      judul: 'Tugas Turunan Parsial',
      tenggat: 1705000000000,
      status: 'belum',
      prioritas: true,
    });

    // 1. Buat backup
    const backup = await buatBackupData();
    expect(backup.schemaVersion).toBe(1);
    expect(backup.data.semester.length).toBe(1);
    expect(backup.data.mataKuliah.length).toBe(1);
    expect(backup.data.tugas.length).toBe(1);

    // 2. Bersihkan database sepenuhnya
    await db.semester.clear();
    await db.mataKuliah.clear();
    await db.tugas.clear();

    const semKosong = await db.semester.toArray();
    expect(semKosong.length).toBe(0);

    // 3. Validasi dan restore
    const valid = validasiBackupData(backup);
    expect(valid.valid).toBe(true);

    await pulihkanBackupData(valid.data!);

    // 4. Verifikasi data setelah restore identik
    const semRestored = await db.semester.toArray();
    const matkulRestored = await db.mataKuliah.toArray();
    const tugasRestored = await db.tugas.toArray();

    expect(semRestored.length).toBe(1);
    expect(semRestored[0].nama).toBe('Semester 3 Ganjil');
    expect(matkulRestored.length).toBe(1);
    expect(matkulRestored[0].nama).toBe('Kalkulus Lanjut');
    expect(tugasRestored.length).toBe(1);
    expect(tugasRestored[0].judul).toBe('Tugas Turunan Parsial');
  });
});
