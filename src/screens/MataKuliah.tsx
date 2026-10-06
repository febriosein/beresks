import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  Button,
  TextField,
  Dialog,
  Icon,
  Select,
  ChipSet,
  FilterChip,
  showSnackbar,
  useRegisterFab,
} from '../ui/index.js';
import {
  Screen,
  ScreenHeader,
  EmptyState,
  SkeletonCard,
  StatusPill,
  MetaRow,
  MetaItem,
} from '../ui/layout/index.js';
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
import { apakahTerlambat } from '../lib/tanggal.js';
import { haptic } from '../lib/haptic.js';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'MK';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function MataKuliah() {
  const navigate = useNavigate();
  const daftarSemesterRaw = useDaftarSemester();
  const daftarSemester = daftarSemesterRaw || [];
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

  const daftarMatkulRaw = useDaftarMatkul(targetSemester?.id);
  const daftarMatkul = daftarMatkulRaw || [];
  const semuaSesiRaw = useSemuaSesi();
  const semuaSesi = semuaSesiRaw || [];
  const semuaTugasRaw = useDaftarTugas();
  const semuaTugas = semuaTugasRaw || [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pilihanSemesterId, setPilihanSemesterId] = useState<number | null>(null);
  const [nama, setNama] = useState('');
  const [namaError, setNamaError] = useState('');
  const [kode, setKode] = useState('');
  const [sks, setSks] = useState('3');
  const [dosen, setDosen] = useState('');
  const [ruangDefault, setRuangDefault] = useState('');
  const [warnaPilihan, setWarnaPilihan] = useState(DAFTAR_WARNA_MATKUL[0]);

  // Hitung total SKS semester terpilih
  const totalSks = useMemo(
    () => daftarMatkul.reduce((acc, m) => acc + (m.sks || 0), 0),
    [daftarMatkul]
  );

  const bukaDialogTambah = () => {
    haptic('light');
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

  useRegisterFab({
    label: 'Matkul',
    icon: 'add',
    ariaLabel: 'Tambah Mata Kuliah Baru',
    onClick: bukaDialogTambah,
  });

  useEffect(() => {
    const handler = () => bukaDialogTambah();
    window.addEventListener('beresks:buka-tambah-matkul', handler);
    return () => window.removeEventListener('beresks:buka-tambah-matkul', handler);
  }, []);

  const simpanMatkul = async () => {
    const namaBersih = nama.trim();
    if (!namaBersih) {
      setNamaError('Nama mata kuliah wajib diisi');
      haptic('error');
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

      haptic('success');
      setDialogOpen(false);
      showSnackbar({ message: `Mata kuliah "${namaBersih}" berhasil ditambahkan 🎉` });
    } catch (err) {
      console.error('Gagal menambahkan mata kuliah:', err);
      haptic('error');
      showSnackbar({ message: 'Gagal menambahkan mata kuliah. Coba lagi.' });
    }
  };

  const isLoading = daftarSemesterRaw === undefined || daftarMatkulRaw === undefined;

  return (
    <Screen size="normal">
      {/* Header Halaman */}
      <ScreenHeader
        title="Mata Kuliah"
        subtitle={
          targetSemester
            ? `${targetSemester.nama} · ${daftarMatkul.length} mata kuliah · ${totalSks} SKS`
            : `${daftarMatkul.length} mata kuliah · ${totalSks} SKS`
        }
      />

      {/* Pilihan Semester jika lebih dari 1 */}
      {daftarSemester.length > 1 && (
        <div style={{ marginBottom: '16px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <ChipSet>
            {daftarSemester.map((sem) => {
              const isSelected = sem.id === targetSemester?.id;
              return (
                <FilterChip
                  key={sem.id}
                  label={`${sem.nama}${sem.aktif ? ' ★' : ''}`}
                  selected={isSelected}
                  onClick={() => {
                    haptic('selection');
                    setSemesterTerpilihId(sem.id!);
                  }}
                />
              );
            })}
          </ChipSet>
        </div>
      )}

      {/* Daftar Kartu Mata Kuliah */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : daftarMatkul.length === 0 ? (
        <EmptyState
          icon="menu_book"
          title="Belum ada mata kuliah"
          description="Tambahkan mata kuliah untuk mulai mengatur jadwal dan mencatat tugas."
          action={{
            label: 'Tambah Mata Kuliah',
            icon: 'add',
            onClick: bukaDialogTambah,
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {daftarMatkul.map((matkul: MataKuliahType) => {
            const sesiMatkul = semuaSesi.filter((s) => s.matkulId === matkul.id);
            const tugasAktif = semuaTugas.filter(
              (t) => t.matkulId === matkul.id && t.status !== 'selesai'
            );
            const tugasTerlambat = tugasAktif.filter((t) =>
              apakahTerlambat(t.tenggat, t.status)
            );

            return (
              <Card
                key={matkul.id}
                variant="filled"
                interactive
                onClick={() => {
                  haptic('light');
                  navigate(`/matkul/${matkul.id}`);
                }}
                style={{
                  padding: '16px',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Border aksen vertikal kiri */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '5px',
                    backgroundColor: matkul.warna,
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    paddingLeft: '4px',
                  }}
                >
                  {/* Avatar Inisial Berwarna */}
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: 'var(--md-sys-shape-corner-medium, 14px)',
                      backgroundColor: matkul.warna,
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '15px',
                      letterSpacing: '0.5px',
                      flexShrink: 0,
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    {getInitials(matkul.nama)}
                  </div>

                  {/* Konten Utama */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <h2
                        className="typescale-title-medium"
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          lineHeight: 1.3,
                          wordBreak: 'break-word',
                        }}
                      >
                        {matkul.nama}
                      </h2>

                      {/* Status Pill Tugas */}
                      {tugasTerlambat.length > 0 ? (
                        <StatusPill
                          status="terlambat"
                          icon="warning"
                          size="small"
                          label={`${tugasTerlambat.length} terlambat`}
                        />
                      ) : tugasAktif.length > 0 ? (
                        <StatusPill
                          status="info"
                          icon="assignment"
                          size="small"
                          label={`${tugasAktif.length} tugas`}
                        />
                      ) : null}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '6px',
                        flexWrap: 'wrap',
                      }}
                    >
                      {matkul.kode && (
                        <span
                          className="typescale-label-small"
                          style={{
                            backgroundColor: 'var(--md-sys-color-surface-container-high)',
                            padding: '2px 8px',
                            borderRadius: 'var(--md-sys-shape-corner-small, 6px)',
                            fontWeight: 700,
                            color: 'var(--md-sys-color-on-surface-variant)',
                          }}
                        >
                          {matkul.kode}
                        </span>
                      )}
                      <span
                        className="typescale-body-small"
                        style={{
                          color: 'var(--md-sys-color-on-surface-variant)',
                          fontWeight: 600,
                        }}
                      >
                        {matkul.sks || 0} SKS
                      </span>
                      {matkul.ruangDefault && (
                        <span
                          className="typescale-body-small"
                          style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                        >
                          · R. {matkul.ruangDefault}
                        </span>
                      )}
                    </div>

                    {matkul.dosen && (
                      <div style={{ marginTop: '8px' }}>
                        <MetaRow>
                          <MetaItem icon="person" text={matkul.dosen} />
                        </MetaRow>
                      </div>
                    )}

                    {/* Footer bar kartu */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '12px',
                        paddingTop: '10px',
                        borderTop: '1px solid var(--md-sys-color-outline-variant)',
                      }}
                    >
                      <span
                        className="typescale-body-small"
                        style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                      >
                        {sesiMatkul.length > 0
                          ? `${sesiMatkul.length} sesi pertemuan/minggu`
                          : 'Belum ada jadwal'}
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          color: 'var(--md-sys-color-primary)',
                          fontWeight: 700,
                        }}
                      >
                        <span className="typescale-label-medium">Detail</span>
                        <Icon name="chevron_right" size="18px" />
                      </div>
                    </div>
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
        headline="Tambah Mata Kuliah Baru"
        icon="school"
        actions={
          <div
            style={{
              display: 'flex',
              gap: '10px',
              alignItems: 'center',
              width: '100%',
            }}
          >
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
              onClick={simpanMatkul}
              style={{
                flex: 1.3,
                minHeight: '44px',
                fontWeight: 700,
                borderRadius: 'var(--md-sys-shape-corner-medium, 16px)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
              }}
            >
              Simpan Mata Kuliah
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '4px' }}>
          {/* Section: Identitas Utama */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <TextField
              label="Nama Mata Kuliah"
              value={nama}
              onChange={(val) => {
                setNama(val);
                if (val.trim()) setNamaError('');
              }}
              error={Boolean(namaError)}
              errorText={namaError}
              placeholder="Misal: Sistem Operasi / Basis Data"
              required
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  simpanMatkul();
                }
              }}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '10px',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ minWidth: 0, width: '100%' }}>
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
              </div>
              <div style={{ minWidth: 0, width: '100%' }}>
                <TextField
                  label="Beban SKS"
                  value={sks}
                  onChange={setSks}
                  type="number"
                  placeholder="3"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      simpanMatkul();
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section: Dosen & Ruang */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <TextField
              label="Dosen Pengampu (Opsional)"
              value={dosen}
              onChange={setDosen}
              placeholder="Nama dosen pengampu"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  simpanMatkul();
                }
              }}
            />

            <TextField
              label="Ruang Kelas Default (Opsional)"
              value={ruangDefault}
              onChange={setRuangDefault}
              placeholder="Misal: Gedung C R.101"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  simpanMatkul();
                }
              }}
            />
          </div>

          {/* Section: Semester (jika lebih dari 1) */}
          {daftarSemester.length > 1 && (
            <Select
              label="Semester Target"
              value={String(pilihanSemesterId || targetSemester?.id || '')}
              onChange={(val) => setPilihanSemesterId(Number(val))}
              options={daftarSemester.map((s) => ({
                value: String(s.id),
                label: s.aktif ? `${s.nama} (Aktif)` : s.nama,
              }))}
            />
          )}

          {/* Section: Pilihan Warna */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--md-sys-color-surface-container)',
              borderRadius: 'var(--md-sys-shape-corner-medium, 16px)',
              border: '1px solid var(--md-sys-color-outline-variant)',
            }}
          >
            <div
              style={{
                fontSize: 'var(--md-sys-typescale-label-medium-size)',
                fontWeight: 700,
                color: 'var(--md-sys-color-on-surface)',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: warnaPilihan,
                }}
              />
              Warna Label Mata Kuliah
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {DAFTAR_WARNA_MATKUL.map((colorToken) => {
                const isSelected = warnaPilihan === colorToken;
                return (
                  <button
                    key={colorToken}
                    type="button"
                    aria-label={`Pilih warna ${colorToken}`}
                    onClick={() => {
                      haptic('selection');
                      setWarnaPilihan(colorToken);
                    }}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                      backgroundColor: colorToken,
                      border: isSelected
                        ? '3px solid var(--md-sys-color-on-surface)'
                        : '2px solid transparent',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
                      transition: 'all 150ms ease',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      outline: 'none',
                    }}
                  >
                    {isSelected && (
                      <Icon name="check" size="20px" color="#ffffff" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Dialog>
    </Screen>
  );
}
