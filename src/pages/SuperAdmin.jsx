import { useEffect, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import {
  Server, Gamepad2, Cpu, Clock, Wifi, AlertTriangle, Crown, Zap, Gift,
  ChevronDown, ChevronUp, Monitor, RefreshCw, Layers, HardDrive, Trash2, Link,
} from 'lucide-react';
import {
  COLORS, tempTone, Card, CardHeader, Button, IconButton, SearchInput, Badge,
  StatCard, StatGrid, EmptyState, Loading, Modal, useConfirm, TopGamesList, TempGauge, useCafeTelemetry,
} from '../admin/ui';

const PLAN_META = {
  free: { label: 'Free', icon: Gift, tone: 'mut' },
  pro: { label: 'Pro', icon: Zap, tone: 'info' },
  enterprise: { label: 'Enterprise', icon: Crown, tone: 'accent' },
};

// ─── Her kafe için genişletilebilir kart ───────────────────────────────────
const CafeCard = ({ cafe, index, onDelete }) => {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { confirm, confirmNode } = useConfirm();

  const lastUpdated = new Date(cafe.last_updated);
  const minsAgo = Math.round((Date.now() - lastUpdated) / 60000);
  const isOnline = minsAgo < 20;

  const topGames = (cafe.top_games || []).slice(0, 6);
  const gpus = cafe.hardware_stats?.gpus || [];
  const cpus = cafe.hardware_stats?.cpus || [];

  const onDeleteClick = async (e) => {
    e.stopPropagation();
    const ok = await confirm({
      title: 'Kafeyi Sil',
      message: `${cafe.cafe_name} kaydı kalıcı olarak silinecek. Sunucu aktifse bir sonraki telemetride tekrar görünür.`,
      tone: 'danger',
      confirmLabel: 'Evet, Sil',
    });
    if (!ok) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('gc_admin_token');
      await fetch(`/api/telemetry?hwid=${encodeURIComponent(cafe.hwid || cafe.cafe_id)}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      onDelete(cafe.hwid || cafe.cafe_id);
    } catch (_) {}
    setDeleting(false);
  };

  const accent = COLORS[index % COLORS.length];

  return (
    <Card className="overflow-hidden">
      {/* ── Başlık satırı (her zaman görünür) ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:brightness-105"
      >
        {/* Sıra numarası */}
        <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
          style={{ background: accent + '22', color: accent }}>
          {index + 1}
        </span>

        {/* Kafe adı */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate" style={{ color: 'var(--a-ink)' }}>{cafe.cafe_name}</p>
          <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--a-mut2)' }}>
            <Clock size={10} />
            {minsAgo < 1 ? 'Az önce' : `${minsAgo} dk önce`}
          </p>
        </div>

        {/* PC sayısı */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Monitor size={14} style={{ color: 'var(--a-info)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--a-ink)' }}>{cafe.active_clients}</span>
          <span className="text-xs" style={{ color: 'var(--a-mut)' }}>PC</span>
        </div>

        {/* Top oyun */}
        {topGames[0] && (
          <div className="hidden sm:flex items-center gap-1.5 shrink-0 max-w-[140px]">
            <Gamepad2 size={13} className="shrink-0" style={{ color: 'var(--a-accent)' }} />
            <span className="text-xs truncate" style={{ color: 'var(--a-mut)' }}>{topGames[0].name}</span>
          </div>
        )}

        {/* GPU */}
        {gpus[0] && (
          <div className="hidden lg:flex items-center gap-1.5 shrink-0 max-w-[150px]">
            <HardDrive size={13} className="shrink-0" style={{ color: 'var(--a-mut)' }} />
            <span className="text-xs truncate" style={{ color: 'var(--a-mut)' }}>{gpus[0].name}</span>
          </div>
        )}

        {/* Online badge */}
        <span className="hidden sm:inline-flex shrink-0">
          <Badge tone={isOnline ? 'ok' : 'mut'} dot>{isOnline ? 'Çevrimiçi' : 'Pasif'}</Badge>
        </span>

        {/* Sil */}
        <span
          onClick={onDeleteClick}
          role="button"
          className="shrink-0 p-1.5 rounded-lg transition-colors hover:brightness-110"
          style={{ color: 'var(--a-mut)' }}
          title="Kafeyi sil"
        >
          <Trash2 size={14} className={deleting ? 'animate-pulse' : ''} />
        </span>

        {/* Aç/kapat */}
        {open ? <ChevronUp size={16} style={{ color: 'var(--a-mut)' }} /> : <ChevronDown size={16} style={{ color: 'var(--a-mut)' }} />}
      </button>

      {/* ── Detay paneli (genişletilince görünür) ── */}
      {open && (
        <div className="border-t grid grid-cols-1 lg:grid-cols-3" style={{ borderColor: 'var(--a-border)' }}>

          {/* En çok oynanan oyunlar */}
          <div className="p-5 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--a-mut2)' }}>
              En Çok Oynanan Oyunlar
            </p>
            {topGames.length === 0
              ? <p className="text-sm" style={{ color: 'var(--a-mut)' }}>Oyun verisi yok</p>
              : <TopGamesList games={topGames} limit={6} />}
          </div>

          {/* Donanım bilgisi */}
          <div className="p-5 lg:border-l" style={{ borderColor: 'var(--a-border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--a-mut2)' }}>Donanım</p>

            {gpus.length > 0 && (
              <div className="mb-4">
                <p className="text-xs mb-1.5 flex items-center gap-1" style={{ color: 'var(--a-mut)' }}>
                  <HardDrive size={11} style={{ color: 'var(--a-accent)' }} /> GPU'lar
                </p>
                <div className="space-y-1">
                  {gpus.slice(0, 4).map((g, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs truncate max-w-[140px]" style={{ color: 'var(--a-ink)' }}>{g.name}</span>
                      <span className="text-xs font-bold ml-2 shrink-0" style={{ color: 'var(--a-accent)' }}>{g.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {cpus.length > 0 && (
              <div>
                <p className="text-xs mb-1.5 flex items-center gap-1" style={{ color: 'var(--a-mut)' }}>
                  <Cpu size={11} style={{ color: 'var(--a-info)' }} /> CPU'lar
                </p>
                <div className="space-y-1">
                  {cpus.slice(0, 4).map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs truncate max-w-[140px]" style={{ color: 'var(--a-ink)' }}>{c.name}</span>
                      <span className="text-xs font-bold ml-2 shrink-0" style={{ color: 'var(--a-info)' }}>{c.count}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gpus.length === 0 && cpus.length === 0 && (
              <p className="text-xs" style={{ color: 'var(--a-mut)' }}>Donanım verisi yok</p>
            )}
          </div>
        </div>
      )}

      {confirmNode}
    </Card>
  );
};

// ===== CAFE DASHBOARD (kafe sahibi - sadece kendi verisi) =====
const CafeDashboard = ({ user }) => {
  const { data, error, reload } = useCafeTelemetry(user);

  const licenseExpired = user.license_expired;
  const plan = user.plan || 'free';
  const planMeta = PLAN_META[plan] || PLAN_META.free;

  if (licenseExpired) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 p-8">
        <div className="w-20 h-20 rounded-2xl grid place-items-center" style={{ background: 'var(--a-card2)', border: '1px solid var(--a-border)' }}>
          <AlertTriangle size={36} style={{ color: 'var(--a-danger)' }} />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--a-ink)' }}>Lisansınız Sona Erdi</h2>
        <p className="text-sm max-w-sm" style={{ color: 'var(--a-mut)' }}>Game Center Cloud erişiminiz sona ermiştir. Yenileme için sistem yöneticinizle iletişime geçin.</p>
        <Badge tone="danger">Hesap Askıya Alındı</Badge>
      </div>
    );
  }

  if (data === null && !error) {
    return <Loading label="Veriler yükleniyor..." />;
  }

  const topGames = data?.top_games || [];
  const clientsData = data?.clients_data || [];
  const temps = data?.hardware_stats?.temps || {};
  const cpuTemp = temps.cpu_avg || null;
  const gpuTemp = temps.gpu_avg || null;
  const totalGames = topGames.length;

  // En sıcak GPU/CPU - clients_data üzerinden
  const hotGpu = clientsData.filter(p => p.gpu_temp).sort((a, b) => b.gpu_temp - a.gpu_temp)[0] || null;
  const hotCpu = clientsData.filter(p => p.cpu_temp).sort((a, b) => b.cpu_temp - a.cpu_temp)[0] || null;
  const hotGpus = clientsData.filter(p => p.gpu_temp).sort((a, b) => b.gpu_temp - a.gpu_temp).slice(0, 6);
  const hotCpus = clientsData.filter(p => p.cpu_temp).sort((a, b) => b.cpu_temp - a.cpu_temp).slice(0, 6);

  const lastUpdated = data?.last_updated ? new Date(data.last_updated) : null;
  const minsAgo = lastUpdated ? Math.round((Date.now() - lastUpdated) / 60000) : null;
  const isOnline = minsAgo !== null && minsAgo < 20;

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* ── Hero Header (sadeleştirildi) ── */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-black truncate" style={{ color: 'var(--a-ink)' }}>{user.cafe_name || 'Kafeniz'}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge tone={isOnline ? 'ok' : 'mut'} dot>{isOnline ? 'Çevrimiçi' : 'Pasif'}</Badge>
              {minsAgo !== null && (
                <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--a-mut2)' }}>
                  <Clock size={9} />
                  {minsAgo < 1 ? 'Az önce' : `${minsAgo} dk önce`}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={planMeta.tone}>
              <planMeta.icon size={12} />
              {planMeta.label} Plan
              {user.plan_expires_at && <span className="opacity-70 hidden sm:inline"> · {new Date(user.plan_expires_at).toLocaleDateString('tr-TR')}</span>}
            </Badge>
            <IconButton icon={RefreshCw} title="Yenile" onClick={reload} />
          </div>
        </div>
      </Card>

      {/* ── 4 Stat Cards ── */}
      <StatGrid>
        <StatCard icon={Monitor} label="Aktif PC" value={data?.active_clients ?? '—'} tone="info" />
        <StatCard icon={Gamepad2} label="Toplam Oyun" value={totalGames > 0 ? totalGames : '—'} tone="ok" />
        <StatCard icon={HardDrive} label="En Sıcak GPU" value={hotGpu ? `${hotGpu.gpu_temp}°C` : '—'} hint={hotGpu?.hostname} tone="accent" />
        <StatCard icon={Cpu} label="En Sıcak CPU" value={hotCpu ? `${hotCpu.cpu_temp}°C` : '—'} hint={hotCpu?.hostname} tone="warn" />
      </StatGrid>

      {/* ── Sıcaklık Kartları ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <TempGauge temp={cpuTemp} label="CPU Sıcaklığı (Ort.)" kind="cpu" />
        <TempGauge temp={gpuTemp} label="GPU Sıcaklığı (Ort.)" kind="gpu" />
      </div>

      {/* ── Oyunlar + Donanım ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">

        {/* En çok oynanan oyunlar */}
        <Card>
          <CardHeader
            title="En Çok Oynanan"
            icon={Gamepad2}
            right={<Badge tone="mut">{topGames.length} oyun</Badge>}
          />
          <div className="p-4 sm:p-5">
            {topGames.length === 0
              ? <EmptyState icon={Gamepad2} title="Oyun verisi bekleniyor..." />
              : <TopGamesList games={topGames} limit={8} />}
          </div>
        </Card>

        {/* Donanım Envanteri */}
        <Card>
          <CardHeader title="Donanım Envanteri" icon={Layers} />
          <div className="p-4 sm:p-5">
            {hotGpus.length === 0 && hotCpus.length === 0 ? (
              <EmptyState icon={HardDrive} title="Sıcaklık verisi bekleniyor..." />
            ) : (
              <div className="space-y-4">
                {hotGpus.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1" style={{ color: 'var(--a-accent)' }}>
                      <HardDrive size={9} /> En Sıcak GPU
                    </p>
                    <div className="space-y-1.5">
                      {hotGpus.map((pc, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl" style={{ background: 'var(--a-card2)' }}>
                          <span className="text-xs sm:text-sm truncate flex-1 mr-2" style={{ color: 'var(--a-ink)' }}>{pc.hostname}</span>
                          <Badge tone={tempTone(pc.gpu_temp, 'gpu')}>{pc.gpu_temp}°C</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {hotCpus.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1" style={{ color: 'var(--a-info)' }}>
                      <Cpu size={9} /> En Sıcak CPU
                    </p>
                    <div className="space-y-1.5">
                      {hotCpus.map((pc, i) => (
                        <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl" style={{ background: 'var(--a-card2)' }}>
                          <span className="text-xs sm:text-sm truncate flex-1 mr-2" style={{ color: 'var(--a-ink)' }}>{pc.hostname}</span>
                          <Badge tone={tempTone(pc.cpu_temp, 'cpu')}>{pc.cpu_temp}°C</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Veri Yok Durumu ── */}
      {!data && (
        <Card className="p-10 sm:p-16">
          <EmptyState
            icon={Server}
            title="Veri Bekleniyor"
            hint="Kafenizden henüz telemetri verisi gelmedi. Game Center Server'ın çalıştığından emin olun."
          />
        </Card>
      )}
    </div>
  );
};

// ===== ADMIN DASHBOARD (tam görünüm - tüm kafeler) =====
const AdminDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [linkData, setLinkData] = useState(null); // { users, telemetry_records }
  const [linkModal, setLinkModal] = useState(false);
  const [linking, setLinking] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedTelemetry, setSelectedTelemetry] = useState('');
  const [linkMsg, setLinkMsg] = useState('');

  const handleDelete = useCallback((hwid) => {
    setData(prev => prev.filter(c => (c.hwid || c.cafe_id) !== hwid));
  }, []);

  const tooltipStyle = { background: 'var(--a-card)', border: '1px solid var(--a-border)', borderRadius: 8, color: 'var(--a-ink)' };

  const fetchData = () => {
    setLoading(true);
    fetch('/api/telemetry?role=admin')
      .then(r => r.json())
      .then(j => { setData(j.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const loadLinkData = () => {
    const token = localStorage.getItem('gc_admin_token');
    setLinkMsg('');
    fetch('/api/users?view=cafe-link', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(j => { setLinkData(j); setLinkModal(true); })
      .catch(() => setLinkMsg('Yüklenemedi.'));
  };

  const doLink = async () => {
    if (!selectedUser || !selectedTelemetry) return;
    setLinking(true);
    setLinkMsg('');
    const token = localStorage.getItem('gc_admin_token');
    try {
      const r = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'cafe-link', user_email: selectedUser, telemetry_cafe_id: selectedTelemetry }),
      });
      const j = await r.json();
      if (j.success) {
        setLinkMsg('✅ ' + j.message);
        loadLinkData(); // yenile
      } else {
        setLinkMsg('❌ ' + (j.error || 'Hata'));
      }
    } catch { setLinkMsg('❌ Bağlantı hatası.'); }
    setLinking(false);
  };

  useEffect(() => { fetchData(); }, []);

  // Genel istatistikler
  const totalCafes = data.length;
  const totalClients = data.reduce((s, c) => s + (c.active_clients || 0), 0);
  const gameStats = {};
  data.forEach(cafe => { if (cafe.top_games) cafe.top_games.forEach(g => { gameStats[g.name] = (gameStats[g.name] || 0) + g.clicks; }); });
  const sortedGames = Object.entries(gameStats).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, clicks]) => ({ name, clicks }));
  const gpuStats = {};
  data.forEach(cafe => { if (cafe.hardware_stats?.gpus) cafe.hardware_stats.gpus.forEach(gpu => { gpuStats[gpu.name] = (gpuStats[gpu.name] || 0) + gpu.count; }); });
  const sortedGpus = Object.entries(gpuStats).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));

  const filteredCafes = data.filter(c =>
    c.cafe_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <Loading label="Veriler buluttan çekiliyor..." />;
  }

  return (
    <div className="space-y-6">

      {/* ── Hesap Bağlama Modal ── */}
      <Modal open={linkModal} onClose={() => { setLinkModal(false); setLinkMsg(''); }} title="Kafe Hesabı Bağla" icon={Link}>
        {/* Bağlanmamış kullanıcılar listesi */}
        {linkData?.users?.filter(u => !u.is_linked).length > 0 && (
          <div className="mb-4 p-3 rounded-lg border" style={{ background: 'var(--a-card2)', borderColor: 'var(--a-warn)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--a-warn)' }}>Bağlanmamış hesaplar:</p>
            {linkData.users.filter(u => !u.is_linked).map(u => (
              <p key={u.email} className="text-xs" style={{ color: 'var(--a-warn)' }}>{u.email} ({u.cafe_name})</p>
            ))}
          </div>
        )}

        <div className="space-y-3 mb-4">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--a-ink)' }}>Kullanıcı (e-posta)</label>
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              style={{ background: 'var(--a-card2)', color: 'var(--a-ink)', border: '1px solid var(--a-border)' }}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
            >
              <option value="" style={{ background: 'var(--a-card)', color: 'var(--a-ink)' }}>Kullanıcı seç...</option>
              {(linkData?.users || []).map(u => (
                <option key={u.email} value={u.email} style={{ background: 'var(--a-card)', color: 'var(--a-ink)' }}>
                  {u.is_linked ? '✅' : '⚠️'} {u.cafe_name || '?'} — {u.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: 'var(--a-ink)' }}>Telemetri Kaydı (Sunucu)</label>
            <select
              value={selectedTelemetry}
              onChange={e => setSelectedTelemetry(e.target.value)}
              style={{ background: 'var(--a-card2)', color: 'var(--a-ink)', border: '1px solid var(--a-border)' }}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
            >
              <option value="" style={{ background: 'var(--a-card)', color: 'var(--a-ink)' }}>Telemetri seç...</option>
              {(linkData?.telemetry_records || []).map(t => (
                <option key={t.cafe_id} value={t.cafe_id} style={{ background: 'var(--a-card)', color: 'var(--a-ink)' }}>
                  {t.cafe_name} — {t.active_clients} PC aktif
                </option>
              ))}
            </select>
          </div>
        </div>

        {linkMsg && <p className="text-xs mb-3 text-center" style={{ color: 'var(--a-mut)' }}>{linkMsg}</p>}

        <Button onClick={doLink} disabled={linking || !selectedUser || !selectedTelemetry} className="w-full">
          {linking ? 'Bağlanıyor...' : 'Hesabı Bağla'}
        </Button>
      </Modal>

      {/* Üst bar (sayfa başlığı topbar'da; buradaki tekrar kaldırıldı) */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <Badge tone="ok" dot>Canlı Senkronizasyon</Badge>
        <div className="flex items-center gap-2">
          <Button variant="subtle" size="sm" icon={Link} onClick={loadLinkData} title="Kafe hesaplarını telemetri ile bağla">
            Hesap Bağla
          </Button>
          <IconButton icon={RefreshCw} title="Yenile" onClick={fetchData} />
        </div>
      </div>

      {/* Özet kartlar */}
      <StatGrid>
        <StatCard icon={Wifi} label="Toplam Şube" value={totalCafes} tone="accent" />
        <StatCard icon={Monitor} label="Aktif PC" value={totalClients} tone="info" />
        <StatCard icon={Gamepad2} label="Top Oyun Tıklaması" value={sortedGames.reduce((a, g) => a + g.clicks, 0).toLocaleString()} tone="ok" />
        <StatCard icon={HardDrive} label="GPU Çeşidi" value={Object.keys(gpuStats).length} tone="accent" />
      </StatGrid>

      {/* Grafik paneli */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <Card className="xl:col-span-3">
          <CardHeader
            title="En Çok Oynanan Oyunlar"
            subtitle="Tüm şubelerin kümülatif verisi"
            icon={Gamepad2}
            right={<Badge tone="mut">Top 8</Badge>}
          />
          <div className="p-5">
            {sortedGames.length === 0 ? (
              <EmptyState title="Henüz veri yok" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={sortedGames} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <XAxis type="number" stroke="#6b7280" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" width={130} stroke="none" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--a-accent-soft)' }} />
                  <Bar dataKey="clicks" fill={COLORS[0]} radius={[0, 6, 6, 0]} maxBarSize={20} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader title="GPU Dağılımı" subtitle="En yaygın ekran kartları" icon={HardDrive} />
          <div className="p-5">
            {sortedGpus.length === 0 ? (
              <EmptyState title="Henüz veri yok" />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={sortedGpus} cx="50%" cy="45%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="count">
                    {sortedGpus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: 'var(--a-mut)', fontSize: 11 }}>{v.substring(0, 22)}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Kafe listesi — genişletilebilir kartlar */}
      <div>
        <div className="flex items-center justify-between mb-4 gap-3">
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--a-ink)' }}>Şube Detayları</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--a-mut)' }}>Her kafeye tıklayarak detayları görün</p>
          </div>
          <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Kafe ara..." className="w-56" />
        </div>

        {filteredCafes.length === 0 ? (
          <Card className="p-12">
            <EmptyState icon={Wifi} title={search ? 'Aramanızla eşleşen kafe bulunamadı.' : 'Henüz telemetri verisi gönderen kafe yok.'} />
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredCafes.map((cafe, i) => (
              <CafeCard key={cafe.hwid || cafe.cafe_id || i} cafe={cafe} index={i} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ===== ANA SWITCH =====
const SuperAdmin = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('gc_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (_) {}
  }, []);

  if (!user) {
    return <Loading />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  return <CafeDashboard user={user} />;
};

export default SuperAdmin;
