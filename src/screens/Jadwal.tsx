import { useState, useEffect } from 'react';
import { getISODay } from 'date-fns';
import {
  Card,
  Button,
  SegmentedButton,
  Dialog,
  TextField,
  Select,
  Icon,
  useRegisterFab,
  showSnackbar,
} from '../ui/index.js';
import {
  useSemesterAktif,
  useDaftarMatkul,
  useSemuaSesi,
  tambahSesi,
  ubahSesi,
  hapusSesi,
  type SesiKelas,
} from '../data/repo/index.js';
import { parseWaktuKeMenit, apakahSesiBentrok } from '../features/jadwal/sesiHelpers.js';
import { getNamaHari } from '../lib/tanggal.js';

export function Jadwal() {
  const semesterAktif = useSemesterAktif();
  const daftarMatkul = useDaftarMatkul(semesterAktif?.id) || [];
  const daftarSesi = useSemuaSesi() || [];

  // Mode Tampilan: 'hari' | 'minggu'
  const [modeTampilan, setModeTampilan] = useState<'hari' | 'minggu'>('hari');

  // Hari yang sedang dipilih untuk tampilan harian (default: hari ini)
  const [hariIniIso] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(() => getISODay(new Date()) as any);
  const [hariTerpilih, setHariTerpilih] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(() => getISODay(new Date()) as any);

  // State Dialog Tambah / Edit Sesi
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSesiId, setEditSesiId] = useState<number | null>(null);
  const [pilihanMatkulId, setPilihanMatkulId] = useState<string>('');
  const [hariInput, setHariInput] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(() => getISODay(new Date()) as any);
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('09:40');
  const [ruang, setRuang] = useState('');
  const [tipe, setTipe] = useState<'teori' | 'praktikum'>('teori');

  const bukaDialog = (sesi?: SesiKelas) => {
    if (daftarMatkul.length === 0) return;

    if (sesi) {
      setEditSesiId(sesi.id ?? null);
      setPilihanMatkulId(String(sesi.matkulId));
      setHariInput(sesi.hari);
      setJamMulai(sesi.jamMulai);
      setJamSelesai(sesi.jamSelesai);
      setRuang(sesi.ruang || '');
      setTipe(sesi.tipe);
    } else {
      setEditSesiId(null);
      const defaultMatkul = daftarMatkul[0];
      setPilihanMatkulId(String(defaultMatkul.id));
      setHariInput(hariTerpilih);
      setJamMulai('08:00');
      setJamSelesai('09:40');
      setRuang(defaultMatkul.ruangDefault || '');
      setTipe('teori');
    }
    setDialogOpen(true);
  };

  useRegisterFab({
    label: 'Sesi',
    icon: 'add',
    ariaLabel: 'Tambah Sesi Kuliah',
    onClick: () => {
      if (daftarMatkul.length === 0) {
        showSnackbar({ message: 'Tambahkan mata kuliah terlebih dahulu sebelum menambah sesi' });
        return;
      }
      bukaDialog();
    },
  });

  useEffect(() => {
    const handler = () => {
      if (daftarMatkul.length > 0) {
        bukaDialog();
      } else {
        showSnackbar({ message: 'Tambahkan mata kuliah terlebih dahulu sebelum menambah sesi' });
      }
    };
    window.addEventListener('beresks:buka-tambah-sesi', handler);
    return () => window.removeEventListener('beresks:buka-tambah-sesi', handler);
  }, [daftarMatkul]);

  const simpanSesi = async () => {
    const matkulIdNum = Number(pilihanMatkulId);
    if (!matkulIdNum) return;

    if (editSesiId) {
      await ubahSesi(editSesiId, {
        matkulId: matkulIdNum,
        hari: hariInput,
        jamMulai,
        jamSelesai,
        ruang: ruang.trim() || undefined,
        tipe,
      });
    } else {
      await tambahSesi({
        matkulId: matkulIdNum,
        hari: hariInput,
        jamMulai,
        jamSelesai,
        ruang: ruang.trim() || undefined,
        tipe,
      });
    }
    setDialogOpen(false);
  };

  const handleHapusSesi = async () => {
    if (editSesiId) {
      await hapusSesi(editSesiId);
      setDialogOpen(false);
    }
  };

  // Filter dan urutkan sesi untuk hari yang dipilih
  const sesiHariTerpilih = daftarSesi
    .filter((s) => s.hari === hariTerpilih)
    .sort((a, b) => parseWaktuKeMenit(a.jamMulai) - parseWaktuKeMenit(b.jamMulai));

  // Cek bentrok untuk setiap sesi di hari itu
  const periksaBentrok = (sesi: SesiKelas, listSesi: SesiKelas[]): boolean => {
    return listSesi.some((other) => other.id !== sesi.id && apakahSesiBentrok(sesi, other));
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%', padding: '16px', paddingBottom: 'calc(130px + env(safe-area-inset-bottom, 0px))' }}>
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
            Jadwal Kuliah
          </h1>
          <p
            className="typescale-body-small"
            style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}
          >
            {semesterAktif ? semesterAktif.nama : 'Kuliah'}
          </p>
        </div>
      </div>

      {/* Switcher Tampilan Hari / Minggu */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <SegmentedButton
          selected={modeTampilan}
          onChange={(val) => setModeTampilan(val as any)}
          segments={[
            { value: 'hari', label: 'Harian', icon: 'view_day' },
            { value: 'minggu', label: 'Mingguan', icon: 'calendar_view_week' },
          ]}
        />
      </div>

      {daftarMatkul.length === 0 ? (
        <Card variant="outlined" style={{ textAlign: 'center', padding: '36px 16px' }}>
          <Icon name="school" size="48px" color="var(--md-sys-color-primary)" />
          <h2 className="typescale-title-medium" style={{ margin: '12px 0 4px 0' }}>
            Belum ada mata kuliah
          </h2>
          <p className="typescale-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '16px' }}>
            Buat mata kuliah terlebih dahulu sebelum menambahkan jadwal kelas.
          </p>
        </Card>
      ) : modeTampilan === 'hari' ? (
        <div>
          {/* Horizontal Day Selector Strip */}
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '12px',
              marginBottom: '16px',
              scrollbarWidth: 'none',
            }}
          >
            {([1, 2, 3, 4, 5, 6, 7] as const).map((hariIdx) => {
              const isSelected = hariIdx === hariTerpilih;
              const isToday = hariIdx === hariIniIso;
              const jumlahKelas = daftarSesi.filter((s) => s.hari === hariIdx).length;

              return (
                <button
                  key={hariIdx}
                  type="button"
                  onClick={() => setHariTerpilih(hariIdx)}
                  style={{
                    flex: '0 0 calc(14.28% - 7px)',
                    minWidth: '56px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '10px 4px',
                    borderRadius: 'var(--md-sys-shape-corner-medium, 12px)',
                    border: isToday && !isSelected
                      ? '1px solid var(--md-sys-color-primary)'
                      : 'none',
                    backgroundColor: isSelected
                      ? 'var(--md-sys-color-primary-container)'
                      : 'var(--md-sys-color-surface-container)',
                    color: isSelected
                      ? 'var(--md-sys-color-on-primary-container)'
                      : 'var(--md-sys-color-on-surface)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                    position: 'relative',
                  }}
                >
                  <span
                    className="typescale-label-small"
                    style={{
                      fontWeight: isSelected || isToday ? 'bold' : 'normal',
                    }}
                  >
                    {getNamaHari(hariIdx).substring(0, 3)}
                  </span>

                  {/* Dot Indikator Kelas */}
                  {jumlahKelas > 0 && (
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                        backgroundColor: isSelected
                          ? 'var(--md-sys-color-on-primary-container)'
                          : 'var(--md-sys-color-primary)',
                        marginTop: '6px',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Daftar Kelas untuk Hari Terpilih */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h2 className="typescale-title-medium" style={{ margin: 0 }}>
              Jadwal {getNamaHari(hariTerpilih)}
            </h2>
            <span className="typescale-label-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
              {sesiHariTerpilih.length} kelas
            </span>
          </div>

          {sesiHariTerpilih.length === 0 ? (
            <Card variant="outlined" style={{ textAlign: 'center', padding: '36px 16px' }}>
              <Icon name="event_available" size="48px" color="var(--md-sys-color-primary)" />
              <p className="typescale-title-medium" style={{ margin: '12px 0 4px 0' }}>
                Tidak ada kelas hari {getNamaHari(hariTerpilih)} 🎉
              </p>
              <p className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '14px' }}>
                Nikmati waktu luangmu atau cicil tugas yang ada.
              </p>
              <Button
                variant="filled"
                icon="add"
                onClick={() => {
                  setHariInput(hariTerpilih);
                  bukaDialog();
                }}
                style={{
                  padding: '10px 20px',
                  fontSize: 'var(--md-sys-typescale-label-large-size, 14px)',
                  fontWeight: 700,
                  borderRadius: 'var(--md-sys-shape-corner-medium, 16px)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                  whiteSpace: 'nowrap',
                }}
              >
                Tambah Sesi Hari Ini
              </Button>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sesiHariTerpilih.map((sesi) => {
                const matkul = daftarMatkul.find((m) => m.id === sesi.matkulId);
                const adaBentrok = periksaBentrok(sesi, sesiHariTerpilih);

                return (
                  <Card
                    key={sesi.id}
                    variant="filled"
                    onClick={() => bukaDialog(sesi)}
                    style={{
                      borderLeft: `6px solid ${matkul?.warna || 'var(--md-sys-color-primary)'}`,
                      padding: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          className="typescale-title-medium"
                          style={{ fontWeight: 'bold' }}
                        >
                          {sesi.jamMulai} – {sesi.jamSelesai}
                        </span>
                        <span
                          className="typescale-label-small"
                          style={{
                            backgroundColor: 'var(--md-sys-color-surface-container-high)',
                            padding: '2px 8px',
                            borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
                            textTransform: 'capitalize',
                          }}
                        >
                          {sesi.tipe}
                        </span>
                      </div>

                      {adaBentrok && (
                        <span
                          className="typescale-label-small"
                          style={{
                            backgroundColor: 'var(--kk-status-mendesak-container)',
                            color: 'var(--kk-status-on-mendesak-container)',
                            padding: '2px 8px',
                            borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 'bold',
                          }}
                        >
                          <Icon name="warning" size="14px" />
                          Bentrok Waktu
                        </span>
                      )}
                    </div>

                    <h3 className="typescale-title-large" style={{ margin: '8px 0 4px 0' }}>
                      {matkul?.nama || 'Mata Kuliah'}
                    </h3>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '12px',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        marginTop: '4px',
                      }}
                    >
                      {sesi.ruang && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Icon name="meeting_room" size="16px" />
                          <span className="typescale-body-small">Ruang {sesi.ruang}</span>
                        </div>
                      )}
                      {matkul?.dosen && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Icon name="person" size="16px" />
                          <span className="typescale-body-small">{matkul.dosen}</span>
                        </div>
                      )}
                      {matkul?.sks && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Icon name="school" size="16px" />
                          <span className="typescale-body-small">{matkul.sks} SKS</span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Mode Tampilan Mingguan */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {([1, 2, 3, 4, 5, 6, 7] as const).map((hIdx) => {
            const listPerHari = daftarSesi
              .filter((s) => s.hari === hIdx)
              .sort((a, b) => parseWaktuKeMenit(a.jamMulai) - parseWaktuKeMenit(b.jamMulai));

            if (listPerHari.length === 0) return null;

            return (
              <div key={hIdx}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '8px',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                      backgroundColor: hIdx === hariIniIso ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline)',
                    }}
                  />
                  <h3 className="typescale-title-medium" style={{ margin: 0 }}>
                    {getNamaHari(hIdx)}
                  </h3>
                  {hIdx === hariIniIso && (
                    <span
                      className="typescale-label-small"
                      style={{
                        backgroundColor: 'var(--md-sys-color-primary-container)',
                        color: 'var(--md-sys-color-on-primary-container)',
                        padding: '2px 6px',
                        borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
                      }}
                    >
                      Hari Ini
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {listPerHari.map((sesi) => {
                    const matkul = daftarMatkul.find((m) => m.id === sesi.matkulId);
                    const adaBentrok = periksaBentrok(sesi, listPerHari);

                    return (
                      <Card
                        key={sesi.id}
                        variant="filled"
                        onClick={() => bukaDialog(sesi)}
                        style={{
                          borderLeft: `5px solid ${matkul?.warna || 'var(--md-sys-color-primary)'}`,
                          padding: '12px 14px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span className="typescale-label-medium" style={{ fontWeight: 'bold' }}>
                              {sesi.jamMulai} – {sesi.jamSelesai}
                            </span>
                            <h4 className="typescale-title-medium" style={{ margin: '2px 0 0 0' }}>
                              {matkul?.nama || 'Mata Kuliah'}
                            </h4>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            {sesi.ruang && (
                              <span className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                                R.{sesi.ruang}
                              </span>
                            )}
                            {adaBentrok && (
                              <div style={{ color: 'var(--kk-status-mendesak)', fontSize: '11px', fontWeight: 'bold' }}>
                                ⚠️ Bentrok
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog Sesi */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        headline={editSesiId ? 'Ubah Sesi Jadwal' : 'Tambah Sesi Jadwal Baru'}
        icon="schedule"
        actions={
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              width: '100%',
            }}
          >
            {editSesiId && (
              <Button
                variant="text"
                icon="delete"
                onClick={handleHapusSesi}
                style={{
                  color: 'var(--md-sys-color-error)',
                  fontWeight: 700,
                  minWidth: '44px',
                  padding: '0 12px',
                }}
                ariaLabel="Hapus Sesi"
              >
                Hapus
              </Button>
            )}

            <Button
              variant="outlined"
              onClick={() => setDialogOpen(false)}
              style={{
                flex: 1,
                minHeight: '44px',
                fontWeight: 700,
                borderRadius: 'var(--md-sys-shape-corner-medium, 16px)',
              }}
            >
              Batal
            </Button>

            <Button
              variant="filled"
              icon="check"
              onClick={simpanSesi}
              style={{
                flex: 1.2,
                minHeight: '44px',
                fontWeight: 700,
                borderRadius: 'var(--md-sys-shape-corner-medium, 16px)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
              }}
            >
              Simpan Sesi
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '4px' }}>
          {/* Section: Mata Kuliah & Hari */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Select
              label="Mata Kuliah"
              value={pilihanMatkulId}
              onChange={setPilihanMatkulId}
              options={daftarMatkul.map((m) => ({
                value: String(m.id),
                label: m.nama,
                supportingText: m.kode ? `${m.kode} · ${m.sks} SKS` : undefined,
              }))}
            />

            <Select
              label="Hari Pertemuan"
              value={String(hariInput)}
              onChange={(v) => setHariInput(Number(v) as any)}
              options={[
                { value: '1', label: 'Senin' },
                { value: '2', label: 'Selasa' },
                { value: '3', label: 'Rabu' },
                { value: '4', label: 'Kamis' },
                { value: '5', label: 'Jumat' },
                { value: '6', label: 'Sabtu' },
                { value: '7', label: 'Minggu' },
              ]}
            />
          </div>

          {/* Section: Waktu Perkuliahan */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--md-sys-color-surface-container)',
              borderRadius: 'var(--md-sys-shape-corner-medium, 16px)',
              border: '1px solid var(--md-sys-color-outline-variant)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxSizing: 'border-box',
              width: '100%',
            }}
          >
            <div
              style={{
                fontSize: 'var(--md-sys-typescale-label-medium-size)',
                fontWeight: 700,
                color: 'var(--md-sys-color-on-surface)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Icon name="schedule" size="18px" color="var(--md-sys-color-primary)" />
              Waktu Perkuliahan
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0, width: '100%' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--md-sys-typescale-label-small-size)',
                    fontWeight: 700,
                    color: 'var(--md-sys-color-on-surface-variant)',
                    marginBottom: '6px',
                  }}
                >
                  Jam Mulai
                </label>
                <input
                  type="time"
                  aria-label="Jam Mulai"
                  value={jamMulai}
                  onChange={(e) => setJamMulai(e.target.value)}
                  style={{
                    width: '100%',
                    minWidth: 0,
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 8px',
                    borderRadius: 'var(--md-sys-shape-corner-small, 10px)',
                    border: '1px solid var(--md-sys-color-outline)',
                    background: 'var(--md-sys-color-surface)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontFamily: 'var(--md-ref-typeface-plain)',
                    fontSize: 'var(--md-sys-typescale-body-large-size)',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                />
              </div>

              <div style={{ minWidth: 0, width: '100%' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--md-sys-typescale-label-small-size)',
                    fontWeight: 700,
                    color: 'var(--md-sys-color-on-surface-variant)',
                    marginBottom: '6px',
                  }}
                >
                  Jam Selesai
                </label>
                <input
                  type="time"
                  aria-label="Jam Selesai"
                  value={jamSelesai}
                  onChange={(e) => setJamSelesai(e.target.value)}
                  style={{
                    width: '100%',
                    minWidth: 0,
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    padding: '10px 8px',
                    borderRadius: 'var(--md-sys-shape-corner-small, 10px)',
                    border: '1px solid var(--md-sys-color-outline)',
                    background: 'var(--md-sys-color-surface)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontFamily: 'var(--md-ref-typeface-plain)',
                    fontSize: 'var(--md-sys-typescale-body-large-size)',
                    fontWeight: 600,
                    textAlign: 'center',
                  }}
                />
              </div>
            </div>

            {/* Peringatan Bentrok Real-time */}
            {(() => {
              const mulaiA = parseWaktuKeMenit(jamMulai);
              const selesaiA = parseWaktuKeMenit(jamSelesai);
              if (mulaiA >= selesaiA) return null;

              const sesiBentrok = daftarSesi.find((s) => {
                if (editSesiId && s.id === editSesiId) return false;
                if (s.hari !== Number(hariInput)) return false;
                const mulaiB = parseWaktuKeMenit(s.jamMulai);
                const selesaiB = parseWaktuKeMenit(s.jamSelesai);
                return Math.max(mulaiA, mulaiB) < Math.min(selesaiA, selesaiB);
              });
              if (!sesiBentrok) return null;
              const matkulBentrok = daftarMatkul.find((m) => m.id === sesiBentrok.matkulId);

              return (
                <div
                  style={{
                    backgroundColor: 'var(--kk-status-mendesak-container)',
                    color: 'var(--kk-status-on-mendesak-container)',
                    padding: '8px 12px',
                    borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: 'var(--md-sys-typescale-label-small-size)',
                    fontWeight: 600,
                  }}
                >
                  <Icon name="warning" size="18px" />
                  <span>
                    Bentrok dengan {matkulBentrok?.nama || 'sesi lain'} ({sesiBentrok.jamMulai} - {sesiBentrok.jamSelesai})
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Section: Lokasi & Tipe Sesi */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <TextField
              label="Ruangan (Opsional)"
              value={ruang}
              onChange={setRuang}
              placeholder="Misal: Lab Komputer 2 / Gedung A R.302"
            />

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--md-sys-typescale-label-medium-size)',
                  fontWeight: 700,
                  color: 'var(--md-sys-color-on-surface)',
                  marginBottom: '8px',
                }}
              >
                Tipe Sesi Perkuliahan
              </label>
              <SegmentedButton
                selected={tipe}
                onChange={(val) => setTipe(val as any)}
                segments={[
                  { value: 'teori', label: 'Teori' },
                  { value: 'praktikum', label: 'Praktikum' },
                ]}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
