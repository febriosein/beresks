import { create } from 'zustand';

interface QuickAddStore {
  isOpen: boolean;
  preselectedMatkulId?: number;
  draftJudul: string;
  draftCatatan: string;
  draftPrioritas: boolean;
  draftTenggat: number | null;
  openQuickAdd: (matkulId?: number) => void;
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
  preselectedMatkulId: undefined,
  draftJudul: '',
  draftCatatan: '',
  draftPrioritas: false,
  draftTenggat: null,
  openQuickAdd: (matkulId) =>
    set({
      isOpen: true,
      preselectedMatkulId: matkulId,
    }),
  closeQuickAdd: () =>
    set({
      isOpen: false,
    }),
  setDraft: (data) => set(data),
  resetDraft: () =>
    set({
      draftJudul: '',
      draftCatatan: '',
      draftPrioritas: false,
      draftTenggat: null,
      preselectedMatkulId: undefined,
    }),
}));
