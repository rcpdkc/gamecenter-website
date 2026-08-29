// ── Cloud Admin — Supabase tarzı paylaşılan bileşen kütüphanesi ──────────────
// Tüm /superadmin sayfaları BURADAN besleniyor: tek token seti (--a-*), sıfır duplicate.
// Renk/tema .gc-admin scope'undan gelir (index.css). Hardcoded renk YOK.
import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { RefreshCw, X, Search, Inbox, AlertTriangle, Check, Info } from 'lucide-react';

// ── Sabitler ──────────────────────────────────────────────────────────────
export const COLORS = ['#3ecf8e', '#3b82f6', '#8b5cf6', '#f59e0b', '#22d3ee', '#f43f5e', '#10b981', '#a78bfa'];
export const ONLINE_MINS = 20; // bu dk içinde heartbeat = çevrimiçi
export const TEMP = { cpu: { warn: 65, hot: 80 }, gpu: { warn: 70, hot: 85 } };
export const tempTone = (t, kind = 'cpu') => {
  if (t == null || isNaN(t)) return 'mut';
  const k = TEMP[kind] || TEMP.cpu;
  return t >= k.hot ? 'danger' : t >= k.warn ? 'warn' : 'ok';
};
const TONE = {
  ok: 'var(--a-ok)', warn: 'var(--a-warn)', danger: 'var(--a-danger)', info: 'var(--a-info)',
  accent: 'var(--a-accent)', mut: 'var(--a-mut)',
};
export const toneColor = (t) => TONE[t] || TONE.mut;

// ── Kafe telemetri hook'u (5 sayfada tekrar eden fetch tek yerde) ───────────
export function useCafeTelemetry(user) {
  const [data, setData] = useState(null);   // null = yükleniyor
  const [error, setError] = useState(false);
  const load = useCallback(async () => {
    if (!user) return;
    const keys = [
      user.cafe_id && `cafe_id=${encodeURIComponent(user.cafe_id)}`,
      user.hwid && `hwid=${encodeURIComponent(user.hwid)}`,
      user.email && `email=${encodeURIComponent(user.email)}`,
    ].filter(Boolean);
    for (const q of keys) {
      try {
        const r = await fetch(`/api/telemetry?role=cafe&${q}`);
        const j = await r.json();
        const row = (j.data || j.rows || (Array.isArray(j) ? j : []))[0];
        if (row) { setData(row); setError(false); return; }
      } catch { /* sonraki anahtarı dene */ }
    }
    setData(null); setError(true);
  }, [user]);
  useEffect(() => { load(); }, [load]);
  return { data, error, reload: load };
}

// ── Toast ───────────────────────────────────────────────────────────────
const ToastCtx = createContext({ push: () => {} });
export const useToast = () => useContext(ToastCtx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const push = useCallback((msg, tone = 'ok') => {
    const id = `${Date.now()}_${Math.round(performance.now())}`;
    setItems((x) => [...x, { id, msg, tone }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[120] flex flex-col gap-2">
        {items.map((i) => {
          const Icon = i.tone === 'danger' ? AlertTriangle : i.tone === 'info' ? Info : Check;
          return (
            <div key={i.id} className="flex items-center gap-2.5 pl-3 pr-4 py-2.5 rounded-lg border text-sm font-medium shadow-lg animate-in slide-in-from-bottom-2"
              style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)', color: 'var(--a-ink)' }}>
              <Icon size={16} style={{ color: toneColor(i.tone) }} /> {i.msg}
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

// ── Primitives ─────────────────────────────────────────────────────────────
export function Spinner({ size = 34 }) {
  return <div className="rounded-full animate-spin"
    style={{ width: size, height: size, border: `3px solid var(--a-border2)`, borderTopColor: 'var(--a-accent)' }} />;
}
export function Loading({ label }) {
  return <div className="flex flex-col items-center justify-center gap-3 py-20"><Spinner />{label && <span className="text-sm" style={{ color: 'var(--a-mut)' }}>{label}</span>}</div>;
}

export function Card({ className = '', children, style, ...p }) {
  return <div className={`rounded-xl border ${className}`} style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)', ...style }} {...p}>{children}</div>;
}
export function CardHeader({ title, subtitle, right, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b" style={{ borderColor: 'var(--a-border)' }}>
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <span className="w-8 h-8 rounded-lg grid place-items-center shrink-0" style={{ background: 'var(--a-accent-soft)' }}><Icon size={16} style={{ color: 'var(--a-accent)' }} /></span>}
        <div className="min-w-0">
          <h3 className="text-sm font-bold truncate" style={{ color: 'var(--a-ink)' }}>{title}</h3>
          {subtitle && <p className="text-xs truncate" style={{ color: 'var(--a-mut)' }}>{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Button({ variant = 'primary', size = 'md', icon: Icon, children, className = '', ...p }) {
  const pad = size === 'sm' ? 'h-8 px-3 text-xs' : size === 'lg' ? 'h-11 px-5 text-sm' : 'h-9 px-4 text-[13px]';
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';
  const styles = {
    primary: { background: 'var(--a-accent)', color: '#04170e' },
    ghost: { background: 'transparent', color: 'var(--a-ink2)', border: '1px solid var(--a-border)' },
    danger: { background: 'var(--a-danger)', color: '#fff' },
    subtle: { background: 'var(--a-card2)', color: 'var(--a-ink2)', border: '1px solid var(--a-border)' },
  };
  return (
    <button className={`${base} ${pad} ${variant === 'primary' ? 'hover:brightness-110' : 'hover:brightness-105'} ${className}`}
      style={styles[variant]} {...p}>
      {Icon && <Icon size={size === 'sm' ? 14 : 16} />}{children}
    </button>
  );
}
export function IconButton({ icon: Icon, title, spinning, className = '', ...p }) {
  return (
    <button title={title} className={`w-8 h-8 grid place-items-center rounded-lg transition-colors hover:bg-[var(--a-card2)] ${className}`}
      style={{ color: 'var(--a-mut)' }} {...p}>
      <Icon size={16} className={spinning ? 'animate-spin' : ''} />
    </button>
  );
}

export function Input({ icon: Icon, className = '', ...p }) {
  return (
    <div className={`relative flex items-center ${className}`}>
      {Icon && <Icon size={15} className="absolute left-3 pointer-events-none" style={{ color: 'var(--a-mut2)' }} />}
      <input {...p}
        className={`w-full h-9 rounded-lg border text-[13px] outline-none transition-colors ${Icon ? 'pl-9 pr-3' : 'px-3'}`}
        style={{ background: 'var(--a-card2)', borderColor: 'var(--a-border)', color: 'var(--a-ink)' }} />
    </div>
  );
}
export function SearchInput(props) { return <Input icon={Search} placeholder="Ara…" {...props} />; }

export function Badge({ tone = 'mut', children, dot }) {
  const c = toneColor(tone);
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
      style={{ color: c, borderColor: c + '55', background: c + '18' }}>
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />}{children}
    </span>
  );
}

export function StatCard({ icon: Icon, label, value, tone = 'accent', hint }) {
  const c = toneColor(tone);
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--a-mut)' }}>{label}</span>
        {Icon && <span className="w-8 h-8 rounded-lg grid place-items-center" style={{ background: c + '18' }}><Icon size={15} style={{ color: c }} /></span>}
      </div>
      <div className="mt-2 text-2xl font-extrabold tabular-nums" style={{ color: 'var(--a-ink)' }}>{value}</div>
      {hint && <div className="text-[11px] mt-0.5" style={{ color: 'var(--a-mut2)' }}>{hint}</div>}
    </Card>
  );
}
export function StatGrid({ children, cols = 4 }) {
  return <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fit, minmax(${cols >= 4 ? 170 : 220}px, 1fr))` }}>{children}</div>;
}

export function ProgressBar({ value = 0, tone = 'accent', height = 6 }) {
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height, background: 'var(--a-border)' }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: toneColor(tone) }} />
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Icon size={38} style={{ color: 'var(--a-mut2)', opacity: 0.5 }} />
      <div className="font-semibold" style={{ color: 'var(--a-ink2)' }}>{title}</div>
      {hint && <div className="text-sm max-w-sm" style={{ color: 'var(--a-mut)' }}>{hint}</div>}
    </div>
  );
}

// ── Modal + Confirm ──────────────────────────────────────────────────────
export function Modal({ open, onClose, title, subtitle, icon: Icon, children, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose}>
      <div className={`w-full ${width} rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95`}
        style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--a-border)' }}>
            {Icon && <span className="w-9 h-9 rounded-xl grid place-items-center" style={{ background: 'var(--a-accent-soft)' }}><Icon size={18} style={{ color: 'var(--a-accent)' }} /></span>}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-extrabold" style={{ color: 'var(--a-ink)' }}>{title}</h2>
              {subtitle && <p className="text-xs" style={{ color: 'var(--a-mut)' }}>{subtitle}</p>}
            </div>
            <IconButton icon={X} onClick={onClose} title="Kapat" />
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function useConfirm() {
  const [state, setState] = useState(null); // { title, message, tone, resolve }
  const confirm = useCallback((opts) => new Promise((resolve) => setState({ ...opts, resolve })), []);
  const node = state && (
    <Modal open onClose={() => { state.resolve(false); setState(null); }} title={state.title} icon={AlertTriangle} width="max-w-md">
      <p className="text-sm mb-6" style={{ color: 'var(--a-mut)' }}>{state.message}</p>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => { state.resolve(false); setState(null); }}>Vazgeç</Button>
        <Button variant={state.tone === 'danger' ? 'danger' : 'primary'} onClick={() => { state.resolve(true); setState(null); }}>{state.confirmLabel || 'Onayla'}</Button>
      </div>
    </Modal>
  );
  return { confirm, confirmNode: node };
}

// ── TopGamesList (4 yerde tekrar eden sıralı tıklama listesi) ───────────────
export function TopGamesList({ games = [], limit = 8 }) {
  const rows = [...games].sort((a, b) => (b.clicks || b.count || 0) - (a.clicks || a.count || 0)).slice(0, limit);
  const max = rows.length ? (rows[0].clicks || rows[0].count || 1) : 1;
  if (!rows.length) return <EmptyState title="Henüz oyun verisi yok" />;
  return (
    <div className="flex flex-col gap-2.5">
      {rows.map((g, i) => {
        const v = g.clicks || g.count || 0;
        return (
          <div key={(g.name || g.game_name || i) + i} className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-lg grid place-items-center text-[11px] font-black shrink-0"
              style={{ background: i < 3 ? 'var(--a-accent-soft)' : 'var(--a-card2)', color: i < 3 ? 'var(--a-accent)' : 'var(--a-mut)' }}>{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[13px] font-medium truncate" style={{ color: 'var(--a-ink)' }}>{g.name || g.game_name || 'Bilinmiyor'}</span>
                <span className="text-xs tabular-nums shrink-0" style={{ color: 'var(--a-mut)' }}>{v}</span>
              </div>
              <ProgressBar value={(v / max) * 100} height={4} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Sıcaklık ölçer (yay/gauge) — 3 kopyanın tek hali ────────────────────────
export function TempGauge({ label, temp, kind = 'cpu' }) {
  const has = temp != null && !isNaN(temp);
  const tone = tempTone(temp, kind);
  const c = toneColor(tone);
  const pct = has ? Math.min(100, Math.max(0, ((temp - 25) / (95 - 25)) * 100)) : 0;
  const R = 30, CIRC = Math.PI * R; // yarım daire
  return (
    <Card className="p-4 flex flex-col items-center">
      <svg width="120" height="70" viewBox="0 0 120 70">
        <path d="M10 62 A 50 50 0 0 1 110 62" fill="none" stroke="var(--a-border)" strokeWidth="9" strokeLinecap="round" />
        <path d="M10 62 A 50 50 0 0 1 110 62" fill="none" stroke={c} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * 157} 157`} />
      </svg>
      <div className="-mt-4 text-2xl font-extrabold tabular-nums" style={{ color: has ? c : 'var(--a-mut2)' }}>{has ? `${Math.round(temp)}°` : 'N/A'}</div>
      <div className="text-xs mt-0.5" style={{ color: 'var(--a-mut)' }}>{label}</div>
    </Card>
  );
}

// ── Sayfa başı araç çubuğu (arama + filtre + aksiyon) ───────────────────────
export function Toolbar({ children }) {
  return <div className="flex items-center gap-2 flex-wrap mb-4">{children}</div>;
}
export function SegFilter({ value, onChange, options }) {
  return (
    <div className="inline-flex rounded-lg border p-0.5" style={{ borderColor: 'var(--a-border)', background: 'var(--a-card2)' }}>
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button key={o.value} onClick={() => onChange(o.value)}
            className="px-3 h-8 rounded-md text-xs font-semibold transition-colors"
            style={on ? { background: 'var(--a-accent)', color: '#04170e' } : { color: 'var(--a-mut)' }}>
            {o.label}{o.count != null && <span className="ml-1.5 opacity-70">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
