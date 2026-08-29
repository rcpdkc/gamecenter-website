import { Settings } from 'lucide-react';
import { Card, EmptyState } from '../admin/ui';

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <EmptyState
          icon={Settings}
          title="Ayarlar yakında"
          hint="Cloud Admin genel sistem ayarları, e-posta şablonları ve global bildirim yapılandırmaları yakında bu bölüme eklenecek."
        />
      </Card>
    </div>
  );
};

export default SettingsPage;
