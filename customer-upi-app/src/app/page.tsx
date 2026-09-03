'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  Sliders,
  CreditCard,
  Building2,
  Lock,
  ArrowUpRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  PlusCircle,
  Wifi,
  Battery,
  Bot,
  Store,
} from 'lucide-react';

interface WalletData {
  id: string;
  agent_id: string;
  user_id: string;
  balance_paise: number;
  balance_inr: string;
  monthly_allowance_paise: number;
  monthly_allowance_inr: string;
  monthly_spent_paise: number;
  monthly_spent_inr: string;
  per_transaction_cap_paise: number;
  per_transaction_cap_inr: string;
  percent_spent: number;
  status: string;
}

interface LedgerItem {
  id: string;
  entry_type: string;
  amount_inr: string;
  balance_after_inr: string;
  description: string;
  created_at: string;
  is_debit: boolean;
}

interface AccountInfo {
  holder_name: string;
  bank_name: string;
  masked_account: string;
  upi_id: string;
  upi_circle_status: string;
}

export default function CustomerUpiAppPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [capValue, setCapValue] = useState<number>(2000);
  const [updatingCap, setUpdatingCap] = useState(false);
  const [simulating, setSimulating] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'alert';
    title: string;
    message: string;
    orderId?: string;
  } | null>(null);

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/wallet');
      const data = await res.json();
      if (data.success) {
        setWallet(data.wallet);
        setLedger(data.ledger || []);
        setAccount(data.account_info);
        setCapValue(Math.round(Number(data.wallet.per_transaction_cap_paise) / 100));
      }
    } catch (err) {
      console.error('Failed to fetch UPI Circle data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleCapChange = async (newVal: number) => {
    setCapValue(newVal);
    setUpdatingCap(true);
    try {
      await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_cap',
          cap_paise: newVal * 100,
        }),
      });
      fetchWallet();
    } catch (err) {
      console.error('Failed to update cap:', err);
    } finally {
      setUpdatingCap(false);
    }
  };

  const handleRefill = async () => {
    try {
      await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refill',
          amount_paise: 500000, // ₹5,000
        }),
      });
      setNotification({
        type: 'success',
        title: 'Allowance Replenished',
        message: 'Added ₹5,000.00 from SBI primary account to delegated allowance.',
      });
      fetchWallet();
    } catch (err) {
      console.error('Failed to refill:', err);
    }
  };

  const handleSimulatePurchase = async (productName: string, amountInr: number) => {
    setSimulating(productName);
    setNotification(null);
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate_purchase',
          amount_paise: amountInr * 100,
          product_name: productName,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setNotification({
          type: 'success',
          title: '⚡ UPI Circle Auto-Approved!',
          message: data.message,
          orderId: data.order_id,
        });
        fetchWallet();
      } else if (data.escalate_2fa) {
        setNotification({
          type: 'alert',
          title: '🛡️ Exceeds Auto-Cap (Razorpay 2FA Required)',
          message: data.message,
        });
      } else {
        setNotification({
          type: 'alert',
          title: 'Transaction Declined',
          message: data.message,
        });
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setSimulating(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 flex flex-col items-center justify-start p-4 sm:p-8 font-sans">
      {/* Top Banner & Cross-Portal Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between pb-6 mb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
            📱
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              Customer UPI Phone Simulator
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-mono text-blue-400">
                Port 3002
              </span>
            </h1>
            <p className="text-xs text-zinc-400">NPCI UPI Circle & AP2 Delegated Agent Mandate Rail</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            <Store className="w-3.5 h-3.5 text-figma-lime" />
            <span className="hidden sm:inline">Merchant Dashboard (:3000)</span>
            <ExternalLink className="w-3 h-3 text-zinc-500" />
          </a>

          <button
            onClick={fetchWallet}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-700/60 text-zinc-400 hover:text-white transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container: Split Demo View */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: The Smartphone Mockup Frame */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[390px] rounded-[48px] bg-black border-[7px] border-zinc-800 shadow-2xl shadow-blue-950/30 overflow-hidden relative flex flex-col">
            {/* Phone Screen Notch / Dynamic Island */}
            <div className="pt-3 px-6 bg-zinc-950 flex items-center justify-between text-[11px] text-zinc-400">
              <span className="font-semibold text-white tracking-wide">9:41</span>
              <div className="w-20 h-4 bg-black rounded-full mx-auto" />
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3 text-zinc-300" />
                <Battery className="w-3.5 h-3.5 text-zinc-300" />
              </div>
            </div>

            {/* In-Phone App Content */}
            <div className="bg-zinc-950 px-5 pt-3 pb-6 flex-1 flex flex-col gap-4 overflow-y-auto max-h-[720px] custom-scrollbar">
              {/* App Brand Header */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-white text-xs shadow-md">
                    UPI
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white tracking-tight flex items-center gap-1">
                      BHIM UPI Circle
                    </h2>
                    <p className="text-[10px] text-zinc-400">Delegated Agent Spend</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
                  SBI Active
                </span>
              </div>

              {/* Primary User Account Card */}
              <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-blue-400 border border-zinc-700">
                    SP
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Soham Pawar</p>
                    <p className="text-[10px] text-zinc-400">State Bank of India •••• 4092</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-zinc-400">soham@oksbi</span>
                </div>
              </div>

              {/* Delegated Agent Card */}
              <div className="rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-purple-950/40 border border-blue-500/30 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-white">Claude Assistant</p>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono">claude-buyer-01</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-[10px] font-medium text-blue-300 border border-blue-500/30">
                  Secondary Agent
                </span>
              </div>

              {/* Live Delegated Balance Card */}
              <div className="rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/90 p-4 relative overflow-hidden shadow-inner">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-zinc-400 tracking-wider uppercase">
                    Available Agent Allowance
                  </span>
                  <button
                    onClick={handleRefill}
                    className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>Top-up ₹5k</span>
                  </button>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-extrabold text-white tracking-tight">
                    ₹{wallet ? Number(wallet.balance_inr).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '...'}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    of ₹{wallet ? Number(wallet.monthly_allowance_inr).toLocaleString('en-IN') : '15,000'} monthly
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-500"
                    style={{ width: `${wallet?.percent_spent || 15}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>Spent this cycle: ₹{wallet ? wallet.monthly_spent_inr : '0.00'}</span>
                  <span>{wallet?.percent_spent || 0}% used</span>
                </div>
              </div>

              {/* Auto-Debit Cap Slider (Core Feature) */}
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800/80 p-4 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Auto-Debit Cap without MPIN</span>
                  </div>
                  <span className="text-xs font-extrabold text-indigo-400 font-mono bg-indigo-950/60 px-2 py-0.5 rounded-lg border border-indigo-800/50">
                    ₹{capValue.toLocaleString('en-IN')}
                  </span>
                </div>

                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={capValue}
                  onChange={(e) => handleCapChange(Number(e.target.value))}
                  className="w-full accent-indigo-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
                />

                <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
                  <span>Min: ₹500</span>
                  <span>Default: ₹2,000</span>
                  <span>Max: ₹5,000</span>
                </div>

                <p className="text-[10px] text-zinc-400 leading-tight pt-1">
                  ⚡ Purchases <span className="text-zinc-300 font-medium">under ₹{capValue.toLocaleString('en-IN')}</span> clear autonomously with 0 clicks. Orders exceeding this limit escalate to <span className="text-amber-400 font-medium">Razorpay 2FA</span>.
                </p>
              </div>

              {/* In-Phone Live Notification Banner */}
              {notification && (
                <div
                  className={`rounded-2xl p-3 border animate-in fade-in slide-in-from-top-2 duration-300 ${
                    notification.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {notification.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-bold">{notification.title}</p>
                      <p className="text-[11px] opacity-90 mt-0.5 leading-snug">{notification.message}</p>
                      {notification.orderId && (
                        <p className="text-[9px] font-mono text-zinc-400 mt-1">Order Ref: {notification.orderId}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive Simulation Trigger Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                  Test Agent Purchases Live
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSimulatePurchase('ErgoLift Laptop Stand', 899)}
                    disabled={simulating !== null}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/30 text-left flex flex-col gap-1 transition-all active:scale-[0.98] group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-wider">
                        Fast-Path
                      </span>
                      <Zap className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-xs font-bold text-white">Laptop Stand</p>
                    <p className="text-[11px] font-mono text-zinc-300">₹899.00</p>
                    <span className="text-[9px] text-zinc-400">⚡ Auto-clears</span>
                  </button>

                  <button
                    onClick={() => handleSimulatePurchase('AeroBeam 4K Projector', 12999)}
                    disabled={simulating !== null}
                    className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-500/30 text-left flex flex-col gap-1 transition-all active:scale-[0.98] group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-semibold text-amber-400 uppercase tracking-wider">
                        Step-Up 2FA
                      </span>
                      <Shield className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <p className="text-xs font-bold text-white">4K Projector</p>
                    <p className="text-[11px] font-mono text-zinc-300">₹12,999.00</p>
                    <span className="text-[9px] text-zinc-400">🛡️ Hits ₹2k cap</span>
                  </button>
                </div>
              </div>

              {/* Recent Ledger Debits */}
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
                  Recent Mandate Debits
                </span>
                <div className="flex flex-col gap-1.5">
                  {ledger.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-3">No transactions yet.</p>
                  ) : (
                    ledger.slice(0, 5).map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-xl bg-zinc-900/60 border border-zinc-800/60 p-2.5 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${
                              entry.is_debit
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {entry.is_debit ? '↓' : '↑'}
                          </div>
                          <div>
                            <p className="text-[11px] font-medium text-white truncate max-w-[170px]">
                              {entry.description}
                            </p>
                            <p className="text-[9px] text-zinc-400">
                              {new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs font-bold font-mono ${
                              entry.is_debit ? 'text-zinc-200' : 'text-emerald-400'
                            }`}
                          >
                            {entry.is_debit ? `-₹${entry.amount_inr}` : `+₹${entry.amount_inr}`}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Phone Home Bar Indicator */}
            <div className="h-4 bg-zinc-950 flex items-center justify-center pb-2">
              <div className="w-32 h-1 bg-zinc-700 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Side: Architectural Explainability Guide for Judges */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <div className="rounded-3xl bg-zinc-900/50 border border-zinc-800 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">How This Screen Solves Hackathon Track 1</h2>
                <p className="text-xs text-zinc-400">NPCI UPI Circle & AP2 Delegated Agent Mandate Architecture</p>
              </div>
            </div>

            <div className="text-xs text-zinc-300 space-y-3 leading-relaxed border-t border-zinc-800/80 pt-4">
              <p>
                In standard e-commerce, customers type OTPs for every single transaction. But for{' '}
                <strong className="text-white">autonomous AI agents (Claude / ChatGPT)</strong>, requiring human MPIN
                clicks on every ₹500 item destroys the agentic user experience.
              </p>
              <p>
                This simulator demonstrates India&apos;s official{' '}
                <strong className="text-blue-400">NPCI UPI Circle</strong> framework:
              </p>
              <ul className="space-y-2 list-disc list-inside text-zinc-400 pl-1">
                <li>
                  <strong className="text-zinc-200">The Human Customer (Soham Pawar)</strong> sets up a delegated mandate
                  once from their banking app.
                </li>
                <li>
                  <strong className="text-zinc-200">The Bounded Auto-Cap (₹2,000)</strong> guarantees that small, everyday
                  items clear automatically with zero human friction.
                </li>
                <li>
                  <strong className="text-zinc-200">The Razorpay Escalation Shield</strong> guarantees that high-value orders
                  (like the ₹12,999 4K Projector) can never be auto-drained by an AI hallucination.
                </li>
              </ul>
            </div>

            {/* Split Screen Instructions */}
            <div className="rounded-2xl bg-blue-950/30 border border-blue-500/30 p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-blue-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold">Try the Split-Screen Hackathon Demo</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-snug">
                1. Keep this <strong>Customer Phone</strong> open at <strong className="text-blue-400">http://localhost:3002</strong> on the left.
                <br />
                2. Open <strong className="text-white">http://localhost:3000</strong> (Merchant Dashboard) on the right.
                <br />
                3. Click <strong>&quot;Test Laptop Stand (₹899)&quot;</strong> on the phone. Watch the phone deduct the
                balance, and watch the Merchant Dashboard immediately ring up a verified sale with zero margin loss!
              </p>
            </div>
          </div>

          {/* Technical Compliance Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">RBI 2FA Compliant</p>
                <p className="text-[10px] text-zinc-400">Step-Up MPIN on &gt; ₹2k</p>
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">ACID Double-Entry</p>
                <p className="text-[10px] text-zinc-400">PostgreSQL row-locked</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
