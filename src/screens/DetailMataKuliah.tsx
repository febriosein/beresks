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
  useRegisterFab,
} from '../ui/index.js';
import {
  Screen,
  EmptyState,
  StatusPill,
  MetaRow,
  MetaItem,
  TimeField,
} from '../ui/layout/index.js';
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
import { haptic } from '../lib/haptic.js';

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'MK';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function DetailMataKuliah() {
  const { id } = useParams<{ id: string }>();
  const matkulId = Number(id);
  const navigate = useNavigate();

  const matkul = useMatkul(matkulId);
  const daftarSesi = useDaftarSesi(matkulId) || [];
  const daftarTugas = useDaftarTugas(matkulId) || [];

  const { openQuickAdd, openEditTugas } = useQuickAddStore();

  useRegisterFab({
    label: 'Tugas',
    icon: 'add_task',
    ariaLabel: 'Catat Tugas untuk Mata Kuliah Ini',
    onClick: () => {
      haptic('light');
      openQuickAdd(matkulId);
    },
  });

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
      <Screen size="normal">
        <EmptyState
          icon="search_off"
          title="Mata kuliah tidak ditemukan"
          description="Mata kuliah ini mungkin telah dihapus atau tidak tersedia di database."
          action={{
            label: 'Kembali ke Daftar',
            icon: 'arrow_back',
            onClick: () => navigate('/matkul'),
          }}
        />
      </Screen>
    );
  }

  // Buka Dialog Tambah/Edit Sesi
  const bukaDialogSesi = (sesi?: SesiKelas) => {
    haptic('light');
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
    try {
      if (editSesiId) {
        await ubahSesi(editSesiId, {
          hari: hariSesi,
          jamMulai,
          jamSelesai,
          ruang: ruangSesi.trim() || undefined,
          tipe: tipeSesi,
        });
        showSnackbar({ message: 'Sesi perkuliahan diperbarui' });
      } else {
        await tambahSesi({
          matkulId,
          hari: hariSesi,
          jamMulai,
          jamSelesai,
          ruang: ruangSesi.trim() || undefined,
          tipe: tipeSesi,
        });
        showSnackbar({ message: 'Sesi perkuliahan ditambahkan' });
      }
      haptic('success');
      setDialogSesiOpen(false);
    } catch (err) {
      console.error('Gagal menyimpan sesi:', err);
      haptic('error');
      showSnackbar({ message: 'Gagal menyimpan sesi perkuliahan' });
    }
  };

  const handleHapusSesi = async (sId: number) => {
    haptic('warning');
    await hapusSesi(sId);
    showSnackbar({ message: 'Sesi perkuliahan dihapus' });
  };

  // Buka Dialog Edit Matkul
  const bukaDialogEditMatkul = () => {
    haptic('light');
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
    try {
      await ubahMatkul(matkulId, {
        nama: editNama.trim(),
        kode: editKode.trim() || undefined,
        sks: Number(editSks) || 3,
        dosen: editDosen.trim() || undefined,
        ruangDefault: editRuangDefault.trim() || undefined,
        catatan: editCatatan.trim() || undefined,
        warna: editWarna,
      });
      haptic('success');
      setDialogEditMatkulOpen(false);
      showSnackbar({ message: 'Data mata kuliah berhasil diperbarui' });
    } catch (err) {
      console.error('Gagal mengedit matkul:', err);
      haptic('error');
      showSnackbar({ message: 'Gagal memperbarui mata kuliah' });
    }
  };

  const konfirmasiHapusMatkul = async () => {
    haptic('warning');
    await hapusMatkul(matkulId);
    showSnackbar({ message: 'Mata kuliah dihapus' });
    navigate('/matkul');
  };

  // Pengelompokan Tugas: Terlambat, Aktif, Selesai
  const tugasTerlambat = daftarTugas.filter((t) => apakahTerlambat(t.tenggat, t.status));
  const tugasAktif = daftarTugas.filter(
    (t) => t.status !== 'selesai' && !apakahTerlambat(t.tenggat, t.status)
  );
  const tugasSelesai = daftarTugas.filter((t) => t.status === 'selesai');

  const renderItemTugas = (tugas: Tugas) => {
    const isSelesai = tugas.status === 'selesai';
    const terlambat = apakahTerlambat(tugas.tenggat, tugas.status);

    return (
      <Card
        key={tugas.id}
        variant="outlined"
        interactive
        onClick={() => {
          haptic('light');
          openEditTugas(tugas);
        }}
        aria-label={`Buka edit tugas: ${tugas.judul}`}
        style={{
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          opacity: isSelesai ? 0.65 : 1,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
          {/* Target Sentuh 48px untuk Tombol Selesai */}
          <button
            type="button"
            aria-label={isSelesai ? 'Tandai belum selesai' : 'Tandai selesai'}
            onClick={async (e) => {
              e.stopPropagation();
              haptic(isSelesai ? 'medium' : 'success');
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
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
            }}
          >
            <Icon
              name={isSelesai ? 'check_circle' : 'radio_button_unchecked'}
              color={isSelesai ? 'var(--kk-status-selesai)' : 'var(--md-sys-color-outline)'}
              size="24px"
            />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              className="typescale-body-large"
              style={{
                textDecoration: isSelesai ? 'line-through' : 'none',
                fontWeight: tugas.prioritas ? 700 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                wordBreak: 'break-word',
              }}
            >
              {tugas.prioritas && (
                <span
                  style={{
                    color: 'var(--kk-status-mendesak)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: '16px',
                  }}
                >
                  ★
                </span>
              )}
              <span>{tugas.judul}</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '4px',
                flexWrap: 'wrap',
              }}
            >
              {tugas.tenggat && (
                <StatusPill
                  status={terlambat ? 'terlambat' : isSelesai ? 'selesai' : 'info'}
                  icon={terlambat ? 'warning' : 'schedule'}
                  size="small"
                  label={formatTenggat(tugas.tenggat)}
                />
              )}
              {tugas.catatan && (
                <span
                  className="typescale-body-small"
                  style={{
                    color: 'var(--md-sys-color-on-surface-variant)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '180px',
                  }}
                >
                  {tugas.catatan}
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            icon="delete"
            ariaLabel="Hapus Tugas"
            onClick={async () => {
              haptic('warning');
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
    <Screen size="normal">
      {/* Hero Header Card dengan Tint Warna Mata Kuliah */}
      <div
        style={{
          backgroundColor: `color-mix(in srgb, ${matkul.warna} 12%, var(--md-sys-color-surface-container))`,
          border: `1px solid color-mix(in srgb, ${matkul.warna} 30%, var(--md-sys-color-outline-variant))`,
          borderRadius: 'var(--md-sys-shape-corner-large, 24px)',
          padding: '16px 20px',
          marginBottom: '16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Aksen strip atas */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: matkul.warna,
          }}
        />

        {/* Top Navigation Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <IconButton
            icon="arrow_back"
            ariaLabel="Kembali ke Daftar Mata Kuliah"
            onClick={() => {
              haptic('light');
              navigate('/matkul');
            }}
          />

          <div style={{ display: 'flex', gap: '4px' }}>
            <IconButton
              icon="edit"
              ariaLabel="Ubah Data Mata Kuliah"
              onClick={bukaDialogEditMatkul}
            />
            <IconButton
              icon="delete"
              ariaLabel="Hapus Mata Kuliah"
              onClick={() => {
                haptic('warning');
                setDialogHapusOpen(true);
              }}
            />
          </div>
        </div>

        {/* Course Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--md-sys-shape-corner-medium, 16px)',
              backgroundColor: matkul.warna,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px',
              letterSpacing: '0.5px',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
            }}
          >
            {getInitials(matkul.nama)}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              className="typescale-headline-small"
              style={{
                margin: 0,
                fontWeight: 800,
                lineHeight: 1.25,
                wordBreak: 'break-word',
              }}
            >
              {matkul.nama}
            </h1>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginTop: '8px',
                alignItems: 'center',
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
                className="typescale-label-small"
                style={{
                  backgroundColor: 'var(--md-sys-color-surface-container-high)',
                  padding: '2px 8px',
                  borderRadius: 'var(--md-sys-shape-corner-small, 6px)',
                  fontWeight: 700,
                  color: 'var(--md-sys-color-on-surface-variant)',
                }}
              >
                {matkul.sks || 0} SKS
              </span>
              {matkul.ruangDefault && (
                <span
                  className="typescale-body-small"
                  style={{ color: 'var(--md-sys-color-on-surface-variant)', fontWeight: 500 }}
                >
                  Ruang {matkul.ruangDefault}
                </span>
              )}
            </div>

            {matkul.dosen && (
              <div style={{ marginTop: '6px' }}>
                <MetaRow>
                  <MetaItem icon="person" text={matkul.dosen} />
                </MetaRow>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Navigasi: Tugas · Jadwal · Info */}
      <div style={{ marginBottom: '16px' }}>
        <Tabs
          activeTabIndex={activeTab}
          onTabChange={(idx) => {
            haptic('selection');
            setActiveTab(idx);
          }}
          tabs={[
            {
              label: `Tugas (${daftarTugas.filter((t) => t.status !== 'selesai').length})`,
              icon: 'assignment',
            },
            { label: `Jadwal (${daftarSesi.length})`, icon: 'calendar_month' },
            { label: 'Info', icon: 'info' },
          ]}
        />
      </div>

      <div>
        {/* TAB 0: TUGAS */}
        {activeTab === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Button
              variant="filled"
              icon="add"
              onClick={() => {
                haptic('light');
                openQuickAdd(matkulId);
              }}
              style={{
                width: '100%',
                padding: '12px 20px',
                fontWeight: 700,
                borderRadius: 'var(--md-sys-shape-corner-medium, 16px)',
              }}
            >
              Tambah Tugas Mata Kuliah Ini
            </Button>

            {daftarTugas.length === 0 ? (
              <EmptyState
                icon="assignment_turned_in"
                title="Tidak ada tugas"
                description="Semua tugas untuk mata kuliah ini sudah selesai atau belum dicatat."
                action={{
                  label: 'Catat Tugas Baru',
                  icon: 'add',
                  onClick: () => openQuickAdd(matkulId),
                }}
              />
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
              }}
            >
              Tambah Sesi Kelas
            </Button>

            {daftarSesi.length === 0 ? (
              <EmptyState
                icon="event_busy"
                title="Belum ada sesi kelas"
                description="Tambahkan jadwal pertemuan mingguan untuk mata kuliah ini."
                action={{
                  label: 'Tambah Sesi Baru',
                  icon: 'add',
                  onClick: () => bukaDialogSesi(),
                }}
              />
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
                          width: '42px',
                          height: '42px',
                          borderRadius: 'var(--md-sys-shape-corner-medium, 12px)',
                          backgroundColor: 'var(--md-sys-color-primary-container)',
                          color: 'var(--md-sys-color-on-primary-container)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '14px',
                        }}
                      >
                        {getNamaHari(sesi.hari).substring(0, 3)}
                      </div>
                      <div>
                        <div className="typescale-title-medium" style={{ fontWeight: 700 }}>
                          {getNamaHari(sesi.hari)}, {sesi.jamMulai} – {sesi.jamSelesai}
                        </div>
                        <div
                          className="typescale-body-small"
                          style={{
                            color: 'var(--md-sys-color-on-surface-variant)',
                            display: 'flex',
                            gap: '6px',
                            marginTop: '2px',
                          }}
                        >
                          <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                            {sesi.tipe}
                          </span>
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
            <Card variant="filled" style={{ padding: '18px' }}>
              <h2 className="typescale-title-medium" style={{ margin: '0 0 16px 0', fontWeight: 700 }}>
                Detail Informasi Mata Kuliah
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <span
                    className="typescale-label-small"
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  >
                    Nama Mata Kuliah
                  </span>
                  <p className="typescale-body-large" style={{ margin: '2px 0 0 0', fontWeight: 600 }}>
                    {matkul.nama}
                  </p>
                </div>
                <div>
                  <span
                    className="typescale-label-small"
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  >
                    Kode & Bobot SKS
                  </span>
                  <p className="typescale-body-large" style={{ margin: '2px 0 0 0' }}>
                    {matkul.kode || '—'} · {matkul.sks || 0} SKS
                  </p>
                </div>
                <div>
                  <span
                    className="typescale-label-small"
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  >
                    Dosen Pengampu
                  </span>
                  <p className="typescale-body-large" style={{ margin: '2px 0 0 0' }}>
                    {matkul.dosen || '—'}
                  </p>
                </div>
                <div>
                  <span
                    className="typescale-label-small"
                    style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                  >
                    Ruang Bawaan
                  </span>
                  <p className="typescale-body-large" style={{ margin: '2px 0 0 0' }}>
                    {matkul.ruangDefault || '—'}
                  </p>
                </div>
                {matkul.catatan && (
                  <div>
                    <span
                      className="typescale-label-small"
                      style={{ color: 'var(--md-sys-color-on-surface-variant)' }}
                    >
                      Catatan
                    </span>
                    <p
                      className="typescale-body-large"
                      style={{ margin: '2px 0 0 0', whiteSpace: 'pre-wrap' }}
                    >
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
              style={{ fontWeight: 600 }}
            >
              Ubah Data Mata Kuliah
            </Button>

            <Button
              variant="text"
              icon="delete"
              onClick={() => {
                haptic('warning');
                setDialogHapusOpen(true);
              }}
              style={{ color: 'var(--md-sys-color-error)', fontWeight: 600 }}
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
              gap: '10px',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setDialogSesiOpen(false)}
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

          {/* Time inputs using TimeField */}
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

          <TextField
            label="Ruang Kelas (Opsional)"
            value={ruangSesi}
            onChange={setRuangSesi}
            placeholder="Misal: R.302"
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
              gap: '10px',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Button
              variant="outlined"
              onClick={() => setDialogEditMatkulOpen(false)}
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
              disabled={!editNama.trim()}
              onClick={simpanEditMatkul}
              style={{
                flex: 1.2,
                minHeight: '44px',
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
                  value={editKode}
                  onChange={setEditKode}
                  placeholder="IF202"
                />
              </div>
              <div style={{ minWidth: 0, width: '100%' }}>
                <TextField
                  label="Beban SKS"
                  value={editSks}
                  onChange={setEditSks}
                  type="number"
                  placeholder="3"
                />
              </div>
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
                    onClick={() => {
                      haptic('selection');
                      setEditWarna(colorToken);
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
    </Screen>
  );
}
