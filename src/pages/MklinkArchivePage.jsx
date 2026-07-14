import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FolderSync, Upload, Trash2, Loader2, FileJson, CheckCircle2 } from 'lucide-react';

const MklinkArchivePage = () => {
  const context = useOutletContext();
  const dark = context?.dark ?? true;
  
  const [archives, setArchives] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const panelBorder = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';

  const fetchArchives = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/mklink_archive');
      const data = await res.json();
      if (data.success) setArchives(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        
        // Validation basic
        if (!json.name || !json.items) {
          alert('Geçersiz şablon dosyası! name ve items alanları bulunamadı.');
          return;
        }

        setUploading(true);
        const res = await fetch('/api/mklink_archive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: json.name,
            description: json.description || 'Yerel sistemden dışa aktarılan şablon.',
            data_json: json
          })
        });

        const data = await res.json();
        if (data.success) {
          fetchArchives();
          alert('Şablon başarıyla arşive yüklendi!');
        } else {
          alert(data.error);
        }
      } catch (err) {
        alert('Dosya okunurken bir hata oluştu. Geçerli bir JSON dosyası seçtiğinizden emin olun.');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu şablonu arşivden silmek istediğinize emin misiniz?')) return;
    
    try {
      const res = await fetch('/api/mklink_archive', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        fetchArchives();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Silinemedi.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-black ${txt} tracking-tight`}>Mklink Arşivi</h1>
          <p className={`text-sm ${sub} mt-1`}>Kafelerin tek tıkla indirebileceği Global MkLink şablonlarını yönetin.</p>
        </div>
        <div>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-[0_4px_15px_rgba(249,115,22,0.3)] hover:from-orange-400 hover:to-orange-500 transition-all disabled:opacity-50"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            JSON Şablon Yükle
          </button>
        </div>
      </div>

      <div className={`${bg} border ${panelBorder} rounded-2xl overflow-hidden shadow-sm`}>
        <div className={`px-6 py-4 border-b ${panelBorder} flex items-center gap-3`}>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <FolderSync size={20} className="text-orange-500" />
          </div>
          <div>
            <h3 className={`text-base font-bold ${txt}`}>Arşivdeki Şablonlar</h3>
            <p className={`text-xs ${sub} mt-0.5`}>Sisteme yüklenmiş ve kafelere açık olan tüm şablonlar.</p>
          </div>
        </div>

        {fetching ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange-500" /></div>
        ) : archives.length === 0 ? (
          <div className={`py-16 text-center ${sub} text-sm`}>
            <FileJson size={36} className="mx-auto mb-3 opacity-30" />
            <p>Arşivde henüz hiç şablon yok.</p>
          </div>
        ) : (
          <div className={`divide-y ${dark ? 'divide-white/5' : 'divide-gray-100'}`}>
            {archives.map(arch => (
              <div key={arch.id} className="p-4 px-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <CheckCircle2 size={20} className="text-green-500" />
                  </div>
                  <div>
                    <h4 className={`font-semibold ${txt}`}>{arch.name}</h4>
                    <p className={`text-xs ${sub} mt-1 max-w-xl`}>{arch.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md ${dark ? 'bg-white/10' : 'bg-gray-100'}`}>
                        {arch.data_json.items?.length || 0} Kural
                      </span>
                      <span className={`text-[10px] text-gray-500`}>
                        Yüklendi: {new Date(arch.created_at).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(arch.id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                  title="Şablonu Sil"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MklinkArchivePage;
