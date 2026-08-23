import { useState, useRef, useEffect } from 'react';

/**
 * "Güncel Verileri Getir" — kafe sunucusuna taze telemetri isteği bırakır.
 * Sunucu ~1 dk içinde isteği görüp (poll) güncel veriyi gönderir; buton geri sayım
 * bitince onRefreshed() ile sayfa verisini yeniden yükler.
 */
export default function RefreshFromCafeButton({ user, dark, onRefreshed }) {
  const [state, setState] = useState('idle');   // idle | sent | error
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const request = async () => {
    try {
      const r = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'request_refresh',
          cafe_id: user?.cafe_id || undefined,
          hwid: user?.hwid || undefined,
          email: user?.email || undefined,
        }),
      });
      const j = await r.json();
      if (!r.ok || !j.success) throw new Error(j.error || 'İstek gönderilemedi');
      setState('sent');
      let left = 75;   // sunucu 60 sn'de bir bakar + gönderim payı
      setCountdown(left);
      timerRef.current = setInterval(() => {
        left -= 1;
        setCountdown(left);
        if (left <= 0) {
          clearInterval(timerRef.current);
          setState('idle');
          onRefreshed?.();
        }
      }, 1000);
    } catch (e) {
      setState('error');
      setTimeout(() => setState('idle'), 4000);
    }
  };

  if (state === 'sent') {
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${dark ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        İstek gönderildi — sunucudan bekleniyor ({countdown} sn)
      </div>
    );
  }

  return (
    <button onClick={request}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition ${
        state === 'error'
          ? 'bg-red-500/10 border border-red-500/40 text-red-500'
          : 'bg-orange-500 hover:bg-orange-600 text-white'
      }`}>
      {state === 'error' ? 'Gönderilemedi — tekrar dene' : '⟳ Güncel Verileri Getir'}
    </button>
  );
}
