'use client';

import React from 'react';
import { Wallet, ShieldCheck, Zap, ArrowDownLeft, Lock, CheckCircle2, Sliders, ExternalLink } from 'lucide-react';

export function WalletTab({ merchantId }: { merchantId: string }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Figma Signature Story Section: Mint Color-Block Hero */}
      <div className="p-6 sm:p-8 rounded-lg bg-figma-mint text-figma-ink border border-black/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-black/70">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NPCI UPI CIRCLE & AP2 DELEGATED MANDATES</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-figma-ink">
            Autonomous Agent Wallet & Ledger
          </h2>
          <p className="text-sm text-black/80 max-w-xl leading-relaxed">
            Inspect pre-approved allowances for autonomous AI buyers. Orders within bounded caps clear with zero human clicks; exceeding orders trigger Razorpay 2FA step-up.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-5 py-3 rounded-lg bg-white border border-black/10 text-right shadow-xs">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Primary Agent Balance</div>
            <div className="text-2xl font-extrabold text-figma-ink">₹3,939.18</div>
            <div className="text-[10px] font-mono text-emerald-700 font-semibold mt-0.5">● Monthly Cap: ₹15,000.00</div>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-lg bg-figma-lime text-figma-ink border border-black/10 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-black/70">ZERO-CLICK CAP</span>
            <span className="px-2 py-0.5 rounded-full bg-black/10 text-[10px] font-mono font-bold uppercase">AUTO</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">₹2,000.00</div>
            <p className="text-xs text-black/70 mt-1">Per-transaction auto-approval</p>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-figma-lilac text-figma-ink border border-black/10 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-black/70">MONTHLY BUDGET</span>
            <span className="px-2 py-0.5 rounded-full bg-black/10 text-[10px] font-mono font-bold uppercase">LIMIT</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">₹15,000.00</div>
            <p className="text-xs text-black/70 mt-1">Delegated owner allowance</p>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-figma-cream text-figma-ink border border-black/10 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-black/70">SETTLEMENT</span>
            <span className="px-2 py-0.5 rounded-full bg-black/10 text-[10px] font-mono font-bold uppercase">ACID</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">Double-Entry</div>
            <p className="text-xs text-black/70 mt-1">PostgreSQL SELECT FOR UPDATE</p>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-figma-surfaceSoft text-figma-ink border border-figma-hairline flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-500">HITL 2FA RAIL</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold uppercase">FALLBACK</span>
          </div>
          <div>
            <div className="text-2xl font-extrabold tracking-tight text-zinc-900">Razorpay Link</div>
            <p className="text-xs text-zinc-500 mt-1">For carts exceeding ₹2,000 limit</p>
          </div>
        </div>
      </div>

      {/* Trust Continuum & Rules Card */}
      <div className="rounded-lg bg-white border border-figma-hairline shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-figma-hairline flex items-center justify-between bg-figma-canvas">
          <div>
            <h3 className="font-bold text-base text-figma-ink">Safety & Delegation Parameters</h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">Continuous trust verification enforcing zero unauthorized money actions</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-figma-lime text-figma-ink text-[11px] font-mono font-bold border border-black/15">
            NPCI UAP COMPLIANT
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-figma-surfaceSoft border border-figma-hairline space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
                <Zap className="w-3.5 h-3.5" />
                <span>Zero-Click Fast Path</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Cart subtotals $\le$ ₹2,000 clear autonomously in milliseconds. The wallet ledger deducts funds atomically and generates instant order receipts.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-figma-surfaceSoft border border-figma-hairline space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-700 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Category Whitelist</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Autonomous spending is strictly scoped to approved categories: <strong>Desk Gadgets</strong>, <strong>Audio & Acoustics</strong>, <strong>Smart Home</strong>, and <strong>Wearables</strong>.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-figma-surfaceSoft border border-figma-hairline space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-700 uppercase tracking-wider">
                <Lock className="w-3.5 h-3.5" />
                <span>Step-Up 2FA Escalation</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                High-value orders (e.g. ₹12,999 Projector) automatically generate a live Razorpay payment link for human UPI MPIN / OTP approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
