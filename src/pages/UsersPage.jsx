import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, RefreshCw, Loader2, Edit2, CheckCircle2, X, Shield, AlertTriangle, Unlock } from 'lucide-react';

const EditModal = ({ user, groups, dark, onClose, onSave }) => {
  const [groupId, setGroupId] = useState(user.group_id ? String(user.group_id) : '');
  const [expiresAt, setExpiresAt] = useState(
    user.group_expires_at ? new Date(user.group_expires_at).toISOString().split('T')[0] : ''
  );
  const [saving, setSaving] = useState(false);
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-400' : 'text-gray-500';
  const inputBg = dark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900';
  const modalBg = dark ? 'bg-[#111827] border-white/10' : 'bg-white border-gray-200';

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_group', user_id: user.id, group_id: groupId || null, group_expires_at: expiresAt || null })
      });
      const data = await res.json();
      if (data.success) { onSave(); onClose(); }
      else alert(data.error);
    } catch { alert('Hata oluştu.'); }
    finally { setSaving(false); }
  };

  const selectedGroup = groups.find(g => String(g.id) === groupId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${modalBg}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`text-lg font-bold ${txt}`}>Üyelik Grubu Ata</h3>
            <p className={`text-sm ${sub} mt-0.5`}>{user.cafe_name} · {user.email}</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl ${dark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><X size={18} /></button>
        </div>

        <div className="space-y-4">
          {/* Group selector */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wide ${sub} mb-1.5`}>Grup</label>
            <select value={groupId} onChange={e => setGroupId(e.target.value)}
              className={`w-full border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${inputBg}`}
            >
              <option value="">— Gruba Atanmamış —</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          {/* Color preview */}
          {selectedGroup && (
            <div className={`flex items-center gap-2 p-3 rounded-xl ${dark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedGroup.color }} />
              <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: selectedGroup.color }}>
                {selectedGroup.name}
              </span>
              {selectedGroup.description && <span className={`text-xs ${sub}`}>· {selectedGroup.description}</span>}
            </div>
          )}

          {/* Expiry date */}
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wide ${sub} mb-1.5`}>
              Bitiş Tarihi <span className={`normal-case font-normal ${sub}`}>(opsiyonel - boş = süresiz)</span>
            </label>
            <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 ${inputBg}`}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${dark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>İptal</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-center gap-2 disabled:opacity-60 shadow-[0_4px_15px_rgba(249,115,22,0.3)]">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

const GroupBadge = ({ user }) => {
  const isExpired = user.group_id && user.group_expires_at && new Date(user.group_expires_at) < new Date();
  if (isExpired) return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Süresi Doldu</span>;
  if (!user.group_name) return <span className="text-gray-500 text-xs">Gruba atanmamış</span>;
  return <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: user.group_color || '#6b7280' }}>{user.group_name}</span>;
};

const UsersPage = () => {
  const context = useOutletContext() || {};
  const dark = context.dark !== undefined ? context.dark : true;
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const panelBorder = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';
  const divider = dark ? 'divide-white/5' : 'divide-gray-100';

  const fetchAll = async () => {
    setFetching(true);
    try {
      const [uRes, gRes] = await Promise.all([fetch('/api/users'), fetch('/api/groups')]);
      const [uData, gData] = await Promise.all([uRes.json(), gRes.json()]);
      if (uData.success) setUsers(uData.data);
      if (gData.success) setGroups(gData.data);
    } catch (e) { console.error(e); }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleResetHwid = async (userId) => {
    if (!confirm('Bu kullanıcının HWID (Donanım) kilidini kaldırmak istediğinize emin misiniz?')) return;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_hwid', user_id: userId, hwid: null })
      });
      const data = await res.json();
      if (data.success) fetchAll();
      else alert(data.error);
    } catch { alert('İşlem başarısız.'); }
  };

  const isExpired = u => u.group_id && u.group_expires_at && new Date(u.group_expires_at) < new Date();
  const expiredCnt = users.filter(u => isExpired(u)).length;
  const assignedCnt = users.filter(u => u.group_id).length;

  return (
    <>
      {editingUser && <EditModal user={editingUser} groups={groups} dark={dark} onClose={() => setEditingUser(null)} onSave={fetchAll} />}

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Toplam Üye', value: users.length, color: dark ? 'text-white' : 'text-gray-900' },
            { label: 'Gruba Atanmış', value: assignedCnt, color: 'text-blue-400' },
            { label: 'Gruba Atanmamış', value: users.length - assignedCnt, color: dark ? 'text-gray-400' : 'text-gray-500' },
            { label: 'Süresi Dolmuş', value: expiredCnt, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className={`${bg} border ${panelBorder} rounded-2xl p-4 shadow-sm`}>
              <p className={`text-xs font-medium ${sub} mb-1`}>{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {expiredCnt > 0 && (
          <div className={`flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm`}>
            <AlertTriangle size={18} className="shrink-0" />
            <span><strong>{expiredCnt}</strong> kullanıcının grup üyeliği sona ermiş.</span>
          </div>
        )}

        <div className={`${bg} border ${panelBorder} rounded-2xl overflow-hidden shadow-sm`}>
          <div className={`px-6 py-4 border-b ${panelBorder} flex items-center justify-between`}>
            <div>
              <h3 className={`text-base font-bold ${txt}`}>Kayıtlı Kafeler</h3>
              <p className={`text-xs ${sub} mt-0.5`}>Grup atamak için "Düzenle" butonunu kullanın</p>
            </div>
            <button onClick={fetchAll} disabled={fetching} className={`p-2 rounded-xl transition-colors ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
              <RefreshCw size={15} className={fetching ? 'animate-spin' : ''} />
            </button>
          </div>

          {fetching ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange-500" size={24} /></div>
          ) : users.length === 0 ? (
            <div className={`py-16 text-center ${sub} text-sm`}><Users size={32} className="mx-auto mb-3 opacity-30" />Henüz kayıtlı kafe yok.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className={dark ? 'bg-white/3' : 'bg-gray-50'}>
                    {['Kafe', 'İletişim', 'Grup', 'Bitiş', 'Kayıt', 'HWID', 'İşlem'].map(h => (
                      <th key={h} className={`px-5 py-3 text-xs font-semibold uppercase tracking-wider ${sub}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${divider}`}>
                  {users.map(user => (
                    <tr key={user.id} className={`transition-colors ${dark ? 'hover:bg-white/3' : 'hover:bg-gray-50'} ${isExpired(user) ? 'opacity-60' : ''}`}>
                      <td className="px-5 py-3.5">
                        <p className={`font-semibold ${txt}`}>{user.cafe_name || '—'}</p>
                        <p className={`text-xs ${sub}`}>{user.first_name} {user.last_name}</p>
                      </td>
                      <td className={`px-5 py-3.5 ${sub} text-xs`}>
                        <p>{user.email}</p><p>{user.phone || '—'}</p>
                      </td>
                      <td className="px-5 py-3.5"><GroupBadge user={user} /></td>
                      <td className={`px-5 py-3.5 text-xs ${sub}`}>
                        {user.group_expires_at
                          ? <span className={isExpired(user) ? 'text-red-400 font-semibold' : ''}>{new Date(user.group_expires_at).toLocaleDateString('tr-TR')}</span>
                          : <span className="text-gray-500">Süresiz</span>}
                      </td>
                      <td className={`px-5 py-3.5 text-xs ${sub}`}>{new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
                      <td className={`px-5 py-3.5 text-xs`}>
                        {user.hwid ? (
                          <span className="text-emerald-400 font-mono" title={user.hwid}>Kilitli</span>
                        ) : (
                          <span className={sub}>Yok</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 flex gap-2">
                        <button onClick={() => setEditingUser(user)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          <Edit2 size={12} /> Düzenle
                        </button>
                        {user.hwid && (
                          <button onClick={() => handleResetHwid(user.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dark ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                            title="HWID Kilidini Kaldır">
                            <Unlock size={12} /> Kilidi Aç
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UsersPage;
