'use client';

export default function EventLog({ events }) {
  return (
    <div className="w-72 shrink-0">
      <div className="backdrop-blur border border-white/10 rounded-2xl overflow-hidden bg-neutral-800">
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">Event Log</p>
        </div>
        <div className="p-3 space-y-2 min-h-32 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <p className="text-xs text-neutral-600 italic text-center py-4">Waiting for events…</p>
          ) : (
            events.map((ev, i) => (
              <div key={i} className="font-mono text-xs space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold ${
                    ev.type.includes('ERR') ? 'text-red-400'
                      : ev.type.includes('AUTH') || ev.type.includes('SAVE') ? 'text-emerald-400'
                      : ev.type.includes('RECV') ? 'text-sky-400'
                      : 'text-amber-400'
                  }`}>{ev.type}</span>
                  <span className="text-neutral-600 text-[10px]">
                    {ev.timestamp.toLocaleTimeString('en', { hour12: false })}
                  </span>
                </div>
                <p className="text-neutral-400 break-all leading-relaxed">{ev.message}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-4 border border-white/10 rounded-2xl p-4 bg-neutral-800">
        <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-3">Architecture</p>
        <div className="space-y-2 text-xs text-neutral-500">
          {[
            ['Main page injects CSS styles into iframe via', 'postMessage'],
            ['Pay triggers', 'VALIDATE_AND_TOKENISE', 'event to iframe'],
            ['iframe validates, mocks tokenisation, returns', 'TOKEN_READY'],
            ['Main page fires mock payment request with token'],
          ].map(([a, b, c], i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-lime-400 mt-0.5">▸</span>
              <span>{a} {b && <code className="text-neutral-300">{b}</code>} {c}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}