import { useLiveQuery } from 'dexie-react-hooks';
import { db, pastikanDatabaseTerbuka, type Pengaturan } from '../db.js';

export const PENGATURAN_DEFAULT: Pengaturan = {
  id: 1,
  tema: 'sistem',
  waktuPengingatDefault: '08:00',
  hariAwalMinggu: 1,
};

export async function ambilPengaturan(): Promise<Pengaturan> {
  await pastikanDatabaseTerbuka();
  const ada = await db.pengaturan.get(1);
  if (!ada) {
    try {
      await db.pengaturan.put(PENGATURAN_DEFAULT);
    } catch {
      // safe fallback if in a read-only transaction
    }
    return PENGATURAN_DEFAULT;
  }
  return ada;
}

export async function simpanPengaturan(data: Partial<Omit<Pengaturan, 'id'>>): Promise<void> {
  await pastikanDatabaseTerbuka();
  const current = (await db.pengaturan.get(1)) ?? PENGATURAN_DEFAULT;
  await db.pengaturan.put({
    ...current,
    ...data,
    id: 1,
  });
}

export function usePengaturan(): Pengaturan {
  const data = useLiveQuery(async () => {
    await pastikanDatabaseTerbuka();
    const item = await db.pengaturan.get(1);
    return item ?? PENGATURAN_DEFAULT;
  }, []);

  return data ?? PENGATURAN_DEFAULT;
}
