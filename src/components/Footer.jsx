import React from 'react';

const Footer = () => {
  return (
    <footer className="py-12 border-t border-white/5 relative z-10 bg-[#06070a]">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]">
              GC
            </div>
            <div>
              <div className="font-bold text-xl text-white">Game Center</div>
              <div className="text-xs text-muted">Premium Kafe Yazılımı</div>
            </div>
          </div>
          
          <div className="text-sm text-muted">
            &copy; {new Date().getFullYear()} Game Center. Tüm hakları saklıdır.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
