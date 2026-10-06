import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Tabs,
  Card,
  Button,
  IconButton,
  TextField,
  Dialog,
  Icon,
  Select,
  SegmentedButton,
  showSnackbar,
} from '../ui/index.js';
import {
  useMatkul,
  useDaftarSesi,
  useDaftarTugas,
  ubahMatkul,
  hapusMatkul,
  tambahSesi,
  ubahSesi,
  hapusSesi,
  tambahTugas,
  ubahStatusTugas,
  hapusTugas,
  type SesiKelas,
  type Tugas,
} from '../data/repo/index.js';
import { useQuickAddStore } from '../features/quick-add/useQuickAddStore.js';
import { DAFTAR_WARNA_MATKUL } from '../lib/warna.js';
import { formatTenggat, apakahTerlambat, getNamaHari } from '../lib/tanggal.js';

export function DetailMataKuliah() {
  const { id } = useParams<{ id: string }>();
  const matkulId = Number(id);
  const navigate = useNavigate();

  const matkul = useMatkul(matkulId);
  const daftarSesi = useDaftarSesi(matkulId) || [];
  const daftarTugas = useDaftarTugas(matkulId) || [];

  const { openQuickAdd } = useQuickAddStore();

  const [activeTab, setActiveTab] = useState(0);

  // State Dialog Sesi
  const [dialogSesiOpen, setDialogSesiOpen] = useState(false);
  const [editSesiId, setEditSesiId] = useState<number | null>(null);
  const [hariSesi, setHariSesi] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('09:40');
  const [ruangSesi, setRuangSesi] = useState('');
  const [tipeSesi, setTipeSesi] = useState<'teori' | 'praktikum'>('teori');

  // State Dialog Edit Matkul
  const [dialogEditMatkulOpen, setDialogEditMatkulOpen] = useState(false);
  const [editNama, setEditNama] = useState('');
  const [editKode, setEditKode] = useState('');
  const [editSks, setEditSks] = useState('3');
  const [editDosen, setEditDosen] = useState('');
  const [editRuangDefault, setEditRuangDefault] = useState('');
  const [editCatatan, setEditCatatan] = useState('');
  const [editWarna, setEditWarna] = useState('');

  // State Dialog Hapus Matkul
  const [dialogHapusOpen, setDialogHapusOpen] = useState(false);

  if (!matkul) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p className="typescale-body-large">Mata kuliah tidak ditemukan.</p>
        <Button variant="filled" onClick={() => navigate('/matkul')}>
          Kembali ke Daftar
        </Button>
      </div>
    );
  }

  // Buka Dialog Tambah/Edit Sesi
  const bukaDialogSesi = (sesi?: SesiKelas) => {
    if (sesi) {
      setEditSesiId(sesi.id ?? null);
      setHariSesi(sesi.hari);
      setJamMulai(sesi.jamMulai);
      setJamSelesai(sesi.jamSelesai);
      setRuangSesi(sesi.ruang || '');
      setTipeSesi(sesi.tipe);
    } else {
      setEditSesiId(null);
      setHariSesi(1);
      setJamMulai('08:00');
      setJamSelesai('09:40');
      setRuangSesi(matkul.ruangDefault || '');
      setTipeSesi('teori');
    }
    setDialogSesiOpen(true);
  };

  const simpanSesi = async () => {
    if (editSesiId) {
      await ubahSesi(editSesiId, {
        hari: hariSesi,
        jamMulai,
        jamSelesai,
        ruang: ruangSesi.trim() || undefined,
        tipe: tipeSesi,
      });
    } else {
      await tambahSesi({
        matkulId,
        hari: hariSesi,
        jamMulai,
        jamSelesai,
        ruang: ruangSesi.trim() || undefined,
        tipe: tipeSesi,
      });
    }
    setDialogSesiOpen(false);
  };

  const handleHapusSesi = async (sId: number) => {
    await hapusSesi(sId);
  };

  // Buka Dialog Edit Matkul
  const bukaDialogEditMatkul = () => {
    setEditNama(matkul.nama);
    setEditKode(matkul.kode || '');
    setEditSks(String(matkul.sks || 3));
    setEditDosen(matkul.dosen || '');
    setEditRuangDefault(matkul.ruangDefault || '');
    setEditCatatan(matkul.catatan || '');
    setEditWarna(matkul.warna);
    setDialogEditMatkulOpen(true);
  };

  const simpanEditMatkul = async () => {
    if (!editNama.trim()) return;
    await ubahMatkul(matkulId, {
      nama: editNama.trim(),
      kode: editKode.trim() || undefined,
      sks: Number(editSks) || 3,
      dosen: editDosen.trim() || undefined,
      ruangDefault: editRuangDefault.trim() || undefined,
      catatan: editCatatan.trim() || undefined,
      warna: editWarna,
    });
    setDialogEditMatkulOpen(false);
    showSnackbar({ message: 'Data mata kuliah berhasil diperbarui' });
  };

  const konfirmasiHapusMatkul = async () => {
    await hapusMatkul(matkulId);
    showSnackbar({ message: 'Mata kuliah dihapus' });
    navigate('/matkul');
  };

  // Pengelompokan Tugas: Terlambat, Aktif, Selesai
  const tugasTerlambat = daftarTugas.filter((t) => apakahTerlambat(t.tenggat, t.status));
  const tugasAktif = daftarTugas.filter((t) => t.status !== 'selesai' && !apakahTerlambat(t.tenggat, t.status));
  const tugasSelesai = daftarTugas.filter((t) => t.status === 'selesai');

  const renderItemTugas = (tugas: Tugas) => {
    const isSelesai = tugas.status === 'selesai';
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
          opacity: isSelesai ? 0.7 : 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <button
            type="button"
            aria-label={isSelesai ? 'Tandai belum selesai' : 'Tandai selesai'}
            onClick={async () => {
              if (navigator.vibrate) navigator.vibrate(40);
              const statusBaru = isSelesai ? 'belum' : 'selesai';
              await ubahStatusTugas(tugas.id!, statusBaru);
              showSnackbar({
                message: isSelesai ? 'Tugas ditandai belum selesai' : 'Tugas selesai 🎉',
                actionLabel: 'Urungkan',
                onAction: async () => {
                  await ubahStatusTugas(tugas.id!, tugas.status);
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
            <Icon
              name={isSelesai ? 'check_circle' : 'radio_button_unchecked'}
              color={isSelesai ? 'var(--kk-status-selesai)' : 'var(--md-sys-color-outline)'}
              size="24px"
            />
          </button>

          <div style={{ flex: 1 }}>
            <div
              className="typescale-body-large"
              style={{
                textDecoration: isSelesai ? 'line-through' : 'none',
                fontWeight: tugas.prioritas ? 'bold' : 'normal',
              }}
            >
              {tugas.prioritas && (
                <span
                  style={{
                    color: 'var(--kk-status-mendesak)',
                    marginRight: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  ★
                </span>
              )}
              {tugas.judul}
            </div>
            {tugas.catatan && (
              <div
                className="typescale-body-small"
                style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                {tugas.catatan}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {tugas.tenggat && (
            <span
              className="typescale-label-small"
              style={{
                color: terlambat
                  ? 'var(--kk-status-terlambat)'
                  : isSelesai
                  ? 'var(--md-sys-color-on-surface-variant)'
                  : 'var(--md-sys-color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: terlambat ? 'bold' : 'normal',
              }}
            >
              {terlambat && <Icon name="warning" size="14px" />}
              {formatTenggat(tugas.tenggat)}
            </span>
          )}

          <IconButton
            icon="delete"
            ariaLabel="Hapus Tugas"
            onClick={async () => {
              const saved = { ...tugas };
              await hapusTugas(tugas.id!);
              showSnackbar({
                message: 'Tugas dihapus',
                actionLabel: 'Urungkan',
                onAction: async () => {
                  delete saved.id;
                  await tambahTugas(saved);
                },
              });
            }}
          />
        </div>
      </Card>
    );
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%', paddingBottom: '96px' }}>
      {/* Top App Bar & Header */}
      <div
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container)',
          borderBottom: `4px solid ${matkul.warna}`,
          padding: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <IconButton
            icon="arrow_back"
            ariaLabel="Kembali"
            onClick={() => navigate('/matkul')}
          />
          <IconButton
            icon="edit"
            ariaLabel="Edit Mata Kuliah"
            onClick={bukaDialogEditMatkul}
          />
        </div>

        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '12px',
                height: '12px',
                borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                backgroundColor: matkul.warna,
                display: 'inline-block',
              }}
            />
            <h1 className="typescale-headline-small" style={{ margin: 0 }}>
              {matkul.nama}
            </h1>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              marginTop: '8px',
              color: 'var(--md-sys-color-on-surface-variant)',
            }}
          >
            {matkul.kode && (
              <span className="typescale-label-medium">
                Kode: <strong>{matkul.kode}</strong>
              </span>
            )}
            {matkul.sks && (
              <span className="typescale-label-medium">
                SKS: <strong>{matkul.sks}</strong>
              </span>
            )}
            {matkul.dosen && (
              <span className="typescale-label-medium">
                Dosen: <strong>{matkul.dosen}</strong>
              </span>
            )}
            {matkul.ruangDefault && (
              <span className="typescale-label-medium">
                Ruang: <strong>{matkul.ruangDefault}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs: Tugas · Jadwal · Info */}
      <Tabs
        activeTabIndex={activeTab}
        onTabChange={setActiveTab}
        tabs={[
          { label: `Tugas (${daftarTugas.filter((t) => t.status !== 'selesai').length})`, icon: 'assignment' },
          { label: `Jadwal (${daftarSesi.length})`, icon: 'calendar_month' },
          { label: 'Info', icon: 'info' },
        ]}
      />

      <div style={{ padding: '16px' }}>
        {/* TAB 0: TUGAS */}
        {activeTab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Button
              variant="filled"
              icon="add"
              onClick={() => openQuickAdd(matkulId)}
              style={{ width: '100%' }}
            >
              + Tugas untuk Mata Kuliah Ini
            </Button>

            {daftarTugas.length === 0 ? (
              <Card variant="outlined" style={{ textAlign: 'center', padding: '32px 16px' }}>
                <Icon name="assignment_turned_in" size="44px" color="var(--md-sys-color-primary)" />
                <p className="typescale-title-medium" style={{ margin: '12px 0 4px 0' }}>
                  Tidak ada tugas
                </p>
                <p className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Semua tugas untuk mata kuliah ini sudah selesai atau belum dicatat.
                </p>
              </Card>
            ) : (
              <>
                {/* Kelompok Terlambat */}
                {tugasTerlambat.length > 0 && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--kk-status-terlambat)',
                        marginBottom: '8px',
                      }}
                    >
                      <Icon name="warning" size="18px" />
                      <span className="typescale-title-small">
                        Terlambat ({tugasTerlambat.length})
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tugasTerlambat.map((t) => renderItemTugas(t))}
                    </div>
                  </div>
                )}

                {/* Kelompok Aktif */}
                {tugasAktif.length > 0 && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--md-sys-color-on-surface-variant)',
                        marginBottom: '8px',
                      }}
                    >
                      <Icon name="pending_actions" size="18px" />
                      <span className="typescale-title-small">
                        Perlu Dikerjakan ({tugasAktif.length})
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tugasAktif.map((t) => renderItemTugas(t))}
                    </div>
                  </div>
                )}

                {/* Kelompok Selesai */}
                {tugasSelesai.length > 0 && (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--kk-status-selesai)',
                        marginBottom: '8px',
                      }}
                    >
                      <Icon name="check_circle" size="18px" />
                      <span className="typescale-title-small">
                        Selesai ({tugasSelesai.length})
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {tugasSelesai.map((t) => renderItemTugas(t))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* TAB 1: JADWAL */}
        {activeTab === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Button
              variant="filled"
              icon="add"
              onClick={() => bukaDialogSesi()}
              style={{
                width: '100%',
                padding: '12px 22px',
                fontSize: 'var(--md-sys-typescale-label-large-size, 15px)',
                fontWeight: 700,
                borderRadius: 'var(--md-sys-shape-corner-medium, 16px)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
              }}
            >
              Tambah Sesi Kelas
            </Button>

            {daftarSesi.length === 0 ? (
              <Card variant="outlined" style={{ textAlign: 'center', padding: '32px 16px' }}>
                <Icon name="event_busy" size="44px" color="var(--md-sys-color-primary)" />
                <p className="typescale-title-medium" style={{ margin: '12px 0 4px 0' }}>
                  Belum ada sesi kelas
                </p>
                <p className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                  Tambahkan jadwal pertemuan mingguan untuk mata kuliah ini.
                </p>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {daftarSesi.map((sesi) => (
                  <Card
                    key={sesi.id}
                    variant="filled"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--md-sys-shape-corner-medium, 12px)',
                          backgroundColor: 'var(--md-sys-color-primary-container)',
                          color: 'var(--md-sys-color-on-primary-container)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                        }}
                      >
                        {getNamaHari(sesi.hari).substring(0, 3)}
                      </div>
                      <div>
                        <div className="typescale-title-medium">
                          {getNamaHari(sesi.hari)}, {sesi.jamMulai} – {sesi.jamSelesai}
                        </div>
                        <div
                          className="typescale-body-small"
                          style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                        >
                          <span style={{ textTransform: 'capitalize' }}>{sesi.tipe}</span>
                          {sesi.ruang && ` · Ruang ${sesi.ruang}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <IconButton
                        icon="edit"
                        ariaLabel="Edit Sesi"
                        onClick={() => bukaDialogSesi(sesi)}
                      />
                      <IconButton
                        icon="delete"
                        ariaLabel="Hapus Sesi"
                        onClick={() => handleHapusSesi(sesi.id!)}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INFO */}
        {activeTab === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Card variant="filled" style={{ padding: '16px' }}>
              <h2 className="typescale-title-medium" style={{ margin: '0 0 12px 0' }}>
                Detail Informasi
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <span className="typescale-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    Nama Mata Kuliah
                  </span>
                  <p className="typescale-body-large" style={{ margin: 0 }}>
                    {matkul.nama}
                  </p>
                </div>
                <div>
                  <span className="typescale-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    Kode & Bobot SKS
                  </span>
                  <p className="typescale-body-large" style={{ margin: 0 }}>
                    {matkul.kode || '—'} · {matkul.sks || 0} SKS
                  </p>
                </div>
                <div>
                  <span className="typescale-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    Dosen Pengampu
                  </span>
                  <p className="typescale-body-large" style={{ margin: 0 }}>
                    {matkul.dosen || '—'}
                  </p>
                </div>
                <div>
                  <span className="typescale-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                    Ruang Bawaan
                  </span>
                  <p className="typescale-body-large" style={{ margin: 0 }}>
                    {matkul.ruangDefault || '—'}
                  </p>
                </div>
                {matkul.catatan && (
                  <div>
                    <span className="typescale-label-small" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                      Catatan
                    </span>
                    <p className="typescale-body-large" style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {matkul.catatan}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <Button
              variant="outlined"
              icon="edit"
              onClick={bukaDialogEditMatkul}
            >
              Ubah Data Mata Kuliah
            </Button>

            <Button
              variant="text"
              icon="delete"
              onClick={() => setDialogHapusOpen(true)}
              style={{ color: 'var(--md-sys-color-error)' }}
            >
              Hapus Mata Kuliah Ini
            </Button>
          </div>
        )}
      </div>


      {/* Dialog Sesi */}
      <Dialog
        open={dialogSesiOpen}
        onClose={() => setDialogSesiOpen(false)}
        headline={editSesiId ? 'Ubah Sesi Pertemuan' : 'Tambah Sesi Pertemuan'}
        icon="schedule"
        actions={
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Button
              variant="text"
              onClick={() => setDialogSesiOpen(false)}
              style={{
                minWidth: '88px',
                fontWeight: 700,
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              Batal
            </Button>
            <Button
              variant="filled"
              icon="check"
              onClick={simpanSesi}
              style={{
                padding: '10px 22px',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '4px' }}>
          <Select
            label="Hari Pertemuan"
            value={String(hariSesi)}
            onChange={(v) => setHariSesi(Number(v) as any)}
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

          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'var(--md-sys-color-surface-container)',
              borderRadius: 'var(--md-sys-shape-corner-medium, 16px)',
              border: '1px solid var(--md-sys-color-outline-variant)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
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
                    padding: '12px',
                    borderRadius: 'var(--md-sys-shape-corner-small, 10px)',
                    border: '1px solid var(--md-sys-color-outline)',
                    background: 'var(--md-sys-color-surface)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontFamily: 'var(--md-ref-typeface-plain)',
                    fontSize: 'var(--md-sys-typescale-body-large-size)',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div>
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
                    padding: '12px',
                    borderRadius: 'var(--md-sys-shape-corner-small, 10px)',
                    border: '1px solid var(--md-sys-color-outline)',
                    background: 'var(--md-sys-color-surface)',
                    color: 'var(--md-sys-color-on-surface)',
                    fontFamily: 'var(--md-ref-typeface-plain)',
                    fontSize: 'var(--md-sys-typescale-body-large-size)',
                    fontWeight: 600,
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <TextField
              label="Ruangan (Opsional)"
              value={ruangSesi}
              onChange={setRuangSesi}
              placeholder="R.302"
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
                selected={tipeSesi}
                onChange={(val) => setTipeSesi(val as any)}
                segments={[
                  { value: 'teori', label: 'Teori' },
                  { value: 'praktikum', label: 'Praktikum' },
                ]}
              />
            </div>
          </div>
        </div>
      </Dialog>

      {/* Dialog Edit Matkul */}
      <Dialog
        open={dialogEditMatkulOpen}
        onClose={() => setDialogEditMatkulOpen(false)}
        headline="Ubah Data Mata Kuliah"
        icon="edit"
        actions={
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Button
              variant="text"
              onClick={() => setDialogEditMatkulOpen(false)}
              style={{
                minWidth: '88px',
                fontWeight: 700,
                color: 'var(--md-sys-color-on-surface-variant)',
              }}
            >
              Batal
            </Button>
            <Button
              variant="filled"
              icon="check"
              disabled={!editNama.trim()}
              onClick={simpanEditMatkul}
              style={{
                padding: '10px 22px',
                fontWeight: 700,
                borderRadius: 'var(--md-sys-shape-corner-medium, 16px)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
              }}
            >
              Simpan Perubahan
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '4px' }}>
          {/* Section: Identitas Utama */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <TextField
              label="Nama Mata Kuliah"
              value={editNama}
              onChange={setEditNama}
              required
              autoFocus
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <TextField
                label="Kode Mata Kuliah"
                value={editKode}
                onChange={setEditKode}
                placeholder="IF202"
              />
              <TextField
                label="Beban SKS"
                value={editSks}
                onChange={setEditSks}
                type="number"
                placeholder="3"
              />
            </div>
          </div>

          {/* Section: Dosen & Ruang & Catatan */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <TextField
              label="Dosen Pengampu"
              value={editDosen}
              onChange={setEditDosen}
              placeholder="Nama Dosen"
            />

            <TextField
              label="Ruang Kelas Default"
              value={editRuangDefault}
              onChange={setEditRuangDefault}
              placeholder="Gedung C R.101"
            />

            <TextField
              label="Catatan Tambahan (Opsional)"
              value={editCatatan}
              onChange={setEditCatatan}
              placeholder="Keterangan kontrak kuliah, link materi, dll."
              rows={2}
            />
          </div>

          {/* Section: Palet Warna */}
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
                  backgroundColor: editWarna,
                }}
              />
              Warna Label Mata Kuliah
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {DAFTAR_WARNA_MATKUL.map((colorToken) => {
                const isSelected = editWarna === colorToken;
                return (
                  <button
                    key={colorToken}
                    type="button"
                    aria-label={`Pilih warna ${colorToken}`}
                    onClick={() => setEditWarna(colorToken)}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                      backgroundColor: colorToken,
                      border: isSelected
                        ? '3px solid var(--md-sys-color-on-surface)'
                        : '2px solid transparent',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      boxShadow: isSelected ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                      transition: 'all 150ms ease',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      outline: 'none',
                    }}
                  >
                    {isSelected && (
                      <Icon name="check" size="20px" color="var(--md-sys-color-on-primary)" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Dialog>

      {/* Dialog Konfirmasi Hapus Matkul */}
      <Dialog
        open={dialogHapusOpen}
        onClose={() => setDialogHapusOpen(false)}
        headline="Hapus Mata Kuliah?"
        icon="warning"
        actions={
          <div
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Button
              variant="text"
              onClick={() => setDialogHapusOpen(false)}
              style={{ minWidth: '88px', fontWeight: 700 }}
            >
              Batal
            </Button>
            <Button
              variant="filled"
              icon="delete"
              onClick={konfirmasiHapusMatkul}
              style={{
                backgroundColor: 'var(--md-sys-color-error)',
                color: 'var(--md-sys-color-on-error)',
                padding: '10px 22px',
                fontWeight: 700,
                borderRadius: 'var(--md-sys-shape-corner-medium, 16px)',
              }}
            >
              Hapus Permanen
            </Button>
          </div>
        }
      >
        <p className="typescale-body-medium">
          Mata kuliah <strong>{matkul.nama}</strong> beserta seluruh sesi jadwal dan tugas terkaitnya akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
        </p>
      </Dialog>
    </div>
  );
}
