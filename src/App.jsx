import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Wiki from './pages/Wiki';
import Download from './pages/Download';
import Login from './pages/Login';
import SuperAdmin from './pages/SuperAdmin';
import './index.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-bg-primary text-text-main font-sans relative overflow-x-hidden">
        
        {/* Global Background Orbs */}
        <div className="bg-glow-orb orb-1"></div>
        <div className="bg-glow-orb orb-2"></div>

        <Navbar />
        
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/wiki" element={<Wiki />} />
            <Route path="/download" element={<Download />} />
            <Route path="/login" element={<Login />} />
            <Route path="/superadmin" element={<SuperAdmin />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
