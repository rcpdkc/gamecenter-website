import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Server, Users, Gamepad2, Cpu, Activity, Clock, TrendingUp, Wifi } from 'lucide-react';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b'];

const StatCard = ({ icon: Icon, label, value, color, dark, delta }) => {
  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const border = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';
  return (
    <div className={`${bg} border ${border} rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${sub} mb-1`}>{label}</p>
        <p className={`text-3xl font-bold ${txt} leading-none`}>{value}</p>
        {delta !== undefined && (
          <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
            <TrendingUp size={12} /> {delta}
          </p>
        )}
      </div>
    </div>
  );
};

const SuperAdmin = () => {
  const context = useOutletContext() || {};
  const dark = context.dark !== undefined ? context.dark : true;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/get_telemetry')
      .then(res => res.json())
      .then(json => { setData(json.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalCafes = data.length;
  const totalClients = data.reduce((sum, c) => sum + (c.active_clients || 0), 0);
  const gameStats = {};
  data.forEach(cafe => {
    if (cafe.top_games) cafe.top_games.forEach(g => { gameStats[g.name] = (gameStats[g.name] || 0) + g.clicks; });
  });
  const sortedGames = Object.entries(gameStats).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, clicks]) => ({ name, clicks }));
  const gpuStats = {};
  data.forEach(cafe => {
    if (cafe.hardware_stats?.gpus) cafe.hardware_stats.gpus.forEach(gpu => { gpuStats[gpu.name] = (gpuStats[gpu.name] || 0) + gpu.count; });
  });
  const sortedGpus = Object.entries(gpuStats).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const panelBorder = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';
  const tableRow = dark ? 'hover:bg-white/5 border-white/5' : 'hover:bg-gray-50 border-gray-100';
  const tooltipStyle = { backgroundColor: dark ? '#1f2937' : '#fff', borderColor: dark ? '#374151' : '#e5e7eb', color: dark ? '#f9fafb' : '#111827' };

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
      {/* Live badge */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          Canlı Senkronizasyon Aktif
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Wifi} label="Aktif Şube" value={totalCafes} color="bg-gradient-to-br from-orange-500 to-orange-600" dark={dark} delta="+2 bu ay" />
        <StatCard icon={Users} label="Aktif İstemci" value={totalClients} color="bg-gradient-to-br from-blue-500 to-blue-600" dark={dark} delta={`~${Math.round(totalClients / Math.max(totalCafes, 1))} ortalama/kafe`} />
        <StatCard icon={Gamepad2} label="Oyun Tıklaması" value={sortedGames.reduce((a, g) => a + g.clicks, 0).toLocaleString()} color="bg-gradient-to-br from-emerald-500 to-emerald-600" dark={dark} />
        <StatCard icon={Cpu} label="GPU Modeli" value={Object.keys(gpuStats).length} color="bg-gradient-to-br from-purple-500 to-purple-600" dark={dark} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Games Bar Chart - wider */}
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

        {/* GPU Pie Chart - narrower */}
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
                <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [v + ' adet', n]} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: dark ? '#9ca3af' : '#6b7280', fontSize: 11 }}>{v.substring(0, 22)}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Cafe Table */}
      <div className={`${bg} border ${panelBorder} rounded-2xl overflow-hidden shadow-sm`}>
        <div className={`px-6 py-4 border-b ${panelBorder} flex items-center justify-between`}>
          <div>
            <h3 className={`text-base font-bold ${txt}`}>Bağlı Şubeler</h3>
            <p className={`text-xs ${sub} mt-0.5`}>Son 24 saat içinde veri gönderen kafeler</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400`}>
            {totalCafes} Aktif
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className={dark ? 'bg-white/3' : 'bg-gray-50'}>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${sub}`}>Kafe Adı</th>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${sub}`}>Aktif PC</th>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${sub}`}>Son Veri</th>
                <th className={`px-6 py-3 text-xs font-semibold uppercase tracking-wider ${sub}`}>Durum</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${dark ? 'divide-white/5' : 'divide-gray-100'}`}>
              {data.length === 0 ? (
                <tr><td colSpan="4" className={`px-6 py-12 text-center ${sub}`}>Henüz veri yok. Kafelerden telemetri bekleniyor.</td></tr>
              ) : (
                data.map((cafe, i) => (
                  <tr key={i} className={`transition-colors ${tableRow}`}>
                    <td className={`px-6 py-4 font-semibold ${txt}`}>{cafe.cafe_name}</td>
                    <td className={`px-6 py-4 ${sub}`}>{cafe.active_clients} PC</td>
                    <td className={`px-6 py-4 ${sub} flex items-center gap-1.5`}>
                      <Clock size={13} /> {new Date(cafe.last_updated).toLocaleString('tr-TR')}
                    </td>
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

export default SuperAdmin;
