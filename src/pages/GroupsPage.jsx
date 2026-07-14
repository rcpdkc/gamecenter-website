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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-4xl rounded-2xl border shadow-2xl p-8 ${modalBg} animate-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between mb-8 border-b pb-4 border-white/5">
          <div>
            <h3 className={`text-xl font-bold ${txt}`}>{group ? 'Grubu Düzenle' : 'Yeni Grup Oluştur'}</h3>
            <p className={`text-xs ${sub} mt-1`}>Kullanıcıları sınıflandırmak ve yetkilerini yönetmek için bir grup tanımlayın.</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl transition-all ${dark ? 'hover:bg-white/5 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'}`}><X size={20} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Sol Kolon - Temel Bilgiler */}
          <div className="space-y-5">
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider ${sub} mb-2`}>Grup Adı *</label>
              <input
                type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="örn: Altın Üye, VIP Kafe..."
                className={`w-full border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all ${inputBg}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider ${sub} mb-2`}>Açıklama</label>
              <textarea
                value={description} onChange={e => setDescription(e.target.value)} rows={3}
                placeholder="Bu grubun kısa açıklaması..."
                className={`w-full border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 resize-none transition-all ${inputBg}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-semibold uppercase tracking-wider ${sub} mb-3`}>Rozet Rengi</label>
              <div className="flex flex-wrap gap-2.5">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c} onClick={() => setColor(c)}
                    className={`w-9 h-9 rounded-xl transition-all shadow-sm ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-transparent scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3 bg-black/20 p-2 rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-lg shrink-0 shadow-inner" style={{ backgroundColor: color }} />
                <input type="text" value={color} onChange={e => setColor(e.target.value)}
                  className={`flex-1 bg-transparent py-1 px-2 text-sm font-mono focus:outline-none ${txt}`}
                  placeholder="#f97316"
                />
              </div>
            </div>

            {/* Preview */}
            <div className={`p-4 rounded-xl mt-2 ${dark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'} flex items-center gap-4`}>
              <span className={`text-xs font-semibold uppercase ${sub}`}>Canlı Önizleme:</span>
              <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-sm" style={{ backgroundColor: color }}>
                {name || 'Grup Adı'}
              </span>
            </div>
          </div>

          {/* Sağ Kolon - İzinler */}
          <div className="flex flex-col h-full">
            <label className={`block text-xs font-semibold uppercase tracking-wider ${sub} mb-2`}>
              Yerel Modül İzinleri 
              <span className="ml-2 text-[10px] bg-orange-500/20 text-orange-500 px-2 py-0.5 rounded-full lowercase normal-case">
                {permissions.length} seçili
              </span>
            </label>
            <div className={`border rounded-2xl p-4 flex-1 ${inputBg} overflow-y-auto h-[380px] grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 shadow-inner`}>
              {LOCAL_MODULES.map(mod => {
                const isChecked = permissions.includes(mod.id);
                return (
                  <label key={mod.id} className={`flex items-center gap-3 cursor-pointer p-2 rounded-xl transition-all ${isChecked ? (dark ? 'bg-white/10' : 'bg-gray-200') : 'hover:bg-white/5'}`}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                         if (e.target.checked) setPermissions([...permissions, mod.id]);
                         else setPermissions(permissions.filter(p => p !== mod.id));
                      }}
                      className="rounded border-gray-500 focus:ring-orange-500 text-orange-500 w-4 h-4 cursor-pointer"
                    />
                    <span className={`text-sm font-medium ${isChecked ? txt : sub} transition-colors select-none`}>
                      {mod.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/5">
          <button onClick={onClose} className={`px-6 py-2.5 rounded-xl text-sm font-bold border transition-colors ${dark ? 'border-white/10 text-gray-400 hover:bg-white/10 hover:text-white' : 'border-gray-200 text-gray-500 hover:bg-gray-100'}`}>İptal</button>
          <button onClick={handleSave} disabled={saving || !name.trim()}
            className="px-8 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
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
