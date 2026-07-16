import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Thermometer, Cpu, HardDrive, Activity } from 'lucide-react';

const TempCard = ({ label, value, icon: Icon, thresholdWarn = 65, thresholdCrit = 80, dark }) => {
  const color = !value ? (dark ? '#374151' : '#d1d5db')
    : value < thresholdWarn ? '#10b981'
    : value < thresholdCrit ? '#f59e0b'
    : '#ef4444';
  const status = !value ? 'Veri Yok'
    : value < thresholdWarn ? 'Normal'
    : value < thresholdCrit ? 'Yüksek'
    : 'Kritik';
  const pct = value ? Math.min((value / 105) * 100, 100) : 0;
  const card = dark ? 'bg-[#161b22]' : 'bg-white';
  const border = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-400' : 'text-gray-500';

  // SVG arc gauge
  const r = 54;
  const cx = 70; const cy = 70;
  const startAngle = 220; const endAngle = 220 + (pct / 100) * 280;
  const toRad = (d) => (d - 90) * Math.PI / 180;
  const arcPath = (angle) => {
    const x = cx + r * Math.cos(toRad(angle));
    const y = cy + r * Math.sin(toRad(angle));
    return { x, y };
  };
  const start = arcPath(220);
  const end = arcPath(endAngle);
  const largeArc = (endAngle - 220) > 180 ? 1 : 0;

  return (
    <div className={`${card} border ${border} rounded-2xl p-5 sm:p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={15} style={{ color }} />
          <span className={`text-sm font-bold ${txt}`}>{label}</span>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: color + '20', color }}>{status}</span>
      </div>
      <div className="flex items-center gap-6">
        {/* Gauge SVG */}
        <div className="shrink-0">
          <svg width="140" height="100" viewBox="0 0 140 100">
            {/* Track */}
            <path
              d={`M ${arcPath(220).x} ${arcPath(220).y} A ${r} ${r} 0 1 1 ${arcPath(500).x} ${arcPath(500).y}`}
              fill="none" stroke={dark ? '#1f2937' : '#f3f4f6'} strokeWidth="10" strokeLinecap="round"
            />
            {/* Fill */}
            {value > 0 && (
              <path
                d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`}
                fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
              />
            )}
            {/* Center text */}
            <text x="70" y="72" textAnchor="middle" fill={value ? color : (dark ? '#4b5563' : '#d1d5db')} fontSize="22" fontWeight="900">
              {value ?? '—'}
            </text>
            {value && <text x="70" y="88" textAnchor="middle" fill={dark ? '#6b7280' : '#9ca3af'} fontSize="11">°C</text>}
          </svg>
        </div>
        {/* Detail */}
        <div className="space-y-2 flex-1">
          <div className={`flex justify-between text-xs ${sub}`}>
            <span>Normal</span><span style={{ color: '#10b981' }}>0–{thresholdWarn}°C</span>
          </div>
          <div className={`flex justify-between text-xs ${sub}`}>
            <span>Yüksek</span><span style={{ color: '#f59e0b' }}>{thresholdWarn}–{thresholdCrit}°C</span>
          </div>
          <div className={`flex justify-between text-xs ${sub}`}>
            <span>Kritik</span><span style={{ color: '#ef4444' }}>&gt;{thresholdCrit}°C</span>
          </div>
          <div className={`h-px ${dark ? 'bg-white/5' : 'bg-gray-100'} my-1`} />
          <div className={`text-[11px] ${sub}`}>
            {value ? `Ortalama ${value}°C ölçüldü` : 'OSD verisi gönderilince görünür'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MonitoringPage() {
  const { user, dark } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const card = dark ? 'bg-[#161b22]' : 'bg-white';
  const border = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-400' : 'text-gray-500';

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

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const temps = data?.hardware_stats?.temps || {};
  const cpuTemp = temps.cpu_avg || null;
  const gpuTemp = temps.gpu_avg || null;

  return (
    <div className="space-y-5">
      {/* Info banner if no temp */}
      {!cpuTemp && !gpuTemp && (
        <div className={`${card} border ${border} rounded-xl p-4 flex items-start gap-3`}>
          <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
            <Thermometer size={14} className="text-yellow-400" />
          </div>
          <div>
            <p className={`text-sm font-bold ${txt}`}>Sıcaklık Verisi Bekleniyor</p>
            <p className={`text-xs ${sub} mt-0.5`}>
              Sıcaklık verisi için sunucudaki Game Center istemcilerinin OSD sıcaklık bilgisi göndermesi gerekiyor.
              OSD ayarlarında CPU/GPU temp etkinleştirildiğinde buraya otomatik yansır.
            </p>
          </div>
        </div>
      )}

      {/* Temp gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        <TempCard label="CPU Ortalama Sıcaklık" value={cpuTemp} icon={Cpu} thresholdWarn={65} thresholdCrit={80} dark={dark} />
        <TempCard label="GPU Ortalama Sıcaklık" value={gpuTemp} icon={HardDrive} thresholdWarn={70} thresholdCrit={85} dark={dark} />
      </div>

      {/* Active clients stat */}
      <div className={`${card} border ${border} rounded-2xl p-5 sm:p-6`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Activity size={13} className="text-blue-400" />
          </div>
          <h3 className={`font-bold ${txt}`}>Genel Durum</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Aktif PC', value: data?.active_clients ?? '—', color: '#3b82f6' },
            { label: 'CPU Sıcaklık', value: cpuTemp ? `${cpuTemp}°C` : '—', color: '#10b981' },
            { label: 'GPU Sıcaklık', value: gpuTemp ? `${gpuTemp}°C` : '—', color: '#8b5cf6' },
          ].map(({ label, value, color }, i) => (
            <div key={i} className={`rounded-xl p-3 ${dark ? 'bg-white/3' : 'bg-gray-50'}`}>
              <div className="text-lg sm:text-2xl font-black" style={{ color }}>{value}</div>
              <div className={`text-[11px] ${sub} mt-1`}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
