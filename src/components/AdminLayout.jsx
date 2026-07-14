import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Server, Settings, LogOut, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    // Check local storage for token
    const token = localStorage.getItem('gc_admin_token');
    if (!token) {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('gc_admin_token');
    navigate('/login');
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#050608] text-gray-200 font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0a0b10] border-r border-white/5 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/5">
          <span className="font-bold text-xl text-white flex items-center gap-2">
            <span className="bg-orange-500 text-white rounded p-1"><Server size={18} /></span> 
            Cloud Admin
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <a href="/superadmin" className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 text-orange-400 border border-orange-500/20 rounded-lg font-medium transition-colors">
            <LayoutDashboard size={18} /> Dashboard
          </a>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-colors">
            <Activity size={18} /> Tüm Kafeler
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg font-medium transition-colors">
            <Settings size={18} /> Ayarlar
          </button>
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg font-medium transition-colors"
          >
            <LogOut size={18} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOPBAR */}
        <header className="h-16 bg-[#0a0b10] border-b border-white/5 flex items-center justify-between px-8">
          <h2 className="text-gray-300 font-medium">Hoş Geldiniz, Yöneticisi</h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              A
            </div>
          </div>
        </header>
        
        {/* PAGE CONTENT */}
        <main className="flex-1 p-8 overflow-y-auto bg-[#0a0b10]">
          <Outlet />
        </main>
      </div>
      
    </div>
  );
};

export default AdminLayout;
