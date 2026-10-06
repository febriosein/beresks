import { create } from 'zustand';
import type { Tugas } from '../../data/db.js';

export type TugasSheetMode = 'tambah' | 'ubah';

interface QuickAddStore {
  isOpen: boolean;
  mode: TugasSheetMode;
  editTugasId?: number;
  preselectedMatkulId?: number;
  draftJudul: string;
  draftCatatan: string;
  draftPrioritas: boolean;
  draftTenggat: number | null;
  openQuickAdd: (matkulId?: number) => void;
  openEditTugas: (tugas: Tugas) => void;
  closeQuickAdd: () => void;
  setDraft: (data: Partial<{
    draftJudul: string;
    draftCatatan: string;
    draftPrioritas: boolean;
    draftTenggat: number | null;
  }>) => void;
  resetDraft: () => void;
}

export const useQuickAddStore = create<QuickAddStore>((set) => ({
  isOpen: false,
  mode: 'tambah',
  editTugasId: undefined,
  preselectedMatkulId: undefined,
  draftJudul: '',
  draftCatatan: '',
  draftPrioritas: false,
  draftTenggat: null,
  openQuickAdd: (matkulId) =>
    set({
      isOpen: true,
      mode: 'tambah',
      editTugasId: undefined,
      preselectedMatkulId: matkulId,
      draftJudul: '',
      draftCatatan: '',
      draftPrioritas: false,
      draftTenggat: null,
    }),
  openEditTugas: (tugas) =>
    set({
      isOpen: true,
      mode: 'ubah',
      editTugasId: tugas.id,
      preselectedMatkulId: tugas.matkulId,
      draftJudul: tugas.judul,
      draftCatatan: tugas.catatan || '',
      draftPrioritas: tugas.prioritas,
      draftTenggat: tugas.tenggat,
    }),
  closeQuickAdd: () =>
    set({
      isOpen: false,
      editTugasId: undefined,
      mode: 'tambah',
    }),
  setDraft: (data) => set(data),
  resetDraft: () =>
    set({
      mode: 'tambah',
      editTugasId: undefined,
      draftJudul: '',
      draftCatatan: '',
      draftPrioritas: false,
      draftTenggat: null,
      preselectedMatkulId: undefined,
    }),
}));
