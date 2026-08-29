import { useState, useEffect, useRef, useMemo } from 'react';
import { Image, Upload, CheckCircle2, XCircle, Trash2, Loader2, RefreshCw, Eye, Edit2, Check, Copy } from 'lucide-react';
import { Card, CardHeader, Button, IconButton, SearchInput, Badge, Modal, EmptyState, ProgressBar, SegFilter, Toolbar, Loading, useConfirm } from '../admin/ui';

const STATUS_CONFIG = {
  pending:    { label: 'Bekliyor',        tone: 'warn' },
  approved:   { label: 'Onaylandı',       tone: 'ok' },
  rejected:   { label: 'Reddedildi',      tone: 'danger' },
  isimsizler: { label: 'İsimsiz/Karışık', tone: 'info' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return <Badge tone={s.tone}>{s.label}</Badge>;
};

const CoversPage = () => {
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCovers, setSelectedCovers] = useState([]);

  const fileRef = useRef(null);
  const user = (() => { try { return JSON.parse(localStorage.getItem('gc_user') || '{}'); } catch { return {}; } })();
  const { confirm, confirmNode } = useConfirm();

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
    setCovers(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    await fetch('/api/covers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
  };

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Cover sil', message: 'Bu cover\'ı silmek istediğinize emin misiniz?', tone: 'danger', confirmLabel: 'Sil' });
    if (!ok) return;
    setCovers(prev => prev.filter(c => c.id !== id));
    await fetch('/api/covers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
  };

  const handleBulkDelete = async () => {
    const ok = await confirm({ title: 'Görselleri sil', message: `${selectedCovers.length} adet görseli silmek istediğinize emin misiniz?`, tone: 'danger', confirmLabel: 'Sil' });
    if (!ok) return;
    const idsToDelete = [...selectedCovers];
    setSelectedCovers([]);
    setCovers(prev => prev.filter(c => !idsToDelete.includes(c.id)));
    await Promise.all(idsToDelete.map(id =>
      fetch('/api/covers', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    ));
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
    const updatedName = editGameName.trim();
    if (!updatedName) { setEditingCoverId(null); return; }
    setEditingCoverId(null);
    setCovers(prev => prev.map(c => c.id === id ? { ...c, game_name: updatedName } : c));
    await fetch('/api/covers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, game_name: updatedName }) });
  };

  const isMessy = (name) => /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(name) || name.length < 3;

  const baseFiltered = filter === 'all' ? covers
                 : filter === 'isimsizler' ? covers.filter(c => isMessy(c.game_name))
                 : covers.filter(c => c.status === filter);

  const filtered = searchQuery.trim()
                 ? baseFiltered.filter(c => c.game_name.toLowerCase().includes(searchQuery.toLowerCase()))
                 : baseFiltered;

  const counts = {
    all: covers.length,
    pending: covers.filter(c => c.status === 'pending').length,
    approved: covers.filter(c => c.status === 'approved').length,
    rejected: covers.filter(c => c.status === 'rejected').length,
    isimsizler: covers.filter(c => isMessy(c.game_name)).length
  };

  const filterOptions = [
    { value: 'all', label: 'Tümü', count: counts.all },
    { value: 'pending', label: STATUS_CONFIG.pending.label, count: counts.pending },
    { value: 'approved', label: STATUS_CONFIG.approved.label, count: counts.approved },
    { value: 'rejected', label: STATUS_CONFIG.rejected.label, count: counts.rejected },
    { value: 'isimsizler', label: STATUS_CONFIG.isimsizler.label, count: counts.isimsizler },
  ];

  const normalizeForDuplicate = (name) => {
    let n = name.toLowerCase();
    n = n.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    n = n.replace(/_tgdb_[a-f0-9]+$/i, '');
    n = n.replace(/_[0-9]{10,}$/i, '');
    n = n.replace(/[^a-z0-9]/g, ' ');
    return n.replace(/\s+/g, ' ').trim();
  };

  const duplicates = useMemo(() => {
    const groups = {};
    covers.forEach(c => {
      const name = normalizeForDuplicate(c.game_name);
      if (name.length < 3) return; // ignore very short or noisy names
      if (!groups[name]) groups[name] = [];
      groups[name].push(c);
    });
    return Object.entries(groups).filter(([_, group]) => group.length > 1).sort((a, b) => b[1].length - a[1].length);
  }, [covers]);

  return (
    <>
      {/* Preview Modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.game_name} width="max-w-2xl">
        {preview && <img src={preview.file_url} alt={preview.game_name} className="w-full rounded-xl object-cover" />}
      </Modal>

      {/* Bulk Delete Bar */}
      {selectedCovers.length > 0 && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[55] px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4"
          style={{ background: 'var(--a-danger)', color: '#fff' }}>
          <span className="font-bold text-sm">{selectedCovers.length} kapak seçildi</span>
          <button onClick={handleBulkDelete} className="bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
            <Trash2 size={16} /> Sil
          </button>
          <button onClick={() => setSelectedCovers([])} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Duplicate Detection Modal */}
      <Modal open={duplicateModalOpen} onClose={() => setDuplicateModalOpen(false)} title="Kopya Tespiti Merkezi" icon={Copy} width="max-w-5xl">
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {duplicates.map(([name, group]) => (
            <div key={name} className="rounded-xl border p-4" style={{ background: 'var(--a-card2)', borderColor: 'var(--a-border)' }}>
              <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--a-ink)' }}>
                <span className="capitalize" style={{ color: 'var(--a-accent)' }}>"{name}"</span>
                <Badge tone="mut">{group.length} kopya bulundu</Badge>
              </h3>

              <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x">
                {group.map(cover => (
                  <div key={cover.id} className="min-w-[140px] max-w-[140px] flex-shrink-0 snap-start rounded-lg overflow-hidden border flex flex-col relative"
                    style={{ background: 'var(--a-bg)', borderColor: 'var(--a-border)' }}>
                    <img src={cover.file_url} alt={name} className="w-full aspect-[3/4] object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPreview(cover)} />
                    <div className="absolute top-2 left-2"><StatusBadge status={cover.status} /></div>
                    <div className="p-2 flex flex-col items-center justify-center gap-2 mt-auto">
                      <button onClick={() => handleDelete(cover.id)}
                        className="w-full py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 hover:brightness-110"
                        style={{ background: 'color-mix(in srgb, var(--a-danger) 15%, transparent)', color: 'var(--a-danger)' }}>
                        <Trash2 size={12} /> Çöpe At
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <div className="space-y-6">
        {/* Filter tabs + search + actions */}
        <Toolbar>
          <SegFilter value={filter} onChange={setFilter} options={filterOptions} />
          <SearchInput value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Oyun adı ile ara..." className="w-full sm:w-64" />
          <div className="ml-auto flex items-center gap-2">
            {user.role === 'admin' && duplicates.length > 0 && (
              <Button icon={Copy} onClick={() => setDuplicateModalOpen(true)}>Kopya Tespiti ({duplicates.length})</Button>
            )}
            <IconButton icon={RefreshCw} title="Yenile" spinning={fetching} onClick={fetchCovers} disabled={fetching} />
          </div>
        </Toolbar>

        {/* Upload form (All users can upload now) */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" style={{ background: 'var(--a-accent-soft)' }} />
          <CardHeader title={user.role === 'admin' ? 'Admin Cover Yükle' : 'Yeni Cover Yükle'} icon={Upload} />

          <div className="p-5 md:p-6 relative z-10">
            <form onSubmit={handleUpload} className="flex flex-col lg:flex-row gap-5 items-start lg:items-end">
              <div className="flex-1 w-full lg:min-w-[250px]">
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--a-mut)' }}>Oyun Adı (Opsiyonel)</label>
                <input
                  type="text"
                  value={uploadForm.game_name}
                  onChange={e => setUploadForm({ ...uploadForm, game_name: e.target.value })}
                  placeholder="Örn: Valorant (Boş bırakırsanız dosya adı kullanılır)"
                  className="w-full h-[52px] px-4 rounded-lg border text-sm outline-none transition-colors"
                  style={{ background: 'var(--a-card2)', borderColor: 'var(--a-border)', color: 'var(--a-ink)' }}
                />
              </div>

              <div className="flex-1 w-full lg:min-w-[300px]">
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--a-mut)' }}>Oyun Görseli (JPG/PNG/WEBP)</label>
                <div className="relative flex items-center w-full h-[52px] border border-dashed rounded-lg overflow-hidden transition-all group"
                  style={{ borderColor: uploadForm.files?.length > 0 ? 'var(--a-accent)' : 'var(--a-border)', background: uploadForm.files?.length > 0 ? 'var(--a-accent-soft)' : 'var(--a-card2)' }}>
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    required
                    onChange={e => setUploadForm({ ...uploadForm, files: e.target.files })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center gap-3 px-4 h-full w-full pointer-events-none">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={uploadForm.files?.length > 0 ? { background: 'var(--a-accent)', color: '#04170e' } : { background: 'var(--a-card)', color: 'var(--a-mut)' }}>
                      {uploadForm.files?.length > 0 ? <CheckCircle2 size={16} /> : <Image size={16} />}
                    </div>
                    <span className="text-sm truncate font-medium" style={{ color: uploadForm.files?.length > 0 ? 'var(--a-accent)' : 'var(--a-mut)' }}>
                      {uploadForm.files?.length > 0 ? `${uploadForm.files.length} dosya seçildi` : 'Çoklu görsel seçmek için tıklayın veya sürükleyin...'}
                    </span>
                  </div>
                </div>
              </div>

              <Button type="submit" size="lg" disabled={uploading} className="w-full lg:w-auto">
                {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                Yükle
              </Button>
            </form>

            {/* Progress Bar & Logs Display */}
            {(uploadProgress.active || uploadLogs.length > 0) && (
              <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--a-border)' }}>

                {uploadProgress.active && (
                  <>
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span style={{ color: 'var(--a-accent)' }}>Yükleniyor... ({uploadProgress.current} / {uploadProgress.total})</span>
                      <span style={{ color: 'var(--a-ink)' }}>{Math.round((uploadProgress.current / uploadProgress.total) * 100)}%</span>
                    </div>
                    <ProgressBar value={(uploadProgress.current / uploadProgress.total) * 100} height={10} />

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex gap-4 text-[10px]">
                        <span style={{ color: 'var(--a-ok)' }}>Başarılı: {uploadProgress.success}</span>
                        {uploadProgress.fail > 0 && <span style={{ color: 'var(--a-danger)' }}>Hatalı: {uploadProgress.fail}</span>}
                      </div>

                      {/* İptal Butonu */}
                      {uploading && (
                        <button
                          onClick={() => { cancelUploadRef.current = true; }}
                          className="text-xs px-3 py-1 rounded border transition-colors hover:brightness-110"
                          style={{ color: 'var(--a-danger)', borderColor: 'var(--a-border)' }}
                        >
                          İptal Et
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Log Window */}
                {uploadLogs.length > 0 && (
                  <div className="mt-4 border rounded-lg p-3 h-40 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col-reverse"
                    style={{ background: 'var(--a-bg)', borderColor: 'var(--a-border)' }}>
                    <div>
                      {uploadLogs.map((log, idx) => (
                        <div key={idx} className="mb-1" style={{ color: log.includes('✅') ? 'var(--a-ok)' : log.includes('🛑') ? 'var(--a-warn)' : 'var(--a-danger)' }}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Kapat / Temizle Butonu */}
                {!uploading && uploadLogs.length > 0 && (
                  <Button variant="subtle" className="w-full mt-3"
                    onClick={() => { setUploadLogs([]); setUploadProgress({ active: false, total: 0, current: 0, success: 0, fail: 0 }); }}>
                    Günlükleri Temizle
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Covers Grid */}
        {fetching ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <Card><EmptyState icon={Image} title="Bu kategoride cover bulunamadı." /></Card>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-4">
            {filtered.map(cover => (
              <div key={cover.id} className="rounded-xl overflow-hidden border group relative" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
                <div className="absolute top-2 right-2 z-10">
                  <input type="checkbox"
                    checked={selectedCovers.includes(cover.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedCovers(prev => [...prev, cover.id]);
                      else setSelectedCovers(prev => prev.filter(id => id !== cover.id));
                    }}
                    className="w-5 h-5 cursor-pointer rounded shadow-sm"
                    style={{ accentColor: 'var(--a-accent)' }}
                  />
                </div>
                <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" style={{ background: 'var(--a-bg)' }} onClick={() => setPreview(cover)}>
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
                          className="w-full text-xs font-bold px-2 py-1 rounded border outline-none"
                          style={{ background: 'var(--a-card2)', borderColor: 'var(--a-border)', color: 'var(--a-ink)' }}
                        />
                        <button onClick={() => handleEditSubmit(cover.id)} className="p-1 rounded hover:brightness-110" style={{ color: 'var(--a-ok)' }}><Check size={14} /></button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-between group/edit cursor-pointer" onClick={() => { if (user.role === 'admin') { setEditingCoverId(cover.id); setEditGameName(cover.game_name); } }}>
                        <p className="text-xs font-bold truncate" style={{ color: 'var(--a-ink)' }} title={cover.game_name}>{cover.game_name}</p>
                        {user.role === 'admin' && <Edit2 size={12} className="opacity-0 group-hover/edit:opacity-100 transition-opacity" style={{ color: 'var(--a-mut)' }} />}
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  {user.role === 'admin' && cover.status !== 'approved' && (
                    <div className="flex gap-1 mt-2">
                      <button onClick={() => handleStatus(cover.id, 'approved')}
                        className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1 hover:brightness-110"
                        style={{ background: 'color-mix(in srgb, var(--a-ok) 15%, transparent)', color: 'var(--a-ok)' }}>
                        <CheckCircle2 size={11} /> Onayla
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {confirmNode}
    </>
  );
};

export default CoversPage;
