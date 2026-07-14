import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Key, Mail, Send, Loader2, CheckCircle2, Copy, RefreshCw, Clock, Trash2 } from 'lucide-react';

const References = () => {
  const context = useOutletContext() || {};
  const dark = context.dark !== undefined ? context.dark : true;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [refs, setRefs] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [newCode, setNewCode] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const panelBorder = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';
  const inputBg = dark ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400';
  const divider = dark ? 'divide-white/5' : 'divide-gray-100';
  const tableHead = dark ? 'bg-white/3 text-gray-500' : 'bg-gray-50 text-gray-400';

  const fetchReferences = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/references');
      const data = await res.json();
      if (data.success) setRefs(data.data);
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchReferences(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setNewCode(null);
    try {
      const res = await fetch('/api/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) { setNewCode(data.code); setEmail(''); fetchReferences(); }
      else alert(data.error);
    } catch { alert("Hata oluştu."); }
    finally { setLoading(false); }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu referans kodunu silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch('/api/references', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) fetchReferences();
      else alert(data.error);
    } catch { alert('Silme işlemi başarısız.'); }
  };

  const used = refs.filter(r => r.is_used).length;
  const pending = refs.filter(r => !r.is_used).length;

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Toplam Kod', value: refs.length, color: 'text-blue-400', bg: dark ? 'bg-blue-500/10' : 'bg-blue-50' },
          { label: 'Bekliyor', value: pending, color: 'text-emerald-400', bg: dark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
          { label: 'Kullanıldı', value: used, color: 'text-gray-400', bg: dark ? 'bg-white/5' : 'bg-gray-100' },
        ].map(s => (
          <div key={s.label} className={`${bg} border ${panelBorder} rounded-2xl p-4 shadow-sm`}>
            <p className={`text-xs font-medium ${sub} mb-1`}>{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Create Code Panel */}
        <div className={`xl:col-span-1 ${bg} border ${panelBorder} rounded-2xl p-6 shadow-sm`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.25)]">
              <Key size={18} className="text-white" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${txt}`}>Yeni Referans Üret</h3>
              <p className={`text-xs ${sub}`}>E-postaya özel davet kodu</p>
            </div>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold ${sub} mb-1.5 uppercase tracking-wide`}>Kafenin E-Posta Adresi</label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${sub}`} size={15} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="kafe@mail.com"
                  required
                  className={`w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all ${inputBg}`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm flex justify-center items-center gap-2 transition-all shadow-[0_4px_15px_rgba(249,115,22,0.3)] disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              {loading ? 'Üretiliyor...' : 'Üret ve Kaydet'}
            </button>
          </form>

          {/* Success card */}
          {newCode && (
            <div className={`mt-5 p-4 rounded-xl border ${dark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
              <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1 mb-2">
                <CheckCircle2 size={13} /> Kod Üretildi!
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-lg font-bold text-emerald-400">{newCode}</code>
                <button
                  onClick={() => copyToClipboard(newCode, 'new')}
                  className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 transition-colors"
                >
                  {copiedId === 'new' ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-xs text-emerald-400/60 mt-1">Bu kodu kopyalayıp kafenizle paylaşın.</p>
            </div>
          )}
        </div>

        {/* Codes Table */}
        <div className={`xl:col-span-2 ${bg} border ${panelBorder} rounded-2xl overflow-hidden shadow-sm`}>
          <div className={`px-6 py-4 border-b ${panelBorder} flex items-center justify-between`}>
            <div>
              <h3 className={`text-base font-bold ${txt}`}>Tüm Referans Kodları</h3>
              <p className={`text-xs ${sub} mt-0.5`}>Geçmiş ve bekleyen davetler</p>
            </div>
            <button
              onClick={fetchReferences}
              disabled={fetching}
              className={`p-2 rounded-xl transition-colors ${dark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
            >
              <RefreshCw size={15} className={fetching ? 'animate-spin' : ''} />
            </button>
          </div>

          {fetching ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-orange-500" size={24} />
            </div>
          ) : refs.length === 0 ? (
            <div className={`py-16 text-center ${sub} text-sm`}>
              <Key size={32} className="mx-auto mb-3 opacity-30" />
              Henüz hiç referans kodu üretilmedi.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className={tableHead}>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">E-Posta</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Referans Kodu</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${divider}`}>
                  {refs.map(ref => (
                    <tr key={ref.id} className={`transition-colors ${dark ? 'hover:bg-white/3' : 'hover:bg-gray-50'}`}>
                      <td className={`px-6 py-3.5 font-medium ${txt}`}>{ref.email}</td>
                      <td className="px-6 py-3.5">
                        <code className={`font-mono font-bold text-sm ${dark ? 'text-orange-400' : 'text-orange-500'}`}>{ref.code}</code>
                      </td>
                      <td className="px-6 py-3.5">
                        {ref.is_used ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${dark ? 'bg-gray-500/10 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Kullanıldı
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Bekliyor
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right flex items-center justify-end gap-2">
                        {!ref.is_used && (
                          <button
                            onClick={() => copyToClipboard(ref.code, ref.id)}
                            className={`p-2 rounded-lg transition-colors ${dark ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                            title="Kopyala"
                          >
                            {copiedId === ref.id ? <CheckCircle2 size={15} className="text-emerald-400" /> : <Copy size={15} />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(ref.id)}
                          className={`p-2 rounded-lg transition-colors ${dark ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
                          title="Sil"
                        >
                          <Trash2 size={15} />
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
    </div>
  );
};

export default References;
