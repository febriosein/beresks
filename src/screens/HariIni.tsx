import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getISODay } from 'date-fns';
import {
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
  cariSesiSedangBerlangsungAtauBaruBerakhir,
  cariSesiBerikutnya,
} from '../features/jadwal/sesiHelpers.js';
import { useQuickAddStore } from '../features/quick-add/useQuickAddStore.js';
import { formatTanggalLengkap, formatHitungMundur, formatTenggat, apakahTerlambat } from '../lib/tanggal.js';

export function HariIni() {
  const navigate = useNavigate();
  const semesterAktif = useSemesterAktif();
  const daftarMatkul = useDaftarMatkul(semesterAktif?.id) || [];
  const semuaSesi = useSemuaSesi() || [];
  const tugasMendesak = useTugasMendesak(5) || [];

  const { openQuickAdd } = useQuickAddStore();

  // Tick timer tiap menit agar hitung mundur terbarui otomatis
  const [sekarang, setSekarang] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setSekarang(new Date());
    }, 60000);
    return () => clearInterval(timer);
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

  // Sesi hari ini
  const sesiHariIni = semuaSesi
    .filter((s) => s.hari === hariIniIso)
    .sort((a, b) => parseWaktuKeMenit(a.jamMulai) - parseWaktuKeMenit(b.jamMulai));

  // Cek sesi sedang berlangsung
  const sesiAktif = cariSesiSedangBerlangsungAtauBaruBerakhir(semuaSesi, sekarang);
  const matkulSesiAktif = sesiAktif ? daftarMatkul.find((m) => m.id === sesiAktif.matkulId) : null;

  // Cek sesi berikutnya
  const infoBerikutnya = cariSesiBerikutnya(semuaSesi, sekarang);
  const matkulBerikutnya = infoBerikutnya ? daftarMatkul.find((m) => m.id === infoBerikutnya.sesi.matkulId) : null;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%', padding: '16px', paddingBottom: '96px' }}>
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div>
          <span
            className="typescale-label-medium"
            style={{ color: 'var(--md-sys-color-primary)', fontWeight: 'bold' }}
          >
            {getSapaan()} 👋
          </span>
          <h1 className="typescale-headline-small" style={{ margin: '2px 0 0 0' }}>
            {formatTanggalLengkap(sekarang.getTime())}
          </h1>
        </div>

        <IconButton
          icon="settings"
          ariaLabel="Pengaturan"
          onClick={() => navigate('/pengaturan')}
        />
      </div>

      {/* Kartu Besar "Berikutnya" atau "Sedang Berlangsung" */}
      <div style={{ marginBottom: '24px' }}>
        {sesiAktif && matkulSesiAktif ? (
          <Card
            variant="filled"
            style={{
              borderLeft: `6px solid ${matkulSesiAktif.warna}`,
              backgroundColor: 'var(--md-sys-color-primary-container)',
              color: 'var(--md-sys-color-on-primary-container)',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                className="typescale-label-small"
                style={{
                  backgroundColor: 'var(--md-sys-color-primary)',
                  color: 'var(--md-sys-color-on-primary)',
                  padding: '4px 10px',
                  borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                  fontWeight: 'bold',
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
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                SEDANG BERLANGSUNG
              </span>

              <span className="typescale-title-medium" style={{ fontWeight: 'bold' }}>
                {sesiAktif.jamMulai} – {sesiAktif.jamSelesai}
              </span>
            </div>

            <h2 className="typescale-headline-small" style={{ margin: '12px 0 4px 0' }}>
              {matkulSesiAktif.nama}
            </h2>

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
                variant="filled"
                icon="add_task"
                onClick={() => openQuickAdd(matkulSesiAktif.id)}
                style={{ width: '100%' }}
              >
                + Tugas untuk Mata Kuliah Ini
              </Button>
            </div>
          </Card>
        ) : infoBerikutnya && matkulBerikutnya ? (
          <Card
            variant="filled"
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
                  fontWeight: 'bold',
                }}
              >
                KELAS BERIKUTNYA
              </span>

              <span
                className="typescale-label-medium"
                style={{ color: 'var(--md-sys-color-primary)', fontWeight: 'bold' }}
              >
                {formatHitungMundur(infoBerikutnya.tanggalMs)}
              </span>
            </div>

            <h2 className="typescale-title-large" style={{ margin: '10px 0 4px 0' }}>
              {matkulBerikutnya.nama}
            </h2>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                color: 'var(--md-sys-color-on-surface-variant)',
                marginTop: '4px',
              }}
            >
              <span className="typescale-body-medium">
                {infoBerikutnya.sesi.jamMulai} – {infoBerikutnya.sesi.jamSelesai}
              </span>
              {infoBerikutnya.sesi.ruang && (
                <span className="typescale-body-medium">
                  · Ruang {infoBerikutnya.sesi.ruang}
                </span>
              )}
              <span className="typescale-body-medium" style={{ textTransform: 'capitalize' }}>
                · {infoBerikutnya.sesi.tipe}
              </span>
            </div>
          </Card>
        ) : (
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
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 className="typescale-title-medium" style={{ margin: 0 }}>
            Jadwal Hari Ini
          </h2>
          <Button variant="text" onClick={() => navigate('/jadwal')}>
            Lihat Minggu Ini
          </Button>
        </div>

        {sesiHariIni.length === 0 ? (
          <Card variant="outlined" style={{ textAlign: 'center', padding: '24px 16px' }}>
            <Icon name="free_cancellation" size="36px" color="var(--md-sys-color-outline)" />
            <p className="typescale-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '8px' }}>
              Hari ini bebas kelas.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sesiHariIni.map((sesi: SesiKelas) => {
              const matkul = daftarMatkul.find((m) => m.id === sesi.matkulId);
              const mulai = parseWaktuKeMenit(sesi.jamMulai);
              const selesai = parseWaktuKeMenit(sesi.jamSelesai);
              const isBerlangsung = menitSekarang >= mulai && menitSekarang <= selesai;
              const sudahLewat = menitSekarang > selesai;

              return (
                <Card
                  key={sesi.id}
                  variant={isBerlangsung ? 'filled' : 'outlined'}
                  onClick={() => navigate(`/matkul/${sesi.matkulId}`)}
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
                        <span className="typescale-label-medium" style={{ fontWeight: 'bold' }}>
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
                              fontWeight: 'bold',
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
      </div>

      {/* Bagian Tugas Mendesak */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="assignment_late" size="20px" color="var(--kk-status-mendesak)" />
            <h2 className="typescale-title-medium" style={{ margin: 0 }}>
              Tugas Perlu Dikerjakan
            </h2>
          </div>
          <Button variant="text" onClick={() => navigate('/tugas')}>
            Lihat Semua
          </Button>
        </div>

        {tugasMendesak.length === 0 ? (
          <Card variant="outlined" style={{ textAlign: 'center', padding: '24px 16px' }}>
            <Icon name="task_alt" size="36px" color="var(--kk-status-selesai)" />
            <p className="typescale-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '8px' }}>
              Hebat! Tidak ada tugas mendesak saat ini.
            </p>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tugasMendesak.map((tugas) => {
              const matkul = daftarMatkul.find((m) => m.id === tugas.matkulId);
              const terlambat = apakahTerlambat(tugas.tenggat, tugas.status);

              return (
                <Card
                  key={tugas.id}
                  variant="outlined"
                  style={{
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    borderLeft: `5px solid ${matkul?.warna || 'var(--md-sys-color-primary)'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                    <button
                      type="button"
                      aria-label="Selesaikan tugas"
                      onClick={async () => {
                        if (typeof navigator !== 'undefined' && navigator.vibrate) {
                          navigator.vibrate(50);
                        }
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
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Icon name="radio_button_unchecked" size="22px" color="var(--md-sys-color-outline)" />
                    </button>

                    <div style={{ flex: 1 }}>
                      <div className="typescale-body-medium" style={{ fontWeight: '500' }}>
                        {tugas.judul}
                      </div>
                      <div className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                        {matkul?.nama || 'Mata Kuliah'}
                      </div>
                    </div>
                  </div>

                  {tugas.tenggat && (
                    <span
                      className="typescale-label-small"
                      style={{
                        color: terlambat ? 'var(--kk-status-terlambat)' : 'var(--kk-status-mendesak)',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        backgroundColor: terlambat
                          ? 'var(--kk-status-terlambat-container)'
                          : 'var(--kk-status-mendesak-container)',
                        padding: '2px 8px',
                        borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
                      }}
                    >
                      {terlambat ? <Icon name="warning" size="14px" /> : <Icon name="schedule" size="14px" />}
                      {formatTenggat(tugas.tenggat)}
                    </span>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
