import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { isToday, isThisWeek } from 'date-fns';
import {
  Screen,
  ScreenHeader,
  Section,
  EmptyState,
  SkeletonCard,
  StatusPill,
  SegmentedButton,
  ChipSet,
  FilterChip,
  Icon,
  showSnackbar,
} from '../ui/index.js';
import {
  useDaftarTugas,
  useDaftarMatkul,
  useSemesterAktif,
  ubahStatusTugas,
  hapusTugas,
  tambahTugas,
  type Tugas as TugasType,
  type MataKuliah as MataKuliahType,
} from '../data/repo/index.js';
import { useQuickAddStore } from '../features/quick-add/useQuickAddStore.js';
import { formatTenggat, apakahTerlambat, apakahMendesak } from '../lib/tanggal.js';
import { haptic } from '../lib/haptic.js';

interface ItemTugasProps {
  tugas: TugasType;
  matkul?: MataKuliahType;
  onEdit: (tugas: TugasType) => void;
  onToggleSelesai: (tugas: TugasType) => void;
  onHapus: (tugas: TugasType) => void;
  shouldReduceMotion: boolean | null;
}

function ItemTugas({
  tugas,
  matkul,
  onEdit,
  onToggleSelesai,
  onHapus,
  shouldReduceMotion,
}: ItemTugasProps) {
  const isSelesai = tugas.status === 'selesai';
  const terlambat = apakahTerlambat(tugas.tenggat, tugas.status);
  const mendesak = apakahMendesak(tugas.tenggat, tugas.status);

  const [dragOffset, setDragOffset] = useState(0);

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 'var(--md-sys-shape-corner-medium, 12px)',
        overflow: 'hidden',
        backgroundColor:
          dragOffset > 0
            ? 'var(--kk-status-selesai-container)'
            : dragOffset < 0
            ? 'var(--kk-status-terlambat-container)'
            : 'var(--md-sys-color-surface-container)',
        transition: 'background-color var(--bs-dur-short, 150ms) ease',
      }}
    >
      {/* Background saat geser kanan (Selesai - Hijau) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: dragOffset > 0 ? 'flex-start' : 'flex-end',
          padding: '0 24px',
          color:
            dragOffset > 0
              ? 'var(--kk-status-on-selesai-container)'
              : 'var(--kk-status-on-terlambat-container)',
          opacity: Math.min(1, Math.abs(dragOffset) / 40),
          pointerEvents: 'none',
        }}
      >
        {dragOffset > 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transform: `scale(${Math.min(1.2, 0.8 + Math.abs(dragOffset) / 120)})`,
              transition: 'transform 100ms ease',
            }}
          >
            <Icon name="check_circle" size="24px" color="var(--kk-status-selesai)" />
            <span style={{ fontWeight: 700, fontSize: '13px' }}>
              {isSelesai ? 'Batal Selesai' : 'Selesai'}
            </span>
          </div>
        ) : dragOffset < 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transform: `scale(${Math.min(1.2, 0.8 + Math.abs(dragOffset) / 120)})`,
              transition: 'transform 100ms ease',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '13px' }}>Hapus</span>
            <Icon name="delete" size="24px" color="var(--kk-status-terlambat)" />
          </div>
        ) : null}
      </div>

      {/* Kartu Geser Interaktif */}
      <motion.div
        layout
        drag={shouldReduceMotion ? false : 'x'}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDrag={(_e, info) => {
          setDragOffset(info.offset.x);
          if (Math.abs(info.offset.x) === 80) {
            haptic('medium');
          }
        }}
        onDragEnd={(_e, info) => {
          setDragOffset(0);
          if (info.offset.x > 80) {
            haptic('success');
            onToggleSelesai(tugas);
          } else if (info.offset.x < -80) {
            haptic('warning');
            onHapus(tugas);
          }
        }}
        onClick={() => onEdit(tugas)}
        className="m3-card--interactive"
        style={{
          position: 'relative',
          backgroundColor: isSelesai
            ? 'var(--md-sys-color-surface-container-lowest)'
            : 'var(--md-sys-color-surface-container-low)',
          borderLeft: `5px solid ${matkul?.warna || 'var(--md-sys-color-primary)'}`,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          opacity: isSelesai ? 0.65 : 1,
          touchAction: 'pan-y',
          cursor: 'pointer',
        }}
      >
        {/* Tombol Centang Status (Target Sentuh 48px) */}
        <button
          type="button"
          aria-label={isSelesai ? 'Tandai belum selesai' : 'Tandai selesai'}
          onClick={(e) => {
            e.stopPropagation();
            haptic('success');
            onToggleSelesai(tugas);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '12px',
            margin: '-12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '48px',
            minHeight: '48px',
            borderRadius: '50%',
            WebkitTapHighlightColor: 'transparent',
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
              <span title="Penting">
                <Icon name="flag" size="16px" color="var(--md-sys-color-error)" />
              </span>
            )}
            <span
              className="typescale-body-large"
              style={{
                textDecoration: isSelesai ? 'line-through' : 'none',
                fontWeight: tugas.prioritas ? 700 : 500,
                color: isSelesai
                  ? 'var(--md-sys-color-on-surface-variant)'
                  : 'var(--md-sys-color-on-surface)',
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
              gap: '6px',
              marginTop: '4px',
              fontSize: 'var(--md-sys-typescale-body-small-size)',
            }}
          >
            <span
              style={{
                color: matkul?.warna || 'var(--md-sys-color-on-surface-variant)',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              {matkul?.nama || 'Mata Kuliah'}
            </span>

            {tugas.catatan && (
              <span
                style={{
                  color: 'var(--md-sys-color-on-surface-variant)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '180px',
                }}
              >
                · {tugas.catatan}
              </span>
            )}
          </div>
        </div>

        {/* Status Tenggat */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          {tugas.tenggat && (
            <StatusPill
              status={
                isSelesai
                  ? 'selesai'
                  : terlambat
                  ? 'terlambat'
                  : mendesak
                  ? 'mendesak'
                  : 'netral'
              }
              label={formatTenggat(tugas.tenggat)}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function Tugas() {
  const semesterAktif = useSemesterAktif();
  const daftarMatkulRaw = useDaftarMatkul(semesterAktif?.id);
  const daftarMatkul = useMemo(() => daftarMatkulRaw || [], [daftarMatkulRaw]);
  const daftarTugas = useDaftarTugas();
  const { openEditTugas, openQuickAdd } = useQuickAddStore();

  const shouldReduceMotion = useReducedMotion();

  // Tab Tab Segmented: 'aktif' | 'selesai'
  const [tabStatus, setTabStatus] = useState<'aktif' | 'selesai'>('aktif');

  // Filter Mata Kuliah
  const [filterMatkulId, setFilterMatkulId] = useState<number | null>(null);

  // Coachmark petunjuk gestur geser
  const [showSwipeHint, setShowSwipeHint] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('beresks_swipe_hint_dismissed');
  });

  const dismissSwipeHint = () => {
    setShowSwipeHint(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('beresks_swipe_hint_dismissed', 'true');
    }
  };

  // Handler Status
  const handleToggleSelesai = async (tugas: TugasType) => {
    const statusBaru = tugas.status === 'selesai' ? 'belum' : 'selesai';
    await ubahStatusTugas(tugas.id!, statusBaru);

    showSnackbar({
      message: statusBaru === 'selesai' ? 'Tugas diselesaikan 🎉' : 'Tugas dikembalikan ke aktif',
      actionLabel: 'Urungkan',
      duration: 5000,
      onAction: async () => {
        await ubahStatusTugas(tugas.id!, tugas.status);
      },
    });
  };

  // Handler Hapus
  const handleHapus = async (tugas: TugasType) => {
    await hapusTugas(tugas.id!);

    showSnackbar({
      message: 'Tugas dihapus',
      actionLabel: 'Urungkan',
      duration: 6000,
      onAction: async () => {
        await tambahTugas({
          matkulId: tugas.matkulId,
          judul: tugas.judul,
          catatan: tugas.catatan,
          prioritas: tugas.prioritas,
          tenggat: tugas.tenggat,
          status: tugas.status,
        });
      },
    });
  };

  // Data terfilter
  const semuaTugas = daftarTugas || [];
  const tugasTerfilterMatkul = filterMatkulId
    ? semuaTugas.filter((t) => t.matkulId === filterMatkulId)
    : semuaTugas;

  const tugasAktif = tugasTerfilterMatkul.filter((t) => t.status !== 'selesai');
  const tugasSelesai = tugasTerfilterMatkul.filter((t) => t.status === 'selesai');

  // Pengelompokan tugas aktif: Terlambat, Hari Ini, Minggu Ini, Nanti
  const kelompokAktif = useMemo(() => {
    const terlambat: TugasType[] = [];
    const hariIni: TugasType[] = [];
    const mingguIni: TugasType[] = [];
    const nanti: TugasType[] = [];

    for (const t of tugasAktif) {
      if (apakahTerlambat(t.tenggat, t.status)) {
        terlambat.push(t);
      } else if (t.tenggat && isToday(new Date(t.tenggat))) {
        hariIni.push(t);
      } else if (t.tenggat && isThisWeek(new Date(t.tenggat), { weekStartsOn: 1 })) {
        mingguIni.push(t);
      } else {
        nanti.push(t);
      }
    }

    return { terlambat, hariIni, mingguIni, nanti };
  }, [tugasAktif]);

  return (
    <Screen size="normal">
      {/* Header Halaman */}
      <ScreenHeader
        title="Daftar Tugas"
        subtitle={
          tugasAktif.length > 0
            ? `${tugasAktif.length} tugas perlu diselesaikan`
            : 'Semua tugas telah beres 🎉'
        }
      />

      {/* Segmented Filter Status: Aktif vs Selesai */}
      <div style={{ marginBottom: '14px' }}>
        <SegmentedButton
          segments={[
            {
              value: 'aktif',
              label: `Aktif (${tugasAktif.length})`,
              icon: 'assignment_late',
            },
            {
              value: 'selesai',
              label: `Selesai (${tugasSelesai.length})`,
              icon: 'task_alt',
            },
          ]}
          selected={tabStatus}
          onChange={(val) => {
            haptic('selection');
            setTabStatus(val as 'aktif' | 'selesai');
          }}
          style={{ width: '100%' }}
        />
      </div>

      {/* Filter Chip Mata Kuliah (Horizontal Scroll) */}
      {daftarMatkul.length > 0 && (
        <div style={{ marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
          <ChipSet>
            <FilterChip
              label="Semua Matkul"
              selected={filterMatkulId === null}
              onClick={() => {
                haptic('selection');
                setFilterMatkulId(null);
              }}
            />
            {daftarMatkul.map((m) => (
              <FilterChip
                key={m.id}
                label={m.nama}
                selected={filterMatkulId === m.id}
                onClick={() => {
                  haptic('selection');
                  setFilterMatkulId(filterMatkulId === m.id ? null : m.id!);
                }}
              />
            ))}
          </ChipSet>
        </div>
      )}

      {/* Petunjuk Gestur Geser (Coachmark Pertama Kali) */}
      {showSwipeHint && semuaTugas.length > 0 && (
        <div
          role="note"
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            backgroundColor: 'var(--md-sys-color-secondary-container)',
            color: 'var(--md-sys-color-on-secondary-container)',
            borderRadius: 'var(--md-sys-shape-corner-medium, 12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            fontSize: 'var(--md-sys-typescale-body-small-size)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="swipe" size="20px" />
            <span>
              <strong>Tips:</strong> Geser kanan untuk selesai, geser kiri untuk hapus. Ketuk baris untuk mengubah.
            </span>
          </div>
          <button
            type="button"
            aria-label="Tutup petunjuk"
            onClick={dismissSwipeHint}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'inherit',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icon name="close" size="16px" />
          </button>
        </div>
      )}

      {/* Loading Shimmer Placeholder (A4 fix) */}
      {daftarTugas === undefined ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : tabStatus === 'aktif' ? (
        /* TAB AKTIF */
        tugasAktif.length === 0 ? (
          <EmptyState
            icon="task_alt"
            title="Semua tugas beres!"
            description={
              filterMatkulId
                ? 'Tidak ada tugas aktif untuk mata kuliah ini.'
                : 'Tidak ada tugas tertunda saat ini. Nikmati waktu luangmu atau catat tugas baru.'
            }
            action={
              filterMatkulId
                ? { label: 'Tampilkan Semua Matkul', onClick: () => setFilterMatkulId(null), variant: 'outlined' }
                : { label: 'Catat Tugas Baru', icon: 'add_task', onClick: () => openQuickAdd() }
            }
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <AnimatePresence>
              {/* Grup Terlambat */}
              {kelompokAktif.terlambat.length > 0 && (
                <Section
                  title="Terlambat"
                  trailing={
                    <StatusPill
                      status="terlambat"
                      label={`${kelompokAktif.terlambat.length} tugas`}
                    />
                  }
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {kelompokAktif.terlambat.map((t) => (
                      <ItemTugas
                        key={t.id}
                        tugas={t}
                        matkul={daftarMatkul.find((m) => m.id === t.matkulId)}
                        onEdit={openEditTugas}
                        onToggleSelesai={handleToggleSelesai}
                        onHapus={handleHapus}
                        shouldReduceMotion={shouldReduceMotion}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {/* Grup Hari Ini */}
              {kelompokAktif.hariIni.length > 0 && (
                <Section
                  title="Hari Ini"
                  trailing={
                    <span className="typescale-label-small" style={{ color: 'var(--md-sys-color-primary)', fontWeight: 'bold' }}>
                      {kelompokAktif.hariIni.length} tugas
                    </span>
                  }
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {kelompokAktif.hariIni.map((t) => (
                      <ItemTugas
                        key={t.id}
                        tugas={t}
                        matkul={daftarMatkul.find((m) => m.id === t.matkulId)}
                        onEdit={openEditTugas}
                        onToggleSelesai={handleToggleSelesai}
                        onHapus={handleHapus}
                        shouldReduceMotion={shouldReduceMotion}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {/* Grup Minggu Ini */}
              {kelompokAktif.mingguIni.length > 0 && (
                <Section
                  title="Minggu Ini"
                  trailing={
                    <span className="typescale-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                      {kelompokAktif.mingguIni.length} tugas
                    </span>
                  }
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {kelompokAktif.mingguIni.map((t) => (
                      <ItemTugas
                        key={t.id}
                        tugas={t}
                        matkul={daftarMatkul.find((m) => m.id === t.matkulId)}
                        onEdit={openEditTugas}
                        onToggleSelesai={handleToggleSelesai}
                        onHapus={handleHapus}
                        shouldReduceMotion={shouldReduceMotion}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {/* Grup Nanti / Tanpa Tenggat */}
              {kelompokAktif.nanti.length > 0 && (
                <Section
                  title="Mendatang & Lainnya"
                  trailing={
                    <span className="typescale-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                      {kelompokAktif.nanti.length} tugas
                    </span>
                  }
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {kelompokAktif.nanti.map((t) => (
                      <ItemTugas
                        key={t.id}
                        tugas={t}
                        matkul={daftarMatkul.find((m) => m.id === t.matkulId)}
                        onEdit={openEditTugas}
                        onToggleSelesai={handleToggleSelesai}
                        onHapus={handleHapus}
                        shouldReduceMotion={shouldReduceMotion}
                      />
                    ))}
                  </div>
                </Section>
              )}
            </AnimatePresence>
          </div>
        )
      ) : (
        /* TAB SELESAI */
        tugasSelesai.length === 0 ? (
          <EmptyState
            icon="checklist"
            title="Belum ada tugas selesai"
            description="Tugas yang telah Anda selesaikan akan diarsipkan rapi di sini."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <AnimatePresence>
              {tugasSelesai.map((t) => (
                <ItemTugas
                  key={t.id}
                  tugas={t}
                  matkul={daftarMatkul.find((m) => m.id === t.matkulId)}
                  onEdit={openEditTugas}
                  onToggleSelesai={handleToggleSelesai}
                  onHapus={handleHapus}
                  shouldReduceMotion={shouldReduceMotion}
                />
              ))}
            </AnimatePresence>
          </div>
        )
      )}
    </Screen>
  );
}

export default Tugas;
