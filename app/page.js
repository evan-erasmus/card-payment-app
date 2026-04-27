import { Suspense } from 'react';
import PaymentPage from './components/PaymentPage';

export default function Home() {
  return (
    <Suspense>
      <PaymentPage />
    </Suspense>
  );
}