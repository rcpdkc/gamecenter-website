import { Link, useLocation } from 'react-router-dom';
import { LogIn, Menu, X, UserPlus } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Wiki', path: '/wiki' },
    { name: 'İndir', path: 'https://github.com/rcpdkc/game-center-server/releases/tag/v.2.0.0', isExternal: true },
  ];

  const isActive = (path) => {
    return location.pathname === path ? 'text-accent-color font-bold' : 'text-gray-300 hover:text-white';
  };

  return (
    <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-[#0a0b10]/80 backdrop-blur-md border-b border-white/5">
      <div className="w-full px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover:shadow-[0_0_25px_rgba(249,115,22,0.6)] transition-all">
              GC
            </div>
            <span className="font-bold text-xl tracking-wide text-white">Game Center</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map((link) => (
                link.isExternal ? (
                  <a key={link.path} href={link.path} target="_blank" rel="noopener noreferrer" className={`transition-colors ${isActive(link.path)}`}>
                    {link.name}
                  </a>
                ) : (
                  <Link key={link.path} to={link.path} className={`transition-colors ${isActive(link.path)}`}>
                    {link.name}
                  </Link>
                )
              ))}
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/login" className="btn btn-outline py-2 px-5 text-sm flex items-center gap-2">
                <LogIn size={16} /> Giriş Yap
              </Link>
              <Link to="/register" className="btn btn-primary py-2 px-5 text-sm flex items-center gap-2">
                <UserPlus size={16} /> Kayıt Ol
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-[#0a0b10] border-b border-white/5 py-4 px-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            link.isExternal ? (
              <a 
                key={link.path} 
                href={link.path} 
                target="_blank" rel="noopener noreferrer"
                className={`block p-2 rounded-lg ${isActive(link.path)}`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </a>
            ) : (
              <Link 
                key={link.path} 
                to={link.path} 
                className={`block p-2 rounded-lg ${isActive(link.path)}`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            )
          ))}
          <Link 
            to="/login" 
            className="btn btn-outline w-full justify-center mt-2"
            onClick={() => setIsOpen(false)}
          >
            <LogIn size={18} /> Giriş Yap
          </Link>
          <Link 
            to="/register" 
            className="btn btn-primary w-full justify-center mt-2"
            onClick={() => setIsOpen(false)}
          >
            <UserPlus size={18} /> Kayıt Ol
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
