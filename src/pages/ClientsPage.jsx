import { useOutletContext } from 'react-router-dom';
import { useState } from 'react';
import RefreshFromCafeButton from '../components/RefreshFromCafeButton';
import { Monitor, RefreshCw, Cpu, HardDrive, ChevronDown, ChevronUp } from 'lucide-react';
import {
  useCafeTelemetry, Loading, Card, StatCard, StatGrid, ProgressBar, Badge,
  SearchInput, SegFilter, IconButton, EmptyState, tempTone,
} from '../admin/ui';

const isOnline = (last_seen) => {
  if (!last_seen) return false;
  const d = new Date(last_seen.replace(' ', 'T'));
  return (Date.now() - d.getTime()) < 75 * 60 * 1000;
};

const TempBadge = ({ value, kind = 'cpu' }) => {
  if (value == null) return <span className="text-xs" style={{ color: 'var(--a-mut)' }}>—</span>;
  return <Badge tone={tempTone(value, kind)}>{value}°C</Badge>;
};

const LoadBar = ({ value, label, tone = 'info' }) => {
  if (value == null) return <span className="text-xs" style={{ color: 'var(--a-mut)' }}>—</span>;
  return (
    <div className="flex items-center gap-1.5">
      {label && <span className="text-[10px] w-6 shrink-0" style={{ color: 'var(--a-mut)' }}>{label}</span>}
      <div className="flex-1 min-w-[40px]"><ProgressBar value={Math.min(value, 100)} tone={tone} /></div>
      <span className="text-[10px] tabular-nums w-7 text-right shrink-0" style={{ color: 'var(--a-mut)' }}>{value}%</span>
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
const MobileCard = ({ pc }) => {
  const [open, setOpen] = useState(false);
  const online = isOnline(pc.last_seen);

  return (
    <Card className="overflow-hidden">
      {/* Üst satır */}
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: online ? 'var(--a-ok)' : 'var(--a-mut2)' }} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate" style={{ color: 'var(--a-ink)' }}>{pc.hostname}</p>
          <p className="text-[10px] font-mono" style={{ color: 'var(--a-mut)' }}>{pc.ip || '—'}</p>
        </div>
        {/* Sıcaklık özet */}
        <div className="flex gap-2 shrink-0">
          <div className="text-center">
            <p className="text-[9px]" style={{ color: 'var(--a-mut)' }}>CPU</p>
            <TempBadge value={pc.cpu_temp} kind="cpu" />
          </div>
          <div className="text-center">
            <p className="text-[9px]" style={{ color: 'var(--a-mut)' }}>GPU</p>
            <TempBadge value={pc.gpu_temp} kind="gpu" />
          </div>
        </div>
        <div className="shrink-0" style={{ color: 'var(--a-mut)' }}>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Açılır detay */}
      {open && (
        <div className="px-4 pb-4 pt-1 border-t space-y-3" style={{ borderColor: 'var(--a-border)' }}>
          {/* CPU */}
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-wide mb-1" style={{ color: 'var(--a-mut)' }}>CPU</p>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--a-ink)' }}>{shortCpu(pc.cpu)}</p>
            <LoadBar value={pc.cpu_load} tone="info" label="Yük" />
          </div>
          {/* GPU */}
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-wide mb-1" style={{ color: 'var(--a-mut)' }}>GPU</p>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--a-ink)' }}>{shortGpu(pc.gpu)}</p>
            <LoadBar value={pc.gpu_load} tone="accent" label="Yük" />
          </div>
          {/* RAM */}
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-wide mb-1" style={{ color: 'var(--a-mut)' }}>RAM</p>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--a-ink)' }}>{pc.ram_usage ? `${pc.ram_usage} / ${pc.ram_total_gb} GB` : '—'}</p>
            <LoadBar value={pc.ram_load} tone="info" label="Yük" />
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
              <div key={l} className="rounded-xl p-2" style={{ background: 'var(--a-card2)' }}>
                <p className="text-[9px] uppercase mb-0.5" style={{ color: 'var(--a-mut)' }}>{l}</p>
                <p className="text-[11px] font-semibold truncate" style={{ color: 'var(--a-ink)' }}>{v}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px]" style={{ color: 'var(--a-mut)' }}>
            Son görülme: {pc.last_seen ? new Date(pc.last_seen.replace(' ', 'T')).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
          </p>
        </div>
      )}
    </Card>
  );
};

/* ── Masaüstü Tablo Satırı ───────────────────────────────── */
const DesktopRow = ({ pc }) => {
  const [expanded, setExpanded] = useState(false);
  const online = isOnline(pc.last_seen);

  return (
    <>
      <tr className={`transition-colors cursor-pointer hover:bg-[var(--a-card2)] ${!online ? 'opacity-50' : ''}`} onClick={() => setExpanded(!expanded)}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: online ? 'var(--a-ok)' : 'var(--a-mut2)' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--a-ink)' }}>{pc.hostname}</p>
              <p className="text-[10px] font-mono" style={{ color: 'var(--a-mut)' }}>{pc.ip || '—'}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <p className="text-xs leading-tight" style={{ color: 'var(--a-ink)' }}>{shortCpu(pc.cpu)}</p>
          <LoadBar value={pc.cpu_load} tone="info" />
        </td>
        <td className="px-4 py-3">
          <p className="text-xs leading-tight" style={{ color: 'var(--a-ink)' }}>{shortGpu(pc.gpu)}</p>
          <LoadBar value={pc.gpu_load} tone="accent" />
        </td>
        <td className="px-4 py-3">
          <p className="text-xs" style={{ color: 'var(--a-ink)' }}>{pc.ram_usage ? `${pc.ram_usage}/${pc.ram_total_gb}GB` : '—'}</p>
          <LoadBar value={pc.ram_load} tone="info" />
        </td>
        <td className="px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1"><Cpu size={9} style={{ color: 'var(--a-mut)' }} /><TempBadge value={pc.cpu_temp} kind="cpu" /></div>
            <div className="flex items-center gap-1"><HardDrive size={9} style={{ color: 'var(--a-mut)' }} /><TempBadge value={pc.gpu_temp} kind="gpu" /></div>
          </div>
        </td>
        <td className="px-4 py-3 text-xs" style={{ color: 'var(--a-mut)' }}>{osLabel(pc.os)}{pc.hertz ? <p className="text-[10px]">{pc.hertz}Hz</p> : null}</td>
        <td className="px-4 py-3 text-xs" style={{ color: 'var(--a-mut)' }}>
          {pc.last_seen ? new Date(pc.last_seen.replace(' ', 'T')).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'}
        </td>
      </tr>
      {expanded && (
        <tr style={{ background: 'var(--a-card2)' }}>
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
                <div key={label} className="rounded-xl p-2.5 border" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)' }}>
                  <p className="text-[10px] uppercase font-semibold tracking-wide mb-0.5" style={{ color: 'var(--a-mut)' }}>{label}</p>
                  <p className="text-xs font-medium break-all" style={{ color: 'var(--a-ink2)' }}>{value}</p>
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
  const { data, error, reload } = useCafeTelemetry(user);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  if (!data && !error) return <Loading label="Bilgisayarlar yükleniyor…" />;

  const clients = data?.clients_data || [];

  const filtered = clients
    .filter(pc => filter === 'all' ? true : filter === 'online' ? isOnline(pc.last_seen) : !isOnline(pc.last_seen))
    .filter(pc => !search || pc.hostname?.toLowerCase().includes(search.toLowerCase()) || pc.ip?.includes(search) || pc.cpu?.toLowerCase().includes(search.toLowerCase()) || pc.gpu?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (a.hostname || '').localeCompare(b.hostname || '', 'tr', { numeric: true }));

  const onlineCount = clients.filter(pc => isOnline(pc.last_seen)).length;

  return (
    <div className="space-y-4">
      {/* Kafe sunucusundan taze veri iste */}
      <div className="flex justify-end">
        <RefreshFromCafeButton user={user} dark={dark} onRefreshed={reload} />
      </div>

      {/* Stats */}
      <StatGrid cols={3}>
        <StatCard icon={Monitor} label="Toplam PC" value={clients.length} tone="info" />
        <StatCard icon={Monitor} label="Çevrimiçi" value={onlineCount} tone="ok" />
        <StatCard icon={Monitor} label="Çevrimdışı" value={clients.length - onlineCount} tone="mut" />
      </StatGrid>

      {/* Toolbar + tablo */}
      <Card>
        <div className="px-4 py-3 border-b flex flex-wrap items-center justify-end gap-2" style={{ borderColor: 'var(--a-border)' }}>
          <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="PC ara…" className="w-40 sm:w-56" />
          <SegFilter
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'all', label: 'Tümü', count: clients.length },
              { value: 'online', label: 'Açık', count: onlineCount },
              { value: 'offline', label: 'Kapalı', count: clients.length - onlineCount },
            ]}
          />
          <IconButton icon={RefreshCw} title="Yenile" onClick={reload} />
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={Monitor}
            title={clients.length === 0 ? 'Veri henüz gönderilmedi' : 'Eşleşen PC bulunamadı'}
            hint={clients.length === 0 ? 'v3.1.6 kurulduktan sonra bilgisayarlar burada görünür.' : undefined}
          />
        ) : (
          <>
            {/* MOBİL: kart grid (sm altı) */}
            <div className="sm:hidden p-3 space-y-2">
              {filtered.map(pc => <MobileCard key={pc.hostname} pc={pc} />)}
            </div>

            {/* MASAÜSTÜ: tablo (sm ve üzeri) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr style={{ background: 'var(--a-card2)' }}>
                    {['PC / IP', 'CPU', 'GPU', 'RAM', '🌡 Sıcaklık', 'OS / Hz', 'Son Görülme'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--a-mut)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--a-border)]">
                  {filtered.map(pc => <DesktopRow key={pc.hostname} pc={pc} />)}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
