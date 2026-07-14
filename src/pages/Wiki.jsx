import React, { useState } from 'react';
import { BookOpen, Server, Monitor, Shield, Settings, Activity, Search, ChevronRight, ChevronDown, Menu, Terminal, AlertTriangle, CheckCircle2, LayoutDashboard, Rss, Cloud, Cpu, Database, Save, Key, Wifi, Users, Image as ImageIcon, FolderSync, Megaphone, Gamepad2, Laptop, Network } from 'lucide-react';

const WIKI_STRUCTURE = [
  {
    section: "Başlangıç",
    items: [
      { id: "intro", title: "Game Center Nedir?", icon: <BookOpen size={16} /> },
      { id: "requirements", title: "Sistem Gereksinimleri", icon: <CheckCircle2 size={16} /> },
      { id: "license", title: "Lisans ve Üyelik", icon: <Key size={16} /> },
    ]
  },
  {
    section: "Kurulum Rehberi",
    items: [
      { id: "server-setup", title: "Sunucu Kurulumu", icon: <Server size={16} /> },
      { id: "client-setup", title: "İstemci ve Arayüz", icon: <Monitor size={16} /> },
    ]
  },
  {
    section: "Yönetim Panelleri",
    items: [
      { id: "local-admin", title: "Yerel Admin Paneli", icon: <LayoutDashboard size={16} /> },
      { id: "cloud-admin", title: "Bulut SuperAdmin", icon: <Cloud size={16} /> },
    ]
  },
  {
    section: "Gelişmiş Sistemler",
    items: [
      { id: "mklink", title: "MkLink Otomasyonu", icon: <Activity size={16} /> },
      { id: "save-cloud", title: "Save (Oyun Kaydı)", icon: <Save size={16} /> },
    ]
  },
  {
    section: "Teknik Dokümantasyon",
    items: [
      { id: "network", title: "Ağ Protokolleri", icon: <Wifi size={16} /> },
      { id: "database", title: "Veritabanı Şeması", icon: <Database size={16} /> },
      { id: "telemetry", title: "Donanım İzleme", icon: <Cpu size={16} /> },
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
        <h3 className="text-white font-bold mb-2 flex items-center gap-2"><CheckCircle2 className="text-blue-500" /> Üç Katmanlı Mimari (3-Tier)</h3>
        <ul className="text-muted text-sm space-y-3 mt-4">
          <li className="flex gap-3">
            <Monitor className="text-blue-400 shrink-0" size={20} />
            <div><strong>Client (İstemci):</strong> C# WPF tabanlıdır. Oyuncunun etkileşime girdiği, %100 yerel donanım gücünü kullanan arayüz. TCP/UDP üzerinden sunucu ile saniyelik haberleşir.</div>
          </li>
          <li className="flex gap-3">
            <Server className="text-blue-400 shrink-0" size={20} />
            <div><strong>Server (Yerel Sunucu):</strong> Python tabanlıdır. Kafedeki trafiği yönetir, REST API (Flask benzeri mimari) ve SQLite motoru ile çalışır.</div>
          </li>
          <li className="flex gap-3">
            <Cloud className="text-blue-400 shrink-0" size={20} />
            <div><strong>Cloud (Bulut Veritabanı):</strong> Vercel Postgres üzerinden tüm kafelerin loglarını, lisans durumlarını, yönetici yetkilerini ve oyun kapaklarını senkronize eden merkezi Next.js sistemi.</div>
          </li>
        </ul>
      </div>

      <h2 className="text-2xl font-bold text-white mb-4 mt-8">Öne Çıkan Özellikler</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#050608] p-5 rounded-xl border border-white/5 hover:border-orange-500/30 transition-colors">
          <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2"><Activity size={18} /> Smart Sync</h4>
          <p className="text-sm text-gray-400">Ağ trafiğini %90 oranında azaltarak sadece değişen verileri ve kapak resimlerini yükler. İstemci önbelleğinde kalıcı saklama yapar.</p>
        </div>
        <div className="bg-[#050608] p-5 rounded-xl border border-white/5 hover:border-orange-500/30 transition-colors">
          <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2"><Wifi size={18} /> Dahili Sesli Sohbet</h4>
          <p className="text-sm text-gray-400">İnternet bağlantısı kopsa dahi UDP Port 5002 üzerinden yerel ağda sıfır gecikmeli bas-konuş (Push-to-Talk) iletişim sağlar.</p>
        </div>
        <div className="bg-[#050608] p-5 rounded-xl border border-white/5 hover:border-orange-500/30 transition-colors">
          <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2"><Cpu size={18} /> OSD Canlı Monitör</h4>
          <p className="text-sm text-gray-400">DirectX kancası gerektirmeden oyuncuların ekranlarına FPS, Ping, RAM ve CPU kullanımını anlık yansıtan dahili overlay sistemi.</p>
        </div>
        <div className="bg-[#050608] p-5 rounded-xl border border-white/5 hover:border-orange-500/30 transition-colors">
          <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2"><Save size={18} /> Save Bulutu</h4>
          <p className="text-sm text-gray-400">Hikaye modlu oyunlarındaki Save dosyalarını yerel ağdaki sunucuya milisaniyeler içinde yedekler ve diğer bilgisayarlara taşır.</p>
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
            <li><strong>Disk:</strong> NVMe SSD (Mekanik disk kullanılması şiddetle reddedilir)</li>
            <li><strong>Ağ:</strong> 10 Gbps Yerel Ağ Bağlantısı (Tercihen CAT6 veya CAT6A altyapısı)</li>
            <li><strong>Yazılım:</strong> Visual C++ Redistributable (Tüm Yıllar)</li>
          </ul>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2 flex items-center gap-2"><Monitor size={18} className="text-orange-400"/> İstemci (Client)</h3>
          <ul className="space-y-3 text-muted text-sm">
            <li><strong>İşletim Sistemi:</strong> Windows 10/11 (64-bit)</li>
            <li><strong>İşlemci:</strong> Çift çekirdekli herhangi bir güncel işlemci</li>
            <li><strong>RAM:</strong> Uygulama arka planda sadece ~50MB tüketir</li>
            <li><strong>Ağ:</strong> 1 Gbps Yerel Ağ Bağlantısı</li>
            <li><strong>Yazılım:</strong> .NET Framework 4.8 veya üzeri</li>
          </ul>
        </div>
      </div>
    </div>
  ),

  "license": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Lisans ve Üyelik Sistemi</h1>
      <p className="text-lg text-muted mb-8">Game Center Plus, Vercel Postgres tabanlı sağlam bir güvenlik ve doğrulama sistemi kullanır.</p>

      <div className="glass-panel p-6 border-l-4 border-l-purple-500">
        <h3 className="text-xl font-bold text-white mb-3">Postgres Bulut Doğrulaması</h3>
        <p className="text-muted text-sm leading-relaxed mb-4">
          Satın aldığınız lisans kodu (Reference Code) direkt olarak <strong>Bulut Veritabanına (Vercel)</strong> işlenir. Admin Paneline ilk girişinizde sistem bu kodu buluttan sorgular. Eğer kod geçerliyse hesabınız "Plus Aktif" durumuna gelir ve veritabanına MAC adresi veya IP bazlı kayıt atılır.
        </p>
      </div>
    </div>
  ),

  "server-setup": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Sistem Kurulumu</h1>
      <p className="text-lg text-muted mb-10">Game Center'ın kalbi olan yazılımın ana makineye kurulması ve adım adım yapılandırma rehberi.</p>

      <div className="space-y-8 relative">
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-8xl font-black italic">1</span></div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3"><span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">1</span> Kurulumu Başlatın</h2>
          <p className="text-muted mb-6">İndirdiğiniz GameCenter Setup dosyasına çift tıklayarak kurulumu başlatın.</p>
          <img src="/images/setup_1.png" alt="Setup" className="w-auto max-w-[550px] object-contain mx-auto block rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/20 group-hover:scale-[1.02] transition-transform duration-500" />
        </div>
        
        <div className="flex justify-center -my-4 opacity-50"><ChevronDown size={32} className="text-orange-500 animate-bounce" /></div>
        
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-8xl font-black italic">2</span></div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3"><span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">2</span> Yenilikleri (Changelog) İnceleyin</h2>
          <img src="/images/setup_2_changelog.png" alt="Changelog" className="w-auto max-w-[550px] object-contain mx-auto block rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/20 group-hover:scale-[1.02] transition-transform duration-500" />
        </div>
        
        <div className="flex justify-center -my-4 opacity-50"><ChevronDown size={32} className="text-orange-500 animate-bounce" /></div>
        
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-8xl font-black italic">3</span></div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3"><span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">3</span> Bileşen Seçimi</h2>
          <p className="text-muted mb-6">GameCenter ana sistemi otomatik seçilidir, isteğinize göre Client paketlerini de ekleyebilirsiniz.</p>
          <img src="/images/setup_3_bilesen.png" alt="Bilesen" className="w-auto max-w-[550px] object-contain mx-auto block rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/20 group-hover:scale-[1.02] transition-transform duration-500" />
        </div>
        
        <div className="flex justify-center -my-4 opacity-50"><ChevronDown size={32} className="text-orange-500 animate-bounce" /></div>
        
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-8xl font-black italic">4</span></div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3"><span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">4</span> Ağ ve IP Yapılandırması</h2>
          <p className="text-muted mb-6">Sunucu makinenizin sabit IP adresini girmelisiniz (Örn: 192.168.1.100). İstemciler bu IP'yi arayacaktır.</p>
          <img src="/images/setup_4_ip.png" alt="IP Ayar" className="w-auto max-w-[550px] object-contain mx-auto block rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/20 group-hover:scale-[1.02] transition-transform duration-500" />
        </div>
        
        <div className="flex justify-center -my-4 opacity-50"><ChevronDown size={32} className="text-orange-500 animate-bounce" /></div>
        
        <div className="glass-panel p-8 border-l-4 border-l-orange-500 relative overflow-hidden group hover:border-l-orange-400 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-10"><span className="text-8xl font-black italic">5</span></div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3"><span className="bg-orange-500/20 text-orange-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">5</span> Kurulum Dizinini Seçin</h2>
          <p className="text-muted mb-6">D: veya E: sürücüsüne kurmanız tavsiye edilir.</p>
          <img src="/images/setup_5_folder.png" alt="Folder" className="w-auto max-w-[550px] object-contain mx-auto block rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/20 group-hover:scale-[1.02] transition-transform duration-500" />
        </div>
      </div>
    </div>
  ),

  "client-setup": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">İstemci ve Arayüz (Client)</h1>
      <p className="text-lg text-muted mb-8">İstemci uygulaması C# ve WPF ile kodlanmış, %100 yerel donanım gücünü kullanan üst düzey bir arayüzdür.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="glass-panel p-6 border-t-4 border-t-blue-500">
          <h3 className="text-xl font-bold text-white mb-3">DirectX ve XAML Mimarisi</h3>
          <p className="text-muted text-sm leading-relaxed">
            Arayüz, donanım hızlandırmalı WPF kullanılarak tasarlanmıştır. Oyun kütüphanesindeki kapaklar (Covers) RAM'e cache'lenerek (Smart Sync) 0 gecikmeyle listelenir.
          </p>
        </div>

        <div className="glass-panel p-6 border-t-4 border-t-green-500">
          <h3 className="text-xl font-bold text-white mb-3">Steam Entegrasyonu</h3>
          <p className="text-muted text-sm leading-relaxed">
            Sistem, kayıtlı Steam hesaplarına otomatik login işlemini regedit komutları veya doğrudan parametre ile gerçekleştirir.
          </p>
        </div>
      </div>
      
      <img src="/images/client 1.png" alt="Client Dashboard" className="w-full max-w-4xl mx-auto rounded-xl shadow-2xl border border-white/10" />
    </div>
  ),

  "local-admin": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Yerel Admin Paneli (Kafe İçi)</h1>
      <p className="text-lg text-muted mb-8">Game Center'ın sunucu yazılımı ile gelen devasa React paneli. Yerel ağdaki (192.168.X.X:5000) tüm bilgisayarları denetlemenizi sağlar.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#050608] p-5 rounded-lg border border-white/5 hover:border-orange-500/30 transition-colors">
          <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2"><Gamepad2 size={16}/> Oyun Yönetimi</h4>
          <p className="text-sm text-gray-400">Veritabanına oyun ekleme, exe yolunu belirleme ve kapak görselleri atama işlemleri.</p>
        </div>
        <div className="bg-[#050608] p-5 rounded-lg border border-white/5 hover:border-orange-500/30 transition-colors">
          <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2"><Laptop size={16}/> İstemci Kontrolü</h4>
          <p className="text-sm text-gray-400">Masaları uzaktan kapatma, yeniden başlatma, Steam veya oyun durdurma.</p>
        </div>
        <div className="bg-[#050608] p-5 rounded-lg border border-white/5 hover:border-orange-500/30 transition-colors">
          <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2"><Network size={16}/> Ağ Monitörü (Recharts)</h4>
          <p className="text-sm text-gray-400">Kafedeki tüm veri aktarımını, download/upload saniyelik bazda grafiklendirir.</p>
        </div>
        <div className="bg-[#050608] p-5 rounded-lg border border-white/5 hover:border-orange-500/30 transition-colors">
          <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2"><Shield size={16}/> Güvenlik Tanımları</h4>
          <p className="text-sm text-gray-400">Zararlı yazılımlar ve yasaklı sitelerin tanımlanıp Client üzerinde engellenmesi.</p>
        </div>
        <div className="bg-[#050608] p-5 rounded-lg border border-white/5 hover:border-orange-500/30 transition-colors">
          <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2"><Terminal size={16}/> Steam Havuzu</h4>
          <p className="text-sm text-gray-400">Birden çok Steam hesabının sisteme girilerek, oyunlarda havuzdan hesap atanması.</p>
        </div>
        <div className="bg-[#050608] p-5 rounded-lg border border-white/5 hover:border-orange-500/30 transition-colors">
          <h4 className="text-orange-400 font-bold mb-2 flex items-center gap-2"><Activity size={16}/> Sistem Logları</h4>
          <p className="text-sm text-gray-400">Oyuncuların hangi saatte hangi oyuna girdiği, oluşan hata raporlarının kaydı.</p>
        </div>
      </div>
      
      <div className="glass-panel p-6 border-l-4 border-l-orange-500 mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Canlı Monitör ve OSD</h3>
        <p className="text-muted text-sm">Tüm istemcilerin donanım sıcaklığı (CPU/RAM) saniyelik websocket üzerinden Admin panele yansır.</p>
        <img src="/images/canlimonitör.png" className="w-full max-w-3xl rounded-lg mt-4 shadow-xl border border-white/5 mx-auto" />
      </div>
    </div>
  ),

  "cloud-admin": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Bulut SuperAdmin (Vercel)</h1>
      <p className="text-lg text-muted mb-8">Game Center sistemini bayilere ve kafelere satan merkezin kontrol paneli. Next.js ile kodlanmış ve Prisma Postgres üzerine kuruludur.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel p-6 border-t-2 border-t-purple-500 hover:border-t-purple-400 transition-colors">
          <h4 className="text-purple-400 font-bold mb-3 flex items-center gap-2"><Users size={18}/> Kullanıcı ve Grup Yönetimi</h4>
          <p className="text-sm text-gray-400">Bayi hesapları, yönetici grupları (Admin, Superadmin) oluşturma ve lisans yetkilerini ayarlama.</p>
        </div>
        <div className="glass-panel p-6 border-t-2 border-t-blue-500 hover:border-t-blue-400 transition-colors">
          <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2"><ImageIcon size={18}/> Cover (Kapak) Yönetimi</h4>
          <p className="text-sm text-gray-400">Vercel Blob / AWS S3 üzerinden tüm kafeler için ortak oyun kapağı havuzunun yönetilmesi.</p>
        </div>
        <div className="glass-panel p-6 border-t-2 border-t-green-500 hover:border-t-green-400 transition-colors">
          <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2"><FolderSync size={18}/> MkLink Arşivi</h4>
          <p className="text-sm text-gray-400">Yeni çıkan oyunların save ve appdata klasör yollarının buluta eklenip tüm kafelere otomatik inmesi.</p>
        </div>
        <div className="glass-panel p-6 border-t-2 border-t-orange-500 hover:border-t-orange-400 transition-colors">
          <h4 className="text-orange-400 font-bold mb-3 flex items-center gap-2"><Megaphone size={18}/> Global Duyurular</h4>
          <p className="text-sm text-gray-400">Tüm Game Center kullanılan kafelerin ekranlarına ve admin panellerine acil uyarı/duyuru geçme imkanı.</p>
        </div>
      </div>
    </div>
  ),

  "mklink": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">MkLink Otomasyonu</h1>
      <p className="text-lg text-muted mb-8">C: sürücüsü doluluğuna son veren NTFS Junction mantığı.</p>

      <div className="glass-panel p-8 mb-8 border-l-4 border-l-green-500">
        <h3 className="text-xl font-bold text-white mb-4">Junction Point (Sembolik Bağ) Mantığı</h3>
        <p className="text-muted leading-relaxed mb-6">
          Bazı oyunlar save veya konfigürasyon dosyalarını inatla <code>C:\Users\...\AppData</code> dizinine atar. Game Center, oyuna girmeden 1 milisaniye önce bir Windows CMD komutu çalıştırarak bu klasörü ağdaki Sunucuya bağlar (Junction).
        </p>
        
        <div className="bg-[#050608] border border-white/10 rounded-lg overflow-hidden mb-6">
           <div className="bg-white/5 px-4 py-2 text-xs font-bold text-gray-400 border-b border-white/10">KOMUT SATIRI MANTIĞI</div>
           <div className="p-4 font-mono text-sm text-blue-400">
             <span className="text-gray-500"># Arka planda Client otomatik olarak şu komutu işler:</span><br/>
             mklink /J "C:\Users\Player\AppData\Local\Riot Games" "\\192.168.1.100\Oyunlar\Riot_AppData"
           </div>
        </div>
      </div>
    </div>
  ),

  "save-cloud": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Save (Oyun Kaydı) Bulutu</h1>
      <p className="text-lg text-muted mb-8">Hikaye tabanlı oyunlar için "Oturduğum masadan kaldığım yerden devam et" sistemi.</p>
      
      <div className="glass-panel p-6 border-t-4 border-t-blue-400">
        <h3 className="text-xl font-bold text-white mb-3">Nasıl Çalışır?</h3>
        <ul className="text-muted text-sm space-y-4">
          <li className="flex gap-2">
            <CheckCircle2 className="text-blue-400 shrink-0" size={18} />
            Oyuncu "GTA V" oyununa girdiğinde, sistem arka planda Sunucudan Save dosyasını kontrol eder.
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="text-blue-400 shrink-0" size={18} />
            Masa numarası veya Steam ID üzerinden eşleşme bulunursa, Save klasörü kopyalanır.
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="text-blue-400 shrink-0" size={18} />
            Oyundan çıkıldığında, değişen dosyalar yakalanır ve tekrar Sunucuya ZIP/Kopya olarak yedeklenir.
          </li>
        </ul>
      </div>
    </div>
  ),

  "network": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Ağ Protokolleri (Network)</h1>
      <p className="text-lg text-muted mb-8">Game Center'ın hızı, veriyi doğru protokolle taşımasından gelir.</p>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-sm uppercase tracking-wider text-gray-400">
              <th className="p-4 font-bold">Protokol</th>
              <th className="p-4 font-bold">Port</th>
              <th className="p-4 font-bold">Görevi / Modül</th>
              <th className="p-4 font-bold">Gecikme</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors text-white">
              <td className="p-4"><span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded font-bold">TCP</span></td>
              <td className="p-4">5000</td>
              <td className="p-4">REST API (Ana veritabanı okuma, oyun listesi çekme)</td>
              <td className="p-4 text-green-400">~1ms</td>
            </tr>
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors text-white">
              <td className="p-4"><span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded font-bold">UDP</span></td>
              <td className="p-4">5001</td>
              <td className="p-4">Network Discovery (Ağ Keşfi). Client'lar sunucu IP'sini bulmak için Broadcast yayını yapar.</td>
              <td className="p-4 text-green-400">~0ms</td>
            </tr>
            <tr className="border-b border-white/5 hover:bg-white/5 transition-colors text-white">
              <td className="p-4"><span className="bg-orange-500/20 text-orange-400 px-2 py-1 rounded font-bold">UDP</span></td>
              <td className="p-4">5002</td>
              <td className="p-4">Voice Chat (Sesli Sohbet). Ses paketleri doğrudan ağa basılır, aracı sunucu yorulmaz.</td>
              <td className="p-4 text-green-400">~0ms</td>
            </tr>
            <tr className="hover:bg-white/5 transition-colors text-white">
              <td className="p-4"><span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded font-bold">WebSocket</span></td>
              <td className="p-4">5000</td>
              <td className="p-4">Telemetry (Sıcaklık, RAM, Ağ izleme logları Admin panele saniyede 1 kez basılır).</td>
              <td className="p-4 text-green-400">~1ms</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  ),

  "database": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Veritabanı Şeması</h1>
      <p className="text-lg text-muted mb-8">Hem yerel ağda ışık hızında çalışan hem de bulutta güvende kalan melez (Hibrit) bir veritabanı yapısı.</p>

      <ul className="space-y-6">
        <li className="glass-panel p-6 border-l-4 border-l-blue-500">
          <h3 className="text-xl font-bold text-white mb-2">SQLite (Local DB)</h3>
          <p className="text-muted text-sm mb-4">Sunucunun kök dizininde bulunan <code>gameserver.db</code> dosyasıdır. İnternet kesilse bile kafedeki sistemin kusursuz çalışmasını sağlar.</p>
        </li>

        <li className="glass-panel p-6 border-l-4 border-l-white">
          <h3 className="text-xl font-bold text-white mb-2">Vercel Postgres (Cloud DB)</h3>
          <p className="text-muted text-sm">Prisma ORM kullanılarak kodlanmıştır. Yönetim paneline girişte admin şifrelerini, lisans sürelerini (Reference Kodlarını) ve kapak fotoğraflarını barındırır.</p>
        </li>
      </ul>
    </div>
  ),

  "telemetry": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Donanım İzleme (OSD ve Telemetry)</h1>
      <p className="text-lg text-muted mb-8">Adminlerin bilgisayarlardaki donanım problemlerini hissetmeden teşhis edebilmesi için tasarlandı.</p>

      <div className="glass-panel p-6">
        <h3 className="text-xl font-bold text-white mb-3">LibreHardwareMonitorLib Entegrasyonu</h3>
        <p className="text-muted text-sm leading-relaxed mb-4">
          C# İstemcisi içerisinde gömülü olan bu kütüphane, yetkilendirilmiş Windows servisleri (WMI) üzerinden anakart sensörlerine erişir. Her 1 saniyede şu verileri çeker:
        </p>
        <ul className="grid grid-cols-2 gap-2 text-sm text-gray-400 list-disc ml-4">
          <li>CPU Paket Sıcaklığı (Package Temp)</li>
          <li>CPU Toplam Yük (Load %)</li>
          <li>RAM Kullanım Oranı</li>
          <li>Ağ Kartı Download/Upload Hızı</li>
        </ul>
        <p className="text-muted text-sm leading-relaxed mt-4">
          Toplanan bu veriler, WebSocket aracılığıyla Python Sunucusuna iletilir. Sunucu, bunu React Admin Paneline broadcast eder ve yönetici canlı grafikleri izler.
        </p>
      </div>
    </div>
  )
};

const Wiki = () => {
  const [activeArticle, setActiveArticle] = useState("intro");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getArticle = (id) => WIKI_ARTICLES[id] || (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">İçerik Hazırlanıyor</h1>
      <p className="text-muted">Bu dokümantasyon sayfası henüz yazılmadı.</p>
    </div>
  );

  return (
    <div className="flex-1 w-full flex relative bg-bg-primary pt-[80px]">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-[80px] left-0 right-0 z-30 bg-[#12141d] border-b border-white/5 p-4 flex items-center justify-between">
        <span className="text-white font-bold flex items-center gap-2">
          <BookOpen className="text-orange-500" size={18} /> Dokümantasyon Menüsü
        </span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white/70 hover:text-white">
          <Menu size={24} />
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
        fixed md:sticky top-[80px] md:top-[80px] left-0 h-[calc(100vh-80px)] 
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
      <main className="flex-1 overflow-x-hidden pt-8 md:pt-12 px-6 md:px-16 pb-20 relative">
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
