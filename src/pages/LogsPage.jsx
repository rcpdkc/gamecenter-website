import { useState, useEffect, useCallback } from 'react';
import { ScrollText, RefreshCw, Trash2, Search, Filter, X, ShieldAlert, ShieldCheck, Mail, KeyRound, AlertTriangle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const EVENT_META = {
  PASSWORD_RESET_REQUEST:         { label: 'Şifre Sıfırlama İsteği',  color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20',    icon: KeyRound },
  PASSWORD_RESET_SUCCESS:         { label: 'Şifre Sıfırlandı',         color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: ShieldCheck },
  PASSWORD_RESET_MAIL_FAILED:     { label: 'Mail Gönderilemedi',       color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',       icon: Mail },
  PASSWORD_RESET_REQUEST_UNKNOWN: { label: 'Bilinmeyen E-posta',       color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/20', icon: AlertTriangle },
  PASSWORD_RESET_INVALID_TOKEN:   { label: 'Geçersiz Token',           color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',       icon: ShieldAlert },
  PASSWORD_RESET_ERROR:           { label: 'Sıfırlama Hatası',         color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/20',       icon: AlertTriangle },
};

const DEFAULT_META = { label: null, color: 'text-gray-400', bg: 'bg-white/5 border-white/10', icon: ScrollText };

function getMeta(event) {
  return EVENT_META[event] || DEFAULT_META;
}

function formatDate(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const LogsPage = () => {
  const { dark } = useOutletContext?.() || { dark: true };

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchEvent, setSearchEvent] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const bg    = dark ? 'bg-[#111827]' : 'bg-white';
  const border = dark ? 'border-white/5' : 'border-gray-100';
  const txt   = dark ? 'text-white' : 'text-gray-900';
  const sub   = dark ? 'text-gray-400' : 'text-gray-500';
  const inputCls = `px-3 py-2 rounded-xl text-sm border focus:outline-none ${dark ? 'bg-white/5 border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`;

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
    setDeleting(true);
    const token = localStorage.getItem('gc_admin_token');
    await fetch('/api/me?view=logs', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    setLogs([]);
    setConfirmClear(false);
    setDeleting(false);
  };

  return (
    <div className="space-y-6">

      {/* Üst bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className={`text-xs ${sub} mt-1`}>{logs.length} kayıt gösteriliyor</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLogs} className={`p-2 rounded-xl transition-colors ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
            <RefreshCw size={15} />
          </button>
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400">Tümünü sil?</span>
              <button onClick={clearAll} disabled={deleting} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg font-medium">
                {deleting ? 'Siliniyor...' : 'Evet'}
              </button>
              <button onClick={() => setConfirmClear(false)} className="p-1 text-gray-400 hover:text-gray-200"><X size={14}/></button>
            </div>
          ) : (
            <button onClick={() => setConfirmClear(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs rounded-xl transition-colors">
              <Trash2 size={13} /> Tümünü Temizle
            </button>
          )}
        </div>
      </div>

      {/* Filtreler */}
      <div className={`${bg} border ${border} rounded-2xl p-4 flex flex-wrap gap-3 items-center`}>
        <Filter size={14} className={sub} />
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${sub}`} />
          <input
            value={searchEmail}
            onChange={e => setSearchEmail(e.target.value)}
            className={`${inputCls} w-full pl-8`}
            placeholder="E-posta filtrele..."
          />
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${sub}`} />
          <input
            value={searchEvent}
            onChange={e => setSearchEvent(e.target.value)}
            className={`${inputCls} w-full pl-8`}
            placeholder="Olay filtrele (ör: RESET)..."
          />
        </div>
        <button
          onClick={fetchLogs}
          className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-xl font-medium transition-colors"
        >
          Filtrele
        </button>
        {(searchEmail || searchEvent) && (
          <button onClick={() => { setSearchEmail(''); setSearchEvent(''); }} className={`text-xs ${sub} hover:text-white flex items-center gap-1`}>
            <X size={12} /> Temizle
          </button>
        )}
      </div>

      {/* Log Listesi */}
      <div className={`${bg} border ${border} rounded-2xl overflow-hidden`}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ScrollText size={36} className="text-gray-700" />
            <p className={`${sub} text-sm`}>Henüz kayıt yok</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map(log => {
              const meta = getMeta(log.event);
              const Icon = meta.icon;
              return (
                <div key={log.id} className={`flex items-start gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors group`}>
                  {/* İkon */}
                  <div className={`mt-0.5 p-1.5 rounded-lg border ${meta.bg} shrink-0`}>
                    <Icon size={13} className={meta.color} />
                  </div>

                  {/* İçerik */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold ${meta.color}`}>
                        {meta.label || log.event}
                      </span>
                      {log.email && (
                        <span className={`text-xs ${sub} truncate`}>{log.email}</span>
                      )}
                    </div>
                    {log.details && (
                      <p className={`text-xs ${sub} mt-0.5 truncate`}>{log.details}</p>
                    )}
                    {log.ip && (
                      <p className="text-xs text-gray-600 mt-0.5 font-mono">{log.ip}</p>
                    )}
                  </div>

                  {/* Tarih + Sil */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-600">{formatDate(log.created_at)}</span>
                    <button
                      onClick={() => deleteLog(log.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage;
