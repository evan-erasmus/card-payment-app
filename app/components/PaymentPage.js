'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';

import EventLog from './payment-page/EventLog';
import SavedCardsContainer from './payment-page/SavedCardsContainer';
import PaymentCardHeader from './payment-page/PaymentCardHeader';
import SaveCardToggle from './payment-page/SaveCardToggle';
import PayButton from './payment-page/PayButton';
import StatusBanner from './payment-page/StatusBanner';
import IframeContainer from './payment-page/IframeContainer';

const INITIAL_SAVED_CARDS = [
  { id: 'card_1', last4: '4242', brand: 'visa', cardholderName: 'Jane Doe', expiry: '12 / 26', token: 'tok_SAVEDVISA4242' },
  { id: 'card_2', last4: '5555', brand: 'mastercard', cardholderName: 'Jane Doe', expiry: '08 / 27', token: 'tok_SAVEDMC5555' },
];

const CURRENCY_SYMBOLS = { GBP: '£', USD: '$', EUR: '€' };

async function mockPaymentRequest(token, amount, currency) {
  await new Promise((r) => setTimeout(r, 800));
  if (Math.random() < 0.05) throw new Error('Payment declined by issuer');
  return {
    transactionId: 'txn_' + Math.random().toString(36).slice(2, 12).toUpperCase(),
    status: 'AUTHORISED',
    amount,
    currency,
    token,
    timestamp: new Date().toISOString(),
  };
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const DEBUG = searchParams.get('debug') === 'true';

  const iframeRef = useRef(null);
  const [iframeReady, setIframeReady] = useState(false);
  const [savedCards, setSavedCards] = useState(INITIAL_SAVED_CARDS);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [saveCard, setSaveCard] = useState(false);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [events, setEvents] = useState([]);

  const amount = 149.99;
  const currency = 'GBP';
  const currencySymbol = CURRENCY_SYMBOLS[currency] ?? '';

  const log = useCallback((type, message) => {
    setEvents((prev) => [{ type, message, timestamp: new Date() }, ...prev].slice(0, 20));
  }, []);

  const sendToIframe = useCallback((msg) => {
    iframeRef.current?.contentWindow?.postMessage(msg, '*');
  }, []);

  useEffect(() => {
    const handler = async (event) => {
      const { type, payload } = event.data || {};

      if (type === 'VALIDATION_FAILED') {
        log('< RECV', 'VALIDATION_FAILED <- iframe');
        setStatus('idle');
        setErrorMessage('Please fix the errors in the card form.');
        return;
      }

      if (type === 'TOKENISING') {
        log('< RECV', 'TOKENISING <- iframe');
        setStatus('tokenising');
        return;
      }

      if (type === 'TOKEN_READY') {
        log('< RECV', `TOKEN_READY <- iframe  token=${payload?.token}`);

        if (saveCard && payload) {
          setSavedCards((prev) => [...prev, {
            id: 'card_' + Date.now(),
            last4: payload.last4,
            brand: payload.brand,
            cardholderName: payload.cardholderName,
            expiry: payload.expiry,
            token: payload.token,
          }]);
          log('= SAVE', `Card saved: ····${payload.last4}`);
        }

        setStatus('paying');
        log('> SENT', `Payment request: ${currency} ${amount} token=${payload?.token}`);
        try {
          const result = await mockPaymentRequest(payload.token, amount, currency);
          log('+ AUTH', `Transaction authorised: ${result.transactionId}`);
          setSuccessData(result);
          setStatus('success');
          sendToIframe({ type: 'CLEAR_FORM' });
          setSelectedCardId(null);
        } catch (err) {
          log('- ERR', err.message);
          setErrorMessage(err.message);
          setStatus('error');
        }
        return;
      }

      if (type === 'TOKENISE_ERROR') {
        log('- ERR', `Tokenise error <- iframe: ${event.data.error}`);
        setErrorMessage('Card tokenisation failed. Please try again.');
        setStatus('error');
      }
    };

    setIframeReady(true);
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [sendToIframe, saveCard, amount, currency, log]);

  const handlePay = useCallback(async () => {
    setErrorMessage('');
    setSuccessData(null);

    if (selectedCardId) {
      const card = savedCards.find((c) => c.id === selectedCardId);
      if (!card) return;
      setStatus('paying');
      log('> SENT', `Payment request (saved card): ${currency} ${amount} token=${card.token}`);
      try {
        const result = await mockPaymentRequest(card.token, amount, currency);
        log('+ AUTH', `Transaction authorised: ${result.transactionId}`);
        setSuccessData(result);
        setStatus('success');
      } catch (err) {
        log('- ERR', err.message);
        setErrorMessage(err.message);
        setStatus('error');
      }
    } else {
      setStatus('validating');
      log('> SENT', 'VALIDATE_AND_TOKENISE -> iframe');
      sendToIframe({ type: 'VALIDATE_AND_TOKENISE' });
    }
  }, [selectedCardId, savedCards, sendToIframe, amount, currency, log]);

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
    setSuccessData(null);
    setSelectedCardId(null);
    sendToIframe({ type: 'CLEAR_FORM' });
  };

  const isLoading = ['validating', 'tokenising', 'paying'].includes(status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900 flex items-center justify-center p-4">
      <div className="relative w-full max-w-5xl flex gap-6 items-start">

        <div className="flex-1 min-w-0">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

            <PaymentCardHeader amount={amount} currencySymbol={currencySymbol} />

            <div className="p-8 space-y-6">

              {savedCards.length > 0 && (
                <SavedCardsContainer
                  savedCards={savedCards}
                  selectedCardId={selectedCardId}
                  setSelectedCardId={setSelectedCardId}
                  setErrorMessage={setErrorMessage}
                />
              )}

              {!selectedCardId && (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-white/10" />
                    <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
                      {savedCards.length > 0 ? 'Or New Card' : 'Card Details'}
                    </p>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                  <IframeContainer iframeRef={iframeRef} iframeReady={iframeReady} />
                  <SaveCardToggle saveCard={saveCard} setSaveCard={setSaveCard} />
                </div>
              )}

              {selectedCardId && (
                <button
                  onClick={() => setSelectedCardId(null)}
                  className="text-xs text-lime-400 hover:text-lime-300 underline underline-offset-2"
                >
                  + Use a different card
                </button>
              )}

              <StatusBanner status={status} errorMessage={errorMessage} successData={successData} />

              <PayButton
                status={status}
                isLoading={isLoading}
                iframeReady={iframeReady}
                amount={amount}
                currencySymbol={currencySymbol}
                onPay={handlePay}
                onReset={handleReset}
              />

              <p className="text-center text-xs text-neutral-500 flex items-center justify-center gap-1.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Card details secured in isolated iframe
              </p>
            </div>
          </div>
        </div>

        {DEBUG && <EventLog events={events} />}
      </div>
    </div>
  );
}