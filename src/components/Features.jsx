import { Monitor, Rocket, Gamepad2, ShieldCheck, ChevronRight, Zap } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Rocket size={24} className="text-orange-500" />,
      title: 'Akıllı Başlangıç (Smart Startup)',
      desc: 'Bilgisayarlar açıldığında arka plandaki gereksiz yazılımları temizleyerek müşterilere tertemiz bir deneyim sunar.'
    },
    {
      icon: <Gamepad2 size={24} className="text-orange-500" />,
      title: 'MkLink ve Save Yönetimi',
      desc: 'Oyun dosyalarını ve Save dosyalarını dinamik olarak bağlayarak (Junction) %100 sorunsuz oyun keyfi yaşatır.'
    },
    {
      icon: <Monitor size={24} className="text-orange-500" />,
      title: 'Canlı Monitör (OSD) Sistemi',
      desc: 'Tüm ağınızdaki ekranların parlaklık, kontrast ve renk ayarlarını (DDC/CI) tek bir panelden uzaktan yönetin.'
    },
    {
      icon: <ShieldCheck size={24} className="text-orange-500" />,
      title: 'Steam Güvenlik Otomasyonu',
      desc: 'Müşteriler masadan kalktığında Steam vb. platformlardaki hesapların güvenli şekilde kapatılmasını garanti eder.'
    },
    {
      icon: <Zap size={24} className="text-orange-500" />,
      title: 'Donanım Limitleri',
      desc: 'Isınan bilgisayarlarda otomatik FPS veya Güç limitlemesi (Power Limit) uygulayarak donanımınızı korur.'
    },
  ];

  return (
    <section className="section" id="features">
      <div className="container">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Kafe Yönetiminde <span className="text-accent-gradient">Yeni Standart</span>
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Geleneksel yazılımların hantallığını geride bırakın. Game Center, donanım odaklı modern çözümleriyle işletmenizi geleceğe taşır.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div 
              key={i} 
              className="glass-panel p-8 animate-fade-in-up" 
              style={{ animationDelay: `${0.1 * (i + 1)}s` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{f.title}</h3>
              <p className="text-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
