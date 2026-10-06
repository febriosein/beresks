import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from './db.js';
import {
  tambahSemester,
  ambilSemesterAktif,
  ambilSemuaSemester,
  aktifkanSemester,
  hapusSemester,
} from './repo/semester.js';
import { tambahMatkul, ambilSemuaMatkul } from './repo/matkul.js';
import { tambahTugas, ambilSemuaTugas, ubahStatusTugas } from './repo/tugas.js';

describe('Dexie Repositories', () => {
  beforeEach(async () => {
    await db.semester.clear();
    await db.mataKuliah.clear();
    await db.sesiKelas.clear();
    await db.tugas.clear();
  });

  it('memastikan hanya satu semester aktif', async () => {
    const s1 = await tambahSemester({
      nama: 'Semester Ganjil 2026/2027',
      tanggalMulai: Date.now(),
      tanggalSelesai: Date.now() + 10000000,
      aktif: true,
    });

    const s2 = await tambahSemester({
      nama: 'Semester Genap 2026/2027',
      tanggalMulai: Date.now(),
      tanggalSelesai: Date.now() + 10000000,
      aktif: true,
    });

    const aktif = await ambilSemesterAktif();
    expect(aktif?.id).toBe(s2);

    const semua = await ambilSemuaSemester();
    const aktifCount = semua.filter((s) => s.aktif).length;
    expect(aktifCount).toBe(1);

    await aktifkanSemester(s1);
    const aktifBaru = await ambilSemesterAktif();
    expect(aktifBaru?.id).toBe(s1);
  });

  it('bisa menambah dan mengelola tugas', async () => {
    const semId = await tambahSemester({
      nama: 'Semester 3',
      tanggalMulai: Date.now(),
      tanggalSelesai: Date.now() + 10000000,
      aktif: true,
    });

    const matkulId = await tambahMatkul({
      semesterId: semId,
      nama: 'Basis Data',
      kode: 'IF123',
      sks: 3,
      warna: 'var(--kk-matkul-1)',
    });

    const tugasId = await tambahTugas({
      matkulId,
      judul: 'Tugas ERD',
      tenggat: Date.now() + 86400000,
      status: 'belum',
      prioritas: false,
    });

    const daftar = await ambilSemuaTugas(matkulId);
    expect(daftar.length).toBe(1);
    expect(daftar[0].judul).toBe('Tugas ERD');
    expect(daftar[0].status).toBe('belum');

    await ubahStatusTugas(tugasId, 'selesai');
    const updated = await ambilSemuaTugas(matkulId);
    expect(updated[0].status).toBe('selesai');
    expect(updated[0].selesaiPada).toBeDefined();
  });

  it('menghapus semester juga menghapus matkul dan tugas terkait', async () => {
    const semId = await tambahSemester({
      nama: 'Semester 1',
      tanggalMulai: Date.now(),
      tanggalSelesai: Date.now() + 10000000,
      aktif: true,
    });

    const mId = await tambahMatkul({
      semesterId: semId,
      nama: 'Algoritma',
      warna: 'var(--kk-matkul-2)',
    });

    await tambahTugas({
      matkulId: mId,
      judul: 'Tugas Flowchart',
      tenggat: null,
      status: 'belum',
      prioritas: false,
    });

    await hapusSemester(semId);

    const sList = await ambilSemuaSemester();
    expect(sList.length).toBe(0);

    const mList = await ambilSemuaMatkul(semId);
    expect(mList.length).toBe(0);

    const tList = await ambilSemuaTugas(mId);
    expect(tList.length).toBe(0);
  });

  it('bisa menambahkan mata kuliah dengan semua atribut lengkap', async () => {
    const semId = await tambahSemester({
      nama: 'Semester 2',
      tanggalMulai: Date.now(),
      tanggalSelesai: Date.now() + 10000000,
      aktif: true,
    });

    const matkulId = await tambahMatkul({
      semesterId: semId,
      nama: 'Sistem Operasi',
      kode: 'IF202',
      sks: 3,
      dosen: 'Dr. John Doe',
      ruangDefault: 'Gedung C R.101',
      warna: 'var(--kk-matkul-3)',
    });

    const daftar = await ambilSemuaMatkul(semId);
    expect(daftar.length).toBe(1);
    expect(daftar[0].id).toBe(matkulId);
    expect(daftar[0].nama).toBe('Sistem Operasi');
    expect(daftar[0].kode).toBe('IF202');
    expect(daftar[0].sks).toBe(3);
    expect(daftar[0].dosen).toBe('Dr. John Doe');
    expect(daftar[0].ruangDefault).toBe('Gedung C R.101');
    expect(daftar[0].warna).toBe('var(--kk-matkul-3)');
  });
});
