'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Store,
  Key,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ArrowRight,
  Lock,
  Zap,
} from 'lucide-react';

export default function OnboardPage() {
  const [formData, setFormData] = useState({
    name: '',
    razorpay_key_id: '',
    razorpay_key_secret: '',
    razorpay_webhook_secret: 'agentic_checkout_secret_2026',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/merchants/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to onboard store');
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Onboarding error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.api_key) {
      navigator.clipboard.writeText(result.api_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-figma-canvas text-figma-ink flex flex-col justify-between p-4 sm:p-6 md:p-8">
      {/* Header */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between py-4 border-b border-figma-hairline">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-figma-primary text-white flex items-center justify-center p-1.5">
            <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain filter invert brightness-0" />
          </div>
          <span className="font-sans text-base font-semibold tracking-tight">AgenticCheckout</span>
        </Link>
        <span className="text-xs font-mono tracking-wider uppercase px-3 py-1 rounded-full bg-figma-surfaceSoft border border-figma-hairline">
          Merchant Onboarding
        </span>
      </header>

      {/* Main Container */}
      <main className="max-w-xl w-full mx-auto my-8 bg-white border border-figma-hairline rounded-2xl shadow-sm p-6 sm:p-8">
        {!result ? (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-figma-surfaceSoft text-figma-ink text-xs font-mono font-semibold mb-3 border border-figma-hairline">
                <ShieldCheck className="w-3.5 h-3.5 text-figma-primary" />
                Zero .env Setup • Encrypted at Rest
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-figma-ink">
                Connect Your Store
              </h2>
              <p className="text-sm text-zinc-500 mt-1">
                Enter your store details and Razorpay test credentials. Your secrets are encrypted directly into the PostgreSQL vault.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Store Name *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Audio Labs, UrbanStyle Gear"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-figma-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Razorpay Key ID *
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    placeholder="rzp_test_..."
                    value={formData.razorpay_key_id}
                    onChange={(e) => setFormData({ ...formData, razorpay_key_id: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-figma-primary text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Razorpay Key Secret *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••••••••••••••"
                    value={formData.razorpay_key_secret}
                    onChange={(e) => setFormData({ ...formData, razorpay_key_secret: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-figma-primary text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Razorpay Webhook Secret
                </label>
                <div className="relative">
                  <Zap className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={formData.razorpay_webhook_secret}
                    onChange={(e) => setFormData({ ...formData, razorpay_webhook_secret: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-figma-primary text-sm font-mono text-zinc-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-figma-primary hover:bg-zinc-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
                >
                  {loading ? 'Registering Store & Vault Encryption...' : 'Generate Store API Key & Launch'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-figma-ink">
              Store Activated!
            </h2>
            <p className="text-sm text-zinc-500 mt-1 max-w-md mx-auto">
              <strong>{result.name}</strong> is now live on the agentic commerce platform.
            </p>

            {/* API Key Box */}
            <div className="my-6 p-4 rounded-xl bg-figma-surfaceSoft border border-figma-hairline text-left">
              <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-zinc-500 mb-2">
                <span>Merchant MCP API Key (Save This Now)</span>
                {copied && <span className="text-green-600 font-bold">Copied!</span>}
              </div>
              <div className="flex items-center justify-between gap-2 p-3 bg-white border border-zinc-200 rounded-lg">
                <code className="font-mono text-sm font-bold text-figma-ink truncate">
                  {result.api_key}
                </code>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 shrink-0"
                  title="Copy API Key"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-amber-700 mt-2 font-mono">
                ⚠️ This API key is only shown once. Configure your AI Buyer Agent with this key to access your store catalog and initiate transactions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/?merchant_id=${result.merchant_id}`}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-figma-primary text-white text-sm font-medium hover:bg-zinc-800 transition"
              >
                Open Merchant Control Plane
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-zinc-400 font-mono tracking-wider uppercase py-4">
        AgenticCheckout Multi-Tenant Platform • Zero Margin Leakage Guarantee
      </footer>
    </div>
  );
}
