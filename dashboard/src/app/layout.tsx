import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgenticCheckout Control Plane',
  description: 'Autonomous Buyer Agent Gateway & Merchant Control Plane',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-figma-canvas text-figma-ink antialiased selection:bg-figma-primary selection:text-white">
        {children}
      </body>
    </html>
  );
}

