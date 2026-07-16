import { useEffect, useState, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import {
  Server, Users, Gamepad2, Cpu, Activity, Clock, TrendingUp,
  Wifi, AlertTriangle, Crown, Zap, Gift, ChevronDown, ChevronUp,
  Monitor, RefreshCw, CircleAlert, Layers, HardDrive, Trash2, X, Link
} from 'lucide-react';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#06b6d4', '#ec4899'];

const PLAN_META = {
  free: { label: 'Free', icon: Gift, color: 'text-gray-400', bg: 'bg-gray-500/10 border-gray-500/20' },
  pro: { label: 'Pro', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  enterprise: { label: 'Enterprise', icon: Crown, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
};

const StatCard = ({ icon: Icon, label, value, color, dark, delta }) => {
  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const border = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';
  return (
    <div className={`${bg} border ${border} rounded-2xl p-5 flex items-start gap-4 shadow-sm`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${sub} mb-1`}>{label}</p>
        <p className={`text-3xl font-bold ${txt} leading-none`}>{value}</p>
        {delta && <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1"><TrendingUp size={12} />{delta}</p>}
      </div>
    </div>
  );
};

// ─── Her kafe için genişletilebilir kart ───────────────────────────────────
const CafeCard = ({ cafe, dark, index, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const panelBorder = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-400' : 'text-gray-500';
  const muted = dark ? 'text-gray-600' : 'text-gray-400';

  const lastUpdated = new Date(cafe.last_updated);
  const minsAgo = Math.round((Date.now() - lastUpdated) / 60000);
  const isOnline = minsAgo < 20;

  const topGames = (cafe.top_games || []).slice(0, 6);
  const gpus = cafe.hardware_stats?.gpus || [];
  const cpus = cafe.hardware_stats?.cpus || [];
  const totalClicks = topGames.reduce((a, g) => a + g.clicks, 0);

  return (
    <div className={`${bg} border ${panelBorder} rounded-2xl shadow-sm overflow-hidden transition-all duration-200`}>
      {/* ── Başlık satırı (her zaman görünür) ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors text-left"
      >
        {/* Sıra numarası */}
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0`}
          style={{ background: COLORS[index % COLORS.length] + '22', color: COLORS[index % COLORS.length] }}>
          {index + 1}
        </span>

        {/* Kafe adı */}
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-sm ${txt} truncate`}>{cafe.cafe_name}</p>
          <p className={`text-xs ${muted} flex items-center gap-1 mt-0.5`}>
            <Clock size={10} />
            {minsAgo < 1 ? 'Az önce' : `${minsAgo} dk önce`}
          </p>
        </div>

        {/* PC sayısı */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Monitor size={14} className="text-blue-400" />
          <span className={`text-sm font-semibold ${txt}`}>{cafe.active_clients}</span>
          <span className={`text-xs ${sub}`}>PC</span>
        </div>

        {/* Top oyun */}
        {topGames[0] && (
          <div className="hidden sm:flex items-center gap-1.5 shrink-0 max-w-[140px]">
            <Gamepad2 size={13} className="text-emerald-400 shrink-0" />
            <span className={`text-xs ${sub} truncate`}>{topGames[0].name}</span>
          </div>
        )}

        {/* GPU */}
        {gpus[0] && (
          <div className="hidden lg:flex items-center gap-1.5 shrink-0 max-w-[150px]">
            <HardDrive size={13} className="text-purple-400 shrink-0" />
            <span className={`text-xs ${sub} truncate`}>{gpus[0].name}</span>
          </div>
        )}

        {/* Online badge */}
        <span className={`hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${
          isOnline
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
          {isOnline ? 'Çevrimiçi' : 'Pasif'}
        </span>

        {/* Sil butonu */}
        <button
          onClick={e => { e.stopPropagation(); setConfirmDelete(true); }}
          className="shrink-0 p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          title="Kafeyi sil"
        >
          <Trash2 size={14} />
        </button>

        {/* Aç/kapat */}
        {open ? <ChevronUp size={16} className={sub} /> : <ChevronDown size={16} className={sub} />}
      </button>

      {/* Silme onayı dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className={`${bg} border ${panelBorder} rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4`}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <p className={`font-bold text-sm ${txt}`}>Kafeyi Sil</p>
                <p className={`text-xs ${sub} mt-1`}>
                  <span className="font-semibold text-red-400">{cafe.cafe_name}</span> kaydı kalıcı olarak silinecek.
                  Sunucu aktifse bir sonraki telemetride tekrar görünür.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  dark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                İptal
              </button>
              <button
                disabled={deleting}
                onClick={async () => {
                  setDeleting(true);
                  try {
                    const token = localStorage.getItem('gc_admin_token');
                    await fetch(`/api/telemetry?hwid=${encodeURIComponent(cafe.hwid || cafe.cafe_id)}`, {
                      method: 'DELETE',
                      headers: { 'Authorization': `Bearer ${token}` },
                    });
                    setConfirmDelete(false);
                    onDelete(cafe.hwid || cafe.cafe_id);
                  } catch (_) {}
                  setDeleting(false);
                }}
                className="flex-1 py-2 rounded-xl text-sm font-bold bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-60"
              >
                {deleting ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detay paneli (genişletilince görünür) ── */}
      {open && (
        <div className={`border-t ${panelBorder} grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x ${dark ? 'divide-white/5' : 'divide-gray-100'}`}>

          {/* En çok oynanan oyunlar */}
          <div className="p-5 lg:col-span-2">
            <p className={`text-xs font-semibold uppercase tracking-widest ${muted} mb-3`}>
              En Çok Oynanan Oyunlar
            </p>
            {topGames.length === 0 ? (
              <p className={`text-sm ${sub}`}>Oyun verisi yok</p>
            ) : (
              <div className="space-y-2">
                {topGames.map((g, i) => {
                  const pct = totalClicks > 0 ? Math.round((g.clicks / totalClicks) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${txt} truncate max-w-[200px]`}>{g.name}</span>
                        <span className={`text-xs ${sub} ml-2 shrink-0`}>{g.clicks.toLocaleString()} tık · %{pct}</span>
                      </div>
                      <div className={`h-1.5 rounded-full ${dark ? 'bg-white/5' : 'bg-gray-100'} overflow-hidden`}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Donanım bilgisi */}
          <div className="p-5">
            <p className={`text-xs font-semibold uppercase tracking-widest ${muted} mb-3`}>Donanım</p>

            {gpus.length > 0 && (
              <div className="mb-4">
                <p className={`text-xs ${sub} mb-1.5 flex items-center gap-1`}>
                  <HardDrive size={11} className="text-purple-400" /> GPU'lar
                </p>
                <div className="space-y-1">
                  {gpus.slice(0, 4).map((g, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className={`text-xs ${txt} truncate max-w-[140px]`}>{g.name}</span>
                      <span className={`text-xs font-bold ml-2 shrink-0`} style={{ color: COLORS[i % COLORS.length] }}>{g.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cpus.length > 0 && (
              <div>
                <p className={`text-xs ${sub} mb-1.5 flex items-center gap-1`}>
                  <Cpu size={11} className="text-blue-400" /> CPU'lar
                </p>
                <div className="space-y-1">
                  {cpus.slice(0, 4).map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className={`text-xs ${txt} truncate max-w-[140px]`}>{c.name}</span>
                      <span className={`text-xs font-bold ml-2 shrink-0 text-blue-400`}>{c.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gpus.length === 0 && cpus.length === 0 && (
              <p className={`text-xs ${sub}`}>Donanım verisi yok</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ===== CAFE DASHBOARD (kafe sahibi - sadece kendi verisi) =====
const TempGauge = ({ value, label, icon: Icon, dark }) => {
  const color = !value ? '#6b7280' : value < 65 ? '#10b981' : value < 80 ? '#f59e0b' : '#ef4444';
  const status = !value ? '—' : value < 65 ? 'Normal' : value < 80 ? 'Yüksek' : 'Kritik';
  const statusColor = !value ? 'text-gray-500' : value < 65 ? 'text-emerald-400' : value < 80 ? 'text-yellow-400' : 'text-red-400';
  const pct = value ? Math.min((value / 110) * 100, 100) : 0;
  const card = dark ? 'bg-[#161b22]' : 'bg-white';
  const border = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-400' : 'text-gray-500';
  return (
    <div className={`${card} border ${border} rounded-2xl p-4 sm:p-5`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color }} />
          <span className={`text-xs font-semibold ${sub}`}>{label}</span>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wide ${statusColor}`}>{status}</span>
      </div>
      <div className="flex items-end gap-1 mb-3">
        <span className="text-3xl sm:text-4xl font-black" style={{ color: value ? color : undefined, opacity: value ? 1 : 0.3 }}>{value ?? '—'}</span>
        {value && <span className={`text-base font-bold ${sub} mb-1`}>°C</span>}
      </div>
      <div className={`h-2 rounded-full ${dark ? 'bg-white/5' : 'bg-gray-100'} overflow-hidden`}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

const CafeDashboard = ({ user, dark }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const card = dark ? 'bg-[#161b22]' : 'bg-white';
  const border = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-400' : 'text-gray-500';
  const muted = dark ? 'text-gray-600' : 'text-gray-400';
  const rowBg = dark ? 'bg-white/[0.03] hover:bg-white/[0.06]' : 'bg-gray-50 hover:bg-gray-100';

  const licenseExpired = user.license_expired;
  const plan = user.plan || 'free';
  const planMeta = PLAN_META[plan] || PLAN_META.free;

  useEffect(() => {
    if (licenseExpired) { setLoading(false); return; }
    const tryFetch = async () => {
      try {
        if (user.cafe_id) {
          const r = await fetch(`/api/telemetry?role=cafe&cafe_id=${user.cafe_id}`);
          const j = await r.json();
          const rec = (j.data||[])[0]||null;
          if (rec) { setData(rec); setLoading(false); return; }
        }
        if (user.hwid) {
          const r = await fetch(`/api/telemetry?hwid=${encodeURIComponent(user.hwid)}`);
          const j = await r.json();
          const rec = (j.data||[])[0]||null;
          if (rec) { setData(rec); setLoading(false); return; }
        }
        if (user.email) {
          const r = await fetch(`/api/telemetry?email=${encodeURIComponent(user.email)}`);
          const j = await r.json();
          setData((j.data||[])[0]||null);
        }
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    tryFetch();
  }, [user.cafe_id, user.hwid, user.email]);

  if (licenseExpired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 p-8">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle size={36} className="text-red-400" />
        </div>
        <h2 className={`text-2xl font-bold ${txt}`}>Lisansınız Sona Erdi</h2>
        <p className={`text-sm ${sub} max-w-sm`}>Game Center Cloud erişiminiz sona ermiştir. Yenileme için sistem yöneticinizle iletişime geçin.</p>
        <div className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">Hesap Askıya Alındı</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className={`text-sm ${sub}`}>Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  const topGames = data?.top_games || [];
  const gpus = data?.hardware_stats?.gpus || [];
  const cpus = data?.hardware_stats?.cpus || [];
  const temps = data?.hardware_stats?.temps || {};
  const cpuTemp = temps.cpu_avg || null;
  const gpuTemp = temps.gpu_avg || null;
  const totalClicks = topGames.reduce((a, g) => a + g.clicks, 0);
  const maxClicks = topGames[0]?.clicks || 1;

  const lastUpdated = data?.last_updated ? new Date(data.last_updated) : null;
  const minsAgo = lastUpdated ? Math.round((Date.now() - lastUpdated) / 60000) : null;
  const isOnline = minsAgo !== null && minsAgo < 20;

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* ── Hero Header ── */}
      <div className={`${card} border ${border} rounded-2xl p-4 sm:p-6`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
              <Server size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <h1 className={`text-lg sm:text-xl font-black ${txt} truncate`}>{user.cafe_name || 'Kafeniz'}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                  {isOnline ? 'Çevrimiçi' : 'Pasif'}
                </span>
                {minsAgo !== null && (
                  <span className={`text-[11px] ${muted} flex items-center gap-1`}>
                    <Clock size={9} />
                    {minsAgo < 1 ? 'Az önce' : `${minsAgo} dk önce`}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${planMeta.bg} ${planMeta.color}`}>
            <planMeta.icon size={12} />
            {planMeta.label} Plan
            {user.plan_expires_at && <span className="opacity-70 hidden sm:inline"> · {new Date(user.plan_expires_at).toLocaleDateString('tr-TR')}</span>}
          </div>
        </div>
      </div>

      {/* ── 4 Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { icon: Monitor, label: 'Aktif PC', value: data?.active_clients ?? '—', color: 'blue', from: 'from-blue-500', to: 'to-blue-600', glow: 'shadow-blue-500/20', bg: 'bg-blue-500/10', border2: 'border-blue-500/20', text: 'text-blue-400' },
          { icon: Gamepad2, label: 'Toplam Tıklama', value: totalClicks > 0 ? totalClicks.toLocaleString('tr-TR') : '—', color: 'emerald', from: 'from-emerald-500', to: 'to-emerald-600', glow: 'shadow-emerald-500/20', bg: 'bg-emerald-500/10', border2: 'border-emerald-500/20', text: 'text-emerald-400' },
          { icon: HardDrive, label: 'GPU Modeli', value: gpus.length > 0 ? gpus.length : '—', color: 'purple', from: 'from-purple-500', to: 'to-purple-600', glow: 'shadow-purple-500/20', bg: 'bg-purple-500/10', border2: 'border-purple-500/20', text: 'text-purple-400' },
          { icon: Cpu, label: 'CPU Modeli', value: cpus.length > 0 ? cpus.length : '—', color: 'orange', from: 'from-orange-500', to: 'to-orange-600', glow: 'shadow-orange-500/20', bg: 'bg-orange-500/10', border2: 'border-orange-500/20', text: 'text-orange-400' },
        ].map(({ icon: Icon, label, value, from, to, glow, bg: ib, border2, text }, i) => (
          <div key={i} className={`${card} border ${border} rounded-2xl p-4 sm:p-5 relative overflow-hidden group`}>
            <div className={`absolute -right-4 -bottom-4 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity`}>
              <Icon size={80} />
            </div>
            <div className={`w-9 h-9 rounded-xl ${ib} border ${border2} flex items-center justify-center mb-3`}>
              <Icon size={16} className={text} />
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${txt} leading-none`}>{value}</div>
            <div className={`text-xs font-medium ${sub} mt-1.5`}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Sıcaklık Kartları ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <TempGauge value={cpuTemp} label="CPU Sıcaklığı (Ort.)" icon={Cpu} dark={dark} />
        <TempGauge value={gpuTemp} label="GPU Sıcaklığı (Ort.)" icon={HardDrive} dark={dark} />
      </div>

      {/* ── Oyunlar + Donanım ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">

        {/* En çok oynanan oyunlar */}
        <div className={`${card} border ${border} rounded-2xl p-4 sm:p-6`}>
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Gamepad2 size={13} className="text-emerald-400" />
              </div>
              <h3 className={`font-bold text-sm sm:text-base ${txt}`}>En Çok Oynanan</h3>
            </div>
            <span className={`text-[11px] font-medium ${muted} px-2 py-0.5 rounded-full ${dark ? 'bg-white/5' : 'bg-gray-100'}`}>{topGames.length} oyun</span>
          </div>
          {topGames.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className={`w-12 h-12 rounded-xl ${dark ? 'bg-white/5' : 'bg-gray-100'} flex items-center justify-center`}>
                <Gamepad2 size={22} className={`${muted} opacity-40`} />
              </div>
              <span className={`text-sm ${sub}`}>Oyun verisi bekleniyor...</span>
            </div>
          ) : (
            <div className="space-y-2.5">
              {topGames.slice(0, 8).map((g, i) => {
                const pct = Math.round((g.clicks / maxClicks) * 100);
                return (
                  <div key={i}>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                        style={{ background: COLORS[i % COLORS.length] + '22', color: COLORS[i % COLORS.length] }}>
                        {i + 1}
                      </span>
                      <span className={`text-sm font-medium ${txt} flex-1 truncate`}>{g.name}</span>
                      <span className={`text-[11px] font-semibold ${sub} shrink-0 tabular-nums`}>{g.clicks.toLocaleString('tr-TR')}</span>
                    </div>
                    <div className={`h-1.5 rounded-full ml-7 ${dark ? 'bg-white/5' : 'bg-gray-100'} overflow-hidden`}>
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Donanım Envanteri */}
        <div className={`${card} border ${border} rounded-2xl p-4 sm:p-6`}>
          <div className="flex items-center gap-2 mb-4 sm:mb-5">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Layers size={13} className="text-purple-400" />
            </div>
            <h3 className={`font-bold text-sm sm:text-base ${txt}`}>Donanım Envanteri</h3>
          </div>
          {gpus.length === 0 && cpus.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className={`w-12 h-12 rounded-xl ${dark ? 'bg-white/5' : 'bg-gray-100'} flex items-center justify-center`}>
                <HardDrive size={22} className={`${muted} opacity-40`} />
              </div>
              <span className={`text-sm ${sub}`}>Donanım verisi bekleniyor...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {gpus.length > 0 && (
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-2 flex items-center gap-1`}>
                    <HardDrive size={9} /> Ekran Kartları
                  </p>
                  <div className="space-y-1.5">
                    {gpus.map((g, i) => (
                      <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-xl ${rowBg} transition-colors`}>
                        <span className={`text-xs sm:text-sm ${txt} truncate flex-1 mr-2`}>{g.name}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 shrink-0">{g.count} adet</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {cpus.length > 0 && (
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2 flex items-center gap-1`}>
                    <Cpu size={9} /> İşlemciler
                  </p>
                  <div className="space-y-1.5">
                    {cpus.map((c, i) => (
                      <div key={i} className={`flex items-center justify-between py-2 px-3 rounded-xl ${rowBg} transition-colors`}>
                        <span className={`text-xs sm:text-sm ${txt} truncate flex-1 mr-2`}>{c.name}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">{c.count} adet</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Veri Yok Durumu ── */}
      {!data && (
        <div className={`${card} border ${border} rounded-2xl p-10 sm:p-16 text-center`}>
          <div className={`w-16 h-16 rounded-2xl ${dark ? 'bg-white/5' : 'bg-gray-100'} border ${border} flex items-center justify-center mx-auto mb-4`}>
            <Server size={28} className={`${sub} opacity-40`} />
          </div>
          <h3 className={`font-bold ${txt} mb-2`}>Veri Bekleniyor</h3>
          <p className={`text-sm ${sub} max-w-xs mx-auto`}>Kafenizden henüz telemetri verisi gelmedi. Game Center Server'ın çalıştığından emin olun.</p>
        </div>
      )}
    </div>
  );
};

// ===== ADMIN DASHBOARD (tam görünüm - tüm kafeler) =====
const AdminDashboard = ({ dark }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [linkData, setLinkData] = useState(null); // { users, telemetry_records }
  const [linkModal, setLinkModal] = useState(false);
  const [linking, setLinking] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTelemetry, setSelectedTelemetry] = useState('');
  const [linkMsg, setLinkMsg] = useState('');

  const handleDelete = useCallback((hwid) => {
    setData(prev => prev.filter(c => (c.hwid || c.cafe_id) !== hwid));
  }, []);
  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const panelBorder = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';
  const tooltipStyle = { backgroundColor: dark ? '#1f2937' : '#fff', borderColor: dark ? '#374151' : '#e5e7eb' };

  const fetchData = () => {
    setLoading(true);
    fetch('/api/telemetry?role=admin')
      .then(r => r.json())
      .then(j => { setData(j.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const loadLinkData = () => {
    const token = localStorage.getItem('gc_admin_token');
    setLinkMsg('');
    fetch('/api/users?view=cafe-link', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => { setLinkData(j); setLinkModal(true); })
      .catch(() => setLinkMsg('Yüklenemedi.'));
  };

  const doLink = async () => {
    if (!selectedUser || !selectedTelemetry) return;
    setLinking(true);
    setLinkMsg('');
    const token = localStorage.getItem('gc_admin_token');
    try {
      const r = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'cafe-link', user_email: selectedUser, telemetry_cafe_id: selectedTelemetry }),
      });
      const j = await r.json();
      if (j.success) {
        setLinkMsg('✅ ' + j.message);
        loadLinkData(); // yenile
      } else {
        setLinkMsg('❌ ' + (j.error || 'Hata'));
      }
    } catch { setLinkMsg('❌ Bağlantı hatası.'); }
    setLinking(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Genel istatistikler
  const totalCafes = data.length;
  const totalClients = data.reduce((s, c) => s + (c.active_clients || 0), 0);
  const gameStats = {};
  data.forEach(cafe => { if (cafe.top_games) cafe.top_games.forEach(g => { gameStats[g.name] = (gameStats[g.name] || 0) + g.clicks; }); });
  const sortedGames = Object.entries(gameStats).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, clicks]) => ({ name, clicks }));
  const gpuStats = {};
  data.forEach(cafe => { if (cafe.hardware_stats?.gpus) cafe.hardware_stats.gpus.forEach(gpu => { gpuStats[gpu.name] = (gpuStats[gpu.name] || 0) + gpu.count; }); });
  const sortedGpus = Object.entries(gpuStats).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  const totalPCs = data.reduce((s, c) => s + (c.hardware_stats?.gpus?.reduce((a, g) => a + g.count, 0) || 0), 0);

  const filteredCafes = data.filter(c =>
    c.cafe_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`${sub} text-sm`}>Veriler buluttan çekiliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Hesap Bağlama Modal ── */}
      {linkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className={`${bg} border ${panelBorder} rounded-2xl p-6 shadow-2xl w-full max-w-lg mx-4`}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Link size={18} className="text-blue-400" />
                <p className={`font-bold text-sm ${txt}`}>Kafe Hesabı Bağla</p>
              </div>
              <button onClick={() => { setLinkModal(false); setLinkMsg(''); }} className="text-gray-500 hover:text-gray-300"><X size={16}/></button>
            </div>

            {/* Bağlanmamış kullanıcılar listesi */}
            {linkData?.users?.filter(u => !u.is_linked).length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-xs text-yellow-400 font-medium mb-1">⚠️ Bağlanmamış hesaplar:</p>
                {linkData.users.filter(u => !u.is_linked).map(u => (
                  <p key={u.email} className="text-xs text-yellow-300">{u.email} ({u.cafe_name})</p>
                ))}
              </div>
            )}

            <div className="space-y-3 mb-4">
              <div>
                <label className={`text-xs font-semibold ${txt} mb-1 block`}>Kullanıcı (e-posta)</label>
                <select
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value)}
                  style={{ backgroundColor: '#fff', color: '#111', border: '1px solid #d1d5db' }}
                  className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                >
                  <option value="" style={{ color: '#111', backgroundColor: '#fff' }}>Kullanıcı seç...</option>
                  {(linkData?.users || []).map(u => (
                    <option key={u.email} value={u.email} style={{ color: '#111', backgroundColor: '#fff' }}>
                      {u.is_linked ? '✅' : '⚠️'} {u.cafe_name || '?'} — {u.email}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`text-xs font-semibold ${txt} mb-1 block`}>Telemetri Kaydı (Sunucu)</label>
                <select
                  value={selectedTelemetry}
                  onChange={e => setSelectedTelemetry(e.target.value)}
                  style={{ backgroundColor: '#fff', color: '#111', border: '1px solid #d1d5db' }}
                  className="w-full px-3 py-2 rounded-xl text-sm focus:outline-none"
                >
                  <option value="" style={{ color: '#111', backgroundColor: '#fff' }}>Telemetri seç...</option>
                  {(linkData?.telemetry_records || []).map(t => (
                    <option key={t.cafe_id} value={t.cafe_id} style={{ color: '#111', backgroundColor: '#fff' }}>
                      {t.cafe_name} — {t.active_clients} PC aktif
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {linkMsg && <p className="text-xs mb-3 text-center">{linkMsg}</p>}

            <button
              onClick={doLink}
              disabled={linking || !selectedUser || !selectedTelemetry}
              className="w-full py-2.5 rounded-xl text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
            >
              {linking ? 'Bağlanıyor...' : 'Hesabı Bağla'}
            </button>
          </div>
        </div>
      )}

      {/* Üst bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className={`text-xl font-bold ${txt}`}>Ağ Genel Bakış</h2>
          <p className={`text-sm ${sub}`}>Tüm internet kafelerinin anlık verileri</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Canlı Senkronizasyon
          </div>
          <button
            onClick={loadLinkData}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              dark ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100'
            }`}
            title="Kafe hesaplarını telemetri ile bağla"
          >
            <Link size={13} /> Hesap Bağla
          </button>
          <button onClick={fetchData} className={`p-2 rounded-xl transition-colors ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Wifi} label="Toplam Şube" value={totalCafes} color="bg-gradient-to-br from-orange-500 to-orange-600" dark={dark} />
        <StatCard icon={Monitor} label="Aktif PC" value={totalClients} color="bg-gradient-to-br from-blue-500 to-blue-600" dark={dark} />
        <StatCard icon={Gamepad2} label="Top Oyun Tıklaması" value={sortedGames.reduce((a, g) => a + g.clicks, 0).toLocaleString()} color="bg-gradient-to-br from-emerald-500 to-emerald-600" dark={dark} />
        <StatCard icon={HardDrive} label="GPU Çeşidi" value={Object.keys(gpuStats).length} color="bg-gradient-to-br from-purple-500 to-purple-600" dark={dark} />
      </div>

      {/* Grafik paneli */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className={`xl:col-span-3 ${bg} border ${panelBorder} rounded-2xl p-6 shadow-sm`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className={`text-base font-bold ${txt}`}>En Çok Oynanan Oyunlar</h3>
              <p className={`text-xs ${sub} mt-0.5`}>Tüm şubelerin kümülatif verisi</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-md ${dark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>Top 8</span>
          </div>
          {sortedGames.length === 0 ? (
            <div className={`flex items-center justify-center h-52 ${sub} text-sm`}>Henüz veri yok</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sortedGames} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <XAxis type="number" stroke={dark ? '#4b5563' : '#d1d5db'} tick={{ fill: dark ? '#6b7280' : '#9ca3af', fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={130} stroke="none" tick={{ fill: dark ? '#9ca3af' : '#6b7280', fontSize: 11 }} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="clicks" fill="#f97316" radius={[0, 6, 6, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className={`xl:col-span-2 ${bg} border ${panelBorder} rounded-2xl p-6 shadow-sm`}>
          <div className="mb-5">
            <h3 className={`text-base font-bold ${txt}`}>GPU Dağılımı</h3>
            <p className={`text-xs ${sub} mt-0.5`}>En yaygın ekran kartları</p>
          </div>
          {sortedGpus.length === 0 ? (
            <div className={`flex items-center justify-center h-52 ${sub} text-sm`}>Henüz veri yok</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={sortedGpus} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="count">
                  {sortedGpus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: dark ? '#9ca3af' : '#6b7280', fontSize: 11 }}>{v.substring(0, 22)}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Kafe listesi — genişletilebilir kartlar */}
      <div>
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <h3 className={`text-base font-bold ${txt}`}>Şube Detayları</h3>
            <p className={`text-xs ${sub} mt-0.5`}>Her kafeye tıklayarak detayları görün</p>
          </div>
          {/* Arama */}
          <input
            type="text"
            placeholder="Kafe ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={`px-3 py-1.5 text-sm rounded-xl border focus:outline-none focus:ring-2 focus:ring-orange-500/30 ${
              dark ? 'bg-white/5 border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
            }`}
          />
        </div>

        {filteredCafes.length === 0 ? (
          <div className={`${bg} border ${panelBorder} rounded-2xl p-12 text-center`}>
            <Wifi size={36} className={`mx-auto mb-3 ${sub} opacity-30`} />
            <p className={`text-sm ${sub}`}>{search ? 'Aramanızla eşleşen kafe bulunamadı.' : 'Henüz telemetri verisi gönderen kafe yok.'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCafes.map((cafe, i) => (
              <CafeCard key={cafe.hwid || cafe.cafe_id || i} cafe={cafe} dark={dark} index={i} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ===== ANA SWITCH =====
const SuperAdmin = () => {
  const context = useOutletContext() || {};
  const dark = context.dark !== undefined ? context.dark : true;
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('gc_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (_) {}
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user.role === 'admin') {
    return <AdminDashboard dark={dark} />;
  }

  return <CafeDashboard user={user} dark={dark} />;
};

export default SuperAdmin;
