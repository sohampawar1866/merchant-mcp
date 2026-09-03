import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Platform Admin - AgenticCheckout',
  description: 'Global Multi-Tenant Control Plane & Kill Switch Console',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-figma-canvas text-figma-ink font-sans">
        {children}
      </body>
    </html>
  );
}
