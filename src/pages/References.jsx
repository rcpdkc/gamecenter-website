import { useState, useEffect } from 'react';
import { Key, Mail, Send, Loader2, CheckCircle2, Copy, RefreshCw, Clock, Trash2 } from 'lucide-react';
import { Card, CardHeader, Button, IconButton, Input, StatCard, StatGrid, Badge, EmptyState, Loading, useConfirm } from '../admin/ui';

const References = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [refs, setRefs] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [newCode, setNewCode] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const { confirm, confirmNode } = useConfirm();

  const fetchReferences = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/references');
      const data = await res.json();
      if (data.success) setRefs(data.data);
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchReferences(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setNewCode(null);
    try {
      const res = await fetch('/api/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) { setNewCode(data.code); setEmail(''); fetchReferences(); }
      else alert(data.error);
    } catch { alert("Hata oluştu."); }
    finally { setLoading(false); }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!(await confirm({ title: 'Referans Kodunu Sil', message: 'Bu referans kodunu silmek istediğinize emin misiniz?', tone: 'danger', confirmLabel: 'Sil' }))) return;
    try {
      const res = await fetch('/api/references', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) fetchReferences();
      else alert(data.error);
    } catch { alert('Silme işlemi başarısız.'); }
  };

  const used = refs.filter(r => r.is_used).length;
  const pending = refs.filter(r => !r.is_used).length;

  return (
    <div className="space-y-6">
      {confirmNode}
      {/* Top Stats */}
      <StatGrid cols={3}>
        <StatCard icon={Key} label="Toplam Kod" value={refs.length} tone="info" />
        <StatCard icon={Clock} label="Bekliyor" value={pending} tone="ok" />
        <StatCard icon={CheckCircle2} label="Kullanıldı" value={used} tone="mut" />
      </StatGrid>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Create Code Panel */}
        <Card className="xl:col-span-1 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--a-accent-soft)' }}>
              <Key size={18} style={{ color: 'var(--a-accent)' }} />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--a-ink)' }}>Yeni Referans Üret</h3>
              <p className="text-xs" style={{ color: 'var(--a-mut)' }}>E-postaya özel davet kodu</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--a-mut)' }}>Kafenin E-Posta Adresi</label>
              <Input
                icon={Mail}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="kafe@mail.com"
                required
              />
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              {loading ? 'Üretiliyor...' : 'Üret ve Kaydet'}
            </Button>
          </form>

          {/* Success card */}
          {newCode && (
            <div className="mt-5 p-4 rounded-xl border"
              style={{ background: 'color-mix(in srgb, var(--a-ok) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--a-ok) 28%, transparent)' }}>
              <p className="text-xs font-semibold flex items-center gap-1 mb-2" style={{ color: 'var(--a-ok)' }}>
                <CheckCircle2 size={13} /> Kod Üretildi!
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-lg font-bold" style={{ color: 'var(--a-ok)' }}>{newCode}</code>
                <button
                  onClick={() => copyToClipboard(newCode, 'new')}
                  className="p-2 rounded-lg transition-colors hover:brightness-110"
                  style={{ background: 'color-mix(in srgb, var(--a-ok) 20%, transparent)', color: 'var(--a-ok)' }}
                >
                  {copiedId === 'new' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--a-ok)', opacity: 0.7 }}>Bu kodu kopyalayıp kafenizle paylaşın.</p>
            </div>
          )}
        </Card>

        {/* Codes Table */}
        <Card className="xl:col-span-2 overflow-hidden">
          <CardHeader title="Tüm Referans Kodları" subtitle="Geçmiş ve bekleyen davetler" icon={Key}
            right={<IconButton icon={RefreshCw} title="Yenile" spinning={fetching} disabled={fetching} onClick={fetchReferences} />} />

          {fetching ? (
            <Loading />
          ) : refs.length === 0 ? (
            <EmptyState icon={Key} title="Henüz hiç referans kodu üretilmedi." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ background: 'var(--a-card2)' }}>
                    {['E-Posta', 'Referans Kodu', 'Durum'].map(h => (
                      <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--a-mut)' }}>{h}</th>
                    ))}
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: 'var(--a-mut)' }}>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {refs.map(ref => (
                    <tr key={ref.id} className="border-t border-[var(--a-border)] hover:bg-[var(--a-card2)] transition-colors">
                      <td className="px-6 py-3.5 font-medium" style={{ color: 'var(--a-ink)' }}>{ref.email}</td>
                      <td className="px-6 py-3.5">
                        <code className="font-mono font-bold text-sm" style={{ color: 'var(--a-accent)' }}>{ref.code}</code>
                      </td>
                      <td className="px-6 py-3.5">
                        {ref.is_used ? (
                          <Badge tone="mut" dot>Kullanıldı</Badge>
                        ) : (
                          <Badge tone="ok" dot>Bekliyor</Badge>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {!ref.is_used && (
                            <IconButton
                              icon={copiedId === ref.id ? CheckCircle2 : Copy}
                              title="Kopyala"
                              onClick={() => copyToClipboard(ref.code, ref.id)}
                            />
                          )}
                          <button
                            onClick={() => handleDelete(ref.id)}
                            title="Sil"
                            className="w-8 h-8 grid place-items-center rounded-lg transition-colors hover:bg-[var(--a-card2)]"
                            style={{ color: 'var(--a-danger)' }}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default References;
