import { BookOpen, Server, Monitor, Shield, Settings, Activity } from 'lucide-react';

const Wiki = () => {
  const categories = [
    { icon: <Server className="text-orange-500" />, title: "Sunucu Kurulumu", desc: "Game Center sunucusunu Windows Server veya Windows 10/11 makineye kurma adımları." },
    { icon: <Monitor className="text-blue-500" />, title: "İstemci (Client) Ayarları", desc: "Kullanıcı bilgisayarlarına client yükleme, yetkilendirme ve arka plan hizmetleri." },
    { icon: <BookOpen className="text-purple-500" />, title: "MkLink / Save Sistemi", desc: "Oyun dosyalarını ağdan veya SSD'den bağlayarak (Junction) %100 uyumlu çalıştırma rehberi." },
    { icon: <Activity className="text-emerald-500" />, title: "OSD ve Monitör Yönetimi", desc: "Ağdaki tüm monitörlerin parlaklık ve kontrastını uzaktan (DDC/CI) kontrol etme." },
    { icon: <Shield className="text-red-500" />, title: "Güvenlik ve Otomasyon", desc: "Steam, Epic Games oturumlarının otomatik kapatılması ve donanım limitleri belirleme." },
    { icon: <Settings className="text-gray-400" />, title: "Gelişmiş Ayarlar", desc: "Veritabanı yedekleme, Port değiştirme ve sorun giderme işlemleri." }
  ];

  return (
    <div className="pt-32 pb-20 min-h-screen">
      <div className="container">
        
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Game Center <span className="text-accent-gradient">Wiki</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Yazılımı en verimli şekilde kullanmanız için hazırlanan kapsamlı dokümantasyon ve kullanım kılavuzları.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <div 
              key={i} 
              className="glass-panel p-6 hover:cursor-pointer group animate-fade-in-up"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-orange-500/30 transition-all">
                  {cat.icon}
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">{cat.title}</h3>
              </div>
              <p className="text-muted text-sm leading-relaxed">
                {cat.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Wiki;
