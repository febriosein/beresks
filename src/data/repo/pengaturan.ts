import { useLiveQuery } from 'dexie-react-hooks';
import { db, pastikanDatabaseTerbuka, type Pengaturan } from '../db.js';

const PENGATURAN_DEFAULT: Pengaturan = {
  id: 1,
  tema: 'sistem',
  waktuPengingatDefault: '08:00',
  hariAwalMinggu: 1,
};

export async function ambilPengaturan(): Promise<Pengaturan> {
  await pastikanDatabaseTerbuka();
  const ada = await db.pengaturan.get(1);
  if (!ada) {
    await db.pengaturan.put(PENGATURAN_DEFAULT);
    return PENGATURAN_DEFAULT;
  }
  return ada;
}

export async function simpanPengaturan(data: Partial<Omit<Pengaturan, 'id'>>): Promise<void> {
  const current = await ambilPengaturan();
  await db.pengaturan.put({
    ...current,
    ...data,
    id: 1,
  });
}

export function usePengaturan(): Pengaturan {
  const data = useLiveQuery(async () => {
    return ambilPengaturan();
  }, []);

  return data ?? PENGATURAN_DEFAULT;
}
