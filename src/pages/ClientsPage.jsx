import { useOutletContext } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Monitor, RefreshCw, Cpu, HardDrive, ChevronDown, ChevronUp } from 'lucide-react';

const isOnline = (last_seen) => {
  if (!last_seen) return false;
  const d = new Date(last_seen.replace(' ', 'T'));
  return (Date.now() - d.getTime()) < 75 * 60 * 1000;
};

const TempBadge = ({ value, warn = 65, crit = 80 }) => {
  if (!value && value !== 0) return <span className="text-gray-500 text-xs">—</span>;
  const color = value < warn ? '#10b981' : value < crit ? '#f59e0b' : '#ef4444';
  return <span className="text-xs font-bold tabular-nums" style={{ color }}>{value}°C</span>;
};

const LoadBar = ({ value, color = '#3b82f6', label }) => {
  if (!value && value !== 0) return <span className="text-gray-500 text-xs">—</span>;
  const pct = Math.min(value, 100);
  return (
    <div className="flex items-center gap-1.5">
      {label && <span className="text-[10px] text-gray-500 w-6 shrink-0">{label}</span>}
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden min-w-[40px]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] tabular-nums text-gray-400 w-7 text-right shrink-0">{value}%</span>
    </div>
  );
};

const osLabel = (os) => {
  if (!os) return '—';
  const l = os.toLowerCase();
  return l.includes('10.0.22') ? 'Win 11' : l.includes('10.0.19') ? 'Win 10' : 'Windows';
};

const shortCpu = (cpu) => cpu ? cpu.replace('Intel Core ', '').replace('AMD Ryzen ', 'Ryzen ') : '—';
const shortGpu = (gpu) => gpu ? gpu.replace('NVIDIA GeForce ', '').replace('AMD Radeon RX ', 'RX ').replace('AMD Radeon ', '') : '—';

/* ── Mobil Kart ──────────────────────────────────────────── */
const MobileCard = ({ pc, dark }) => {
  const [open, setOpen] = useState(false);
  const online = isOnline(pc.last_seen);
  const card = dark ? 'bg-[#161b22] border-white/5' : 'bg-white border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className={`border rounded-2xl overflow-hidden ${card}`}>
      {/* Üst satır */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${online ? 'bg-emerald-400' : 'bg-gray-600'}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold truncate ${txt}`}>{pc.hostname}</p>
          <p className={`text-[10px] font-mono ${sub}`}>{pc.ip || '—'}</p>
        </div>
        {/* Sıcaklık özet */}
        <div className="flex gap-2 shrink-0">
          <div className="text-center">
            <p className="text-[9px] text-gray-500">CPU</p>
            <TempBadge value={pc.cpu_temp} />
          </div>
          <div className="text-center">
            <p className="text-[9px] text-gray-500">GPU</p>
            <TempBadge value={pc.gpu_temp} warn={70} crit={85} />
          </div>
        </div>
        <div className={`${sub} shrink-0`}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Açılır detay */}
      {open && (
        <div className={`px-4 pb-4 pt-1 border-t ${dark ? 'border-white/5' : 'border-gray-100'} space-y-3`}>
          {/* CPU */}
          <div>
            <p className={`text-[10px] uppercase font-semibold tracking-wide ${sub} mb-1`}>CPU</p>
            <p className={`text-xs font-medium ${txt} mb-1`}>{shortCpu(pc.cpu)}</p>
            <LoadBar value={pc.cpu_load} color="#3b82f6" label="Yük" />
          </div>
          {/* GPU */}
          <div>
            <p className={`text-[10px] uppercase font-semibold tracking-wide ${sub} mb-1`}>GPU</p>
            <p className={`text-xs font-medium ${txt} mb-1`}>{shortGpu(pc.gpu)}</p>
            <LoadBar value={pc.gpu_load} color="#8b5cf6" label="Yük" />
          </div>
          {/* RAM */}
          <div>
            <p className={`text-[10px] uppercase font-semibold tracking-wide ${sub} mb-1`}>RAM</p>
            <p className={`text-xs font-medium ${txt} mb-1`}>{pc.ram_usage ? `${pc.ram_usage} / ${pc.ram_total_gb} GB` : '—'}</p>
            <LoadBar value={pc.ram_load} color="#06b6d4" label="Yük" />
          </div>
          {/* Detay grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {[
              { l: 'OS', v: osLabel(pc.os) },
              { l: 'Hz', v: pc.hertz ? `${pc.hertz} Hz` : '—' },
              { l: 'Boot', v: pc.boot_mode },
              { l: 'TPM', v: pc.tpm_version ? `v${pc.tpm_version}` : '—' },
              { l: 'Ağ', v: pc.link_speed_mbps ? `${pc.link_speed_mbps} Mbps` : '—' },
              { l: 'RAM Hız', v: pc.ram_speed_mhz ? `${pc.ram_speed_mhz} MHz` : '—' },
            ].filter(x => x.v && x.v !== '—').map(({ l, v }) => (
              <div key={l} className={`rounded-xl p-2 ${dark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-[9px] uppercase ${sub} mb-0.5`}>{l}</p>
                <p className={`text-[11px] font-semibold ${txt} truncate`}>{v}</p>
              </div>
            ))}
          </div>
          <p className={`text-[10px] ${sub}`}>
            Son görülme: {pc.last_seen ? new Date(pc.last_seen.replace(' ', 'T')).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
          </p>
        </div>
      )}
    </div>
  );
};

/* ── Masaüstü Tablo Satırı ───────────────────────────────── */
const DesktopRow = ({ pc, dark }) => {
  const [expanded, setExpanded] = useState(false);
  const online = isOnline(pc.last_seen);
  const sub = dark ? 'text-gray-500' : 'text-gray-400';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const row = dark ? 'hover:bg-white/3' : 'hover:bg-gray-50';

  return (
    <>
      <tr className={`transition-colors cursor-pointer ${row} ${!online ? 'opacity-50' : ''}`} onClick={() => setExpanded(!expanded)}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full shrink-0 ${online ? 'bg-emerald-400' : 'bg-gray-600'}`} />
            <div>
              <p className={`text-sm font-bold ${txt}`}>{pc.hostname}</p>
              <p className={`text-[10px] ${sub} font-mono`}>{pc.ip || '—'}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <p className={`text-xs ${txt} leading-tight`}>{shortCpu(pc.cpu)}</p>
          <LoadBar value={pc.cpu_load} color="#3b82f6" />
        </td>
        <td className="px-4 py-3">
          <p className={`text-xs ${txt} leading-tight`}>{shortGpu(pc.gpu)}</p>
          <LoadBar value={pc.gpu_load} color="#8b5cf6" />
        </td>
        <td className="px-4 py-3">
          <p className={`text-xs ${txt}`}>{pc.ram_usage ? `${pc.ram_usage}/${pc.ram_total_gb}GB` : '—'}</p>
          <LoadBar value={pc.ram_load} color="#06b6d4" />
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1"><Cpu size={9} className="text-gray-500" /><TempBadge value={pc.cpu_temp} /></div>
            <div className="flex items-center gap-1"><HardDrive size={9} className="text-gray-500" /><TempBadge value={pc.gpu_temp} warn={70} crit={85} /></div>
          </div>
        </td>
        <td className={`px-4 py-3 text-xs ${sub}`}>{osLabel(pc.os)}{pc.hertz ? <p className="text-[10px]">{pc.hertz}Hz</p> : null}</td>
        <td className={`px-4 py-3 text-xs ${sub}`}>
          {pc.last_seen ? new Date(pc.last_seen.replace(' ', 'T')).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
        </td>
      </tr>
      {expanded && (
        <tr className={dark ? 'bg-white/2' : 'bg-gray-50/80'}>
          <td colSpan={7} className="px-6 pb-4 pt-2">
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Anakart', value: pc.motherboard },
                { label: 'RAM Hızı', value: pc.ram_speed_mhz ? `${pc.ram_speed_mhz} MHz` : null },
                { label: 'Boot Modu', value: pc.boot_mode },
                { label: 'TPM', value: pc.tpm_version ? `v${pc.tpm_version}` : null },
                { label: 'Ağ Hızı', value: pc.link_speed_mbps ? `${pc.link_speed_mbps} Mbps` : null },
                { label: 'MAC', value: pc.mac_address },
                { label: 'Aktif İşlem', value: pc.top_io_process },
              ].filter(x => x.value).map(({ label, value }) => (
                <div key={label} className={`rounded-xl p-2.5 ${dark ? 'bg-white/5' : 'bg-white border border-gray-100'}`}>
                  <p className={`text-[10px] uppercase font-semibold tracking-wide ${sub} mb-0.5`}>{label}</p>
                  <p className={`text-xs font-medium ${dark ? 'text-gray-200' : 'text-gray-700'} break-all`}>{value}</p>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

/* ── Ana Sayfa ───────────────────────────────────────────── */
export default function ClientsPage() {
  const { user, dark } = useOutletContext();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

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
        if (rec?.clients_data?.length) { setClients(rec.clients_data); break; }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user.cafe_id]);

  const filtered = clients
    .filter(pc => filter === 'all' ? true : filter === 'online' ? isOnline(pc.last_seen) : !isOnline(pc.last_seen))
    .filter(pc => !search || pc.hostname?.toLowerCase().includes(search.toLowerCase()) || pc.ip?.includes(search) || pc.cpu?.toLowerCase().includes(search.toLowerCase()) || pc.gpu?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.hostname || '').localeCompare(b.hostname || '', 'tr', { numeric: true }));

  const onlineCount = clients.filter(pc => isOnline(pc.last_seen)).length;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Toplam PC', value: clients.length, color: txt },
          { label: 'Çevrimiçi', value: onlineCount, color: '#10b981' },
          { label: 'Çevrimdışı', value: clients.length - onlineCount, color: '#6b7280' },
        ].map(s => (
          <div key={s.label} className={`${card} border ${border} rounded-2xl p-3 sm:p-4`}>
            <p className={`text-[11px] sm:text-xs ${sub} mb-1`}>{s.label}</p>
            <p className="text-2xl sm:text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className={`${card} border ${border} rounded-2xl`}>
        <div className={`px-4 py-3 border-b ${border} flex flex-wrap items-center gap-2`}>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Monitor size={14} className="text-orange-400 shrink-0" />
            <h3 className={`font-bold text-sm ${txt} truncate`}>Bilgisayarlar</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="PC ara..."
              className={`border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${inputBg} w-32 sm:w-44`}
            />
            <div className="flex rounded-xl overflow-hidden border border-white/10">
              {[['all','Tümü'],['online','Açık'],['offline','Kapalı']].map(([v,l]) => (
                <button key={v} onClick={() => setFilter(v)}
                  className={`px-2 py-1.5 text-[11px] font-semibold transition-colors ${filter === v ? 'bg-orange-500 text-white' : dark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {l}
                </button>
              ))}
            </div>
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
          <>
            {/* MOBİL: kart grid (sm altı) */}
            <div className="sm:hidden p-3 space-y-2">
              {filtered.map(pc => <MobileCard key={pc.hostname} pc={pc} dark={dark} />)}
            </div>

            {/* MASAÜSTÜ: tablo (sm ve üzeri) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className={dark ? 'bg-white/3' : 'bg-gray-50'}>
                    {['PC / IP','CPU','GPU','RAM','🌡 Sıcaklık','OS / Hz','Son Görülme'].map(h => (
                      <th key={h} className={`px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider ${sub}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${dark ? 'divide-white/5' : 'divide-gray-100'}`}>
                  {filtered.map(pc => <DesktopRow key={pc.hostname} pc={pc} dark={dark} />)}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
