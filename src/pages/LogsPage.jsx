import { useState, useEffect, useCallback } from 'react';
import { ScrollText, RefreshCw, Trash2, Search, Filter, X, ShieldAlert, ShieldCheck, Mail, KeyRound, AlertTriangle } from 'lucide-react';
import { Card, Button, IconButton, Input, EmptyState, Toolbar, Loading, useConfirm, toneColor } from '../admin/ui';

const EVENT_META = {
  PASSWORD_RESET_REQUEST:         { label: 'Şifre Sıfırlama İsteği',  tone: 'info',   icon: KeyRound },
  PASSWORD_RESET_SUCCESS:         { label: 'Şifre Sıfırlandı',         tone: 'ok',     icon: ShieldCheck },
  PASSWORD_RESET_MAIL_FAILED:     { label: 'Mail Gönderilemedi',       tone: 'danger', icon: Mail },
  PASSWORD_RESET_REQUEST_UNKNOWN: { label: 'Bilinmeyen E-posta',       tone: 'warn',   icon: AlertTriangle },
  PASSWORD_RESET_INVALID_TOKEN:   { label: 'Geçersiz Token',           tone: 'danger', icon: ShieldAlert },
  PASSWORD_RESET_ERROR:           { label: 'Sıfırlama Hatası',         tone: 'danger', icon: AlertTriangle },
};

const DEFAULT_META = { label: null, tone: 'mut', icon: ScrollText };

function getMeta(event) {
  return EVENT_META[event] || DEFAULT_META;
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchEvent, setSearchEvent] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { confirm, confirmNode } = useConfirm();

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const token = localStorage.getItem('gc_admin_token');
    const params = new URLSearchParams({ view: 'logs', limit: '300' });
    if (searchEmail) params.set('email', searchEmail);
    if (searchEvent) params.set('event', searchEvent);
    fetch(`/api/me?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => { setLogs(j.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [searchEmail, searchEvent]);

  useEffect(() => { fetchLogs(); }, []);

  const deleteLog = async (id) => {
    const token = localStorage.getItem('gc_admin_token');
    await fetch(`/api/me?view=logs&id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  const clearAll = async () => {
    const ok = await confirm({
      title: 'Tüm loglar silinsin mi?',
      message: 'Bu işlem geri alınamaz. Tüm kayıtlar kalıcı olarak silinecek.',
      tone: 'danger',
      confirmLabel: 'Tümünü Sil',
    });
    if (!ok) return;
    setDeleting(true);
    const token = localStorage.getItem('gc_admin_token');
    await fetch('/api/me?view=logs', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setLogs([]);
    setDeleting(false);
  };

  return (
    <div>

      {/* Üst bar */}
      <Toolbar>
        <p className="text-xs" style={{ color: 'var(--a-mut)' }}>{logs.length} kayıt gösteriliyor</p>
        <div className="ml-auto flex items-center gap-2">
          <IconButton icon={RefreshCw} onClick={fetchLogs} title="Yenile" />
          <Button variant="danger" size="sm" icon={Trash2} onClick={clearAll} disabled={deleting}>
            {deleting ? 'Siliniyor...' : 'Tümünü Temizle'}
          </Button>
        </div>
      </Toolbar>

      {/* Filtreler */}
      <Card className="p-4 flex flex-wrap gap-3 items-center mb-6">
        <Filter size={14} style={{ color: 'var(--a-mut)' }} />
        <Input
          icon={Search}
          value={searchEmail}
          onChange={e => setSearchEmail(e.target.value)}
          className="flex-1 min-w-[200px]"
          placeholder="E-posta filtrele..."
        />
        <Input
          icon={Search}
          value={searchEvent}
          onChange={e => setSearchEvent(e.target.value)}
          className="flex-1 min-w-[200px]"
          placeholder="Olay filtrele (ör: RESET)..."
        />
        <Button size="sm" onClick={fetchLogs}>Filtrele</Button>
        {(searchEmail || searchEvent) && (
          <Button variant="ghost" size="sm" icon={X} onClick={() => { setSearchEmail(''); setSearchEvent(''); }}>Temizle</Button>
        )}
      </Card>

      {/* Log Listesi */}
      <Card className="overflow-hidden">
        {loading ? (
          <Loading />
        ) : logs.length === 0 ? (
          <EmptyState icon={ScrollText} title="Henüz kayıt yok" />
        ) : (
          <div className="divide-y divide-[var(--a-border)]">
            {logs.map(log => {
              const meta = getMeta(log.event);
              const Icon = meta.icon;
              const c = toneColor(meta.tone);
              return (
                <div key={log.id} className="flex items-start gap-4 px-5 py-3.5 transition-colors group hover:bg-[var(--a-card2)]">
                  {/* İkon */}
                  <div className="mt-0.5 p-1.5 rounded-lg border shrink-0" style={{ background: c + '18', borderColor: c + '33' }}>
                    <Icon size={13} style={{ color: c }} />
                  </div>

                  {/* İçerik */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold" style={{ color: c }}>
                        {meta.label || log.event}
                      </span>
                      {log.email && (
                        <span className="text-xs truncate" style={{ color: 'var(--a-mut)' }}>{log.email}</span>
                      )}
                    </div>
                    {log.details && (
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--a-mut)' }}>{log.details}</p>
                    )}
                    {log.ip && (
                      <p className="text-xs mt-0.5 font-mono" style={{ color: 'var(--a-mut2)' }}>{log.ip}</p>
                    )}
                  </div>

                  {/* Tarih + Sil */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs" style={{ color: 'var(--a-mut2)' }}>{formatDate(log.created_at)}</span>
                    <button
                      onClick={() => deleteLog(log.id)}
                      title="Sil"
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--a-danger)]"
                      style={{ color: 'var(--a-mut2)' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {confirmNode}
    </div>
  );
};

export default LogsPage;
