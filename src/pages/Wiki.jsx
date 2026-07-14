import React, { useState } from 'react';
import { BookOpen, Server, Monitor, Shield, Settings, Activity, Search, ChevronRight, ChevronDown, Menu, Terminal, AlertTriangle, CheckCircle2, LayoutDashboard, Rss, Cloud, Cpu, Database, Save, Key, Wifi, Users, Image as ImageIcon, FolderSync, Megaphone, Gamepad2, Laptop, Network, LineChart, Star, FolderOpen, Puzzle, Link as LinkIcon, RefreshCw, Power, Ban, Plus, Edit, Download, History, Zap, CheckCircle, Crosshair, Target } from 'lucide-react';

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
    section: "Admin Paneli Modülleri",
    items: [
      { id: "mod-dashboard", title: "Dashboard", icon: <LayoutDashboard size={16} /> },
      { id: "mod-clients", title: "Bilgisayarlar", icon: <Monitor size={16} /> },
      { id: "mod-live", title: "Canlı Monitör", icon: <Activity size={16} /> },
      { id: "mod-osd", title: "Monitör OSD", icon: <LineChart size={16} /> },
      { id: "mod-network", title: "Ağ İzleme", icon: <Wifi size={16} /> },
      { id: "mod-games", title: "Oyunlar", icon: <Gamepad2 size={16} /> },
      { id: "mod-favorites", title: "Favori Oyunlar", icon: <Star size={16} /> },
      { id: "mod-users", title: "Kullanıcılar", icon: <Users size={16} /> },
      { id: "mod-saves", title: "Oyun Kayıt", icon: <Save size={16} /> },
      { id: "mod-definitions", title: "Tanımlamalar", icon: <FolderOpen size={16} /> },
      { id: "mod-plugins", title: "Eklentiler", icon: <Puzzle size={16} /> },
      { id: "mod-mklinks", title: "MkLink Şablonları", icon: <LinkIcon size={16} /> },
      { id: "mod-updates", title: "Güncellemeler", icon: <RefreshCw size={16} /> },
      { id: "mod-filter", title: "Filtreli Oyunlar", icon: <Shield size={16} /> },
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
  /* STARTING SECTIONS */
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
    </div>
  ),
  
  "requirements": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Sistem Gereksinimleri</h1>
      <p className="text-lg text-muted mb-8">Game Center'ın yüksek performanslı veri aktarımını sorunsuz yapabilmesi için tavsiye edilen altyapı standartları.</p>
      <div className="glass-panel p-6 mb-4">
         <p className="text-sm text-gray-300">Minimum 1 Gbps Yerel Ağ, NVMe SSD'li bir ana makine (Server) ve Windows 10/11 kurulu Client'lar gereklidir.</p>
      </div>
    </div>
  ),

  "license": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Lisans ve Üyelik Sistemi</h1>
      <p className="text-lg text-muted mb-8">Bulut tabanlı şifreli yetkilendirme sistemi (Vercel Postgres üzerinden).</p>
      <div className="glass-panel p-6">
        <p className="text-sm text-gray-300">Her kafe için üretilen Benzersiz Şifre (Reference Code) internet bağlantısı ile teyit edilir ve SQLite tabanına şifreli token olarak yazılır.</p>
      </div>
    </div>
  ),

  "server-setup": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Sunucu Kurulumu</h1>
      <p className="text-lg text-muted mb-8">Sistemin Inno Setup ile kurulan yerel ayağı.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 mt-8">
        <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-blue-500/50 transition-all bg-[#0a0b10]">
          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10"><span className="text-white font-bold text-sm tracking-wide">1. Kurulum Sihirbazı</span></div>
          <img src="/images/setup_1.png" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-blue-500/50 transition-all bg-[#0a0b10]">
          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10"><span className="text-white font-bold text-sm tracking-wide">2. Sürüm Notları</span></div>
          <img src="/images/setup_2_changelog.png" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-blue-500/50 transition-all bg-[#0a0b10]">
          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10"><span className="text-white font-bold text-sm tracking-wide">3. Bileşen Seçimi</span></div>
          <img src="/images/setup_3_bilesen.png" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-blue-500/50 transition-all bg-[#0a0b10]">
          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10"><span className="text-white font-bold text-sm tracking-wide">4. Ağ ve IP Ayarları</span></div>
          <img src="/images/setup_4_ip.png" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-blue-500/50 transition-all bg-[#0a0b10]">
          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10"><span className="text-white font-bold text-sm tracking-wide">5. Dizin Konumu</span></div>
          <img src="/images/setup_5_folder.png" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-blue-500/50 transition-all bg-[#0a0b10]">
          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10"><span className="text-white font-bold text-sm tracking-wide">6. Kısayollar</span></div>
          <img src="/images/setup_6_kısayol.png" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
        </div>
      </div>
    </div>
  ),

  "client-setup": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">İstemci ve Arayüz (Client)</h1>
      <p className="text-lg text-muted mb-8">Oturum açan oyuncuların gördüğü WPF tabanlı mükemmel arayüz.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-blue-500/50 transition-all bg-[#0a0b10]">
          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10"><span className="text-white font-bold text-sm tracking-wide">Ana İstemci Arayüzü</span></div>
          <img src="/images/client 1.png" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-blue-500/50 transition-all bg-[#0a0b10]">
          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10"><span className="text-white font-bold text-sm tracking-wide">Kullanıcı İstatistikleri</span></div>
          <img src="/images/client_istatistik.png" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-blue-500/50 transition-all bg-[#0a0b10]">
          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10"><span className="text-white font-bold text-sm tracking-wide">Bulut Kayıt Yönetimi</span></div>
          <img src="/images/client_oyunkayit.png" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-blue-500/50 transition-all bg-[#0a0b10]">
          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10"><span className="text-white font-bold text-sm tracking-wide">Discord & Sesli Sohbet</span></div>
          <img src="/images/client_seslisohbet.png" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-blue-500/50 transition-all bg-[#0a0b10]">
          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10"><span className="text-white font-bold text-sm tracking-wide">Steam Havuzu (Pool)</span></div>
          <img src="/images/client_steam.png" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
        </div>
        <div className="relative group rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-blue-500/50 transition-all bg-[#0a0b10]">
          <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10"><span className="text-white font-bold text-sm tracking-wide">Yeni Oyun Keşfi</span></div>
          <img src="/images/client_yenioyun.png" className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500" />
        </div>
      </div>
    </div>
  ),

  "local-admin": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Yerel Admin Paneli</h1>
      <p className="text-lg text-muted mb-8">Sol taraftaki "Admin Paneli Modülleri" başlığı altında her bir sekmeyi inceleyebilirsiniz.</p>
    </div>
  ),

  "cloud-admin": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Bulut SuperAdmin</h1>
      <p className="text-lg text-muted mb-8">Tüm bayilerin genel yönetim merkezi (Vercel).</p>
    </div>
  ),

  /* ==========================================
     ADMIN PANEL MODULES (HIGHLY DETAILED)
     ========================================== */

  "mod-dashboard": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <LayoutDashboard className="text-blue-500" size={36}/> Dashboard (Ana Ekran)
      </h1>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        Dashboard, tüm sistemin kalbinin attığı yerdir. Kafedeki toplam işleyişi, açık olan masaları, oyuncu sayılarını ve sistemdeki donanımsal alarmları tek bir bakışta görebileceğiniz merkezi operasyon üssüdür. Python API üzerinden `/api/stats` endpoint'ine saniyede bir milisaniyelik pingler atarak (Polling) ekranı canlı tutar.
      </p>

      <img src="/images/mod_dashboard.png" alt="Dashboard" className="w-full max-w-5xl rounded-xl shadow-2xl border border-white/10 mb-8" />
      
      <h3 className="text-2xl font-bold text-white mb-3">Teknik Özellikler ve Mimari</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Üst kısımda yer alan widget'lar doğrudan SQLite veritabanındaki <code>clients</code> tablosundan anlık olarak hesaplanır. <code>status="online"</code> olan bilgisayarlar toplanıp aktif bilgisayarlar grafiğini oluştururken, içerisinde açık bir oyun prosesi tespit edilen masalar "Oyunda" grafiğine dahil olur. Sağ taraftaki "Sistem Uyarıları" paneli ise WebSocket üzerinden gelen CPU ısınma veya Ping düşmesi gibi telemetri hatalarını anında ekrana basar.
      </p>

      <div className="glass-panel p-6 border-l-4 border-l-blue-500">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Zap size={18} className="text-blue-400" /> Hızlı Müdahale Avantajı</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          Sisteme bir masa katıldığında veya fişi çekildiğinde UDP (5001) Network Discovery protokolü anında Admin Paneli arayüzüne (React State) durumu pushlar. Böylece kasada oturan yönetici, masanın kapandığını görmek için sayfayı yenilemek (F5) zorunda kalmaz.
        </p>
      </div>
    </div>
  ),

  "mod-clients": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Monitor className="text-orange-500" size={36}/> Bilgisayarlar (Clients)
      </h1>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        Kafe içerisindeki tüm bilgisayarların (İstemciler) IP, MAC Adresi, Anakart kimliği ve donanım limitleri gibi devasa bir envanterinin tutulduğu merkez üssüdür. Yeni bir bilgisayar Game Center uygulamasını açtığı an, UDP Broadcast ile sunucuyu bulur ve bu listeye adeta bir ajan gibi sızarak kendini kaydeder.
      </p>

      <img src="/images/bilgisayarlar.png" alt="Clients" className="w-full max-w-5xl rounded-xl shadow-2xl border border-white/10 mb-8" />
      
      <h3 className="text-2xl font-bold text-white mb-3">Donanım Hükmü ve Uzaktan Kontrol</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Buradaki bilgisayar satırlarına sağ tıkladığınızda veya üzerine geldiğinizde devasa bir komut dizini çıkar. Masaya doğrudan <strong>Shutdown (Kapatma)</strong>, <strong>Restart (Yeniden Başlatma)</strong> veya Windows Görev Yöneticisine (Taskmgr) gerek kalmadan oynadığı oyunu anında sonlandırma (Kill Process) komutları yollayabilirsiniz. Bu komutlar TCP üzerinden Base64 ile şifrelenmiş olarak iletilir.
      </p>

      <div className="overflow-x-auto mb-8">
         <table className="w-full text-left border-collapse text-sm">
           <thead>
             <tr className="bg-white/5 border-b border-white/10 text-gray-400 uppercase">
               <th className="p-3 font-bold">Aksiyon</th>
               <th className="p-3 font-bold">Protokol</th>
               <th className="p-3 font-bold">Gerçekleşme Süresi</th>
               <th className="p-3 font-bold">Açıklama</th>
             </tr>
           </thead>
           <tbody className="text-gray-300">
             <tr className="border-b border-white/5 hover:bg-white/5">
               <td className="p-3 font-bold text-red-400">Kill Process</td>
               <td className="p-3">TCP 5000</td>
               <td className="p-3 text-green-400">~2ms</td>
               <td className="p-3">Masadaki oyunun exe dosyasını PID (Process ID) üzerinden saniyesinde sonlandırır.</td>
             </tr>
             <tr className="border-b border-white/5 hover:bg-white/5">
               <td className="p-3 font-bold text-yellow-400">Wake-on-LAN</td>
               <td className="p-3">UDP 9</td>
               <td className="p-3 text-green-400">Anında</td>
               <td className="p-3">Kapalı bilgisayara "Magic Packet" yollayarak kasayı tuşuna basmadan çalıştırır.</td>
             </tr>
             <tr className="border-b border-white/5 hover:bg-white/5">
               <td className="p-3 font-bold text-blue-400">Lock Screen</td>
               <td className="p-3">TCP 5000</td>
               <td className="p-3 text-green-400">~3ms</td>
               <td className="p-3">C# İstemcisini en öne (TopMost) alıp siyah bir ekranla masayı kilitler.</td>
             </tr>
           </tbody>
         </table>
      </div>

      <div className="glass-panel p-6 border-l-4 border-l-orange-500">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Target size={18} className="text-orange-400" /> Mac Adresi Dayatması</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          Bir oyuncu IP adresini değiştirmeye çalışsa bile, Game Center onu Anakartının benzersiz MAC adresi ile etiketler. Bu sayede dolandırıcılığın önüne geçilir ve makinenin geçmiş oyun kayıtları asla kaybolmaz.
        </p>
      </div>
    </div>
  ),

  "mod-live": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Activity className="text-green-500" size={36}/> Canlı Monitör (Live)
      </h1>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        Bu ekran, internet kafenin donanımsal olarak adeta EKG çekildiği yerdir. `LibreHardwareMonitorLib` kütüphanesi ile her saniye masaların Anakartlarına (WMI) bağlanılıp donanım sensörleri okunur. Bu veriler (Isı, RAM Tüketimi, CPU Yükü) Python WebSocket sunucusuna pompalanır.
      </p>

      <img src="/images/canlimonitör.png" alt="Canli Monitor" className="w-full max-w-5xl rounded-xl shadow-2xl border border-white/10 mb-8" />
      
      <h3 className="text-2xl font-bold text-white mb-3">Matrix Benzeri Veri Akışı</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Gözünüzün önünde akan yeşil ve kırmızı pikseller aslında her saniye yenilenen paketlerdir. Bir ekran kartı 85°C derecenin (Kritik Eşik) üstüne çıktığında veya RAM %95 doluluk oranına ulaştığında, sistem otomatik olarak o satırı flaşör gibi patlatıp kırmızı uyarıya geçirir. Böylece donanım yanmadan veya oyun takılmadan yöneticinin haberi olur.
      </p>

      <div className="bg-[#050608] border border-white/5 p-6 rounded-lg">
        <h4 className="font-bold text-white mb-2">Performansa Etkisi (Zıfır Gecikme)</h4>
        <p className="text-sm text-gray-400">
          Binlerce paketin saniyede işlenmesi React tarafında inanılmaz bir yorgunluk yaratabilirdi. Ancak Canlı Monitör sayfası, standart React State yapısı yerine <strong>Mutable Refs (useRef)</strong> ve <strong>Canvas/WebGL</strong> (veya optimize edilmiş memoization) mantığıyla render alır. Böylece tarayıcıda bellek sızıntısı (Memory Leak) yapmadan aylarca açık kalabilir.
        </p>
      </div>
    </div>
  ),

  "mod-osd": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <LineChart className="text-purple-500" size={36}/> Monitör OSD (Grafiksel Analiz)
      </h1>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        Canlı Monitör saniyelik değerleri gösterirken, OSD (On-Screen-Display) Grafikleri geçmişe dönük analiz yapar. Bir müşteri "Abi bilgisayar donuyor!" dediğinde, yöneticinin sadece bu ekrana girip geçmiş yarım saatlik CPU/RAM grafiğine bakması teşhis için yeterlidir.
      </p>

      <img src="/images/monitorgrafik.png" alt="Monitor OSD" className="w-full max-w-5xl rounded-xl shadow-2xl border border-white/10 mb-8" />
      
      <h3 className="text-2xl font-bold text-white mb-3">Recharts Entegrasyonu</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Sistem, verileri SQLite içindeki <code>telemetry_history</code> tablosundan süzerek alır. Recharts grafik kütüphanesi sayesinde mouse imlecini dalgalanmaların üzerinde gezdirdiğinizde, tam o dakikada (Örn: 14:32:45) işlemcinin yüzde kaç (%98 Load) kullanıldığını açıkça görürsünüz.
      </p>

      <div className="glass-panel p-6 border-l-4 border-l-purple-500">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><History size={18} className="text-purple-400" /> Log Temizleme Sistemi</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          Bu sayfada tutulan veriler inanılmaz boyutlara ulaşabileceğinden, Python sunucusu her gece yarısı (Midnight Cron) 3 günden eski grafik datalarını SQLite DB'den otomatik olarak temizler (`DELETE FROM telemetry_history WHERE date &lt; ...`). Bu sayede veritabanınız asla şişmez (Vacuum).
        </p>
      </div>
    </div>
  ),

  "mod-network": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Wifi className="text-cyan-500" size={36}/> Ağ İzleme (Network)
      </h1>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        Tüm kafenin internet hattını (Download/Upload) kimin ne kadar sömürdüğünü gösteren saniyelik bir radar ekranıdır. Oyun indiren veya arkada güncelleme yapan bir müşteriyi eliyle koymuş gibi bulmak için mükemmel bir araçtır.
      </p>

      <img src="/images/agizleme.png" alt="Ağ İzleme" className="w-full max-w-5xl rounded-xl shadow-2xl border border-white/10 mb-8" />
      
      <h3 className="text-2xl font-bold text-white mb-3">WMI İnterface Okuması</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        İstemciler (Clients), üzerlerindeki Ağ Kartının (Ethernet) "Bytes Received/sec" ve "Bytes Sent/sec" metriklerini doğrudan Windows Çekirdeğinden (Kernel) alıp MB/s (Megabayt per second) formatına çevirirler. 
      </p>

      <div className="bg-[#050608] border border-white/5 p-6 rounded-lg">
        <h4 className="font-bold text-white mb-2">Gelişmiş Ağ Engellemesi (Gelecek Vizyon)</h4>
        <p className="text-sm text-gray-400">
          Ağ izleme ekranındaki kırmızı ibre, eğer belirli bir masa sürekli 50 MB/s hızda bir şeyler indiriyorsa yöneticiye uyarır. Admin, uzaktan o masanın ağ sınırlarını (Bandwidth Shaping) Windows Policy komutları ile kısıtlayabilme potansiyeline sahiptir.
        </p>
      </div>
    </div>
  ),

  "mod-games": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Gamepad2 className="text-yellow-500" size={36}/> Oyunlar Kütüphanesi
      </h1>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        Sistemin ana omurgası! Kafede bulunan binlerce oyunun (Steam, Epic, Valorant, GTA) yerel ağa tanıtıldığı, kapak fotoğraflarının işlendiği ve Exe dosya yollarının (Path) atandığı devasa bir CRUD (Create, Read, Update, Delete) ekranıdır.
      </p>

      <img src="/images/oyunlar.png" alt="Oyunlar" className="w-full max-w-5xl rounded-xl shadow-2xl border border-white/10 mb-8" />
      
      <h3 className="text-2xl font-bold text-white mb-3">Parametrik Başlatıcı (Launcher) Mantığı</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Oyun eklerken sadece dosya yolunu (Örn: <code>D:\Games\CS2\csgo.exe</code>) vermekle kalmazsınız. Oyunun başlangıç komut parametrelerini (Örn: <code>-novid -tickrate 128 -high</code>) ve Yönetici olarak çalıştırılıp çalıştırılmayacağını (Run as Admin) da belirtirsiniz. İstemci (Client) menüden bu oyuna tıkladığında, Game Center arka planda bu karmaşık komut dizisini otomatik olarak Terminal'e (CMD) yazar.
      </p>

      <div className="glass-panel p-6 border-l-4 border-l-yellow-500">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Cloud size={18} className="text-yellow-400" /> Bulut Kapak (Cover) Senkronizasyonu</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          Oyun ekleme ekranındaki resimler doğrudan bilgisayarınızda saklanmaz. Vercel Blob / AWS S3 sisteminde host edilen kapaklar, oyunu seçtiğiniz an otomatik olarak çekilir (Smart Sync) ve yerel ağınızdaki `images/covers` dizinine önbelleklenir (Cache). Böylece 100 bilgisayar aynı anda oyuna girse bile internet kotanız veya sunucu bandgenişliğiniz sömürülmez.
        </p>
      </div>
    </div>
  ),

  "mod-favorites": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Star className="text-yellow-400" fill="currentColor" size={36}/> Favori Oyunlar
      </h1>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        Müşteri (Oyuncu) bilgisayara oturduğunda Game Center arayüzünü açtığı an karşısına çıkan "Popüler / Önerilenler" vitrinini yönettiğiniz ekrandır.
      </p>

      <img src="/images/mod_favorites.png" alt="Favori Oyunlar" className="w-full max-w-5xl rounded-xl shadow-2xl border border-white/10 mb-8" />
      
      <h3 className="text-2xl font-bold text-white mb-3">Dinamik Sıralama Mekanizması (Drag & Drop)</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Bu sayfada yer alan Dnd-kit (React Drag and Drop) altyapısı sayesinde oyunları fareyle tutarak sırasını değiştirebilirsiniz. Değişiklik yaptığınız anda <code>UPDATE games SET order_index = ? WHERE id = ?</code> komutu ateşlenerek SQLite veritabanı anında güncellenir.
      </p>

      <div className="bg-[#050608] border border-white/5 p-6 rounded-lg">
        <p className="text-sm text-gray-400">
          Kafedeki oyuncuların en çok hangi oyunları oynadığını (Dashboard'dan) izleyerek, o oyunları Favoriler sekmesinde ilk sıraya alıp kullanıcı deneyimini (UX) saniyeler içinde mükemmelleştirebilirsiniz.
        </p>
      </div>
    </div>
  ),

  "mod-users": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Users className="text-teal-500" size={36}/> Kullanıcılar (Yetkilendirme)
      </h1>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        Büyük ölçekli internet kafelerde (veya E-spor arenalarında) sadece bir patron (Admin) yoktur. Kasada duran elemanların (Personel), sadece belli modüllere girmesini sağlamak için tasarlanmış Çoklu-Kullanıcı (Multi-User) güvenlik sistemidir.
      </p>

      <img src="/images/mod_users.png" alt="Kullanıcılar" className="w-full max-w-5xl rounded-xl shadow-2xl border border-white/10 mb-8" />
      
      <h3 className="text-2xl font-bold text-white mb-3">Kriptolojik Şifreleme ve Roller</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Buradan yeni bir personel açtığınızda, şifresi düz metin (Plain Text) olarak değil; Python backend tarafında <strong>Bcrypt</strong> algoritması ile hashlenerek (Tuzlanarak - Salting) SQLite veritabanına gömülür. Bir hacker veritabanını ele geçirse dahi şifreleri geri çözemez (Decrypt).
      </p>

      <div className="glass-panel p-6 border-l-4 border-l-teal-500">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Shield size={18} className="text-teal-400" /> İzin Yönetimi (Role-Based Access)</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          "Gece vardiyası sorumlusu sadece bilgisayarları kapatabilsin ama Oyunların ayarlarını (Games) ve Ağ İzleme paneline erişemesin." Bu gibi kısıtlamalar için React uygulamasının <code>PlusGuard</code> isimli Router aracı her sayfa değişiminde JSON Web Token (JWT) içerisindeki yetki array'ini kontrol eder. Yetkisi olmayan personel menüleri göremez bile.
        </p>
      </div>
    </div>
  ),

  "mod-saves": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Save className="text-green-500" size={36}/> Oyun Kayıt (Save Bulutu)
      </h1>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        Game Center'ın en devrimsel özelliklerinden birinin kumanda merkezi! Oyuncular "Cyberpunk 2077" oynayıp kalktıktan sonra ertesi gün farklı bir masaya oturduklarında Save dosyaları otomatik olarak gelir. Yöneticiler bu paneli kullanarak sunucuya biriken save dosyalarını denetler.
      </p>

      <img src="/images/mod_saves.png" alt="Oyun Kayıt" className="w-full max-w-5xl rounded-xl shadow-2xl border border-white/10 mb-8" />
      
      <h3 className="text-2xl font-bold text-white mb-3">Teknik Altyapı ve Sıkıştırma</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Bir müşteri oyunu kapattığında İstemci (Client), belirlenmiş olan Save klasörünü saniyeler içinde ZLib formatında sıkıştırır (ZIP) ve TCP Port 5000 üzerinden bir HTTP POST isteği ile Python sunucusuna yükler. Sunucu bu ZIP dosyasını açar ve benzersiz <code>Mac_Address_SteamID</code> kombinasyonuyla yerel diske arşivler.
      </p>

      <div className="bg-[#050608] border border-white/5 p-6 rounded-lg flex items-center gap-4">
        <Download size={32} className="text-green-400 shrink-0" />
        <div>
          <h4 className="font-bold text-white mb-1">Müdahale ve İndirme</h4>
          <p className="text-sm text-gray-400">
            Admin paneli üzerinden herhangi bir müşterinin Save dosyasını bilgisayarınıza indirebilir (Debug için) veya 6 aydır kafeye gelmeyen müşterilerin Save dosyalarını veritabanından topluca temizleyebilirsiniz (Disk boşaltma işlemi).
          </p>
        </div>
      </div>
    </div>
  ),

  "mod-definitions": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <FolderOpen className="text-gray-400" size={36}/> Tanımlamalar
      </h1>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        Sistemin kategorik altyapısının ayarlandığı temel modül. Oyun türlerini (FPS, RPG, Spor) ve genel tanımları burada oluşturup Oyunlar sekmesinde kullanmak üzere hazır edersiniz.
      </p>

      <img src="/images/mod_definitions.png" alt="Tanımlamalar" className="w-full max-w-5xl rounded-xl shadow-2xl border border-white/10 mb-8" />
      
      <h3 className="text-2xl font-bold text-white mb-3">İlişkisel Veritabanı Modeli</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Burada açtığınız bir kategori (Örn: "Hayatta Kalma"), SQLite veritabanındaki <code>categories</code> tablosuna yazılır. Oyunlar sayfasında bu kategoriyi 100 farklı oyuna atadığınızda (Foreign Key İlişkisi), daha sonra bu kategorinin adını "Survival" olarak değiştirdiğiniz anda 100 oyunun kategorisi de saniyeler içinde arayüzde değişmiş olur.
      </p>
    </div>
  ),

  "mod-plugins": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Puzzle className="text-yellow-400" size={36}/> Eklentiler (Plugins)
      </h1>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        Game Center'ı kapalı kutu bir sistem olmaktan çıkarıp, harici geliştiricilerin kendi kodlarını entegre etmesini sağlayan (Modülerlik) bölüm. Dışarıdan yazdığınız Python Scriptlerini veya Node.js botlarını Game Center'a bağlayabilirsiniz.
      </p>

      <img src="/images/mod_plugins.png" alt="Plugins" className="w-full max-w-5xl rounded-xl shadow-2xl border border-white/10 mb-8" />
      
      <h3 className="text-2xl font-bold text-white mb-3">Örnek Senaryo: Discord Rich Presence</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Bir kafenin Discord sunucusu olduğunu düşünelim. Geliştirici buraya bir Discord Bot plugini eklediğinde, Game Center'ın `Canlı Monitör` verilerini alıp Discord'da "Masa 5 şu an GTA V Oynuyor" şeklinde anlık yansıtabilir (RPC). Admin Paneli üzerinden bu eklentileri (Çalıştır/Durdur/Logları İzle) olarak yönetebilirsiniz.
      </p>
    </div>
  ),

  "mod-mklinks": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <LinkIcon className="text-indigo-400" size={36}/> MkLink Şablonları
      </h1>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        C: diskini patlamaktan kurtaran efsanevi Windows NT altyapısı! Bazı inatçı oyunlar dosyalarını zorla <code>%APPDATA%</code> veya <code>Belgelerim</code> klasörüne yazar. Eğer kafenin C: diski (SSD) dolarsa, tüm sistem çöker. Bu modül tam olarak bu belayı kökünden çözmek için var.
      </p>

      <img src="/images/mklink.png" alt="MkLinks" className="w-full max-w-5xl rounded-xl shadow-2xl border border-white/10 mb-8" />
      
      <h3 className="text-2xl font-bold text-white mb-3">Sembolik Bağ (Junction Point) İşleyişi</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Yönetici, bu ekrandan oyunun asıl kaydetmeye çalıştığı hedef klasörü (Örn: `C:\Users\Player\Documents\Rockstar Games`) ve bunu kandırıp yönlendireceği boş Game klasörünü (Örn: `D:\Games\GTA5\Rockstar_Belgeler`) belirler.
        Müşteri GTA V'e tıkladığı an, C# istemcisi arka planda 1 milisaniyede <code>cmd.exe /c mklink /J "Hedef" "Kaynak"</code> komutunu ateşler. Oyun, C: diskine veri yazdığını sanırken aslında D: diskine yazmaktadır! 
      </p>

      <div className="glass-panel p-6 border-l-4 border-l-indigo-500">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Cloud size={18} className="text-indigo-400" /> Bulut Şablon Entegrasyonu</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          Binlerce oyunun MkLink yollarını tek tek elle girmek yerine, Game Center'ın "Vercel Bulut MkLink Arşivi"ne bağlanarak Türkiye genelindeki diğer Game Center Plus bayilerinin oluşturduğu şablonları anında sisteminize çekebilirsiniz!
        </p>
      </div>
    </div>
  ),

  "mod-updates": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <RefreshCw className="text-rose-400" size={36}/> Güncellemeler (Silent Update)
      </h1>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        Devasa ağlarda 150 bilgisayarı tek tek güncelleyemezsiniz. Bu modül, sunucu makineye (Server) yeni bir Client (İstemci) sürümü çıktığında (Örn: v2.1'den v2.2'ye) kafedeki tüm makinelere bir tuşla yayılmasını sağlar.
      </p>

      <img src="/images/mod_updates.png" alt="Güncellemeler" className="w-full max-w-5xl rounded-xl shadow-2xl border border-white/10 mb-8" />
      
      <h3 className="text-2xl font-bold text-white mb-3">Push & Replace Mekanizması</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Siz "Dağıtımı Başlat" butonuna bastığınızda, Sunucu (Python), aktif olan tüm masalara "Güncelleme Var!" WebSocket mesajı atar. Masadaki İstemciler anında gizli bir PowerShell (veya CMD) scripti başlatır, kendilerini kapatır, yeni exe dosyasını sunucunun Paylaşılan (Shared) klasöründen kendi C: sürücüsüne çeker ve tekrar açılırlar. Bütün bu işlem (Silent Update) 2 saniye sürer! Müşteriler ruhu bile duymaz.
      </p>
    </div>
  ),

  "mod-filter": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Shield className="text-red-500" size={36}/> Filtreli Oyunlar (Kısıtlamalar)
      </h1>
      
      <p className="text-gray-300 mb-6 leading-relaxed">
        İnternet kafenizde çocukların oturduğu bölümler için veya denetimler/baskınlar sırasında anında "Şiddet içerikli" veya "Kumar" bazlı oyunların ekrandan tamamen silinmesini sağlayan panik butonudur.
      </p>

      <img src="/images/mod_filters.png" alt="Filtreli Oyunlar" className="w-full max-w-5xl rounded-xl shadow-2xl border border-white/10 mb-8" />
      
      <h3 className="text-2xl font-bold text-white mb-3">Live Rerender Altyapısı</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Bu ekrandan "GTA V" ve "Mortal Kombat" oyunlarını seçip "Aktifleştir" dediğinizde, Python sunucusu tüm Client'lara (İstemcilere) acil bir "Filter State Changed" JSON mesajı yollar. C# arayüzü bu mesajı aldığı an (Eğer oyun listesinde gösteriyorsa) o oyunları filtreye sokup arayüzü anında baştan çizer (Re-render).
        Kaldırdığınızda ise oyunlar 1 saniye içinde ekranlarına sihirli gibi geri döner.
      </p>

      <div className="glass-panel p-6 border-l-4 border-l-red-500">
        <p className="text-sm text-gray-400">Özel bölümlerde (Örn: Sadece Yetişkinler/VIP) bu filtreyi bazı spesifik masa grupları (Client Groups) için devre dışı bırakabilme özellikleri de veritabanında kodlanmıştır.</p>
      </div>
    </div>
  ),


  /* ==========================================
     ADVANCED SYSTEMS AND TECHNICAL DOCS
     ========================================== */

  "mklink": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">MkLink Otomasyonu</h1>
      <p className="text-lg text-muted mb-8">C: sürücüsü doluluğuna son veren NTFS Junction mantığı.</p>
    </div>
  ),

  "save-cloud": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Save (Oyun Kaydı) Bulutu</h1>
      <p className="text-lg text-muted mb-8">Hikaye tabanlı oyunlar için "Oturduğum masadan kaldığım yerden devam et" sistemi.</p>
    </div>
  ),

  "network": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Ağ Protokolleri (Network)</h1>
      <p className="text-lg text-muted mb-8">Game Center'ın hızı, veriyi doğru protokolle taşımasından gelir.</p>
    </div>
  ),

  "database": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Veritabanı Şeması</h1>
      <p className="text-lg text-muted mb-8">Hem yerel ağda ışık hızında çalışan hem de bulutta güvende kalan melez (Hibrit) bir veritabanı yapısı.</p>
    </div>
  ),

  "telemetry": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4">Donanım İzleme (OSD ve Telemetry)</h1>
      <p className="text-lg text-muted mb-8">Adminlerin bilgisayarlardaki donanım problemlerini hissetmeden teşhis edebilmesi için tasarlandı.</p>
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
