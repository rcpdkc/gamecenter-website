import { useState, useEffect } from 'react';
import { Lock, ArrowRight, Loader2, CheckCircle2, XCircle, Home, Eye, EyeOff } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Geçersiz bağlantı. Lütfen şifre sıfırlama talebini yeniden oluşturun.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage('Şifreler eşleşmiyor.');
      return;
    }
    if (password.length < 6) {
      setMessage('Şifre en az 6 karakter olmalı.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage(data.message);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Bir hata oluştu.');
      }
    } catch {
      setStatus('error');
      setMessage('Sunucuya bağlanılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-orange-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

      <Link to="/" className="absolute top-8 left-8 text-gray-500 hover:text-white flex items-center gap-2 transition-colors z-10">
        <Home size={18} /> Ana Sayfaya Dön
      </Link>

      <div className="w-full max-w-md z-10 px-6">
        {/* Logo */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-[0_0_30px_rgba(249,115,22,0.4)] mb-6">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Yeni Şifre</h1>
          <p className="text-gray-400">Hesabınız için yeni bir şifre belirleyin</p>
        </div>

        <div className="glass-panel p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>

          {/* Success */}
          {status === 'success' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 size={56} className="text-emerald-400" />
              </div>
              <p className="text-emerald-400 font-semibold text-lg mb-2">Şifre Güncellendi!</p>
              <p className="text-gray-400 text-sm mb-6">{message}</p>
              <p className="text-gray-600 text-xs">3 saniye içinde giriş sayfasına yönlendiriliyorsunuz...</p>
              <Link to="/login" className="mt-4 inline-block text-orange-400 hover:text-orange-300 text-sm transition-colors">
                Hemen Giriş Yap →
              </Link>
            </div>
          )}

          {/* Error (no token) */}
          {status === 'error' && !token && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle size={56} className="text-red-400" />
              </div>
              <p className="text-red-400 font-semibold text-lg mb-2">Geçersiz Bağlantı</p>
              <p className="text-gray-400 text-sm mb-6">{message}</p>
              <Link to="/login" className="text-orange-400 hover:text-orange-300 text-sm transition-colors">
                ← Giriş sayfasına dön
              </Link>
            </div>
          )}

          {/* Form */}
          {token && status !== 'success' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {message && (
                <div className={`p-3 rounded-lg text-sm text-center border ${
                  status === 'error'
                    ? 'bg-red-500/10 border-red-500/20 text-red-400'
                    : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                }`}>
                  {message}
                </div>
              )}

              {/* Yeni şifre */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Yeni Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#12141d] border border-white/5 rounded-xl py-3 pl-10 pr-12 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                    placeholder="En az 6 karakter"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Şifre tekrar */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Şifre Tekrar</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className={`w-full bg-[#12141d] border rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none transition-colors ${
                      confirm && confirm !== password
                        ? 'border-red-500/40 focus:border-red-500/60'
                        : confirm && confirm === password
                        ? 'border-emerald-500/40 focus:border-emerald-500/60'
                        : 'border-white/5 focus:border-orange-500/50'
                    }`}
                    placeholder="••••••••"
                    required
                  />
                  {confirm && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {confirm === password
                        ? <CheckCircle2 size={16} className="text-emerald-400" />
                        : <XCircle size={16} className="text-red-400" />
                      }
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold py-3 px-4 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Güncelleniyor...</>
                ) : (
                  <>Şifremi Güncelle <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>

              <p className="text-center text-sm text-gray-600">
                <Link to="/login" className="text-orange-400 hover:text-orange-300 transition-colors">
                  ← Giriş sayfasına dön
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
