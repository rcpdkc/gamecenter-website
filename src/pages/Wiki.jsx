import React, { useState } from 'react';
import { BookOpen, Server, Monitor, Shield, Settings, Activity, Search, ChevronRight, Menu, Terminal, AlertTriangle, CheckCircle2 } from 'lucide-react';

// --- WIKI CONTENT DATA ---
const WIKI_STRUCTURE = [
  {
    section: "Başlangıç",
    items: [
      { id: "intro", title: "Game Center Nedir?", icon: <BookOpen size={16} /> },
      { id: "requirements", title: "Sistem Gereksinimleri", icon: <CheckCircle2 size={16} /> },
    ]
  },
  {
    section: "Kurulum Rehberi",
    items: [
      { id: "server-setup", title: "Sunucu (Server) Kurulumu", icon: <Server size={16} /> },
      { id: "client-setup", title: "İstemci (Client) Kurulumu", icon: <Monitor size={16} /> },
    ]
  },
  {
    section: "Gelişmiş Sistemler",
    items: [
      { id: "mklink", title: "MkLink / Ağdan Oyun Oynatma", icon: <Activity size={16} /> },
      { id: "security", title: "Güvenlik & Otomasyon", icon: <Shield size={16} /> },
      { id: "config", title: "Ayarlar ve Veritabanı", icon: <Settings size={16} /> },
    ]
  }
];

const WIKI_ARTICLES = {
  "intro": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Game Center Nedir?</h1>
      <p className="text-lg text-muted mb-8">
        Game Center, internet kafeler ve e-spor merkezleri için geliştirilmiş, ultra hızlı ve modern bir oyun yönetim platformudur.
      </p>
      
      <div className="glass-panel p-6 mb-8 border-l-4 border-l-blue-500">
        <h3 className="text-white font-bold mb-2 flex items-center gap-2"><CheckCircle2 className="text-blue-500" /> Temel Mantık</h3>
        <p className="text-muted text-sm">
          Sistem iki parçadan oluşur: Ana makinede çalışan <strong>Server</strong> ve oyuncu bilgisayarlarında çalışan <strong>Client</strong>.
          Kullanıcılar oyunlara Client üzerinden tıklar, Server bu verileri anlık olarak buluta ve yerel ağa işler.
        </p>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Öne Çıkan Özellikler</h2>
      <ul className="list-none space-y-3 text-muted">
        <li className="flex items-start gap-2"><ChevronRight className="text-orange-500 shrink-0 mt-1" size={16} /> <strong>Smart Sync (Akıllı Senkronizasyon):</strong> Ağ trafiğini %90 oranında azaltarak sadece değişen resimleri yükler.</li>
        <li className="flex items-start gap-2"><ChevronRight className="text-orange-500 shrink-0 mt-1" size={16} /> <strong>Dahili Sesli Sohbet (LAN):</strong> İnternet olmadan, UDP üzerinden çalışan Bas-Konuş telsiz sistemi.</li>
        <li className="flex items-start gap-2"><ChevronRight className="text-orange-500 shrink-0 mt-1" size={16} /> <strong>Cloud Telemetry:</strong> Tüm şubelerin canlı verilerini Vercel Postgres üzerinden tek bir panelde birleştirir.</li>
      </ul>
    </div>
  ),
  "requirements": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Sistem Gereksinimleri</h1>
      <p className="text-lg text-muted mb-8">Uygulamanın sorunsuz çalışması için hem Server hem de Client makinelerin belirli donanım seviyesinde olması gerekir.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Sunucu (Server)</h3>
          <ul className="space-y-2 text-muted text-sm">
            <li><strong>İşletim Sistemi:</strong> Windows 10/11 veya Windows Server 2019+</li>
            <li><strong>İşlemci:</strong> Minimum 4 Çekirdek (Intel i5 / Ryzen 5)</li>
            <li><strong>RAM:</strong> 16 GB veya üzeri (Önbellekleme için)</li>
            <li><strong>Ağ:</strong> 1 Gbps veya 10 Gbps Yerel Ağ Bağlantısı</li>
          </ul>
        </div>
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">İstemci (Client)</h3>
          <ul className="space-y-2 text-muted text-sm">
            <li><strong>İşletim Sistemi:</strong> Windows 10/11 (64-bit)</li>
            <li><strong>İşlemci:</strong> Çift Çekirdekli herhangi bir CPU</li>
            <li><strong>RAM:</strong> 4 GB RAM (Uygulama ortalama 50MB kullanır)</li>
            <li><strong>Ağ:</strong> 1 Gbps Yerel Ağ Bağlantısı</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg flex items-start gap-3">
        <AlertTriangle className="text-orange-500 shrink-0 mt-1" size={20} />
        <div>
          <h4 className="text-orange-400 font-bold mb-1">Güvenlik Duvarı Uyarısı</h4>
          <p className="text-orange-400/80 text-sm">Sunucu kurulumu sırasında Windows Güvenlik Duvarı'ndan (Firewall) TCP 5000 ve UDP 5001 portlarına izin verdiğinizden emin olun.</p>
        </div>
      </div>
    </div>
  ),
  "server-setup": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Sistem Kurulumu</h1>
      <p className="text-lg text-muted mb-10">Game Center'ın kalbi olan yazılımın ana makineye kurulması ve adım adım yapılandırma rehberi.</p>

      <div className="space-y-12">
        {/* Adım 1 */}
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="text-8xl font-black italic">1</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</span> 
            Kurulumu Başlatın
          </h2>
          <p className="text-muted mb-6">İndirdiğiniz GameCenter Setup dosyasına (örn: GameCenter_Setup.exe) çift tıklayarak kurulumu başlatın. Yönetici onayı (UAC) isterse onaylayın.</p>
          <img src="/images/setup_1.png" alt="Setup Ekranı 1" className="w-full rounded-xl shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500" />
        </div>

        {/* Adım 2 */}
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="text-8xl font-black italic">2</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</span> 
            Değişiklikleri İnceleyin
          </h2>
          <p className="text-muted mb-6">Yenilikler (Changelog) ekranını okuyabilir ve kurulacak sürüme ait en son eklenen yeni özellikleri ve notları görebilirsiniz.</p>
          <img src="/images/setup_2_changelog.png" alt="Changelog" className="w-full rounded-xl shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500" />
        </div>

        {/* Adım 3 */}
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="text-8xl font-black italic">3</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</span> 
            Bileşen Seçimi
          </h2>
          <p className="text-muted mb-6">GameCenter ana sistemi otomatik olarak seçilidir. Gereksiniminize göre diğer modülleri seçebilirsiniz.</p>
          <img src="/images/setup_3_bilesen.png" alt="Bileşen Seçimi" className="w-full rounded-xl shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500" />
        </div>

        {/* Adım 4 */}
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="text-8xl font-black italic">4</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">4</span> 
            Ağ & IP Ayarları
          </h2>
          <p className="text-muted mb-6">Sistemin kafedeki ağınızla sorunsuz iletişim kurabilmesi için sunucu makinenizin sabit IP adresini girmelisiniz. (Örn: 192.168.1.100)</p>
          <img src="/images/setup_4_ip.png" alt="IP Ayarları" className="w-full rounded-xl shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500" />
        </div>

        {/* Adım 5 */}
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="text-8xl font-black italic">5</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">5</span> 
            Kurulum Konumu
          </h2>
          <p className="text-muted mb-6">Kurulum yapılacak disk ve dizini seçin. Genellikle oyunlarınızı barındırdığınız veya geniş alana sahip ikincil bir disk olan D: veya E: sürücüsü tavsiye edilir.</p>
          <img src="/images/setup_5_folder.png" alt="Kurulum Klasörü" className="w-full rounded-xl shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500" />
        </div>

        {/* Adım 6 */}
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="text-8xl font-black italic">6</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
            <span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">6</span> 
            Tamamlanıyor
          </h2>
          <p className="text-muted mb-6">Gerekli kısayolları eklemek isteyip istemediğinizi seçtikten sonra kurulumu hızlıca tamamlayabilirsiniz.</p>
          <img src="/images/setup_6_kısayol.png" alt="Kısayol ve Son Adımlar" className="w-full rounded-xl shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500" />
        </div>
      </div>

      <div className="glass-panel p-6 border-l-4 border-l-emerald-500 mt-12">
         <h3 className="text-emerald-400 font-bold mb-2 flex items-center gap-2"><CheckCircle2 size={20} /> Kurulum Sonrası İlk Çalıştırma</h3>
         <p className="text-muted text-sm leading-relaxed">
           Sunucu ilk açıldığında <code className="text-emerald-300 bg-emerald-500/10 px-1 py-0.5 rounded">gameserver.db</code> SQLite veritabanını otomatik oluşturur ve bulut bağlantısını sağlar. Tüm işlemler bittiğinde "admin" kullanıcı adıyla sisteme giriş yapabilirsiniz!
         </p>
      </div>
    </div>
  ),
  "mklink": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">MkLink Sistemi (Smart Junction)</h1>
      <p className="text-lg text-muted mb-8">Ağ üzerindeki oyun dosyalarını, sanki kullanıcının C:\ diski içindeymiş gibi gösteren sihirli otomasyon.</p>
      
      <p className="text-muted mb-6">
        Özellikle Riot Games, Epic Games ve Save dosyaları C:\Users\AppData gibi spesifik dizinlerde çalışmaya programlanmıştır. Game Center, oyuna girilmeden saniyeler önce ağdaki bir klasörü veya DeepFreeze kurulu diski MkLink (Junction) ile yerel diske bağlar.
      </p>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Örnek MkLink Kullanımı</h2>
      <div className="bg-[#050608] border border-white/10 rounded-lg overflow-hidden mb-6">
         <div className="bg-white/5 px-4 py-2 text-xs font-bold text-gray-400 border-b border-white/10">KOMUT SATIRI MANTIĞI</div>
         <div className="p-4 font-mono text-sm text-blue-400">
           <span className="text-gray-500"># Arka planda Client şu komutu çalıştırır:</span><br/>
           mklink /J "C:\Users\Player\AppData\Local\Riot Games" "\\192.168.1.100\Oyunlar\Riot_AppData"
         </div>
      </div>
      
      <p className="text-muted mb-4">
        Server üzerinden "Eklentiler" menüsüne girip <strong>MkLink</strong> profillerini yönetebilir ve oyunlara özel şablonlar atayabilirsiniz.
      </p>
    </div>
  )
};

// Fallback for empty ones
const getArticle = (id) => WIKI_ARTICLES[id] || (
  <div className="animate-fade-in-up">
    <h1 className="text-4xl font-bold text-white mb-4">İçerik Hazırlanıyor</h1>
    <p className="text-muted">Bu dokümantasyon sayfası henüz yazılmadı. Lütfen daha sonra tekrar kontrol edin.</p>
  </div>
);


const Wiki = () => {
  const [activeArticle, setActiveArticle] = useState("intro");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen pt-[72px] flex relative bg-bg-primary">
      
      {/* MOBILE HEADER (Only visible on small screens) */}
      <div className="md:hidden fixed top-[72px] left-0 right-0 z-30 bg-[#12141d] border-b border-white/5 p-4 flex items-center justify-between">
        <span className="text-white font-bold flex items-center gap-2">
          <BookOpen className="text-orange-500" size={18} /> Dokümantasyon Menüsü
        </span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white/70 hover:text-white">
          <Menu size={24} />
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed md:sticky top-[72px] md:top-[72px] left-0 h-[calc(100vh-72px)] 
        w-72 bg-[#0a0b10] border-r border-white/5 p-6 overflow-y-auto
        transition-transform duration-300 z-40
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        <div className="relative mb-8 mt-12 md:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Dokümantasyonda ara..." 
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors"
          />
        </div>

        <nav>
          {WIKI_STRUCTURE.map((section, idx) => (
            <div key={idx} className="mb-8">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                {section.section}
              </h4>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveArticle(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left
                        ${activeArticle === item.id 
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' 
                          : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
                      `}
                    >
                      {item.icon} {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* OVERLAY FOR MOBILE */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 md:hidden" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-x-hidden pt-20 md:pt-10 px-6 md:px-16 pb-20 relative">
        <div className="max-w-4xl mx-auto">
          {getArticle(activeArticle)}
          
          {/* Bottom Navigation (Next/Prev placeholders) */}
          <div className="mt-16 pt-8 border-t border-white/10 flex justify-between">
            <button className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-colors">
              Geri Dön
            </button>
            <button className="text-orange-400 hover:text-orange-300 text-sm font-bold flex items-center gap-1 transition-colors">
              Sonraki Konu <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Wiki;
