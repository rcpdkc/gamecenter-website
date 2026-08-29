import { useOutletContext } from 'react-router-dom';
import RefreshFromCafeButton from '../components/RefreshFromCafeButton';
import { HardDrive, Cpu, Monitor, Layers } from 'lucide-react';
import { useCafeTelemetry, Loading, Card, StatCard, StatGrid, ProgressBar, EmptyState } from '../admin/ui';

const HwSection = ({ title, icon: Icon, items, unit = 'adet' }) => {
  const total = items.reduce((a, x) => a + x.count, 0);
  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: 'var(--a-accent-soft)' }}>
            <Icon size={13} style={{ color: 'var(--a-accent)' }} />
          </span>
          <h3 className="font-bold text-sm" style={{ color: 'var(--a-ink)' }}>{title}</h3>
        </div>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--a-card2)', color: 'var(--a-mut)' }}>{total} toplam</span>
      </div>
      {items.length === 0 ? (
        <div className="flex items-center justify-center h-20 text-sm" style={{ color: 'var(--a-mut)' }}>Veri yok</div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, i) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm truncate flex-1 mr-3" style={{ color: 'var(--a-ink)' }}>{item.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px]" style={{ color: 'var(--a-mut)' }}>%{pct}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: 'var(--a-accent-soft)', color: 'var(--a-accent)' }}>{item.count} {unit}</span>
                  </div>
                </div>
                <ProgressBar value={pct} tone="accent" />
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default function HardwarePage() {
  const { user, dark } = useOutletContext();
  const { data, error, reload } = useCafeTelemetry(user);

  if (!data && !error) return <Loading label="Donanım verileri yükleniyor…" />;

  const gpus = data?.hardware_stats?.gpus || [];
  const cpus = data?.hardware_stats?.cpus || [];
  const totalPCs = gpus.reduce((a, g) => a + g.count, 0);

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <RefreshFromCafeButton user={user} dark={dark} onRefreshed={reload} />
      </div>

      {!data ? (
        <Card className="p-4">
          <EmptyState icon={Layers} title="Donanım Verisi Bekleniyor" hint="Game Center Server çalışırken donanım bilgileri otomatik gönderilir." />
        </Card>
      ) : (
        <>
          <StatGrid cols={3}>
            <StatCard icon={Monitor} label="Toplam PC" value={totalPCs || '—'} tone="info" />
            <StatCard icon={HardDrive} label="GPU Modeli" value={gpus.length || '—'} tone="accent" />
            <StatCard icon={Cpu} label="CPU Modeli" value={cpus.length || '—'} tone="info" />
          </StatGrid>

          <HwSection title="Ekran Kartları (GPU)" icon={HardDrive} items={gpus} />
          <HwSection title="İşlemciler (CPU)" icon={Cpu} items={cpus} />
        </>
      )}
    </div>
  );
}
