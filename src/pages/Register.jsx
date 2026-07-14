import { useState } from 'react';
import { Store, User, Mail, Phone, Lock, Key, ArrowRight, Loader2, Home } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    cafe_name: '',
    phone: '',
    password: '',
    reference_code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setError(data.error || 'Kayıt başarısız.');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#050608] flex items-center justify-center relative font-sans">
        <div className="glass-panel p-10 text-center max-w-md w-full animate-fade-in-up">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store size={40} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Kayıt Başarılı!</h2>
          <p className="text-gray-400">Aramıza hoş geldin, {formData.cafe_name}. Giriş sayfasına yönlendiriliyorsun...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] flex items-center justify-center relative overflow-hidden font-sans py-12">
      
      {/* Dynamic Background */}
      <div className="absolute top-[0%] left-[-10%] w-[60vw] h-[60vw] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-float"></div>
      <div className="absolute bottom-[0%] right-[-10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[100px] mix-blend-screen pointer-events-none"></div>
      
      {/* Back to Home Link */}
      <Link to="/" className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2 transition-colors z-10 font-medium text-sm bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/5">
        <Home size={16} /> Ana Sayfa
      </Link>

      <div className="w-full max-w-xl z-10 px-6 relative mt-10 md:mt-0">
        
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-white/10 mb-5 shadow-lg shadow-emerald-500/10">
            <Store size={30} className="text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Game Center Ağına Katıl</h1>
          <p className="text-gray-400 text-sm">Gelişmiş bulut özelliklerini kafenizde kullanmaya başlayın</p>
        </div>

        <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2.5 text-red-400 mb-6 font-medium text-[13px] leading-tight">
                <Store size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" name="first_name" autoComplete="off" onChange={handleChange} required className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-gray-600" placeholder="Adınız" />
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" name="last_name" autoComplete="off" onChange={handleChange} required className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-gray-600" placeholder="Soyadınız" />
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input type="email" name="email" autoComplete="off" onChange={handleChange} required className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-gray-600" placeholder="E-Posta Adresi (Referansla Eşleşmeli)" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" name="cafe_name" autoComplete="off" onChange={handleChange} required className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-gray-600" placeholder="Kafe Adı" />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" name="phone" autoComplete="off" onChange={handleChange} required className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-gray-600" placeholder="Telefon Numarası" />
              </div>
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input type="password" name="password" autoComplete="new-password" onChange={handleChange} required className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all placeholder:text-gray-600" placeholder="Güçlü Bir Şifre Belirleyin" />
            </div>

            <div className="relative mt-6 pt-6 border-t border-white/5">
              <Key className="absolute left-4 top-[calc(50%+12px)] -translate-y-1/2 text-emerald-500" size={18} />
              <input type="text" name="reference_code" autoComplete="off" onChange={handleChange} required className="w-full bg-emerald-500/5 border border-emerald-500/30 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 outline-none transition-all font-mono placeholder:text-emerald-500/50" placeholder="Referans Kodu (GC-XXXXXX)" />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 group"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Kaydediliyor...</>
              ) : (
                <>Kaydı Tamamla <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
            
            <div className="mt-6 text-center flex flex-col items-center gap-3">
              <span className="text-[11px] text-gray-500 uppercase tracking-widest font-bold">Zaten Bir Hesabınız Var Mı?</span>
              <Link to="/login" className="text-[13px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg">
                Giriş Yapın
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
