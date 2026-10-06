import { useLiveQuery } from 'dexie-react-hooks';
import { db, pastikanDatabaseTerbuka, type SesiKelas } from '../db.js';

export async function ambilSemuaSesi(matkulId?: number): Promise<SesiKelas[]> {
  await pastikanDatabaseTerbuka();
  if (matkulId !== undefined) {
    return db.sesiKelas.where('matkulId').equals(matkulId).toArray();
  }
  return db.sesiKelas.toArray();
}

export async function ambilSesiById(id: number): Promise<SesiKelas | undefined> {
  await pastikanDatabaseTerbuka();
  return db.sesiKelas.get(id);
}

export async function tambahSesi(data: Omit<SesiKelas, 'id'>): Promise<number> {
  await pastikanDatabaseTerbuka();
  const id = await db.sesiKelas.add(data as SesiKelas);
  return id as number;
}

export async function ubahSesi(id: number, data: Partial<SesiKelas>): Promise<void> {
  await db.sesiKelas.update(id, data);
}

export async function hapusSesi(id: number): Promise<void> {
  await db.sesiKelas.delete(id);
}

export function useDaftarSesi(matkulId?: number): SesiKelas[] | undefined {
  return useLiveQuery(() => {
    if (matkulId !== undefined) {
      return db.sesiKelas.where('matkulId').equals(matkulId).toArray();
    }
    return db.sesiKelas.toArray();
  }, [matkulId]);
}

export function useSesiPerHari(hari: 1 | 2 | 3 | 4 | 5 | 6 | 7): SesiKelas[] | undefined {
  return useLiveQuery(() => {
    return db.sesiKelas.where('hari').equals(hari).toArray();
  }, [hari]);
}

export function useSemuaSesi(): SesiKelas[] | undefined {
  return useLiveQuery(() => db.sesiKelas.toArray(), []);
}
