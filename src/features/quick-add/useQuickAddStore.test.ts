import { describe, it, expect } from 'vitest';
import { useQuickAddStore } from './useQuickAddStore.js';
import type { Tugas } from '../../data/db.js';

describe('useQuickAddStore', () => {
  it('opens in tambah mode by default', () => {
    useQuickAddStore.getState().openQuickAdd(10);
    const state = useQuickAddStore.getState();

    expect(state.isOpen).toBe(true);
    expect(state.mode).toBe('tambah');
    expect(state.editTugasId).toBeUndefined();
    expect(state.preselectedMatkulId).toBe(10);
  });

  it('opens in ubah mode with prefilled task data', () => {
    const mockTugas: Tugas = {
      id: 99,
      matkulId: 5,
      judul: 'Makalah Etika Profesi',
      catatan: 'Bab 1 dan 2',
      tenggat: 1728500000000,
      prioritas: true,
      status: 'belum',
      dibuatPada: 1728000000000,
    };

    useQuickAddStore.getState().openEditTugas(mockTugas);
    const state = useQuickAddStore.getState();

    expect(state.isOpen).toBe(true);
    expect(state.mode).toBe('ubah');
    expect(state.editTugasId).toBe(99);
    expect(state.preselectedMatkulId).toBe(5);
    expect(state.draftJudul).toBe('Makalah Etika Profesi');
    expect(state.draftCatatan).toBe('Bab 1 dan 2');
    expect(state.draftPrioritas).toBe(true);
    expect(state.draftTenggat).toBe(1728500000000);
  });

  it('resets correctly on close', () => {
    useQuickAddStore.getState().closeQuickAdd();
    const state = useQuickAddStore.getState();

    expect(state.isOpen).toBe(false);
    expect(state.mode).toBe('tambah');
    expect(state.editTugasId).toBeUndefined();
  });
});
