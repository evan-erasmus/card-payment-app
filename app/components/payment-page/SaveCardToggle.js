'use client';

export default function SaveCardToggle({ saveCard, setSaveCard }) {
  return (
    <div className="flex items-center gap-3 mt-4">
      <button
        role="switch"
        aria-checked={saveCard}
        onClick={() => setSaveCard((v) => !v)}
        className={`relative w-10 h-6 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-lime-500 focus:ring-offset-2 focus:ring-offset-neutral-900 ${
          saveCard ? 'bg-lime-500' : 'bg-white/15'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
            saveCard ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-sm text-slate-300">Save card for future payments</span>
    </div>
  );
}