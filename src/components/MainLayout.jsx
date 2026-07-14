import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-bg-primary text-text-main font-sans relative">
      {/* Global Background Orbs */}
      <div className="bg-glow-orb orb-1"></div>
      <div className="bg-glow-orb orb-2"></div>
      
      <Navbar />
      
      <main>
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default MainLayout;
