import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  Button,
  TextField,
  Dialog,
  Icon,
  Select,
  showSnackbar,
} from '../ui/index.js';
import {
  useDaftarSemester,
  useSemesterAktif,
  aktifkanSemester,
  tambahSemester,
  useDaftarMatkul,
  useSemuaSesi,
  useDaftarTugas,
  tambahMatkul,
  type MataKuliah as MataKuliahType,
} from '../data/repo/index.js';
import { DAFTAR_WARNA_MATKUL, dapatkanWarnaMatkulDefault } from '../lib/warna.js';

export function MataKuliah() {
  const navigate = useNavigate();
  const daftarSemester = useDaftarSemester() || [];
  const semesterAktif = useSemesterAktif();
  const [semesterTerpilihId, setSemesterTerpilihId] = useState<number | null>(null);

  // Jika ada semester di database tapi tidak ada yang aktif, otomatis aktifkan yang pertama
  useEffect(() => {
    if (daftarSemester.length > 0 && !semesterAktif) {
      const adaAktif = daftarSemester.some((s) => s.aktif);
      if (!adaAktif && daftarSemester[0]?.id) {
        aktifkanSemester(daftarSemester[0].id);
      }
    }
  }, [daftarSemester, semesterAktif]);

  // Semester yang aktif atau dipilih
  const targetSemester =
    daftarSemester.find((s) => s.id === semesterTerpilihId) ||
    semesterAktif ||
    daftarSemester[0];

  const daftarMatkul = useDaftarMatkul(targetSemester?.id) || [];
  const semuaSesi = useSemuaSesi() || [];
  const semuaTugas = useDaftarTugas() || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pilihanSemesterId, setPilihanSemesterId] = useState<number | null>(null);
  const [nama, setNama] = useState('');
  const [namaError, setNamaError] = useState('');
  const [kode, setKode] = useState('');
  const [sks, setSks] = useState('3');
  const [dosen, setDosen] = useState('');
  const [ruangDefault, setRuangDefault] = useState('');
  const [warnaPilihan, setWarnaPilihan] = useState(DAFTAR_WARNA_MATKUL[0]);

  const bukaDialogTambah = () => {
    const defaultColor = dapatkanWarnaMatkulDefault(daftarMatkul.length);
    setNama('');
    setNamaError('');
    setKode('');
    setSks('3');
    setDosen('');
    setRuangDefault('');
    setWarnaPilihan(defaultColor);
    setPilihanSemesterId(targetSemester?.id || null);
    setDialogOpen(true);
  };

  const simpanMatkul = async () => {
    const namaBersih = nama.trim();
    if (!namaBersih) {
      setNamaError('Nama mata kuliah wajib diisi');
      showSnackbar({ message: 'Harap isi nama mata kuliah terlebih dahulu' });
      return;
    }

    try {
      let semId = pilihanSemesterId || targetSemester?.id;

      // Fallback: pastikan semesterId selalu tersedia
      if (!semId) {
        if (daftarSemester.length > 0 && daftarSemester[0]?.id) {
          semId = daftarSemester[0].id;
          await aktifkanSemester(semId);
        } else {
          // Buat semester default otomatis jika belum ada semester sama sekali
          semId = await tambahSemester({
            nama: 'Semester 1',
            tanggalMulai: Date.now(),
            tanggalSelesai: Date.now() + 180 * 24 * 60 * 60 * 1000,
            aktif: true,
          });
        }
      }

      await tambahMatkul({
        semesterId: semId,
        nama: namaBersih,
        kode: kode.trim() || undefined,
        sks: Number(sks) || 3,
        dosen: dosen.trim() || undefined,
        ruangDefault: ruangDefault.trim() || undefined,
        warna: warnaPilihan,
      });

      setDialogOpen(false);
      showSnackbar({ message: `Mata kuliah "${namaBersih}" berhasil ditambahkan 🎉` });
    } catch (err) {
      console.error('Gagal menambahkan mata kuliah:', err);
      showSnackbar({ message: 'Gagal menambahkan mata kuliah. Coba lagi.' });
    }
  };

  return (
    <div style={{ padding: '16px', maxWidth: '640px', margin: '0 auto', width: '100%', paddingBottom: '96px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <div>
          <h1 className="typescale-headline-small" style={{ margin: 0 }}>
            Mata Kuliah
          </h1>
          <p
            className="typescale-body-small"
            style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}
          >
            {targetSemester ? targetSemester.nama : 'Semester Aktif'} · {daftarMatkul.length} mata kuliah
          </p>
        </div>

        <Button
          variant="filled"
          icon="add"
          onClick={bukaDialogTambah}
        >
          Tambah
        </Button>
      </div>

      {/* Pilihan Semester jika lebih dari 1 */}
      {daftarSemester.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '8px',
            marginBottom: '16px',
          }}
        >
          {daftarSemester.map((sem) => {
            const isSelected = sem.id === targetSemester?.id;
            return (
              <button
                key={sem.id}
                type="button"
                onClick={() => setSemesterTerpilihId(sem.id!)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                  border: isSelected
                    ? '1px solid var(--md-sys-color-primary)'
                    : '1px solid var(--md-sys-color-outline-variant)',
                  backgroundColor: isSelected
                    ? 'var(--md-sys-color-primary-container)'
                    : 'var(--md-sys-color-surface-container)',
                  color: isSelected
                    ? 'var(--md-sys-color-on-primary-container)'
                    : 'var(--md-sys-color-on-surface)',
                  cursor: 'pointer',
                  fontSize: 'var(--md-sys-typescale-label-medium-size)',
                  fontFamily: 'var(--md-ref-typeface-brand)',
                  fontWeight: isSelected ? 'bold' : 'normal',
                  whiteSpace: 'nowrap',
                }}
              >
                {sem.nama} {sem.aktif ? '★' : ''}
              </button>
            );
          })}
        </div>
      )}

      {/* Daftar Kartu Mata Kuliah */}
      {daftarMatkul.length === 0 ? (
        <Card variant="outlined" style={{ textAlign: 'center', padding: '36px 16px' }}>
          <Icon name="menu_book" size="48px" color="var(--md-sys-color-primary)" />
          <h2 className="typescale-title-medium" style={{ margin: '12px 0 4px 0' }}>
            Belum ada mata kuliah
          </h2>
          <p
            className="typescale-body-medium"
            style={{ color: 'var(--md-sys-color-on-surface-variant)', marginBottom: '16px' }}
          >
            Tambahkan mata kuliah untuk mulai mengatur jadwal dan mencatat tugas.
          </p>
          <Button variant="filled" icon="add" onClick={bukaDialogTambah}>
            Tambah Mata Kuliah
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {daftarMatkul.map((matkul: MataKuliahType) => {
            const sesiMatkul = semuaSesi.filter((s) => s.matkulId === matkul.id);
            const tugasAktif = semuaTugas.filter((t) => t.matkulId === matkul.id && t.status !== 'selesai');

            return (
              <Card
                key={matkul.id}
                variant="filled"
                onClick={() => navigate(`/matkul/${matkul.id}`)}
                style={{
                  borderLeft: `6px solid ${matkul.warna}`,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 className="typescale-title-large" style={{ margin: 0 }}>
                      {matkul.nama}
                    </h2>
                    {matkul.kode && (
                      <span
                        className="typescale-label-small"
                        style={{
                          backgroundColor: 'var(--md-sys-color-surface-container-high)',
                          padding: '2px 6px',
                          borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
                          marginRight: '6px',
                        }}
                      >
                        {matkul.kode}
                      </span>
                    )}
                    {matkul.sks && (
                      <span className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                        {matkul.sks} SKS
                      </span>
                    )}
                  </div>

                  {tugasAktif.length > 0 && (
                    <span
                      className="typescale-label-small"
                      style={{
                        backgroundColor: 'var(--md-sys-color-error-container)',
                        color: 'var(--md-sys-color-on-error-container)',
                        padding: '4px 8px',
                        borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Icon name="assignment" size="14px" />
                      {tugasAktif.length} tugas
                    </span>
                  )}
                </div>

                {matkul.dosen && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--md-sys-color-on-surface-variant)',
                    }}
                  >
                    <Icon name="person" size="16px" />
                    <span className="typescale-body-small">{matkul.dosen}</span>
                  </div>
                )}

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '4px',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--md-sys-color-surface-variant)',
                  }}
                >
                  <span className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    {sesiMatkul.length} sesi pertemuan per minggu
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--md-sys-color-primary)' }}>
                    <span className="typescale-label-medium">Detail</span>
                    <Icon name="chevron_right" size="18px" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog Tambah Mata Kuliah */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        headline="Tambah Mata Kuliah"
        icon="school"
        actions={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="text" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button variant="filled" onClick={simpanMatkul}>
              Simpan
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          {daftarSemester.length > 1 && (
            <Select
              label="Semester"
              value={String(pilihanSemesterId || targetSemester?.id || '')}
              onChange={(val) => setPilihanSemesterId(Number(val))}
              options={daftarSemester.map((s) => ({
                value: String(s.id),
                label: s.aktif ? `${s.nama} (Aktif)` : s.nama,
              }))}
            />
          )}

          <TextField
            label="Nama Mata Kuliah"
            value={nama}
            onChange={(val) => {
              setNama(val);
              if (val.trim()) setNamaError('');
            }}
            error={Boolean(namaError)}
            errorText={namaError}
            placeholder="Misal: Sistem Operasi"
            required
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                simpanMatkul();
              }
            }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <TextField
              label="Kode Mata Kuliah"
              value={kode}
              onChange={setKode}
              placeholder="IF202"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  simpanMatkul();
                }
              }}
            />
            <TextField
              label="SKS"
              value={sks}
              onChange={setSks}
              type="number"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  simpanMatkul();
                }
              }}
            />
          </div>

          <TextField
            label="Dosen Pengampu"
            value={dosen}
            onChange={setDosen}
            placeholder="Nama Dosen"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                simpanMatkul();
              }
            }}
          />

          <TextField
            label="Ruang Default"
            value={ruangDefault}
            onChange={setRuangDefault}
            placeholder="Gedung C R.101"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                simpanMatkul();
              }
            }}
          />

          {/* Pilihan Warna */}
          <div>
            <div
              style={{
                fontSize: 'var(--md-sys-typescale-label-medium-size)',
                color: 'var(--md-sys-color-on-surface-variant)',
                marginBottom: '8px',
              }}
            >
              Warna Label Mata Kuliah
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {DAFTAR_WARNA_MATKUL.map((colorToken) => (
                <button
                  key={colorToken}
                  type="button"
                  aria-label={`Pilih warna ${colorToken}`}
                  onClick={() => setWarnaPilihan(colorToken)}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                    backgroundColor: colorToken,
                    border: warnaPilihan === colorToken ? '3px solid var(--md-sys-color-on-surface)' : '2px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none',
                  }}
                >
                  {warnaPilihan === colorToken && (
                    <Icon name="check" size="20px" color="var(--md-sys-color-on-primary)" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
