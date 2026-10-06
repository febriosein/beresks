import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  NavigationBar,
  NavigationRail,
  ExtendedFab,
  Snackbar,
  Icon,
  useFabStore,
} from './ui/index.js';
import { QuickAddSheet } from './features/quick-add/QuickAddSheet.js';
import { useQuickAddStore } from './features/quick-add/useQuickAddStore.js';
import {
  useDaftarSemester,
  useTugasMendesak,
  usePengaturan,
} from './data/repo/index.js';

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
  const pengaturan = usePengaturan();

  const { openQuickAdd } = useQuickAddStore();
  const currentFabAction = useFabStore((s) => s.currentAction);
  const shouldReduceMotion = useReducedMotion();

  // Deteksi Desktop / Tablet (>= 840px)
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= 840;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(min-width: 840px)');
    const update = () => setIsDesktop(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  // Sinkronisasi Tema Tampilan & Status Bar Color
  useEffect(() => {
    const root = document.documentElement;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');

    const updateThemeMeta = (isDark: boolean) => {
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', isDark ? '#191c1b' : '#006b5a');
      }
    };

    if (pengaturan.tema === 'gelap') {
      root.dataset.theme = 'dark';
      updateThemeMeta(true);
    } else if (pengaturan.tema === 'terang') {
      root.dataset.theme = 'light';
      updateThemeMeta(false);
    } else {
      // Tema Sistem
      delete root.dataset.theme;
      const mql = window.matchMedia('(prefers-color-scheme: dark)');
      updateThemeMeta(mql.matches);

      const listener = (e: MediaQueryListEvent) => updateThemeMeta(e.matches);
      mql.addEventListener('change', listener);
      return () => mql.removeEventListener('change', listener);
    }
  }, [pengaturan.tema]);

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
    { id: '/', label: 'Hari Ini', icon: 'today', activeIcon: 'today' },
    { id: '/jadwal', label: 'Jadwal', icon: 'calendar_month', activeIcon: 'calendar_month' },
    { id: '/matkul', label: 'Mata Kuliah', icon: 'menu_book', activeIcon: 'menu_book' },
    {
      id: '/tugas',
      label: 'Tugas',
      icon: 'assignment',
      activeIcon: 'assignment',
      badge: tugasMendesak.length > 0 ? tugasMendesak.length : undefined,
    },
  ];

  const showShell = !isOnboarding;

  // Resolusi Aksi FAB Kontekstual
  const getResolvedFabAction = () => {
    if (isOnboarding || location.pathname === '/pengaturan') {
      return null;
    }

    if (currentFabAction) {
      if (currentFabAction.hide) return null;
      return currentFabAction;
    }

    const path = location.pathname;
    if (path === '/' || path.startsWith('/tugas')) {
      return {
        label: 'Tugas',
        icon: 'add_task',
        ariaLabel: 'Catat Tugas Baru',
        onClick: () => openQuickAdd(),
      };
    }
    if (path.startsWith('/jadwal')) {
      return {
        label: 'Sesi',
        icon: 'add',
        ariaLabel: 'Tambah Sesi Kuliah Baru',
        onClick: () => window.dispatchEvent(new CustomEvent('beresks:buka-tambah-sesi')),
      };
    }
    if (path.startsWith('/matkul')) {
      return {
        label: 'Matkul',
        icon: 'add',
        ariaLabel: 'Tambah Mata Kuliah Baru',
        onClick: () => window.dispatchEvent(new CustomEvent('beresks:buka-tambah-matkul')),
      };
    }
    return null;
  };

  const fabAction = getResolvedFabAction();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isDesktop && showShell ? 'row' : 'column',
        minHeight: '100vh',
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
            position: 'fixed',
            top: 0,
            left: isDesktop && showShell ? 'var(--bs-rail-w, 88px)' : 0,
            right: 0,
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

      {/* Navigation Rail untuk Tablet/Desktop (>= 840px) */}
      {showShell && isDesktop && (
        <NavigationRail
          items={navItems}
          activeId={getActiveNavId()}
          onChange={(id) => navigate(id)}
          onOpenSettings={() => navigate('/pengaturan')}
        />
      )}

      {/* Main Content Viewport */}
      <main
        style={{
          flex: 1,
          width: '100%',
          marginLeft: isDesktop && showShell ? 'var(--bs-rail-w, 88px)' : 0,
          boxSizing: 'border-box',
          minWidth: 0,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={shouldReduceMotion ? undefined : { opacity: 0, y: 8 }}
            animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
            style={{ width: '100%', minHeight: '100%' }}
          >
            <Routes location={location}>
              <Route path="/" element={<HariIni />} />
              <Route path="/jadwal" element={<Jadwal />} />
              <Route path="/matkul" element={<MataKuliah />} />
              <Route path="/matkul/:id" element={<DetailMataKuliah />} />
              <Route path="/tugas" element={<Tugas />} />
              <Route path="/pengaturan" element={<Pengaturan />} />
              <Route path="/onboarding" element={<Onboarding />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Extended Contextual FAB */}
      {showShell && fabAction && (
        <ExtendedFab
          key={`${fabAction.label}-${fabAction.icon}`}
          icon={fabAction.icon}
          label={fabAction.label}
          ariaLabel={fabAction.ariaLabel}
          onClick={fabAction.onClick}
        />
      )}

      {/* Bottom Navigation Bar untuk Layar Ponsel (< 840px) */}
      {showShell && !isDesktop && (
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
