export const DAFTAR_WARNA_MATKUL = [
  'var(--kk-matkul-1)',
  'var(--kk-matkul-2)',
  'var(--kk-matkul-3)',
  'var(--kk-matkul-4)',
  'var(--kk-matkul-5)',
  'var(--kk-matkul-6)',
  'var(--kk-matkul-7)',
  'var(--kk-matkul-8)',
  'var(--kk-matkul-9)',
  'var(--kk-matkul-10)',
];

export function dapatkanWarnaMatkulDefault(index: number): string {
  return DAFTAR_WARNA_MATKUL[index % DAFTAR_WARNA_MATKUL.length];
}
