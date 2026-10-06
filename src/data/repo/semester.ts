import { useLiveQuery } from 'dexie-react-hooks';
import { db, pastikanDatabaseTerbuka, type Semester } from '../db.js';

export async function ambilSemuaSemester(): Promise<Semester[]> {
  await pastikanDatabaseTerbuka();
  return db.semester.toArray();
}

export async function ambilSemesterAktif(): Promise<Semester | undefined> {
  await pastikanDatabaseTerbuka();
  return db.semester.filter((s) => s.aktif).first();
}

export async function tambahSemester(data: Omit<Semester, 'id'>): Promise<number> {
  await pastikanDatabaseTerbuka();
  return db.transaction('rw', db.semester, async () => {
    if (data.aktif) {
      await db.semester.filter((s) => s.aktif).modify({ aktif: false });
    }
    const id = await db.semester.add(data as Semester);
    return id as number;
  });
}

export async function ubahSemester(id: number, data: Partial<Semester>): Promise<void> {
  await db.transaction('rw', db.semester, async () => {
    if (data.aktif) {
      await db.semester.filter((s) => s.aktif).modify({ aktif: false });
    }
    await db.semester.update(id, data);
  });
}

export async function aktifkanSemester(id: number): Promise<void> {
  await db.transaction('rw', db.semester, async () => {
    await db.semester.filter((s) => s.aktif).modify({ aktif: false });
    await db.semester.update(id, { aktif: true });
  });
}

export async function hapusSemester(id: number): Promise<void> {
  await db.transaction('rw', [db.semester, db.mataKuliah, db.sesiKelas, db.tugas], async () => {
    // Ambil semua matkul di semester ini
    const matkulList = await db.mataKuliah.where('semesterId').equals(id).toArray();
    const matkulIds = matkulList.map((m) => m.id!).filter(Boolean);

    if (matkulIds.length > 0) {
      // Hapus semua sesi kelas dan tugas dari mata kuliah tersebut
      await db.sesiKelas.where('matkulId').anyOf(matkulIds).delete();
      await db.tugas.where('matkulId').anyOf(matkulIds).delete();
      await db.mataKuliah.where('semesterId').equals(id).delete();
    }

    await db.semester.delete(id);
  });
}

export function useDaftarSemester(): Semester[] | undefined {
  return useLiveQuery(() => db.semester.toArray(), []);
}

export function useSemesterAktif(): Semester | undefined | null {
  return useLiveQuery(() => db.semester.filter((s) => s.aktif).first(), []);
}
