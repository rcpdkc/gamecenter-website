import { useState, useEffect } from 'react';
import { KeyRound, Plus, Loader2, CheckCircle2, Copy, RefreshCw, Clock, XCircle, Trash2 } from 'lucide-react';
import { Card, CardHeader, Button, IconButton, Input, StatCard, StatGrid, Badge, EmptyState, Loading, useConfirm } from '../admin/ui';

const fmt = (t) => { try { return new Date(t).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return '—'; } };

const AdminResetCodes = () => {
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [newCode, setNewCode] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const { confirm, confirmNode } = useConfirm();

  const load = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/reset-codes');
      const data = await res.json();
      if (data.success) setRows(data.data);
    } catch (e) { console.error(e); }
    finally { setFetching(false); }
  };
  useEffect(() => { load(); }, []);

  const generate = async () => {
    setLoading(true); setNewCode(null);
    try {
      const res = await fetch('/api/reset-codes', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: note.trim() })
      });
      const data = await res.json();
      if (data.success) { setNewCode(data.code); setNote(''); load(); }
      else alert(data.error);
    } catch { alert('Hata oluştu.'); }
    finally { setLoading(false); }
  };

  const copy = (text, id) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };

  const del = async (id) => {
    if (!(await confirm({ title: 'Kodu Sil', message: 'Bu sıfırlama kodunu silmek istediğinize emin misiniz?', tone: 'danger', confirmLabel: 'Sil' }))) return;
    try {
      const res = await fetch('/api/reset-codes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      const data = await res.json();
      if (data.success) load(); else alert(data.error);
    } catch { alert('Silme başarısız.'); }
  };

  const statusOf = (r) => r.used ? 'used' : (r.active ? 'active' : 'expired');
  const active = rows.filter(r => statusOf(r) === 'active').length;
  const used = rows.filter(r => r.used).length;

  return (
    <div className="space-y-6">
      {confirmNode}
      <StatGrid cols={3}>
        <StatCard icon={KeyRound} label="Toplam Kod" value={rows.length} tone="info" />
        <StatCard icon={Clock} label="Aktif (1 saat)" value={active} tone="ok" />
        <StatCard icon={CheckCircle2} label="Kullanıldı" value={used} tone="mut" />
      </StatGrid>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Üret */}
        <Card className="xl:col-span-1 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--a-accent-soft)' }}>
              <KeyRound size={18} style={{ color: 'var(--a-accent)' }} />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--a-ink)' }}>Sıfırlama Kodu Üret</h3>
              <p className="text-xs" style={{ color: 'var(--a-mut)' }}>Tek kullanımlık · 1 saat geçerli</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--a-mut)' }}>Not <span style={{ opacity: 0.6, textTransform: 'none' }}>(hangi kafe — opsiyonel)</span></label>
              <Input value={note} onChange={e => setNote(e.target.value)} placeholder="örn: Yıldırım Net" />
            </div>
            <Button variant="primary" className="w-full" disabled={loading} onClick={generate}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              {loading ? 'Üretiliyor...' : 'Kod Üret'}
            </Button>
          </div>

          {newCode && (
            <div className="mt-5 p-4 rounded-xl border"
              style={{ background: 'color-mix(in srgb, var(--a-ok) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--a-ok) 28%, transparent)' }}>
              <p className="text-xs font-semibold flex items-center gap-1 mb-2" style={{ color: 'var(--a-ok)' }}>
                <CheckCircle2 size={13} /> Kod Üretildi! (1 saat)
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-lg font-bold" style={{ color: 'var(--a-ok)' }}>{newCode}</code>
                <button onClick={() => copy(newCode, 'new')} className="p-2 rounded-lg transition-colors hover:brightness-110"
                  style={{ background: 'color-mix(in srgb, var(--a-ok) 20%, transparent)', color: 'var(--a-ok)' }}>
                  {copiedId === 'new' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--a-ok)', opacity: 0.7 }}>Bu kodu kafenin adminine verin — yerel panelde "Şifremi unuttum" ile kullanır.</p>
            </div>
          )}
        </Card>

        {/* Liste */}
        <Card className="xl:col-span-2 overflow-hidden">
          <CardHeader title="Sıfırlama Kodları" subtitle="Tek kullanımlık · 1 saat" icon={KeyRound}
            right={<IconButton icon={RefreshCw} title="Yenile" spinning={fetching} disabled={fetching} onClick={load} />} />

          {fetching ? <Loading /> : rows.length === 0 ? (
            <EmptyState icon={KeyRound} title="Henüz kod üretilmedi." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ background: 'var(--a-card2)' }}>
                    {['Kod', 'Not', 'Durum', 'Üretilme'].map(h => (
                      <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--a-mut)' }}>{h}</th>
                    ))}
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--a-mut)' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => {
                    const st = statusOf(r);
                    return (
                      <tr key={r.id} className="border-t border-[var(--a-border)] hover:bg-[var(--a-card2)] transition-colors">
                        <td className="px-6 py-3.5"><code className="font-mono font-bold text-sm" style={{ color: 'var(--a-accent)' }}>{r.code}</code></td>
                        <td className="px-6 py-3.5" style={{ color: 'var(--a-mut)' }}>{r.note || '—'}</td>
                        <td className="px-6 py-3.5">
                          {st === 'used' ? <Badge tone="mut" dot>Kullanıldı</Badge>
                            : st === 'expired' ? <Badge tone="warn" dot>Süresi doldu</Badge>
                            : <Badge tone="ok" dot>Aktif</Badge>}
                        </td>
                        <td className="px-6 py-3.5 text-xs" style={{ color: 'var(--a-mut)' }}>{fmt(r.created_at)}</td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center justify-end gap-2">
                            {st === 'active' && <IconButton icon={copiedId === r.id ? CheckCircle2 : Copy} title="Kopyala" onClick={() => copy(r.code, r.id)} />}
                            <button onClick={() => del(r.id)} title="Sil" className="w-8 h-8 grid place-items-center rounded-lg transition-colors hover:bg-[var(--a-card2)]" style={{ color: 'var(--a-danger)' }}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminResetCodes;
