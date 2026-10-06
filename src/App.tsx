import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router';
import {
  NavigationBar,
  Fab,
  Snackbar,
  Icon,
} from './ui/index.js';
import { QuickAddSheet } from './features/quick-add/QuickAddSheet.js';
import { useQuickAddStore } from './features/quick-add/useQuickAddStore.js';
import { useDaftarSemester, useTugasMendesak } from './data/repo/index.js';

// Layar
import { HariIni } from './screens/HariIni.js';
import { Jadwal } from './screens/Jadwal.js';
import { MataKuliah } from './screens/MataKuliah.js';
import { DetailMataKuliah } from './screens/DetailMataKuliah.js';
import { Tugas } from './screens/Tugas.js';
import { Pengaturan } from './screens/Pengaturan.js';
import { Onboarding } from './screens/Onboarding.js';

export function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const daftarSemester = useDaftarSemester();
  const tugasMendesak = useTugasMendesak(99) || [];

  const { openQuickAdd } = useQuickAddStore();

  // Indikator Offline
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const onlineHandler = () => setIsOnline(true);
    const offlineHandler = () => setIsOnline(false);

    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    };
  }, []);

  // Pengalihan Onboarding jika belum ada semester
  const isOnboarding = location.pathname === '/onboarding';

  useEffect(() => {
    if (daftarSemester !== undefined) {
      if (daftarSemester.length === 0 && !isOnboarding) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [daftarSemester, isOnboarding, navigate]);

  // Tentukan tab navigasi yang aktif
  const getActiveNavId = () => {
    const path = location.pathname;
    if (path === '/') return '/';
    if (path.startsWith('/jadwal')) return '/jadwal';
    if (path.startsWith('/matkul')) return '/matkul';
    if (path.startsWith('/tugas')) return '/tugas';
    return '';
  };

  const navItems = [
    { id: '/', label: 'Hari Ini', icon: 'today', activeIcon: 'calendar_today' },
    { id: '/jadwal', label: 'Jadwal', icon: 'calendar_month', activeIcon: 'date_range' },
    { id: '/matkul', label: 'Mata Kuliah', icon: 'school', activeIcon: 'menu_book' },
    {
      id: '/tugas',
      label: 'Tugas',
      icon: 'assignment',
      activeIcon: 'task_alt',
      badge: tugasMendesak.length > 0 ? tugasMendesak.length : undefined,
    },
  ];

  const showShell = !isOnboarding;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        backgroundColor: 'var(--md-sys-color-surface)',
        color: 'var(--md-sys-color-on-surface)',
        position: 'relative',
      }}
    >
      {/* Indikator Halus Offline */}
      {!isOnline && (
        <div
          role="status"
          style={{
            backgroundColor: 'var(--md-sys-color-surface-container-highest)',
            color: 'var(--md-sys-color-on-surface-variant)',
            padding: '6px 16px',
            textAlign: 'center',
            fontSize: 'var(--md-sys-typescale-label-small-size)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            borderBottom: '1px solid var(--md-sys-color-outline-variant)',
            zIndex: 60,
          }}
        >
          <Icon name="wifi_off" size="14px" />
          <span>Offline · Semua data tersimpan di perangkat</span>
        </div>
      )}

      {/* Main Content Viewport */}
      <main style={{ flex: 1, width: '100%' }}>
        <Routes>
          <Route path="/" element={<HariIni />} />
          <Route path="/jadwal" element={<Jadwal />} />
          <Route path="/matkul" element={<MataKuliah />} />
          <Route path="/matkul/:id" element={<DetailMataKuliah />} />
          <Route path="/tugas" element={<Tugas />} />
          <Route path="/pengaturan" element={<Pengaturan />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </main>

      {/* FAB + (Floating Action Button) Cepat */}
      {showShell && (
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(92px + env(safe-area-inset-bottom, 0px))',
            right: '16px',
            zIndex: 45,
          }}
        >
          <Fab
            icon="add"
            variant="primary"
            size="large"
            ariaLabel="Catat Tugas Baru Cepat"
            onClick={() => openQuickAdd()}
          />
        </div>
      )}

      {/* Bottom Navigation Bar */}
      {showShell && (
        <NavigationBar
          items={navItems}
          activeId={getActiveNavId()}
          onChange={(id) => navigate(id)}
        />
      )}

      {/* Quick Add Bottom Sheet (Global Modal) */}
      <QuickAddSheet />

      {/* Snackbar Notifikasi Global */}
      <Snackbar />
    </div>
  );
}

export default App;
