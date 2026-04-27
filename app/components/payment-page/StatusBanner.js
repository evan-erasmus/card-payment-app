'use client';

const BANNER_CONFIG = {
  error: {
    wrapper: 'bg-red-500/10 border-red-500/30',
    iconColor: 'text-red-400',
    iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z',
  },
  success: {
    wrapper: 'bg-emerald-500/10 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
  },
};

export default function StatusBanner({ status, errorMessage, successData }) {
  const config = BANNER_CONFIG[status];
  if (!config) return null;
  if (status === 'error' && !errorMessage) return null;
  if (status === 'success' && !successData) return null;

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${config.wrapper}`}>
      <svg className={`w-4 h-4 mt-0.5 shrink-0 ${config.iconColor}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d={config.iconPath} clipRule="evenodd" />
      </svg>
      {status === 'error' ? (
        <p className="text-sm text-red-300">{errorMessage}</p>
      ) : (
        <div>
          <p className="text-sm font-semibold text-emerald-300 mb-1">Payment Authorised!</p>
          <p className="text-xs text-emerald-400/70 font-mono">{successData.transactionId}</p>
        </div>
      )}
    </div>
  );
}