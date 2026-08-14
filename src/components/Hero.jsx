import { useState, useEffect } from 'react';
import { ChevronRight, Play, X } from 'lucide-react';

const YT_ID = 'J7L0o2c40kY';

const Hero = () => {
  const [open, setOpen] = useState(false);

  // Tam ekran modal açıkken ESC ile kapat + arka plan kaydırmayı kilitle
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow"></span>
              <span className="text-sm font-medium text-emerald-400">Game Center v3.11 Yayınlandı!</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              İnternet Kafe Yönetiminde <br/>
              <span className="text-accent-gradient">Sınırları Kaldırın.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted mb-8 max-w-lg leading-relaxed">
              Bilgisayar izleme, oyun kütüphanesi, içerik filtresi ve 5651 kayıtları,
              hız yönetimi ve şık masa uygulaması — hepsi tek panelde.
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="/demo" className="btn btn-primary">
                <Play size={18} /> Canlı Demo Dene
              </a>
              <a href="#features" className="btn btn-outline">
                Özellikleri Keşfet <ChevronRight size={18} />
              </a>
            </div>
          </div>

          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Tanıtım Videosu — tıklayınca tam ekran açılır */}
            <div className="glass-panel p-2 md:p-4 rounded-3xl relative animate-float group aspect-video">
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-purple-500/20 rounded-3xl -z-10 blur-xl opacity-60 transition-opacity duration-700 group-hover:opacity-100"></div>

              <button
                onClick={() => setOpen(true)}
                className="relative w-full h-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black cursor-pointer block"
                aria-label="Tanıtım videosunu tam ekran oynat"
              >
                <img
                  src={`https://i.ytimg.com/vi/${YT_ID}/maxresdefault.jpg`}
                  onError={(e) => { e.currentTarget.src = `https://i.ytimg.com/vi/${YT_ID}/hqdefault.jpg`; }}
                  alt="GameCenter tanıtım videosu"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors"></span>
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center w-20 h-20 rounded-full bg-[#f97316] shadow-[0_10px_40px_-8px_rgba(249,115,22,0.8)] transition-transform group-hover:scale-110">
                  <Play size={34} className="text-white translate-x-0.5" fill="currentColor" />
                </span>
                <span className="absolute bottom-3 left-4 text-sm font-medium text-white/90 bg-black/40 px-3 py-1 rounded-full backdrop-blur">
                  ▶ Kullanım Eğitimi · 5 dk · Tam ekran
                </span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Tam ekran video modalı */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-up"
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="absolute top-5 right-5 z-10 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Kapat"
          >
            <X size={22} />
          </button>
          <div className="w-full max-w-6xl aspect-video" onClick={(e) => e.stopPropagation()}>
            <iframe
              className="w-full h-full rounded-xl shadow-2xl"
              src={`https://www.youtube-nocookie.com/embed/${YT_ID}?autoplay=1&rel=0&modestbranding=1`}
              title="GameCenter Tanıtım"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </section>
  );
};

export default Hero;
