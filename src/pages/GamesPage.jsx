import { useOutletContext } from 'react-router-dom';
import RefreshFromCafeButton from '../components/RefreshFromCafeButton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Gamepad2, TrendingUp } from 'lucide-react';
import { useCafeTelemetry, Loading, Card, StatCard, StatGrid, TopGamesList, EmptyState, COLORS } from '../admin/ui';

export default function GamesPage() {
  const { user, dark } = useOutletContext();
  const { data, error, reload } = useCafeTelemetry(user);

  // Tooltip HTML katmanları .gc-admin altında → CSS token'ları çözülür.
  const tooltipStyle = { backgroundColor: 'var(--a-card)', borderColor: 'var(--a-border)', borderRadius: 12, color: 'var(--a-ink)' };
  // Eksen etiketleri SVG attribute (var() desteklemez) → nötr gri.
  const axisTick = { fill: dark ? '#6b7280' : '#9ca3af', fontSize: 11 };

  if (!data && !error) return <Loading label="Oyun verileri yükleniyor…" />;

  const topGames = data?.top_games || [];
  const totalClicks = topGames.reduce((a, g) => a + g.clicks, 0);

  if (topGames.length === 0) return (
    <Card className="p-4">
      <EmptyState icon={Gamepad2} title="Henüz Oyun Verisi Yok" hint="Game Center Server çalıştıkça oyun tıklamaları burada görünecek." />
    </Card>
  );

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <RefreshFromCafeButton user={user} dark={dark} onRefreshed={reload} />
      </div>

      <StatGrid cols={3}>
        <StatCard icon={Gamepad2} label="Toplam Oyun" value={topGames.length} tone="accent" />
        <StatCard icon={TrendingUp} label="Toplam Tıklama" value={totalClicks.toLocaleString('tr-TR')} tone="info" />
        <StatCard icon={TrendingUp} label="En Popüler" value={(topGames[0]?.clicks ?? 0).toLocaleString('tr-TR')} tone="warn" hint={topGames[0]?.name} />
      </StatGrid>

      {/* Bar Chart */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: 'var(--a-accent-soft)' }}>
            <TrendingUp size={13} style={{ color: 'var(--a-accent)' }} />
          </span>
          <h3 className="font-bold" style={{ color: 'var(--a-ink)' }}>Oyun Tıklama Grafiği</h3>
        </div>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topGames.slice(0, 10)} margin={{ top: 0, right: 0, left: -20, bottom: 60 }}>
              <XAxis dataKey="name" tick={axisTick} angle={-35} textAnchor="end" interval={0} />
              <YAxis tick={axisTick} />
              <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: 'var(--a-ink)', fontWeight: 700 }} cursor={{ fill: 'var(--a-accent-soft)' }} />
              <Bar dataKey="clicks" radius={[6, 6, 0, 0]}>
                {topGames.slice(0, 10).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Pie Chart + List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-5">
            <span className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: 'var(--a-accent-soft)' }}>
              <Gamepad2 size={13} style={{ color: 'var(--a-accent)' }} />
            </span>
            <h3 className="font-bold" style={{ color: 'var(--a-ink)' }}>Oyun Dağılımı</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topGames.slice(0, 6)} cx="50%" cy="50%" outerRadius="75%" dataKey="clicks" nameKey="name" label={({ name, percent }) => `${name.slice(0, 8)} %${(percent * 100).toFixed(0)}`} labelLine={false}>
                  {topGames.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="font-bold mb-4" style={{ color: 'var(--a-ink)' }}>Sıralama Listesi</h3>
          <TopGamesList games={topGames} limit={topGames.length || 8} />
        </Card>
      </div>
    </div>
  );
}
