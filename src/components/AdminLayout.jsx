import { Outlet, Navigate, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Server, Settings, LogOut, Activity, Key, Users, Layers, Image,
  ChevronLeft, ChevronRight, Sun, Moon, Bell, Menu
} from 'lucide-react';
import { useEffect, useState, createContext, useContext } from 'react';

// Theme Context
export const ThemeContext = createContext({ dark: true, toggleTheme: () => {} });

const NAV_ITEMS = [
  { to: '/superadmin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/superadmin/users', icon: Users, label: 'Kullanıcılar' },
  { to: '/superadmin/groups', icon: Layers, label: 'Gruplar' },
  { to: '/superadmin/covers', icon: Image, label: 'Cover Yönetimi' },
  { to: '/superadmin/references', icon: Key, label: 'Referans & Davet' },
  { to: '/superadmin/settings', icon: Settings, label: 'Ayarlar' },
];

const PAGE_TITLES = {
  '/superadmin': { title: 'Dashboard', subtitle: 'Tüm Game Center şubelerinin genel görünümü' },
  '/superadmin/users': { title: 'Kullanıcı Yönetimi', subtitle: 'Kafe üyeleri ve grup yönetimi' },
  '/superadmin/groups': { title: 'Gruplar', subtitle: 'Üyelik gruplarını oluşturun ve yönetin' },
  '/superadmin/covers': { title: 'Cover Yönetimi', subtitle: 'Oyun kapaklarını yönetin ve onaylayın' },
  '/superadmin/references': { title: 'Referans & Davet', subtitle: 'Kafe davet kodları ve kayıt yönetimi' },
  '/superadmin/settings': { title: 'Ayarlar', subtitle: 'Sistem tercihleri ve yapılandırma' },
};

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('gc_admin_token');
    if (!token) setIsAuthenticated(false);
    const savedTheme = localStorage.getItem('gc_admin_theme');
    if (savedTheme) setDark(savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('gc_admin_theme', next ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem('gc_admin_token');
    navigate('/login');
  };

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
            {NAV_ITEMS.map((item) => {
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
            sticky top-0 z-20 h-16 flex items-center justify-between px-6 border-b
            backdrop-blur-xl transition-colors ${topbar}
          `}>
            <div className="flex items-center gap-4">
              {/* Mobile hamburger */}
              <button
                className={`md:hidden p-2 rounded-lg ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={20} />
              </button>

              {/* Page Title in Header */}
              <div>
                <h1 className={`text-lg font-bold leading-none ${dark ? 'text-white' : 'text-gray-900'}`}>
                  {currentPage.title}
                </h1>
                {currentPage.subtitle && (
                  <p className={`text-xs mt-0.5 ${muted}`}>{currentPage.subtitle}</p>
                )}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl transition-all ${dark ? 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10' : 'text-gray-500 hover:text-orange-500 hover:bg-orange-50'}`}
                title="Tema Değiştir"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Notifications */}
              <button className={`relative p-2 rounded-xl transition-all ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
              </button>

              {/* Avatar */}
              <div className="ml-1 flex items-center gap-2.5 pl-3 border-l border-white/10">
                <div className="text-right hidden sm:block">
                  <p className={`text-sm font-semibold ${dark ? 'text-white' : 'text-gray-900'}`}>Super Admin</p>
                  <p className={`text-xs ${muted}`}>admin</p>
                </div>
                <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                  SA
                </div>
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <main className={`flex-1 overflow-y-auto p-6 md:p-8 ${bg}`}>
            <Outlet context={{ dark }} />
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default AdminLayout;
