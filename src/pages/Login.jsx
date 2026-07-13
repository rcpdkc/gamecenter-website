import { Lock, Mail, ChevronRight } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center pt-20 px-4 relative overflow-hidden">
      
      {/* Background Orbs specifically for login */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] -z-10"></div>

      <div className="glass-panel w-full max-w-md p-8 md:p-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 mx-auto flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(249,115,22,0.4)]">
            <Lock size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz</h2>
          <p className="text-muted">Müşteri paneline giriş yapın.</p>
        </div>

        <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">E-Posta Adresi</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-500" />
              </div>
              <input 
                type="email" 
                placeholder="ornek@kafe.com"
                className="w-full bg-[#0a0b10]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-400">Şifre</label>
              <a href="#" className="text-xs text-orange-400 hover:text-orange-300">Şifremi Unuttum?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500" />
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-[#0a0b10]/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mt-2">
            Giriş Yap <ChevronRight size={18} />
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          Lisans satın almak veya destek için <a href="#" className="text-orange-400 hover:underline">iletişime geçin</a>.
        </div>
      </div>
    </div>
  );
};

export default Login;
