import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Settings, Send, Loader2, Megaphone, Trash2 } from 'lucide-react';

const SettingsPage = () => {
  const context = useOutletContext();
  const dark = context?.dark ?? true;
  
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const panelBorder = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';
  const inputBg = dark ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900';

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      const data = await res.json();
      if (data.success) setAnnouncements(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!title || !message) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, link })
      });
      const data = await res.json();
      if (data.success) {
        setTitle('');
        setMessage('');
        setLink('');
        fetchAnnouncements();
        alert('Duyuru başarıyla tüm kafelere iletildi!');
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Duyuru Yayınla Formu */}
      <div className={`${bg} border ${panelBorder} rounded-2xl p-6 shadow-sm`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
            <Megaphone size={20} className="text-orange-500" />
          </div>
          <div>
            <h2 className={`text-lg font-bold ${txt}`}>Global Duyuru Yayınla</h2>
            <p className={`text-xs ${sub} mt-0.5`}>Tüm kafelere "Bildirim Zili" üzerinden anında iletilecek bir duyuru oluşturun.</p>
          </div>
        </div>

        <form onSubmit={handlePublish} className="space-y-4 max-w-3xl">
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider ${sub} mb-2`}>Başlık *</label>
            <input
              type="text" required value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Örn: Game Center 1.0.5 Güncellemesi Çıktı!"
              className={`w-full border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all ${inputBg}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider ${sub} mb-2`}>Mesaj *</label>
            <textarea
              required value={message} onChange={e => setMessage(e.target.value)} rows={4}
              placeholder="Duyuru detaylarını buraya yazın..."
              className={`w-full border rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 resize-none transition-all ${inputBg}`}
            />
          </div>
          <div>
            <label className={`block text-xs font-semibold uppercase tracking-wider ${sub} mb-2`}>Yönlendirme Linki (Opsiyonel)</label>
            <input
              type="url" value={link} onChange={e => setLink(e.target.value)}
              placeholder="Örn: https://github.com/..."
              className={`w-full border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all ${inputBg}`}
            />
          </div>
          
          <div className="pt-2">
            <button
              type="submit" disabled={saving || !title || !message}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold shadow-[0_4px_15px_rgba(249,115,22,0.3)] hover:from-orange-400 hover:to-orange-500 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Yayınla
            </button>
          </div>
        </form>
      </div>

      {/* Önceki Duyurular */}
      {announcements.length > 0 && (
        <div className={`${bg} border ${panelBorder} rounded-2xl overflow-hidden shadow-sm`}>
          <div className={`px-6 py-4 border-b ${panelBorder}`}>
            <h3 className={`text-base font-bold ${txt}`}>Son Duyurular</h3>
          </div>
          <div className={`divide-y ${dark ? 'divide-white/5' : 'divide-gray-100'}`}>
            {announcements.map(ann => (
              <div key={ann.id} className="p-4 px-6 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className={`font-semibold ${txt}`}>{ann.title}</span>
                  <span className={`text-xs ${sub}`}>{new Date(ann.created_at).toLocaleString('tr-TR')}</span>
                </div>
                <p className={`text-sm ${sub}`}>{ann.message}</p>
                {ann.link && (
                  <a href={ann.link} target="_blank" rel="noreferrer" className="text-orange-500 hover:underline text-xs mt-1 self-start">
                    Linke Git
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default SettingsPage;
