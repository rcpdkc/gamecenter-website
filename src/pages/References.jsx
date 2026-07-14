import { useState, useEffect } from 'react';
import { Key, Mail, Send, Loader2, CheckCircle2, Copy } from 'lucide-react';

const References = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [refs, setRefs] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [newCode, setNewCode] = useState(null);

  const fetchReferences = async () => {
    try {
      const res = await fetch('/api/get_references');
      const data = await res.json();
      if (data.success) setRefs(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchReferences();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch('/api/create_reference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setNewCode(data.code);
        setEmail('');
        fetchReferences();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Kopyalandı: " + text);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
          <Key className="text-orange-500" /> Referans ve Davet Sistemi
        </h1>
        <p className="text-muted">Kafelere özel referans kodları üreterek sisteme güvenle dahil olmalarını sağlayın.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Create Code Section */}
        <div className="md:col-span-1">
          <div className="glass-panel p-6 border-t-4 border-t-orange-500">
            <h3 className="text-lg font-bold text-white mb-4">Yeni Referans Üret</h3>
            <form onSubmit={handleCreate}>
              <label className="block text-sm text-gray-400 mb-2">Kafenin E-Posta Adresi</label>
              <div className="relative mb-4">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="kafe@mail.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500/50"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Üret ve Kaydet
              </button>
            </form>

            {newCode && (
              <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-center">
                <p className="text-sm text-emerald-400 mb-1 flex justify-center items-center gap-1"><CheckCircle2 size={16} /> Kod Başarıyla Üretildi!</p>
                <p className="font-mono text-xl font-bold text-white">{newCode}</p>
                <button onClick={() => copyToClipboard(newCode)} className="mt-2 text-xs text-emerald-400/80 hover:text-emerald-400 flex justify-center items-center gap-1 mx-auto">
                  <Copy size={12} /> Kopyala
                </button>
              </div>
            )}
          </div>
        </div>

        {/* List Section */}
        <div className="md:col-span-2">
          <div className="glass-panel overflow-hidden">
            <div className="p-4 bg-white/5 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Geçmiş Referans Kodları</h3>
            </div>
            
            {fetching ? (
              <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>
            ) : refs.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Henüz hiç referans kodu üretilmedi.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-400">
                  <thead className="text-xs text-gray-500 uppercase bg-black/20">
                    <tr>
                      <th className="px-6 py-3">E-Posta Adresi</th>
                      <th className="px-6 py-3">Referans Kodu</th>
                      <th className="px-6 py-3">Durum</th>
                      <th className="px-6 py-3 text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refs.map(ref => (
                      <tr key={ref.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-6 py-4 text-white font-medium">{ref.email}</td>
                        <td className="px-6 py-4 font-mono">{ref.code}</td>
                        <td className="px-6 py-4">
                          {ref.is_used ? (
                            <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">Kullanıldı</span>
                          ) : (
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Bekliyor</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => copyToClipboard(ref.code)} className="text-gray-500 hover:text-white" title="Kopyala">
                            <Copy size={16} />
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
    </div>
  );
};

export default References;
