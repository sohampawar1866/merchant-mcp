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
  Sparkles,
  ExternalLink,
  PlusCircle,
  Wifi,
  Battery,
  Bot,
  Store,
  QrCode,
  Bell,
  ArrowDownLeft,
  ChevronRight,
  ShieldCheck,
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
  const [capValue, setCapValue] = useState<number>(2500);
  const [updatingCap, setUpdatingCap] = useState(false);
  const [refilling, setRefilling] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'alert';
    title: string;
    message: string;
    orderId?: string;
    redirectUrl?: string;
    actionLabel?: string;
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
    // Live polling every 3.5s so purchases made in Claude reflect immediately
    const timer = setInterval(() => {
      fetchWallet();
    }, 3500);
    return () => clearInterval(timer);
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
      await fetchWallet();
    } catch (err) {
      console.error('Failed to update cap:', err);
    } finally {
      setUpdatingCap(false);
    }
  };

  const handleRefill = async () => {
    setRefilling(true);
    try {
      const res = await fetch('/api/wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'refill',
          amount_paise: 500000, // ₹5,000
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({
          type: 'success',
          title: 'Allowance Added',
          message: 'Transferred ₹5,000.00 from SBI primary account to Claude allowance.',
        });
        await fetchWallet();
      }
    } catch (err) {
      console.error('Failed to refill:', err);
    } finally {
      setRefilling(false);
    }
  };

  // Helper to extract clean merchant initial or icon
  const getMerchantInitial = (desc: string) => {
    if (desc.includes('boAt')) return 'B';
    if (desc.includes('Portronics')) return 'P';
    if (desc.includes('Noise')) return 'N';
    if (desc.includes('Blue Tokai')) return 'BT';
    if (desc.includes('Whole Truth')) return 'WT';
    if (desc.includes('Chaayos')) return 'C';
    if (desc.includes('Haldiram')) return 'H';
    if (desc.includes('Top-Up') || desc.includes('Replenishment')) return '₹';
    return 'M';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#202124] flex flex-col items-center justify-start p-4 sm:p-8 font-sans">
      {/* Top Bar: Cross-Portal Navigation & Simulator Info */}
      <header className="w-full max-w-5xl flex items-center justify-between pb-6 mb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-blue-600 font-bold text-lg">
            <Smartphone className="w-5 h-5 text-[#1A73E8]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-[#202124]">
                Customer UPI Circle Simulator
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium">
                Google Pay Theme
              </span>
            </div>
            <p className="text-xs text-[#5F6368]">
              NPCI UPI Circle & AP2 Delegated Agent Mandate Rail
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-gray-50 border border-gray-300 text-xs font-medium text-[#3C4043] shadow-sm transition-all"
          >
            <Store className="w-3.5 h-3.5 text-[#1A73E8]" />
            <span className="hidden sm:inline">Merchant Dashboard (:3000)</span>
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>

          <button
            onClick={fetchWallet}
            className="p-2 rounded-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-600 hover:text-gray-900 shadow-sm transition-all"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Split Demo Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Google Pay Smartphone Mockup Frame */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-[390px] rounded-[46px] bg-white border-[8px] border-slate-200/90 shadow-2xl shadow-slate-200 overflow-hidden relative flex flex-col">
            {/* Phone Screen Status Bar */}
            <div className="pt-3 px-6 bg-white flex items-center justify-between text-[11px] text-[#202124]">
              <span className="font-semibold tracking-tight">9:41</span>
              <div className="w-20 h-4 bg-slate-100 rounded-full mx-auto" />
              <div className="flex items-center gap-1.5 text-gray-600">
                <Wifi className="w-3.5 h-3.5" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* In-Phone App Content (Google Pay Light Theme) */}
            <div className="bg-[#F8F9FA] px-4 pt-3 pb-6 flex-1 flex flex-col gap-3.5 overflow-y-auto max-h-[720px]">
              {/* Google Pay Brand Header */}
              <div className="flex items-center justify-between px-1 pt-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15Z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.93 6.72-4.93Z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[#202124] leading-tight flex items-center gap-1.5">
                      <span>Google Pay</span>
                      <span className="text-[10px] text-gray-400 font-normal">|</span>
                      <span className="text-xs text-[#1A73E8] font-medium">UPI Circle</span>
                    </h2>
                    <p className="text-[11px] text-[#5F6368]">Delegated Agent Spend Rail</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-medium text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    SBI Active
                  </span>
                  <div className="w-7 h-7 rounded-full bg-[#1A73E8] text-white flex items-center justify-center text-xs font-semibold shadow-sm shrink-0">
                    SP
                  </div>
                </div>
              </div>

              {/* Primary User Bank Account Pill */}
              <div className="rounded-2xl bg-white border border-gray-200/90 p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#202124]">Soham Pawar</p>
                    <p className="text-[11px] text-[#5F6368]">State Bank of India •••• 4092</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#5F6368] bg-gray-50 px-2 py-0.5 rounded-md border border-gray-200">
                  soham@oksbi
                </span>
              </div>

              {/* Delegated Agent Card (Claude AI) */}
              <div className="rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 p-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-blue-200 flex items-center justify-center text-[#1A73E8] shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold text-[#202124]">Claude AI Assistant</p>
                    </div>
                    <p className="text-[10px] text-[#5F6368] font-mono">claude-buyer-01</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-semibold text-[#1A73E8] border border-blue-200 shadow-xs">
                  Secondary Spender
                </span>
              </div>

              {/* Monthly Allowance & Available Balance Card */}
              <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-[#5F6368]">
                    Available Limit This Month
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                </div>

                <div className="mb-3">
                  <div className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight">
                    ₹{wallet ? Number(wallet.balance_inr).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '...'}
                  </div>
                  <p className="text-xs text-[#5F6368] mt-0.5">
                    of ₹{wallet ? Number(wallet.monthly_allowance_inr).toLocaleString('en-IN') : '5,000'} monthly allowance
                  </p>
                </div>

                {/* Google Material Progress Bar */}
                <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden mb-2">
                  <div
                    className="h-full bg-[#1A73E8] rounded-full transition-all duration-500"
                    style={{ width: `${wallet?.percent_spent || 51}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-[#5F6368] mb-3">
                  <span>Spent: ₹{wallet ? wallet.monthly_spent_inr : '2,574.10'}</span>
                  <span className="font-medium text-[#202124]">{wallet?.percent_spent || 51}% used</span>
                </div>

                {/* Dedicated Action Button */}
                <button
                  onClick={handleRefill}
                  disabled={refilling}
                  className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-xs font-semibold text-[#1A73E8] hover:text-[#1557B0] flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-[0.99]"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>{refilling ? 'Adding...' : '+ Top-up ₹5,000 Allowance'}</span>
                </button>
              </div>

              {/* Auto-Debit Cap Slider (Guardrail Setting) */}
              <div className="rounded-2xl bg-white border border-gray-200 p-4 flex flex-col gap-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1A73E8]" />
                    <span className="text-xs font-semibold text-[#202124]">
                      Auto-Pay Limit per Payment
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#1A73E8] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg font-mono">
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
                  className="w-full accent-[#1A73E8] h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                />

                {/* Preset quick pills */}
                <div className="flex items-center justify-between gap-1.5 pt-0.5">
                  {[1000, 2000, 2500, 5000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleCapChange(preset)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        capValue === preset
                          ? 'bg-blue-50 text-[#1A73E8] border border-blue-300 font-bold'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      ₹{preset.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-[#5F6368] leading-tight pt-1">
                  Orders <strong className="text-[#202124]">under ₹{capValue.toLocaleString('en-IN')}</strong> clear automatically without asking for your UPI PIN. Larger orders require your approval.
                </p>
              </div>

              {/* In-Phone Live Notification Banner */}
              {notification && (
                <div
                  className={`rounded-2xl p-3 border animate-in fade-in slide-in-from-top-2 duration-300 ${
                    notification.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {notification.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="text-xs font-semibold">{notification.title}</p>
                      <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">{notification.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Clean Google Pay Transaction History */}
              <div className="flex flex-col gap-2 pt-1">
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-xs font-semibold text-[#202124]">
                    Recent Claude Activity
                  </span>
                  <span className="text-[11px] text-[#5F6368]">
                    {ledger.length} transactions
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {ledger.length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white border border-gray-200 text-center">
                      <p className="text-xs text-[#5F6368]">No transactions yet.</p>
                    </div>
                  ) : (
                    ledger.slice(0, 5).map((entry) => {
                      const initial = getMerchantInitial(entry.description);
                      const isTopUp = !entry.is_debit;

                      return (
                        <div
                          key={entry.id}
                          className="rounded-2xl bg-white border border-gray-200/90 p-3 flex items-center justify-between shadow-xs hover:border-gray-300 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                isTopUp
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-blue-50 text-[#1A73E8] border border-blue-200'
                              }`}
                            >
                              {initial}
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-xs font-semibold text-[#202124] truncate max-w-[170px]">
                                {entry.description}
                              </p>
                              <p className="text-[11px] text-[#5F6368]">
                                {new Date(entry.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                                {' • '}
                                {isTopUp ? 'Replenished' : 'Auto-paid via UPI Circle'}
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-xs font-bold font-mono ${
                                isTopUp ? 'text-emerald-700' : 'text-[#202124]'
                              }`}
                            >
                              {isTopUp ? `+₹${entry.amount_inr}` : `-₹${entry.amount_inr}`}
                            </span>
                            <p className="text-[10px] text-emerald-600 font-medium">Completed</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Phone Home Bar Indicator */}
            <div className="h-5 bg-[#F8F9FA] flex items-center justify-center pb-2">
              <div className="w-32 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Side: Architectural Explainability Guide for Judges */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          <div className="rounded-3xl bg-white border border-gray-200 p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1A73E8]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#202124]">
                  How UPI Circle Solves Autonomous Payments
                </h2>
                <p className="text-xs text-[#5F6368]">
                  NPCI UPI Circle & AP2 Delegated Agent Mandate Architecture
                </p>
              </div>
            </div>

            <div className="text-xs text-[#3C4043] space-y-3 leading-relaxed border-t border-gray-100 pt-4">
              <p>
                In traditional e-commerce, every single payment requires typing a UPI PIN or entering an SMS OTP. But for an{' '}
                <strong className="text-[#202124]">autonomous AI buyer (Claude / ChatGPT)</strong>, asking for your PIN on a ₹200 snack or ₹899 accessory destroys the entire autonomous experience.
              </p>
              <p>
                This simulator mirrors India&apos;s official{' '}
                <strong className="text-[#1A73E8]">NPCI UPI Circle</strong> framework:
              </p>
              <ul className="space-y-2 list-disc list-inside text-[#5F6368] pl-1">
                <li>
                  <strong className="text-[#202124]">The Human Customer (Soham Pawar)</strong> delegates a secondary spend mandate to Claude once from their banking app.
                </li>
                <li>
                  <strong className="text-[#202124]">The Auto-Debit Cap (₹2,500)</strong> allows Claude to clear small, everyday orders autonomously with 0 clicks.
                </li>
                <li>
                  <strong className="text-[#202124]">The Razorpay Escalation Shield</strong> guarantees that high-value orders (e.g. ₹12,999) can never be auto-drained by an AI hallucination without your approval.
                </li>
              </ul>
            </div>

            {/* How to Test Live */}
            <div className="rounded-2xl bg-blue-50/70 border border-blue-200 p-4 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[#1A73E8]">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold">Try the Live Autonomous Purchase in Claude</span>
              </div>
              <p className="text-xs text-[#3C4043] leading-relaxed">
                1. Ask Claude in your chat: <em className="text-[#1A73E8] font-medium">&quot;Find wireless earbuds under ₹2,000&quot;</em>.
                <br />
                2. Tell Claude: <em className="text-[#1A73E8] font-medium">&quot;Add to cart and buy it&quot;</em>.
                <br />
                3. Claude calls <code className="text-xs bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono">checkout_cart</code> with the autonomous wallet.
                <br />
                4. Watch this screen auto-refresh live, deduct the balance, and log the transaction instantly!
              </p>
            </div>
          </div>

          {/* Technical Compliance Badges */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#202124]">RBI 2FA Compliant</p>
                <p className="text-[11px] text-[#5F6368]">Step-Up PIN on &gt; ₹2,500</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#1A73E8]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#202124]">ACID Double-Entry</p>
                <p className="text-[11px] text-[#5F6368]">PostgreSQL row-locked</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
