'use client';

export default function PaymentCardHeader({ currencySymbol, amount }) {
  return (
    <div className="px-8 pt-8 pb-6 border-b border-white/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-lime-400 uppercase mb-1">Checkout</p>
          <h1 className="text-2xl font-bold text-white tracking-tight">Complete Payment</h1>
        </div>
        <div className="text-right">
          <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Total</p>
          <p className="text-3xl font-bold text-white">{currencySymbol}{amount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}