import { Outlet, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { useRef } from 'react';
import { 
  LayoutDashboard, Server, Settings, LogOut, Activity, Key, Users, Layers, Image, Megaphone, FolderSync,
  ChevronLeft, ChevronRight, Sun, Moon, Bell, Menu, ScrollText, Cpu, HardDrive, Gamepad2, Thermometer, MonitorDot
} from 'lucide-react';
import { useEffect, useState, createContext, useContext } from 'react';

// Theme Context
export const ThemeContext = createContext({ dark: true, toggleTheme: () => {} });

const NAV_ITEMS_ADMIN = [
  { to: '/superadmin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/superadmin/users', icon: Users, label: 'Kullanıcılar' },
  { to: '/superadmin/groups', icon: Layers, label: 'Gruplar' },
  { to: '/superadmin/covers', icon: Image, label: 'Cover Yönetimi' },
  { to: '/superadmin/mklink-archive', icon: FolderSync, label: 'Mklink Arşivi' },
  { to: '/superadmin/references', icon: Key, label: 'Referans & Davet' },
  { to: '/superadmin/announcements', icon: Megaphone, label: 'Duyurular' },
  { to: '/superadmin/logs', icon: ScrollText, label: 'Loglar' },
  { to: '/superadmin/settings', icon: Settings, label: 'Ayarlar' },
];

const NAV_ITEMS_CAFE = [
  { to: '/superadmin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/superadmin/clients', icon: MonitorDot, label: 'Müşteri PC’leri' },
  { to: '/superadmin/hardware', icon: HardDrive, label: 'Donanım' },
  { to: '/superadmin/games', icon: Gamepad2, label: 'Oyunlar' },
  { to: '/superadmin/monitoring', icon: Thermometer, label: 'İzleme' },
  { to: '/superadmin/covers', icon: Image, label: 'Cover Yönetimi', mobileHidden: true },
];

const PAGE_TITLES = {
  '/superadmin': { title: 'Dashboard', subtitle: 'Tüm Game Center şubelerinin genel görünümü' },
  '/superadmin/users': { title: 'Kullanıcı Yönetimi', subtitle: 'Kafe üyeleri ve grup yönetimi' },
  '/superadmin/groups': { title: 'Gruplar', subtitle: 'Üyelik gruplarını oluşturun ve yönetin' },
  '/superadmin/covers': { title: 'Cover Yönetimi', subtitle: 'Oyun kapaklarını yönetin ve onaylayın' },
  '/superadmin/mklink-archive': { title: 'Mklink Arşivi', subtitle: 'Global MkLink şablonlarını yönetin' },
  '/superadmin/references': { title: 'Referans & Davet', subtitle: 'Kafe davet kodları ve kayıt yönetimi' },
  '/superadmin/announcements': { title: 'Global Duyurular', subtitle: 'Tüm kafelere sistem bildirimleri gönderin' },
  '/superadmin/logs': { title: 'Sistem Logları', subtitle: 'Giriş, şifre sıfırlama ve güvenlik olayları' },
  '/superadmin/settings': { title: 'Ayarlar', subtitle: 'Sistem tercihleri ve yapılandırma' },
  '/superadmin/hardware': { title: 'Donanım Envanteri', subtitle: 'GPU, CPU ve sistem donanım bilgileri' },
  '/superadmin/games': { title: 'Oyun İstatistikleri', subtitle: 'En çok oynanan oyunlar ve tıklama analizi' },
  '/superadmin/monitoring': { title: 'Sistem İzleme', subtitle: 'CPU ve GPU sıcaklık takibi' },
  '/superadmin/clients': { title: 'Müşteri Bilgisayarları', subtitle: 'Kafedeki tüm PC’lerin canlı donanım ve durum bilgisi' },
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [sessionInfo, setSessionInfo] = useState(null); // { expiresAt, remainingLabel }
  const autoLogoutTimer = useRef(null);

  const doLogout = (reason) => {
    localStorage.removeItem('gc_admin_token');
    localStorage.removeItem('gc_user');
    localStorage.removeItem('gc_expires_at');
    if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
    navigate('/login', { state: { reason } });
  };

  useEffect(() => {
    const token = localStorage.getItem('gc_admin_token');
    const storedUser = localStorage.getItem('gc_user');
    const expiresAt = parseInt(localStorage.getItem('gc_expires_at') || '0', 10);

    if (!token || !storedUser) { setIsAuthenticated(false); return; }

    // Hızlı expiry ön kontrolü (API çağırmadan)
    if (expiresAt && Date.now() > expiresAt) {
      doLogout('expired');
      return;
    }

    setUser(JSON.parse(storedUser));

    // Sunucu tarafında token doğrulama
    fetch('/api/login?action=verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ token }),
    })
      .then(r => r.json())
      .then(data => {
        if (!data.success) {
          // Token geçersiz veya süresi dolmuş
          doLogout(data.code === 'TOKEN_EXPIRED' ? 'expired' : 'invalid');
        } else {
          // Güncel kullanıcı bilgisini yaz
          setUser(data.user);
          localStorage.setItem('gc_user', JSON.stringify(data.user));

          // Otomatik logout zamanlayıcısı
          if (data.expires_at) {
            const msLeft = data.expires_at - Date.now();
            const hLeft = Math.floor(msLeft / 3600000);
            const mLeft = Math.floor((msLeft % 3600000) / 60000);
            setSessionInfo({ expiresAt: data.expires_at, remainingLabel: `${hLeft}s ${mLeft}dk` });

            if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current);
            autoLogoutTimer.current = setTimeout(() => doLogout('expired'), Math.max(0, msLeft));
          }
        }
      })
      .catch(() => {
        // Ağ hatası — offline olabilir, sessizce geç
      });

    const savedTheme = localStorage.getItem('gc_admin_theme');
    if (savedTheme) setDark(savedTheme === 'dark');

    return () => { if (autoLogoutTimer.current) clearTimeout(autoLogoutTimer.current); };
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('gc_admin_theme', next ? 'dark' : 'light');
  };

  const handleLogout = () => doLogout('manual');

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const currentPage = PAGE_TITLES[location.pathname] || { title: 'Yönetim Paneli', subtitle: '' };

  // Theme classes
  const bg = dark ? 'bg-[#080a0f]' : 'bg-gray-50';
  const sidebar = dark ? 'bg-[#0d0f1a] border-white/5' : 'bg-white border-gray-200';
  const topbar = dark ? 'bg-[#0d0f1a]/80 border-white/5' : 'bg-white/80 border-gray-200';
  const txt = dark ? 'text-gray-100' : 'text-gray-900';
  const muted = dark ? 'text-gray-500' : 'text-gray-400';
  const navActive = dark
    ? 'bg-orange-500/15 text-orange-400 border-l-2 border-orange-500'
    : 'bg-orange-50 text-orange-600 border-l-2 border-orange-500';
  const navIdle = dark
    ? 'text-gray-500 hover:text-gray-200 hover:bg-white/5'
    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100';

  const isActive = (item) => item.exact
    ? location.pathname === item.to
    : location.pathname.startsWith(item.to) && !item.exact || location.pathname === item.to;

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      <div className={`flex min-h-screen font-sans transition-colors duration-300 ${bg} ${txt}`}>

        {/* MOBILE OVERLAY */}
        {mobileOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
        )}

        {/* SIDEBAR */}
        <aside className={`
          fixed top-0 left-0 h-full z-40 flex flex-col border-r transition-all duration-300 ease-in-out
          ${sidebar}
          ${collapsed ? 'w-[72px]' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Logo */}
          <div className={`h-16 flex items-center border-b ${dark ? 'border-white/5' : 'border-gray-200'} px-4 shrink-0`}>
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(249,115,22,0.35)]">
                <Server size={18} className="text-white" />
              </div>
              {!collapsed && (
                <span className="font-bold text-lg whitespace-nowrap overflow-hidden">
                  <span className={dark ? 'text-white' : 'text-gray-900'}>Cloud</span>
                  <span className="text-orange-500"> Admin</span>
                </span>
              )}
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 overflow-y-auto">
            {(user?.role === 'admin' ? NAV_ITEMS_ADMIN : NAV_ITEMS_CAFE).map((item) => {
              const active = item.exact ? location.pathname === item.to : location.pathname === item.to || (item.to !== '/superadmin' && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  title={collapsed ? item.label : ''}
                  className={`
                    flex items-center gap-3 mx-3 my-0.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${active ? navActive : navIdle}
                    ${collapsed ? 'justify-center' : ''}
                    ${item.mobileHidden ? 'hidden md:flex' : ''}
                  `}
                >
                  <item.icon size={18} className="shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom actions */}
          <div className={`p-3 border-t ${dark ? 'border-white/5' : 'border-gray-200'} space-y-1 shrink-0`}>
            <button
              onClick={handleLogout}
              title={collapsed ? 'Çıkış Yap' : ''}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                text-red-400 hover:text-red-300 hover:bg-red-500/10
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <LogOut size={18} className="shrink-0" />
              {!collapsed && <span>Çıkış Yap</span>}
            </button>
          </div>

          {/* Collapse toggle (desktop only) */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`
              hidden md:flex absolute -right-3.5 top-20 z-50 w-7 h-7 rounded-full items-center justify-center shadow-lg border transition-colors
              ${dark ? 'bg-[#0d0f1a] border-white/10 text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-900'}
            `}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </aside>

        {/* MAIN CONTENT */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? 'md:ml-[72px]' : 'md:ml-64'}`}>

          {/* TOPBAR */}
          <header className={`
            sticky top-0 z-20 h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 border-b
            backdrop-blur-xl transition-colors ${topbar}
          `}>
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              {/* Mobile hamburger */}
              <button
                className={`md:hidden p-1.5 sm:p-2 rounded-lg shrink-0 ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={20} />
              </button>

              {/* Page Title in Header */}
              <div className="min-w-0">
                <h1 className={`text-sm sm:text-lg font-bold leading-none truncate ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {currentPage.title}
                </h1>
                {currentPage.subtitle && (
                  <p className={`text-xs mt-0.5 ${muted} hidden sm:block truncate`}>{currentPage.subtitle}</p>
                )}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-1.5 sm:p-2 rounded-xl transition-all ${dark ? 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10' : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'}`}
                title="Tema Değiştir"
              >
                {dark ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {/* Notifications */}
              <button className={`relative p-1.5 sm:p-2 rounded-xl transition-all ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
              </button>

              {/* Kalan oturum süresi */}
              {sessionInfo && (
                <div className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs ${
                  dark ? 'bg-white/5 text-gray-500' : 'bg-gray-100 text-gray-400'
                }`} title="Oturum bitiş süresi">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {sessionInfo.remainingLabel}
                </div>
              )}

              {/* Avatar */}
              {user && (
                <div className="ml-1 flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-3 border-l border-white/10">
                  <div className="text-right hidden lg:block">
                    <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>{user.role === 'admin' ? 'Super Admin' : user.cafe_name}</p>
                    <p className={`text-xs ${muted}`}>{user.role === 'admin' ? 'admin' : user.first_name}</p>
                  </div>
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center font-bold text-white text-xs sm:text-sm shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                    {user.role === 'admin' ? 'SA' : (user.cafe_name || 'C').substring(0,2).toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className={`flex-1 overflow-y-auto p-6 md:p-8 ${bg}`}>
            <Outlet context={{ dark, user }} />
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default AdminLayout;
