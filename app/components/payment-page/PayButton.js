'use client';

export default function PayButton({ status, isLoading, iframeReady, amount, currencySymbol, onPay, onReset }) {
  if (status === 'success') {
    return (
      <button
        onClick={onReset}
        className="w-full py-4 rounded-2xl font-semibold text-sm tracking-wide text-white border border-white/20 hover:bg-white/10 transition-all"
        style={{ background: 'rgba(255,255,255,0.06)' }}
      >
        Make Another Payment
      </button>
    );
  }

  return (
    <button
      onClick={onPay}
      disabled={isLoading || !iframeReady}
      className="w-full py-4 rounded-2xl font-bold text-sm tracking-widest uppercase text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: isLoading
          ? 'oklch(76.8% 0.233 130.85)'
          : 'linear-gradient(135deg, #7ccf00 0%, #7ccf00 100%)',
      }}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {status === 'validating' ? 'Validating…' : status === 'tokenising' ? 'Tokenising…' : 'Processing…'}
        </span>
      ) : (
        `Pay ${currencySymbol}${amount.toFixed(2)}`
      )}
    </button>
  );
}