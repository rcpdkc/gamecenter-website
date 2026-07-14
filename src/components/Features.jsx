import { Monitor, Rocket, Gamepad2, ShieldCheck, Zap, Activity } from 'lucide-react';

const Features = () => {
  const features = [
    {
      title: 'Canlı Monitör (OSD) Sistemi',
      desc: 'Tüm ağınızdaki ekranların parlaklık, kontrast ve renk ayarlarını (DDC/CI) tek bir panelden uzaktan yönetin. Müşteri rahatsız olmadan ekran ayarlarına anında müdahale edin.',
      image: '/images/canlimonitör.png',
      icon: <Monitor className="text-orange-500" size={24} />,
      reverse: false
    },
    {
      title: 'MkLink ve Gelişmiş Save Yönetimi',
      desc: 'Oyun dosyalarını ve Save dosyalarını dinamik olarak bağlayarak (Junction) %100 sorunsuz oyun keyfi yaşatır. Bulut destekli şablon sistemi ile tüm kuralları saniyeler içinde kafenize uygulayın.',
      image: '/images/mklink.png',
      icon: <Gamepad2 className="text-purple-500" size={24} />,
      reverse: true
    },
    {
      title: 'Ağ ve Trafik İzleme',
      desc: 'Kafenizdeki tüm bilgisayarların anlık ağ kullanımlarını, indirme ve yükleme hızlarını takip edin. Darboğazları anında tespit edip çözüme kavuşturun.',
      image: '/images/agizleme.png',
      icon: <Activity className="text-blue-500" size={24} />,
      reverse: false
    },
    {
      title: 'Oyun Kütüphanesi ve Kapak Yönetimi',
      desc: 'Özel oyun menünüz için tüm oyunları ve kapak fotoğraflarını yönetin. Toplu yükleme ve otomatik isimlendirme ile saatlerce süren işlemleri dakikalara indirin.',
      image: '/images/oyunlar.png',
      icon: <Rocket className="text-emerald-500" size={24} />,
      reverse: true
    },
    {
      title: 'Detaylı Donanım İstatistikleri',
      desc: 'İşlemci (CPU) ve Ekran Kartı (GPU) sıcaklıkları, fan hızları ve anlık kullanımları grafiklerle izleyin. Isınan sistemlerde otomatik FPS/Güç limitlemesi uygulayarak donanımınızı koruyun.',
      image: '/images/monitorgrafik.png',
      icon: <Zap className="text-red-500" size={24} />,
      reverse: false
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
      </div>
    </section>
  );
};

export default Features;
