import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { HardDrive, Cpu, Monitor, MemoryStick, Layers } from 'lucide-react';

const COLORS = ['#f97316','#3b82f6','#10b981','#8b5cf6','#ef4444','#f59e0b','#06b6d4','#ec4899'];

const HwSection = ({ title, icon: Icon, color, items, unit = 'adet', dark }) => {
  const card = dark ? 'bg-[#161b22]' : 'bg-white';
  const border = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-400' : 'text-gray-500';
  const rowBg = dark ? 'bg-white/[0.03] hover:bg-white/[0.06]' : 'bg-gray-50 hover:bg-gray-100';
  const total = items.reduce((a, x) => a + x.count, 0);

  return (
    <div className={`${card} border ${border} rounded-2xl p-5 sm:p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center`} style={{ background: color + '18', border: `1px solid ${color}30` }}>
            <Icon size={13} style={{ color }} />
          </div>
          <h3 className={`font-bold text-sm ${txt}`}>{title}</h3>
        </div>
        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${dark ? 'bg-white/5' : 'bg-gray-100'} ${sub}`}>{total} toplam</span>
      </div>
      {items.length === 0 ? (
        <div className={`flex items-center justify-center h-20 text-sm ${sub}`}>Veri yok</div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => {
            const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs sm:text-sm ${txt} truncate flex-1 mr-3`}>{item.name}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] ${sub}`}>%{pct}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: color + '15', color }}>{item.count} {unit}</span>
                  </div>
                </div>
                <div className={`h-1.5 rounded-full ${dark ? 'bg-white/5' : 'bg-gray-100'} overflow-hidden`}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function HardwarePage() {
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

  const gpus = data?.hardware_stats?.gpus || [];
  const cpus = data?.hardware_stats?.cpus || [];
  const totalPCs = gpus.reduce((a, g) => a + g.count, 0);

  return (
    <div className="space-y-5">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: 'Toplam PC', value: totalPCs || '—', color: '#3b82f6', icon: Monitor },
          { label: 'GPU Modeli', value: gpus.length || '—', color: '#8b5cf6', icon: HardDrive },
          { label: 'CPU Modeli', value: cpus.length || '—', color: '#f97316', icon: Cpu },
        ].map(({ label, value, color, icon: Icon }, i) => (
          <div key={i} className={`${card} border ${border} rounded-2xl p-4 sm:p-5 relative overflow-hidden`}>
            <div className="absolute -right-3 -bottom-3 opacity-[0.04]"><Icon size={70} /></div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3" style={{ background: color + '15', border: `1px solid ${color}30` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <div className={`text-2xl sm:text-3xl font-black ${txt}`}>{value}</div>
            <div className={`text-xs font-medium ${sub} mt-1.5`}>{label}</div>
          </div>
        ))}
      </div>

      {/* GPU Section */}
      <HwSection title="Ekran Kartları (GPU)" icon={HardDrive} color="#8b5cf6" items={gpus} dark={dark} />

      {/* CPU Section */}
      <HwSection title="İşlemciler (CPU)" icon={Cpu} color="#3b82f6" items={cpus} dark={dark} />

      {/* No data */}
      {!data && (
        <div className={`${card} border ${border} rounded-2xl p-16 text-center`}>
          <Layers size={40} className={`mx-auto mb-4 ${sub} opacity-30`} />
          <p className={`font-bold ${txt} mb-2`}>Donanım Verisi Bekleniyor</p>
          <p className={`text-sm ${sub}`}>Game Center Server çalışırken donanım bilgileri otomatik gönderilir.</p>
        </div>
      )}
    </div>
  );
}
