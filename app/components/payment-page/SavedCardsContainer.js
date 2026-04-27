'use client';

const BRAND_LABELS = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  '': 'Card',
};

const BRAND_COLORS = {
  visa: '#1a1f71',
  mastercard: '#eb001b',
  amex: '#007bc1',
  discover: '#f76f20',
  '': '#6b7280',
};

export default function SavedCardsContainer({ savedCards, setSelectedCardId, selectedCardId, setErrorMessage }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-3">
        Saved Cards
      </p>
      <div className="space-y-2">
        {savedCards.map((card) => (
          <button
            key={card.id}
            onClick={() => {
              setSelectedCardId(selectedCardId === card.id ? null : card.id);
              setErrorMessage('');
            }}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl border transition-all text-left ${
              selectedCardId === card.id
                ? 'border-lime-500 bg-lime-500/10 shadow-[0_0_0_1px_rgba(99,102,241,0.4)]'
                : 'border-white/10 bg-white/4 hover:border-white/20 hover:bg-white/8'
            }`}
          >
            <div
              className="w-10 h-7 rounded-md flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0"
              style={{ background: BRAND_COLORS[card.brand] || BRAND_COLORS[''] }}
            >
              {(BRAND_LABELS[card.brand] || 'XX').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white tracking-wide">
                {BRAND_LABELS[card.brand] || 'Card'} ····{card.last4}
              </p>
              <p className="text-xs text-neutral-400">{card.cardholderName} · {card.expiry}</p>
            </div>
            {selectedCardId === card.id && (
              <div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}