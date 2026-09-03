'use client';

import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Zap,
  ExternalLink,
  Code2,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Layers,
  Terminal
} from 'lucide-react';

const PRODUCTS = [
  {
    id: '78f9d6a3-a321-450b-8a7f-b7224c172c03',
    name: 'ErgoLift Aluminum Laptop Stand',
    category: 'Desk Accessories',
    priceINR: '₹899.00',
    pricePaise: 89900,
    rating: 4.9,
    badge: 'Bestseller',
    image: '💻',
    description: 'Aircraft-grade ergonomic aluminum riser with anti-slip silicone cushions.',
    tags: ['ergonomic', 'aluminum', 'workspace', 'productivity'],
  },
  {
    id: '93fdee4b-6308-4d7c-9e79-e3d3f6082977',
    name: 'DeskGlow RGB Gaming Desk Mat',
    category: 'Desk Accessories',
    priceINR: '₹1,199.00',
    pricePaise: 119900,
    rating: 4.8,
    badge: 'Popular Combo',
    image: '🌈',
    description: 'Extra-large waterproof micro-woven desk pad with 14 chroma RGB lighting modes.',
    tags: ['rgb', 'desk mat', 'gaming', 'waterproof'],
  },
  {
    id: '21a7288c-a939-4efd-becb-c9d81394f64d',
    name: 'AirBass X2 Pro Wireless Earbuds',
    category: 'Audio',
    priceINR: '₹1,799.00',
    pricePaise: 179900,
    rating: 4.7,
    badge: 'ANC Enabled',
    image: '🎧',
    description: 'Active Noise Cancelling true wireless earbuds with 32hr battery life.',
    tags: ['audio', 'anc', 'bluetooth', 'earbuds'],
  },
  {
    id: '5cdc6b33-1e3a-430f-83b1-900508b03877',
    name: 'AeroBeam 4K Portable Projector',
    category: 'Smart Home',
    priceINR: '₹12,999.00',
    pricePaise: 1299900,
    rating: 5.0,
    badge: 'Flagship',
    image: '📽️',
    description: 'Ultra-compact 4K HDR home theater projector with Android TV & Auto-Keystone.',
    tags: ['projector', '4k', 'cinema', 'smart home'],
  },
];

export default function StorefrontPage() {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const copyURL = (path: string) => {
    const full = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;
    navigator.clipboard.writeText(full);
    setCopiedFile(path);
    setTimeout(() => setCopiedFile(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-zinc-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Banner: AI Protocol Announcement */}
      <div className="bg-zinc-950 text-white text-xs font-mono py-2.5 px-4 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-emerald-400 uppercase tracking-wider">AI AGENT COMMERCE ENABLED</span>
            <span className="hidden md:inline text-zinc-400">• NPCI UAP / AP2 Compliant • Model Context Protocol</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-400">
            <a href="/llms.txt" target="_blank" className="hover:text-white flex items-center gap-1 transition">
              /llms.txt <ExternalLink className="w-3 h-3" />
            </a>
            <a href="/.well-known/mcp.json" target="_blank" className="hover:text-white flex items-center gap-1 transition">
              /.well-known/mcp.json <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              S
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none tracking-tight">Soham Store</h1>
              <p className="text-[11px] text-zinc-500 font-mono mt-0.5">Lifestyle & Tech Gear</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
              <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span>Razorpay Verified</span>
            </div>

            <a
              href="http://localhost:3000/?merchant_id=efe794fa-e1e2-4d30-8f13-cb74b2b5f110"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition shadow-sm"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Merchant Studio</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="relative rounded-[32px] bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-8 sm:p-12 overflow-hidden shadow-xl border border-zinc-800">
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Autonomous Shopping Architecture
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              The First Storefront Built for Both <span className="text-emerald-400">Humans & AI Buyers</span>.
            </h2>

            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              Browse manually or tell your AI assistant (Claude, ChatGPT, Perplexity) to search, bargain combo bundle discounts, and buy for you with zero human friction.
            </p>

            {/* Discovery Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => copyURL('/llms.txt')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 border border-zinc-700 transition"
              >
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{copiedFile === '/llms.txt' ? '✓ Copied URL!' : 'Copy /llms.txt'}</span>
              </button>

              <button
                onClick={() => copyURL('/.well-known/mcp.json')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 border border-zinc-700 transition"
              >
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>{copiedFile === '/.well-known/mcp.json' ? '✓ Copied URL!' : 'Copy MCP Discovery'}</span>
              </button>
            </div>
          </div>

          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>
      </section>

      {/* Featured AI Growth Bundle Banner */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto w-full mb-10">
        <div className="p-6 sm:p-8 rounded-[28px] bg-gradient-to-r from-emerald-500/10 via-brand-50 to-transparent border border-emerald-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              Dynamic AI Growth Combo Deal
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-950">
              Power Duo: Aluminum Laptop Stand + RGB Gaming Mat
            </h3>
            <p className="text-xs sm:text-sm text-zinc-600 max-w-xl">
              AI Buyers automatically unlock an instant <strong>15% bundle discount (Save ₹314.70)</strong> when buying both items together in a single cart.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-xs line-through text-zinc-400">₹2,098.00</div>
              <div className="text-2xl font-extrabold text-emerald-600">₹1,783.30</div>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-zinc-950 text-white font-mono text-xs font-semibold">
              AI Bundle Ready
            </div>
          </div>
        </div>
      </section>

      {/* Catalog Grid */}
      <main className="px-4 sm:px-6 max-w-7xl mx-auto w-full flex-1 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-zinc-950">Product Catalog</h3>
            <p className="text-xs text-zinc-500 mt-1 font-mono">Real-time inventory connected to Razorpay Settlement rails</p>
          </div>
          <span className="text-xs font-mono text-zinc-400">{PRODUCTS.length} products available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-[24px] border border-zinc-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-200 p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Image / Icon container */}
                <div className="h-40 rounded-2xl bg-zinc-100 flex items-center justify-center text-5xl relative overflow-hidden">
                  <span>{product.image}</span>
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-zinc-800 shadow-xs uppercase tracking-wider font-mono">
                    {product.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">{product.category}</div>
                  <h4 className="font-bold text-base text-zinc-900 leading-snug line-clamp-2">{product.name}</h4>
                  <p className="text-xs text-zinc-500 line-clamp-2">{product.description}</p>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-zinc-100">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-extrabold text-zinc-900">{product.priceINR}</span>
                  <span className="text-[10px] font-mono text-emerald-600 font-semibold">18% GST Incl.</span>
                </div>

                {/* AI Protocol Payload Box */}
                <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-[11px] font-mono space-y-1">
                  <div className="text-zinc-400 flex items-center justify-between">
                    <span>Product ID:</span>
                    <span className="text-zinc-700 font-bold truncate max-w-[120px]">{product.id.slice(0, 8)}...</span>
                  </div>
                  <div className="text-emerald-700 font-medium">● Floor Margins Guarded</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* How to Buy with AI Instruction Section */}
      <section className="bg-white border-t border-zinc-200 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl font-bold tracking-tight text-zinc-950">How to Buy from this Store using AI</h3>
            <p className="text-xs text-zinc-500">Zero technical setup for customers — just talk to your AI agent naturally.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-sm">1</div>
              <h4 className="font-bold text-zinc-900">Tell Your AI Assistant</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Provide this website URL or store name to Claude, ChatGPT, or your local agent: <em>"Find me the laptop stand on Soham Store."</em>
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-sm">2</div>
              <h4 className="font-bold text-zinc-900">Automatic Discovery</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                The AI automatically fetches <code className="bg-white px-1 py-0.5 rounded text-[11px]">/llms.txt</code> and <code className="bg-white px-1 py-0.5 rounded text-[11px]">/.well-known/mcp.json</code> to load the product catalog & bundle discounts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="w-8 h-8 rounded-xl bg-zinc-950 text-white flex items-center justify-center font-bold text-sm">3</div>
              <h4 className="font-bold text-zinc-900">Autonomous Settlement</h4>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Orders under ₹2,000 auto-debit with zero clicks from your pre-funded wallet; larger orders generate an instant 1-click Razorpay payment link.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-950 text-zinc-400 text-xs py-8 px-4 sm:px-6 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Soham Store</span>
            <span>•</span>
            <span>Powered by AgenticCheckout & Razorpay</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="/llms.txt" target="_blank" className="hover:text-white">llms.txt</a>
            <a href="/.well-known/mcp.json" target="_blank" className="hover:text-white">mcp.json</a>
            <a href="/.well-known/agent-manifest.json" target="_blank" className="hover:text-white">agent-manifest.json</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
