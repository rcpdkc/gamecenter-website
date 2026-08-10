import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DatabaseZap, Trash2, Loader2, FolderInput, RefreshCw, Plus, X, CloudUpload } from 'lucide-react';

const API = '/api/mklink_archive?type=shader';

const ShaderArchivePage = () => {
  const context = useOutletContext();
  const dark = context?.dark ?? true;
  const isAdmin = context?.user?.role === 'admin';  // yükleme/silme yalnız admin grubu

  const [archives, setArchives] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Dogrudan ekleme formu
  const [newName, setNewName] = useState('');
  const [newDirs, setNewDirs] = useState(['']);
  const [adding, setAdding] = useState(false);

  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const panelBorder = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';

  const fetchArchives = async () => {
    setFetching(true);
    try {
      const res = await fetch(API);
      const data = await res.json();
      if (data.success) setArchives(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchArchives(); }, []);

  const handleAdd = async () => {
    const name = newName.trim();
    const dirs = newDirs.map(d => (d || '').trim()).filter(Boolean);
    if (!name) { alert('Oyun adı gerekli.'); return; }
    if (dirs.length === 0) { alert('En az bir dizin girin.'); return; }
    setAdding(true);
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: `${name} shader cache dizinleri`, data_json: { game_name: name, cache_dirs: dirs } })
      });
      const data = await res.json();
      if (data.success) {
        setNewName(''); setNewDirs(['']);
        fetchArchives();
      } else {
        alert(data.error || 'Eklenemedi');
      }
    } catch {
      alert('Bağlantı hatası');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu shader dizin kaydını arşivden silmek istiyor musunuz?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(API, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) setArchives(prev => prev.filter(a => a.id !== id));
      else alert(data.error || 'Silinemedi');
    } catch {
      alert('Bağlantı hatası');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className={`text-sm ${sub}`}>
          Oyun adına göre shader cache <b>dizin yolları</b> (cache dosyaları değil). Kafeler bu yolları
          "Buluttan Getir" ile çeker. Toplam: <b className={txt}>{archives.length}</b>
        </p>
        <button onClick={fetchArchives}
          className={`h-9 px-4 rounded-lg border ${panelBorder} ${sub} hover:${txt} text-sm font-semibold flex items-center gap-2`}>
          <RefreshCw size={15} className={fetching ? 'animate-spin' : ''} />Yenile
        </button>
      </div>

      {/* Dogrudan ekleme formu — YALNIZ admin grubu */}
      {isAdmin && (
      <div className={`${bg} border ${panelBorder} rounded-2xl p-5`}>
        <div className="flex items-center gap-2 mb-3">
          <CloudUpload size={18} className="text-sky-400" />
          <h3 className={`font-bold ${txt}`}>Yeni Kayıt Ekle</h3>
          <span className={`text-xs ${sub}`}>oyun adı + shader cache dizin(ler)i</span>
        </div>
        <div className="space-y-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)}
            placeholder="Oyun adı — ör: Forza Horizon 5"
            className={`w-full h-10 px-3 rounded-lg border ${panelBorder} ${dark ? 'bg-black/20' : 'bg-gray-50'} ${txt} text-sm outline-none focus:border-sky-500`} />
          <div className="space-y-2">
            {newDirs.map((d, i) => (
              <div key={i} className="flex gap-2">
                <input value={d}
                  onChange={(e) => setNewDirs(arr => arr.map((v, j) => j === i ? e.target.value : v))}
                  placeholder={`Dizin ${i + 1} — ör: %LocalAppData%\\ForzaHorizon5`}
                  className={`flex-1 h-10 px-3 rounded-lg border ${panelBorder} ${dark ? 'bg-black/20' : 'bg-gray-50'} ${txt} text-sm font-mono outline-none focus:border-sky-500`} />
                {newDirs.length > 1 && (
                  <button onClick={() => setNewDirs(arr => arr.filter((_, j) => j !== i))}
                    className="w-10 h-10 shrink-0 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center"><X size={15} /></button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setNewDirs(arr => [...arr, ''])}
              className={`h-9 px-3 rounded-lg border ${panelBorder} ${sub} hover:${txt} text-xs font-semibold flex items-center gap-1.5`}>
              <Plus size={14} />Dizin Ekle
            </button>
            <button onClick={handleAdd} disabled={adding}
              className="h-9 px-5 rounded-lg bg-sky-600 text-white text-sm font-bold flex items-center gap-2 hover:brightness-110 disabled:opacity-60 ml-auto">
              {adding ? <Loader2 size={15} className="animate-spin" /> : <CloudUpload size={15} />}Arşive Ekle
            </button>
          </div>
          <p className={`text-[11px] ${sub}`}>İpucu: Kullanıcı adı değişebileceği için <code>C:\Users\User\...</code> yerine <code>%LocalAppData%\...</code> kullanın (her PC'de kendi hesabına açılır). Aynı oyun adı varsa üzerine yazılır.</p>
        </div>
      </div>
      )}

      {fetching ? (
        <div className={`flex items-center justify-center gap-2 py-16 ${sub}`}>
          <Loader2 size={18} className="animate-spin" />Yükleniyor…
        </div>
      ) : archives.length === 0 ? (
        <div className={`${bg} border ${panelBorder} rounded-2xl py-16 text-center ${sub}`}>
          <DatabaseZap size={40} className="mx-auto mb-3 opacity-40" />
          Arşivde henüz shader dizin kaydı yok. Kafeler "Buluta Yükle" ile ekledikçe burada görünür.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {archives.map(arch => {
            const dirs = arch?.data_json?.cache_dirs || [];
            return (
              <div key={arch.id} className={`${bg} border ${panelBorder} rounded-2xl p-5`}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
                    <DatabaseZap size={18} className="text-sky-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold ${txt} truncate`}>{arch.name}</h3>
                    <p className={`text-xs ${sub} mt-0.5`}>
                      {dirs.length} konum · {arch.created_at ? new Date(arch.created_at).toLocaleString('tr-TR') : ''}
                    </p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => handleDelete(arch.id)} disabled={deletingId === arch.id}
                      className="w-9 h-9 shrink-0 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center" title="Sil">
                      {deletingId === arch.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  )}
                </div>
                <div className="mt-3 space-y-1.5">
                  {dirs.map((d, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs ${sub} font-mono break-all`}>
                      <FolderInput size={13} className="shrink-0 text-sky-400/70" />{d}
                    </div>
                  ))}
                  {dirs.length === 0 && <div className={`text-xs ${sub} italic`}>Dizin yok</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ShaderArchivePage;
