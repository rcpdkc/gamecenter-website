import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, RefreshCw, Loader2, Edit2, CheckCircle2, X, Crown, Shield, Zap, Gift } from 'lucide-react';

const PLANS = [
  { value: 'free', label: 'Free', icon: Gift, color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
  { value: 'pro', label: 'Pro', icon: Zap, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { value: 'enterprise', label: 'Enterprise', icon: Crown, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
];

const PlanBadge = ({ plan, expires_at }) => {
  const p = PLANS.find(x => x.value === plan) || PLANS[0];
  const expired = expires_at && new Date(expires_at) < new Date();
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${expired ? 'bg-red-500/10 text-red-400 border-red-500/20' : `${p.bg} ${p.color} ${p.border}`}`}>
      <p.icon size={11} />
      {expired ? 'Süresi Doldu' : p.label}
    </span>
  );
};

const EditModal = ({ user, dark, onClose, onSave }) => {
  const [plan, setPlan] = useState(user.plan || 'free');
  const [expiresAt, setExpiresAt] = useState(
    user.plan_expires_at ? new Date(user.plan_expires_at).toISOString().split('T')[0] : ''
  );
  const [saving, setSaving] = useState(false);

  const inputBg = dark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-400' : 'text-gray-500';
  const modalBg = dark ? 'bg-[#111827] border-white/10' : 'bg-white border-gray-200';

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/update_user_plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          plan,
          plan_expires_at: plan !== 'free' && expiresAt ? expiresAt : null
        })
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
          <div>
            <h3 className={`text-lg font-bold ${txt}`}>Lisans Düzenle</h3>
            <p className={`text-sm ${sub} mt-0.5`}>{user.cafe_name} · {user.email}</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl ${dark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X size={18} />
          </button>
        </div>

        {/* Plan Selection */}
        <div className="mb-5">
          <label className={`block text-xs font-semibold uppercase tracking-wide ${sub} mb-3`}>Plan Tipi</label>
          <div className="grid grid-cols-3 gap-2">
            {PLANS.map(p => (
              <button
                key={p.value}
                onClick={() => setPlan(p.value)}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-xs font-semibold transition-all ${
                  plan === p.value
                    ? `${p.bg} ${p.color} ${p.border} shadow-sm`
                    : dark ? 'border-white/5 text-gray-500 hover:border-white/10' : 'border-gray-200 text-gray-400 hover:border-gray-300'
                }`}
              >
                <p.icon size={18} />
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expiry Date - only for non-free */}
        {plan !== 'free' && (
          <div className="mb-6">
            <label className={`block text-xs font-semibold uppercase tracking-wide ${sub} mb-2`}>Lisans Bitiş Tarihi</label>
            <input
              type="date"
              value={expiresAt}
              onChange={e => setExpiresAt(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all ${inputBg}`}
            />
            <p className={`text-xs ${sub} mt-1.5`}>Boş bırakırsanız süresiz lisans verilir.</p>
          </div>
        )}

        {plan === 'free' && (
          <div className={`mb-6 p-3 rounded-xl text-sm ${dark ? 'bg-white/5 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
            Free plan sınırsız süreli ve ücretsizdir. Bitiş tarihi gerekmez.
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${dark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500 transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(249,115,22,0.3)] disabled:opacity-60"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
};

const UsersPage = () => {
  const context = useOutletContext() || {};
  const dark = context.dark !== undefined ? context.dark : true;
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const panelBorder = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';
  const divider = dark ? 'divide-white/5' : 'divide-gray-100';

  const fetchUsers = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/get_users');
      const data = await res.json();
      if (data.success) setUsers(data.data);
    } catch (e) { console.error(e); }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const isExpired = (u) => u.plan !== 'free' && u.plan_expires_at && new Date(u.plan_expires_at) < new Date();

  const freeCnt = users.filter(u => u.plan === 'free').length;
  const proCnt = users.filter(u => u.plan === 'pro').length;
  const entCnt = users.filter(u => u.plan === 'enterprise').length;
  const expiredCnt = users.filter(u => isExpired(u)).length;

  return (
    <>
      {editingUser && (
        <EditModal
          user={editingUser}
          dark={dark}
          onClose={() => setEditingUser(null)}
          onSave={fetchUsers}
        />
      )}

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Toplam Üye', value: users.length, color: 'text-white' },
            { label: 'Free', value: freeCnt, color: 'text-gray-400' },
            { label: 'Pro', value: proCnt, color: 'text-blue-400' },
            { label: 'Enterprise', value: entCnt, color: 'text-orange-400' },
          ].map(s => (
            <div key={s.label} className={`${bg} border ${panelBorder} rounded-2xl p-4 shadow-sm`}>
              <p className={`text-xs font-medium ${sub} mb-1`}>{s.label}</p>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {expiredCnt > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <Shield size={18} className="shrink-0" />
            <span><strong>{expiredCnt}</strong> kullanıcının lisans süresi dolmuş. Lütfen inceleyip güncelleyin.</span>
          </div>
        )}

        {/* Table */}
        <div className={`${bg} border ${panelBorder} rounded-2xl overflow-hidden shadow-sm`}>
          <div className={`px-6 py-4 border-b ${panelBorder} flex items-center justify-between`}>
            <div>
              <h3 className={`text-base font-bold ${txt}`}>Kayıtlı Kafeler</h3>
              <p className={`text-xs ${sub} mt-0.5`}>Tüm üye kafeler ve lisans durumları</p>
            </div>
            <button onClick={fetchUsers} disabled={fetching} className={`p-2 rounded-xl transition-colors ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
              <RefreshCw size={15} className={fetching ? 'animate-spin' : ''} />
            </button>
          </div>

          {fetching ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-orange-500" size={24} /></div>
          ) : users.length === 0 ? (
            <div className={`py-16 text-center ${sub} text-sm`}>
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              Henüz kayıtlı kafe yok.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className={dark ? 'bg-white/3' : 'bg-gray-50'}>
                    {['Kafe', 'İletişim', 'Plan', 'Bitiş Tarihi', 'Kayıt Tarihi', 'İşlem'].map(h => (
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
                      <td className={`px-5 py-3.5 ${sub}`}>
                        <p>{user.email}</p>
                        <p className="text-xs">{user.phone || '—'}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <PlanBadge plan={user.plan} expires_at={user.plan_expires_at} />
                      </td>
                      <td className={`px-5 py-3.5 text-xs ${sub}`}>
                        {user.plan === 'free' ? (
                          <span className="text-gray-500">Süresiz</span>
                        ) : user.plan_expires_at ? (
                          <span className={isExpired(user) ? 'text-red-400 font-semibold' : ''}>
                            {new Date(user.plan_expires_at).toLocaleDateString('tr-TR')}
                          </span>
                        ) : (
                          <span className="text-gray-500">Süresiz</span>
                        )}
                      </td>
                      <td className={`px-5 py-3.5 text-xs ${sub}`}>
                        {new Date(user.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => setEditingUser(user)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${dark ? 'bg-white/5 text-gray-300 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          <Edit2 size={12} /> Düzenle
                        </button>
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
