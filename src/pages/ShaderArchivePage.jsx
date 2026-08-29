import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DatabaseZap, Trash2, Loader2, FolderInput, RefreshCw, Plus, X, CloudUpload } from 'lucide-react';
import { Card, CardHeader, Button, Input, EmptyState, Loading, Toolbar, useToast, useConfirm } from '../admin/ui';

const API = '/api/mklink_archive?type=shader';

const ShaderArchivePage = () => {
  const context = useOutletContext();
  const isAdmin = context?.user?.role === 'admin';  // yükleme/silme yalnız admin grubu

  const [archives, setArchives] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // Dogrudan ekleme formu
  const [newName, setNewName] = useState('');
  const [newDirs, setNewDirs] = useState(['']);
  const [adding, setAdding] = useState(false);

  const { push } = useToast();
  const { confirm, confirmNode } = useConfirm();

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
    if (!name) { push('Oyun adı gerekli.', 'danger'); return; }
    if (dirs.length === 0) { push('En az bir dizin girin.', 'danger'); return; }
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
        push('Kayıt arşive eklendi.', 'ok');
        fetchArchives();
      } else {
        push(data.error || 'Eklenemedi', 'danger');
      }
    } catch {
      push('Bağlantı hatası', 'danger');
    } finally {
      setAdding(false);
    }
  };

  const doDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(API, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        setArchives(prev => prev.filter(a => a.id !== id));
        push('Kayıt silindi.', 'ok');
      } else {
        push(data.error || 'Silinemedi', 'danger');
      }
    } catch {
      push('Bağlantı hatası', 'danger');
    } finally {
      setDeletingId(null);
    }
  };

  const askDelete = async (arch) => {
    const ok = await confirm({
      title: 'Kaydı sil',
      message: `${arch.name} shader dizin kaydını arşivden silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      tone: 'danger',
      confirmLabel: 'Sil',
    });
    if (ok) doDelete(arch.id);
  };

  return (
    <div className="space-y-5">
      <Toolbar>
        <span className="text-sm" style={{ color: 'var(--a-mut)' }}>
          Oyun adına göre shader cache dizin yolları · Toplam: <b style={{ color: 'var(--a-ink)' }}>{archives.length}</b>
        </span>
        <div className="ml-auto">
          <Button variant="ghost" onClick={fetchArchives}>
            <RefreshCw size={15} className={fetching ? 'animate-spin' : ''} />Yenile
          </Button>
        </div>
      </Toolbar>

      {/* Dogrudan ekleme formu — YALNIZ admin grubu */}
      {isAdmin && (
        <Card>
          <CardHeader title="Yeni Kayıt Ekle" subtitle="oyun adı + shader cache dizin(ler)i" icon={CloudUpload} />
          <div className="p-5 space-y-3">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)}
              placeholder="Oyun adı — ör: Forza Horizon 5" />
            <div className="space-y-2">
              {newDirs.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <input value={d}
                    onChange={(e) => setNewDirs(arr => arr.map((v, j) => j === i ? e.target.value : v))}
                    placeholder={`Dizin ${i + 1} — ör: %LocalAppData%\\ForzaHorizon5`}
                    className="flex-1 h-9 px-3 rounded-lg border text-[13px] font-mono outline-none transition-colors"
                    style={{ background: 'var(--a-card2)', borderColor: 'var(--a-border)', color: 'var(--a-ink)' }} />
                  {newDirs.length > 1 && (
                    <button onClick={() => setNewDirs(arr => arr.filter((_, j) => j !== i))}
                      className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-colors hover:brightness-110"
                      style={{ background: 'color-mix(in srgb, var(--a-danger) 15%, transparent)', color: 'var(--a-danger)' }}><X size={15} /></button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" icon={Plus} onClick={() => setNewDirs(arr => [...arr, ''])}>Dizin Ekle</Button>
              <Button onClick={handleAdd} disabled={adding} className="ml-auto" style={{ background: 'var(--a-info)', color: '#fff' }}>
                {adding ? <Loader2 size={15} className="animate-spin" /> : <CloudUpload size={15} />}Arşive Ekle
              </Button>
            </div>
            <p className="text-[11px]" style={{ color: 'var(--a-mut)' }}>İpucu: Kullanıcı adı değişebileceği için <code>C:\Users\User\...</code> yerine <code>%LocalAppData%\...</code> kullanın (her PC'de kendi hesabına açılır). Aynı oyun adı varsa üzerine yazılır.</p>
          </div>
        </Card>
      )}

      {fetching ? (
        <Loading label="Yükleniyor…" />
      ) : archives.length === 0 ? (
        <Card>
          <EmptyState icon={DatabaseZap}
            title="Arşivde henüz shader dizin kaydı yok."
            hint={'Kafeler "Buluta Yükle" ile ekledikçe burada görünür.'} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {archives.map(arch => {
            const dirs = arch?.data_json?.cache_dirs || [];
            return (
              <Card key={arch.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--a-info) 15%, transparent)' }}>
                    <DatabaseZap size={18} style={{ color: 'var(--a-info)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold truncate" style={{ color: 'var(--a-ink)' }}>{arch.name}</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--a-mut)' }}>
                      {dirs.length} konum · {arch.created_at ? new Date(arch.created_at).toLocaleString('tr-TR') : ''}
                    </p>
                  </div>
                  {isAdmin && (
                    <button onClick={() => askDelete(arch)} disabled={deletingId === arch.id}
                      className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-colors hover:brightness-110 disabled:opacity-60"
                      style={{ background: 'color-mix(in srgb, var(--a-danger) 15%, transparent)', color: 'var(--a-danger)' }} title="Sil">
                      {deletingId === arch.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  )}
                </div>
                <div className="mt-3 space-y-1.5">
                  {dirs.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-mono break-all" style={{ color: 'var(--a-mut)' }}>
                      <FolderInput size={13} className="shrink-0" style={{ color: 'var(--a-info)' }} />{d}
                    </div>
                  ))}
                  {dirs.length === 0 && <div className="text-xs italic" style={{ color: 'var(--a-mut)' }}>Dizin yok</div>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {confirmNode}
    </div>
  );
};

export default ShaderArchivePage;
