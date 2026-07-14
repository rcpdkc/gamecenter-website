import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Server, Users, Gamepad2, Cpu, Activity, Clock, TrendingUp, Wifi, AlertTriangle, Crown, Zap, Gift } from 'lucide-react';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b'];

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

// ===== CAFE DASHBOARD (limited view) =====
const CafeDashboard = ({ user, dark }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const panelBorder = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';

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

  return (
    <div className="space-y-6">
      {/* Plan badge */}
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold ${planMeta.bg} ${planMeta.color}`}>
          <planMeta.icon size={13} /> {planMeta.label} Plan
          {user.plan_expires_at && ` · ${new Date(user.plan_expires_at).toLocaleDateString('tr-TR')} tarihine kadar`}
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Çevrimiçi
        </div>
      </div>

      {/* Cafe Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard icon={Users} label="Aktif İstemci" value={data?.active_clients ?? '—'} color="bg-gradient-to-br from-blue-500 to-blue-600" dark={dark} />
        <StatCard icon={Gamepad2} label="Oyun Tıklaması" value={data?.top_games ? data.top_games.reduce((a, g) => a + g.clicks, 0).toLocaleString() : '—'} color="bg-gradient-to-br from-emerald-500 to-emerald-600" dark={dark} />
      </div>

      {/* Top Games */}
      {data?.top_games && data.top_games.length > 0 && (
        <div className={`${bg} border ${panelBorder} rounded-2xl p-6 shadow-sm`}>
          <h3 className={`text-base font-bold ${txt} mb-4`}>Kafenizdeki En Popüler Oyunlar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.top_games.slice(0, 8)} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
              <XAxis type="number" stroke={dark ? '#4b5563' : '#d1d5db'} tick={{ fill: dark ? '#6b7280' : '#9ca3af', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={130} stroke="none" tick={{ fill: dark ? '#9ca3af' : '#6b7280', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: dark ? '#1f2937' : '#fff', borderColor: dark ? '#374151' : '#e5e7eb' }} />
              <Bar dataKey="clicks" fill="#f97316" radius={[0, 6, 6, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Hardware */}
      {data?.hardware_stats && (
        <div className={`${bg} border ${panelBorder} rounded-2xl p-6 shadow-sm`}>
          <h3 className={`text-base font-bold ${txt} mb-3`}>Donanım Özeti</h3>
          <p className={`text-sm ${sub}`}>GPU: {data.hardware_stats.gpus?.map(g => `${g.name} (${g.count})`).join(', ') || 'Veri yok'}</p>
        </div>
      )}

      {!loading && !data && (
        <div className={`${bg} border ${panelBorder} rounded-2xl p-12 text-center shadow-sm`}>
          <Server size={36} className={`mx-auto mb-3 ${sub} opacity-30`} />
          <p className={`text-sm ${sub}`}>Kafenizden henüz telemetri verisi gelmedi. Game Center Server'ın çalıştığından emin olun.</p>
        </div>
      )}
    </div>
  );
};

// ===== ADMIN DASHBOARD (full view) =====
const AdminDashboard = ({ dark }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const panelBorder = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';
  const tableRow = dark ? 'hover:bg-white/5 border-white/5' : 'hover:bg-gray-50 border-gray-100';
  const tooltipStyle = { backgroundColor: dark ? '#1f2937' : '#fff', borderColor: dark ? '#374151' : '#e5e7eb' };

  useEffect(() => {
    fetch('/api/telemetry?role=admin')
      .then(r => r.json())
      .then(j => { setData(j.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalCafes = data.length;
  const totalClients = data.reduce((s, c) => s + (c.active_clients || 0), 0);
  const gameStats = {};
  data.forEach(cafe => { if (cafe.top_games) cafe.top_games.forEach(g => { gameStats[g.name] = (gameStats[g.name] || 0) + g.clicks; }); });
  const sortedGames = Object.entries(gameStats).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, clicks]) => ({ name, clicks }));
  const gpuStats = {};
  data.forEach(cafe => { if (cafe.hardware_stats?.gpus) cafe.hardware_stats.gpus.forEach(gpu => { gpuStats[gpu.name] = (gpuStats[gpu.name] || 0) + gpu.count; }); });
  const sortedGpus = Object.entries(gpuStats).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`${sub} text-sm`}>Veriler buluttan çekiliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Canlı Senkronizasyon Aktif
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Wifi} label="Aktif Şube" value={totalCafes} color="bg-gradient-to-br from-orange-500 to-orange-600" dark={dark} />
        <StatCard icon={Users} label="Aktif İstemci" value={totalClients} color="bg-gradient-to-br from-blue-500 to-blue-600" dark={dark} />
        <StatCard icon={Gamepad2} label="Oyun Tıklaması" value={sortedGames.reduce((a, g) => a + g.clicks, 0).toLocaleString()} color="bg-gradient-to-br from-emerald-500 to-emerald-600" dark={dark} />
        <StatCard icon={Cpu} label="GPU Modeli" value={Object.keys(gpuStats).length} color="bg-gradient-to-br from-purple-500 to-purple-600" dark={dark} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className={`xl:col-span-3 ${bg} border ${panelBorder} rounded-2xl p-6 shadow-sm`}>
          <div className="flex items-center justify-between mb-6">
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
          <div className="mb-6">
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

      <div className={`${bg} border ${panelBorder} rounded-2xl overflow-hidden shadow-sm`}>
        <div className={`px-6 py-4 border-b ${panelBorder} flex items-center justify-between`}>
          <div>
            <h3 className={`text-base font-bold ${txt}`}>Bağlı Şubeler</h3>
            <p className={`text-xs ${sub} mt-0.5`}>Son 24 saat içinde veri gönderen kafeler</p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">{totalCafes} Aktif</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className={dark ? 'bg-white/3' : 'bg-gray-50'}>
                {['Kafe Adı', 'Aktif PC', 'Son Veri', 'Durum'].map(h => (
                  <th key={h} className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${sub}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${dark ? 'divide-white/5' : 'divide-gray-100'}`}>
              {data.length === 0 ? (
                <tr><td colSpan="4" className={`px-6 py-12 text-center ${sub}`}>Henüz veri yok.</td></tr>
              ) : (
                data.map((cafe, i) => (
                  <tr key={i} className={`transition-colors ${tableRow}`}>
                    <td className={`px-6 py-4 font-semibold ${txt}`}>{cafe.cafe_name}</td>
                    <td className={`px-6 py-4 ${sub}`}>{cafe.active_clients} PC</td>
                    <td className={`px-6 py-4 ${sub} flex items-center gap-1.5`}><Clock size={13} />{new Date(cafe.last_updated).toLocaleString('tr-TR')}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Çevrimiçi
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ===== MAIN SWITCH =====
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
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user.role === 'admin') {
    return <AdminDashboard dark={dark} />;
  }

  return <CafeDashboard user={user} dark={dark} />;
};

export default SuperAdmin;
