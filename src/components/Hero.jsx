import { ChevronRight, Play } from 'lucide-react';

const Hero = () => {
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
            <div className="glass-panel p-2 md:p-4 rounded-3xl relative animate-float">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-purple-500/20 rounded-3xl -z-10 blur-xl"></div>
              <img 
                src="/images/bilgisayarlar.png" 
                alt="Game Center Dashboard" 
                className="w-full h-auto rounded-2xl border border-white/10 shadow-2xl"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;
