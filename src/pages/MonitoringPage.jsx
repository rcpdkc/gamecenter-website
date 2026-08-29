import { useOutletContext } from 'react-router-dom';
import { Thermometer, Cpu, HardDrive, Activity } from 'lucide-react';
import { useCafeTelemetry, Loading, Card, StatCard, StatGrid, TempGauge, tempTone, toneColor } from '../admin/ui';

export default function MonitoringPage() {
  const { user } = useOutletContext();
  const { data, error } = useCafeTelemetry(user);

  if (!data && !error) return <Loading label="Sıcaklık verileri yükleniyor…" />;

  const temps = data?.hardware_stats?.temps || {};
  const cpuTemp = temps.cpu_avg || null;
  const gpuTemp = temps.gpu_avg || null;

  return (
    <div className="space-y-5">
      {/* Sıcaklık verisi yoksa bilgi bandı */}
      {!cpuTemp && !gpuTemp && (
        <Card className="p-4 flex items-start gap-3">
          <span className="w-8 h-8 rounded-xl grid place-items-center shrink-0" style={{ background: toneColor('warn') + '18', border: `1px solid ${toneColor('warn')}30` }}>
            <Thermometer size={14} style={{ color: toneColor('warn') }} />
          </span>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--a-ink)' }}>Sıcaklık Verisi Henüz Yok</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--a-mut)' }}>
              Sıcaklık verisi için kafenin <strong style={{ color: 'var(--a-accent)' }}>Game Center v3.1.6</strong> veya üstünü kurması gerekiyor.
              Güncelleme sonrası sunucu otomatik olarak CPU/GPU sıcaklık ortalamalarını gönderecek.
            </p>
          </div>
        </Card>
      )}

      {/* Sıcaklık ölçerleri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <TempGauge label="CPU Ortalama Sıcaklık" temp={cpuTemp} kind="cpu" />
        <TempGauge label="GPU Ortalama Sıcaklık" temp={gpuTemp} kind="gpu" />
      </div>

      {/* Genel durum */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-7 h-7 rounded-lg grid place-items-center" style={{ background: 'var(--a-accent-soft)' }}>
            <Activity size={13} style={{ color: 'var(--a-accent)' }} />
          </span>
          <h3 className="font-bold text-sm" style={{ color: 'var(--a-ink)' }}>Genel Durum</h3>
        </div>
        <StatGrid cols={3}>
          <StatCard icon={Activity} label="Aktif PC" value={data?.active_clients ?? '—'} tone="info" />
          <StatCard icon={Cpu} label="CPU Sıcaklık" value={cpuTemp ? `${cpuTemp}°C` : '—'} tone={tempTone(cpuTemp, 'cpu')} />
          <StatCard icon={HardDrive} label="GPU Sıcaklık" value={gpuTemp ? `${gpuTemp}°C` : '—'} tone={tempTone(gpuTemp, 'gpu')} />
        </StatGrid>
      </div>
    </div>
  );
}
