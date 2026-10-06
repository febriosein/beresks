import { db, type Semester, type MataKuliah, type SesiKelas, type Tugas, type Pengaturan } from '../../data/db.js';

export interface BackupPayload {
  schemaVersion: number;
  diekspor: number;
  data: {
    semester: Semester[];
    mataKuliah: MataKuliah[];
    sesiKelas: SesiKelas[];
    tugas: Tugas[];
    pengaturan?: Pengaturan[];
  };
}

export async function buatBackupData(): Promise<BackupPayload> {
  const [semester, mataKuliah, sesiKelas, tugas, pengaturan] = await Promise.all([
    db.semester.toArray(),
    db.mataKuliah.toArray(),
    db.sesiKelas.toArray(),
    db.tugas.toArray(),
    db.pengaturan.toArray(),
  ]);

  return {
    schemaVersion: 1,
    diekspor: Date.now(),
    data: {
      semester,
      mataKuliah,
      sesiKelas,
      tugas,
      pengaturan,
    },
  };
}

export function unduhFileBackup(backup: BackupPayload, namaFile = 'kuliahku_backup.json'): void {
  const str = JSON.stringify(backup, null, 2);
  const blob = new Blob([str], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = namaFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function validasiBackupData(obj: any): { valid: boolean; pesan?: string; data?: BackupPayload } {
  if (!obj || typeof obj !== 'object') {
    return { valid: false, pesan: 'Format file tidak valid' };
  }

  if (obj.schemaVersion !== 1) {
    return { valid: false, pesan: `Versi skema tidak didukung: ${obj.schemaVersion}` };
  }

  if (!obj.data || typeof obj.data !== 'object') {
    return { valid: false, pesan: 'Data backup tidak ditemukan' };
  }

  const { semester, mataKuliah, sesiKelas, tugas } = obj.data;
  if (!Array.isArray(semester) || !Array.isArray(mataKuliah) || !Array.isArray(sesiKelas) || !Array.isArray(tugas)) {
    return { valid: false, pesan: 'Struktur data tabel dalam file rusak atau tidak lengkap' };
  }

  return { valid: true, data: obj as BackupPayload };
}

export async function pulihkanBackupData(backup: BackupPayload): Promise<void> {
  const { semester, mataKuliah, sesiKelas, tugas, pengaturan } = backup.data;

  await db.transaction('rw', [db.semester, db.mataKuliah, db.sesiKelas, db.tugas, db.pengaturan], async () => {
    // Bersihkan tabel yang ada
    await Promise.all([
      db.semester.clear(),
      db.mataKuliah.clear(),
      db.sesiKelas.clear(),
      db.tugas.clear(),
      db.pengaturan.clear(),
    ]);

    // Masukkan data baru
    if (semester.length > 0) await db.semester.bulkAdd(semester);
    if (mataKuliah.length > 0) await db.mataKuliah.bulkAdd(mataKuliah);
    if (sesiKelas.length > 0) await db.sesiKelas.bulkAdd(sesiKelas);
    if (tugas.length > 0) await db.tugas.bulkAdd(tugas);
    if (pengaturan && pengaturan.length > 0) await db.pengaturan.bulkAdd(pengaturan);
  });
}
