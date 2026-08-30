import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AgenticCheckout Merchant Control Plane | Razorpay',
  description: 'AI Buyer Agent Gateway & Merchant Command Center',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#071324] text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
