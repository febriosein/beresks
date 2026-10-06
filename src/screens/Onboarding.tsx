import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Button,
  TextField,
  Card,
  Icon,
  Select,
  SegmentedButton,
  useRegisterFab,
} from '../ui/index.js';
import { tambahSemester, tambahMatkul, tambahSesi } from '../data/repo/index.js';
import { dapatkanWarnaMatkulDefault } from '../lib/warna.js';
import { format, addMonths } from 'date-fns';

export function Onboarding() {
  const navigate = useNavigate();
  useRegisterFab({ hide: true, label: '', icon: '', onClick: () => {} });
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);

  // Data Semester
  const [sekarang] = useState(() => new Date());
  const [namaSemester, setNamaSemester] = useState('Semester 3 (2026/2027)');
  const [tglMulai, setTglMulai] = useState(() => format(sekarang, 'yyyy-MM-dd'));
  const [tglSelesai, setTglSelesai] = useState(() => format(addMonths(sekarang, 6), 'yyyy-MM-dd'));

  // Data Matkul
  const [namaMatkul, setNamaMatkul] = useState('');
  const [kodeMatkul, setKodeMatkul] = useState('');
  const [sksMatkul, setSksMatkul] = useState('3');
  const [dosenMatkul, setDosenMatkul] = useState('');
  const [ruangDefault, setRuangDefault] = useState('');

  // Data Sesi
  const [hariSesi, setHariSesi] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('09:40');
  const [ruangSesi, setRuangSesi] = useState('');
  const [tipeSesi, setTipeSesi] = useState<'teori' | 'praktikum'>('teori');

  // Selesai Onboarding
  const handleSelesai = async () => {
    // 1. Simpan Semester
    const mulaiMs = new Date(tglMulai).getTime();
    const selesaiMs = new Date(tglSelesai).getTime();
    const semId = await tambahSemester({
      nama: namaSemester.trim() || 'Semester Baru',
      tanggalMulai: mulaiMs,
      tanggalSelesai: selesaiMs,
      aktif: true,
    });

    // 2. Jika nama matkul diisi, simpan Matkul & Sesi
    if (namaMatkul.trim()) {
      const matkulId = await tambahMatkul({
        semesterId: semId,
        nama: namaMatkul.trim(),
        kode: kodeMatkul.trim() || undefined,
        sks: Number(sksMatkul) || 3,
        dosen: dosenMatkul.trim() || undefined,
        warna: dapatkanWarnaMatkulDefault(0),
        ruangDefault: ruangDefault.trim() || undefined,
      });

      // 3. Simpan Sesi
      await tambahSesi({
        matkulId,
        hari: hariSesi,
        jamMulai,
        jamSelesai,
        ruang: ruangSesi.trim() || ruangDefault.trim() || undefined,
        tipe: tipeSesi,
      });
    }

    // Alihkan ke Hari Ini
    navigate('/');
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        backgroundColor: 'var(--md-sys-color-surface)',
        color: 'var(--md-sys-color-on-surface)',
        padding: 'calc(24px + env(safe-area-inset-top, 0px)) 16px calc(24px + env(safe-area-inset-bottom, 0px)) 16px',
        maxWidth: '560px',
        margin: '0 auto',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {/* Step 0: Sambutan */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '48px', gap: '20px' }}>
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: 'var(--md-sys-shape-corner-extra-large, 28px)',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
                overflow: 'hidden',
                padding: '8px',
              }}
            >
              <img
                src="/logo.png"
                alt="Logo BereSKS"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <h1 className="typescale-headline-medium" style={{ margin: 0 }}>
              Selamat Datang di BereSKS
            </h1>

            <p
              className="typescale-body-large"
              style={{ color: 'var(--md-sys-color-on-surface-variant)', maxWidth: '400px' }}
            >
              Aplikasi jadwal kuliah dan pencatat tugas offline-first. Cepat, tenang, tanpa akun, semua data aman di perangkatmu.
            </p>

            <Card variant="filled" style={{ width: '100%', marginTop: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon name="bolt" color="var(--md-sys-color-primary)" />
                  <span className="typescale-body-medium">Catat tugas baru dalam ≤ 5 detik & ≤ 3 ketukan</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon name="wifi_off" color="var(--md-sys-color-primary)" />
                  <span className="typescale-body-medium">100% offline, langsung siap kapan saja</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon name="palette" color="var(--md-sys-color-primary)" />
                  <span className="typescale-body-medium">Desain Material 3 tenang dan adaptif</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 1: Semester */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            <div>
              <span className="typescale-label-medium" style={{ color: 'var(--md-sys-color-primary)' }}>
                LANGKAH 1 DARI 3
              </span>
              <h2 className="typescale-headline-small" style={{ margin: '4px 0 8px 0' }}>
                Atur Semester Aktif
              </h2>
              <p className="typescale-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                Mata kuliah dan jadwalmu akan dikelompokkan ke dalam semester ini.
              </p>
            </div>

            <TextField
              label="Nama Semester"
              value={namaSemester}
              onChange={setNamaSemester}
              placeholder="Contoh: Semester 3"
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
                Tanggal Mulai Semester
              </label>
              <input
                type="date"
                aria-label="Tanggal Mulai Semester"
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
                Tanggal Selesai Semester
              </label>
              <input
                type="date"
                aria-label="Tanggal Selesai Semester"
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
        )}

        {/* Step 2: Mata Kuliah Pertama */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            <div>
              <span className="typescale-label-medium" style={{ color: 'var(--md-sys-color-primary)' }}>
                LANGKAH 2 DARI 3
              </span>
              <h2 className="typescale-headline-small" style={{ margin: '4px 0 8px 0' }}>
                Tambah Mata Kuliah Pertama
              </h2>
              <p className="typescale-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                Cukup isi nama mata kuliah, kolom lainnya opsional.
              </p>
            </div>

            <TextField
              label="Nama Mata Kuliah"
              value={namaMatkul}
              onChange={setNamaMatkul}
              placeholder="Contoh: Basis Data, Algoritma"
              required
              autoFocus
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <TextField
                label="Kode (Opsional)"
                value={kodeMatkul}
                onChange={setKodeMatkul}
                placeholder="IF2101"
              />
              <TextField
                label="SKS"
                value={sksMatkul}
                onChange={setSksMatkul}
                type="number"
              />
            </div>

            <TextField
              label="Dosen Pengampu (Opsional)"
              value={dosenMatkul}
              onChange={setDosenMatkul}
              placeholder="Nama dosen"
            />

            <TextField
              label="Ruang Default (Opsional)"
              value={ruangDefault}
              onChange={setRuangDefault}
              placeholder="Gedung B R.302"
            />
          </div>
        )}

        {/* Step 3: Sesi Jadwal */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
            <div>
              <span className="typescale-label-medium" style={{ color: 'var(--md-sys-color-primary)' }}>
                LANGKAH 3 DARI 3
              </span>
              <h2 className="typescale-headline-small" style={{ margin: '4px 0 8px 0' }}>
                Jadwal Kelas: {namaMatkul || 'Mata Kuliah'}
              </h2>
              <p className="typescale-body-medium" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                Kapan jadwal kelas ini berlangsung setiap minggunya?
              </p>
            </div>

            <Select
              label="Hari Pertemuan"
              value={String(hariSesi)}
              onChange={(val) => setHariSesi(Number(val) as any)}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--md-sys-typescale-label-medium-size)',
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

            <TextField
              label="Ruangan (Opsional)"
              value={ruangSesi || ruangDefault}
              onChange={setRuangSesi}
              placeholder="R.302"
            />

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: 'var(--md-sys-typescale-label-medium-size)',
                  color: 'var(--md-sys-color-on-surface-variant)',
                  marginBottom: '8px',
                }}
              >
                Tipe Sesi
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
        )}
      </div>

      {/* Navigasi Aksi Bawah */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '32px',
          paddingTop: '16px',
          borderTop: '1px solid var(--md-sys-color-outline-variant)',
        }}
      >
        {step > 0 ? (
          <Button
            variant="text"
            icon="arrow_back"
            onClick={() => setStep((s) => (s - 1) as any)}
          >
            Kembali
          </Button>
        ) : (
          <div />
        )}

        {step === 0 && (
          <Button
            variant="filled"
            trailingIcon="arrow_forward"
            onClick={() => setStep(1)}
          >
            Mulai Sekarang
          </Button>
        )}

        {step === 1 && (
          <Button
            variant="filled"
            trailingIcon="arrow_forward"
            disabled={!namaSemester.trim()}
            onClick={() => setStep(2)}
          >
            Lanjut
          </Button>
        )}

        {step === 2 && (
          <Button
            variant="filled"
            trailingIcon="arrow_forward"
            disabled={!namaMatkul.trim()}
            onClick={() => setStep(3)}
          >
            Lanjut ke Jadwal
          </Button>
        )}

        {step === 3 && (
          <Button
            variant="filled"
            icon="check"
            onClick={handleSelesai}
          >
            Selesai & Mulai
          </Button>
        )}
      </div>
    </div>
  );
}
