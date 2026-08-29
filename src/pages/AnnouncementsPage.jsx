import { useState, useEffect } from 'react';
import { Send, Loader2, Megaphone } from 'lucide-react';
import { Card, CardHeader, Button, Input } from '../admin/ui';

const AnnouncementsPage = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

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

  const labelCls = 'block text-xs font-semibold uppercase tracking-wider mb-2';

  return (
    <div className="space-y-6">

      {/* Duyuru Yayınla Formu */}
      <Card>
        <CardHeader title="Duyuru Yayınla" icon={Megaphone} />
        <form onSubmit={handlePublish} className="p-5 space-y-4 max-w-3xl">
          <div>
            <label className={labelCls} style={{ color: 'var(--a-mut)' }}>Başlık *</label>
            <Input
              type="text" required value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Örn: Game Center 1.0.5 Güncellemesi Çıktı!"
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--a-mut)' }}>Mesaj *</label>
            <textarea
              required value={message} onChange={e => setMessage(e.target.value)} rows={4}
              placeholder="Duyuru detaylarını buraya yazın..."
              className="w-full rounded-lg border text-[13px] outline-none transition-colors resize-none py-3 px-3"
              style={{ background: 'var(--a-card2)', borderColor: 'var(--a-border)', color: 'var(--a-ink)' }}
            />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--a-mut)' }}>Yönlendirme Linki (Opsiyonel)</label>
            <Input
              type="url" value={link} onChange={e => setLink(e.target.value)}
              placeholder="Örn: https://github.com/..."
            />
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={saving || !title || !message}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Yayınla
            </Button>
          </div>
        </form>
      </Card>

      {/* Önceki Duyurular */}
      {announcements.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader title="Son Duyurular" />
          <div className="divide-y divide-[var(--a-border)]">
            {announcements.map(ann => (
              <div key={ann.id} className="p-4 px-6 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold" style={{ color: 'var(--a-ink)' }}>{ann.title}</span>
                  <span className="text-xs" style={{ color: 'var(--a-mut)' }}>{new Date(ann.created_at).toLocaleString('tr-TR')}</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--a-mut)' }}>{ann.message}</p>
                {ann.link && (
                  <a href={ann.link} target="_blank" rel="noreferrer" className="hover:underline text-xs mt-1 self-start" style={{ color: 'var(--a-accent)' }}>
                    Linke Git
                  </a>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
};

export default AnnouncementsPage;
