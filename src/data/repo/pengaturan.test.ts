import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { db } from '../db.js';
import { ambilPengaturan, simpanPengaturan } from './pengaturan.js';

describe('pengaturanRepo theme support', () => {
  beforeEach(async () => {
    await db.pengaturan.clear();
  });

  it('returns default pengaturan with sistem tema', async () => {
    const config = await ambilPengaturan();
    expect(config.tema).toBe('sistem');
  });

  it('updates and persists theme setting to gelap or terang', async () => {
    await simpanPengaturan({ tema: 'gelap' });
    let config = await ambilPengaturan();
    expect(config.tema).toBe('gelap');

    await simpanPengaturan({ tema: 'terang' });
    config = await ambilPengaturan();
    expect(config.tema).toBe('terang');
  });
});
