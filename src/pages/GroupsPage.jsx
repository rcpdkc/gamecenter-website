import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Layers, Plus, Edit2, Trash2, Loader2, Users, X, CheckCircle2 } from 'lucide-react';

const PRESET_COLORS = [
  '#f97316', '#3b82f6', '#10b981', '#8b5cf6',
  '#ef4444', '#f59e0b', '#ec4899', '#06b6d4',
  '#84cc16', '#64748b'
];

const LOCAL_MODULES = [
  { id: '/clients', label: 'Bilgisayarlar' },
  { id: '/monitor', label: 'Canlı Monitör' },
  { id: '/monitortakip', label: 'Monitör OSD' },
  { id: '/network', label: 'Ağ İzleme' },
  { id: '/games', label: 'Oyunlar' },
  { id: '/favorites', label: 'Favori Oyunlar' },
  { id: '/users', label: 'Kullanıcılar' },
  { id: '/saves', label: 'Oyun Kayıt' },
  { id: '/definitions', label: 'Tanımlamalar' },
  { id: '/plugins', label: 'Eklentiler' },
  { id: '/mklinks', label: 'MkLink Şablonları' },
  { id: '/updates', label: 'Guncellemeler' },
  { id: '/filters', label: 'Filtreli Oyunlar' },
  { id: '/alerts', label: 'Disk Uyarıları' },
  { id: '/steam', label: 'Oyun Hesapları' },
  { id: '/logs', label: 'Loglar' },
  { id: '/requests', label: 'İstek / Öneri' },
  { id: '/settings', label: 'Ayarlar' }
];

const GroupModal = ({ group, dark, onClose, onSave }) => {
  const [name, setName] = useState(group?.name || '');
  const [description, setDescription] = useState(group?.description || '');
  const [color, setColor] = useState(group?.color || '#f97316');
  const [permissions, setPermissions] = useState(group?.permissions || []);
  const [saving, setSaving] = useState(false);

  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-400' : 'text-gray-500';
  const inputBg = dark ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900';
  const modalBg = dark ? 'bg-[#111827] border-white/10' : 'bg-white border-gray-200';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${modalBg}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-bold ${txt}`}>{group ? 'Grubu Düzenle' : 'Yeni Grup Oluştur'}</h3>
          <button onClick={onClose} className={`p-2 rounded-xl ${dark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wide ${sub} mb-1.5`}>Grup Adı *</label>
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="örn: Altın Üye, VIP Kafe..."
              className={`w-full border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${inputBg}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wide ${sub} mb-1.5`}>Açıklama</label>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)} rows={2}
              placeholder="Bu grubun kısa açıklaması..."
              className={`w-full border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 resize-none ${inputBg}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wide ${sub} mb-2`}>Rozet Rengi</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c} onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg shrink-0" style={{ backgroundColor: color }} />
              <input type="text" value={color} onChange={e => setColor(e.target.value)}
                className={`flex-1 border rounded-lg py-1.5 px-3 text-xs font-mono focus:outline-none ${inputBg}`}
                placeholder="#f97316"
              />
            </div>
          </div>

          {/* Permissions Selector */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wide ${sub} mb-2`}>Yerel Modül İzinleri</label>
            <div className={`border rounded-xl p-3 ${inputBg} max-h-[160px] overflow-y-auto grid grid-cols-2 gap-2`}>
              {LOCAL_MODULES.map(mod => {
                const isChecked = permissions.includes(mod.id);
                return (
                  <label key={mod.id} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) setPermissions([...permissions, mod.id]);
                        else setPermissions(permissions.filter(p => p !== mod.id));
                      }}
                      className="rounded border-gray-400 focus:ring-orange-500 text-orange-500 w-4 h-4 cursor-pointer"
                    />
                    <span className={`text-xs ${isChecked ? txt : sub} group-hover:${txt} transition-colors select-none`}>
                      {mod.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>


          {/* Preview */}
          <div className={`p-3 rounded-xl ${dark ? 'bg-white/5' : 'bg-gray-50'} flex items-center gap-3`}>
            <span className={`text-xs ${sub}`}>Önizleme:</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: color }}>
              {name || 'Grup Adı'}
            </span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${dark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>İptal</button>
          <button onClick={handleSave} disabled={saving || !name.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-center gap-2 disabled:opacity-60 shadow-[0_4px_15px_rgba(249,115,22,0.3)]">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

const GroupsPage = () => {
  const context = useOutletContext() || {};
  const dark = context.dark !== undefined ? context.dark : true;
  const [groups, setGroups] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | group object
  const [deleting, setDeleting] = useState(null);

  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const panelBorder = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';
  const divider = dark ? 'divide-white/5' : 'divide-gray-100';

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
    if (!confirm('Bu grubu silmek istediğinize emin misiniz? Bu gruptaki kullanıcılar gruptan çıkarılır.')) return;
    setDeleting(id);
    try {
      await fetch('/api/groups', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      fetchGroups();
    } catch { } finally { setDeleting(null); }
  };

  return (
    <>
      {modal && (
        <GroupModal
          group={modal === 'create' ? null : modal}
          dark={dark}
          onClose={() => setModal(null)}
          onSave={fetchGroups}
        />
      )}

      <div className="space-y-6 max-w-4xl">
        {/* Header action */}
        <div className="flex items-center justify-end">
          <button
            onClick={() => setModal('create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-[0_4px_15px_rgba(249,115,22,0.3)] hover:from-orange-400 hover:to-orange-500 transition-all"
          >
            <Plus size={16} /> Yeni Grup Oluştur
          </button>
        </div>

        {/* Groups list */}
        <div className={`${bg} border ${panelBorder} rounded-2xl overflow-hidden shadow-sm`}>
          <div className={`px-6 py-4 border-b ${panelBorder}`}>
            <h3 className={`text-base font-bold ${txt}`}>Mevcut Gruplar</h3>
            <p className={`text-xs ${sub} mt-0.5`}>Üyelik gruplarını buradan yönetin. Kullanıcıları "Kullanıcılar" sayfasından bu gruplara atayabilirsiniz.</p>
          </div>

          {fetching ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange-500" /></div>
          ) : groups.length === 0 ? (
            <div className={`py-16 text-center ${sub} text-sm`}>
              <Layers size={36} className="mx-auto mb-3 opacity-30" />
              <p>Henüz grup yok. "Yeni Grup Oluştur" butonuna tıklayarak başlayın.</p>
            </div>
          ) : (
            <div className={`divide-y ${divider}`}>
              {groups.map(group => (
                <div key={group.id} className={`px-6 py-4 flex items-center gap-4 ${dark ? 'hover:bg-white/3' : 'hover:bg-gray-50'} transition-colors`}>
                  <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center" style={{ backgroundColor: group.color + '22', border: `1.5px solid ${group.color}55` }}>
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: group.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: group.color }}>
                        {group.name}
                      </span>
                    </div>
                    <p className={`text-xs ${sub} truncate`}>{group.description || 'Açıklama eklenmemiş'}</p>
                    {group.permissions?.length > 0 && (
                      <p className={`text-[10px] text-blue-400 mt-1`}>{group.permissions.length} modül yetkisi</p>
                    )}
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs ${sub} mr-4`}>
                    <Users size={13} /> {group.member_count} üye
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setModal(group)}
                      className={`p-2 rounded-lg transition-colors ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(group.id)} disabled={deleting === group.id}
                      className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                      {deleting === group.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info box */}
        <div className={`p-4 rounded-xl border text-sm ${dark ? 'bg-blue-500/5 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
          <p className="font-semibold mb-1">💡 Nasıl Çalışır?</p>
          <p className={dark ? 'text-blue-400/70' : 'text-blue-500'}>
            Burada oluşturduğunuz gruplar, "Kullanıcılar" sayfasında her kafenin yanındaki "Düzenle" butonundan atanabilir.
            İsteğe bağlı olarak bir bitiş tarihi de ekleyebilirsiniz — süre dolduğunda kafe "lisans sona erdi" uyarısı alır.
          </p>
        </div>
      </div>
    </>
  );
};

export default GroupsPage;
