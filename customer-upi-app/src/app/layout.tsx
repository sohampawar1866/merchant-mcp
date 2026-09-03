import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NPCI UPI Circle - Customer Delegated Agent App',
  description: 'Simulated customer UPI Circle smartphone app for autonomous AI agent budget delegation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0A0A0B] text-zinc-100 min-h-screen">{children}</body>
    </html>
  );
}
