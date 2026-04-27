import './globals.css';

export const metadata = {
  title: 'Card Payment Demo',
  description: 'Mocked card payment page with hosted payment page iframe',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
