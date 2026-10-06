import { useState, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { isToday, isThisWeek, addDays } from 'date-fns';
import {
  Card,
  ChipSet,
  FilterChip,
  IconButton,
  Icon,
  Dialog,
  Button,
  showSnackbar,
} from '../ui/index.js';
import {
  useDaftarTugas,
  useDaftarMatkul,
  useSemesterAktif,
  ubahStatusTugas,
  ubahTugas,
  hapusTugas,
  tambahTugas,
  type Tugas as TugasType,
  type MataKuliah as MataKuliahType,
} from '../data/repo/index.js';
import { useQuickAddStore } from '../features/quick-add/useQuickAddStore.js';
import { formatTenggat, apakahTerlambat, apakahMendesak, setAkhirHari } from '../lib/tanggal.js';

interface ItemTugasProps {
  tugas: TugasType;
  matkul?: MataKuliahType;
  onToggleSelesai: (tugas: TugasType) => void;
  onHapus: (tugas: TugasType) => void;
  onBukaDialogTenggat: (tugas: TugasType) => void;
  shouldReduceMotion: boolean | null;
}

function ItemTugas({
  tugas,
  matkul,
  onToggleSelesai,
  onHapus,
  onBukaDialogTenggat,
  shouldReduceMotion,
}: ItemTugasProps) {
  const isSelesai = tugas.status === 'selesai';
  const terlambat = apakahTerlambat(tugas.tenggat, tugas.status);
  const mendesak = apakahMendesak(tugas.tenggat, tugas.status);

  const pressTimer = useRef<any>(null);

  const handlePointerDown = () => {
    pressTimer.current = setTimeout(() => {
      onBukaDialogTenggat(tugas);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
    }, 500);
  };

  const handlePointerUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 'var(--md-sys-shape-corner-medium, 12px)',
        overflow: 'hidden',
        backgroundColor: 'var(--md-sys-color-surface-container)',
      }}
    >
      {/* Background saat geser kanan (Selesai - Hijau) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          backgroundColor: 'var(--kk-status-selesai-container)',
          color: 'var(--kk-status-on-selesai-container)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <Icon name="check_circle" size="24px" color="var(--kk-status-selesai)" />
          <span>Selesai</span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 'bold',
            color: 'var(--kk-status-terlambat)',
          }}
        >
          <span>Hapus</span>
          <Icon name="delete" size="24px" color="var(--kk-status-terlambat)" />
        </div>
      </div>

      {/* Kartu Geser Motion */}
      <motion.div
        drag={shouldReduceMotion ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        onDragEnd={(_e, info) => {
          if (info.offset.x > 80) {
            onToggleSelesai(tugas);
          } else if (info.offset.x < -80) {
            onHapus(tugas);
          }
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          position: 'relative',
          backgroundColor: 'var(--md-sys-color-surface-container-low)',
          borderLeft: `5px solid ${matkul?.warna || 'var(--md-sys-color-primary)'}`,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          opacity: isSelesai ? 0.6 : 1,
          touchAction: 'pan-y',
          cursor: 'grab',
        }}
      >
        {/* Centang Status */}
        <button
          type="button"
          aria-label={isSelesai ? 'Tandai belum selesai' : 'Tandai selesai'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelesai(tugas);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Icon
            name={isSelesai ? 'check_circle' : 'radio_button_unchecked'}
            color={isSelesai ? 'var(--kk-status-selesai)' : 'var(--md-sys-color-outline)'}
            size="24px"
          />
        </button>

        {/* Konten Judul & Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {tugas.prioritas && (
              <span style={{ color: 'var(--kk-status-mendesak)', fontSize: '14px' }}>★</span>
            )}
            <span
              className="typescale-body-large"
              style={{
                textDecoration: isSelesai ? 'line-through' : 'none',
                fontWeight: tugas.prioritas ? 'bold' : 'normal',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {tugas.judul}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '2px',
            }}
          >
            <span
              className="typescale-label-small"
              style={{
                color: matkul?.warna || 'var(--md-sys-color-on-surface-variant)',
                fontWeight: 'bold',
              }}
            >
              {matkul?.nama || 'Mata Kuliah'}
            </span>

            {tugas.catatan && (
              <span
                className="typescale-body-small"
                style={{
                  color: 'var(--md-sys-color-on-surface-variant)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '160px',
                }}
              >
                · {tugas.catatan}
              </span>
            )}
          </div>
        </div>

        {/* Status Visual Tenggat */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {tugas.tenggat && (
            <span
              className="typescale-label-small"
              style={{
                color: terlambat
                  ? 'var(--kk-status-terlambat)'
                  : mendesak
                  ? 'var(--kk-status-mendesak)'
                  : isSelesai
                  ? 'var(--md-sys-color-on-surface-variant)'
                  : 'var(--md-sys-color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: terlambat || mendesak ? 'bold' : 'normal',
                backgroundColor: terlambat
                  ? 'var(--kk-status-terlambat-container)'
                  : mendesak
                  ? 'var(--kk-status-mendesak-container)'
                  : 'transparent',
                padding: terlambat || mendesak ? '2px 6px' : '0',
                borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
              }}
            >
              {terlambat && <Icon name="warning" size="14px" />}
              {mendesak && !terlambat && <Icon name="schedule" size="14px" />}
              {formatTenggat(tugas.tenggat)}
            </span>
          )}

          <IconButton
            icon="delete"
            ariaLabel="Hapus Tugas"
            onClick={(e) => {
              e.stopPropagation();
              onHapus(tugas);
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

export function Tugas() {
  const semesterAktif = useSemesterAktif();
  const daftarMatkul = useDaftarMatkul(semesterAktif?.id) || [];
  const daftarTugas = useDaftarTugas() || [];
  const { openQuickAdd } = useQuickAddStore();

  const shouldReduceMotion = useReducedMotion();

  // Filter Mata Kuliah
  const [filterMatkulId, setFilterMatkulId] = useState<number | null>(null);

  // Dialog Ubah Tenggat Cepat (Long Press)
  const [dialogTenggatOpen, setDialogTenggatOpen] = useState(false);
  const [targetTugas, setTargetTugas] = useState<TugasType | null>(null);

  // Filter berdasarkan mata kuliah
  const tugasTerfilter = filterMatkulId
    ? daftarTugas.filter((t) => t.matkulId === filterMatkulId)
    : daftarTugas;

  // Pengelompokan: Terlambat, Hari Ini, Minggu Ini, Nanti, Selesai
  const tugasTerlambat: TugasType[] = [];
  const tugasHariIni: TugasType[] = [];
  const tugasMingguIni: TugasType[] = [];
  const tugasNanti: TugasType[] = [];
  const tugasSelesai: TugasType[] = [];

  for (const t of tugasTerfilter) {
    if (t.status === 'selesai') {
      tugasSelesai.push(t);
    } else if (apakahTerlambat(t.tenggat, t.status)) {
      tugasTerlambat.push(t);
    } else if (t.tenggat && isToday(new Date(t.tenggat))) {
      tugasHariIni.push(t);
    } else if (t.tenggat && isThisWeek(new Date(t.tenggat), { weekStartsOn: 1 })) {
      tugasMingguIni.push(t);
    } else {
      tugasNanti.push(t);
    }
  }

  // Aksi toggle selesai
  const toggleSelesai = async (tugas: TugasType) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
    const statusBaru = tugas.status === 'selesai' ? 'belum' : 'selesai';
    await ubahStatusTugas(tugas.id!, statusBaru);

    showSnackbar({
      message: statusBaru === 'selesai' ? 'Tugas diselesaikan' : 'Tugas belum selesai',
      actionLabel: 'Urungkan',
      duration: 6000,
      onAction: async () => {
        await ubahStatusTugas(tugas.id!, tugas.status);
      },
    });
  };

  // Aksi hapus
  const handleHapusTugas = async (tugas: TugasType) => {
    const backup = { ...tugas };
    delete backup.id;
    await hapusTugas(tugas.id!);

    showSnackbar({
      message: 'Tugas dihapus',
      actionLabel: 'Urungkan',
      duration: 6000,
      onAction: async () => {
        await tambahTugas(backup);
      },
    });
  };

  // Aksi ubah tenggat cepat
  const ubahTenggatCepat = async (ms: number | null) => {
    if (!targetTugas?.id) return;
    const oldTenggat = targetTugas.tenggat;
    await ubahTugas(targetTugas.id, { tenggat: ms });
    setDialogTenggatOpen(false);

    showSnackbar({
      message: 'Tenggat diperbarui',
      actionLabel: 'Urungkan',
      duration: 6000,
      onAction: async () => {
        await ubahTugas(targetTugas.id!, { tenggat: oldTenggat });
      },
    });
  };

  const renderGrup = (judul: string, icon: string, items: TugasType[], colorToken?: string) => {
    if (items.length === 0) return null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: colorToken || 'var(--md-sys-color-on-surface-variant)',
            marginTop: '8px',
          }}
        >
          <Icon name={icon} size="18px" />
          <h2
            className="typescale-title-small"
            style={{ margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}
          >
            {judul} ({items.length})
          </h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((t) => (
            <ItemTugas
              key={t.id}
              tugas={t}
              matkul={daftarMatkul.find((m) => m.id === t.matkulId)}
              onToggleSelesai={toggleSelesai}
              onHapus={handleHapusTugas}
              onBukaDialogTenggat={(selected) => {
                setTargetTugas(selected);
                setDialogTenggatOpen(true);
              }}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth: '640px',
        margin: '0 auto',
        width: '100%',
        padding: '16px',
        paddingBottom: 'calc(130px + env(safe-area-inset-bottom, 0px))',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          gap: '12px',
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <h1 className="typescale-headline-small" style={{ margin: 0 }}>
            Daftar Tugas
          </h1>
          <p
            className="typescale-body-small"
            style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}
          >
            {tugasTerfilter.filter((t) => t.status !== 'selesai').length} tugas perlu diselesaikan
          </p>
        </div>

        <Button
          variant="filled"
          icon="add"
          disabled={daftarMatkul.length === 0}
          onClick={() => openQuickAdd(filterMatkulId || undefined)}
          style={{
            padding: '8px 16px',
            fontSize: 'var(--md-sys-typescale-label-large-size, 14px)',
            fontWeight: 700,
            borderRadius: 'var(--md-sys-shape-corner-medium, 16px)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Tugas Baru
        </Button>
      </div>

      {/* Filter Mata Kuliah */}
      {daftarMatkul.length > 0 && (
        <div style={{ marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          <ChipSet>
            <FilterChip
              label="Semua Matkul"
              selected={filterMatkulId === null}
              onClick={() => setFilterMatkulId(null)}
            />
            {daftarMatkul.map((m) => (
              <FilterChip
                key={m.id}
                label={m.nama}
                selected={filterMatkulId === m.id}
                onClick={() => setFilterMatkulId(m.id === filterMatkulId ? null : m.id!)}
              />
            ))}
          </ChipSet>
        </div>
      )}

      {/* Daftar Tugas per Kelompok */}
      {daftarTugas.length === 0 ? (
        <Card variant="outlined" style={{ textAlign: 'center', padding: '36px 16px' }}>
          <Icon name="assignment_add" size="48px" color="var(--md-sys-color-primary)" />
          <h2 className="typescale-title-medium" style={{ margin: '12px 0 4px 0' }}>
            Belum ada tugas tercatat
          </h2>
          <p
            className="typescale-body-medium"
            style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '16px' }}
          >
            Tekan tombol Tugas Baru untuk mencatat tugas pertamamu.
          </p>
          <Button
            variant="filled"
            icon="add"
            disabled={daftarMatkul.length === 0}
            onClick={() => openQuickAdd()}
          >
            Catat Tugas Sekarang
          </Button>
        </Card>
      ) : tugasTerfilter.length === 0 ? (
        <Card variant="outlined" style={{ textAlign: 'center', padding: '32px 16px' }}>
          <Icon name="filter_list_off" size="40px" color="var(--md-sys-color-outline)" />
          <p
            className="typescale-body-medium"
            style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '8px' }}
          >
            Tidak ada tugas untuk mata kuliah ini.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {renderGrup('Terlambat', 'warning', tugasTerlambat, 'var(--kk-status-terlambat)')}
          {renderGrup('Hari Ini', 'today', tugasHariIni, 'var(--kk-status-mendesak)')}
          {renderGrup('Minggu Ini', 'date_range', tugasMingguIni)}
          {renderGrup('Nanti', 'schedule', tugasNanti)}
          {renderGrup('Selesai', 'check_circle', tugasSelesai, 'var(--kk-status-selesai)')}
        </div>
      )}

      {/* Dialog Ubah Tenggat Cepat (Long Press) */}
      <Dialog
        open={dialogTenggatOpen}
        onClose={() => setDialogTenggatOpen(false)}
        headline="Ubah Tenggat Cepat"
        icon="schedule"
        actions={
          <Button variant="text" onClick={() => setDialogTenggatOpen(false)}>
            Batal
          </Button>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px' }}>
          <p className="typescale-body-medium" style={{ margin: '0 0 8px 0' }}>
            Tugas: <strong>{targetTugas?.judul}</strong>
          </p>
          <Button
            variant="outlined"
            onClick={() => ubahTenggatCepat(setAkhirHari(new Date()).getTime())}
          >
            Hari Ini (23:59)
          </Button>
          <Button
            variant="outlined"
            onClick={() => ubahTenggatCepat(setAkhirHari(addDays(new Date(), 1)).getTime())}
          >
            Besok (23:59)
          </Button>
          <Button
            variant="outlined"
            onClick={() => ubahTenggatCepat(setAkhirHari(addDays(new Date(), 7)).getTime())}
          >
            Minggu Depan (23:59)
          </Button>
          <Button variant="text" onClick={() => ubahTenggatCepat(null)}>
            Hapus Tenggat Waktu
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
