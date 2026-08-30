'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, ExternalLink, RefreshCw, CheckCircle2, Clock, XCircle, ShoppingBag } from 'lucide-react';

export function TransactionsTab() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/transactions');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load orders from database');
      }
      setTransactions(data.transactions || []);
    } catch (e: any) {
      console.error('Failed to load transactions:', e);
      setErrorMessage(e.message || 'Database query error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cal-emerald/10 text-cal-emerald border border-cal-emerald/20">
            <CheckCircle2 className="w-4 h-4" /> Paid & Settled
          </span>
        );
      case 'created':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cal-accent/10 text-cal-accent border border-cal-accent/20">
            <Clock className="w-4 h-4" /> Awaiting Payment
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cal-error/10 text-cal-error border border-cal-error/20">
            <XCircle className="w-4 h-4" /> {status ? status.toUpperCase() : 'INCOMPLETE'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Figma Signature Story Block: Mint Ground for Ledger & Orders */}
      <div className="p-6 sm:p-8 rounded-lg bg-figma-mint text-figma-ink border border-black/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black text-white text-[11px] font-mono tracking-wider uppercase mb-2">
              <CreditCard className="w-3.5 h-3.5" /> REVENUE & SETTLEMENT LEDGER
            </div>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold tracking-tight text-figma-ink">
              Customer Orders & Payment Records
            </h2>
            <p className="text-xs sm:text-sm text-figma-ink/80 mt-1 max-w-2xl font-medium">
              Real-time records of AI-assisted checkouts, settlement status, and customer payment links.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-xs font-mono font-bold tracking-wider uppercase bg-white/80 border border-black/10 px-3.5 py-1.5 rounded-full text-figma-ink">
              {transactions.length} Total Orders
            </span>
            <button
              onClick={fetchTransactions}
              className="w-11 h-11 bg-white hover:bg-figma-surfaceSoft border border-black/15 text-figma-ink rounded-full flex items-center justify-center transition shrink-0 shadow-xs"
              title="Refresh orders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Quick Ledger Metrics */}
        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs text-figma-ink">
          <span className="px-3.5 py-1.5 rounded-full bg-white/80 border border-black/10 font-bold uppercase">
            INSTANT RAZORPAY SETTLEMENT
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white/80 border border-black/10 font-bold uppercase">
            HMAC-VERIFIED WEBHOOKS
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white/80 border border-black/10 font-bold uppercase">
            IDEMPOTENT CHARGE LOCK
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-lg bg-figma-pink border border-black/10 text-figma-ink text-xs sm:text-sm flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold">NOTICE:</span> {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage('')}
            className="hover:opacity-70 font-bold text-sm px-1.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Orders Table & Mobile Cards */}
      <div className="rounded-lg bg-figma-canvas border border-figma-hairline overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-zinc-500 text-xs sm:text-sm font-mono">
            LOADING CUSTOMER ORDERS...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 text-xs sm:text-sm">
            No customer orders placed yet. As AI shoppers purchase, orders will show up here.
          </div>
        ) : (
          <>
            {/* Mobile Card Layout (< 640px) */}
            <div className="sm:hidden divide-y divide-figma-hairlineSoft">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 space-y-2.5 hover:bg-figma-surfaceSoft/60 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-bold text-figma-ink">
                        {tx.product_name || 'Product'}
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5 font-mono">
                        Ref: {tx.razorpay_order_id || tx.id.slice(0, 8)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-figma-ink">
                        ₹{tx.formatted_price}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono tracking-wider uppercase font-semibold ${
                        tx.status === 'paid'
                          ? 'bg-figma-mint text-figma-ink border border-black/10'
                          : 'bg-figma-lilac text-figma-ink border border-black/10'
                      }`}>
                        {tx.status === 'paid' ? 'PAID & SETTLED' : 'PENDING'}
                      </span>
                      <span className="text-[11px] text-zinc-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {tx.payment_link ? (
                      <a
                        href={tx.payment_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-figma-ink hover:underline flex items-center gap-1 font-mono uppercase"
                      >
                        Checkout ↗
                      </a>
                    ) : (
                      <span className="text-xs text-zinc-400">—</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop & Tablet Table (>= 640px) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm text-figma-ink">
                <thead className="bg-figma-surfaceSoft text-zinc-500 uppercase font-mono text-[11px] tracking-wider border-b border-figma-hairline">
                  <tr>
                    <th className="p-4">Product Details</th>
                    <th className="p-4">Settled Price</th>
                    <th className="p-4">Payment & Settlement</th>
                    <th className="p-4">Order Reference</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-figma-hairlineSoft">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-figma-surfaceSoft/60 transition">
                      <td className="p-4 font-bold text-figma-ink max-w-xs text-xs sm:text-sm">
                        {tx.product_name || 'Product'}
                        <span className="block text-[11px] text-zinc-500 font-mono mt-0.5 font-normal">
                          ID: {tx.product_id ? tx.product_id.slice(0, 8) : 'N/A'}
                        </span>
                      </td>
                      <td className="p-4 font-extrabold text-figma-ink text-sm sm:text-base">
                        ₹{tx.formatted_price}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono tracking-wider uppercase font-semibold inline-block ${
                          tx.status === 'paid'
                            ? 'bg-figma-mint text-figma-ink border border-black/10'
                            : 'bg-figma-lilac text-figma-ink border border-black/10'
                        }`}>
                          {tx.status === 'paid' ? 'PAID & SETTLED' : 'AWAITING PAYMENT'}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs text-zinc-700">
                        {tx.razorpay_order_id ? (
                          <span className="text-figma-ink font-bold">{tx.razorpay_order_id}</span>
                        ) : (
                          <span>{tx.id.slice(0, 8)}</span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-zinc-600 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{new Date(tx.created_at).toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {tx.payment_link ? (
                          <a
                            href={tx.payment_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-figma-primary hover:opacity-90 text-figma-onPrimary font-medium text-xs transition"
                          >
                            Open Link <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
