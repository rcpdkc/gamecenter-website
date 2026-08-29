import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, RefreshCw, Loader2, Edit2, AlertTriangle, Unlock, Tag, Shield, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, Button, IconButton, StatCard, StatGrid, Badge, EmptyState, Loading, Modal, useConfirm } from '../admin/ui';

const fieldCls = 'w-full h-9 rounded-lg border text-[13px] px-3 outline-none transition-colors';
const fieldStyle = { background: 'var(--a-card2)', borderColor: 'var(--a-border)', color: 'var(--a-ink)' };
const labelCls = 'block text-xs font-semibold uppercase tracking-wide mb-1.5';

const EditModal = ({ user, groups, dark, onClose, onSave }) => {
  const [groupId, setGroupId] = useState(user.group_id ? String(user.group_id) : '');
  const [expiresAt, setExpiresAt] = useState(
    user.group_expires_at ? new Date(user.group_expires_at).toISOString().split('T')[0] : ''
  );
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
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
    <Modal open onClose={onClose} title="Üyelik Grubu Ata" subtitle={`${user.cafe_name} · ${user.email}`} icon={Tag} width="max-w-md">
      <div className="space-y-4">
        <div>
          <label className={labelCls} style={{ color: 'var(--a-mut)' }}>Grup</label>
          <select value={groupId} onChange={e => setGroupId(e.target.value)} className={fieldCls} style={fieldStyle}>
            <option value="">— Gruba Atanmamış —</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>

        {selectedGroup && (
          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--a-card2)' }}>
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedGroup.color }} />
            <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{ backgroundColor: selectedGroup.color }}>
              {selectedGroup.name}
            </span>
            {selectedGroup.description && <span className="text-xs" style={{ color: 'var(--a-mut)' }}>· {selectedGroup.description}</span>}
          </div>
        )}

        <div>
          <label className={labelCls} style={{ color: 'var(--a-mut)' }}>
            Bitiş Tarihi <span className="normal-case font-normal">(opsiyonel - boş = süresiz)</span>
          </label>
          <input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)}
            min={new Date().toISOString().split('T')[0]} className={fieldCls} style={fieldStyle} />
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Button variant="ghost" className="flex-1" onClick={onClose}>İptal</Button>
        <Button variant="primary" className="flex-1" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>
    </Modal>
  );
};

const AdminModal = ({ user, dark, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'admin'
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('gc_admin_token');
      const payload = {
        action: user ? 'update_admin' : 'create_user',
        user_id: user?.id,
        ...formData
      };

      const res = await fetch('/api/users', {
        method: user ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) { onSave(); onClose(); }
      else alert(data.error);
    } catch { alert('Hata oluştu.'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title={user ? 'Kullanıcıyı Düzenle' : 'Yeni Yerel Kullanıcı'} icon={Shield} width="max-w-md">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls} style={{ color: 'var(--a-mut)' }}>Ad</label>
            <input type="text" required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})}
              className={fieldCls} style={fieldStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--a-mut)' }}>Soyad</label>
            <input type="text" required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})}
              className={fieldCls} style={fieldStyle} />
          </div>
        </div>
        <div>
          <label className={labelCls} style={{ color: 'var(--a-mut)' }}>E-posta / Kullanıcı Adı</label>
          <input type="text" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
            className={fieldCls} style={fieldStyle} />
        </div>
        <div>
          <label className={labelCls} style={{ color: 'var(--a-mut)' }}>Şifre {user && <span className="lowercase font-normal">(değiştirmek istemiyorsanız boş bırakın)</span>}</label>
          <input type="password" required={!user} minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
            className={fieldCls} style={fieldStyle} />
        </div>
        <div>
          <label className={labelCls} style={{ color: 'var(--a-mut)' }}>Yetki Rolü</label>
          <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
            className={fieldCls} style={fieldStyle}>
            <option value="admin">Yönetici (Admin)</option>
            {/* Gelecekte mod vs. eklenebilir */}
          </select>
        </div>

        <div className="flex gap-3 mt-6 pt-2">
          <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>İptal</Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const GroupBadge = ({ user }) => {
  const isExpired = user.group_id && user.group_expires_at && new Date(user.group_expires_at) < new Date();
  if (isExpired) return <Badge tone="danger">Süresi Doldu</Badge>;
  if (!user.group_name) return <span className="text-xs" style={{ color: 'var(--a-mut)' }}>Gruba atanmamış</span>;
  return <span className="px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: user.group_color || '#6b7280' }}>{user.group_name}</span>;
};

const UsersPage = () => {
  const context = useOutletContext() || {};
  const dark = context.dark !== undefined ? context.dark : true;
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [telemetry, setTelemetry] = useState({});
  const [fetching, setFetching] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  // Tab state: 'cafes' | 'admins'
  const [activeTab, setActiveTab] = useState('cafes');
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const { confirm, confirmNode } = useConfirm();

  const fetchAll = async () => {
    setFetching(true);
    try {
      const [uRes, gRes, tRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/groups'),
        fetch('/api/telemetry?role=admin'),
      ]);
      const [uData, gData, tData] = await Promise.all([uRes.json(), gRes.json(), tRes.json()]);
      if (uData.success) setUsers(uData.data);
      if (gData.success) setGroups(gData.data);
      if (tData.success) {
        const map = {};
        (tData.data || []).forEach(t => { if (t.cafe_id) map[t.cafe_id] = t.server_version; });
        setTelemetry(map);
      }
    } catch (e) { console.error(e); }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleResetHwid = async (userId) => {
    if (!(await confirm({ title: 'HWID Kilidini Kaldır', message: 'Bu kullanıcının HWID (Donanım) kilidini kaldırmak istediğinize emin misiniz?', tone: 'danger', confirmLabel: 'Kilidi Aç' }))) return;
    try {
      const token = localStorage.getItem('gc_admin_token');
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'update_hwid', user_id: userId, hwid: null })
      });
      const data = await res.json();
      if (data.success) fetchAll();
      else alert(data.error);
    } catch { alert('İşlem başarısız.'); }
  };

  const handleDeleteAdmin = async (userId, email) => {
    if (!(await confirm({ title: 'Kullanıcıyı Sil', message: `"${email}" kullanıcısını silmek istediğinize emin misiniz?`, tone: 'danger', confirmLabel: 'Sil' }))) return;
    try {
      const token = localStorage.getItem('gc_admin_token');
      const res = await fetch(`/api/users?user_id=${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) fetchAll();
      else alert(data.error);
    } catch { alert('İşlem başarısız.'); }
  };

  const cafeUsers = users.filter(u => u.role !== 'admin');
  const adminUsers = users.filter(u => u.role === 'admin');

  const isExpired = u => u.group_id && u.group_expires_at && new Date(u.group_expires_at) < new Date();
  const expiredCnt = cafeUsers.filter(u => isExpired(u)).length;
  const assignedCnt = cafeUsers.filter(u => u.group_id).length;

  return (
    <>
      {confirmNode}
      {editingUser && <EditModal user={editingUser} groups={groups} dark={dark} onClose={() => setEditingUser(null)} onSave={fetchAll} />}
      {showAdminModal && <AdminModal user={editingAdmin} dark={dark} onClose={() => { setShowAdminModal(false); setEditingAdmin(null); }} onSave={fetchAll} />}

      <div className="space-y-6">

        {/* Tabs — cafes = accent, admins = info (distinct) */}
        <div className="inline-flex rounded-lg border p-0.5" style={{ borderColor: 'var(--a-border)', background: 'var(--a-card2)' }}>
          <button
            onClick={() => setActiveTab('cafes')}
            className="flex items-center gap-2 px-5 h-9 rounded-md text-sm font-semibold transition-colors"
            style={activeTab === 'cafes' ? { background: 'var(--a-accent)', color: '#04170e' } : { color: 'var(--a-mut)' }}
          >
            <Users size={16} /> Kayıtlı Kafeler
          </button>
          <button
            onClick={() => setActiveTab('admins')}
            className="flex items-center gap-2 px-5 h-9 rounded-md text-sm font-semibold transition-colors"
            style={activeTab === 'admins' ? { background: 'var(--a-info)', color: '#fff' } : { color: 'var(--a-mut)' }}
          >
            <Shield size={16} /> Yerel Kullanıcılar
          </button>
        </div>

        {activeTab === 'cafes' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Stats */}
            <StatGrid>
              <StatCard icon={Users} label="Toplam Kafe" value={cafeUsers.length} tone="accent" />
              <StatCard icon={CheckCircle2} label="Gruba Atanmış" value={assignedCnt} tone="info" />
              <StatCard icon={Tag} label="Gruba Atanmamış" value={cafeUsers.length - assignedCnt} tone="mut" />
              <StatCard icon={AlertTriangle} label="Süresi Dolmuş" value={expiredCnt} tone="danger" />
            </StatGrid>

            {expiredCnt > 0 && (
              <div className="flex items-center gap-3 p-4 rounded-xl border text-sm"
                style={{ background: 'color-mix(in srgb, var(--a-danger) 12%, transparent)', borderColor: 'color-mix(in srgb, var(--a-danger) 28%, transparent)', color: 'var(--a-danger)' }}>
                <AlertTriangle size={18} className="shrink-0" />
                <span><strong>{expiredCnt}</strong> kullanıcının grup üyeliği sona ermiş.</span>
              </div>
            )}

            <Card className="overflow-hidden">
              <CardHeader title="Kayıtlı Kafeler" subtitle='Grup atamak için "Düzenle" butonunu kullanın' icon={Users}
                right={<IconButton icon={RefreshCw} title="Yenile" spinning={fetching} disabled={fetching} onClick={fetchAll} />} />

              {fetching ? (
                <Loading />
              ) : cafeUsers.length === 0 ? (
                <EmptyState icon={Users} title="Henüz kayıtlı kafe yok." />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr style={{ background: 'var(--a-card2)' }}>
                        {['Kafe', 'İletişim', 'Grup', 'Bitiş', 'Kayıt', 'GC Sürüm', 'HWID', 'İşlem'].map(h => (
                          <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--a-mut)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cafeUsers.map(user => (
                        <tr key={user.id} className={`border-t border-[var(--a-border)] hover:bg-[var(--a-card2)] transition-colors ${isExpired(user) ? 'opacity-60' : ''}`}>
                          <td className="px-5 py-3.5">
                            <p className="font-semibold" style={{ color: 'var(--a-ink)' }}>{user.cafe_name || '—'}</p>
                            <p className="text-xs" style={{ color: 'var(--a-mut)' }}>{user.first_name} {user.last_name}</p>
                          </td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--a-mut)' }}>
                            <p>{user.email}</p><p>{user.phone || '—'}</p>
                          </td>
                          <td className="px-5 py-3.5"><GroupBadge user={user} /></td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--a-mut)' }}>
                            {user.group_expires_at
                              ? <span style={isExpired(user) ? { color: 'var(--a-danger)', fontWeight: 600 } : undefined}>{new Date(user.group_expires_at).toLocaleDateString('tr-TR')}</span>
                              : <span style={{ color: 'var(--a-mut2)' }}>Süresiz</span>}
                          </td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--a-mut)' }}>{new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
                          <td className="px-5 py-3.5">
                            {(() => {
                              const v = telemetry[user.cafe_id];
                              if (!v) return <span className="text-xs" style={{ color: 'var(--a-mut)' }}>—</span>;
                              return <Badge tone="accent"><Tag size={9} /> v{v}</Badge>;
                            })()}
                          </td>
                          <td className="px-5 py-3.5 text-xs">
                            {user.hwid ? (
                              <span className="font-mono" style={{ color: 'var(--a-ok)' }} title={user.hwid}>Kilitli</span>
                            ) : (
                              <span style={{ color: 'var(--a-mut)' }}>Yok</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-2">
                              <Button variant="subtle" size="sm" icon={Edit2} onClick={() => setEditingUser(user)}>Düzenle</Button>
                              {user.hwid && (
                                <Button variant="danger" size="sm" icon={Unlock} title="HWID Kilidini Kaldır" onClick={() => handleResetHwid(user.id)}>Kilidi Aç</Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card className="overflow-hidden">
              <CardHeader title="Yerel Yöneticiler" subtitle="Panele erişebilen yönetici hesapları" icon={Shield}
                right={
                  <div className="flex items-center gap-3">
                    <button onClick={() => { setEditingAdmin(null); setShowAdminModal(true); }}
                      className="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all h-9 px-4 text-[13px] hover:brightness-110"
                      style={{ background: 'var(--a-info)', color: '#fff' }}>
                      <Plus size={16} /> Kullanıcı Ekle
                    </button>
                    <IconButton icon={RefreshCw} title="Yenile" spinning={fetching} disabled={fetching} onClick={fetchAll} />
                  </div>
                } />

              {fetching ? (
                <Loading />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr style={{ background: 'var(--a-card2)' }}>
                        {['Ad Soyad', 'E-posta / Kullanıcı Adı', 'Rol', 'Kayıt Tarihi', 'İşlem'].map(h => (
                          <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--a-mut)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {adminUsers.map(user => (
                        <tr key={user.id} className="border-t border-[var(--a-border)] hover:bg-[var(--a-card2)] transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-semibold" style={{ color: 'var(--a-ink)' }}>{user.first_name} {user.last_name}</p>
                          </td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--a-mut)' }}>
                            {user.email}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge tone="info">Yönetici</Badge>
                          </td>
                          <td className="px-5 py-3.5 text-xs" style={{ color: 'var(--a-mut)' }}>{new Date(user.created_at).toLocaleDateString('tr-TR')}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex gap-2">
                              <Button variant="subtle" size="sm" icon={Edit2} onClick={() => { setEditingAdmin(user); setShowAdminModal(true); }}>Düzenle</Button>
                              <Button variant="danger" size="sm" icon={Trash2} title="Sil" onClick={() => handleDeleteAdmin(user.id, user.email)} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </>
  );
};

export default UsersPage;
