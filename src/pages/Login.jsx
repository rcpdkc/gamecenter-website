import { useState } from 'react';
import { Server, Lock, User, ArrowRight, Loader2, Home, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Şifremi unuttum state
  const [view, setView] = useState('login'); // 'login' | 'forgot' | 'sent'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        localStorage.setItem('gc_admin_token', data.token);
        localStorage.setItem('gc_user', JSON.stringify(data.user));
        navigate('/superadmin');
      } else {
        setError(data.error || 'Giriş başarısız.');
      }
    } catch (err) {
      setError('Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');

    try {
      const res = await fetch('/api/auth?action=forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setView('sent');
      } else {
        setForgotError(data.error || 'Bir hata oluştu.');
      }
    } catch {
      setForgotError('Sunucuya bağlanılamadı.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-orange-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-float"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-float" style={{animationDelay: '2s'}}></div>

      {/* Back to Home Link */}
      <Link to="/" className="absolute top-8 left-8 text-gray-500 hover:text-white flex items-center gap-2 transition-colors z-10">
        <Home size={18} /> Ana Sayfaya Dön
      </Link>

      <div className="w-full max-w-md z-10 px-6">
        
        {/* ── LOGIN VIEW ── */}
        {view === 'login' && (
          <>
            <div className="text-center mb-10 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-[0_0_30px_rgba(249,115,22,0.4)] mb-6">
                <Server size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Game Center Cloud</h1>
              <p className="text-gray-400">Yönetim paneline giriş yapın</p>
            </div>

            <div className="glass-panel p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <form onSubmit={handleLogin} className="space-y-6">
                
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Kullanıcı Adı</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text" 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-[#12141d] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                      placeholder="admin"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-400">Şifre</label>
                    <button
                      type="button"
                      onClick={() => { setView('forgot'); setForgotError(''); setForgotEmail(''); }}
                      className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      Şifremi Unuttum
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-[#12141d] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Doğrulanıyor...</>
                  ) : (
                    <>Giriş Yap <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                  )}
                </button>
              </form>
            </div>

            <p className="text-center text-gray-600 text-sm mt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Yetkisiz erişim denemeleri loglanmaktadır.
            </p>
          </>
        )}

        {/* ── FORGOT VIEW ── */}
        {view === 'forgot' && (
          <>
            <div className="text-center mb-10 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-[0_0_30px_rgba(59,130,246,0.4)] mb-6">
                <Mail size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Şifremi Unuttum</h1>
              <p className="text-gray-400">E-posta adresinize sıfırlama bağlantısı göndereceğiz</p>
            </div>

            <div className="glass-panel p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <form onSubmit={handleForgot} className="space-y-5">

                {forgotError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
                    {forgotError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">E-posta Adresi</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      className="w-full bg-[#12141d] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                      placeholder="ornek@mail.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {forgotLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> Gönderiliyor...</>
                  ) : (
                    <>Sıfırlama Bağlantısı Gönder <ArrowRight size={18} /></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition-colors py-2"
                >
                  <ArrowLeft size={15} /> Giriş sayfasına dön
                </button>
              </form>
            </div>
          </>
        )}

        {/* ── SENT VIEW ── */}
        {view === 'sent' && (
          <>
            <div className="text-center mb-10 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.4)] mb-6">
                <CheckCircle2 size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Mail Gönderildi!</h1>
              <p className="text-gray-400">Şifre sıfırlama bağlantısı e-postanıza iletildi</p>
            </div>

            <div className="glass-panel p-8 animate-fade-in-up text-center" style={{ animationDelay: '0.1s' }}>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6">
                <p className="text-emerald-400 text-sm leading-relaxed">
                  <strong>{forgotEmail}</strong> adresine gönderildi.<br />
                  Bağlantı <strong>1 saat</strong> geçerlidir.
                </p>
              </div>
              <p className="text-gray-500 text-xs mb-6">
                Maili göremiyorsanız spam klasörünü kontrol edin.
              </p>
              <button
                onClick={() => setView('login')}
                className="flex items-center justify-center gap-2 mx-auto text-orange-400 hover:text-orange-300 transition-colors text-sm"
              >
                <ArrowLeft size={15} /> Giriş sayfasına dön
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default Login;
