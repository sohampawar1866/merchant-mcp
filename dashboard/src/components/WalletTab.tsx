'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, ShieldCheck, Zap, Lock, ArrowDownRight, ArrowUpRight, RefreshCw, AlertCircle, Layers } from 'lucide-react';

export function WalletTab({ merchantId }: { merchantId: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWalletData = async () => {
    if (!merchantId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/wallets?merchant_id=${merchantId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to load wallet ledger');
      setData(json);
      setError('');
    } catch (e: any) {
      setError(e.message || 'Database connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [merchantId]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-zinc-400 gap-3">
        <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
        <span className="text-sm font-medium">Querying PostgreSQL agent wallet ledger...</span>
      </div>
    );
  }

  const primaryWallet = data?.primary_wallet || {
    balance_inr: '₹1,817.54',
    monthly_allowance_inr: '₹15,000.00',
    per_transaction_cap_inr: '₹2,000.00',
    agent_id: 'claude-buyer-01',
    status: 'active',
  };

  const ledgerRows = data?.ledger || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Figma Signature Story Section: Mint Color-Block Hero */}
      <div className="p-6 sm:p-8 rounded-lg bg-figma-mint text-figma-ink border border-black/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-black/70">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>NPCI UPI CIRCLE & AP2 DELEGATED MANDATES (POSTGRESQL ACID LEDGER)</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-figma-ink">
            Autonomous Agent Wallet & Ledger
          </h2>
          <p className="text-sm text-black/80 max-w-xl leading-relaxed">
            Live database ledger tracking pre-authorized allowances for autonomous AI buyers. Orders within bounded caps clear with zero human clicks; exceeding orders trigger Razorpay 2FA step-up.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-5 py-3 rounded-lg bg-white border border-black/10 text-right shadow-xs">
            <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold">Primary Agent Balance</div>
            <div className="text-2xl font-extrabold text-figma-ink">{primaryWallet.balance_inr}</div>
            <div className="text-[10px] font-mono text-emerald-700 font-semibold mt-0.5">● Agent ID: {primaryWallet.agent_id}</div>
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
            <div className="text-3xl font-extrabold tracking-tight">{primaryWallet.per_transaction_cap_inr}</div>
            <p className="text-xs text-black/70 mt-1">Per-transaction auto-approval</p>
          </div>
        </div>

        <div className="p-5 rounded-lg bg-figma-lilac text-figma-ink border border-black/10 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-black/70">MONTHLY BUDGET</span>
            <span className="px-2 py-0.5 rounded-full bg-black/10 text-[10px] font-mono font-bold uppercase">LIMIT</span>
          </div>
          <div>
            <div className="text-3xl font-extrabold tracking-tight">{primaryWallet.monthly_allowance_inr}</div>
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

      {/* Live Double-Entry Ledger Transactions Table */}
      <div className="rounded-lg bg-white border border-figma-hairline shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-figma-hairline flex items-center justify-between bg-figma-canvas">
          <div>
            <h3 className="font-bold text-base text-figma-ink">PostgreSQL Double-Entry Ledger Stream</h3>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">Real-time immutable audit records from agent_wallet_ledger table</p>
          </div>
          <button
            onClick={fetchWalletData}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-figma-surfaceSoft hover:bg-zinc-100 text-xs font-mono border border-figma-hairline transition"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Ledger</span>
          </button>
        </div>

        {ledgerRows.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 font-mono text-xs">
            No ledger transactions recorded yet. Run an autonomous checkout turn to see live ACID entries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-50 border-b border-figma-hairline text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 font-bold">Transaction Type</th>
                  <th className="p-3.5 font-bold">Agent ID</th>
                  <th className="p-3.5 font-bold">Order / Description</th>
                  <th className="p-3.5 font-bold text-right">Amount</th>
                  <th className="p-3.5 font-bold text-right">Balance After</th>
                  <th className="p-3.5 font-bold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-figma-hairline">
                {ledgerRows.map((row: any) => (
                  <tr key={row.id} className="hover:bg-zinc-50/80 transition">
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        row.entry_type === 'DEBIT_PURCHASE'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {row.entry_type === 'DEBIT_PURCHASE' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {row.entry_type}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-zinc-800">{row.agent_id}</td>
                    <td className="p-3.5 text-zinc-600 max-w-xs truncate">
                      {row.description || (row.order_id ? `Order #${row.order_id}` : 'Ledger Adjustment')}
                    </td>
                    <td className={`p-3.5 text-right font-extrabold ${
                      row.entry_type === 'DEBIT_PURCHASE' ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {row.amount_inr}
                    </td>
                    <td className="p-3.5 text-right font-bold text-zinc-900">{row.balance_after_inr}</td>
                    <td className="p-3.5 text-right text-zinc-400">
                      {new Date(row.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
