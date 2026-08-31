import { useState, useEffect, useCallback } from 'react';
import { Activity, RefreshCw, Plus, Edit2, Trash2, X, Save, Loader2, CheckCircle2, AlertTriangle, XCircle, HelpCircle, Link2, Server } from 'lucide-react';
import { Card, CardHeader, Button, IconButton, Input, StatCard, StatGrid, EmptyState, Loading, useConfirm } from '../admin/ui';

const TONE = {
  ok:      { c: '#10b981', bg: 'rgba(16,185,129,.12)', Icon: CheckCircle2, label: 'Çalışıyor' },
  warn:    { c: '#f59e0b', bg: 'rgba(245,158,11,.12)', Icon: AlertTriangle, label: 'Sorun' },
  down:    { c: '#f43f5e', bg: 'rgba(244,63,94,.12)', Icon: XCircle, label: 'Kesinti' },
  unknown: { c: '#6b7280', bg: 'rgba(107,114,128,.12)', Icon: HelpCircle, label: 'Bilinmiyor' },
};
const BLANK = { id: null, name: '', pub: '', type: 'statuspage', url: '', manual_status: 'ok' };

const AdminServerStatus = () => {
  const [sources, setSources] = useState([]);
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [form, setForm] = useState(BLANK);
  const [busy, setBusy] = useState(false);
  const { confirm, confirmNode } = useConfirm();

  const loadSources = useCallback(async () => {
    try { const r = await fetch('/api/status-sources'); const j = await r.json(); if (j.success) setSources(j.data || []); } catch { /* */ }
  }, []);
  const loadLive = useCallback(async () => {
    setRefreshing(true);
    try { const r = await fetch('/api/status-sources?action=status', { cache: 'no-store' }); const j = await r.json(); if (j.success) setLive(j); } catch { /* */ }
    finally { setRefreshing(false); }
  }, []);

  useEffect(() => { (async () => { setLoading(true); await loadSources(); await loadLive(); setLoading(false); })(); }, [loadSources, loadLive]);

  const save = async () => {
    if (!form.name.trim()) return;
    if (form.type === 'statuspage') {
      if (!form.url.trim()) { alert('Statuspage türü için URL gerekli'); return; }
      if (!/^https?:\/\//i.test(form.url.trim())) { alert('URL http(s):// ile başlamalı'); return; }
    }
    setBusy(true);
    try {
      const method = form.id ? 'PUT' : 'POST';
      const r = await fetch('/api/status-sources', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const j = await r.json();
      if (j.success) { setForm(BLANK); await loadSources(); await loadLive(); } else alert(j.error);
    } catch { alert('Hata'); } finally { setBusy(false); }
  };
  const del = async (s) => {
    if (!(await confirm({ title: 'Kaynağı Sil', message: `"${s.name}" silinsin mi?`, tone: 'danger', confirmLabel: 'Sil' }))) return;
    try { const r = await fetch('/api/status-sources', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id }) }); const j = await r.json(); if (j.success) { await loadSources(); await loadLive(); } } catch { /* */ }
  };

  const games = live?.games || [];

  return (
    <div className="space-y-6">
      {confirmNode}

      <StatGrid cols={3}>
        <StatCard icon={Server} label="Kaynak" value={sources.length} tone="info" />
        <StatCard icon={AlertTriangle} label="Sorunlu" value={live?.warn ?? 0} tone="warn" />
        <StatCard icon={XCircle} label="Kesinti" value={live?.down ?? 0} tone="danger" />
      </StatGrid>

      {/* Canlı durum */}
      <Card className="overflow-hidden">
        <CardHeader title="Canlı Sunucu Durumu" subtitle="Kaynaklardan toplu çekilir" icon={Activity}
          right={<IconButton icon={RefreshCw} title="Yenile" spinning={refreshing} disabled={refreshing} onClick={loadLive} />} />
        <div className="p-4">
          {loading ? <Loading /> : games.length === 0 ? (
            <EmptyState icon={Activity} title="Kaynak ekleyin, durum burada görünsün." />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {games.map(g => {
                const t = TONE[g.status] || TONE.unknown; const Icon = t.Icon;
                return (
                  <div key={g.id} className="rounded-xl p-4 flex items-center gap-3 border"
                    style={{ background: 'var(--a-card2)', borderColor: g.status === 'down' ? 'rgba(244,63,94,.35)' : 'var(--a-border)' }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: t.bg }}>
                      <Icon size={19} style={{ color: t.c }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate" style={{ color: 'var(--a-ink)' }}>{g.name}</div>
                      <div className="text-[11px] truncate" title={g.detail || g.pub || ''} style={{ color: g.detail ? t.c : 'var(--a-mut)' }}>{g.detail || g.pub}</div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: t.c, background: t.bg }}>{g.label || t.label}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Kaynak yönetimi */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1 p-6 h-fit">
          <div className="flex items-center gap-2 font-bold mb-4" style={{ color: 'var(--a-ink)' }}>
            {form.id ? <Edit2 size={16} style={{ color: 'var(--a-accent)' }} /> : <Plus size={16} style={{ color: 'var(--a-accent)' }} />}
            {form.id ? 'Kaynağı Düzenle' : 'Yeni Kaynak'}
          </div>
          <div className="space-y-3">
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Oyun / servis adı" />
            <Input value={form.pub} onChange={e => setForm(f => ({ ...f, pub: e.target.value }))} placeholder="Yayıncı (opsiyonel)" />
            <div className="grid grid-cols-2 gap-2">
              {[['statuspage', 'Statuspage (oto)'], ['manual', 'Manuel (elle)']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => setForm(f => ({ ...f, type: v }))}
                  className="py-2 rounded-lg text-xs font-bold border transition-colors"
                  style={form.type === v ? { background: 'var(--a-accent-soft)', borderColor: 'var(--a-accent)', color: 'var(--a-accent)' } : { borderColor: 'var(--a-border)', color: 'var(--a-mut)' }}>{l}</button>
              ))}
            </div>
            {form.type === 'statuspage' ? (
              <>
                <Input icon={Link2} value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://status.epicgames.com" />
                <p className="text-[11px]" style={{ color: 'var(--a-mut)' }}>Atlassian Statuspage adresi. Sunucu <span className="font-mono">/api/v2/status.json</span> ekler.</p>
              </>
            ) : (
              <>
                <select value={form.manual_status} onChange={e => setForm(f => ({ ...f, manual_status: e.target.value }))}
                  className="w-full h-9 rounded-lg border text-[13px] px-3 outline-none" style={{ background: 'var(--a-card2)', borderColor: 'var(--a-border)', color: 'var(--a-ink)' }}>
                  <option value="ok">🟢 Çalışıyor</option>
                  <option value="warn">🟡 Sorun</option>
                  <option value="down">🔴 Kesinti</option>
                </select>
                <p className="text-[11px]" style={{ color: 'var(--a-mut)' }}>API'si olmayan oyunlar için durumu elle ayarla.</p>
              </>
            )}
            <div className="flex gap-2">
              <Button variant="primary" className="flex-1" disabled={busy} onClick={save}>
                {busy ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />} {form.id ? 'Güncelle' : 'Ekle'}
              </Button>
              {form.id && <Button variant="ghost" onClick={() => setForm(BLANK)}><X size={16} /></Button>}
            </div>
          </div>
        </Card>

        <Card className="xl:col-span-2 overflow-hidden">
          <CardHeader title={`Kaynaklar (${sources.length})`} subtitle="Kafeler 'Buluttan Çek' ile bunları alır" icon={Link2} />
          {loading ? <Loading /> : sources.length === 0 ? <EmptyState icon={Link2} title="Henüz kaynak yok." /> : (
            <div className="divide-y" style={{ borderColor: 'var(--a-border)' }}>
              {sources.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--a-card2)]">
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold truncate" style={{ color: 'var(--a-ink)' }}>{s.name} {s.pub && <span className="text-xs font-normal" style={{ color: 'var(--a-mut)' }}>· {s.pub}</span>}</div>
                    <div className="text-[11px] truncate" style={{ color: 'var(--a-mut)' }}>
                      {s.type === 'manual'
                        ? <>Manuel · {s.manual_status === 'down' ? '🔴 Kesinti' : s.manual_status === 'warn' ? '🟡 Sorun' : '🟢 Çalışıyor'}</>
                        : <span className="font-mono">{s.url}</span>}
                    </div>
                  </div>
                  <button onClick={() => setForm({ id: s.id, name: s.name, pub: s.pub || '', type: s.type || 'statuspage', url: s.url || '', manual_status: s.manual_status || 'ok' })} className="p-2 rounded-lg" style={{ color: '#f59e0b' }}><Edit2 size={15} /></button>
                  <button onClick={() => del(s)} className="p-2 rounded-lg" style={{ color: 'var(--a-danger)' }}><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminServerStatus;
