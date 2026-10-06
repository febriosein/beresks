import Dexie, { type EntityTable } from 'dexie';

export interface Semester {
  id?: number;
  nama: string;
  tanggalMulai: number;
  tanggalSelesai: number;
  aktif: boolean;
}

export interface MataKuliah {
  id?: number;
  semesterId: number;
  nama: string;
  kode?: string;
  sks?: number;
  dosen?: string;
  warna: string;
  ruangDefault?: string;
  catatan?: string;
}

export interface SesiKelas {
  id?: number;
  matkulId: number;
  hari: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  jamMulai: string;
  jamSelesai: string;
  ruang?: string;
  tipe: 'teori' | 'praktikum';
}

export type StatusTugas = 'belum' | 'dikerjakan' | 'selesai';

export interface Tugas {
  id?: number;
  matkulId: number;
  judul: string;
  catatan?: string;
  tenggat: number | null;
  status: StatusTugas;
  prioritas: boolean;
  label?: string[];
  dibuatPada: number;
  selesaiPada?: number;
}

export interface Pengaturan {
  id: 1;
  tema: 'sistem';
  waktuPengingatDefault: string;
  hariAwalMinggu: 1 | 7;
}

export const DATABASE_NAME = 'KuliahKuDB_v2';

export class KuliahKuDatabase extends Dexie {
  semester!: EntityTable<Semester, 'id'>;
  mataKuliah!: EntityTable<MataKuliah, 'id'>;
  sesiKelas!: EntityTable<SesiKelas, 'id'>;
  tugas!: EntityTable<Tugas, 'id'>;
  pengaturan!: EntityTable<Pengaturan, 'id'>;

  constructor() {
    super(DATABASE_NAME);
    this.version(1).stores({
      semester: '++id, aktif',
      mataKuliah: '++id, semesterId',
      sesiKelas: '++id, matkulId, hari',
      tugas: '++id, matkulId, tenggat, status',
      pengaturan: 'id',
    });
  }
}

export const db = new KuliahKuDatabase();

// Pembersihan database lama yang mengalami konflik UpgradeError di browser
if (typeof window !== 'undefined') {
  Dexie.delete('KuliahKuDB').catch(() => {});
}

/**
 * Memastikan database terbuka dan siap digunakan, dengan auto-recovery jika terjadi error schema.
 */
export async function pastikanDatabaseTerbuka(): Promise<void> {
  if (db.isOpen()) return;
  try {
    await db.open();
  } catch (err: any) {
    console.warn('Gagal membuka database, mencoba perbaikan otomatis...', err);
    if (
      err.name === 'UpgradeError' ||
      err.name === 'DatabaseClosedError' ||
      err.message?.includes('primary key') ||
      err.message?.includes('closed')
    ) {
      await Dexie.delete(DATABASE_NAME);
      await db.open();
    } else {
      throw err;
    }
  }
}

/**
 * Meminta browser menjaga agar IndexedDB tidak dihapus otomatis saat memori penuh.
 */
export async function pastikanPenyimpananAman(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      return isPersisted;
    } catch {
      return false;
    }
  }
  return false;
}
