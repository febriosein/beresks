import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { getISODay } from 'date-fns';
import {
  Screen,
  ScreenHeader,
  Section,
  EmptyState,
  SkeletonCard,
  StatusPill,
  Card,
  Button,
  IconButton,
  Icon,
  showSnackbar,
} from '../ui/index.js';
import {
  useSemesterAktif,
  useDaftarMatkul,
  useSemuaSesi,
  useTugasMendesak,
  ubahStatusTugas,
  type SesiKelas,
} from '../data/repo/index.js';
import {
  parseWaktuKeMenit,
  cariSesiAktifHariIni,
  cariSesiBerikutnya,
} from '../features/jadwal/sesiHelpers.js';
import { useQuickAddStore } from '../features/quick-add/useQuickAddStore.js';
import {
  formatTanggalLengkap,
  formatHitungMundur,
  formatTenggat,
  apakahTerlambat,
  getNamaHari,
} from '../lib/tanggal.js';
import { haptic } from '../lib/haptic.js';

export function HariIni() {
  const navigate = useNavigate();
  const semesterAktif = useSemesterAktif();
  const daftarMatkulRaw = useDaftarMatkul(semesterAktif?.id);
  const daftarMatkul = useMemo(() => daftarMatkulRaw || [], [daftarMatkulRaw]);
  const semuaSesiRaw = useSemuaSesi();
  const semuaSesi = useMemo(() => semuaSesiRaw || [], [semuaSesiRaw]);
  const tugasMendesakRaw = useTugasMendesak(5);
  const tugasMendesak = useMemo(() => tugasMendesakRaw || [], [tugasMendesakRaw]);

  const { openQuickAdd, openEditTugas } = useQuickAddStore();

  // Tick timer per 30 detik untuk memperbarui status & hitung mundur secara real time
  // Didukung listener visibilitychange & focus agar langsung sinkron saat PWA dibuka kembali di iOS/mobile
  const [sekarang, setSekarang] = useState(() => new Date());
  useEffect(() => {
    const sinkronkanWaktu = () => setSekarang(new Date());

    const timer = setInterval(sinkronkanWaktu, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sinkronkanWaktu();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', sinkronkanWaktu);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', sinkronkanWaktu);
    };
  }, []);

  // Ucapan sapaan waktu
  const getSapaan = () => {
    const jam = sekarang.getHours();
    if (jam >= 4 && jam < 11) return 'Selamat Pagi';
    if (jam >= 11 && jam < 15) return 'Selamat Siang';
    if (jam >= 15 && jam < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const hariIniIso = getISODay(sekarang) as 1 | 2 | 3 | 4 | 5 | 6 | 7;
  const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();

  // Sesi kuliah hari ini
  const sesiHariIni = useMemo(() => {
    return semuaSesi
      .filter((s) => s.hari === hariIniIso)
      .sort((a, b) => parseWaktuKeMenit(a.jamMulai) - parseWaktuKeMenit(b.jamMulai));
  }, [semuaSesi, hariIniIso]);

  // Cek sesi aktif hari ini (berlangsung atau baru selesai dengan toleransi 10 menit jika kelas terakhir)
  const infoSesiAktif = useMemo(
    () => cariSesiAktifHariIni(semuaSesi, sekarang),
    [semuaSesi, sekarang]
  );
  const sesiAktif = infoSesiAktif?.sesi ?? null;
  const statusAktif = infoSesiAktif?.status ?? null;
  const matkulSesiAktif = sesiAktif ? daftarMatkul.find((m) => m.id === sesiAktif.matkulId) : null;

  // Hitung sisa menit & progress sesi aktif
  const infoProgresSesi = useMemo(() => {
    if (!sesiAktif) return null;
    const mulai = parseWaktuKeMenit(sesiAktif.jamMulai);
    const selesai = parseWaktuKeMenit(sesiAktif.jamSelesai);
    const totalDurasi = Math.max(1, selesai - mulai);
    const lewat = menitSekarang - mulai;
    const pct = Math.min(100, Math.max(0, (lewat / totalDurasi) * 100));
    const sisa = Math.max(0, selesai - menitSekarang);
    const selesaiMenitLalu = Math.max(0, menitSekarang - selesai);
    return { progressPct: pct, sisaMenit: sisa, selesaiMenitLalu };
  }, [sesiAktif, menitSekarang]);

  // Cek sesi berikutnya
  const infoBerikutnya = useMemo(
    () => cariSesiBerikutnya(semuaSesi, sekarang),
    [semuaSesi, sekarang]
  );
  const matkulBerikutnya = infoBerikutnya
    ? daftarMatkul.find((m) => m.id === infoBerikutnya.sesi.matkulId)
    : null;

  const isLoading = semuaSesiRaw === undefined || daftarMatkulRaw === undefined;

  return (
    <Screen size="normal">
      {/* Top Screen Header */}
      <ScreenHeader
        title={`${getSapaan()} 👋`}
        subtitle={formatTanggalLengkap(sekarang.getTime())}
        trailing={
          <IconButton
            icon="settings"
            ariaLabel="Pengaturan BereSKS"
            onClick={() => navigate('/pengaturan')}
          />
        }
      />

      {/* Ringkasan Status Hari Ini */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap',
        }}
      >
        <span
          className="typescale-label-small"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-high)',
            color: 'var(--md-sys-color-on-surface-variant)',
            padding: '4px 10px',
            borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <Icon name="event" size="14px" color="var(--md-sys-color-primary)" />
          <span>{sesiHariIni.length > 0 ? `${sesiHariIni.length} kelas hari ini` : 'Bebas kelas hari ini'}</span>
        </span>

        <span
          className="typescale-label-small"
          style={{
            backgroundColor:
              tugasMendesak.length > 0
                ? 'var(--kk-status-mendesak-container)'
                : 'var(--kk-status-selesai-container)',
            color:
              tugasMendesak.length > 0
                ? 'var(--kk-status-on-mendesak-container)'
                : 'var(--kk-status-on-selesai-container)',
            padding: '4px 10px',
            borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <Icon
            name={tugasMendesak.length > 0 ? 'assignment_late' : 'task_alt'}
            size="14px"
          />
          <span>{tugasMendesak.length > 0 ? `${tugasMendesak.length} tugas mendesak` : 'Semua tugas aman'}</span>
        </span>
      </div>

      {/* Hero Card: "Sedang Berlangsung" atau "Kelas Berikutnya" */}
      <div style={{ marginBottom: '24px' }}>
        {isLoading ? (
          <SkeletonCard />
        ) : sesiAktif && matkulSesiAktif ? (
          /* Sesi Sedang Berlangsung atau Baru Selesai (Toleransi 10 Menit Kelas Terakhir) */
          <Card
            variant="filled"
            style={{
              borderLeft: `6px solid ${matkulSesiAktif.warna}`,
              backgroundColor:
                statusAktif === 'baru_selesai'
                  ? 'var(--md-sys-color-surface-container-high)'
                  : 'var(--md-sys-color-primary-container)',
              color:
                statusAktif === 'baru_selesai'
                  ? 'var(--md-sys-color-on-surface)'
                  : 'var(--md-sys-color-on-primary-container)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {statusAktif === 'baru_selesai' ? (
                <span
                  className="typescale-label-small"
                  style={{
                    backgroundColor: 'var(--md-sys-color-secondary-container)',
                    color: 'var(--md-sys-color-on-secondary-container)',
                    padding: '4px 10px',
                    borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Icon name="check_circle" size="14px" />
                  BARU SELESAI
                </span>
              ) : (
                <span
                  className="typescale-label-small"
                  style={{
                    backgroundColor: 'var(--md-sys-color-primary)',
                    color: 'var(--md-sys-color-on-primary)',
                    padding: '4px 10px',
                    borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--md-sys-color-on-primary)',
                      display: 'inline-block',
                      animation: 'bs-skeleton-pulse 1.2s infinite',
                    }}
                  />
                  SEDANG BERLANGSUNG
                </span>
              )}

              <span className="typescale-title-medium tabular" style={{ fontWeight: 700 }}>
                {sesiAktif.jamMulai} – {sesiAktif.jamSelesai}
              </span>
            </div>

            <h2 className="typescale-headline-small" style={{ margin: '12px 0 4px 0' }}>
              {matkulSesiAktif.nama}
            </h2>

            {/* Progress bar durasi sesi */}
            {infoProgresSesi && (
              <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                <div
                  style={{
                    height: '6px',
                    width: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${infoProgresSesi.progressPct}%`,
                      backgroundColor:
                        statusAktif === 'baru_selesai'
                          ? 'var(--md-sys-color-secondary)'
                          : 'var(--md-sys-color-primary)',
                      borderRadius: '4px',
                      transition: 'width 300ms ease',
                    }}
                  />
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '4px',
                    fontSize: 'var(--md-sys-typescale-label-small-size)',
                    opacity: 0.9,
                  }}
                >
                  {statusAktif === 'baru_selesai' ? (
                    <>
                      <span>Kelas selesai 🎉</span>
                      <span>
                        {infoProgresSesi.selesaiMenitLalu === 0
                          ? 'Selesai baru saja'
                          : `Selesai ${infoProgresSesi.selesaiMenitLalu} menit lalu`}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>{Math.round(infoProgresSesi.progressPct)}% selesai</span>
                      <span>Sisa {infoProgresSesi.sisaMenit} menit lagi</span>
                    </>
                  )}
                </div>
              </div>
            )}

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                marginTop: '6px',
                fontSize: 'var(--md-sys-typescale-body-medium-size)',
                opacity: 0.9,
              }}
            >
              {sesiAktif.ruang && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Icon name="meeting_room" size="18px" />
                  <span>Ruang {sesiAktif.ruang}</span>
                </div>
              )}
              {matkulSesiAktif.dosen && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Icon name="person" size="18px" />
                  <span>{matkulSesiAktif.dosen}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: '16px' }}>
              <Button
                variant={statusAktif === 'baru_selesai' ? 'outlined' : 'filled'}
                icon="add_task"
                onClick={() => openQuickAdd(matkulSesiAktif.id)}
                style={{ width: '100%' }}
              >
                + Catat Tugas untuk Matkul Ini
              </Button>
            </div>
          </Card>
        ) : infoBerikutnya && matkulBerikutnya ? (
          /* Sesi Kelas Berikutnya */
          <Card
            variant="filled"
            onClick={() => navigate(`/matkul/${matkulBerikutnya.id}`)}
            className="m3-card--interactive"
            style={{
              borderLeft: `6px solid ${matkulBerikutnya.warna}`,
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                className="typescale-label-small"
                style={{
                  backgroundColor: 'var(--md-sys-color-secondary-container)',
                  color: 'var(--md-sys-color-on-secondary-container)',
                  padding: '3px 8px',
                  borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                  fontWeight: 700,
                }}
              >
                {infoBerikutnya.hariSama
                  ? 'KELAS BERIKUTNYA'
                  : `KELAS BERIKUTNYA (${getNamaHari(infoBerikutnya.sesi.hari)})`}
              </span>

              <span
                className="typescale-label-medium tabular"
                style={{ color: 'var(--md-sys-color-primary)', fontWeight: 700 }}
              >
                {formatHitungMundur(infoBerikutnya.tanggalMs)}
              </span>
            </div>

            <h2 className="typescale-title-large" style={{ margin: '10px 0 6px 0' }}>
              {matkulBerikutnya.nama}
            </h2>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '10px',
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              {/* Hari & Waktu */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="schedule" size="18px" color="var(--md-sys-color-primary)" />
                <span className="typescale-body-medium tabular">
                  {!infoBerikutnya.hariSama ? `${getNamaHari(infoBerikutnya.sesi.hari)}, ` : 'Hari ini, '}
                  {infoBerikutnya.sesi.jamMulai} – {infoBerikutnya.sesi.jamSelesai}
                </span>
              </div>

              {/* Ruang */}
              {infoBerikutnya.sesi.ruang && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="meeting_room" size="18px" />
                  <span className="typescale-body-medium">
                    {infoBerikutnya.sesi.ruang.toLowerCase().startsWith('ruang')
                      ? infoBerikutnya.sesi.ruang
                      : `Ruang ${infoBerikutnya.sesi.ruang}`}
                  </span>
                </div>
              )}

              {/* Tipe Kuliah (Praktikum / Teori) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="school" size="18px" />
                <span className="typescale-body-medium" style={{ textTransform: 'capitalize' }}>
                  {infoBerikutnya.sesi.tipe}
                </span>
              </div>

              {/* Dosen (jika ada) */}
              {matkulBerikutnya.dosen && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name="person" size="18px" />
                  <span className="typescale-body-medium">
                    {matkulBerikutnya.dosen}
                  </span>
                </div>
              )}
            </div>
          </Card>
        ) : (
          /* Tidak Ada Sesi Tersisa Hari Ini */
          <Card variant="outlined" style={{ textAlign: 'center', padding: '28px 16px' }}>
            <Icon name="celebration" size="44px" color="var(--md-sys-color-primary)" />
            <h2 className="typescale-title-medium" style={{ margin: '8px 0 4px 0' }}>
              Tidak ada jadwal kelas lagi hari ini 🎉
            </h2>
            <p className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              Semua kelas telah selesai. Istirahat yang cukup atau cicil tugasmu.
            </p>
          </Card>
        )}
      </div>

      {/* Timeline Kelas Hari Ini */}
      <Section
        title="Jadwal Hari Ini"
        trailing={
          <Button variant="text" onClick={() => navigate('/jadwal')}>
            Lihat Jadwal
          </Button>
        }
      >
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : sesiHariIni.length === 0 ? (
          <EmptyState
            icon="free_cancellation"
            title="Hari ini bebas kelas"
            description="Tidak ada perkuliahan yang dijadwalkan hari ini. Manfaatkan waktu untuk belajar atau beristirahat."
            variant="card"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sesiHariIni.map((sesi: SesiKelas) => {
              const matkul = daftarMatkul.find((m) => m.id === sesi.matkulId);
              const mulai = parseWaktuKeMenit(sesi.jamMulai);
              const selesai = parseWaktuKeMenit(sesi.jamSelesai);
              const isBerlangsung = menitSekarang >= mulai && menitSekarang < selesai;
              const sudahLewat = menitSekarang >= selesai;

              return (
                <Card
                  key={sesi.id}
                  variant={isBerlangsung ? 'filled' : 'outlined'}
                  onClick={() => navigate(`/matkul/${sesi.matkulId}`)}
                  className="m3-card--interactive"
                  style={{
                    borderLeft: `5px solid ${matkul?.warna || 'var(--md-sys-color-primary)'}`,
                    padding: '12px 14px',
                    opacity: sudahLewat ? 0.6 : 1,
                    backgroundColor: isBerlangsung ? 'var(--md-sys-color-surface-container-high)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="typescale-label-medium tabular" style={{ fontWeight: 700 }}>
                          {sesi.jamMulai} – {sesi.jamSelesai}
                        </span>
                        {isBerlangsung && (
                          <span
                            className="typescale-label-small"
                            style={{
                              backgroundColor: 'var(--md-sys-color-primary)',
                              color: 'var(--md-sys-color-on-primary)',
                              padding: '1px 6px',
                              borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
                              fontWeight: 700,
                            }}
                          >
                            Live
                          </span>
                        )}
                      </div>
                      <h3 className="typescale-title-medium" style={{ margin: '4px 0 0 0' }}>
                        {matkul?.nama || 'Mata Kuliah'}
                      </h3>
                    </div>

                    <div style={{ textAlign: 'right', color: 'var(--md-sys-color-on-surface-variant)' }}>
                      {sesi.ruang && (
                        <div className="typescale-body-small">
                          Ruang {sesi.ruang}
                        </div>
                      )}
                      <div className="typescale-label-small" style={{ textTransform: 'capitalize' }}>
                        {sesi.tipe}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Section>

      {/* Bagian Tugas Mendesak */}
      <Section
        title="Tugas Perlu Dikerjakan"
        trailing={
          <Button variant="text" onClick={() => navigate('/tugas')}>
            Lihat Semua
          </Button>
        }
      >
        {isLoading ? (
          <SkeletonCard />
        ) : tugasMendesak.length === 0 ? (
          <EmptyState
            icon="task_alt"
            title="Tidak ada tugas mendesak"
            description="Hebat! Semua tugas dalam kendali saat ini."
            variant="card"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tugasMendesak.map((tugas) => {
              const matkul = daftarMatkul.find((m) => m.id === tugas.matkulId);
              const terlambat = apakahTerlambat(tugas.tenggat, tugas.status);

              return (
                <Card
                  key={tugas.id}
                  variant="outlined"
                  onClick={() => openEditTugas(tugas)}
                  className="m3-card--interactive"
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    borderLeft: `5px solid ${matkul?.warna || 'var(--md-sys-color-primary)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    {/* Centang Selesai Cepat (48px target sentuh) */}
                    <button
                      type="button"
                      aria-label="Selesaikan tugas"
                      onClick={async (e) => {
                        e.stopPropagation();
                        haptic('success');
                        await ubahStatusTugas(tugas.id!, 'selesai');
                        showSnackbar({
                          message: 'Tugas diselesaikan 🎉',
                          actionLabel: 'Urungkan',
                          onAction: async () => {
                            await ubahStatusTugas(tugas.id!, 'belum');
                          },
                        });
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
                      <Icon name="radio_button_unchecked" size="22px" color="var(--md-sys-color-outline)" />
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        className="typescale-body-medium"
                        style={{
                          fontWeight: tugas.prioritas ? 700 : 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tugas.judul}
                      </div>
                      <div
                        className="typescale-body-small"
                        style={{
                          color: matkul?.warna || 'var(--md-sys-color-on-surface-variant)',
                          fontWeight: 700,
                          fontSize: '12px',
                        }}
                      >
                        {matkul?.nama || 'Mata Kuliah'}
                      </div>
                    </div>
                  </div>

                  {tugas.tenggat && (
                    <StatusPill
                      status={terlambat ? 'terlambat' : 'mendesak'}
                      label={formatTenggat(tugas.tenggat)}
                    />
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Section>
    </Screen>
  );
}

export default HariIni;
