import { useState, useEffect } from 'react';
import { ChevronRight, Play } from 'lucide-react';

const Hero = () => {
  const slides = [
    '/images/client 1.png',
    '/images/client_yenioyun.png',
    '/images/client_istatistik.png',
    '/images/client_oyunkayit.png',
    '/images/client_seslisohbet.png',
    '/images/client_steam.png',
    '/images/bilgisayarlar.png',
    '/images/oyunlar.png'
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow"></span>
              <span className="text-sm font-medium text-emerald-400">Game Center v2.3.2 Yayınlandı!</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              İnternet Kafe Yönetiminde <br/>
              <span className="text-accent-gradient">Sınırları Kaldırın.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted mb-8 max-w-lg leading-relaxed">
              Donanım odaklı modern altyapı, MkLink gücü, anlık OSD yönetimi ve 
              göz alıcı tasarımıyla kafenize premium bir dokunuş yapın.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <a href="#features" className="btn btn-outline">
                <Play size={18} /> Özellikleri Keşfet
              </a>
            </div>
          </div>
          
          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Dashboard Screenshot Mockup */}
            <div className="glass-panel p-2 md:p-4 rounded-3xl relative animate-float group aspect-video">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-purple-500/20 rounded-3xl -z-10 blur-xl opacity-60 transition-opacity duration-700 group-hover:opacity-100"></div>
              
              <div className="relative w-full h-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
                {slides.map((slide, index) => (
                  <img
                    key={index}
                    src={slide}
                    alt={`Game Center Showcase ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation dots */}
              <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-emerald-400 w-6' : 'bg-white/30 hover:bg-white/50 w-2'
                    }`}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
