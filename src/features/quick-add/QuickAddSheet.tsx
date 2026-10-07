import { useState, useEffect, useMemo } from 'react';
import { addDays, format } from 'date-fns';
import {
  BottomSheet,
  TextField,
  Select,
  Button,
  ChipSet,
  FilterChip,
  AssistChip,
  Checkbox,
  DateField,
  Icon,
  showSnackbar,
} from '../../ui/index.js';
import { useQuickAddStore } from './useQuickAddStore.js';
import { parseQuickAdd } from './parseQuickAdd.js';
import {
  useDaftarMatkul,
  useSemuaSesi,
  tambahTugas,
  ubahTugas,
  hapusTugas,
  ambilTugasById,
} from '../../data/repo/index.js';
import {
  cariSesiSedangBerlangsungAtauBaruBerakhir,
  cariTenggatPertemuanBerikutnya,
} from '../jadwal/sesiHelpers.js';
import { setAkhirHari, formatTenggat } from '../../lib/tanggal.js';
import { haptic } from '../../lib/haptic.js';

export function QuickAddSheet() {
  const {
    isOpen,
    mode,
    editTugasId,
    preselectedMatkulId,
    draftJudul,
    draftCatatan,
    draftPrioritas,
    draftTenggat,
    closeQuickAdd,
    setDraft,
    resetDraft,
  } = useQuickAddStore();

  const isEditMode = mode === 'ubah';

  const daftarMatkulRaw = useDaftarMatkul();
  const daftarMatkul = useMemo(() => daftarMatkulRaw || [], [daftarMatkulRaw]);
  const daftarSesiRaw = useSemuaSesi();
  const daftarSesi = useMemo(() => daftarSesiRaw || [], [daftarSesiRaw]);

  const [judul, setJudul] = useState(draftJudul);
  const [matkulId, setMatkulId] = useState<string>('');
  const [tenggat, setTenggat] = useState<number | null>(draftTenggat);
  const [tenggatManualDipilih, setTenggatManualDipilih] = useState(false);
  const [catatan, setCatatan] = useState(draftCatatan);
  const [prioritas, setPrioritas] = useState(draftPrioritas);
  const [showCatatan, setShowCatatan] = useState(Boolean(draftCatatan));
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Sinkronisasi state lokal saat sheet dibuka atau ganti mode
  useEffect(() => {
    if (!isOpen) return;

    setJudul(draftJudul);
    setCatatan(draftCatatan);
    setPrioritas(draftPrioritas);
    setTenggat(draftTenggat);
    setShowCatatan(Boolean(draftCatatan));
    setTenggatManualDipilih(isEditMode || Boolean(draftTenggat));
    setShowDatePicker(false);

    if (preselectedMatkulId) {
      setMatkulId(String(preselectedMatkulId));
    } else if (daftarMatkul.length > 0) {
      const sesiAktif = cariSesiSedangBerlangsungAtauBaruBerakhir(daftarSesi);
      if (sesiAktif && daftarMatkul.some((m) => m.id === sesiAktif.matkulId)) {
        setMatkulId(String(sesiAktif.matkulId));
      } else {
        setMatkulId(String(daftarMatkul[0].id));
      }
    }
  }, [isOpen, isEditMode, editTugasId, draftJudul, draftCatatan, draftPrioritas, draftTenggat, preselectedMatkulId, daftarMatkul, daftarSesi]);

  // Simpan draft hanya di mode tambah
  useEffect(() => {
    if (isOpen && !isEditMode) {
      setDraft({
        draftJudul: judul,
        draftCatatan: catatan,
        draftPrioritas: prioritas,
        draftTenggat: tenggat,
      });
    }
  }, [judul, catatan, prioritas, tenggat, isOpen, isEditMode, setDraft]);

  // Parsing bahasa alami untuk judul
  const parsedNL = useMemo(() => {
    if (isEditMode || !judul.trim()) return null;
    return parseQuickAdd(judul);
  }, [judul, isEditMode]);

  const handleJudulChange = (teks: string) => {
    setJudul(teks);
    if (!tenggatManualDipilih && !isEditMode) {
      const parsed = parseQuickAdd(teks);
      if (parsed.tenggat !== undefined) {
        setTenggat(parsed.tenggat);
      }
    }
  };

  // Opsi Chip Tenggat
  const sekarang = useMemo(() => new Date(), [isOpen]);
  const hariIniMs = setAkhirHari(sekarang).getTime();
  const besokMs = setAkhirHari(addDays(sekarang, 1)).getTime();
  const tigaHariMs = setAkhirHari(addDays(sekarang, 3)).getTime();
  const mingguDepanMs = setAkhirHari(addDays(sekarang, 7)).getTime();

  // Pertemuan berikutnya
  const sesiMatkulTerpilih = daftarSesi.filter((s) => s.matkulId === Number(matkulId));
  const pertemuanBerikutnyaMs = cariTenggatPertemuanBerikutnya(sesiMatkulTerpilih, sekarang);

  const handlePilihTenggatChip = (ms: number | null) => {
    setTenggatManualDipilih(true);
    setTenggat((prev) => (prev === ms ? null : ms));
  };

  // Simpan / Tambah / Ubah
  const simpan = async (tambahLagi = false) => {
    let judulBersih = judul.trim();
    let finalTenggat = tenggat;

    if (!judulBersih) {
      showSnackbar({ message: 'Judul tugas wajib diisi' });
      return;
    }

    if (!tenggatManualDipilih && !isEditMode) {
      const parsed = parseQuickAdd(judulBersih);
      if (parsed.tenggat !== undefined) {
        finalTenggat = parsed.tenggat;
        judulBersih = parsed.judul;
      }
    }

    const selectedMatkul = Number(matkulId) || (daftarMatkul[0]?.id ?? 0);
    if (!selectedMatkul) {
      showSnackbar({ message: 'Pilih mata kuliah terlebih dahulu' });
      return;
    }

    haptic('success');

    if (isEditMode && editTugasId) {
      await ubahTugas(editTugasId, {
        matkulId: selectedMatkul,
        judul: judulBersih,
        catatan: catatan.trim() || undefined,
        prioritas,
        tenggat: finalTenggat,
      });

      showSnackbar({ message: 'Perubahan tugas disimpan' });
      closeQuickAdd();
      resetDraft();
    } else {
      const createdId = await tambahTugas({
        matkulId: selectedMatkul,
        judul: judulBersih,
        catatan: catatan.trim() || undefined,
        prioritas,
        tenggat: finalTenggat,
        status: 'belum',
      });

      showSnackbar({
        message: 'Tugas dicatat 🎉',
        actionLabel: 'Urungkan',
        duration: 6000,
        onAction: async () => {
          await hapusTugas(createdId);
        },
      });

      if (tambahLagi) {
        setJudul('');
        setCatatan('');
        setPrioritas(false);
        setTenggat(null);
        setTenggatManualDipilih(false);
        setShowCatatan(false);
        setDraft({
          draftJudul: '',
          draftCatatan: '',
          draftPrioritas: false,
          draftTenggat: null,
        });
      } else {
        closeQuickAdd();
        resetDraft();
      }
    }
  };

  // Hapus tugas saat di mode ubah
  const handleHapus = async () => {
    if (!isEditMode || !editTugasId) return;

    haptic('warning');
    const existing = await ambilTugasById(editTugasId);
    await hapusTugas(editTugasId);

    closeQuickAdd();
    resetDraft();

    showSnackbar({
      message: 'Tugas dihapus',
      actionLabel: 'Urungkan',
      duration: 6000,
      onAction: async () => {
        if (existing) {
          await tambahTugas({
            matkulId: existing.matkulId,
            judul: existing.judul,
            catatan: existing.catatan,
            prioritas: existing.prioritas,
            tenggat: existing.tenggat,
            status: existing.status,
          });
        }
      },
    });
  };

  // Sticky footer buttons
  const footerContent = (
    <div
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
      }}
    >
      {isEditMode ? (
        <>
          <Button
            variant="text"
            icon="delete"
            onClick={handleHapus}
            style={{ color: 'var(--md-sys-color-error)' }}
          >
            Hapus
          </Button>
          <Button
            variant="filled"
            icon="check"
            disabled={!judul.trim() || daftarMatkul.length === 0}
            onClick={() => simpan(false)}
          >
            Simpan Perubahan
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="text"
            disabled={!judul.trim() || daftarMatkul.length === 0}
            onClick={() => simpan(true)}
          >
            Simpan & Tambah Lagi
          </Button>
          <Button
            variant="filled"
            icon="add"
            disabled={!judul.trim() || daftarMatkul.length === 0}
            onClick={() => simpan(false)}
          >
            Simpan
          </Button>
        </>
      )}
    </div>
  );

  return (
    <BottomSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeQuickAdd();
          resetDraft();
        }
      }}
      title={isEditMode ? 'Ubah Tugas' : 'Catat Tugas Baru'}
      description={isEditMode ? 'Edit detail tugas yang dipilih' : 'Catat tugas baru secepat mungkin'}
      footer={footerContent}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Input Judul Tugas */}
        <div>
          <TextField
            label="Judul Tugas"
            value={judul}
            onChange={handleJudulChange}
            placeholder="Misal: Laporan praktikum jumat"
            autoFocus={isOpen}
            required
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                simpan(false);
              }
            }}
          />

          {/* Pratinjau Deteksi Bahasa Alami */}
          {!tenggatManualDipilih && parsedNL && parsedNL.tenggat !== undefined && (
            <div
              style={{
                marginTop: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
                backgroundColor: 'var(--md-sys-color-secondary-container)',
                color: 'var(--md-sys-color-on-secondary-container)',
                fontSize: 'var(--md-sys-typescale-label-small-size, 11px)',
                fontWeight: 'bold',
              }}
            >
              <Icon name="event_upcoming" size="14px" />
              <span>Terdeteksi tenggat: {formatTenggat(parsedNL.tenggat)}</span>
            </div>
          )}
        </div>

        {/* Pilihan Mata Kuliah */}
        {daftarMatkul.length > 0 ? (
          <Select
            label="Mata Kuliah"
            value={matkulId}
            onChange={(val) => setMatkulId(val)}
            options={daftarMatkul.map((m) => ({
              value: String(m.id),
              label: m.nama,
              supportingText: m.kode ? `${m.kode} · ${m.dosen || ''}` : m.dosen,
              color: m.warna,
            }))}
          />
        ) : (
          <div
            style={{
              fontSize: 'var(--md-sys-typescale-body-small-size)',
              color: 'var(--md-sys-color-error)',
            }}
          >
            Belum ada mata kuliah. Silakan buat mata kuliah terlebih dahulu di tab Mata Kuliah.
          </div>
        )}

        {/* Chip Pilihan Tenggat Waktu */}
        <div>
          <div
            style={{
              fontSize: 'var(--md-sys-typescale-label-medium-size)',
              color: 'var(--md-sys-color-on-surface-variant)',
              marginBottom: '8px',
              fontWeight: 500,
            }}
          >
            Tenggat Waktu:
          </div>
          <ChipSet>
            <FilterChip
              label="Hari Ini"
              selected={tenggat === hariIniMs}
              onClick={() => handlePilihTenggatChip(hariIniMs)}
            />
            <FilterChip
              label="Besok"
              selected={tenggat === besokMs}
              onClick={() => handlePilihTenggatChip(besokMs)}
            />
            <FilterChip
              label="3 Hari"
              selected={tenggat === tigaHariMs}
              onClick={() => handlePilihTenggatChip(tigaHariMs)}
            />
            {pertemuanBerikutnyaMs && (
              <FilterChip
                label="Pertemuan Berikutnya"
                selected={tenggat === pertemuanBerikutnyaMs}
                onClick={() => handlePilihTenggatChip(pertemuanBerikutnyaMs)}
              />
            )}
            <FilterChip
              label="Minggu Depan"
              selected={tenggat === mingguDepanMs}
              onClick={() => handlePilihTenggatChip(mingguDepanMs)}
            />
            <AssistChip
              label={
                tenggat && ![hariIniMs, besokMs, tigaHariMs, pertemuanBerikutnyaMs, mingguDepanMs].includes(tenggat)
                  ? format(new Date(tenggat), 'd MMM yyyy')
                  : 'Pilih Tanggal'
              }
              icon="calendar_today"
              onClick={() => setShowDatePicker((v) => !v)}
            />
          </ChipSet>

          {showDatePicker && (
            <div style={{ marginTop: '12px' }}>
              <DateField
                label="Pilih Tanggal Tenggat"
                value={tenggat ? format(new Date(tenggat), 'yyyy-MM-dd') : ''}
                onChange={(val) => {
                  if (val) {
                    const [y, m, d] = val.split('-').map(Number);
                    const dt = setAkhirHari(new Date(y, m - 1, d));
                    setTenggatManualDipilih(true);
                    setTenggat(dt.getTime());
                  } else {
                    setTenggat(null);
                  }
                }}
              />
            </div>
          )}
        </div>

        {/* Opsi Tambahan: Catatan dan Penting */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {!showCatatan && (
            <Button
              variant="text"
              icon="notes"
              onClick={() => setShowCatatan(true)}
            >
              + Catatan
            </Button>
          )}

          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontFamily: 'var(--md-ref-typeface-plain)',
              fontSize: 'var(--md-sys-typescale-body-medium-size)',
              userSelect: 'none',
              minHeight: '48px',
            }}
          >
            <Checkbox
              checked={prioritas}
              onChange={(c) => setPrioritas(c)}
              ariaLabel="Tandai Penting"
            />
            <span style={{ fontWeight: 500 }}>Penting</span>
          </label>
        </div>

        {showCatatan && (
          <TextField
            label="Catatan Tambahan (Opsional)"
            value={catatan}
            onChange={setCatatan}
            placeholder="Keterangan format, link pengumpulan, instruksi dosen, dll."
            rows={2}
          />
        )}
      </div>
    </BottomSheet>
  );
}
