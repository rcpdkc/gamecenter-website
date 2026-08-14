import React, { useState, useMemo } from 'react';
import {
  BookOpen, Server, Monitor, Shield, Settings, Activity, Search, ChevronRight,
  ChevronLeft, ChevronDown, Menu, Terminal, AlertTriangle, CheckCircle2,
  LayoutDashboard, Rss, Cloud, Cpu, Database, Save, Key, Wifi, Users,
  Image as ImageIcon, FolderSync, Megaphone, Gamepad2, Laptop, Network,
  LineChart, Star, FolderOpen, Puzzle, Link as LinkIcon, RefreshCw, Power,
  Ban, Plus, Edit, Download, History, Zap, CheckCircle, Crosshair, Target,
  Layers, HardDrive, ShieldCheck, ShieldAlert, Globe, Gauge, ScrollText,
  BarChart3, ListChecks, Video, Bell, FilterX, Type, Sliders, Lock
} from 'lucide-react';

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
      { id: "mod-alerts", title: "Uyarı Geçmişi", icon: <Bell size={16} /> },
      { id: "mod-bandwidth", title: "İstemci Bant Genişliği", icon: <Gauge size={16} /> },
      { id: "mod-filter", title: "Filtreli Oyunlar", icon: <Shield size={16} /> },
    ]
  },
  {
    section: "FilterCenter",
    items: [
      { id: "fc-overview", title: "FilterCenter Nedir?", icon: <ShieldCheck size={16} /> },
      { id: "fc-dns", title: "DNS Filtresi ve Kurulum", icon: <Globe size={16} /> },
      { id: "fc-categories", title: "Kategori Engelleme", icon: <Ban size={16} /> },
      { id: "fc-lists", title: "Beyaz / Kara Liste", icon: <ListChecks size={16} /> },
      { id: "fc-keywords", title: "Kelime Filtresi", icon: <Type size={16} /> },
      { id: "fc-bandwidth", title: "Bant Genişliği Yönetimi", icon: <Sliders size={16} /> },
      { id: "fc-logs", title: "Erişim Logları (5651)", icon: <ScrollText size={16} /> },
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

/* ── Yardımcı görsel bileşenleri ─────────────────────────────────────────── */
// Hazır ekran görüntüsü
const Shot = ({ src, label, className = "" }) => (
  <div className={`relative group rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-blue-500/50 transition-all bg-[#0a0b10] mb-8 ${className}`}>
    <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 to-transparent p-3 z-10">
      <span className="text-white font-bold text-sm tracking-wide">{label}</span>
    </div>
    <img src={src} alt={label} className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500" />
  </div>
);

// Henüz görseli olmayan yerler için açıklamalı boş slot
const ShotSlot = ({ label, file }) => (
  <div className="rounded-xl border-2 border-dashed border-white/15 bg-[#0a0b10] p-10 mb-8 flex flex-col items-center justify-center text-center gap-3">
    <ImageIcon className="text-gray-600" size={38} />
    <p className="text-gray-300 font-bold text-sm">{label}</p>
    <p className="text-gray-600 text-xs leading-relaxed">
      Ekran görüntüsü buraya eklenecek — dosyayı şuraya koyun:{" "}
      <code className="text-orange-400/80 bg-black/40 px-1.5 py-0.5 rounded">public/images/{file}</code>
    </p>
  </div>
);

// Numaralı "nasıl yapılır" adımı
const Step = ({ n, title, children }) => (
  <li className="flex gap-4">
    <span className="w-8 h-8 rounded-full bg-orange-500/15 text-orange-400 font-bold text-sm flex items-center justify-center shrink-0 border border-orange-500/25">{n}</span>
    <div className="pt-0.5">
      {title && <strong className="text-white block mb-1">{title}</strong>}
      <span className="text-gray-400 text-sm leading-relaxed">{children}</span>
    </div>
  </li>
);

/* Bilgi kutusu bileşeni */
const InfoCard = ({ icon: Icon, color, title, children }) => {
  const borders = { blue:'border-l-blue-500', amber:'border-l-amber-500', green:'border-l-emerald-500', purple:'border-l-purple-500', cyan:'border-l-cyan-500', rose:'border-l-rose-500', orange:'border-l-orange-500', teal:'border-l-teal-500', sky:'border-l-sky-500', emerald:'border-l-emerald-500', red:'border-l-red-500', yellow:'border-l-yellow-500', violet:'border-l-violet-500', indigo:'border-l-indigo-500' };
  const iconColors = { blue:'text-blue-400', amber:'text-amber-400', green:'text-emerald-400', purple:'text-purple-400', cyan:'text-cyan-400', rose:'text-rose-400', orange:'text-orange-400', teal:'text-teal-400', sky:'text-sky-400', emerald:'text-emerald-400', red:'text-red-400', yellow:'text-yellow-400', violet:'text-violet-400', indigo:'text-indigo-400' };
  return (
    <div className={`glass-panel p-6 border-l-4 ${borders[color]||'border-l-blue-500'} mb-8`}>
      <h4 className="font-bold text-white mb-2 flex items-center gap-2">
        {Icon && <Icon size={18} className={iconColors[color]||'text-blue-400'} />}{title}
      </h4>
      <div className="text-sm text-gray-400 leading-relaxed">{children}</div>
    </div>
  );
};

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
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <CheckCircle2 className="text-blue-500" size={36} /> Sistem Gereksinimleri
      </h1>
      <p className="text-lg text-muted mb-8">
        Game Center iki tip makineye kurulur: kafenin trafiğini yöneten <strong>Sunucu (Server)</strong> ve oyuncuların oturduğu <strong>İstemci (Client)</strong> bilgisayarları. Aşağıdaki değerler sorunsuz bir kurulum için tavsiye edilen standartlardır.
      </p>

      <h3 className="text-2xl font-bold text-white mb-3">Sunucu (Ana Makine) Gereksinimleri</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-gray-400 uppercase">
              <th className="p-3 font-bold">Bileşen</th>
              <th className="p-3 font-bold">Minimum</th>
              <th className="p-3 font-bold">Tavsiye Edilen</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-blue-400">İşlemci</td><td className="p-3">4 Çekirdek</td><td className="p-3">6+ Çekirdek (i5 / Ryzen 5)</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-blue-400">RAM</td><td className="p-3">8 GB</td><td className="p-3">16 GB</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-blue-400">Disk</td><td className="p-3">SATA SSD</td><td className="p-3">NVMe SSD (Save & kapak önbelleği için)</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-blue-400">İşletim Sistemi</td><td className="p-3">Windows 10 64-bit</td><td className="p-3">Windows 11 / Server 2019+</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-blue-400">Ağ</td><td className="p-3">1 Gbps Ethernet</td><td className="p-3">2.5 Gbps + yönetilebilir switch</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">İstemci (Oyuncu Masaları)</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        İstemci uygulaması (C# WPF) çok hafiftir ve oyunun performansını etkilemez. Masalarda yalnızca <strong>Windows 10/11 (64-bit)</strong>, <strong>.NET 8 Runtime</strong> ve sunucuyla aynı yerel ağa (LAN) bağlantı gerekir. Donanım telemetrisinin (ısı/yük) okunabilmesi için istemcinin <strong>yönetici (Administrator)</strong> olarak çalışması önerilir.
      </p>

      <div className="glass-panel p-6 border-l-4 border-l-blue-500 mb-8">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Network size={18} className="text-blue-400" /> Ağ ve Port Notu</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          Sunucu ve istemciler aynı alt ağda (subnet) olmalıdır. Sunucudaki Windows Güvenlik Duvarı'nda <code>5174</code> (API/Panel), <code>5000</code> (Komut/TCP) ve <code>5001</code> (UDP Keşif) portlarına izin verilmelidir. Kurulum sihirbazı bu kuralları otomatik ekler.
        </p>
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">Nasıl Kontrol Ederim?</h3>
      <ol className="space-y-5 mb-4">
        <Step n="1" title="Sunucu donanımını doğrula">Windows'ta <code>Görev Yöneticisi → Performans</code> sekmesinden RAM ve disk tipini (SSD/NVMe) kontrol edin.</Step>
        <Step n="2" title="Ağ hızını ölç">Bir istemciden sunucuya büyük bir dosya kopyalayın; hız 100 MB/s altındaysa kablo/switch 1 Gbps değildir.</Step>
        <Step n="3" title="Bağlantıyı test et">İstemciden tarayıcıya <code>http://SUNUCU_IP:5174/api/health</code> yazın; <code>ok</code> yanıtı geliyorsa ağ ve portlar hazırdır.</Step>
      </ol>
    </div>
  ),

  "license": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Key className="text-amber-500" size={36} /> Lisans ve Üyelik Sistemi
      </h1>
      <p className="text-lg text-muted mb-8">
        Game Center'a kayıt <strong>davetiye usulü</strong> çalışır: sadece size özel üretilen bir <strong>Referans Kodu</strong> (<code>GC-XXXXXXXX</code>) ile hesap açabilirsiniz. Kod, e-posta adresinize kilitlidir ve tek kullanımlıktır.
      </p>

      <ShotSlot label="Kayıt / Giriş ekranı" file="wiki_register.png" />

      <h3 className="text-2xl font-bold text-white mb-3">Adım Adım: Hesap Oluşturma</h3>
      <ol className="space-y-5 mb-8">
        <Step n="1" title="Referans kodu al">Yetkiliden (bayi/distribütör) e-posta adresinize tanımlı <code>GC-XXXXXXXX</code> kodunu isteyin. Kod, yalnızca verilen e-posta ile eşleşir.</Step>
        <Step n="2" title="Kayıt formunu doldur"><code>gamecenter.rcpdkc.com/register</code> adresinde ad, soyad, kafe adı, telefon, e-posta, şifre ve referans kodunu girin.</Step>
        <Step n="3" title="Giriş yap">Kayıt onaylandıktan sonra <code>/login</code> üzerinden e-posta ve şifrenizle girin. Şifreniz sunucuda <strong>Bcrypt</strong> ile hash'lenir; düz metin saklanmaz.</Step>
        <Step n="4" title="Sunucuyu bağla (HWID)">Yerel yönetim panelinden aynı hesapla giriş yaptığınızda, sunucunuzun donanım kimliği (HWID) hesabınıza kilitlenir. Böylece lisansınız başka bir makinede kullanılamaz.</Step>
      </ol>

      <div className="glass-panel p-6 border-l-4 border-l-amber-500 mb-8">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Shield size={18} className="text-amber-400" /> HWID Kilidi Nasıl Çalışır?</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          Hesabınıza ilk girişte sunucunun anakart UUID'si kaydedilir. Sonraki girişlerde farklı bir HWID tespit edilirse sistem <em>"Bu hesap başka bir sunucuya kayıtlıdır"</em> hatası verir. Makine değişikliği gerektiğinde yöneticinin HWID'yi sıfırlaması gerekir.
        </p>
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">Lisans Grupları ve Süre</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Her hesap bir <strong>Lisans Grubuna</strong> (Free / Pro / Enterprise gibi) atanır. Gruplar hem <strong>yetkileri</strong> (hangi panellere erişebileceğinizi) hem de bir <strong>bitiş tarihini</strong> (<code>group_expires_at</code>) taşır. Süre dolduğunda hesap <em>"lisans süresi doldu"</em> durumuna geçer ve gelişmiş modüller kilitlenir. Grup ve süre yönetimi Bulut SuperAdmin panelinden yapılır.
      </p>
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
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <LayoutDashboard className="text-blue-500" size={36} /> Yerel Admin Paneli
      </h1>
      <p className="text-lg text-muted mb-8">
        Yerel panel, kafenizin <strong>ana sunucusunda</strong> çalışan React tabanlı yönetim arayüzüdür. İnternet olmadan da tamamen çalışır — çünkü verinin tamamı sunucudaki yerel <strong>SQLite</strong> veritabanında tutulur. Bulut yalnızca lisans, kapak ve telemetri senkronu için kullanılır.
      </p>

      <Shot src="/images/mod_dashboard.png" label="Yerel Admin Paneli — Dashboard" />

      <h3 className="text-2xl font-bold text-white mb-3">Panele Nasıl Girilir?</h3>
      <ol className="space-y-5 mb-8">
        <Step n="1" title="Sunucuyu başlat">Masaüstündeki <strong>Game Center Server</strong> kısayolunu çalıştırın. Uygulama sistem tepsisinde (tray) simge olarak açılır.</Step>
        <Step n="2" title="Paneli aç">Tepsi simgesine sağ tıklayıp <strong>"Yönetim Panelini Aç"</strong> deyin veya herhangi bir tarayıcıdan <code>http://localhost:5174</code> (başka masadan <code>http://SUNUCU_IP:5174</code>) adresine gidin.</Step>
        <Step n="3" title="Giriş yap">Kurulumda belirlediğiniz personel hesabıyla girin. Yetkinize göre sol menüde yalnızca erişebildiğiniz modüller görünür.</Step>
        <Step n="4" title="Buluta bağlan (opsiyonel)">Sağ üstteki <strong>Bulut Girişi</strong> ile <code>gamecenter.rcpdkc.com</code> hesabınıza girin; kafe adınız ve lisansınız otomatik senkronize olur.</Step>
      </ol>

      <div className="glass-panel p-6 border-l-4 border-l-blue-500">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Layers size={18} className="text-blue-400" /> Modüllere Genel Bakış</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          Sol menüdeki <strong>"Admin Paneli Modülleri"</strong> başlığı altında her sekme (Dashboard, Bilgisayarlar, Canlı Monitör, Oyunlar, Kullanıcılar, Save, MkLink, Güncellemeler…) ayrı ayrı belgelenmiştir. Her modülün detaylı "nasıl kullanılır" anlatımı için ilgili başlığa tıklayın.
        </p>
      </div>
    </div>
  ),

  "cloud-admin": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Cloud className="text-sky-500" size={36} /> Bulut SuperAdmin
      </h1>
      <p className="text-lg text-muted mb-8">
        Bulut SuperAdmin (<code>gamecenter.rcpdkc.com/superadmin</code>), <strong>tüm kafelerin</strong> tek bir ekrandan izlendiği merkezi yönetim üssüdür. Vercel + Postgres üzerinde çalışır ve her kafenin sunucusundan <strong>5 dakikada bir</strong> gelen telemetriyi toplar.
      </p>

      <ShotSlot label="Bulut SuperAdmin — Tüm kafeler paneli" file="wiki_superadmin.png" />

      <h3 className="text-2xl font-bold text-white mb-3">SuperAdmin Neler Yapar?</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-gray-400 uppercase">
              <th className="p-3 font-bold">Modül</th>
              <th className="p-3 font-bold">İşlev</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-sky-400">Dashboard</td><td className="p-3">Her kafenin canlı durumu: aktif PC sayısı, CPU/GPU dağılımı, ortalama sıcaklık, en çok oynanan oyunlar.</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-sky-400">Kullanıcılar</td><td className="p-3">Hesap oluşturma, lisans grubu ve bitiş tarihi atama, kafe ↔ telemetri eşleştirme.</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-sky-400">Referans Kodları</td><td className="p-3">Yeni kafeler için <code>GC-XXXXXXXX</code> davetiye kodu üretme.</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-sky-400">Kapaklar</td><td className="p-3">Kafelerin yüklediği oyun kapaklarını onaylama/reddetme (ortak havuz).</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-sky-400">Duyurular</td><td className="p-3">Tüm kafelerin paneline düşen global duyuru yayınlama.</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-sky-400">Loglar</td><td className="p-3">Giriş, şifre sıfırlama ve sistem olaylarının denetim kaydı.</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">Adım Adım: Yeni Kafe Ekleme</h3>
      <ol className="space-y-5 mb-4">
        <Step n="1" title="Referans kodu üret"><strong>Referans Kodları</strong> sekmesinde kafenin e-postasını girip kod oluşturun.</Step>
        <Step n="2" title="Kafe kayıt olsun">Kafe, bu kodla <code>/register</code> üzerinden hesabını açar.</Step>
        <Step n="3" title="Lisans grubu ata"><strong>Kullanıcılar</strong> sekmesinden kafeye grup (Free/Pro/Enterprise) ve bitiş tarihi verin.</Step>
        <Step n="4" title="Bağlantıyı doğrula">Kafe sunucusu ilk telemetriyi gönderdiğinde Dashboard'da otomatik görünür; gelmezse <strong>cafe-link</strong> ile manuel eşleştirin.</Step>
      </ol>
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
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Activity className="text-indigo-400" size={36} /> MkLink Otomasyonu
      </h1>
      <p className="text-lg text-muted mb-8">
        Bazı oyunlar dosyalarını inatla <code>C:\Users\...\Documents</code> veya <code>%APPDATA%</code> altına yazar. Kafenin sistem diski (C:) dolunca her şey çöker. MkLink otomasyonu, NTFS <strong>Junction (sembolik bağ)</strong> mantığıyla bu klasörleri fiziksel olarak D: gibi bir oyun diskine yönlendirir — oyun C:'ye yazdığını sanır, veri aslında D:'ye gider.
      </p>

      <Shot src="/images/mklink.png" label="MkLink Şablon Yönetimi" />

      <h3 className="text-2xl font-bold text-white mb-3">Adım Adım: Şablon Oluşturma</h3>
      <ol className="space-y-5 mb-8">
        <Step n="1" title="Şablon ekle"><strong>MkLink Şablonları</strong> modülünde <em>"Yeni Şablon"</em> ile oyuna bir isim verin (örn. "GTA V — Rockstar").</Step>
        <Step n="2" title="Hedef ve kaynağı gir"><strong>Hedef (Link):</strong> oyunun yazmak istediği gerçek yol (<code>C:\Users\Player\Documents\Rockstar Games</code>). <strong>Kaynak (Gerçek Klasör):</strong> verinin gideceği oyun diski (<code>D:\GC_Data\Rockstar</code>).</Step>
        <Step n="3" title="Toplu sihirbaz (opsiyonel)">Onlarca yolu tek tek girmek yerine <strong>Sihirbaz (Wizard Batch)</strong> ile birden çok junction'ı tek seferde tanımlayın.</Step>
        <Step n="4" title="İstemciye ata">Şablonu bir oyuna bağlayın. Oyuncu o oyuna tıkladığı an C# istemcisi arka planda <code>cmd /c mklink /J "Hedef" "Kaynak"</code> komutunu çalıştırır.</Step>
      </ol>

      <div className="bg-[#050608] border border-white/5 p-6 rounded-lg mb-8">
        <h4 className="font-bold text-white mb-2">Junction ile Symlink Farkı</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          Game Center <code>/J</code> (Directory Junction) kullanır; yönetici hakkı gerektirmez ve klasör bağları için en stabil yöntemdir. Bağ oluşturulmadan önce hedef klasör boşsa taşınır, doluysa yeniden yönlendirilir — mevcut save'ler korunur.
        </p>
      </div>

      <div className="glass-panel p-6 border-l-4 border-l-indigo-500">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Cloud size={18} className="text-indigo-400" /> Bulut Şablon Arşivi</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          Popüler oyunların MkLink yollarını sıfırdan yazmak yerine, <strong>Bulut MkLink Arşivi</strong>'nden diğer bayilerin hazırladığı şablonları tek tıkla içe aktarabilirsiniz. Kendi şablonlarınızı da arşive katkı olarak yükleyebilirsiniz.
        </p>
      </div>
    </div>
  ),

  "save-cloud": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Save className="text-green-500" size={36} /> Save (Oyun Kaydı) Bulutu
      </h1>
      <p className="text-lg text-muted mb-8">
        Hikaye tabanlı oyunlarda oyuncu kalktığı masadan farklı bir masaya oturduğunda kayıtları otomatik gelir. Sistem, oyun kapanınca save klasörünü sıkıştırıp sunucuya yükler; oyuncu başka masada aynı oyunu açınca geri indirir. Böylece kafenizde <strong>"kaldığın yerden devam et"</strong> deneyimi oluşur.
      </p>

      <Shot src="/images/client_oyunkayit.png" label="İstemci — Bulut Kayıt Yönetimi" />

      <h3 className="text-2xl font-bold text-white mb-3">Adım Adım: Save Sistemi Kurulumu</h3>
      <ol className="space-y-5 mb-8">
        <Step n="1" title="Save klasörünü tanımla"><strong>Tanımlamalar → Save Dizinleri</strong> altında oyunun kayıt klasörünü ekleyin (örn. <code>%USERPROFILE%\Saved Games\CD Projekt Red\Cyberpunk 2077</code>).</Step>
        <Step n="2" title="Oyuna bağla">Bu save dizinini ilgili oyunla ilişkilendirin. Artık oyun kapandığında istemci bu klasörü izler.</Step>
        <Step n="3" title="Otomatik yedekleme">Oyuncu oyunu kapatınca istemci klasörü <strong>ZIP</strong> olarak sıkıştırıp sunucuya (HTTP POST) yükler; sunucu <code>MAC_SteamID</code> anahtarıyla arşivler.</Step>
        <Step n="4" title="Geri yükleme">Oyuncu başka masada aynı oyunu açtığında istemci en son save'i indirir ve klasöre açar — hepsi saniyeler içinde.</Step>
      </ol>

      <div className="bg-[#050608] border border-white/5 p-6 rounded-lg flex items-center gap-4">
        <Download size={32} className="text-green-400 shrink-0" />
        <div>
          <h4 className="font-bold text-white mb-1">Yönetici Kontrolü</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            <strong>Oyun Kayıt</strong> modülünden herhangi bir oyuncunun save'ini bilgisayarınıza indirebilir, uzun süredir gelmeyen müşterilerin kayıtlarını toplu silerek disk boşaltabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  ),

  "network": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Wifi className="text-cyan-500" size={36} /> Ağ Protokolleri (Network)
      </h1>
      <p className="text-lg text-muted mb-8">
        Game Center'ın hızı, her işi <strong>doğru protokolle</strong> taşımasından gelir. Kritik komutlar TCP ile garantili gider, keşif için hafif UDP kullanılır, panel ise HTTP/WebSocket üzerinden çalışır.
      </p>

      <h3 className="text-2xl font-bold text-white mb-3">Port ve Protokol Haritası</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-gray-400 uppercase">
              <th className="p-3 font-bold">Port</th>
              <th className="p-3 font-bold">Protokol</th>
              <th className="p-3 font-bold">Görev</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-cyan-400">5174</td><td className="p-3">HTTP (REST) + WebSocket</td><td className="p-3">Yönetim paneli, REST API ve canlı telemetri akışı.</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-cyan-400">5000</td><td className="p-3">TCP</td><td className="p-3">İstemciye komut (Kill Process, Lock, Shutdown) ve Save yükleme.</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-cyan-400">5001</td><td className="p-3">UDP Broadcast</td><td className="p-3">Ağ keşfi — yeni istemci sunucuyu otomatik bulur.</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-cyan-400">9</td><td className="p-3">UDP (Magic Packet)</td><td className="p-3">Wake-on-LAN ile kapalı masaları uzaktan açma.</td></tr>
          </tbody>
        </table>
      </div>

      <Shot src="/images/agizleme.png" label="Ağ İzleme — Canlı Bant Genişliği" />

      <h3 className="text-2xl font-bold text-white mb-3">Veri Akışı</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Bir istemci açıldığında <strong>UDP 5001</strong> ile sunucuyu bulur, kendini <code>clients</code> tablosuna kaydeder. Sonrasında saniyelik donanım/ağ verisini <strong>HTTP 5174</strong>'e gönderir; panel bunu WebSocket ile anında gösterir. Yönetici bir komut verdiğinde ise sunucu <strong>TCP 5000</strong> üzerinden ilgili masaya iletir.
      </p>

      <div className="glass-panel p-6 border-l-4 border-l-cyan-500">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Shield size={18} className="text-cyan-400" /> Güvenlik Duvarı Ayarı</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          Sunucudaki Windows Güvenlik Duvarı'nda yukarıdaki portlara <strong>gelen (inbound)</strong> izin verilmelidir. Kurulum sihirbazı bu kuralları otomatik ekler; sorun yaşarsanız <code>http://SUNUCU_IP:5174/api/health</code> testi ile bağlantıyı doğrulayın.
        </p>
      </div>
    </div>
  ),

  "database": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Database className="text-emerald-500" size={36} /> Veritabanı Şeması
      </h1>
      <p className="text-lg text-muted mb-8">
        Game Center <strong>hibrit</strong> bir veritabanı kullanır: kafedeki hız-kritik veri yerel <strong>SQLite</strong>'ta ışık hızında çalışır, hesap/lisans/paylaşım verisi ise bulutta <strong>Vercel Postgres</strong>'te güvende tutulur. İkisi telemetri üzerinden senkronize olur.
      </p>

      <ShotSlot label="Hibrit veritabanı şema diyagramı" file="wiki_db_schema.png" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel p-6 border-l-4 border-l-emerald-500">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2"><HardDrive size={18} className="text-emerald-400" /> Yerel — SQLite (Kafe Sunucusu)</h4>
          <ul className="text-sm text-gray-400 space-y-2">
            <li><code>games</code> — oyun kütüphanesi, yollar, parametreler</li>
            <li><code>clients</code> — masaların envanteri ve canlı donanımı</li>
            <li><code>settings</code> — sunucu ayarları, <code>cloud_cafe_id</code></li>
            <li><code>mklink_templates</code> — junction şablonları</li>
            <li><code>save_dirs</code> / <code>backups</code> — kayıt yönetimi</li>
            <li><code>game_clicks</code> — en çok oynananlar istatistiği</li>
          </ul>
        </div>
        <div className="glass-panel p-6 border-l-4 border-l-sky-500">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2"><Cloud size={18} className="text-sky-400" /> Bulut — Postgres (Vercel)</h4>
          <ul className="text-sm text-gray-400 space-y-2">
            <li><code>users</code> — hesaplar, cafe_id, hwid, lisans</li>
            <li><code>groups</code> — lisans grupları ve yetkiler</li>
            <li><code>gamecenter_telemetry</code> — kafelerin canlı özeti</li>
            <li><code>reference_codes</code> — davetiye kodları</li>
            <li><code>covers</code> — ortak oyun kapağı havuzu</li>
            <li><code>announcements</code> / <code>system_logs</code></li>
          </ul>
        </div>
      </div>

      <div className="bg-[#050608] border border-white/5 p-6 rounded-lg">
        <h4 className="font-bold text-white mb-2">Senkronizasyon Nasıl Olur?</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          Kafe sunucusu her <strong>5 dakikada bir</strong> yerel SQLite'tan özet çıkarıp (aktif PC, donanım dağılımı, sıcaklık, top oyunlar) buluttaki <code>gamecenter_telemetry</code> tablosuna POST eder. <code>cafe_id</code> ve <code>hwid</code> üzerinden kafe, buluttaki hesabıyla eşleştirilir. Böylece SuperAdmin tüm kafeleri tek yerden görür.
        </p>
      </div>
    </div>
  ),

  "telemetry": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Cpu className="text-rose-500" size={36} /> Donanım İzleme (Telemetry)
      </h1>
      <p className="text-lg text-muted mb-8">
        Her istemci, <code>LibreHardwareMonitorLib</code> ile anakart sensörlerini (WMI) okuyup CPU/GPU sıcaklığı, yük, RAM tüketimi ve ağ hızını sunucuya gönderir. Yönetici, bir masa ısınmadan veya donmadan önce sorunu <strong>görerek</strong> teşhis eder.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Shot src="/images/mod_monitor_live.png" label="Canlı Monitör" className="mb-0" />
        <Shot src="/images/mod_monitor_osd.png" label="Geçmiş Grafik (OSD)" className="mb-0" />
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">Toplanan Metrikler</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-gray-400 uppercase">
              <th className="p-3 font-bold">Metrik</th>
              <th className="p-3 font-bold">Kaynak</th>
              <th className="p-3 font-bold">Varsayılan Kritik Eşik</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-rose-400">CPU Sıcaklığı</td><td className="p-3">LHM / WMI</td><td className="p-3">≥ 90 °C</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-rose-400">GPU Sıcaklığı</td><td className="p-3">LHM / WMI</td><td className="p-3">≥ 85 °C</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-rose-400">RAM Doluluk</td><td className="p-3">psutil</td><td className="p-3">≥ %95</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-rose-400">Ağ (Link)</td><td className="p-3">NIC sayacı</td><td className="p-3">Beklenen hızın altına düşme</td></tr>
          </tbody>
        </table>
      </div>

      <h3 className="text-2xl font-bold text-white mb-3">Adım Adım: Alarm Eşiği Ayarlama</h3>
      <ol className="space-y-5 mb-8">
        <Step n="1" title="Bilgisayarı seç"><strong>Bilgisayarlar</strong> modülünde ilgili masayı açın.</Step>
        <Step n="2" title="Eşikleri düzenle">Masaya özel CPU/GPU sıcaklık ve ağ hızı eşiklerini girin (varsayılanı ezersiniz).</Step>
        <Step n="3" title="Uyarıyı izle">Eşik aşıldığında Dashboard'daki <strong>Sistem Uyarıları</strong> paneli o satırı kırmızıya çevirir ve WebSocket ile anında bildirir.</Step>
      </ol>

      <div className="glass-panel p-6 border-l-4 border-l-rose-500">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Cloud size={18} className="text-rose-400" /> Buluta Özet Aktarımı</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          Yerel telemetri saniyelik çalışır; buluta ise <strong>5 dakikada bir</strong> yalnızca özet gönderilir (ortalama CPU/GPU sıcaklığı, donanım dağılımı, PC başına anlık kayıt). Böylece SuperAdmin kafenin genel sağlığını görür, ağ ve Postgres kotası yorulmaz.
        </p>
      </div>
    </div>
  ),

  /* ── YENİ MODÜLLER ────────────────────────────────────── */
  "mod-alerts": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Bell className="text-rose-500" size={36}/> Uyarı Geçmişi (Alerts History)
      </h1>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Sistemde tetiklenen tüm donanım ve ağ uyarılarının kalıcı kaydını tutan arşiv ekranıdır. Canlı Monitör'deki anlık uyarılar burada tarih-saat damgasıyla saklanır; hafta başında ekranda olmayan bir ısınma olayını bile sonradan tespit edebilirsiniz.
      </p>
      <ShotSlot label="Uyarı Geçmişi ekranı" file="wiki_alerts.png" />
      <h3 className="text-2xl font-bold text-white mb-3">Ne Tür Uyarılar Kaydedilir?</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse text-sm">
          <thead><tr className="bg-white/5 border-b border-white/10 text-gray-400 uppercase">
            <th className="p-3 font-bold">Uyarı Tipi</th><th className="p-3 font-bold">Tetikleyici Koşul</th><th className="p-3 font-bold">Öncelik</th>
          </tr></thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-red-400">CPU Aşırı Isınma</td><td className="p-3">CPU Sıcaklığı ≥ 90°C</td><td className="p-3"><span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400 font-bold">KRİTİK</span></td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-orange-400">GPU Aşırı Isınma</td><td className="p-3">GPU Sıcaklığı ≥ 85°C</td><td className="p-3"><span className="px-2 py-0.5 rounded text-xs bg-orange-500/20 text-orange-400 font-bold">YÜKSEK</span></td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-yellow-400">RAM Doluluk</td><td className="p-3">RAM kullanımı ≥ %95</td><td className="p-3"><span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400 font-bold">ORTA</span></td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-blue-400">Ağ Bağlantısı Kopma</td><td className="p-3">İstemci 15 sn yanıt vermezse</td><td className="p-3"><span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 font-bold">BİLGİ</span></td></tr>
          </tbody>
        </table>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">Arama ve Filtreleme</h3>
      <ol className="space-y-5 mb-8">
        <Step n="1" title="Arama kutusunu kullan">IP, hostname veya proses adını arama kutusuna girin; liste anlık filtrelenir.</Step>
        <Step n="2" title="Tarihe göre filtrele">Tarih seçicisinden belirli bir günü seçin; o günkü uyarılar gösterilir.</Step>
        <Step n="3" title="Tümünü temizle">Sağ üstteki kırmızı "Tüm Geçmişi Sil" butonuyla tüm kayıtlar veritabanından silinebilir (onay dialogu çıkar).</Step>
      </ol>
      <InfoCard icon={AlertTriangle} color="rose" title="Veri Saklama Süresi">
        Uyarı geçmişi kayıtları <code>alert_history</code> tablosunda tutulur. Python sunucusu her hafta otomatik bakım yaparak 30 günden eski kayıtları siler. Bu davranış <code>Settings → Sistem</code> sekmesinden özelleştirilebilir.
      </InfoCard>
    </div>
  ),

  "mod-bandwidth": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Gauge className="text-sky-500" size={36}/> İstemci Bant Genişliği
      </h1>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Kafedeki her masanın İndirme (Download) ve Yükleme (Upload) hızlarını ayrı ayrı kısıtlayabileceğiniz güçlü bir ağ yönetim aracıdır. "Masa 12 sürekli torrent çekiyor ve tüm hattı yiyor" gibi durumları saniyeler içinde çözersiniz.
      </p>
      <ShotSlot label="İstemci Bant Genişliği ekranı" file="wiki_bandwidth.png" />
      <h3 className="text-2xl font-bold text-white mb-3">Nasıl Çalışır?</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        Sunucu, <code>/api/bandwidth</code> endpoint'i aracılığıyla her istemciye hız limiti bilgisi gönderir. İstemci (C# WPF uygulaması), bu limiti aldığında Windows <code>QoS Packet Scheduler</code> üzerinden kendi ağ trafiğini kısıtlar. Yani limit istemcinin kendi içinde uygulanır — switch ayarına gerek yoktur.
      </p>
      <h3 className="text-2xl font-bold text-white mb-3">Toplu Uygulama (Bulk Apply)</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse text-sm">
          <thead><tr className="bg-white/5 border-b border-white/10 text-gray-400 uppercase">
            <th className="p-3 font-bold">Adım</th><th className="p-3 font-bold">İşlem</th>
          </tr></thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-sky-400">1. Seç</td><td className="p-3">Tablodaki checkbox'ları ile tek tek veya "Tümünü Seç" ile tüm masaları seçin.</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-sky-400">2. Değer Gir</td><td className="p-3">Üst kısımdaki "Toplu Uygula" paneline Download ve Upload hızını Mbps cinsinden girin.</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-sky-400">3. Uygula</td><td className="p-3">"Uygula" butonuna tıklandığında seçili masalara değerler yazılır (API'ye henüz gitmez).</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-sky-400">4. Kaydet</td><td className="p-3">Sağ üstteki "Kaydet" butonu tüm değerleri <code>/api/bandwidth</code> POST isteğiyle istemcilere bildirir.</td></tr>
          </tbody>
        </table>
      </div>
      <InfoCard icon={Gauge} color="sky" title="Sıfır (0) Girince Ne Olur?">
        Download veya Upload alanına <code>0</code> girilmesi, o yön için sınır olmadığı anlamına gelir — istemci tam hız çalışır. Limiti devre dışı bırakmak için satırdaki Toggle (anahtar) kapatılabilir.
      </InfoCard>
    </div>
  ),

  /* ── FILTERCENTER ─────────────────────────────────────── */
  "fc-overview": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <ShieldCheck className="text-emerald-500" size={36}/> FilterCenter Nedir?
      </h1>
      <p className="text-lg text-muted mb-6">
        FilterCenter, Game Center'ın içerisine entegre edilmiş, kurumsal düzeyde bir <strong>ağ güvenlik ve içerik yönetim sistemidir</strong>. Tek bir kurulum gerektirmez — Game Center sunucusu kurulduğunda FilterCenter de otomatik olarak aktif hale gelir.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {[
          { icon: Globe,       color: 'emerald', title: 'DNS Seviyesinde Filtreleme',    desc: 'Sunucu, kafe için bir DNS Proxy çalıştırır. İstemciler DNS isteklerini bu proxy üzerinden yapar; engellenen alan adlarına erişim DNS yanıtı verilmeden kesilir.' },
          { icon: BarChart3,   color: 'blue',    title: 'Gerçek Zamanlı İstatistikler',  desc: 'Kaç DNS isteği yapıldığı, kaçı engellendiği, hangi kategorinin en çok tetiklendiği anlık grafiklerle Dashboard\'da gösterilir.' },
          { icon: Sliders,     color: 'purple',  title: 'Bant Genişliği Kontrolü',       desc: 'Her masanın indirme/yükleme hız limitini MB/s cinsinden belirleyin. Toplu uygulama özelliğiyle 50 masaya aynı anda limit atayabilirsiniz.' },
          { icon: ScrollText,  color: 'amber',   title: '5651 Erişim Logu',              desc: 'Türkiye\'nin 5651 sayılı İnternet Kanunu kapsamında, tüm DNS erişim kayıtları saklanır. Filtrelenen veya izin verilen her erişim loglanır ve aranabilir.' },
        ].map((f,i) => (
          <div key={i} className={`rounded-xl border border-${f.color}-500/20 bg-${f.color}-500/5 p-5`}>
            <f.icon size={28} className={`text-${f.color}-400 mb-3`} />
            <div className="font-bold text-white mb-1">{f.title}</div>
            <div className="text-xs text-gray-400 leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
      <InfoCard icon={ShieldCheck} color="green" title="Kurulum Gerektirmez">
        FilterCenter, Game Center kurulum sihirbazı ile birlikte gelir. Ek bir yazılım kurmanıza, DNS sunucusu yapılandırmanıza veya router ayarı değiştirmenize gerek yoktur. Admin Panelinden "İçerik Filtresi Etkinleştir" toggle'ını açmanız yeterlidir.
      </InfoCard>
    </div>
  ),

  "fc-dns": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Globe className="text-blue-500" size={36}/> DNS Filtresi ve Kurulum
      </h1>
      <p className="text-lg text-muted mb-8">
        FilterCenter'ın kalbi, Game Center sunucusunda çalışan yerel DNS Proxy'sidir. İstemcilerin tüm alan adı sorguları bu proxy üzerinden geçer — böylece filtre, engeli anında ve sıfır gecikmeyle uygular.
      </p>
      <h3 className="text-2xl font-bold text-white mb-3">DNS Kaynak Seçenekleri</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse text-sm">
          <thead><tr className="bg-white/5 border-b border-white/10 text-gray-400 uppercase">
            <th className="p-3 font-bold">Mod</th><th className="p-3 font-bold">Açıklama</th><th className="p-3 font-bold">Özellikler</th>
          </tr></thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-emerald-400">Kafe Sunucusu (Önerilen)</td><td className="p-3">Game Center içindeki yerleşik DNS Proxy</td><td className="p-3">Kategori filtresi, beyaz/kara liste, istatistik, kelime filtresi — tam kontrol</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-gray-400">CleanBrowsing Family</td><td className="p-3">Harici hazır DNS</td><td className="p-3">Yetişkin ve zararlı içerik engeli, beyaz/kara liste yok</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-gray-400">OpenDNS FamilyShield</td><td className="p-3">Harici hazır DNS</td><td className="p-3">Hazır kategorik koruma, özelleştirme yok</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-gray-400">Cloudflare for Families</td><td className="p-3">Harici hazır DNS</td><td className="p-3">Hızlı ve güvenilir, sınırlı kategorik kontrol</td></tr>
          </tbody>
        </table>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">Kurulum Adımları (Kafe Sunucusu Modu)</h3>
      <ol className="space-y-5 mb-8">
        <Step n="1" title="Filtreyi etkinleştir">Admin Paneli → FilterCenter → Genel sekmesinde "İçerik Filtresi Etkinleştir" toggle'ını açın.</Step>
        <Step n="2" title="DNS Proxy başlar">Game Center sunucusu otomatik olarak <code>53</code> portunda bir DNS Proxy başlatır. Router veya switch ayarı gerekmez.</Step>
        <Step n="3" title="İstemciler bağlanır">İstemciler (C# uygulaması) DNS ayarlarını otomatik olarak sunucuya yönlendirir. Manual DNS değiştirmeye gerek yoktur.</Step>
        <Step n="4" title="Upstream DNS seç">Filtrelenmemiş istekler hangi harici DNS sunucusuna iletileceğini seçin (varsayılan: Cloudflare 1.1.1.1).</Step>
      </ol>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel p-5">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Search size={16} className="text-blue-400" /> SafeSearch Zorlama</h4>
          <p className="text-sm text-gray-400 leading-relaxed">Google, Bing ve DuckDuckGo için güvenli arama DNS seviyesinde zorlanır. Kullanıcı tarayıcı ayarlarından SafeSearch'ü kapatamazlar çünkü kural DNS yanıtında uygulanır.</p>
        </div>
        <div className="glass-panel p-5">
          <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Video size={16} className="text-red-400" /> YouTube Kısıtlama</h4>
          <p className="text-sm text-gray-400 leading-relaxed"><strong>Kapalı, Orta, Katı</strong> olmak üzere üç seviye sunulur. Katı mod, YouTube için Google'ın resmi <code>restrict.youtube.com</code> endpoint'ini zorlar; yalnızca onaylı içerik görünür.</p>
        </div>
      </div>
      <InfoCard icon={Shield} color="blue" title="Filtre Baypas Engelleme">
        Akıllı kullanıcılar VPN, DoH (DNS over HTTPS) veya Proxy servisleri kullanarak filtreyi aşmaya çalışabilir. <strong>Kategori Engelleme → Filtre Baypas</strong> seçeneğini aktifleştirdiğinizde, bu servislerin alan adları otomatik olarak blocklist'e eklenir.
      </InfoCard>
    </div>
  ),

  "fc-categories": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Ban className="text-rose-500" size={36}/> Kategori Engelleme
      </h1>
      <p className="text-lg text-muted mb-8">
        Binlerce alan adını tek tek eklemek yerine, hazır kategori listeleri ile geniş çaplı engelleme yapın. Her kategori, sürekli güncellenen blocklist URL'lerine dayanır.
      </p>
      <h3 className="text-2xl font-bold text-white mb-3">Mevcut Kategoriler</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[
          { icon: ShieldAlert, title: 'Yetişkin İçerik',               desc: 'Pornografi ve müstehcen içerik barındıran tüm siteler.',                          cls: 'text-red-400 bg-red-500/10 border-red-500/20' },
          { icon: Ban,         title: 'Kumar / Bahis',                  desc: 'Online bahis, kumar ve şans oyunu siteleri.',                                      cls: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
          { icon: ShieldCheck, title: 'Zararlı Yazılım / Dolandırıcılık', desc: 'Malware, phishing ve scam siteleri.',                                          cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { icon: Megaphone,   title: 'Reklam / İzleyici',              desc: 'Reklam ağları ve tracking servisleri. Sayfalar daha hızlı açılır.',              cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
          { icon: Users,       title: 'Sosyal Medya',                   desc: 'Facebook, Instagram, Twitter/X, TikTok, YouTube (isteğe bağlı).',               cls: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { icon: Lock,        title: 'Filtre Baypas Engelleme',        desc: 'VPN servisleri, DoH proxy\'leri ve anonymizer araçları.',                       cls: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
        ].map((cat,i) => (
          <div key={i} className={`rounded-xl border p-5 ${cat.cls.split(' ').slice(1).join(' ')}`}>
            <div className="flex items-center gap-3 mb-2">
              <cat.icon size={22} className={cat.cls.split(' ')[0]} />
              <span className="font-bold text-white text-sm">{cat.title}</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">{cat.desc}</p>
          </div>
        ))}
      </div>
      <InfoCard icon={RefreshCw} color="blue" title="Otomatik Güncelleme">
        Blocklist kaynakları Python sunucusunun günlük Cron görevi tarafından otomatik güncellenir. Manuel güncelleme için <strong>FilterCenter → Kaynaklar → "Listeyi Yenile"</strong> butonunu kullanabilirsiniz. Güncelleme sonrası engellenen domain sayısı Dashboard'da anında yansır.
      </InfoCard>
    </div>
  ),

  "fc-lists": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <ListChecks className="text-teal-500" size={36}/> Beyaz / Kara Liste
      </h1>
      <p className="text-lg text-muted mb-8">
        Kategori filtrelerini geçersiz kılmak için manuel domain kuralları ekleyin. Beyaz liste (whitelist) her zaman kara listeden (blacklist) önceliklidir.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="glass-panel p-5 border-l-4 border-l-emerald-500">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-400" /> Beyaz Liste (Whitelist)</h4>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">Kategori filtresiyle engellenmesi muhtemel bir sitenin her zaman açık kalmasını sağlar. Örneğin reklam kategorisi etkinken kafeye ait bir sitenin engellenmemesi için beyaz listeye alınabilir.</p>
          <code className="text-xs text-emerald-400 bg-black/40 px-2 py-1 rounded block">➕ ornek.com → Her zaman erişime açık</code>
        </div>
        <div className="glass-panel p-5 border-l-4 border-l-rose-500">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2"><Ban size={18} className="text-rose-400" /> Kara Liste (Blacklist)</h4>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">Herhangi bir kategoriye dahil olmasa dahi belirli bir siteyi her zaman engeller. Kategori filtresinden bağımsız olarak çalışır.</p>
          <code className="text-xs text-rose-400 bg-black/40 px-2 py-1 rounded block">🚫 oyunindirme.com → Her zaman engelli</code>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">Domain Eklemek</h3>
      <ol className="space-y-5 mb-8">
        <Step n="1" title="Listeye git">FilterCenter → Beyaz / Kara Liste sekmesini açın.</Step>
        <Step n="2" title="Domain gir">Metin kutusuna domain adını yazın (ör: <code>ornek.com</code>). Subdomain'ler otomatik dahil edilir.</Step>
        <Step n="3" title="Enter veya Ekle">Enter tuşuna basın veya "Ekle" butonuna tıklayın. Kural anında DNS Proxy'ye iletilir.</Step>
      </ol>
      <InfoCard icon={Globe} color="teal" title="Subdomain Kapsama">
        <code>ornek.com</code> eklendiğinde, <code>www.ornek.com</code>, <code>api.ornek.com</code>, <code>cdn.ornek.com</code> gibi tüm alt alan adları da otomatik olarak kapsama alınır.
      </InfoCard>
    </div>
  ),

  "fc-keywords": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Type className="text-amber-500" size={36}/> Kelime Filtresi
      </h1>
      <p className="text-lg text-muted mb-8">
        Alan adı içinde belirli anahtar kelimeler geçen tüm siteleri otomatik engeller. Blocklist'lerde yer almayan ama zararlı içerik barındırabilecek siteleri bu yöntemle yakalayabilirsiniz.
      </p>
      <h3 className="text-2xl font-bold text-white mb-3">Nasıl Çalışır?</h3>
      <p className="text-gray-300 mb-6 leading-relaxed">
        DNS Proxy, gelen her sorgunun domain adını kelime filtresi listesiyle karşılaştırır. Eğer domain adı bir anahtar kelime içeriyorsa, blocklist'te olup olmadığına bakılmaksızın istek engellenir ve log kaydedilir.
      </p>
      <div className="bg-[#050608] border border-white/5 p-6 rounded-lg mb-8">
        <h4 className="font-bold text-white mb-3">Örnek Kelime Filtreleri</h4>
        <div className="flex flex-wrap gap-2">
          {['hack', 'crack', 'porn', 'xxx', 'bet', 'casino', 'torrent', 'warez', 'keygen', 'pirate'].map(kw => (
            <span key={kw} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">{kw}</span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">Yukarıdaki kelimelerden biri bir domain adında geçiyorsa (ör: <code>crackyedekparca.com</code>) erişim engellenir.</p>
      </div>
      <ol className="space-y-5 mb-8">
        <Step n="1" title="Kelimeyi gir">Metin kutusuna engellemek istediğiniz anahtar kelimeyi girin.</Step>
        <Step n="2" title="Enter veya virgül ile ekle">Enter'a basın veya kelimeyi virgülle ayırarak birden fazla kelime girin. Her kelime ayrı bir chip olarak görünür.</Step>
        <Step n="3" title="Kaydet">Değişiklikler "Filtre Ayarları" kaydet butonu ile sunucuya iletilir.</Step>
      </ol>
      <InfoCard icon={AlertTriangle} color="amber" title="Dikkat: Geniş Kelimeler">
        Çok kısa veya genel kelimeler (ör: "bet", "game") meşru siteleri de engelleyebilir. Mümkün olduğunca spesifik kelimeler kullanın veya sonuçları Erişim Logları sekmesinden takip edin.
      </InfoCard>
    </div>
  ),

  "fc-bandwidth": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <Sliders className="text-purple-500" size={36}/> Bant Genişliği Yönetimi
      </h1>
      <p className="text-lg text-muted mb-8">
        FilterCenter bünyesindeki bant genişliği modülü, her istemcinin internet hızını Mbps bazında sınırlandırır. Hem bireysel masa başına hem de toplu uygulama ile tüm kafenin trafiği yönetilir.
      </p>
      <ShotSlot label="Bant Genişliği Yönetimi ekranı" file="wiki_fc_bandwidth.png" />
      <h3 className="text-2xl font-bold text-white mb-3">Kullanım Senaryoları</h3>
      <ul className="space-y-4 mb-8 text-sm text-gray-400">
        <li className="flex gap-3"><Zap size={18} className="text-yellow-400 shrink-0 mt-0.5" /><div><strong className="text-white">Torrent engeli:</strong> Belirli masaları 10 Mbps ile sınırlayarak ağ tıkanmasını önleyin.</div></li>
        <li className="flex gap-3"><Zap size={18} className="text-blue-400 shrink-0 mt-0.5" /><div><strong className="text-white">VIP masalar:</strong> Ön sıradaki masalara tam hız, arka masalara kısıtlı hız tanımlayın.</div></li>
        <li className="flex gap-3"><Zap size={18} className="text-emerald-400 shrink-0 mt-0.5" /><div><strong className="text-white">Tüm kafe kısıtlama:</strong> İnternet kotası dolmak üzereyken tüm masalara toplu 20 Mbps limit atayın.</div></li>
      </ul>
      <InfoCard icon={Gauge} color="purple" title="Anlık Etki">
        Limit kaydedildiğinde istemci uygulama komutunu anında alır ve uygular. Oyuncunun aktif bağlantılarını kesmez; sadece yeni paketler limitle şekillendirilir. Oyun oynayan müşteri fark etmeden limit uygulanabilir.
      </InfoCard>
    </div>
  ),

  "fc-logs": (
    <div className="animate-fade-in-up">
      <h1 className="text-4xl font-bold text-white mb-4 border-b border-white/10 pb-4 flex items-center gap-3">
        <ScrollText className="text-amber-500" size={36}/> Erişim Logları (5651)
      </h1>
      <p className="text-lg text-muted mb-8">
        Türkiye'nin <strong>5651 sayılı İnternet Kanunu</strong> kapsamında, internet kafeler erişim kayıtlarını belirli bir süre saklamak zorundadır. FilterCenter'ın Erişim Logları modülü bu yasal yükümlülüğü otomatik olarak karşılar.
      </p>
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 mb-8">
        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-400" /> 5651 Sayılı Kanun Uyumu</h4>
        <p className="text-sm text-gray-400 leading-relaxed">
          Türkiye'de internet kafe işleten tüm işletmeler, erişim loglarını yasal zorunluluk gereği en az <strong>6 ay</strong> saklamalıdır. FilterCenter bu kayıtları otomatik olarak <code>dns_logs</code> tablosunda tutar.
        </p>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">Log Kaydında Neler Tutulur?</h3>
      <div className="overflow-x-auto mb-8">
        <table className="w-full text-left border-collapse text-sm">
          <thead><tr className="bg-white/5 border-b border-white/10 text-gray-400 uppercase">
            <th className="p-3 font-bold">Alan</th><th className="p-3 font-bold">Açıklama</th><th className="p-3 font-bold">Örnek</th>
          </tr></thead>
          <tbody className="text-gray-300">
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-amber-400">Zaman Damgası</td><td className="p-3">Erişim tarihi ve saati (ms hassasiyetinde)</td><td className="p-3 font-mono text-xs">2026-08-07 14:32:45</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-amber-400">İstemci IP</td><td className="p-3">Erişimi yapan bilgisayarın IP adresi</td><td className="p-3 font-mono text-xs">192.168.1.42</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-amber-400">Hostname</td><td className="p-3">Bilgisayar adı (masa adı)</td><td className="p-3 font-mono text-xs">MASA-12</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-amber-400">Alan Adı</td><td className="p-3">Erişilmek istenen web adresi</td><td className="p-3 font-mono text-xs">google.com</td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-amber-400">İşlem</td><td className="p-3">allow (izin) veya block (engel)</td><td className="p-3"><span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">block</span></td></tr>
            <tr className="border-b border-white/5 hover:bg-white/5"><td className="p-3 font-bold text-amber-400">Kategori</td><td className="p-3">Varsa engelleme kategorisi</td><td className="p-3 font-mono text-xs">adult</td></tr>
          </tbody>
        </table>
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">Loglarda Arama ve Filtreleme</h3>
      <ol className="space-y-5 mb-8">
        <Step n="1" title="Domain ara">Arama kutusuna domain adını girin; ilgili tüm erişimler (izin verilen ve engellenenler) listelenir.</Step>
        <Step n="2" title="İstemciye göre filtrele">IP veya hostname ile belirli bir masanın erişim geçmişini görün.</Step>
        <Step n="3" title="İşleme göre filtrele">Yalnızca "engellenenler" veya "izin verilenler" olarak filtreleyin.</Step>
        <Step n="4" title="Tarih aralığı">Belirli bir gün veya saat aralığındaki logları getirin.</Step>
      </ol>
      <InfoCard icon={Database} color="amber" title="Otomatik Temizleme">
        Log veritabanı zamanla büyüyebilir. Python sunucusu, yönetici tarafından belirlenen saklama süresi dolduğunda eski kayıtları otomatik siler. Disk kullanımı FilterCenter Dashboard'daki halka grafiğinden takip edilebilir.
      </InfoCard>
    </div>
  ),
};

/* Düz liste: tüm item'lar sırayla (navigasyon için) */
const ALL_ITEMS = WIKI_STRUCTURE.flatMap(s => s.items);

const Wiki = () => {
  const [activeArticle, setActiveArticle] = useState("intro");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  /* Arama — başlık eşleşmesi */
  const filteredStructure = useMemo(() => {
    if (!searchQuery.trim()) return WIKI_STRUCTURE;
    const q = searchQuery.toLowerCase();
    return WIKI_STRUCTURE
      .map(section => ({ ...section, items: section.items.filter(item => item.title.toLowerCase().includes(q)) }))
      .filter(section => section.items.length > 0);
  }, [searchQuery]);

  /* Önceki / Sonraki */
  const currentIdx = ALL_ITEMS.findIndex(it => it.id === activeArticle);
  const prevItem   = currentIdx > 0 ? ALL_ITEMS[currentIdx - 1] : null;
  const nextItem   = currentIdx < ALL_ITEMS.length - 1 ? ALL_ITEMS[currentIdx + 1] : null;

  const navigate = (id) => {
    setActiveArticle(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        
        {/* Çalışan arama kutusu */}
        <div className="relative mb-8 mt-12 md:mt-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input 
            type="text" 
            placeholder="Dokümantasyonda ara..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors"
          />
        </div>

        <nav>
          {filteredStructure.map((section, idx) => (
            <div key={idx} className="mb-8">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
                {section.section}
              </h4>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => navigate(item.id)}
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
          {filteredStructure.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-sm">
              <Search size={24} className="mx-auto mb-2 opacity-40" />
              Sonuç bulunamadı
            </div>
          )}
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
          
          {/* Önceki / Sonraki Navigasyon */}
          <div className="mt-16 pt-8 border-t border-white/10 flex justify-between items-center gap-4">
            <button
              onClick={() => prevItem && navigate(prevItem.id)}
              disabled={!prevItem}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                prevItem
                  ? 'text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 cursor-pointer'
                  : 'text-gray-600 border border-transparent cursor-default'
              }`}
            >
              <ChevronLeft size={16} />
              {prevItem ? prevItem.title : ''}
            </button>
            <button
              onClick={() => nextItem && navigate(nextItem.id)}
              disabled={!nextItem}
              className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg transition-all ${
                nextItem
                  ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/5 border border-orange-500/20 cursor-pointer'
                  : 'text-gray-600 border border-transparent cursor-default'
              }`}
            >
              {nextItem ? nextItem.title : ''}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </main>

    </div>
  );
};

export default Wiki;
