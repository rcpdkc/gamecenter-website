import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Image, Upload, CheckCircle2, XCircle, Trash2, Loader2, RefreshCw, Clock, Eye, Download } from 'lucide-react';

const STATUS_CONFIG = {
  pending:  { label: 'Bekliyor',    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  approved: { label: 'Onaylandı',   color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  rejected: { label: 'Reddedildi',  color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${s.color}`}>{s.label}</span>;
};

const CoversPage = () => {
  const context = useOutletContext() || {};
  const dark = context.dark !== undefined ? context.dark : true;
  const [covers, setCovers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState('all');
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ game_name: '', files: null });
  const [uploadProgress, setUploadProgress] = useState({ active: false, total: 0, current: 0, success: 0, fail: 0 });
  const [uploadLogs, setUploadLogs] = useState([]);
  const cancelUploadRef = useRef(false);

  // AI State
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeProgress, setAnalyzeProgress] = useState({ active: false, total: 0, current: 0, success: 0, fail: 0 });
  const [analyzeLogs, setAnalyzeLogs] = useState([]);
  const cancelAnalyzeRef = useRef(false);

  const fileRef = useRef(null);
  const user = (() => { try { return JSON.parse(localStorage.getItem('gc_user') || '{}'); } catch { return {}; } })();

  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const panelBorder = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';
  const inputBg = dark ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900';

  const fetchCovers = async () => {
    setFetching(true);
    try {
      const res = await fetch(`/api/covers?role=${user.role || 'cafe'}&cafe_id=${user.cafe_id || ''}`);
      const data = await res.json();
      if (data.success) setCovers(data.data);
    } catch { } finally { setFetching(false); }
  };

  useEffect(() => { fetchCovers(); }, []);

  const handleStatus = async (id, status) => {
    await fetch('/api/covers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    fetchCovers();
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu cover\'ı silmek istediğinize emin misiniz?')) return;
    await fetch('/api/covers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchCovers();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.files || uploadForm.files.length === 0) return;
    
    cancelUploadRef.current = false;
    const filesArray = Array.from(uploadForm.files);
    setUploading(true);
    setUploadProgress({ active: true, total: filesArray.length, current: 0, success: 0, fail: 0 });
    setUploadLogs([]);
    
    let sCount = 0;
    let fCount = 0;
    
    for (let i = 0; i < filesArray.length; i++) {
      if (cancelUploadRef.current) {
        setUploadLogs(prev => [...prev, "🛑 Yükleme işlemi kullanıcı tarafından iptal edildi!"]);
        break;
      }
      
      const f = filesArray[i];
      const finalGameName = uploadForm.game_name || f.name.replace(/\.[^/.]+$/, "");
      const fd = new FormData();
      fd.append('game_name', finalGameName);
      fd.append('file', f);
      fd.append('uploaded_by_id', user.id || '');
      fd.append('uploaded_by_role', user.role || 'cafe');
      fd.append('cafe_id', user.cafe_id || '');
      
      try {
        const res = await fetch('/api/upload_cover', { method: 'POST', body: fd });
        const data = await res.json();
        if (data.success) {
          sCount++;
          setUploadLogs(prev => [...prev, `✅ ${f.name} başarıyla yüklendi.`]);
        } else {
          fCount++;
          setUploadLogs(prev => [...prev, `❌ ${f.name} - Hata: ${data.error || 'Bilinmeyen Hata'}`]);
        }
      } catch (err) {
        fCount++;
        setUploadLogs(prev => [...prev, `❌ ${f.name} - Ağ Hatası: ${err.message}`]);
      }
      
      setUploadProgress(prev => ({ ...prev, current: i + 1, success: sCount, fail: fCount }));
    }
    
    setUploadForm({ game_name: '', files: null }); 
    if (fileRef.current) fileRef.current.value = ''; 
    fetchCovers(); 
    
    setUploading(false);
    // Hide active bar after 5 seconds of finish, but keep logs visible until next upload.
    setTimeout(() => {
      setUploadProgress(prev => ({ ...prev, active: false }));
    }, 5000);
  };

  const handleDownload = (cover_url) => {
    window.open(cover_url, '_blank');
  };

  const handleBulkAnalyze = async () => {
    // Detect items that are likely UUIDs or have very short/meaningless names (e.g. without spaces, dashes only)
    const targets = covers.filter(c => /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(c.game_name));
    if (targets.length === 0) {
      alert("Yapay Zeka analizi gerektiren (isimlendirilmemiş veya UUID formunda) cover bulunamadı.");
      return;
    }
    
    if (!confirm(`Toplam ${targets.length} adet isimsiz cover için Yapay Zeka analizi başlatılacak. Bu işlem biraz sürebilir. Onaylıyor musunuz?`)) return;

    cancelAnalyzeRef.current = false;
    setAnalyzing(true);
    setAnalyzeProgress({ active: true, total: targets.length, current: 0, success: 0, fail: 0 });
    setAnalyzeLogs([]);

    let sCount = 0;
    let fCount = 0;

    for (let i = 0; i < targets.length; i++) {
      if (cancelAnalyzeRef.current) {
        setAnalyzeLogs(prev => [...prev, "🛑 AI Analizi iptal edildi!"]);
        break;
      }

      const cover = targets[i];
      try {
        const res = await fetch('/api/analyze_cover', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: cover.id, file_url: cover.file_url })
        });
        const data = await res.json();
        if (data.success) {
          sCount++;
          setAnalyzeLogs(prev => [...prev, `✅ [${i+1}/${targets.length}] Bulundu: ${data.game_name}`]);
          setCovers(prevCovers => prevCovers.map(c => c.id === cover.id ? { ...c, game_name: data.game_name } : c));
        } else {
          fCount++;
          setAnalyzeLogs(prev => [...prev, `❌ [${i+1}/${targets.length}] Hata: ${data.error}`]);
        }
      } catch (err) {
        fCount++;
        setAnalyzeLogs(prev => [...prev, `❌ [${i+1}/${targets.length}] Ağ Hatası: ${err.message}`]);
      }

      setAnalyzeProgress(prev => ({ ...prev, current: i + 1, success: sCount, fail: fCount }));
    }

    setAnalyzing(false);
  };

  const filtered = filter === 'all' ? covers : covers.filter(c => c.status === filter);
  const counts = { all: covers.length, pending: covers.filter(c => c.status === 'pending').length, approved: covers.filter(c => c.status === 'approved').length, rejected: covers.filter(c => c.status === 'rejected').length };

  return (
    <>
      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreview(null)}>
          <div className="max-w-2xl w-full">
            <img src={preview.file_url} alt={preview.game_name} className="w-full rounded-2xl object-cover shadow-2xl" />
            <p className="text-white text-center mt-3 font-semibold">{preview.game_name}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Stats + Filter tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(counts).map(([key, count]) => (
            <button key={key} onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${filter === key
                ? 'bg-orange-500 text-white border-orange-500 shadow-[0_4px_15px_rgba(249,115,22,0.3)]'
                : dark ? 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20' : 'bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-300'}`}>
              {key === 'all' ? 'Tümü' : STATUS_CONFIG[key]?.label || key} ({count})
            </button>
          ))}
          
          <div className="ml-auto flex items-center gap-2">
            {user.role === 'admin' && (
              <button onClick={handleBulkAnalyze} disabled={analyzing} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${analyzing ? 'bg-purple-500/50 text-white cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-[0_4px_15px_rgba(168,85,247,0.3)]'}`}>
                {analyzing ? <Loader2 size={16} className="animate-spin" /> : <span>🤖</span>}
                {analyzing ? 'AI Tarıyor...' : 'AI ile İsimlendir'}
              </button>
            )}
            
            <button onClick={fetchCovers} disabled={fetching || analyzing} className={`p-2.5 rounded-xl transition-colors ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
              <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* AI Progress & Logs Display */}
        {(analyzeProgress.active || analyzeLogs.length > 0) && (
          <div className={`${bg} border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_20px_rgba(168,85,247,0.1)] relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            {analyzeProgress.active && (
              <>
                <div className="flex items-center justify-between text-sm font-bold mb-3">
                  <span className="text-purple-400 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Yapay Zeka Kapakları Analiz Ediyor... ({analyzeProgress.current} / {analyzeProgress.total})
                  </span>
                  <span className="text-white">{Math.round((analyzeProgress.current / analyzeProgress.total) * 100)}%</span>
                </div>
                <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden flex-shrink-0">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-300"
                    style={{ width: `${(analyzeProgress.current / analyzeProgress.total) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="flex gap-4 text-xs font-medium text-gray-400">
                    <span className="text-emerald-400">Başarılı: {analyzeProgress.success}</span>
                    {analyzeProgress.fail > 0 && <span className="text-red-400">Hatalı: {analyzeProgress.fail}</span>}
                  </div>
                  
                  {analyzing && (
                    <button 
                      onClick={() => { cancelAnalyzeRef.current = true; }} 
                      className="text-xs font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500 px-4 py-1.5 rounded-lg transition-colors"
                    >
                      Taramayı Durdur
                    </button>
                  )}
                </div>
              </>
            )}

            {/* AI Log Window */}
            {analyzeLogs.length > 0 && (
              <div className="mt-4 bg-black/60 border border-white/5 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs leading-relaxed flex flex-col-reverse shadow-inner">
                <div>
                  {analyzeLogs.map((log, idx) => (
                    <div key={idx} className={`mb-1.5 ${log.includes('✅') ? 'text-emerald-400' : log.includes('🛑') ? 'text-yellow-400' : 'text-red-400'}`}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {!analyzing && analyzeLogs.length > 0 && (
              <button 
                onClick={() => { setAnalyzeLogs([]); setAnalyzeProgress({ active: false, total: 0, current: 0, success: 0, fail: 0 }); }}
                className="mt-4 w-full py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-xl text-sm font-bold transition-colors"
              >
                Pencereyi Kapat
              </button>
            )}
          </div>
        )}

        {/* Upload form (All users can upload now) */}
        <div className={`${bg} border ${panelBorder} rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          
          <h3 className={`text-lg font-bold ${txt} mb-6 flex items-center gap-3`}>
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <Upload size={20} className="text-orange-500" />
            </div>
            {user.role === 'admin' ? 'Admin Cover Yükle' : 'Yeni Cover Yükle'}
          </h3>
          
          <form onSubmit={handleUpload} className="flex flex-col lg:flex-row gap-5 items-start lg:items-end relative z-10">
            <div className="flex-1 w-full lg:min-w-[250px]">
              <label className={`block text-[11px] font-bold uppercase tracking-widest ${sub} mb-2`}>Oyun Adı (Opsiyonel)</label>
              <input 
                type="text" 
                value={uploadForm.game_name} 
                onChange={e => setUploadForm({ ...uploadForm, game_name: e.target.value })}
                placeholder="Örn: Valorant (Boş bırakırsanız dosya adı kullanılır)" 
                className={`w-full border rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all ${inputBg}`} 
              />
            </div>
            
            <div className="flex-1 w-full lg:min-w-[300px]">
              <label className={`block text-[11px] font-bold uppercase tracking-widest ${sub} mb-2`}>Oyun Görseli (JPG/PNG/WEBP)</label>
              <div className={`relative flex items-center w-full border border-dashed rounded-xl overflow-hidden transition-all group ${
                uploadForm.files?.length > 0 ? 'border-orange-500/50 bg-orange-500/5' : `hover:border-orange-500/40 ${inputBg}`
              }`}>
                <input 
                  ref={fileRef} 
                  type="file" 
                  multiple
                  accept="image/jpeg,image/png,image/webp" 
                  required
                  onChange={e => setUploadForm({ ...uploadForm, files: e.target.files })}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                />
                <div className="flex items-center gap-3 px-4 py-3.5 w-full pointer-events-none">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                    uploadForm.files?.length > 0 ? 'bg-orange-500 text-white' : 'bg-gray-500/10 text-gray-500 group-hover:text-orange-400 group-hover:bg-orange-500/10'
                  }`}>
                    {uploadForm.files?.length > 0 ? <CheckCircle2 size={16} /> : <Image size={16} />}
                  </div>
                  <span className={`text-sm truncate font-medium ${uploadForm.files?.length > 0 ? 'text-orange-500' : sub}`}>
                    {uploadForm.files?.length > 0 ? `${uploadForm.files.length} dosya seçildi` : 'Çoklu görsel seçmek için tıklayın veya sürükleyin...'}
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={uploading}
              className="w-full lg:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 shadow-[0_4px_20px_rgba(249,115,22,0.3)] transition-all whitespace-nowrap mt-2 lg:mt-0"
            >
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              Yükle
            </button>
          </form>

          {/* Progress Bar & Logs Display */}
          {(uploadProgress.active || uploadLogs.length > 0) && (
            <div className="mt-6 pt-6 border-t border-white/5 relative z-10">
              
              {uploadProgress.active && (
                <>
                  <div className="flex items-center justify-between text-xs font-semibold mb-2">
                    <span className="text-orange-400">Yükleniyor... ({uploadProgress.current} / {uploadProgress.total})</span>
                    <span className="text-white">{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden flex-shrink-0">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-300"
                      style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-4 text-[10px] text-gray-500">
                      <span className="text-emerald-500">Başarılı: {uploadProgress.success}</span>
                      {uploadProgress.fail > 0 && <span className="text-red-500">Hatalı: {uploadProgress.fail}</span>}
                    </div>
                    
                    {/* İptal Butonu */}
                    {uploading && (
                      <button 
                        onClick={() => { cancelUploadRef.current = true; }} 
                        className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1 rounded transition-colors"
                      >
                        İptal Et
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Log Window */}
              {uploadLogs.length > 0 && (
                <div className="mt-4 bg-black/50 border border-white/5 rounded-xl p-3 h-40 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col-reverse">
                  <div>
                    {uploadLogs.map((log, idx) => (
                      <div key={idx} className={`mb-1 ${log.includes('✅') ? 'text-emerald-400' : log.includes('🛑') ? 'text-yellow-400' : 'text-red-400'}`}>
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Kapat / Temizle Butonu */}
              {!uploading && uploadLogs.length > 0 && (
                <button 
                  onClick={() => { setUploadLogs([]); setUploadProgress({ active: false, total: 0, current: 0, success: 0, fail: 0 }); }}
                  className="mt-3 w-full py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  Günlükleri Temizle
                </button>
              )}
            </div>
          )}
        </div>

        {/* Covers Grid */}
        {fetching ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange-500" size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className={`${bg} border ${panelBorder} rounded-2xl py-16 text-center shadow-sm`}>
            <Image size={40} className={`mx-auto mb-3 ${sub} opacity-30`} />
            <p className={`text-sm ${sub}`}>Bu kategoride cover bulunamadı.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(cover => (
              <div key={cover.id} className={`${bg} border ${panelBorder} rounded-2xl overflow-hidden shadow-sm group`}>
                <div className="relative aspect-[3/4] bg-black overflow-hidden cursor-pointer" onClick={() => setPreview(cover)}>
                  <img src={cover.file_url} alt={cover.game_name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Eye size={24} className="text-white" />
                  </div>
                </div>
                <div className="p-3">
                  <p className={`text-xs font-bold ${txt} truncate mb-1.5`}>{cover.game_name}</p>
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={cover.status} />
                    <span className={`text-xs ${sub} flex items-center gap-1`}>
                      <Clock size={11} />{new Date(cover.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <p className={`text-xs ${sub} mb-2`}>
                    {cover.uploaded_by_role === 'admin' ? '🔑 Admin' : `📍 Kafe`}
                  </p>
                  {/* Action buttons */}
                  <div className="flex gap-1">
                    {user.role === 'admin' && cover.status !== 'approved' && (
                      <button onClick={() => handleStatus(cover.id, 'approved')}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1">
                        <CheckCircle2 size={11} /> Onayla
                      </button>
                    )}
                    {user.role === 'admin' && cover.status !== 'rejected' && (
                      <button onClick={() => handleStatus(cover.id, 'rejected')}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1">
                        <XCircle size={11} /> Reddet
                      </button>
                    )}
                    {cover.status === 'approved' && (
                      <button onClick={() => handleDownload(cover.file_url)}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-1">
                        <Download size={11} /> İndir
                      </button>
                    )}
                    {user.role === 'admin' && (
                      <button onClick={() => handleDelete(cover.id)}
                        className={`p-1.5 rounded-lg text-xs transition-colors ${dark ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default CoversPage;
