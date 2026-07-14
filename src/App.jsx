import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Wiki from './pages/Wiki';
import Download from './pages/Download';
import Login from './pages/Login';
import Register from './pages/Register';
import SuperAdmin from './pages/SuperAdmin';
import References from './pages/References';
import './index.css';

function App() {
  return (
    <Router>
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
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
