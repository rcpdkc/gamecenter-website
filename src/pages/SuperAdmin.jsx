import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import {
  Server, Users, Gamepad2, Cpu, Activity, Clock, TrendingUp,
  Wifi, AlertTriangle, Crown, Zap, Gift, ChevronDown, ChevronUp,
  Monitor, RefreshCw, CircleAlert, Layers, HardDrive
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
const CafeCard = ({ cafe, dark, index }) => {
  const [open, setOpen] = useState(false);
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

        {/* Aç/kapat */}
        {open ? <ChevronUp size={16} className={sub} /> : <ChevronDown size={16} className={sub} />}
      </button>

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
const CafeDashboard = ({ user, dark }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const panelBorder = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';
  const tooltipStyle = { backgroundColor: dark ? '#1f2937' : '#fff', borderColor: dark ? '#374151' : '#e5e7eb' };

  const licenseExpired = user.license_expired;
  const plan = user.plan || 'free';
  const planMeta = PLAN_META[plan] || PLAN_META.free;

  useEffect(() => {
    if (!user.cafe_id || licenseExpired) { setLoading(false); return; }
    fetch(`/api/telemetry?role=cafe&cafe_id=${user.cafe_id}`)
      .then(r => r.json())
      .then(j => { setData((j.data || [])[0] || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user.cafe_id]);

  if (licenseExpired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 p-8">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle size={36} className="text-red-400" />
        </div>
        <h2 className={`text-2xl font-bold ${txt}`}>Lisansınız Sona Erdi</h2>
        <p className={`text-sm ${sub} max-w-sm`}>
          Game Center Cloud erişiminiz sona ermiştir. Yenileme için sistem yöneticinizle iletişime geçin.
        </p>
        <div className="px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
          Hesap Askıya Alındı
        </div>
      </div>
    );
  }

  const topGames = data?.top_games || [];
  const gpus = data?.hardware_stats?.gpus || [];
  const cpus = data?.hardware_stats?.cpus || [];
  const totalClicks = topGames.reduce((a, g) => a + g.clicks, 0);

  return (
    <div className="space-y-6">
      {/* Plan + online badge */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${planMeta.bg} ${planMeta.color}`}>
          <planMeta.icon size={13} /> {planMeta.label} Plan
          {user.plan_expires_at && ` · ${new Date(user.plan_expires_at).toLocaleDateString('tr-TR')} tarihine kadar`}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Çevrimiçi
        </div>
      </div>

      {/* İstatistik kartları */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Monitor} label="Aktif PC" value={data?.active_clients ?? '—'} color="bg-gradient-to-br from-blue-500 to-blue-600" dark={dark} />
        <StatCard icon={Gamepad2} label="Toplam Tıklama" value={totalClicks > 0 ? totalClicks.toLocaleString() : '—'} color="bg-gradient-to-br from-emerald-500 to-emerald-600" dark={dark} />
        <StatCard icon={HardDrive} label="GPU Modeli" value={gpus.length > 0 ? gpus.length : '—'} color="bg-gradient-to-br from-purple-500 to-purple-600" dark={dark} />
        <StatCard icon={Cpu} label="CPU Modeli" value={cpus.length > 0 ? cpus.length : '—'} color="bg-gradient-to-br from-orange-500 to-orange-600" dark={dark} />
      </div>

      {/* Oyunlar + Donanım */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* En çok oynanan oyunlar */}
        <div className={`${bg} border ${panelBorder} rounded-2xl p-6 shadow-sm`}>
          <h3 className={`text-base font-bold ${txt} mb-4`}>En Çok Oynanan Oyunlar</h3>
          {topGames.length === 0 ? (
            <div className={`flex items-center justify-center h-40 ${sub} text-sm`}>Henüz veri yok</div>
          ) : (
            <div className="space-y-3">
              {topGames.slice(0, 8).map((g, i) => {
                const pct = totalClicks > 0 ? Math.round((g.clicks / totalClicks) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm font-medium ${txt} truncate max-w-[200px]`}>{g.name}</span>
                      <span className={`text-xs ${sub} ml-2 shrink-0`}>{g.clicks.toLocaleString()} tık</span>
                    </div>
                    <div className={`h-2 rounded-full ${dark ? 'bg-white/5' : 'bg-gray-100'} overflow-hidden`}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Donanım */}
        <div className={`${bg} border ${panelBorder} rounded-2xl p-6 shadow-sm`}>
          <h3 className={`text-base font-bold ${txt} mb-4`}>Donanım Envanteri</h3>
          {gpus.length === 0 && cpus.length === 0 ? (
            <div className={`flex items-center justify-center h-40 ${sub} text-sm`}>Henüz veri yok</div>
          ) : (
            <div className="space-y-4">
              {gpus.length > 0 && (
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest text-purple-400 mb-2`}>Ekran Kartları</p>
                  <div className="space-y-2">
                    {gpus.map((g, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className={`text-sm ${txt} truncate`}>{g.name}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400">{g.count} adet</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {cpus.length > 0 && (
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2`}>İşlemciler</p>
                  <div className="space-y-2">
                    {cpus.map((c, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className={`text-sm ${txt} truncate`}>{c.name}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400">{c.count} adet</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!loading && !data && (
        <div className={`${bg} border ${panelBorder} rounded-2xl p-12 text-center shadow-sm`}>
          <Server size={36} className={`mx-auto mb-3 ${sub} opacity-30`} />
          <p className={`text-sm ${sub}`}>Kafenizden henüz telemetri verisi gelmedi. Game Center Server'ın çalıştığından emin olun.</p>
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
              <CafeCard key={cafe.cafe_id || i} cafe={cafe} dark={dark} index={i} />
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
