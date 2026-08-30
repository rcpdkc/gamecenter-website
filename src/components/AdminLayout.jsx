import { Outlet, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { useRef, useEffect, useState, createContext } from 'react';
import { ToastProvider } from '../admin/ui';
import {
  LayoutDashboard, Server, Settings, LogOut, Key, Users, Layers, Image, Megaphone, FolderSync,
  Sun, Moon, Bell, Menu, ScrollText, HardDrive, Gamepad2, Thermometer, MonitorDot, DatabaseZap, KeyRound, Activity,
} from 'lucide-react';

export const ThemeContext = createContext({ dark: true, toggleTheme: () => {} });

// ── İki-raylı gruplar (ikon rayı = bölüm, panel = bölümün öğeleri) ──
const SECTIONS_ADMIN = [
  { id: 'genel', label: 'Genel', icon: LayoutDashboard, items: [['/superadmin', 'Dashboard', LayoutDashboard]] },
  { id: 'yonetim', label: 'Yönetim', icon: Users, items: [
    ['/superadmin/users', 'Kullanıcılar', Users], ['/superadmin/groups', 'Gruplar', Layers], ['/superadmin/references', 'Referans & Davet', Key],
    ['/superadmin/reset-codes', 'Şifre Sıfırlama', KeyRound],
  ] },
  { id: 'icerik', label: 'İçerik', icon: Image, items: [
    ['/superadmin/covers', 'Cover Yönetimi', Image], ['/superadmin/mklink-archive', 'Mklink Arşivi', FolderSync], ['/superadmin/shader-archive', 'Shader Arşivi', DatabaseZap],
  ] },
  { id: 'sistem', label: 'Sistem', icon: Settings, items: [
    ['/superadmin/announcements', 'Duyurular', Megaphone], ['/superadmin/server-status', 'Sunucu Durumu', Activity], ['/superadmin/logs', 'Loglar', ScrollText], ['/superadmin/settings', 'Ayarlar', Settings],
  ] },
];
const SECTIONS_CAFE = [
  { id: 'genel', label: 'Genel', icon: LayoutDashboard, items: [['/superadmin', 'Dashboard', LayoutDashboard]] },
  { id: 'izleme', label: 'İzleme', icon: MonitorDot, items: [
    ['/superadmin/clients', 'Bilgisayarlar', MonitorDot], ['/superadmin/hardware', 'Donanım', HardDrive], ['/superadmin/monitoring', 'İzleme', Thermometer], ['/superadmin/games', 'Oyunlar', Gamepad2],
  ] },
  { id: 'icerik', label: 'İçerik', icon: Image, items: [
    ['/superadmin/covers', 'Cover Yönetimi', Image], ['/superadmin/shader-archive', 'Shader Arşivi', DatabaseZap],
  ] },
];
const SECTION_LABEL = { genel: 'Genel', yonetim: 'Yönetim', icerik: 'İçerik', sistem: 'Sistem', izleme: 'İzleme' };
const TITLES = {
  '/superadmin': 'Dashboard', '/superadmin/users': 'Kullanıcılar', '/superadmin/groups': 'Gruplar',
  '/superadmin/references': 'Referans & Davet', '/superadmin/reset-codes': 'Şifre Sıfırlama Kodları', '/superadmin/server-status': 'Sunucu Durumu', '/superadmin/covers': 'Cover Yönetimi', '/superadmin/mklink-archive': 'Mklink Arşivi',
  '/superadmin/shader-archive': 'Shader Arşivi', '/superadmin/announcements': 'Duyurular', '/superadmin/logs': 'Loglar',
  '/superadmin/settings': 'Ayarlar', '/superadmin/clients': 'Bilgisayarlar', '/superadmin/hardware': 'Donanım',
  '/superadmin/games': 'Oyunlar', '/superadmin/monitoring': 'İzleme',
};

const isItemActive = (to, pathname) => to === '/superadmin' ? pathname === '/superadmin' : pathname === to || pathname.startsWith(to + '/');

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [dark, setDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null);
  const autoLogoutTimer = useRef(null);

  const doLogout = (reason) => {
    ['gc_admin_token', 'gc_user', 'gc_expires_at'].forEach((k) => { localStorage.removeItem(k); sessionStorage.removeItem(k); });
    if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
    navigate('/login', { state: { reason } });
  };

  useEffect(() => {
    const storage = (localStorage.getItem('gc_admin_token') || sessionStorage.getItem('gc_admin_token'))
      ? (localStorage.getItem('gc_admin_token') ? localStorage : sessionStorage) : localStorage;
    const token = storage.getItem('gc_admin_token');
    const storedUser = storage.getItem('gc_user');
    const expiresAt = parseInt(storage.getItem('gc_expires_at') || '0', 10);
    if (!token || !storedUser) { setIsAuthenticated(false); return; }
    if (expiresAt && Date.now() > expiresAt) { doLogout('expired'); return; }
    setUser(JSON.parse(storedUser));

    fetch('/api/login?action=verify', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ token }) })
      .then((r) => r.json())
      .then((data) => {
        if (!data.success) { doLogout(data.code === 'TOKEN_EXPIRED' ? 'expired' : 'invalid'); return; }
        setUser(data.user);
        const st = localStorage.getItem('gc_admin_token') ? localStorage : sessionStorage;
        st.setItem('gc_user', JSON.stringify(data.user));
        if (data.expires_at) {
          const msLeft = data.expires_at - Date.now();
          const hLeft = Math.floor(msLeft / 3600000), mLeft = Math.floor((msLeft % 3600000) / 60000);
          setSessionInfo({ remainingLabel: `${hLeft}s ${mLeft}dk` });
          if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
          autoLogoutTimer.current = setTimeout(() => doLogout('expired'), Math.max(0, msLeft));
        }
      })
      .catch(() => {});

    const savedTheme = localStorage.getItem('gc_admin_theme');
    if (savedTheme) setDark(savedTheme === 'dark');
    return () => { if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current); };
  }, []);

  const toggleTheme = () => { const n = !dark; setDark(n); localStorage.setItem('gc_admin_theme', n ? 'dark' : 'light'); };

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user) return (
    <div className={`gc-admin ${dark ? 'dark' : ''} flex items-center justify-center min-h-screen`} style={{ background: 'var(--a-bg)' }}>
      <div className="w-10 h-10 rounded-full animate-spin" style={{ border: '4px solid var(--a-border2)', borderTopColor: 'var(--a-accent)' }} />
    </div>
  );

  const sections = user.role === 'admin' ? SECTIONS_ADMIN : SECTIONS_CAFE;
  const activeSection = sections.find((s) => s.items.some(([to]) => isItemActive(to, location.pathname))) || sections[0];
  const title = TITLES[location.pathname] || 'Yönetim Paneli';
  const initials = user.role === 'admin' ? 'SA' : (user.cafe_name || 'C').substring(0, 2).toUpperCase();

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      <div className={`gc-admin ${dark ? 'dark' : ''} flex min-h-screen`} style={{ background: 'var(--a-bg)', color: 'var(--a-ink)' }}>

        {mobileOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />}

        {/* ── SIDEBAR (iki ray) ── */}
        <aside className={`fixed top-0 left-0 h-full z-40 flex transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          {/* Ray (ikon) */}
          <div className="w-[62px] h-full flex flex-col items-center py-3 gap-1 border-r" style={{ background: 'var(--a-sidebar)', borderColor: 'var(--a-border)' }}>
            <div className="w-9 h-9 rounded-xl grid place-items-center mb-2 shrink-0" style={{ background: 'var(--a-accent)' }}>
              <Server size={18} style={{ color: '#04170e' }} />
            </div>
            {sections.map((s) => {
              const on = activeSection.id === s.id;
              return (
                <Link key={s.id} to={s.items[0][0]} title={s.label} onClick={() => setMobileOpen(false)}
                  className="relative w-10 h-10 rounded-xl grid place-items-center transition-colors"
                  style={on ? { background: 'var(--a-accent-soft)' } : {}}>
                  {on && <span className="absolute left-[-11px] top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full" style={{ background: 'var(--a-accent)' }} />}
                  <s.icon size={19} style={{ color: on ? 'var(--a-accent)' : 'var(--a-mut)' }} />
                </Link>
              );
            })}
            <div className="mt-auto flex flex-col items-center gap-1">
              <button onClick={toggleTheme} title="Tema" className="w-10 h-10 rounded-xl grid place-items-center hover:bg-[var(--a-card2)]" style={{ color: 'var(--a-mut)' }}>
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => doLogout('manual')} title="Çıkış" className="w-10 h-10 rounded-xl grid place-items-center hover:bg-[var(--a-card2)]" style={{ color: 'var(--a-danger)' }}>
                <LogOut size={18} />
              </button>
            </div>
          </div>
          {/* Panel (öğeler) */}
          <div className="w-[196px] h-full flex flex-col border-r" style={{ background: 'var(--a-sidebar)', borderColor: 'var(--a-border)' }}>
            <div className="h-[52px] flex items-center px-4 shrink-0 border-b" style={{ borderColor: 'var(--a-border)' }}>
              <span className="font-extrabold text-[15px]" style={{ color: 'var(--a-ink)' }}>Cloud<span style={{ color: 'var(--a-accent)' }}> Admin</span></span>
            </div>
            <div className="flex-1 overflow-y-auto py-3 px-2.5">
              <div className="px-2 pb-1.5 text-[10px] font-semibold tracking-widest uppercase" style={{ color: 'var(--a-mut2)' }}>{SECTION_LABEL[activeSection.id]}</div>
              {activeSection.items.map(([to, label, Icon]) => {
                const on = isItemActive(to, location.pathname);
                return (
                  <Link key={to} to={to} onClick={() => setMobileOpen(false)}
                    className="relative flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-[13px] font-medium transition-colors mb-0.5"
                    style={on ? { background: 'var(--a-card2)', color: 'var(--a-ink)' } : { color: 'var(--a-mut)' }}>
                    {on && <span className="absolute left-0.5 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-full" style={{ background: 'var(--a-accent)' }} />}
                    <Icon size={16} style={{ color: on ? 'var(--a-accent)' : 'var(--a-mut)' }} />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
            </div>
            <div className="p-3 border-t flex items-center gap-2.5" style={{ borderColor: 'var(--a-border)' }}>
              <div className="w-8 h-8 rounded-lg grid place-items-center font-bold text-xs shrink-0" style={{ background: 'var(--a-accent)', color: '#04170e' }}>{initials}</div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate" style={{ color: 'var(--a-ink)' }}>{user.role === 'admin' ? 'Super Admin' : user.cafe_name}</div>
                <div className="text-[10px] truncate" style={{ color: 'var(--a-mut)' }}>{user.role === 'admin' ? 'admin' : user.first_name}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0 md:ml-[258px]">
          <header className="sticky top-0 z-20 h-14 flex items-center justify-between px-4 sm:px-6 border-b backdrop-blur-xl"
            style={{ background: 'color-mix(in srgb, var(--a-sidebar) 80%, transparent)', borderColor: 'var(--a-border)' }}>
            <div className="flex items-center gap-3 min-w-0">
              <button className="md:hidden p-1.5 rounded-lg" style={{ color: 'var(--a-mut)' }} onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
              <h1 className="text-base font-bold truncate" style={{ color: 'var(--a-ink)' }}>{title}</h1>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button className="relative w-9 h-9 grid place-items-center rounded-lg hover:bg-[var(--a-card2)]" style={{ color: 'var(--a-mut)' }}>
                <Bell size={16} /><span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--a-accent)' }} />
              </button>
              {sessionInfo && (
                <div className="hidden lg:flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs" style={{ background: 'var(--a-card2)', color: 'var(--a-mut)' }} title="Oturum bitişi">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--a-ok)' }} />{sessionInfo.remainingLabel}
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-5 sm:p-7" style={{ background: 'var(--a-bg)' }}>
            <ToastProvider>
              <Outlet context={{ dark, user }} />
            </ToastProvider>
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default AdminLayout;
