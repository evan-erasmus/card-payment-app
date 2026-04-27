'use client';

export default function IframeContainer({ iframeRef, iframeReady }) {
  return (
    <div className="relative rounded-2xl overflow-hidden border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
      {!iframeReady && (
        <div className="absolute inset-0 flex items-center justify-center z-10 rounded-2xl" style={{ background: 'rgba(15,23,42,0.7)' }}>
          <div className="flex items-center gap-2 text-neutral-400 text-sm">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading payment form…
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src="/hosted-payment/index.html"
        title="Hosted Payment Page"
        sandbox="allow-scripts allow-same-origin"
        className="w-full border-0 block"
        style={{ height: '248px' }}
      />
    </div>
  );
}