import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Soham Store — AI-Agent Ready Storefront',
  description: 'The first e-commerce store built for humans & autonomous AI buyers with protected floor pricing, dynamic AI upsells, and instant Razorpay checkout.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
