import { Monitor, Rocket, Gamepad2, ShieldCheck, Zap, Activity, Gauge, Database,
  Coffee, Mic, KeyRound, RefreshCw, Users, Puzzle, HardDrive, Cloud, Server, ScrollText } from 'lucide-react';

const Features = () => {
  const features = [
    {
      title: 'Canlı İzleme ve Monitör (OSD)',
      desc: 'Tüm bilgisayarların anlık sıcaklık ve durumunu tek panelden izleyin; ekran parlaklık/kontrast/renk ayarlarını (DDC/CI) uzaktan yönetin. Isınan makineyi arıza çıkmadan yakalayın.',
      image: '/images/canlimonitör.png',
      icon: <Monitor className="text-orange-500" size={24} />,
      reverse: false
    },
    {
      title: 'İçerik Filtresi ve 5651 Yasal Kayıt',
      desc: 'Kumar, yetişkin ve zararlı içerikleri kategori bazlı tek tıkla engelleyin; beyaz/kara liste ve kelime filtresi uygulayın. 5651 gereği tüm erişimler imzalı (değiştirilemez) olarak otomatik kayıt altına alınır.',
      image: '/images/icerik_filtresi.png',
      icon: <ShieldCheck className="text-blue-500" size={24} />,
      reverse: true
    },
    {
      title: 'Oyun Kütüphanesi ve Kapak Yönetimi',
      desc: 'Kapaklı, kategorili oyun vitrini müşterinin masasında şık biçimde görünür. Toplu yükleme ve bulut kapak arşivi ile saatlerce süren işlemler dakikalara iner.',
      image: '/images/oyunlar.png',
      icon: <Rocket className="text-emerald-500" size={24} />,
      reverse: false
    },
    {
      title: 'Önbellek (Shader) ile Beklemesiz Açılış',
      desc: 'Shader derlemesini bir kez toplayıp aynı donanımdaki tüm makinelere dağıtın. Müşteri oyunu açtığında "shader hazırlanıyor" beklemesi olmadan anında oynamaya başlar.',
      image: '/images/shader.png',
      icon: <Zap className="text-red-500" size={24} />,
      reverse: true
    },
    {
      title: 'Bilgisayar Başına Hız Sınırlama',
      desc: 'Bir makine dev bir indirmeyle hattı doldurduğunda ona bireysel indirme/yükleme limiti koyun. Limit, disksiz sistemde makine yeniden başlasa bile kendiliğinden geri gelir.',
      image: '/images/hiz_sinirlama.png',
      icon: <Gauge className="text-purple-500" size={24} />,
      reverse: false
    },
    {
      title: 'MkLink ve Gelişmiş Save Yönetimi',
      desc: 'Oyun ve kayıt (save) dosyalarını dinamik bağlayarak (Junction) sorunsuz oyun keyfi sunar. Bulut şablon sistemiyle tüm kuralları saniyeler içinde uygularsınız; disksiz sistemde ilerleme kaybolmaz.',
      image: '/images/mklink.png',
      icon: <Gamepad2 className="text-orange-400" size={24} />,
      reverse: true
    },
    {
      title: 'Ağ İzleme ve Donanım İstatistikleri',
      desc: 'Anlık ağ kullanımı, indirme/yükleme hızları ve CPU/GPU sıcaklık-yük grafiklerini izleyin. Darboğazları ve ısınan sistemleri tek bakışta tespit edin.',
      image: '/images/agizleme.png',
      icon: <Activity className="text-cyan-500" size={24} />,
      reverse: false
    },
    {
      title: 'Merkezî Güncelleme ve Veritabanı Yönetimi',
      desc: 'Sunucu kendini günceller; eski sürümdeki tüm istemcileri tek yerden güncellersiniz — disksiz kafelerde makine makine dolaşmak yok. Veritabanı boyutları, disk oranı, yedekleme ve tarih bazlı temizleme tek ekranda.',
      image: '/images/veritabani.png',
      icon: <Database className="text-emerald-400" size={24} />,
      reverse: true
    }
  ];

  return (
    <section className="section bg-[#0f141e]/50 py-24" id="features">
      <div className="container">
        <div className="text-center mb-24 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Kafe Yönetiminde <span className="text-accent-gradient">Yeni Standart</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Geleneksel yazılımların hantallığını geride bırakın. Game Center, donanım odaklı modern çözümleriyle işletmenizi geleceğe taşır.
          </p>
        </div>

        <div className="space-y-32">
          {features.map((f, i) => (
            <div key={i} className={`flex flex-col gap-12 items-center ${f.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'}`}>
              
              <div className="flex-1 space-y-6 animate-fade-in-up">
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-lg">
                  {f.icon}
                </div>
                <h3 className="text-3xl font-bold text-white">{f.title}</h3>
                <p className="text-lg text-muted leading-relaxed max-w-xl">
                  {f.desc}
                </p>
              </div>

              <div className="flex-1 w-full relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-purple-500/10 blur-3xl -z-10 rounded-full scale-90"></div>
                <div className="glass-panel p-2 rounded-2xl overflow-hidden border border-white/10 shadow-2xl hover:border-orange-500/30 transition-colors duration-500">
                  <img src={f.image} alt={f.title} className="w-full h-auto rounded-xl shadow-inner" />
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Kompakt "ve dahası" — ürünün geri kalan tüm özellikleri */}
        <div className="mt-32">
          <div className="text-center mb-14 animate-fade-in-up">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">Ve <span className="text-accent-gradient">Dahası</span></h3>
            <p className="text-muted max-w-2xl mx-auto">Kafenizin her ihtiyacı tek çatı altında — masadan sunucuya kadar.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Coffee,     title: 'Masa (İstemci) Uygulaması', desc: 'Müşterinin masasında kapaklı, kategorili şık oyun vitrini; hızlı arama ve tek tıkla oyun başlatma.' },
              { icon: Mic,        title: 'Sesli Sohbet', desc: 'Aynı odadaki oyuncular ayrı program açmadan masadan sesli konuşur.' },
              { icon: KeyRound,   title: 'Steam Hesap Havuzu', desc: 'Lisanslı hesaplar "Al / Bırak" ile makineler arasında çakışmadan paylaşılır.' },
              { icon: RefreshCw,  title: 'Uzaktan İstemci Güncelleme', desc: 'Eski sürümdeki tüm istemcileri sunucudan tek tıkla güncelleyin; makine dolaşmak yok.' },
              { icon: Monitor,    title: 'Monitör OSD (DDC/CI)', desc: 'Tüm ekranların parlaklık/kontrast/renk ayarını merkezî olarak uzaktan yönetin.' },
              { icon: Users,      title: 'Kullanıcı & Yetki', desc: 'Her çalışana ayrı hesap; kimin ne yaptığı loglarla denetlenir.' },
              { icon: Puzzle,     title: 'Eklentiler', desc: 'İstemci tarafında çalışacak eklentileri panelden yapılandırın.' },
              { icon: HardDrive,  title: 'Disk (Write-back) Uyarıları', desc: 'Disksiz sistemde write-back diskini şişiren makineyi anında yakalayın.' },
              { icon: Cloud,      title: 'Bulut Kapak & MkLink Arşivi', desc: 'Oyun kapakları ve MkLink/Shader şablonları bulut arşivinden paylaşılır.' },
              { icon: ScrollText, title: '5651 Erişim Kayıtları', desc: 'Tüm erişimler imzalı (değiştirilemez) olarak yasaya uygun saklanır ve aranabilir.' },
              { icon: Server,     title: 'Disksiz Uyumlu', desc: 'DeepFreeze / diskless kurulumlara hazır; kayıtlar ve limitler restart sonrası korunur.' },
              { icon: Database,   title: 'Yedekleme & Veritabanı', desc: 'Boyut/disk oranı takibi, tarih bazlı temizleme ve güvenli yedekleme tek ekranda.' },
            ].map((c, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-orange-500/30 transition-colors group">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 mb-4 group-hover:scale-110 transition-transform">
                  <c.icon className="text-orange-400" size={22} />
                </div>
                <div className="font-bold text-white mb-2">{c.title}</div>
                <p className="text-sm text-muted leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
