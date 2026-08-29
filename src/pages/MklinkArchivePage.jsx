import { useState, useEffect, useRef } from 'react';
import { FolderSync, Upload, Trash2, Loader2, FileJson, CheckCircle2, Download } from 'lucide-react';
import { Card, CardHeader, Button, IconButton, Badge, EmptyState, Loading, useToast, useConfirm } from '../admin/ui';

const MklinkArchivePage = () => {
  const [archives, setArchives] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { push } = useToast();
  const { confirm, confirmNode } = useConfirm();

  const fetchArchives = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/mklink_archive');
      const data = await res.json();
      if (data.success) setArchives(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);

        // Validation basic
        if (!json.name || !json.items) {
          push('Geçersiz şablon dosyası! name ve items alanları bulunamadı.', 'danger');
          return;
        }

        setUploading(true);
        const res = await fetch('/api/mklink_archive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: json.name,
            description: json.description || 'Yerel sistemden dışa aktarılan şablon.',
            data_json: json
          })
        });

        const data = await res.json();
        if (data.success) {
          fetchArchives();
          push('Şablon başarıyla arşive yüklendi!', 'ok');
        } else {
          push(data.error, 'danger');
        }
      } catch (err) {
        push('Dosya okunurken bir hata oluştu. Geçerli bir JSON dosyası seçtiğinizden emin olun.', 'danger');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleDelete = async (id) => {
    const ok = await confirm({ title: 'Şablonu sil', message: 'Bu şablonu arşivden silmek istediğinize emin misiniz?', tone: 'danger', confirmLabel: 'Sil' });
    if (!ok) return;

    try {
      const res = await fetch('/api/mklink_archive', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (data.success) {
        fetchArchives();
      } else {
        push(data.error, 'danger');
      }
    } catch (err) {
      push('Silinemedi.', 'danger');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="Arşivdeki Şablonlar"
          subtitle="Sisteme yüklenmiş ve kafelere açık olan tüm şablonlar."
          icon={FolderSync}
          right={
            <>
              <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                JSON Şablon Yükle
              </Button>
            </>
          }
        />

        {fetching ? (
          <Loading />
        ) : archives.length === 0 ? (
          <EmptyState icon={FileJson} title="Arşivde henüz hiç şablon yok." />
        ) : (
          <div className="divide-y divide-[var(--a-border)]">
            {archives.map(arch => (
              <div key={arch.id} className="p-4 px-6 flex items-center justify-between transition-colors hover:bg-[var(--a-card2)]">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <CheckCircle2 size={20} style={{ color: 'var(--a-ok)' }} />
                  </div>
                  <div>
                    <h4 className="font-semibold" style={{ color: 'var(--a-ink)' }}>{arch.name}</h4>
                    <p className="text-xs mt-1 max-w-xl" style={{ color: 'var(--a-mut)' }}>{arch.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge tone="mut">{arch.data_json.items?.length || 0} Kural</Badge>
                      <span className="text-[10px]" style={{ color: 'var(--a-mut2)' }}>
                        Yüklendi: {new Date(arch.created_at).toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <IconButton
                    icon={Download}
                    title="JSON İndir"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(arch.data_json, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = `mklink_${arch.name.replace(/\s+/g,'_')}.json`; a.click();
                      URL.revokeObjectURL(url);
                    }}
                  />
                  <button
                    onClick={() => handleDelete(arch.id)}
                    className="w-8 h-8 grid place-items-center rounded-lg transition-colors hover:bg-[var(--a-card2)]"
                    style={{ color: 'var(--a-danger)' }}
                    title="Şablonu Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      {confirmNode}
    </div>
  );
};

export default MklinkArchivePage;
