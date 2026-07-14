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
      
      {/* Back to Home Link */}
      <Link to="/" className="absolute top-8 left-8 text-gray-500 hover:text-white flex items-center gap-2 transition-colors z-10">
        <Home size={18} /> Ana Sayfaya Dön
      </Link>

      <div className="w-full max-w-xl z-10 px-6">
        
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-white mb-2">Game Center'a Katıl</h1>
          <p className="text-gray-400">Referans kodunuz ile kafe kaydınızı tamamlayın</p>
        </div>

        <div className="glass-panel p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleRegister} className="space-y-5">
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Ad</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input type="text" name="first_name" onChange={handleChange} required className="w-full bg-[#12141d] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Soyad</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input type="text" name="last_name" onChange={handleChange} required className="w-full bg-[#12141d] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500/50" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">E-Posta Adresi (Referansla Eşleşmeli)</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type="email" name="email" onChange={handleChange} required className="w-full bg-[#12141d] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Kafe Adı</label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input type="text" name="cafe_name" onChange={handleChange} required className="w-full bg-[#12141d] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input type="text" name="phone" onChange={handleChange} required className="w-full bg-[#12141d] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500/50" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Şifre Belirleyin</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type="password" name="password" onChange={handleChange} required className="w-full bg-[#12141d] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Referans Kodu</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500" size={16} />
                <input type="text" name="reference_code" onChange={handleChange} required className="w-full bg-[#12141d] border border-emerald-500/30 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500/80 font-mono text-emerald-400" placeholder="GC-XXXXXX" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 group"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Kaydediliyor...</>
              ) : (
                <>Kayıt Ol <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              Zaten hesabın var mı? <Link to="/login" className="text-emerald-400 hover:underline">Giriş Yap</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
