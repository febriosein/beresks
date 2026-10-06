import { useLiveQuery } from 'dexie-react-hooks';
import { db, pastikanPenyimpananAman, pastikanDatabaseTerbuka, type Tugas, type StatusTugas } from '../db.js';

export async function ambilSemuaTugas(matkulId?: number): Promise<Tugas[]> {
  await pastikanDatabaseTerbuka();
  if (matkulId !== undefined) {
    return db.tugas.where('matkulId').equals(matkulId).toArray();
  }
  return db.tugas.toArray();
}

export async function ambilTugasById(id: number): Promise<Tugas | undefined> {
  await pastikanDatabaseTerbuka();
  return db.tugas.get(id);
}

export async function tambahTugas(data: Omit<Tugas, 'id' | 'dibuatPada'>): Promise<number> {
  await pastikanDatabaseTerbuka();
  const tugasBaru: Tugas = {
    ...data,
    dibuatPada: Date.now(),
    selesaiPada: data.status === 'selesai' ? Date.now() : undefined,
  };
  const id = await db.tugas.add(tugasBaru);
  // Persist storage per spec F0/F4
  pastikanPenyimpananAman().catch(() => {});
  return id as number;
}

export async function ubahTugas(id: number, data: Partial<Tugas>): Promise<void> {
  const updateData: Partial<Tugas> = { ...data };
  if (data.status === 'selesai' && !data.selesaiPada) {
    updateData.selesaiPada = Date.now();
  } else if (data.status && data.status !== 'selesai') {
    updateData.selesaiPada = undefined;
  }
  await db.tugas.update(id, updateData);
}

export async function ubahStatusTugas(id: number, status: StatusTugas): Promise<void> {
  await db.tugas.update(id, {
    status,
    selesaiPada: status === 'selesai' ? Date.now() : undefined,
  });
}

export async function hapusTugas(id: number): Promise<void> {
  await db.tugas.delete(id);
}

export function useDaftarTugas(matkulId?: number): Tugas[] | undefined {
  return useLiveQuery(() => {
    if (matkulId !== undefined) {
      return db.tugas.where('matkulId').equals(matkulId).toArray();
    }
    return db.tugas.toArray();
  }, [matkulId]);
}

export function useTugas(id?: number): Tugas | undefined {
  return useLiveQuery(() => {
    if (id === undefined) return undefined;
    return db.tugas.get(id);
  }, [id]);
}

export function useTugasMendesak(limit = 5): Tugas[] | undefined {
  return useLiveQuery(async () => {
    const semua = await db.tugas.filter((t) => t.status !== 'selesai').toArray();
    
    // Urutkan: terlambat duluan, lalu tenggat terdekat
    const diurutkan = semua.sort((a, b) => {
      if (a.tenggat === null && b.tenggat === null) return 0;
      if (a.tenggat === null) return 1;
      if (b.tenggat === null) return -1;
      return a.tenggat - b.tenggat;
    });

    return diurutkan.slice(0, limit);
  }, [limit]);
}
