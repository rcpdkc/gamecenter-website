import { Download as DownloadIcon, HardDrive, MonitorCheck, Cpu } from 'lucide-react';

const Download = () => {
  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container">
        
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Hemen <span className="text-accent-gradient">İndirin</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Game Center v2.3.2 sürümünü bilgisayarınıza indirin ve ağınızı dakikalar içinde modernleştirin.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-panel p-8 md:p-12 text-center relative overflow-hidden animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
            
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(249,115,22,0.3)]">
              <DownloadIcon size={40} className="text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-white mb-2">Game Center Sunucu & İstemci</h2>
            <p className="text-muted mb-8">Sürüm: v2.3.2 | Boyut: 42 MB | Platform: Windows 10/11 / Server 2019+</p>
            
            <a href="#" className="btn btn-primary text-lg px-8 py-4 w-full md:w-auto">
              Setup Dosyasını İndir (.exe)
            </a>
            
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-white/5 pt-12">
              <div className="flex gap-4">
                <HardDrive className="text-orange-400 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-white">Sistem Gereksinimleri</h4>
                  <p className="text-sm text-muted">Sunucu için min. 8GB RAM ve stabil bir Yerel Ağ bağlantısı (LAN).</p>
                </div>
              </div>
              <div className="flex gap-4">
                <MonitorCheck className="text-blue-400 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-white">İstemci Kurulumu</h4>
                  <p className="text-sm text-muted">Aynı setup dosyası üzerinden istemci bilgisayarlarına kurulum yapabilirsiniz.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Cpu className="text-emerald-400 shrink-0" size={24} />
                <div>
                  <h4 className="font-bold text-white">Tam Otomasyon</h4>
                  <p className="text-sm text-muted">Kurulum sonrası arka planda tamamen sessiz (silent) çalışır.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Download;
