import { useState, useEffect, useRef, useMemo } from 'react';
import { addDays, format, getISODay } from 'date-fns';
import {
  BottomSheet,
  TextField,
  Select,
  Button,
  ChipSet,
  FilterChip,
  AssistChip,
  Checkbox,
  showSnackbar,
} from '../../ui/index.js';
import { useQuickAddStore } from './useQuickAddStore.js';
import { parseQuickAdd } from './parseQuickAdd.js';
import { useDaftarMatkul, useSemuaSesi, tambahTugas, hapusTugas } from '../../data/repo/index.js';
import { cariSesiSedangBerlangsungAtauBaruBerakhir, cariTenggatPertemuanBerikutnya } from '../jadwal/sesiHelpers.js';
import { setAkhirHari } from '../../lib/tanggal.js';

export function QuickAddSheet() {
  const {
    isOpen,
    preselectedMatkulId,
    draftJudul,
    draftCatatan,
    draftPrioritas,
    draftTenggat,
    closeQuickAdd,
    setDraft,
    resetDraft,
  } = useQuickAddStore();

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

  // Simpan draft ke store setiap kali berubah
  useEffect(() => {
    if (isOpen) {
      setDraft({
        draftJudul: judul,
        draftCatatan: catatan,
        draftPrioritas: prioritas,
        draftTenggat: tenggat,
      });
    }
  }, [judul, catatan, prioritas, tenggat, isOpen, setDraft]);

  // Inisialisasi saat sheet dibuka
  useEffect(() => {
    if (!isOpen) return;

    if (preselectedMatkulId) {
      setMatkulId(String(preselectedMatkulId));
    } else if (daftarMatkul.length > 0 && !matkulId) {
      // Cek apakah ada sesi sedang berlangsung / baru selesai <= 30 menit
      const sesiAktif = cariSesiSedangBerlangsungAtauBaruBerakhir(daftarSesi);
      if (sesiAktif && daftarMatkul.some((m) => m.id === sesiAktif.matkulId)) {
        setMatkulId(String(sesiAktif.matkulId));
      } else {
        // Default ke mata kuliah pertama
        setMatkulId(String(daftarMatkul[0].id));
      }
    }
  }, [isOpen, preselectedMatkulId, daftarMatkul, daftarSesi, matkulId]);

  // Parsing natural language saat judul berubah (jika user belum memilih chip secara manual)
  const handleJudulChange = (teks: string) => {
    setJudul(teks);
    if (!tenggatManualDipilih) {
      const parsed = parseQuickAdd(teks);
      if (parsed.tenggat !== undefined) {
        setTenggat(parsed.tenggat);
      }
    }
  };

  // Pilihan chip tenggat pintar
  const sekarang = useMemo(() => new Date(), [isOpen]);
  const besokMs = setAkhirHari(addDays(sekarang, 1)).getTime();
  const mingguDepanMs = setAkhirHari(addDays(sekarang, 7)).getTime();

  // Pertemuan berikutnya
  const sesiMatkulTerpilih = daftarSesi.filter((s) => s.matkulId === Number(matkulId));
  const pertemuanBerikutnyaMs = cariTenggatPertemuanBerikutnya(sesiMatkulTerpilih, sekarang);

  // Hari pilihan (Jumat terdekat berikutnya)
  const currentDay = getISODay(sekarang);
  const daysToJumat = (5 - currentDay + 7) % 7 || 7;
  const jumatMs = setAkhirHari(addDays(sekarang, daysToJumat)).getTime();

  const handlePilihTenggatChip = (ms: number | null) => {
    setTenggatManualDipilih(true);
    setTenggat((prev) => (prev === ms ? null : ms));
  };

  // Handler simpan
  const simpan = async (tambahLagi = false) => {
    let judulBersih = judul.trim();
    let finalTenggat = tenggat;

    if (!judulBersih) return;

    // Jika user belum memilih chip manual, parse dan buang kata tenggat dari judul
    if (!tenggatManualDipilih) {
      const parsed = parseQuickAdd(judulBersih);
      if (parsed.tenggat !== undefined) {
        finalTenggat = parsed.tenggat;
        judulBersih = parsed.judul;
      }
    }

    const selectedMatkul = Number(matkulId) || (daftarMatkul[0]?.id ?? 0);
    if (!selectedMatkul) return;

    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }

    const createdId = await tambahTugas({
      matkulId: selectedMatkul,
      judul: judulBersih,
      catatan: catatan.trim() || undefined,
      prioritas,
      tenggat: finalTenggat,
      status: 'belum',
    });

    // Tampilkan snackbar urungkan
    showSnackbar({
      message: 'Tugas ditambahkan',
      actionLabel: 'Urungkan',
      duration: 6000,
      onAction: async () => {
        await hapusTugas(createdId);
      },
    });

    if (tambahLagi) {
      // Kosongkan kolom tapi pertahankan matkul
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
      resetDraft();
      closeQuickAdd();
      // Reset local state
      setJudul('');
      setCatatan('');
      setPrioritas(false);
      setTenggat(null);
      setTenggatManualDipilih(false);
      setShowCatatan(false);
    }
  };

  // Long press pada tombol simpan untuk "Simpan & tambah lagi"
  const pressTimer = useRef<any>(null);
  const handlePointerDown = () => {
    pressTimer.current = setTimeout(() => {
      simpan(true);
      pressTimer.current = null;
    }, 600);
  };
  const handlePointerUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
      simpan(false);
    }
  };

  return (
    <BottomSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeQuickAdd();
      }}
      title="Catat Tugas Baru"
      description="Catat tugas baru secepat mungkin"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Input Judul Tugas (AutoFocus) */}
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
            }))}
          />
        ) : (
          <div
            style={{
              fontSize: 'var(--md-sys-typescale-body-small-size)',
              color: 'var(--md-sys-color-error)',
            }}
          >
            Belum ada mata kuliah. Silakan buat mata kuliah terlebih dahulu.
          </div>
        )}

        {/* Chip Tenggat Pintar */}
        <div>
          <div
            style={{
              fontSize: 'var(--md-sys-typescale-label-medium-size)',
              color: 'var(--md-sys-color-on-surface-variant)',
              marginBottom: '8px',
            }}
          >
            Tenggat Waktu:
          </div>
          <ChipSet>
            <FilterChip
              label="Besok"
              selected={tenggat === besokMs}
              onClick={() => handlePilihTenggatChip(besokMs)}
            />
            {pertemuanBerikutnyaMs && (
              <FilterChip
                label="Pertemuan Berikutnya"
                selected={tenggat === pertemuanBerikutnyaMs}
                onClick={() => handlePilihTenggatChip(pertemuanBerikutnyaMs)}
              />
            )}
            <FilterChip
              label="Jumat"
              selected={tenggat === jumatMs}
              onClick={() => handlePilihTenggatChip(jumatMs)}
            />
            <FilterChip
              label="Minggu Depan"
              selected={tenggat === mingguDepanMs}
              onClick={() => handlePilihTenggatChip(mingguDepanMs)}
            />
            <AssistChip
              label={
                tenggat && ![besokMs, pertemuanBerikutnyaMs, jumatMs, mingguDepanMs].includes(tenggat)
                  ? format(new Date(tenggat), 'd MMM yyyy')
                  : 'Pilih Tanggal'
              }
              icon="calendar_today"
              onClick={() => setShowDatePicker((v) => !v)}
            />
          </ChipSet>

          {showDatePicker && (
            <div style={{ marginTop: '12px' }}>
              <input
                type="date"
                aria-label="Pilih tanggal tenggat"
                value={tenggat ? format(new Date(tenggat), 'yyyy-MM-dd') : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    const dt = setAkhirHari(new Date(y, m - 1, d));
                    setTenggatManualDipilih(true);
                    setTenggat(dt.getTime());
                  } else {
                    setTenggat(null);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
                  border: '1px solid var(--md-sys-color-outline)',
                  background: 'var(--md-sys-color-surface)',
                  color: 'var(--md-sys-color-on-surface)',
                  fontFamily: 'var(--md-ref-typeface-plain)',
                  fontSize: 'var(--md-sys-typescale-body-large-size)',
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
            }}
          >
            <Checkbox
              checked={prioritas}
              onChange={(c) => setPrioritas(c)}
              ariaLabel="Tandai Penting"
            />
            <span>Penting</span>
          </label>
        </div>

        {showCatatan && (
          <TextField
            label="Catatan Tambahan (Opsional)"
            value={catatan}
            onChange={setCatatan}
            placeholder="Keterangan format, link pengumpulan, dll."
            rows={2}
          />
        )}

        {/* Tombol Simpan */}
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Button
            variant="filled"
            icon="check"
            disabled={!judul.trim() || daftarMatkul.length === 0}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            Simpan
          </Button>
          <div
            style={{
              textAlign: 'center',
              fontSize: 'var(--md-sys-typescale-label-small-size)',
              color: 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            Tahan tombol Simpan untuk simpan & tambah lagi
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
