import { useState, useEffect, useMemo } from 'react';
import { getISODay, startOfWeek, addDays } from 'date-fns';
import {
  Screen,
  ScreenHeader,
  EmptyState,
  SkeletonCard,
  StatusPill,
  TimeField,
  MetaRow,
  MetaItem,
  Card,
  Button,
  SegmentedButton,
  Dialog,
  TextField,
  Select,
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
import { haptic } from '../lib/haptic.js';

export function Jadwal() {
  const semesterAktif = useSemesterAktif();
  const daftarMatkulRaw = useDaftarMatkul(semesterAktif?.id);
  const daftarMatkul = useMemo(() => daftarMatkulRaw || [], [daftarMatkulRaw]);
  const semuaSesiRaw = useSemuaSesi();
  const daftarSesi = useMemo(() => semuaSesiRaw || [], [semuaSesiRaw]);

  // Mode Tampilan: 'hari' | 'minggu'
  const [modeTampilan, setModeTampilan] = useState<'hari' | 'minggu'>('hari');

  // Hari yang sedang dipilih untuk tampilan harian (default: hari ini)
  const hariIniIso = useMemo(() => getISODay(new Date()) as 1 | 2 | 3 | 4 | 5 | 6 | 7, []);
  const [hariTerpilih, setHariTerpilih] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(hariIniIso);

  // State Dialog Tambah / Edit Sesi
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editSesiId, setEditSesiId] = useState<number | null>(null);
  const [pilihanMatkulId, setPilihanMatkulId] = useState<string>('');
  const [hariInput, setHariInput] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(hariIniIso);
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
    if (!matkulIdNum) {
      showSnackbar({ message: 'Pilih mata kuliah terlebih dahulu' });
      return;
    }

    haptic('success');

    if (editSesiId) {
      await ubahSesi(editSesiId, {
        matkulId: matkulIdNum,
        hari: hariInput,
        jamMulai,
        jamSelesai,
        ruang: ruang.trim() || undefined,
        tipe,
      });
      showSnackbar({ message: 'Perubahan sesi disimpan' });
    } else {
      await tambahSesi({
        matkulId: matkulIdNum,
        hari: hariInput,
        jamMulai,
        jamSelesai,
        ruang: ruang.trim() || undefined,
        tipe,
      });
      showSnackbar({ message: 'Sesi kuliah ditambahkan' });
    }
    setDialogOpen(false);
  };

  const handleHapusSesi = async () => {
    if (editSesiId) {
      haptic('warning');
      await hapusSesi(editSesiId);
      setDialogOpen(false);
      showSnackbar({ message: 'Sesi kuliah dihapus' });
    }
  };

  // Filter dan urutkan sesi untuk hari yang dipilih
  const sesiHariTerpilih = useMemo(() => {
    return daftarSesi
      .filter((s) => s.hari === hariTerpilih)
      .sort((a, b) => parseWaktuKeMenit(a.jamMulai) - parseWaktuKeMenit(b.jamMulai));
  }, [daftarSesi, hariTerpilih]);

  // Cek bentrok untuk setiap sesi di hari itu
  const periksaBentrok = (sesi: SesiKelas, listSesi: SesiKelas[]): boolean => {
    return listSesi.some((other) => other.id !== sesi.id && apakahSesiBentrok(sesi, other));
  };

  // Tanggal untuk masing-masing hari dalam minggu ini (Kalender strip)
  const tanggalHariIni = useMemo(() => {
    const startWeek = startOfWeek(new Date(), { weekStartsOn: 1 });
    return ([1, 2, 3, 4, 5, 6, 7] as const).map((hIdx) => {
      const dt = addDays(startWeek, hIdx - 1);
      return {
        hariIdx: hIdx,
        tgl: dt.getDate(),
      };
    });
  }, []);

  const isLoading = semuaSesiRaw === undefined || daftarMatkulRaw === undefined;

  return (
    <Screen size="normal">
      {/* Header Halaman */}
      <ScreenHeader
        title="Jadwal Kuliah"
        subtitle={semesterAktif ? semesterAktif.nama : 'Semester Aktif'}
      />

      {/* Switcher Tampilan Harian / Mingguan */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <SegmentedButton
          selected={modeTampilan}
          onChange={(val) => {
            haptic('selection');
            setModeTampilan(val as any);
          }}
          segments={[
            { value: 'hari', label: 'Harian', icon: 'view_day' },
            { value: 'minggu', label: 'Mingguan', icon: 'calendar_view_week' },
          ]}
          style={{ width: '100%', maxWidth: '360px' }}
        />
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : daftarMatkul.length === 0 ? (
        <EmptyState
          icon="school"
          title="Belum ada mata kuliah"
          description="Tambahkan mata kuliah terlebih dahulu sebelum mengatur jadwal sesi perkuliahan."
        />
      ) : modeTampilan === 'hari' ? (
        /* MODE TAMPILAN HARIAN */
        <div>
          {/* Strip Pemilih Hari Kalender (Sen 6, Sel 7...) */}
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
            {tanggalHariIni.map(({ hariIdx, tgl }) => {
              const isSelected = hariIdx === hariTerpilih;
              const isToday = hariIdx === hariIniIso;
              const jumlahKelas = daftarSesi.filter((s) => s.hari === hariIdx).length;

              return (
                <button
                  key={hariIdx}
                  type="button"
                  onClick={() => {
                    haptic('selection');
                    setHariTerpilih(hariIdx);
                  }}
                  className="m3-card--interactive"
                  style={{
                    flex: '1 0 calc(14.28% - 7px)',
                    minWidth: '46px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '8px 4px',
                    borderRadius: 'var(--md-sys-shape-corner-medium, 12px)',
                    border: isToday && !isSelected
                      ? '2px solid var(--md-sys-color-primary)'
                      : '1px solid transparent',
                    backgroundColor: isSelected
                      ? 'var(--md-sys-color-primary-container)'
                      : 'var(--md-sys-color-surface-container)',
                    color: isSelected
                      ? 'var(--md-sys-color-on-primary-container)'
                      : 'var(--md-sys-color-on-surface)',
                    cursor: 'pointer',
                    transition: 'all var(--bs-dur-short, 150ms) ease',
                    position: 'relative',
                    boxSizing: 'border-box',
                  }}
                >
                  <span
                    className="typescale-label-small"
                    style={{
                      fontWeight: isSelected || isToday ? 700 : 500,
                      opacity: isSelected ? 1 : 0.8,
                    }}
                  >
                    {getNamaHari(hariIdx).substring(0, 3)}
                  </span>

                  <span
                    className="typescale-title-small tabular"
                    style={{
                      fontWeight: 800,
                      marginTop: '2px',
                      fontSize: '14px',
                    }}
                  >
                    {tgl}
                  </span>

                  {/* Dot Indikator Kelas */}
                  {jumlahKelas > 0 && (
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                        backgroundColor: isSelected
                          ? 'var(--md-sys-color-on-primary-container)'
                          : 'var(--md-sys-color-primary)',
                        marginTop: '4px',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Header Info Hari Terpilih */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <h2 className="typescale-title-medium" style={{ margin: 0 }}>
              Jadwal {getNamaHari(hariTerpilih)}
            </h2>
            <span
              className="typescale-label-small"
              style={{
                backgroundColor: 'var(--md-sys-color-surface-container-high)',
                padding: '2px 8px',
                borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                fontWeight: 700,
              }}
            >
              {sesiHariTerpilih.length} kelas
            </span>
          </div>

          {sesiHariTerpilih.length === 0 ? (
            <EmptyState
              icon="event_available"
              title={`Tidak ada kelas hari ${getNamaHari(hariTerpilih)}`}
              description="Hari ini bebas perkuliahan. Nikmati waktu santai atau manfaatkan untuk mengerjakan tugas."
              action={{
                label: 'Tambah Sesi Hari Ini',
                icon: 'add',
                onClick: () => {
                  setHariInput(hariTerpilih);
                  bukaDialog();
                },
              }}
            />
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
                    className="m3-card--interactive"
                    style={{
                      borderLeft: `6px solid ${matkul?.warna || 'var(--md-sys-color-primary)'}`,
                      padding: '16px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="typescale-title-medium tabular" style={{ fontWeight: 700 }}>
                          {sesi.jamMulai} – {sesi.jamSelesai}
                        </span>
                        <span
                          className="typescale-label-small"
                          style={{
                            backgroundColor: 'var(--md-sys-color-surface-container-high)',
                            padding: '2px 8px',
                            borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
                            textTransform: 'capitalize',
                            fontWeight: 600,
                          }}
                        >
                          {sesi.tipe}
                        </span>
                      </div>

                      {adaBentrok && (
                        <StatusPill
                          status="mendesak"
                          icon="warning"
                          label="Bentrok Jadwal"
                        />
                      )}
                    </div>

                    <h3 className="typescale-title-large" style={{ margin: '8px 0 6px 0' }}>
                      {matkul?.nama || 'Mata Kuliah'}
                    </h3>

                    <MetaRow divider>
                      {sesi.ruang && <MetaItem icon="meeting_room" text={`Ruang ${sesi.ruang}`} />}
                      {matkul?.dosen && <MetaItem icon="person" text={matkul.dosen} />}
                      {matkul?.sks && <MetaItem icon="school" text={`${matkul.sks} SKS`} />}
                    </MetaRow>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* MODE TAMPILAN MINGGUAN */
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
                        fontWeight: 700,
                      }}
                    >
                      Hari Ini
                    </span>
                  )}
                  <span
                    className="typescale-label-small"
                    style={{
                      marginLeft: 'auto',
                      color: 'var(--md-sys-color-on-surface-variant)',
                    }}
                  >
                    {listPerHari.length} kelas
                  </span>
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
                        className="m3-card--interactive"
                        style={{
                          borderLeft: `5px solid ${matkul?.warna || 'var(--md-sys-color-primary)'}`,
                          padding: '12px 14px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span className="typescale-label-medium tabular" style={{ fontWeight: 700 }}>
                              {sesi.jamMulai} – {sesi.jamSelesai}
                            </span>
                            <h4 className="typescale-title-medium" style={{ margin: '2px 0 0 0' }}>
                              {matkul?.nama || 'Mata Kuliah'}
                            </h4>
                          </div>

                          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                            {sesi.ruang && (
                              <span className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                                R.{sesi.ruang}
                              </span>
                            )}
                            {adaBentrok && (
                              <StatusPill status="mendesak" icon="warning" label="Bentrok" />
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

      {/* Dialog Sesi Kuliah (Tambah / Edit) */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        headline={editSesiId ? 'Ubah Sesi Kuliah' : 'Tambah Sesi Kuliah Baru'}
        icon="schedule"
        actions={
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            {editSesiId ? (
              <Button
                variant="text"
                icon="delete"
                onClick={handleHapusSesi}
                style={{ color: 'var(--md-sys-color-error)' }}
              >
                Hapus
              </Button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="outlined"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                variant="filled"
                icon="check"
                onClick={simpanSesi}
              >
                Simpan
              </Button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '4px' }}>
          {/* Pilihan Mata Kuliah */}
          <Select
            label="Mata Kuliah"
            value={pilihanMatkulId}
            onChange={setPilihanMatkulId}
            options={daftarMatkul.map((m) => ({
              value: String(m.id),
              label: m.nama,
              supportingText: m.kode ? `${m.kode} · ${m.sks} SKS` : undefined,
              color: m.warna,
            }))}
          />

          {/* Pilihan Hari */}
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

          {/* Input Jam dengan TimeField M3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <TimeField
              label="Jam Mulai"
              value={jamMulai}
              onChange={setJamMulai}
            />
            <TimeField
              label="Jam Selesai"
              value={jamSelesai}
              onChange={setJamSelesai}
            />
          </div>

          {/* Input Ruang & Tipe */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <TextField
              label="Ruang Kuliah"
              value={ruang}
              onChange={setRuang}
              placeholder="Contoh: R.304"
            />
            <Select
              label="Tipe Sesi"
              value={tipe}
              onChange={(v) => setTipe(v as 'teori' | 'praktikum')}
              options={[
                { value: 'teori', label: 'Teori' },
                { value: 'praktikum', label: 'Praktikum' },
              ]}
            />
          </div>
        </div>
      </Dialog>
    </Screen>
  );
}

export default Jadwal;
