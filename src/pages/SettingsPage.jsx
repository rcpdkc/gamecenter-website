import { Settings } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

const SettingsPage = () => {
  const context = useOutletContext();
  const dark = context?.dark ?? true;

  const bg = dark ? 'bg-[#111827]' : 'bg-white';
  const panelBorder = dark ? 'border-white/5' : 'border-gray-100';
  const txt = dark ? 'text-white' : 'text-gray-900';
  const sub = dark ? 'text-gray-500' : 'text-gray-400';

  return (
    <div className="space-y-6">
      <div className={`${bg} border ${panelBorder} rounded-2xl p-12 shadow-sm flex flex-col items-center justify-center text-center`}>
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 border border-orange-500/20">
          <Settings size={32} className="text-orange-500" />
        </div>
        <h2 className={`text-xl font-bold ${txt} mb-2`}>Sistem Ayarları Yapım Aşamasında</h2>
        <p className={`${sub} max-w-md text-sm`}>
          Cloud Admin paneline ait genel sistem ayarları, e-posta şablonları ve global bildirim yapılandırmaları yakında bu bölüme eklenecektir.
        </p>
      </div>
    </div>
  );
};

export default SettingsPage;
