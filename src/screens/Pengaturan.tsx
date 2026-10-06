import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import {
  Card,
  Button,
  IconButton,
  Dialog,
  TextField,
  Icon,
  showSnackbar,
} from '../ui/index.js';
import {
  useDaftarSemester,
  useSemesterAktif,
  useDaftarMatkul,
  useSemuaSesi,
  useDaftarTugas,
  tambahSemester,
  aktifkanSemester,
  hapusSemester,
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

export function Pengaturan() {
  const navigate = useNavigate();
  const daftarSemester = useDaftarSemester() || [];
  const semesterAktif = useSemesterAktif();
  const daftarMatkul = useDaftarMatkul(semesterAktif?.id) || [];
  const daftarSesi = useSemuaSesi() || [];
  const daftarTugas = useDaftarTugas() || [];

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
      showSnackbar({ message: 'Tidak ada semester aktif untuk diekspor' });
      return;
    }

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
          showSnackbar({ message: `Gagal: ${hasilValidasi.pesan || 'Format file salah'}` });
          return;
        }

        setPayloadRestore(hasilValidasi.data);
        setDialogRestoreOpen(true);
      } catch {
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
    await pulihkanBackupData(payloadRestore);
    setDialogRestoreOpen(false);
    setPayloadRestore(null);
    showSnackbar({ message: 'Data berhasil dipulihkan!' });
    navigate('/');
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', width: '100%', padding: '16px', paddingBottom: '96px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <IconButton
          icon="arrow_back"
          ariaLabel="Kembali"
          onClick={() => navigate('/')}
        />
        <div>
          <h1 className="typescale-headline-small" style={{ margin: 0 }}>
            Pengaturan
          </h1>
          <p className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', marginTop: '2px' }}>
            Semester, kalender, cadangan & info PWA
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                <h2 className="typescale-title-medium" style={{ margin: 0 }}>
                  Pasang KuliahKu di Layar Utama
                </h2>
                <p className="typescale-body-small" style={{ opacity: 0.9 }}>
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
            <h2 className="typescale-title-medium" style={{ margin: 0 }}>
              Daftar Semester
            </h2>
            <Button
              variant="text"
              icon="add"
              onClick={() => {
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
                    <h3 className="typescale-title-medium" style={{ margin: 0 }}>
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
          <h2 className="typescale-title-medium" style={{ margin: '0 0 8px 0' }}>
            Ekspor Kalender
          </h2>
          <Card variant="outlined" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
              <Icon name="event_upcoming" size="32px" color="var(--md-sys-color-primary)" />
              <div>
                <h3 className="typescale-title-small" style={{ margin: 0 }}>
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
              style={{ width: '100%' }}
            >
              Unduh Berkas Kalender (.ics)
            </Button>
          </Card>
        </div>

        {/* SEKSI 4: CADANGAN DATA (BACKUP & RESTORE) */}
        <div>
          <h2 className="typescale-title-medium" style={{ margin: '0 0 8px 0' }}>
            Cadangan & Pemulihan (Offline)
          </h2>
          <Card variant="outlined" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: 0 }}>
              Semua data KuliahKu disimpan di IndexedDB perangkatmu. Kamu bisa mengekspornya ke satu berkas JSON atau memulihkannya kapan pun.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Button
                variant="outlined"
                icon="file_download"
                onClick={handleEksporBackup}
              >
                Ekspor JSON
              </Button>

              <Button
                variant="outlined"
                icon="file_upload"
                onClick={() => fileInputRef.current?.click()}
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

        {/* SEKSI 5: TENTANG KULIAHKU */}
        <div>
          <Card variant="filled" style={{ padding: '16px', textAlign: 'center' }}>
            <Icon name="school" size="36px" color="var(--md-sys-color-primary)" />
            <h3 className="typescale-title-medium" style={{ margin: '8px 0 2px 0' }}>
              KuliahKu v0.3
            </h3>
            <p className="typescale-body-small" style={{ color: 'var(--md-sys-color-on-surface-variant)', margin: 0 }}>
              Aplikasi PWA Offline-First · Material Design 3 · Tanpa Akun & Tanpa Iklan
            </p>
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
              gap: '12px',
              justifyContent: 'flex-end',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Button
              variant="text"
              onClick={() => setDialogSemesterOpen(false)}
              style={{ minWidth: '88px', fontWeight: 700 }}
            >
              Batal
            </Button>
            <Button
              variant="filled"
              icon="check"
              disabled={!namaSemester.trim()}
              onClick={handleSimpanSemester}
              style={{
                padding: '10px 22px',
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

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--md-sys-typescale-label-medium-size)',
                color: 'var(--md-sys-color-on-surface-variant)',
                marginBottom: '6px',
              }}
            >
              Tanggal Mulai
            </label>
            <input
              type="date"
              aria-label="Tanggal Mulai"
              value={tglMulai}
              onChange={(e) => setTglMulai(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
                border: '1px solid var(--md-sys-color-outline)',
                background: 'var(--md-sys-color-surface)',
                color: 'var(--md-sys-color-on-surface)',
                fontFamily: 'var(--md-ref-typeface-plain)',
                fontSize: 'var(--md-sys-typescale-body-large-size)',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--md-sys-typescale-label-medium-size)',
                color: 'var(--md-sys-color-on-surface-variant)',
                marginBottom: '6px',
              }}
            >
              Tanggal Selesai
            </label>
            <input
              type="date"
              aria-label="Tanggal Selesai"
              value={tglSelesai}
              onChange={(e) => setTglSelesai(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--md-sys-shape-corner-small, 8px)',
                border: '1px solid var(--md-sys-color-outline)',
                background: 'var(--md-sys-color-surface)',
                color: 'var(--md-sys-color-on-surface)',
                fontFamily: 'var(--md-ref-typeface-plain)',
                fontSize: 'var(--md-sys-typescale-body-large-size)',
              }}
            />
          </div>
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
              style={{ backgroundColor: 'var(--md-sys-color-error)', color: 'var(--md-sys-color-on-error)' }}
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
    </div>
  );
}
