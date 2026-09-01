'use client';

import React from 'react';
import { Wallet, ShieldCheck, Zap, ArrowDownLeft, Lock, CheckCircle2 } from 'lucide-react';

export function WalletTab({ merchantId }: { merchantId: string }) {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-8 rounded-[32px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 backdrop-blur-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-600 border border-indigo-500/30 text-xs font-mono font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              NPCI UPI Circle & AP2 Protocol Standard
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
              Autonomous Agent Wallet & Ledger
            </h2>
            <p className="text-sm text-zinc-600 max-w-xl">
              Inspect delegated pre-approved allowances for autonomous AI buyers. Transactions within bounded per-order caps clear with zero human clicks; exceeding orders trigger Razorpay 2FA step-up.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-indigo-100 shadow-sm text-right">
            <div className="text-xs text-zinc-500 font-mono uppercase">Primary Agent Balance</div>
            <div className="text-3xl font-bold text-indigo-600">₹3,939.18</div>
            <div className="text-xs text-emerald-600 font-medium mt-1">● Monthly Cap: ₹15,000.00</div>
          </div>
        </div>
      </div>

      {/* Safety Bounds Continuum */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[24px] bg-white border border-zinc-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900">Zero-Click Autonomous Cap</h3>
            <p className="text-xs text-zinc-500 mt-1">Orders up to ₹2,000 clear instantly without OTP/MPIN prompts.</p>
          </div>
          <div className="text-2xl font-bold text-zinc-900">₹2,000.00 <span className="text-xs text-zinc-400 font-normal">/ txn</span></div>
        </div>

        <div className="p-6 rounded-[24px] bg-white border border-zinc-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900">Category Whitelist</h3>
            <p className="text-xs text-zinc-500 mt-1">Enforced auto-approval categories delegated by owner.</p>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Audio', 'Desk Accessories', 'Smart Home', 'Wearables'].map(c => (
              <span key={c} className="px-2 py-0.5 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-mono">
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 rounded-[24px] bg-white border border-zinc-200 shadow-sm space-y-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900">HITL 2FA Escalation Rail</h3>
            <p className="text-xs text-zinc-500 mt-1">Orders exceeding cap automatically step up to Razorpay Payment Link.</p>
          </div>
          <div className="text-sm font-semibold text-amber-600">Active (Live Razorpay Fallback)</div>
        </div>
      </div>
    </div>
  );
}
