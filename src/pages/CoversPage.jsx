import { useState, useEffect, useRef, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Image, Upload, CheckCircle2, XCircle, Trash2, Loader2, RefreshCw, Clock, Eye, Download, Edit2, Check, Copy } from 'lucide-react';

const STATUS_CONFIG = {
  pending:  { label: 'Bekliyor',    color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  approved: { label: 'Onaylandı',   color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  rejected: { label: 'Reddedildi',  color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  isimsizler: { label: 'İsimsiz/Karışık', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
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

  // Editing State
  const [editingCoverId, setEditingCoverId] = useState(null);
  const [editGameName, setEditGameName] = useState('');
  
  // Duplicate Detection State
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);

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

      // Vercel Serverless Function Limit Check (4.5 MB)
      if (f.size > 4.5 * 1024 * 1024) {
        fCount++;
        setUploadLogs(prev => [...prev, `❌ ${f.name} - Hata: Dosya boyutu 4.5 MB'dan büyük olamaz.`]);
        setUploadProgress(prev => ({ ...prev, current: i + 1, success: sCount, fail: fCount }));
        continue;
      }

      const finalGameName = uploadForm.game_name || f.name.replace(/\.[^/.]+$/, "");
      const fd = new FormData();
      fd.append('game_name', finalGameName);
      fd.append('file', f);
      fd.append('uploaded_by_id', user.id || '');
      fd.append('uploaded_by_role', user.role || 'cafe');
      fd.append('cafe_id', user.cafe_id || '');
      
      try {
        const res = await fetch('/api/upload_cover', { method: 'POST', body: fd });
        let data;
        try {
          data = await res.json();
        } catch (parseError) {
          throw new Error(res.status === 413 ? 'Dosya çok büyük (413)' : `Sunucu Hatası: ${res.statusText}`);
        }
        
        if (data.success) {
          sCount++;
          if (data.skipped) {
            setUploadLogs(prev => [...prev, `⏩ ${f.name} (Zaten Yüklü)`]);
          } else {
            setUploadLogs(prev => [...prev, `✅ ${f.name} başarıyla yüklendi.`]);
          }
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

  const handleEditSubmit = async (id) => {
    if (!editGameName.trim()) { setEditingCoverId(null); return; }
    await fetch('/api/covers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, game_name: editGameName }) });
    setEditingCoverId(null);
    fetchCovers();
  };

  const isMessy = (name) => /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(name) || name.length < 3;
  
  const filtered = filter === 'all' ? covers 
                 : filter === 'isimsizler' ? covers.filter(c => isMessy(c.game_name)) 
                 : covers.filter(c => c.status === filter);
                 
  const counts = { 
    all: covers.length, 
    pending: covers.filter(c => c.status === 'pending').length, 
    approved: covers.filter(c => c.status === 'approved').length, 
    rejected: covers.filter(c => c.status === 'rejected').length,
    isimsizler: covers.filter(c => isMessy(c.game_name)).length
  };

  const duplicates = useMemo(() => {
    const groups = {};
    covers.forEach(c => {
      const name = c.game_name.toLowerCase().trim();
      if (!groups[name]) groups[name] = [];
      groups[name].push(c);
    });
    return Object.entries(groups).filter(([_, group]) => group.length > 1).sort((a, b) => b[1].length - a[1].length);
  }, [covers]);

  return (
    <>
      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreview(null)}>
          <div className="max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <img src={preview.file_url} alt={preview.game_name} className="w-full rounded-2xl object-cover shadow-2xl" />
            <p className="text-white text-center mt-3 font-semibold">{preview.game_name}</p>
          </div>
        </div>
      )}

      {/* Duplicate Detection Modal */}
      {duplicateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => setDuplicateModalOpen(false)}>
          <div className={`${bg} border ${panelBorder} rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden`} onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <Copy size={18} />
                </div>
                Kopya Tespiti Merkezi
              </h2>
              <button onClick={() => setDuplicateModalOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-8 bg-black/20">
              {duplicates.map(([name, group]) => (
                <div key={name} className="bg-white/5 border border-white/5 rounded-xl p-4">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <span className="text-rose-400">"{name}"</span>
                    <span className="text-xs font-normal text-gray-400 bg-white/5 px-2 py-1 rounded-md">{group.length} kopya bulundu</span>
                  </h3>
                  
                  <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
                    {group.map(cover => (
                      <div key={cover.id} className="min-w-[140px] max-w-[140px] flex-shrink-0 snap-start bg-black/40 rounded-lg overflow-hidden border border-white/5 flex flex-col relative">
                        <img src={cover.file_url} alt={name} className="w-full aspect-[3/4] object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPreview(cover)} />
                        <div className="absolute top-2 left-2"><StatusBadge status={cover.status} /></div>
                        <div className="p-2 flex flex-col items-center justify-center gap-2 mt-auto">
                          <button onClick={() => handleDelete(cover.id)} className="w-full py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center gap-1">
                            <Trash2 size={12} /> Çöpe At
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
            {user.role === 'admin' && duplicates.length > 0 && (
              <button onClick={() => setDuplicateModalOpen(true)} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white shadow-[0_4px_15px_rgba(244,63,94,0.3)]`}>
                <Copy size={16} /> Kopya Tespiti ({duplicates.length})
              </button>
            )}
            <button onClick={fetchCovers} disabled={fetching} className={`p-2.5 rounded-xl transition-colors ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
              <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

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
                  <div className="flex items-center justify-between gap-2 mb-1.5 min-h-[24px]">
                    {editingCoverId === cover.id ? (
                      <div className="flex-1 flex items-center gap-1">
                        <input 
                          type="text" 
                          value={editGameName} 
                          onChange={e => setEditGameName(e.target.value)} 
                          onKeyDown={e => e.key === 'Enter' && handleEditSubmit(cover.id)} 
                          autoFocus 
                          className={`w-full text-xs font-bold px-2 py-1 rounded border outline-none ${dark ? 'bg-black/50 border-white/20 text-white' : 'bg-white border-gray-300 text-black'}`} 
                        />
                        <button onClick={() => handleEditSubmit(cover.id)} className="p-1 rounded text-emerald-400 hover:bg-emerald-500/10"><Check size={14} /></button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-between group/edit cursor-pointer" onClick={() => { if(user.role === 'admin') { setEditingCoverId(cover.id); setEditGameName(cover.game_name); } }}>
                        <p className={`text-xs font-bold ${txt} truncate`} title={cover.game_name}>{cover.game_name}</p>
                        {user.role === 'admin' && <Edit2 size={12} className={`opacity-0 group-hover/edit:opacity-100 transition-opacity ${sub}`} />}
                      </div>
                    )}
                  </div>
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
