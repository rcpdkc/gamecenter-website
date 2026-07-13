import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Server, Users, Gamepad2, Cpu, Activity, Clock } from 'lucide-react';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444', '#f59e0b'];

const SuperAdmin = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/get_telemetry')
      .then(res => res.json())
      .then(json => {
        setData(json.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Telemetry fetch error:", err);
        setLoading(false);
      });
  }, []);

  // Aggregate Data
  const totalCafes = data.length;
  const totalClients = data.reduce((sum, cafe) => sum + (cafe.active_clients || 0), 0);
  
  // Aggregate Top Games across all cafes
  const gameStats = {};
  data.forEach(cafe => {
    if (cafe.top_games) {
      cafe.top_games.forEach(game => {
        gameStats[game.name] = (gameStats[game.name] || 0) + game.clicks;
      });
    }
  });
  const sortedGames = Object.entries(gameStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, clicks]) => ({ name, clicks }));

  // Aggregate GPUs
  const gpuStats = {};
  data.forEach(cafe => {
    if (cafe.hardware_stats && cafe.hardware_stats.gpus) {
      cafe.hardware_stats.gpus.forEach(gpu => {
        gpuStats[gpu.name] = (gpuStats[gpu.name] || 0) + gpu.count;
      });
    }
  });
  const sortedGpus = Object.entries(gpuStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-orange-500 animate-pulse text-2xl">Veriler Buluttan Çekiliyor...</div></div>;
  }

  return (
    <div className="pt-24 pb-20 min-h-screen relative z-10">
      <div className="container max-w-7xl">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Server className="text-orange-500" /> Bulut (Cloud) Yönetim Merkezi
            </h1>
            <p className="text-muted mt-1">Dünya çapındaki tüm Game Center sunucularının canlı verileri.</p>
          </div>
          <div className="px-4 py-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm flex items-center gap-2">
            <Activity size={16} className="animate-pulse" /> Canlı Senkronizasyon Aktif
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass-panel p-6 border-t-4 border-t-orange-500">
            <div className="text-muted mb-2 flex items-center gap-2"><Server size={18} /> Toplam Aktif Kafe</div>
            <div className="text-4xl font-bold text-white">{totalCafes}</div>
          </div>
          <div className="glass-panel p-6 border-t-4 border-t-blue-500">
            <div className="text-muted mb-2 flex items-center gap-2"><Users size={18} /> Toplam Aktif İstemci</div>
            <div className="text-4xl font-bold text-white">{totalClients}</div>
          </div>
          <div className="glass-panel p-6 border-t-4 border-t-emerald-500">
            <div className="text-muted mb-2 flex items-center gap-2"><Gamepad2 size={18} /> Toplam Oyun Tıklaması</div>
            <div className="text-4xl font-bold text-white">
              {sortedGames.reduce((acc, g) => acc + g.clicks, 0).toLocaleString()}
            </div>
          </div>
          <div className="glass-panel p-6 border-t-4 border-t-purple-500">
            <div className="text-muted mb-2 flex items-center gap-2"><Cpu size={18} /> Farklı GPU Modeli</div>
            <div className="text-4xl font-bold text-white">{Object.keys(gpuStats).length}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Games Chart */}
          <div className="glass-panel p-6">
            <h3 className="text-xl font-bold text-white mb-6">Global En Çok Oynanan Oyunlar (Top 10)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sortedGames} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" width={150} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#12141d', borderColor: '#333' }} />
                  <Bar dataKey="clicks" fill="#f97316" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* GPU Stats Pie Chart */}
          <div className="glass-panel p-6">
            <h3 className="text-xl font-bold text-white mb-6">En Çok Kullanılan Ekran Kartları (Top 5)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sortedGpus}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="count"
                    label={({name}) => name.substring(0,20)}
                  >
                    {sortedGpus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#12141d', borderColor: '#333' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Cafe List */}
        <div className="glass-panel overflow-hidden">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-xl font-bold text-white">Bağlı Kafeler (Canlı)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="p-4 text-muted font-medium">Kafe Adı</th>
                  <th className="p-4 text-muted font-medium">Aktif PC</th>
                  <th className="p-4 text-muted font-medium">Son Veri Aktarımı</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan="3" className="p-8 text-center text-muted">Henüz veri yok.</td></tr>
                ) : (
                  data.map((cafe, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-white">{cafe.cafe_name}</td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-sm">
                          {cafe.active_clients} PC
                        </span>
                      </td>
                      <td className="p-4 flex items-center gap-2 text-muted">
                        <Clock size={16} /> {new Date(cafe.last_updated).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SuperAdmin;
