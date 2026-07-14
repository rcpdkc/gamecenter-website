import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Wiki from './pages/Wiki';
import Download from './pages/Download';
import Login from './pages/Login';
import Register from './pages/Register';
import SuperAdmin from './pages/SuperAdmin';
import References from './pages/References';
import UsersPage from './pages/UsersPage';
import GroupsPage from './pages/GroupsPage';
import CoversPage from './pages/CoversPage';
import './index.css';

function TitleUpdater() {
  const location = useLocation();
  useEffect(() => {
    const titles = {
      '/': 'Ana Sayfa - Game Center Plus',
      '/wiki': 'Wiki - Game Center Plus',
      '/download': 'İndir - Game Center Plus',
      '/login': 'Giriş Yap - Game Center Plus',
      '/register': 'Kayıt Ol - Game Center Plus',
      '/superadmin': 'Sistem Yönetimi - Game Center Plus',
      '/superadmin/references': 'Referans Kodları - Game Center Plus',
      '/superadmin/users': 'Kullanıcılar - Game Center Plus',
      '/superadmin/groups': 'Lisans Grupları - Game Center Plus',
      '/superadmin/covers': 'Oyun Kapakları - Game Center Plus'
    };
    document.title = titles[location.pathname] || 'Game Center Plus';
  }, [location]);
  return null;
}

function App() {
  return (
    <Router>
      <TitleUpdater />
      <Routes>
        
        {/* Public Pages with Navbar & Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/wiki" element={<Wiki />} />
          <Route path="/download" element={<Download />} />
        </Route>

        {/* Standalone Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Admin Pages with Sidebar */}
        <Route path="/superadmin" element={<AdminLayout />}>
          <Route index element={<SuperAdmin />} />
          <Route path="references" element={<References />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="covers" element={<CoversPage />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
