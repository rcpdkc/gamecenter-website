import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Image, Upload, CheckCircle2, XCircle, Trash2, Loader2, RefreshCw, Clock, Eye } from 'lucide-react';

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
  const [uploadForm, setUploadForm] = useState({ game_name: '', file: null });
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
      const res = await fetch('/api/covers?role=admin');
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
    if (!uploadForm.game_name || !uploadForm.file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('game_name', uploadForm.game_name);
      fd.append('file', uploadForm.file);
      fd.append('uploaded_by_id', user.id || '');
      fd.append('uploaded_by_role', user.role || 'admin');
      fd.append('cafe_id', user.cafe_id || '');
      const res = await fetch('/api/upload_cover', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.success) { setUploadForm({ game_name: '', file: null }); if (fileRef.current) fileRef.current.value = ''; fetchCovers(); }
      else alert(data.error);
    } catch { alert('Yükleme başarısız.'); }
    finally { setUploading(false); }
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
          <button onClick={fetchCovers} disabled={fetching} className={`ml-auto p-2.5 rounded-xl transition-colors ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
            <RefreshCw size={16} className={fetching ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Upload form (Admin only) */}
        <div className={`${bg} border ${panelBorder} rounded-2xl p-6 shadow-sm`}>
          <h3 className={`text-base font-bold ${txt} mb-4 flex items-center gap-2`}><Upload size={18} className="text-orange-500" /> Admin Cover Yükle</h3>
          <form onSubmit={handleUpload} className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className={`block text-xs font-semibold uppercase tracking-wide ${sub} mb-1.5`}>Oyun Adı</label>
              <input type="text" value={uploadForm.game_name} onChange={e => setUploadForm({ ...uploadForm, game_name: e.target.value })}
                placeholder="örn: Counter-Strike 2" required
                className={`w-full border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${inputBg}`} />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className={`block text-xs font-semibold uppercase tracking-wide ${sub} mb-1.5`}>Görsel (JPG/PNG/WebP, max 10MB)</label>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" required
                onChange={e => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                className={`w-full border rounded-xl py-2 px-4 text-sm focus:outline-none ${inputBg}`} />
            </div>
            <button type="submit" disabled={uploading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold flex items-center gap-2 disabled:opacity-60 shadow-[0_4px_15px_rgba(249,115,22,0.3)] whitespace-nowrap">
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {uploading ? 'Yükleniyor...' : 'Yükle'}
            </button>
          </form>
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
                    {cover.status !== 'approved' && (
                      <button onClick={() => handleStatus(cover.id, 'approved')}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-1">
                        <CheckCircle2 size={11} /> Onayla
                      </button>
                    )}
                    {cover.status !== 'rejected' && (
                      <button onClick={() => handleStatus(cover.id, 'rejected')}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1">
                        <XCircle size={11} /> Reddet
                      </button>
                    )}
                    <button onClick={() => handleDelete(cover.id)}
                      className={`p-1.5 rounded-lg text-xs transition-colors ${dark ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}>
                      <Trash2 size={13} />
                    </button>
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
