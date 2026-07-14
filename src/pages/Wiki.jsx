import React, { useState } from 'react';
import { BookOpen, Server, Monitor, Shield, Settings, Activity, Search, ChevronRight, Menu, Terminal, AlertTriangle, CheckCircle2, LayoutDashboard, Rss } from 'lucide-react';

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
      { id: "server-setup", title: "Sunucu Kurulumu", icon: <Server size={16} /> },
      { id: "client-setup", title: "İstemci ve Arayüz", icon: <Monitor size={16} /> },
      { id: "admin-panel", title: "Yönetim Paneli", icon: <LayoutDashboard size={16} /> },
    ]
  },
  {
    section: "Gelişmiş Sistemler",
    items: [
      { id: "mklink", title: "MkLink Otomasyonu", icon: <Activity size={16} /> },
      { id: "network", title: "Ağ ve Canlı İzleme", icon: <Rss size={16} /> },
      { id: "config", title: "Ayarlar ve Veritabanı", icon: <Settings size={16} /> },
    ]
  }
];

const WIKI_ARTICLES = {
  "intro": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Game Center Nedir?</h1>
      <p className="text-lg text-muted mb-8">
        Game Center, internet kafeler ve e-spor merkezleri için geliştirilmiş, ultra hızlı, modern ve tamamen donanım odaklı bir oyun yönetim platformudur. Geleneksel sistemlerin aksine 3 katmanlı modern bir mimariyle çalışır.
      </p>
      
      <div className="glass-panel p-6 mb-8 border-l-4 border-l-blue-500">
        <h3 className="text-white font-bold mb-2 flex items-center gap-2"><CheckCircle2 className="text-blue-500" /> Üç Katmanlı Mimari</h3>
        <ul className="text-muted text-sm space-y-2 ml-6 list-disc">
          <li><strong>Client (İstemci):</strong> Oyuncunun etkileşime girdiği, %100 yerel donanım gücünü kullanan ve ağ trafiğini optimize eden arayüz.</li>
          <li><strong>Server (Yerel Sunucu):</strong> Kafedeki trafiği yöneten, Python tabanlı hızlı REST API ve SQLite motoru.</li>
          <li><strong>Cloud (Bulut Veritabanı):</strong> Vercel Postgres üzerinden tüm kafelerin loglarını, lisans durumlarını ve oyun kapaklarını senkronize eden merkezi sistem.</li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Öne Çıkan Özellikler</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#050608] p-4 rounded-xl border border-white/5">
          <h4 className="text-orange-400 font-bold mb-2">Smart Sync (Akıllı Senkronizasyon)</h4>
          <p className="text-sm text-gray-400">Ağ trafiğini %90 oranında azaltarak sadece değişen verileri ve kapak resimlerini yükler. Sistem belleğinde oyunları önbelleğe alır.</p>
        </div>
        <div className="bg-[#050608] p-4 rounded-xl border border-white/5">
          <h4 className="text-orange-400 font-bold mb-2">Dahili Sesli Sohbet (LAN Voice)</h4>
          <p className="text-sm text-gray-400">İnternet bağlantısı olmasa dahi UDP portları üzerinden yerel ağda sıfır gecikmeli bas-konuş (Push-to-Talk) iletişim sağlar.</p>
        </div>
        <div className="bg-[#050608] p-4 rounded-xl border border-white/5">
          <h4 className="text-orange-400 font-bold mb-2">OSD Canlı Monitör</h4>
          <p className="text-sm text-gray-400">Oyuncuların ekranlarına FPS, Ping, RAM ve CPU kullanımını anlık olarak yansıtan dahili overlay (OSD) sistemi.</p>
        </div>
        <div className="bg-[#050608] p-4 rounded-xl border border-white/5">
          <h4 className="text-orange-400 font-bold mb-2">Save (Oyun Kaydı) Bulutu</h4>
          <p className="text-sm text-gray-400">Oyuncuların Hikaye modlu oyunlarındaki Save dosyalarını yerel ağdaki sunucuya otomatik yedekler ve diğer bilgisayarlara taşır.</p>
        </div>
      </div>
    </div>
  ),
  
  "requirements": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Sistem Gereksinimleri</h1>
      <p className="text-lg text-muted mb-8">Game Center'ın yüksek performanslı veri aktarımını sorunsuz yapabilmesi için tavsiye edilen altyapı standartları.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2 flex items-center gap-2"><Server size={18} className="text-orange-400"/> Sunucu (Server)</h3>
          <ul className="space-y-3 text-muted text-sm">
            <li><strong>İşletim Sistemi:</strong> Windows 10/11 veya Windows Server 2019+ (64-bit)</li>
            <li><strong>İşlemci:</strong> Minimum 4 Çekirdek (Örn: Intel i5 10. Nesil veya Ryzen 5)</li>
            <li><strong>RAM:</strong> 16 GB veya üzeri (SQLite bellek önbelleği için hayati önem taşır)</li>
            <li><strong>Ağ:</strong> 1 Gbps veya 10 Gbps Yerel Ağ Bağlantısı</li>
            <li><strong>Disk:</strong> SSD veya NVMe disk (Oyun kapaklarının hızlı iletimi için)</li>
          </ul>
        </div>
        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2 flex items-center gap-2"><Monitor size={18} className="text-blue-400"/> İstemci (Client)</h3>
          <ul className="space-y-3 text-muted text-sm">
            <li><strong>İşletim Sistemi:</strong> Windows 10/11 (64-bit)</li>
            <li><strong>İşlemci:</strong> Çift Çekirdekli herhangi bir güncel işlemci</li>
            <li><strong>RAM:</strong> 4 GB RAM (Uygulama arka planda ~50MB tüketir)</li>
            <li><strong>Ağ:</strong> 1 Gbps Yerel Ağ Bağlantısı</li>
            <li><strong>Yazılım:</strong> .NET Framework 4.8 veya üzeri</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg flex items-start gap-3 mt-8">
        <AlertTriangle className="text-orange-500 shrink-0 mt-1" size={20} />
        <div>
          <h4 className="text-orange-400 font-bold mb-1">Güvenlik Duvarı ve Port İzinleri</h4>
          <p className="text-orange-400/80 text-sm">Sunucu bilgisayarınızda Windows Güvenlik Duvarı veya Antivirüs programından aşağıdaki portlara izin verdiğinizden emin olun:<br/>
          - <strong>TCP 5000:</strong> REST API (Ana Veri İletişimi)<br/>
          - <strong>UDP 5001:</strong> Ağ Keşfi (Network Discovery)<br/>
          - <strong>UDP 5002:</strong> Sesli Sohbet (Voice Chat)
          </p>
        </div>
      </div>
    </div>
  ),

  "server-setup": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Sistem Kurulumu</h1>
      <p className="text-lg text-muted mb-10">Game Center'ın kalbi olan yazılımın ana makineye kurulması ve adım adım yapılandırma rehberi.</p>

      <div className="space-y-12">
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-8xl font-black italic">1</span></div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3"><span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</span> Kurulumu Başlatın</h2>
          <p className="text-muted mb-6">İndirdiğiniz GameCenter Setup dosyasına çift tıklayarak kurulumu başlatın.</p>
          <img src="/images/setup_1.png" alt="Setup" className="w-full md:w-3/4 lg:w-2/3 max-w-3xl mx-auto block rounded-xl shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500" />
        </div>
        
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-8xl font-black italic">2</span></div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3"><span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</span> Yenilikleri (Changelog) İnceleyin</h2>
          <img src="/images/setup_2_changelog.png" alt="Changelog" className="w-full md:w-3/4 lg:w-2/3 max-w-3xl mx-auto block rounded-xl shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500" />
        </div>
        
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-8xl font-black italic">3</span></div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3"><span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</span> Bileşen Seçimi</h2>
          <p className="text-muted mb-6">GameCenter ana sistemi otomatik seçilidir, isteğinize göre Client paketlerini de ekleyebilirsiniz.</p>
          <img src="/images/setup_3_bilesen.png" alt="Bilesen" className="w-full md:w-3/4 lg:w-2/3 max-w-3xl mx-auto block rounded-xl shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500" />
        </div>
        
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-8xl font-black italic">4</span></div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3"><span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">4</span> Ağ ve IP Yapılandırması</h2>
          <p className="text-muted mb-6">Sunucu makinenizin sabit IP adresini girmelisiniz (Örn: 192.168.1.100). İstemciler bu IP'yi arayacaktır.</p>
          <img src="/images/setup_4_ip.png" alt="IP Ayar" className="w-full md:w-3/4 lg:w-2/3 max-w-3xl mx-auto block rounded-xl shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500" />
        </div>
        
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-8xl font-black italic">5</span></div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3"><span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">5</span> Kurulum Dizinini Seçin</h2>
          <p className="text-muted mb-6">D: veya E: sürücüsüne kurmanız tavsiye edilir.</p>
          <img src="/images/setup_5_folder.png" alt="Folder" className="w-full md:w-3/4 lg:w-2/3 max-w-3xl mx-auto block rounded-xl shadow-2xl border border-white/10 group-hover:scale-[1.01] transition-transform duration-500" />
        </div>
      </div>
    </div>
  ),

  "client-setup": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">İstemci (Client) ve Arayüz</h1>
      <p className="text-lg text-muted mb-10">Oyuncuların doğrudan etkileşime girdiği, akıcı ve büyüleyici Client arayüzünün detayları.</p>

      <div className="space-y-16">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Oyuncu Ana Ekranı</h2>
          <p className="text-muted mb-6">Oyunların kategorize edildiği, arka planda dinamik duvar kağıtlarının (glassmorphism) yer aldığı ana vitrin.</p>
          <img src="/images/client 1.png" alt="Ana Ekran" className="w-full md:w-3/4 lg:w-2/3 max-w-3xl mx-auto block rounded-xl shadow-2xl border border-white/10" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Oyunlar Menüsü</h2>
          <p className="text-muted mb-6">Sunucudan otomatik çekilen yüksek çözünürlüklü kapaklar ve MkLink entegrasyonu ile hızlı başlatma seçenekleri.</p>
          <img src="/images/oyunlar.png" alt="Oyunlar" className="w-full md:w-3/4 lg:w-2/3 max-w-3xl mx-auto block rounded-xl shadow-2xl border border-white/10" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Steam & Platform Entegrasyonu</h2>
          <p className="text-muted mb-6">Steam, Epic Games ve Riot gibi platformların oyunlarını algılayıp, kütüphane üzerinden tek tıkla otomatik oturum açma yetenekleri.</p>
          <img src="/images/client_steam.png" alt="Steam" className="w-full md:w-3/4 lg:w-2/3 max-w-3xl mx-auto block rounded-xl shadow-2xl border border-white/10" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Dahili Sesli Sohbet (LAN Voice)</h2>
          <p className="text-muted mb-6">İnternet kesilse bile kafedeki arkadaşlarınızla maç esnasında Bas-Konuş şeklinde iletişim kurabileceğiniz yerel telsiz sistemi.</p>
          <img src="/images/client_seslisohbet.png" alt="Sesli Sohbet" className="w-full md:w-3/4 lg:w-2/3 max-w-3xl mx-auto block rounded-xl shadow-2xl border border-white/10" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Kişisel İstatistikler</h2>
          <p className="text-muted mb-6">Oturum süresi boyunca hangi oyunun ne kadar oynandığını gösteren, oyuncuya özel analiz ekranı.</p>
          <img src="/images/client_istatistik.png" alt="İstatistik" className="w-full md:w-3/4 lg:w-2/3 max-w-3xl mx-auto block rounded-xl shadow-2xl border border-white/10" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Bulut Oyun Kayıtları (Cloud Save)</h2>
          <p className="text-muted mb-6">Minecraft, GTA V gibi yerel save tutan oyunların kayıtlarını ana makineye gönderip, bir sonraki gün farklı masaya otursanız dahi geri yükleyen sihirli sistem.</p>
          <img src="/images/client_oyunkayit.png" alt="Oyun Kayıt" className="w-full md:w-3/4 lg:w-2/3 max-w-3xl mx-auto block rounded-xl shadow-2xl border border-white/10" />
        </div>
      </div>
    </div>
  ),

  "admin-panel": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Yönetim Paneli (Web Admin)</h1>
      <p className="text-lg text-muted mb-10">Sunucu yöneticisinin tüm sistemi kontrol ettiği, React tabanlı ultra hızlı Web Dashboard.</p>

      <div className="space-y-16">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Kapsamlı Bilgisayar Yönetimi</h2>
          <p className="text-muted mb-6">Tüm istemcilerin çevrimiçi/çevrimdışı durumlarını, açık olan pencerelerini ve aktif kullanıcılarını anlık gördüğünüz kontrol merkezi.</p>
          <img src="/images/bilgisayarlar.png" alt="Bilgisayarlar" className="w-full md:w-3/4 lg:w-2/3 max-w-3xl mx-auto block rounded-xl shadow-2xl border border-white/10" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Canlı OSD Monitör Sistemi</h2>
          <p className="text-muted mb-6">İstemcilerin donanım sağlıklarını (Isı, Yük, RAM) saniyelik bazda grafiksel olarak inceleme imkanı.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <img src="/images/canlimonitör.png" alt="Canlı Monitör" className="w-full rounded-xl shadow-2xl border border-white/10" />
            <img src="/images/monitorgrafik.png" alt="Monitör Grafik" className="w-full rounded-xl shadow-2xl border border-white/10" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Ağ ve Trafik İzleme</h2>
          <p className="text-muted mb-6">Hangi bilgisayarın anlık olarak kaç Mbps Download / Upload yaptığını tek bir ekranda canlı olarak takip edin.</p>
          <img src="/images/agizleme.png" alt="Ağ İzleme" className="w-full md:w-3/4 lg:w-2/3 max-w-3xl mx-auto block rounded-xl shadow-2xl border border-white/10" />
        </div>
      </div>
    </div>
  ),

  "mklink": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">MkLink Otomasyonu (Smart Junction)</h1>
      <p className="text-lg text-muted mb-8">Oyunları yerel C: diskinde çalışıyormuş gibi kandırarak ağ (Network Drive) üzerinden sorunsuz oynatma teknolojisi.</p>
      
      <img src="/images/mklink.png" alt="MkLink Ayarları" className="w-full md:w-3/4 lg:w-2/3 max-w-3xl mx-auto block rounded-xl shadow-2xl border border-white/10 mb-8" />

      <p className="text-muted mb-6">
        Özellikle Riot Games (Valorant/LoL), Epic Games ve çeşitli Save dosyaları ısrarla C:\Users\AppData veya ProgramData gibi spesifik klasörler içinde konfigürasyon arar. Game Center'ın MkLink eklentisi, oyuna girilmeden saliseler önce ağdaki bir klasörü veya DeepFreeze kurulu bir diski Junction/Symlink yöntemiyle hedef klasöre bağlar.
      </p>

      <div className="bg-[#050608] border border-white/10 rounded-lg overflow-hidden mb-6">
         <div className="bg-white/5 px-4 py-2 text-xs font-bold text-gray-400 border-b border-white/10">KOMUT SATIRI MANTIĞI</div>
         <div className="p-4 font-mono text-sm text-blue-400">
           <span className="text-gray-500"># Arka planda Client otomatik olarak şu komutu işler:</span><br/>
           mklink /J "C:\Users\Player\AppData\Local\Riot Games" "\\192.168.1.100\Oyunlar\Riot_AppData"
         </div>
      </div>
    </div>
  ),

  "network": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Ağ Keşfi ve Telemetry</h1>
      <p className="text-lg text-muted mb-8">Game Center, ağ yapılandırmasına ihtiyaç duymadan cihazları birbirine bağlar.</p>
      
      <div className="glass-panel p-6 mb-6">
        <h3 className="text-white font-bold mb-3 text-xl">UDP Broadcast (Keşif)</h3>
        <p className="text-muted text-sm leading-relaxed">
          İstemciler (Clients) kurulduklarında sunucunun IP adresini bilmelerine gerek kalmaz (İsteğe bağlı). Arka planda UDP port 5001 üzerinden ağa bir "Broadcast" paketi yollarlar. Sunucu bu sinyali alır ve kendi IP'sini geri göndererek "el sıkışma (Handshake)" işlemini başlatır.
        </p>
      </div>

      <div className="glass-panel p-6">
        <h3 className="text-white font-bold mb-3 text-xl">Telemetry & WebSocket</h3>
        <p className="text-muted text-sm leading-relaxed">
          Aktif durumdaki tüm oyunlar, bilgisayarların donanım sensörleri (Sıcaklık, Yük) ve internet bant genişliği (Network I/O) WebSocket üzerinden saniyede 1 kez yerel sunucuya yollanır. Yönetici (Admin) panele girdiği anda bu anlık akışı milisaniye gecikmeyle canlı olarak izler.
        </p>
      </div>
    </div>
  ),
  
  "config": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Veritabanı ve Lisans Modeli</h1>
      <p className="text-lg text-muted mb-8">Hibrit veritabanı mimarisi ile hem yerel hızdan ödün verilmez, hem de bulut yedeklemesi sağlanır.</p>

      <ul className="space-y-6">
        <li className="glass-panel p-6 border-l-4 border-l-purple-500">
          <h3 className="text-xl font-bold text-white mb-2">SQLite (Local DB)</h3>
          <p className="text-muted text-sm">Sunucunun kök dizininde bulunan <code>gameserver.db</code> dosyasıdır. İnternet kesilse bile kafedeki sistemin kusursuz çalışmasını sağlar. Tüm oyun yolları, MkLink ayarları ve yerel istatistikler burada saklanır.</p>
        </li>
        
        <li className="glass-panel p-6 border-l-4 border-l-blue-500">
          <h3 className="text-xl font-bold text-white mb-2">Vercel Postgres (Cloud DB)</h3>
          <p className="text-muted text-sm">Kafeler arası (Şubeler) ortak oyun kapağı veritabanı, yazılım lisansları, küresel duyurular ve SuperAdmin kontrolleri bulutta güvenle işlenir. Sunucu açılışında geçerli bir <strong>Game Center Plus</strong> lisansınız (Reference Code) varsa, sistem otomatik buluta bağlanır.</p>
        </li>
      </ul>
    </div>
  )
};

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
    <div className="flex-1 w-full flex relative bg-bg-primary pt-[72px] md:pt-0">
      
      {/* MOBILE HEADER */}
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
        <div className="w-full max-w-7xl mx-auto">
          {getArticle(activeArticle)}
          
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
