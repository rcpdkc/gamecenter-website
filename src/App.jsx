import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Wiki from './pages/Wiki';
import Download from './pages/Download';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
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

        {/* Standalone Login Page */}
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Pages with Sidebar */}
        <Route element={<AdminLayout />}>
          <Route path="/superadmin" element={<SuperAdmin />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
