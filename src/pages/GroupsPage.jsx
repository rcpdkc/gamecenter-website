import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Layers, Plus, Edit2, Trash2, Loader2, Users, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, Button, Modal, EmptyState, Loading, useConfirm } from '../admin/ui';

const PRESET_COLORS = [
  '#f97316', '#3b82f6', '#10b981', '#8b5cf6',
  '#ef4444', '#f59e0b', '#ec4899', '#06b6d4',
  '#84cc16', '#64748b'
];

// Yerel panelin (web_admin) tüm sayfaları — admin'in eriştiği modüllerin tamamı.
// Workspace başlıklarıyla gruplanır. id şeması yerel route'larla hizalıdır.
const LOCAL_MODULES = [
  // GameCenter / SystemCenter
  { id: '/', label: 'Panel', group: 'GameCenter' },
  { id: '/clients', label: 'Bilgisayarlar', group: 'GameCenter' },
  { id: '/monitor', label: 'Canlı Monitör', group: 'GameCenter' },
  { id: '/monitortakip', label: 'Monitör OSD', group: 'GameCenter' },
  { id: '/network', label: 'Ağ İzleme', group: 'GameCenter' },
  { id: '/games', label: 'Oyunlar', group: 'GameCenter' },
  { id: '/favorites', label: 'Favori Oyunlar', group: 'GameCenter' },
  { id: '/saves', label: 'Oyun Kayıt', group: 'GameCenter' },
  { id: '/definitions', label: 'Tanımlamalar', group: 'GameCenter' },
  { id: '/plugins', label: 'Eklentiler', group: 'GameCenter' },
  { id: '/mklinks', label: 'MkLink Şablonları', group: 'GameCenter' },
  { id: '/onbellek', label: 'Önbellek Kayıt', group: 'GameCenter' },
  { id: '/updates', label: 'Güncellemeler', group: 'GameCenter' },
  { id: '/filters', label: 'Filtreli Oyunlar', group: 'GameCenter' },
  { id: '/alerts', label: 'Disk Uyarıları', group: 'GameCenter' },
  { id: '/steam', label: 'Oyun Hesapları', group: 'GameCenter' },
  { id: '/logs', label: 'Loglar', group: 'GameCenter' },
  { id: '/requests', label: 'İstek / Öneri', group: 'GameCenter' },
  { id: '/serverstatus', label: 'Sunucu Durumu', group: 'GameCenter' },
  // CafeCenter
  { id: '/cafe', label: 'Terminal', group: 'CafeCenter' },
  { id: '/cafe/members', label: 'Üyeler', group: 'CafeCenter' },
  { id: '/cafe/tariffs', label: 'Tarifeler', group: 'CafeCenter' },
  { id: '/cafe/pos', label: 'POS / Satış', group: 'CafeCenter' },
  { id: '/cafe/tickets', label: 'Biletler', group: 'CafeCenter' },
  { id: '/cafe/escrow', label: 'Emanet', group: 'CafeCenter' },
  { id: '/cafe/reports', label: 'Raporlar', group: 'CafeCenter' },
  { id: '/cafe/settings', label: 'CafeCenter Ayarları', group: 'CafeCenter' },
  // FilterCenter
  { id: '/filter', label: 'Genel Bakış', group: 'FilterCenter' },
  { id: '/content-filter', label: 'İçerik Filtresi', group: 'FilterCenter' },
  { id: '/bandwidth', label: 'Hız Sınırlama', group: 'FilterCenter' },
  { id: '/access-logs', label: 'Erişim Kayıtları', group: 'FilterCenter' },
  // Genel Ayarlar
  { id: '/global/update', label: 'Güncelleme', group: 'Genel Ayarlar' },
  { id: '/settings', label: 'Sistem Ayarları', group: 'Genel Ayarlar' },
  { id: '/global/database', label: 'Veritabanı', group: 'Genel Ayarlar' },
  { id: '/global/cloud-backup', label: 'Bulut Yedek', group: 'Genel Ayarlar' },
  { id: '/global/paths', label: 'Dosya ve Yedekleme', group: 'Genel Ayarlar' },
  { id: '/global/client-view', label: 'GameCenter Görünüm', group: 'Genel Ayarlar' },
  { id: '/global/client-mode', label: 'İstemci Modu', group: 'Genel Ayarlar' },
  { id: '/global/temperature', label: 'Sıcaklık Ölçümü', group: 'Genel Ayarlar' },
  { id: '/global/staff', label: 'Personel & Yetkiler', group: 'Genel Ayarlar' },
];

// Workspace görünüm sırası (başlıklar için)
const MODULE_GROUPS = ['GameCenter', 'CafeCenter', 'FilterCenter', 'Genel Ayarlar'];

const labelCls = 'block text-xs font-semibold uppercase tracking-wider mb-2';
const fieldStyle = { background: 'var(--a-card2)', borderColor: 'var(--a-border)', color: 'var(--a-ink)' };

const GroupModal = ({ group, dark, onClose, onSave }) => {
  const [name, setName] = useState(group?.name || '');
  const [description, setDescription] = useState(group?.description || '');
  const [color, setColor] = useState(group?.color || '#f97316');
  const [permissions, setPermissions] = useState(group?.permissions || []);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const isEdit = !!group?.id;
      const res = await fetch('/api/groups', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: group?.id, name: name.trim(), description, color, permissions })
      });
      const data = await res.json();
      if (data.success) { onSave(); onClose(); }
      else alert(data.error);
    } catch { alert('Hata oluştu.'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} icon={Layers} width="max-w-4xl"
      title={group ? 'Grubu Düzenle' : 'Yeni Grup Oluştur'}
      subtitle="Kullanıcıları sınıflandırmak ve yetkilerini yönetmek için bir grup tanımlayın.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Sol Kolon - Temel Bilgiler */}
        <div className="space-y-5">
          <div>
            <label className={labelCls} style={{ color: 'var(--a-mut)' }}>Grup Adı *</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="örn: Altın Üye, VIP Kafe..."
              className="w-full border rounded-lg py-2.5 px-4 text-sm outline-none transition-all" style={fieldStyle}
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--a-mut)' }}>Açıklama</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Bu grubun kısa açıklaması..."
              className="w-full border rounded-lg py-2.5 px-4 text-sm outline-none resize-none transition-all" style={fieldStyle}
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--a-mut)' }}>Rozet Rengi</label>
            <div className="flex flex-wrap gap-2.5">
              {PRESET_COLORS.map(c => (
                <button
                  key={c} onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-lg transition-all shadow-sm ${color === c ? 'ring-2 ring-[var(--a-accent)] scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 p-2 rounded-lg border" style={{ background: 'var(--a-card2)', borderColor: 'var(--a-border)' }}>
              <div className="w-8 h-8 rounded-lg shrink-0 shadow-inner" style={{ backgroundColor: color }} />
              <input type="text" value={color} onChange={e => setColor(e.target.value)}
                className="flex-1 bg-transparent py-1 px-2 text-sm font-mono outline-none" style={{ color: 'var(--a-ink)' }}
                placeholder="#f97316"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-lg mt-2 border flex items-center gap-4" style={{ background: 'var(--a-card2)', borderColor: 'var(--a-border)' }}>
            <span className="text-xs font-semibold uppercase" style={{ color: 'var(--a-mut)' }}>Canlı Önizleme:</span>
            <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm" style={{ backgroundColor: color }}>
              {name || 'Grup Adı'}
            </span>
          </div>
        </div>

        {/* Sağ Kolon - İzinler */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--a-mut)' }}>
              Yerel Modül İzinleri
              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full lowercase normal-case font-bold"
                style={{ background: 'var(--a-accent-soft)', color: 'var(--a-accent)' }}>
                {permissions.length} seçili
              </span>
            </label>
            <button
              type="button"
              onClick={() => {
                if (permissions.length === LOCAL_MODULES.length) {
                  setPermissions([]);
                } else {
                  setPermissions(LOCAL_MODULES.map(m => m.id));
                }
              }}
              className="text-[10px] font-bold px-2.5 py-1 rounded-md transition-all border"
              style={permissions.length === LOCAL_MODULES.length
                ? { background: 'color-mix(in srgb, var(--a-danger) 12%, transparent)', color: 'var(--a-danger)', borderColor: 'color-mix(in srgb, var(--a-danger) 28%, transparent)' }
                : { background: 'color-mix(in srgb, var(--a-info) 12%, transparent)', color: 'var(--a-info)', borderColor: 'color-mix(in srgb, var(--a-info) 28%, transparent)' }}
            >
              {permissions.length === LOCAL_MODULES.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
            </button>
          </div>
          <div className="border rounded-xl p-4 flex-1 overflow-y-auto h-[380px] shadow-inner space-y-4"
            style={{ background: 'var(--a-card2)', borderColor: 'var(--a-border)' }}>
            {MODULE_GROUPS.map(gname => {
              const mods = LOCAL_MODULES.filter(m => m.group === gname);
              if (!mods.length) return null;
              const ids = mods.map(m => m.id);
              const selCount = mods.filter(m => permissions.includes(m.id)).length;
              const allSel = selCount === mods.length;
              return (
                <div key={gname}>
                  <div className="flex items-center justify-between mb-2 sticky top-0 z-10 py-1" style={{ background: 'var(--a-card2)' }}>
                    <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--a-accent)' }}>{gname}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (allSel) setPermissions(permissions.filter(p => !ids.includes(p)));
                        else setPermissions([...new Set([...permissions, ...ids])]);
                      }}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors"
                      style={{ color: 'var(--a-mut)', borderColor: 'var(--a-border)' }}
                    >
                      {allSel ? 'Kaldır' : 'Tümü'} ({selCount}/{mods.length})
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                    {mods.map(mod => {
                      const isChecked = permissions.includes(mod.id);
                      return (
                        <label key={mod.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all hover:bg-[var(--a-card)]"
                          style={isChecked ? { background: 'var(--a-accent-soft)' } : undefined}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                               if (e.target.checked) setPermissions([...permissions, mod.id]);
                               else setPermissions(permissions.filter(p => p !== mod.id));
                            }}
                            className="w-4 h-4 cursor-pointer"
                            style={{ accentColor: 'var(--a-accent)' }}
                          />
                          <span className="text-sm font-medium transition-colors select-none" style={{ color: isChecked ? 'var(--a-ink)' : 'var(--a-mut)' }}>
                            {mod.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-8 pt-6 border-t" style={{ borderColor: 'var(--a-border)' }}>
        <Button variant="ghost" onClick={onClose}>İptal</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving || !name.trim()}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>
    </Modal>
  );
};

const GroupsPage = () => {
  const context = useOutletContext() || {};
  const dark = context.dark !== undefined ? context.dark : true;
  const [groups, setGroups] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | group object
  const [deleting, setDeleting] = useState(null);
  const { confirm, confirmNode } = useConfirm();

  const fetchGroups = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      if (data.success) setGroups(data.data);
    } catch { } finally { setFetching(false); }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleDelete = async (id) => {
    if (!(await confirm({ title: 'Grubu Sil', message: 'Bu grubu silmek istediğinize emin misiniz? Bu gruptaki kullanıcılar gruptan çıkarılır.', tone: 'danger', confirmLabel: 'Sil' }))) return;
    setDeleting(id);
    try {
      await fetch('/api/groups', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      fetchGroups();
    } catch { } finally { setDeleting(null); }
  };

  return (
    <>
      {confirmNode}
      {modal && (
        <GroupModal
          group={modal === 'create' ? null : modal}
          dark={dark}
          onClose={() => setModal(null)}
          onSave={fetchGroups}
        />
      )}

      <div className="space-y-6">
        {/* Header action */}
        <div className="flex items-center justify-end">
          <Button variant="primary" icon={Plus} onClick={() => setModal('create')}>Yeni Grup Oluştur</Button>
        </div>

        {/* Groups list */}
        <Card className="overflow-hidden">
          <CardHeader title="Mevcut Gruplar" icon={Layers}
            subtitle='Üyelik gruplarını buradan yönetin. Kullanıcıları "Kullanıcılar" sayfasından bu gruplara atayabilirsiniz.' />

          {fetching ? (
            <Loading />
          ) : groups.length === 0 ? (
            <EmptyState icon={Layers} title="Henüz grup yok." hint='"Yeni Grup Oluştur" butonuna tıklayarak başlayın.' />
          ) : (
            <div>
              {groups.map(group => (
                <div key={group.id} className="px-6 py-4 flex items-center gap-4 border-t border-[var(--a-border)] hover:bg-[var(--a-card2)] transition-colors">
                  <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center" style={{ backgroundColor: group.color + '22', border: `1.5px solid ${group.color}55` }}>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: group.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: group.color }}>
                        {group.name}
                      </span>
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--a-mut)' }}>{group.description || 'Açıklama eklenmemiş'}</p>
                    {group.permissions?.length > 0 && (
                      <p className="text-[10px] mt-1" style={{ color: 'var(--a-info)' }}>{group.permissions.length} modül yetkisi</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs mr-4" style={{ color: 'var(--a-mut)' }}>
                    <Users size={13} /> {group.member_count} üye
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setModal(group)} title="Düzenle"
                      className="w-8 h-8 grid place-items-center rounded-lg transition-colors hover:bg-[var(--a-card)]" style={{ color: 'var(--a-mut)' }}>
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(group.id)} disabled={deleting === group.id} title="Sil"
                      className="w-8 h-8 grid place-items-center rounded-lg transition-colors hover:bg-[var(--a-card)]" style={{ color: 'var(--a-danger)' }}>
                      {deleting === group.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Info box */}
        <div className="p-4 rounded-xl border text-sm"
          style={{ background: 'color-mix(in srgb, var(--a-info) 8%, transparent)', borderColor: 'color-mix(in srgb, var(--a-info) 25%, transparent)', color: 'var(--a-info)' }}>
          <p className="font-semibold mb-1">💡 Nasıl Çalışır?</p>
          <p style={{ opacity: 0.8 }}>
            Burada oluşturduğunuz gruplar, "Kullanıcılar" sayfasında her kafenin yanındaki "Düzenle" butonundan atanabilir.
            İsteğe bağlı olarak bir bitiş tarihi de ekleyebilirsiniz — süre dolduğunda kafe "lisans sona erdi" uyarısı alır.
          </p>
        </div>
      </div>
    </>
  );
};

export default GroupsPage;
