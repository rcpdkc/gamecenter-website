import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Monitor, Wifi, WifiOff, RefreshCw, Loader2, Cpu, HardDrive, MemoryStick, Thermometer, Activity } from 'lucide-react';

const isOnline = (last_seen) => {
  if (!last_seen) return false;
  const d = new Date(last_seen.replace(' ', 'T'));
  return (Date.now() - d.getTime()) < 75 * 60 * 1000; // 75 dakika
};

const TempBadge = ({ value, warn = 65, crit = 80 }) => {
  if (!value && value !== 0) return <span className="text-gray-500 text-xs">—</span>;
  const color = value < warn ? '#10b981' : value < crit ? '#f59e0b' : '#ef4444';
  return (
    <span className="text-xs font-bold tabular-nums" style={{ color }}>
      {value}°C
    </span>
  );
};

const LoadBar = ({ value, color = '#3b82f6' }) => {
  if (!value && value !== 0) return <span className="text-gray-500 text-xs">—</span>;
  const pct = Math.min(value, 100);
  return (
    <div className="flex items-center gap-1.5 min-w-[70px]">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] tabular-nums text-gray-400 w-8 text-right">{value}%</span>
    </div>
  );
};

const OSLabel = ({ os }) => {
  if (!os) return <span className="text-gray-500 text-xs">—</span>;
  const lower = os.toLowerCase();
  const ver = lower.includes('10.0.22') ? 'Win 11' : lower.includes('10.0.19') ? 'Win 10' : 'Windows';
  return <span className="text-xs text-gray-400">{ver}</span>;
};

const ClientRow = ({ pc, dark }) => {
  const online = isOnline(pc.last_seen);
  const sub = dark ? 'text-gray-500' : 'text-gray-400';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const [expanded, setExpanded] = useState(false);
  const row = dark ? 'hover:bg-white/3' : 'hover:bg-gray-50';

  return (
    <>
      <tr
        className={`transition-colors cursor-pointer ${row} ${!online ? 'opacity-50' : ''}`}
        onClick={() => setExpanded(!expanded)}
      >
        {/* PC Adı + Durum */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full shrink-0 ${online ? 'bg-emerald-400' : 'bg-gray-600'}`} />
            <div>
              <p className={`text-sm font-bold ${txt}`}>{pc.hostname}</p>
              <p className={`text-[10px] ${sub} font-mono`}>{pc.ip || '—'}</p>
            </div>
          </div>
        </td>
        {/* CPU */}
        <td className="px-4 py-3">
          <p className={`text-xs ${txt} leading-tight`}>{pc.cpu ? pc.cpu.replace('Intel Core ', '').replace('AMD Ryzen ', 'Ryzen ') : '—'}</p>
          <LoadBar value={pc.cpu_load} color="#3b82f6" />
        </td>
        {/* GPU */}
        <td className="px-4 py-3">
          <p className={`text-xs ${txt} leading-tight`}>{pc.gpu ? pc.gpu.replace('NVIDIA GeForce ', '').replace('AMD Radeon ', '') : '—'}</p>
          <LoadBar value={pc.gpu_load} color="#8b5cf6" />
        </td>
        {/* RAM */}
        <td className="px-4 py-3">
          <p className={`text-xs ${txt}`}>{pc.ram_usage ? `${pc.ram_usage}/${pc.ram_total_gb} GB` : '—'}</p>
          <LoadBar value={pc.ram_load} color="#06b6d4" />
        </td>
        {/* Sıcaklık */}
        <td className="px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1"><Cpu size={9} className="text-gray-500" /><TempBadge value={pc.cpu_temp} /></div>
            <div className="flex items-center gap-1"><HardDrive size={9} className="text-gray-500" /><TempBadge value={pc.gpu_temp} warn={70} crit={85} /></div>
          </div>
        </td>
        {/* OS + Hz */}
        <td className="px-4 py-3">
          <OSLabel os={pc.os} />
          {pc.hertz && <p className={`text-[10px] ${sub}`}>{pc.hertz}Hz</p>}
        </td>
        {/* Son görülme */}
        <td className={`px-4 py-3 text-xs ${sub}`}>
          {pc.last_seen
            ? new Date(pc.last_seen.replace(' ', 'T')).toLocaleString('tr-TR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })
            : '—'}
        </td>
      </tr>
      {/* Expanded detail row */}
      {expanded && (
        <tr className={dark ? 'bg-white/2' : 'bg-gray-50/80'}>
          <td colSpan={7} className="px-6 pb-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {[
                { label: 'Anakart', value: pc.motherboard },
                { label: 'RAM Hızı', value: pc.ram_speed_mhz ? `${pc.ram_speed_mhz} MHz` : null },
                { label: 'Boot Modu', value: pc.boot_mode },
                { label: 'TPM', value: pc.tpm_version ? `v${pc.tpm_version}` : null },
                { label: 'Ağ Hızı', value: pc.link_speed_mbps ? `${pc.link_speed_mbps} Mbps` : null },
                { label: 'MAC', value: pc.mac_address },
                { label: 'Aktif İşlem', value: pc.top_io_process },
                { label: 'IP', value: pc.ip },
              ].map(({ label, value }) => value ? (
                <div key={label} className={`rounded-xl p-2.5 ${dark ? 'bg-white/5' : 'bg-white border border-gray-100'}`}>
                  <p className={`text-[10px] uppercase font-semibold tracking-wide ${dark ? 'text-gray-500' : 'text-gray-400'} mb-0.5`}>{label}</p>
                  <p className={`text-xs font-medium ${dark ? 'text-gray-200' : 'text-gray-700'} break-all`}>{value}</p>
                </div>
              ) : null)}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default function ClientsPage() {
  const { user, dark } = useOutletContext();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | online | offline

  const card = dark ? 'bg-[#161b22]' : 'bg-white';
  const border = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-400' : 'text-gray-500';
  const inputBg = dark ? 'bg-white/5 border-white/10 text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400';

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoints = [
        user.cafe_id ? `/api/telemetry?role=cafe&cafe_id=${user.cafe_id}` : null,
        user.hwid ? `/api/telemetry?hwid=${encodeURIComponent(user.hwid)}` : null,
        user.email ? `/api/telemetry?email=${encodeURIComponent(user.email)}` : null,
      ].filter(Boolean);
      for (const ep of endpoints) {
        const r = await fetch(ep);
        const j = await r.json();
        const rec = (j.data || [])[0];
        if (rec?.clients_data?.length) {
          setClients(rec.clients_data);
          break;
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user.cafe_id]);

  const filtered = clients
    .filter(pc => filter === 'all' ? true : filter === 'online' ? isOnline(pc.last_seen) : !isOnline(pc.last_seen))
    .filter(pc => !search || pc.hostname?.toLowerCase().includes(search.toLowerCase()) || pc.ip?.includes(search) || pc.cpu?.toLowerCase().includes(search.toLowerCase()) || pc.gpu?.toLowerCase().includes(search.toLowerCase()));

  const onlineCount = clients.filter(pc => isOnline(pc.last_seen)).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Toplam PC', value: clients.length, color: txt },
          { label: 'Çevrimiçi', value: onlineCount, color: '#10b981' },
          { label: 'Çevrimdışı', value: clients.length - onlineCount, color: '#6b7280' },
        ].map(s => (
          <div key={s.label} className={`${card} border ${border} rounded-2xl p-4`}>
            <p className={`text-xs ${sub} mb-1`}>{s.label}</p>
            <p className="text-2xl sm:text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className={`${card} border ${border} rounded-2xl overflow-hidden`}>
        {/* Toolbar */}
        <div className={`px-4 py-3 border-b ${border} flex flex-col sm:flex-row items-start sm:items-center gap-3`}>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <Monitor size={15} className="text-orange-400 shrink-0" />
            <h3 className={`font-bold text-sm ${txt}`}>Müşteri Bilgisayarları</h3>
            <span className={`text-xs ${sub}`}>— satıra tıklayarak detay görüntüle</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="PC ara..."
              className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${inputBg} w-36 sm:w-44`}
            />
            {/* Filter */}
            <div className="flex rounded-xl overflow-hidden border border-white/10">
              {[['all','Tümü'],['online','Online'],['offline','Offline']].map(([v,l]) => (
                <button
                  key={v}
                  onClick={() => setFilter(v)}
                  className={`px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                    filter === v
                      ? 'bg-orange-500 text-white'
                      : dark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >{l}</button>
              ))}
            </div>
            {/* Refresh */}
            <button onClick={fetchData} className={`p-1.5 rounded-xl transition-colors ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className={`py-16 text-center ${sub} text-sm`}>
            <Monitor size={32} className="mx-auto mb-3 opacity-30" />
            {clients.length === 0 ? 'Veri henüz gönderilmedi. v3.1.6 kurulduktan sonra görünür.' : 'Eşleşen PC bulunamadı.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className={dark ? 'bg-white/3' : 'bg-gray-50'}>
                  {['PC / IP', 'CPU', 'GPU', 'RAM', '🌡 Sıcaklık', 'OS / Hz', 'Son Görülme'].map(h => (
                    <th key={h} className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider ${sub}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${dark ? 'divide-white/5' : 'divide-gray-100'}`}>
                {filtered.map(pc => (
                  <ClientRow key={pc.hostname} pc={pc} dark={dark} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
