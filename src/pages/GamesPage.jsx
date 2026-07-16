import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Gamepad2, TrendingUp } from 'lucide-react';

const COLORS = ['#f97316','#3b82f6','#10b981','#8b5cf6','#ef4444','#f59e0b','#06b6d4','#ec4899'];

export default function GamesPage() {
  const { user, dark } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const card = dark ? 'bg-[#161b22]' : 'bg-white';
  const border = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-400' : 'text-gray-500';
  const muted = dark ? 'text-gray-600' : 'text-gray-400';
  const tooltipStyle = { backgroundColor: dark ? '#1f2937' : '#fff', borderColor: dark ? '#374151' : '#e5e7eb', borderRadius: '12px' };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tryEndpoints = [
          user.cafe_id ? `/api/telemetry?role=cafe&cafe_id=${user.cafe_id}` : null,
          user.hwid ? `/api/telemetry?hwid=${encodeURIComponent(user.hwid)}` : null,
          user.email ? `/api/telemetry?email=${encodeURIComponent(user.email)}` : null,
        ].filter(Boolean);
        for (const ep of tryEndpoints) {
          const r = await fetch(ep);
          const j = await r.json();
          const rec = (j.data || [])[0] || null;
          if (rec) { setData(rec); break; }
        }
      } catch(e) { console.error(e); }
      setLoading(false);
    };
    fetchData();
  }, [user.cafe_id, user.hwid, user.email]);

  const topGames = data?.top_games || [];
  const totalClicks = topGames.reduce((a, g) => a + g.clicks, 0);
  const maxClicks = topGames[0]?.clicks || 1;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (topGames.length === 0) return (
    <div className={`${card} border ${border} rounded-2xl p-16 text-center`}>
      <Gamepad2 size={40} className={`mx-auto mb-4 ${muted} opacity-30`} />
      <p className={`font-bold ${txt} mb-2`}>Henüz Oyun Verisi Yok</p>
      <p className={`text-sm ${sub}`}>Game Center Server çalıştıkça oyun tıklamaları burada görünecek.</p>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Bar Chart */}
      <div className={`${card} border ${border} rounded-2xl p-5 sm:p-6`}>
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <TrendingUp size={13} className="text-emerald-400" />
          </div>
          <h3 className={`font-bold ${txt}`}>Oyun Tıklama Grafiği</h3>
        </div>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topGames.slice(0, 10)} margin={{ top: 0, right: 0, left: -20, bottom: 60 }}>
              <XAxis dataKey="name" tick={{ fill: dark ? '#6b7280' : '#9ca3af', fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: dark ? '#6b7280' : '#9ca3af', fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: dark ? '#fff' : '#111', fontWeight: 700 }} />
              <Bar dataKey="clicks" radius={[6, 6, 0, 0]}>
                {topGames.slice(0, 10).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart + List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <div className={`${card} border ${border} rounded-2xl p-5 sm:p-6`}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Gamepad2 size={13} className="text-orange-400" />
            </div>
            <h3 className={`font-bold ${txt}`}>Oyun Dağılımı</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topGames.slice(0, 6)} cx="50%" cy="50%" outerRadius="75%" dataKey="clicks" nameKey="name" label={({ name, percent }) => `${name.slice(0,8)} %${(percent * 100).toFixed(0)}`} labelLine={false}>
                  {topGames.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${card} border ${border} rounded-2xl p-5 sm:p-6`}>
          <h3 className={`font-bold ${txt} mb-4`}>Sıralama Listesi</h3>
          <div className="space-y-2.5">
            {topGames.map((g, i) => {
              const pct = Math.round((g.clicks / maxClicks) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0"
                      style={{ background: COLORS[i % COLORS.length] + '22', color: COLORS[i % COLORS.length] }}>
                      {i + 1}
                    </span>
                    <span className={`text-sm font-medium ${txt} flex-1 truncate`}>{g.name}</span>
                    <span className={`text-[11px] font-semibold tabular-nums ${sub}`}>{g.clicks.toLocaleString('tr-TR')} tık</span>
                    <span className={`text-[10px] ${muted} w-8 text-right`}>%{pct}</span>
                  </div>
                  <div className={`h-1.5 rounded-full ml-7 ${dark ? 'bg-white/5' : 'bg-gray-100'} overflow-hidden`}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
