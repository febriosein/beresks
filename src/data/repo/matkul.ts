import { useLiveQuery } from 'dexie-react-hooks';
import { db, pastikanDatabaseTerbuka, type MataKuliah } from '../db.js';

export async function ambilSemuaMatkul(semesterId?: number): Promise<MataKuliah[]> {
  await pastikanDatabaseTerbuka();
  if (semesterId !== undefined) {
    return db.mataKuliah.where('semesterId').equals(semesterId).toArray();
  }
  return db.mataKuliah.toArray();
}

export async function ambilMatkulById(id: number): Promise<MataKuliah | undefined> {
  await pastikanDatabaseTerbuka();
  return db.mataKuliah.get(id);
}

export async function tambahMatkul(data: Omit<MataKuliah, 'id'>): Promise<number> {
  await pastikanDatabaseTerbuka();
  const id = await db.mataKuliah.add(data as MataKuliah);
  return id as number;
}

export async function ubahMatkul(id: number, data: Partial<MataKuliah>): Promise<void> {
  await db.mataKuliah.update(id, data);
}

export async function hapusMatkul(id: number): Promise<void> {
  await db.transaction('rw', [db.mataKuliah, db.sesiKelas, db.tugas], async () => {
    await db.sesiKelas.where('matkulId').equals(id).delete();
    await db.tugas.where('matkulId').equals(id).delete();
    await db.mataKuliah.delete(id);
  });
}

export function useDaftarMatkul(semesterId?: number): MataKuliah[] | undefined {
  return useLiveQuery(() => {
    if (semesterId !== undefined) {
      return db.mataKuliah.where('semesterId').equals(semesterId).toArray();
    }
    return db.mataKuliah.toArray();
  }, [semesterId]);
}

export function useMatkul(id?: number): MataKuliah | undefined {
  return useLiveQuery(() => {
    if (id === undefined) return undefined;
    return db.mataKuliah.get(id);
  }, [id]);
}
