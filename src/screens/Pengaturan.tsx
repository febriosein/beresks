import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  Button,
  IconButton,
  Dialog,
  TextField,
  Icon,
  SegmentedButton,
  showSnackbar,
  useRegisterFab,
} from '../ui/index.js';
import { Screen, ScreenHeader, DateField } from '../ui/layout/index.js';
import {
  useDaftarSemester,
  useSemesterAktif,
  useDaftarMatkul,
  useSemuaSesi,
  useDaftarTugas,
  tambahSemester,
  aktifkanSemester,
  hapusSemester,
  usePengaturan,
  simpanPengaturan,
  type Semester,
} from '../data/repo/index.js';
import {
  buatBackupData,
  unduhFileBackup,
  validasiBackupData,
  pulihkanBackupData,
  type BackupPayload,
} from '../features/backup/backupRestore.js';
import { hasilkanIcs, unduhFileIcs } from '../features/ics/exportIcs.js';
import { format, addMonths } from 'date-fns';
import { haptic } from '../lib/haptic.js';

export function Pengaturan() {
  const navigate = useNavigate();
  const daftarSemester = useDaftarSemester() || [];
  const semesterAktif = useSemesterAktif();
  const daftarMatkul = useDaftarMatkul(semesterAktif?.id) || [];
  const daftarSesi = useSemuaSesi() || [];
  const daftarTugas = useDaftarTugas() || [];
  const pengaturan = usePengaturan();

  useRegisterFab({ hide: true, label: '', icon: '', onClick: () => { } });

  // State Dialog Tambah Semester
  const [dialogSemesterOpen, setDialogSemesterOpen] = useState(false);
  const [namaSemester, setNamaSemester] = useState('');
  const [tglMulai, setTglMulai] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [tglSelesai, setTglSelesai] = useState(() => format(addMonths(new Date(), 6), 'yyyy-MM-dd'));

  // State Konfirmasi Restore
  const [dialogRestoreOpen, setDialogRestoreOpen] = useState(false);
  const [payloadRestore, setPayloadRestore] = useState<BackupPayload | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State PWA Install Prompt
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isIos] = useState(() => typeof window !== 'undefined' && /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()));
  const [isStandalone] = useState(() => typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || Boolean((window.navigator as any).standalone)));

  useEffect(() => {
    // Tangkap event beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (installPrompt) {
      haptic('light');
      installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallPrompt(null);
      }
    }
  };

  // Tambah Semester
  const handleSimpanSemester = async () => {
    if (!namaSemester.trim()) return;
    haptic('success');
    const sId = await tambahSemester({
      nama: namaSemester.trim(),
      tanggalMulai: new Date(tglMulai).getTime(),
      tanggalSelesai: new Date(tglSelesai).getTime(),
      aktif: true,
    });
    setDialogSemesterOpen(false);
    showSnackbar({ message: 'Semester baru dibuat dan diaktifkan' });
    await aktifkanSemester(sId);
  };

  // Ekspor Kalender .ics
  const handleEksporIcs = () => {
    if (!semesterAktif) {
      haptic('warning');
      showSnackbar({ message: 'Tidak ada semester aktif untuk diekspor' });
      return;
    }

    haptic('light');
    const icsText = hasilkanIcs({
      semester: semesterAktif,
      daftarMatkul,
      daftarSesi,
      daftarTugas,
    });

    unduhFileIcs(icsText, `jadwal_${semesterAktif.nama.toLowerCase().replace(/\s+/g, '_')}.ics`);
    showSnackbar({ message: 'Kalender .ics berhasil diunduh' });
  };

  // Ekspor Backup JSON
  const handleEksporBackup = async () => {
    haptic('light');
    const backup = await buatBackupData();
    unduhFileBackup(backup);
    showSnackbar({ message: 'Cadangan data berhasil diunduh' });
  };

  // Handler Pilih File Restore
  const handlePilihFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawJson = JSON.parse(event.target?.result as string);
        const hasilValidasi = validasiBackupData(rawJson);
        if (!hasilValidasi.valid || !hasilValidasi.data) {
          haptic('error');
          showSnackbar({ message: `Gagal: ${hasilValidasi.pesan || 'Format file salah'}` });
          return;
        }

        haptic('light');
        setPayloadRestore(hasilValidasi.data);
        setDialogRestoreOpen(true);
      } catch {
        haptic('error');
        showSnackbar({ message: 'File bukan JSON yang valid' });
      }
    };
    reader.readAsText(file);
    // Reset file input agar bisa dipilih ulang
    e.target.value = '';
  };

  // Konfirmasi Pulihkan Backup
  const handleKonfirmasiRestore = async () => {
    if (!payloadRestore) return;
    haptic('success');
    await pulihkanBackupData(payloadRestore);
    setDialogRestoreOpen(false);
    setPayloadRestore(null);
    showSnackbar({ message: 'Data berhasil dipulihkan!' });
    navigate('/');
  };

  return (
    <Screen size="normal">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <IconButton
          icon="arrow_back"
          ariaLabel="Kembali ke Beranda"
          onClick={() => {
            haptic('light');
            navigate('/');
          }}
        />
        <div style={{ flex: 1 }}>
          <ScreenHeader
            title="Pengaturan"
            subtitle="Semester, kalender, cadangan & info PWA"
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* SEKSI TEMA TAMPILAN */}
        <Card
          variant="outlined"
          style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: 'var(--md-sys-color-secondary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--md-sys-color-on-secondary-container)',
                flexShrink: 0,
              }}
            >
              <Icon name="palette" size="22px" />
            </div>
            <div>
              <h2 className="typescale-title-medium" style={{ margin: 0, fontWeight: 700 }}>
                Tema Tampilan
              </h2>
              <p
                className="typescale-body-small"
                style={{ margin: 0, color: 'var(--md-sys-color-on-surface-variant)' }}
              >
                Pilih mode terang, gelap, atau otomatis mengikuti sistem
              </p>
            </div>
          </div>

          <SegmentedButton
            segments={[
              { value: 'sistem', label: 'Sistem', icon: 'devices' },
              { value: 'terang', label: 'Terang', icon: 'light_mode' },
              { value: 'gelap', label: 'Gelap', icon: 'dark_mode' },
            ]}
            selected={pengaturan.tema || 'sistem'}
            onChange={(val) => {
              haptic('selection');
              simpanPengaturan({ tema: val as any });
              showSnackbar({ message: `Tema diubah ke mode ${val}` });
            }}
            style={{ width: '100%', marginTop: '4px' }}
          />
        </Card>

        {/* SEKSI 1: PASANG APLIKASI (PWA) */}
        {!isStandalone && (
          <Card
            variant="filled"
            style={{
              backgroundColor: 'var(--md-sys-color-primary-container)',
              color: 'var(--md-sys-color-on-primary-container)',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <Icon name="install_mobile" size="28px" />
              <div>
                <h2 className="typescale-title-medium" style={{ margin: 0, fontWeight: 700 }}>
                  Pasang BereSKS di Layar Utama
                </h2>
                <p className="typescale-body-small" style={{ opacity: 0.9, margin: 0 }}>
                  Akses instan seperti aplikasi native dan 100% offline.
                </p>
              </div>
            </div>

            {installPrompt && (
              <Button
                variant="filled"
                icon="download"
                onClick={handleInstallClick}
                style={{
                  backgroundColor: 'var(--md-sys-color-primary)',
                  color: 'var(--md-sys-color-on-primary)',
                  width: '100%',
                  fontWeight: 700,
                  marginTop: '8px',
                }}
              >
                Pasang ke Layar Beranda
              </Button>
            )}

            {isIos && (
              <p className="typescale-body-small" style={{ margin: 0, opacity: 0.9 }}>
                Di Safari iOS: Ketuk tombol <strong>Bagikan</strong> (ikon kotak panah ke atas) lalu pilih <strong>Tambah ke Layar Utama</strong>.
              </p>
            )}
          </Card>
        )}

        {/* SEKSI 2: MANAJEMEN SEMESTER */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 className="typescale-title-medium" style={{ margin: 0, fontWeight: 700 }}>
              Daftar Semester
            </h2>
            <Button
              variant="text"
              icon="add"
              onClick={() => {
                haptic('light');
                setNamaSemester('');
                setDialogSemesterOpen(true);
              }}
            >
              Semester Baru
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {daftarSemester.map((sem: Semester) => (
              <Card
                key={sem.id}
                variant={sem.aktif ? 'filled' : 'outlined'}
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: sem.aktif ? '5px solid var(--md-sys-color-primary)' : undefined,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 className="typescale-title-medium" style={{ margin: 0, fontWeight: 700 }}>
                      {sem.nama}
                    </h3>
                    {sem.aktif && (
                      <span
                        className="typescale-label-small"
                        style={{
                          backgroundColor: 'var(--md-sys-color-primary)',
                          color: 'var(--md-sys-color-on-primary)',
                          padding: '2px 8px',
                          borderRadius: 'var(--md-sys-shape-corner-full, 9999px)',
                          fontWeight: 'bold',
                        }}
                      >
                        Aktif
                      </span>
                    )}
                  </div>
                  <p
                    className="typescale-body-small"
                    style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: '4px 0 0 0' }}
                  >
                    {format(new Date(sem.tanggalMulai), 'd MMM yyyy')} – {format(new Date(sem.tanggalSelesai), 'd MMM yyyy')}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '4px' }}>
                  {!sem.aktif && (
                    <Button
                      variant="text"
                      onClick={async () => {
                        haptic('selection');
                        await aktifkanSemester(sem.id!);
                        showSnackbar({ message: `Semester aktif diubah ke ${sem.nama}` });
                      }}
                    >
                      Aktifkan
                    </Button>
                  )}
                  {daftarSemester.length > 1 && (
                    <IconButton
                      icon="delete"
                      ariaLabel="Hapus Semester"
                      onClick={async () => {
                        haptic('warning');
                        await hapusSemester(sem.id!);
                        showSnackbar({ message: 'Semester dihapus' });
                      }}
                    />
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* SEKSI 3: KALENDER & PENGINGAT (.ICS) */}
        <div>
          <h2 className="typescale-title-medium" style={{ margin: '0 0 8px 0', fontWeight: 700 }}>
            Ekspor Kalender
          </h2>
          <Card variant="outlined" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
              <Icon name="event_upcoming" size="32px" color="var(--md-sys-color-primary)" />
              <div>
                <h3 className="typescale-title-small" style={{ margin: 0, fontWeight: 700 }}>
                  Sinkronkan ke Google Calendar / Apple Calendar
                </h3>
                <p className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
                  Unduh berkas .ics berisi jadwal kelas mingguan berulang dan pengingat alarm tugas.
                </p>
              </div>
            </div>
            <Button
              variant="outlined"
              icon="calendar_month"
              onClick={handleEksporIcs}
              style={{ width: '100%', fontWeight: 700 }}
            >
              Unduh Berkas Kalender (.ics)
            </Button>
          </Card>
        </div>

        {/* SEKSI 4: CADANGAN DATA (BACKUP & RESTORE) */}
        <div>
          <h2 className="typescale-title-medium" style={{ margin: '0 0 8px 0', fontWeight: 700 }}>
            Cadangan & Pemulihan (Offline)
          </h2>
          <Card variant="outlined" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: 0 }}>
              Semua data BereSKS disimpan di IndexedDB perangkatmu. Kamu bisa mengekspornya ke satu berkas JSON atau memulihkannya kapan pun.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Button
                variant="outlined"
                icon="file_download"
                onClick={handleEksporBackup}
                style={{ fontWeight: 600 }}
              >
                Ekspor JSON
              </Button>

              <Button
                variant="outlined"
                icon="file_upload"
                onClick={() => {
                  haptic('light');
                  fileInputRef.current?.click();
                }}
                style={{ fontWeight: 600 }}
              >
                Pulihkan JSON
              </Button>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              style={{ display: 'none' }}
              onChange={handlePilihFileRestore}
            />
          </Card>
        </div>

        {/* SEKSI 5: TENTANG BERESKS */}
        <div>
          <Card variant="filled" style={{ padding: '20px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: '#ffffff',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              }}
            >
              <img
                src="/logo.png"
                alt="Logo BereSKS"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <h3 className="typescale-title-medium" style={{ margin: '10px 0 2px 0', fontWeight: 800 }}>
              BereSKS v1.5.1
            </h3>
          </Card>
        </div>
      </div>

      {/* Dialog Tambah Semester */}
      <Dialog
        open={dialogSemesterOpen}
        onClose={() => setDialogSemesterOpen(false)}
        headline="Tambah Semester Baru"
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
              onClick={() => setDialogSemesterOpen(false)}
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
              disabled={!namaSemester.trim()}
              onClick={handleSimpanSemester}
              style={{
                flex: 1.2,
                minHeight: '44px',
                fontWeight: 700,
                borderRadius: 'var(--md-sys-shape-corner-medium, 16px)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
              }}
            >
              Simpan & Aktifkan
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px' }}>
          <TextField
            label="Nama Semester"
            value={namaSemester}
            onChange={setNamaSemester}
            placeholder="Contoh: Semester 4 Genap"
            required
            autoFocus
          />

          <DateField
            label="Tanggal Mulai"
            value={tglMulai}
            onChange={setTglMulai}
          />

          <DateField
            label="Tanggal Selesai"
            value={tglSelesai}
            onChange={setTglSelesai}
          />
        </div>
      </Dialog>

      {/* Dialog Konfirmasi Restore */}
      <Dialog
        open={dialogRestoreOpen}
        onClose={() => setDialogRestoreOpen(false)}
        headline="Pulihkan Cadangan Data?"
        icon="warning"
        actions={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="text" onClick={() => setDialogRestoreOpen(false)}>
              Batal
            </Button>
            <Button
              variant="filled"
              onClick={handleKonfirmasiRestore}
              style={{ backgroundColor: 'var(--md-sys-color-error)', color: 'var(--md-sys-color-on-error)', fontWeight: 700 }}
            >
              Ganti & Pulihkan
            </Button>
          </div>
        }
      >
        <p className="typescale-body-medium">
          Memulihkan cadangan akan menggantikan seluruh data jadwal, mata kuliah, dan tugas yang ada saat ini dengan data dari file cadangan ({payloadRestore?.data.mataKuliah.length} mata kuliah, {payloadRestore?.data.tugas.length} tugas).
        </p>
      </Dialog>
    </Screen>
  );
}
