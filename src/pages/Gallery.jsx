import React, { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

const Gallery = () => {
  const images = [
    { src: '/images/client 1.png', title: 'Ana Ekran', desc: 'Game Center İstemci Ana Ekranı' },
    { src: '/images/oyunlar.png', title: 'Oyunlar', desc: 'Yüksek Çözünürlüklü Oyun Kütüphanesi' },
    { src: '/images/client_steam.png', title: 'Steam Entegrasyonu', desc: 'Tek Tıkla Otomatik Oturum Açma' },
    { src: '/images/client_seslisohbet.png', title: 'Sesli Sohbet', desc: 'Sıfır Gecikmeli LAN Voice Chat' },
    { src: '/images/client_istatistik.png', title: 'İstatistikler', desc: 'Oyuncuya Özel Analizler' },
    { src: '/images/client_oyunkayit.png', title: 'Bulut Kayıt (Save)', desc: 'Otomatik Save Yedekleme' },
    { src: '/images/client_yenioyun.png', title: 'Oyun Ekleme', desc: 'Admin Oyun Ekleme Ekranı' },
    { src: '/images/bilgisayarlar.png', title: 'Bilgisayar Listesi', desc: 'Tüm İstemcileri Anlık Takip Edin' },
    { src: '/images/canlimonitör.png', title: 'OSD Monitör', desc: 'Canlı Donanım Sıcaklık/Yük İzleme' },
    { src: '/images/monitorgrafik.png', title: 'Grafik Analizi', desc: 'Geçmişe Dönük PC Performans Grafikleri' },
    { src: '/images/agizleme.png', title: 'Ağ İzleme', desc: 'Milisaniyelik Download/Upload Takibi' },
    { src: '/images/mklink.png', title: 'MkLink Profilleri', desc: 'Oyun Dosyaları İçin Junction Yönetimi' },
  ];

  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="flex-1 w-full min-h-screen bg-bg-primary pt-32 pb-20 px-4 md:px-8 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-orange-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-orange-500/10 text-orange-400 px-4 py-2 rounded-full font-semibold text-sm mb-6 border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
            <ImageIcon size={18} /> Game Center Plus Galerisi
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Sistemi Görsellerle <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Keşfedin</span></h1>
          <p className="text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            İstemci arayüzünün zarafeti ve yönetim panelinin detaylı gücü. Hem oyuncular hem de yöneticiler için tasarlandı.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {images.map((img, index) => (
            <div 
              key={index} 
              className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#0a0b10] shadow-2xl transition-all duration-500 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.2)] hover:-translate-y-2 animate-fade-in-up"
              style={{ animationDelay: \`\${index * 50}ms\` }}
              onClick={() => setSelectedImage(img)}
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img 
                  src={img.src} 
                  alt={img.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              </div>
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-[#0a0b10]/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>
              
              <div className="absolute bottom-0 left-0 w-full p-6 translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                <h3 className="text-xl font-bold text-white mb-1 drop-shadow-md">{img.title}</h3>
                <p className="text-sm text-gray-300 opacity-0 transition-opacity duration-300 delay-100 group-hover:opacity-100">{img.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8 backdrop-blur-sm animate-fade-in">
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
            onClick={() => setSelectedImage(null)}
          >
            <X size={24} />
          </button>
          
          <div className="max-w-7xl w-full max-h-full flex flex-col items-center animate-fade-in-up">
            <img 
              src={selectedImage.src} 
              alt={selectedImage.title} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
            />
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-bold text-white mb-2">{selectedImage.title}</h3>
              <p className="text-gray-400">{selectedImage.desc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
